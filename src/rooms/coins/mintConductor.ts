import { HearthAudio } from '../../sound/audio';

/**
 * Mint Conductor: Precision Master Clock & Rhythm Engine
 *
 * Implements a Web Audio lookahead scheduler (Chris Wilson "A Tale of Two Clocks" pattern)
 * coordinating rhythmic, synchronized loops across Royal Mint machinery.
 *
 * Audio scheduling occurs ahead-of-time on the hardware audio clock.
 * Visual rendering queries decoupled beat/phase state via game loop timeMs.
 *
 * Zero UI imports to respect strict architectural domain boundaries.
 */

export type PressCadence = 'off' | 'four_on_the_floor';
export type StoneCadence =
  | 'off'
  | 'quarter_chime'
  | 'offbeat'
  | 'root_drone'
  | 'pentatonic_arp';
export type PlinkoCadence = 'off' | 'sixteenth_shaker' | 'offbeat_pings';
export type TallyCadence = 'off' | 'backbeat_snare' | 'cascade_fill' | 'syncopated_groove';

export class MintConductor {
  private static instance: MintConductor | null = null;

  // Master tempo: 105 BPM (quarter note = 0.5714s, 16th note = 0.1428s)
  private bpm = 105;
  private running = false;
  private inActiveRoom = false;

  // Web Audio lookahead scheduling state
  private lookaheadTimer: ReturnType<typeof setInterval> | null = null;
  private nextStepTime = 0;
  private currentStep = 0; // 0 to 15 (16th-note steps within a 4/4 measure)
  private scheduleAheadSec = 0.100; // 100ms lookahead window
  private lookaheadIntervalMs = 25; // JS timer resolution

  // Station automation cadences (persisted across room departures)
  private pressCadence: PressCadence = 'off';
  private stoneCadence: StoneCadence = 'off';
  private plinkoCadence: PlinkoCadence = 'off';
  private tallyCadence: TallyCadence = 'off';

  // In-world visual trigger timestamps & transport-relative phase origin
  private visualOriginMs = 0;
  private lastPressVisualTrigger = 0;
  private lastStoneVisualTrigger = 0;
  private lastPlinkoVisualTrigger = 0;
  private lastTallyVisualTrigger = 0;
  private currentArpNoteIndex = 0;
  private visualNoteIndex = 0;
  private visualPlinkoStep = 0;
  private visualTallyStep = 0;

  private constructor() {
    const audio = HearthAudio.getInstance();
    // Synchronize initial room state
    const current = audio.getRoom();
    this.inActiveRoom = current === 'coins';

    // Listen for subsequent room changes to pause/resume audio scheduling
    audio.onRoomChange((room) => {
      this.handleRoomChange(room);
    });
  }

  public static getInstance(): MintConductor {
    if (!MintConductor.instance) {
      MintConductor.instance = new MintConductor();
    }
    return MintConductor.instance;
  }

  /**
   * Resets conductor singleton instance (useful for unit tests).
   */
  public static resetInstance(): void {
    if (MintConductor.instance) {
      MintConductor.instance.stop();
      MintConductor.instance = null;
    }
  }

  // ==================== CADENCE CONFIGURATION ====================

  public getPressCadence(): PressCadence {
    return this.pressCadence;
  }

  public setPressCadence(cadence: PressCadence): void {
    this.pressCadence = cadence;
    this.checkAutoTransport();
  }

  public getStoneCadence(): StoneCadence {
    return this.stoneCadence;
  }

  public setStoneCadence(cadence: StoneCadence): void {
    this.stoneCadence = cadence;
    this.checkAutoTransport();
  }

  public getPlinkoCadence(): PlinkoCadence {
    return this.plinkoCadence;
  }

  public setPlinkoCadence(cadence: PlinkoCadence): void {
    this.plinkoCadence = cadence;
    this.checkAutoTransport();
  }

  public getTallyCadence(): TallyCadence {
    return this.tallyCadence;
  }

  public setTallyCadence(cadence: TallyCadence): void {
    this.tallyCadence = cadence;
    this.checkAutoTransport();
  }

  public isStationLooping(stationId: string): boolean {
    if (stationId === 'mint_coin_press' || stationId === 'vault_coin_press') {
      return this.pressCadence !== 'off';
    }
    if (stationId === 'mint_ringing_stone') {
      return this.stoneCadence !== 'off';
    }
    if (stationId === 'plinko_drop' || stationId === 'mint_plinko' || stationId === 'gilded_chute') {
      return this.plinkoCadence !== 'off';
    }
    if (stationId === 'mint_tally_board' || stationId === 'tally_board') {
      return this.tallyCadence !== 'off';
    }
    return false;
  }

  private checkAutoTransport(): void {
    const hasActiveLoops =
      this.pressCadence !== 'off' ||
      this.stoneCadence !== 'off' ||
      this.plinkoCadence !== 'off' ||
      this.tallyCadence !== 'off';
    if (hasActiveLoops && !this.running && this.inActiveRoom) {
      this.start();
    } else if (!hasActiveLoops && this.running) {
      this.stop();
    }
  }

  // ==================== MASTER TRANSPORT & SCHEDULER ====================

  public isRunning(): boolean {
    return this.running;
  }

  public getBpm(): number {
    return this.bpm;
  }

  public setBpm(newBpm: number): void {
    this.bpm = Math.max(60, Math.min(180, newBpm));
  }

  public start(): void {
    if (this.running && this.lookaheadTimer !== null) return;

    this.running = true;
    this.currentStep = 0;
    this.currentArpNoteIndex = 0;

    const audio = HearthAudio.getInstance();
    audio.setMintBusActive(true);
    const ctx = audio.getContext();
    if (ctx) {
      this.nextStepTime = ctx.currentTime + 0.05;
      const nowPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this.visualOriginMs = nowPerf + 50;
      this.scheduleLoop();
    } else {
      const nowPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this.visualOriginMs = nowPerf;
    }
  }

  public stop(): void {
    this.running = false;
    if (this.lookaheadTimer !== null) {
      clearInterval(this.lookaheadTimer);
      this.lookaheadTimer = null;
    }
    if ((globalThis as any).__MINT_CONDUCTOR_TIMER__) {
      clearInterval((globalThis as any).__MINT_CONDUCTOR_TIMER__);
      (globalThis as any).__MINT_CONDUCTOR_TIMER__ = null;
    }
  }

  private scheduleLoop(): void {
    if (this.lookaheadTimer !== null) {
      clearInterval(this.lookaheadTimer);
    }
    if ((globalThis as any).__MINT_CONDUCTOR_TIMER__) {
      clearInterval((globalThis as any).__MINT_CONDUCTOR_TIMER__);
    }

    const timer = setInterval(() => {
      if (!this.running || !this.inActiveRoom) return;

      const audio = HearthAudio.getInstance();
      const ctx = audio.getContext();
      if (!ctx) return;

      const secondsPer16th = 60.0 / this.bpm / 4.0;

      // Lookahead: schedule any steps that fall within the scheduling window
      while (this.nextStepTime < ctx.currentTime + this.scheduleAheadSec) {
        this.scheduleStep(this.currentStep, this.nextStepTime);
        this.nextStepTime += secondsPer16th;
        this.currentStep = (this.currentStep + 1) % 16;
      }
    }, this.lookaheadIntervalMs);

    this.lookaheadTimer = timer;
    (globalThis as any).__MINT_CONDUCTOR_TIMER__ = timer;
  }

  /**
   * Schedules Web Audio events precisely on the audio hardware timeline.
   */
  private scheduleStep(step: number, scheduledTime: number): void {
    const audio = HearthAudio.getInstance();

    // 1. Steam Coin Press (Four-on-the-Floor: Beats 1, 2, 3, 4 -> Steps 0, 4, 8, 12)
    if (this.pressCadence === 'four_on_the_floor' && step % 4 === 0) {
      audio.playScheduledPressKick(scheduledTime);
    }

    // 2. Ringing Stone Musical Cadences
    if (this.stoneCadence === 'quarter_chime' && step % 4 === 0) {
      // Quarter note relaxed bell sequence on beats 1, 2, 3, 4 (571ms intervals)
      // Notes: C6, E6, G6, A6 (warm, harmonious pentatonic movement)
      const melodicNotes = [0, 2, 3, 4];
      const noteIdx = melodicNotes[this.currentArpNoteIndex % melodicNotes.length];
      audio.playRingingStoneChime(noteIdx, scheduledTime, 'quarter');
      this.currentArpNoteIndex++;
    } else if (this.stoneCadence === 'offbeat' && step % 4 === 2) {
      // Syncopated upbeats on steps 2, 6, 10, 14 (locks in groove with 4-on-floor kicks)
      const offbeatNotes = [3, 4];
      const noteIdx = offbeatNotes[this.currentArpNoteIndex % offbeatNotes.length];
      audio.playRingingStoneChime(noteIdx, scheduledTime, 'offbeat');
      this.currentArpNoteIndex++;
    } else if (this.stoneCadence === 'root_drone' && step === 0) {
      // Whole-note downbeat once per measure (2.28s intervals) - deep sovereign gong
      audio.playRingingStoneChime(0, scheduledTime, 'drone');
    } else if (this.stoneCadence === 'pentatonic_arp' && step % 2 === 0) {
      // 8th-notes on steps 0, 2, 4, 6, 8, 10, 12, 14 - crisp music box
      const noteIdx = this.currentArpNoteIndex;
      audio.playRingingStoneChime(noteIdx, scheduledTime, 'arp');
      this.currentArpNoteIndex = (this.currentArpNoteIndex + 1) % 7;
    }

    // 3. The Gilded Chute (Galton Pegboard - 16th-Note Shaker & Hi-Hat Groove)
    if (this.plinkoCadence === 'sixteenth_shaker') {
      // 16th-note continuous shaker stream:
      // Steps 2, 6, 10, 14: crisp offbeat accents (locks with kick & stone)
      // Other steps: subtle metallic ghost taps
      const isAccent = step % 4 === 2;
      audio.playScheduledPlinkoHit(scheduledTime, isAccent ? 'accent' : 'shaker');
    } else if (this.plinkoCadence === 'offbeat_pings') {
      // Syncopated binomial pings on offbeats (steps 2, 6, 10, 14)
      if (step % 4 === 2) {
        audio.playScheduledPlinkoHit(scheduledTime, 'accent');
      }
    }

    // 4. The Moneyer's Tally Board (Acoustic Snare & Granular Fill)
    if (this.tallyCadence === 'backbeat_snare') {
      // Classic 4/4 Snare: Beats 2 & 4 (Steps 4 & 12)
      if (step === 4 || step === 12) {
        audio.playScheduledTallyClack(scheduledTime, 'backbeat');
      }
    } else if (this.tallyCadence === 'cascade_fill') {
      // Backbeat on Beat 2 (Step 4), granular cascade roll on steps 13, 14, 15
      if (step === 4) {
        audio.playScheduledTallyClack(scheduledTime, 'backbeat');
      } else if (step === 13 || step === 14 || step === 15) {
        audio.playScheduledTallyClack(scheduledTime, 'fill');
      }
    } else if (this.tallyCadence === 'syncopated_groove') {
      // Snare on Step 4, syncopated slap on Step 10, ghost tap on Step 14
      if (step === 4 || step === 10) {
        audio.playScheduledTallyClack(scheduledTime, 'backbeat');
      } else if (step === 14) {
        audio.playScheduledTallyClack(scheduledTime, 'ghost');
      }
    }
  }

  // ==================== VISUAL / GAME LOOP TIMING ====================

  /**
   * Called on each frame update from the room to drive visual step progress.
   * Completely decoupled from audio callback scheduling.
   */
  public update(_dt: number): void {
    if (!this.running || !this.inActiveRoom) return;

    // Resilient audio init: if audio context was delayed upon start(),
    // pick up audio scheduling loop as soon as context is ready
    if (this.lookaheadTimer === null) {
      const audio = HearthAudio.getInstance();
      const ctx = audio.getContext();
      if (ctx) {
        this.nextStepTime = ctx.currentTime + 0.05;
        const nowPerf = typeof performance !== 'undefined' ? performance.now() : Date.now();
        this.visualOriginMs = nowPerf + 50;
        this.scheduleLoop();
      }
    }

    const now = Date.now();
    const quarterSeconds = 60.0 / this.bpm;
    const eighthSeconds = quarterSeconds / 2.0;
    const barSeconds = quarterSeconds * 4.0;

    // Trigger visual kicks on beat intervals
    if (this.pressCadence === 'four_on_the_floor') {
      if (now - this.lastPressVisualTrigger >= quarterSeconds * 1000 * 0.95) {
        this.lastPressVisualTrigger = now;
      }
    }

    // Trigger visual stone strikes according to active cadence
    if (this.stoneCadence === 'quarter_chime') {
      if (now - this.lastStoneVisualTrigger >= quarterSeconds * 1000 * 0.95) {
        this.lastStoneVisualTrigger = now;
        this.visualNoteIndex = (this.visualNoteIndex + 1) % 4;
      }
    } else if (this.stoneCadence === 'offbeat') {
      if (now - this.lastStoneVisualTrigger >= quarterSeconds * 1000 * 0.95) {
        this.lastStoneVisualTrigger = now;
        this.visualNoteIndex = (this.visualNoteIndex + 1) % 2;
      }
    } else if (this.stoneCadence === 'root_drone') {
      if (now - this.lastStoneVisualTrigger >= barSeconds * 1000 * 0.95) {
        this.lastStoneVisualTrigger = now;
        this.visualNoteIndex = 0;
      }
    } else if (this.stoneCadence === 'pentatonic_arp') {
      if (now - this.lastStoneVisualTrigger >= eighthSeconds * 1000 * 0.95) {
        this.lastStoneVisualTrigger = now;
        this.visualNoteIndex = (this.visualNoteIndex + 1) % 7;
      }
    }

    // Trigger visual plinko steps
    const sixteenthSeconds = quarterSeconds / 4.0;
    if (this.plinkoCadence === 'sixteenth_shaker') {
      if (now - this.lastPlinkoVisualTrigger >= sixteenthSeconds * 1000 * 0.95) {
        this.lastPlinkoVisualTrigger = now;
        this.visualPlinkoStep = (this.visualPlinkoStep + 1) % 16;
      }
    } else if (this.plinkoCadence === 'offbeat_pings') {
      if (now - this.lastPlinkoVisualTrigger >= quarterSeconds * 1000 * 0.95) {
        this.lastPlinkoVisualTrigger = now;
        this.visualPlinkoStep = (this.visualPlinkoStep + 1) % 4;
      }
    }

    // Trigger visual tally strike-bar snaps
    if (this.tallyCadence === 'backbeat_snare') {
      if (now - this.lastTallyVisualTrigger >= (quarterSeconds * 2.0) * 1000 * 0.95) {
        this.lastTallyVisualTrigger = now;
        this.visualTallyStep = (this.visualTallyStep + 1) % 2;
      }
    } else if (this.tallyCadence === 'cascade_fill' || this.tallyCadence === 'syncopated_groove') {
      if (now - this.lastTallyVisualTrigger >= quarterSeconds * 1000 * 0.95) {
        this.lastTallyVisualTrigger = now;
        this.visualTallyStep = (this.visualTallyStep + 1) % 4;
      }
    }
  }

  public getLastPressVisualTrigger(): number {
    return this.lastPressVisualTrigger;
  }

  public getLastStoneVisualTrigger(): number {
    return this.lastStoneVisualTrigger;
  }

  public getLastPlinkoVisualTrigger(): number {
    return this.lastPlinkoVisualTrigger;
  }

  public getLastTallyVisualTrigger(): number {
    return this.lastTallyVisualTrigger;
  }

  public getVisualNoteIndex(): number {
    return this.visualNoteIndex;
  }

  public getVisualPlinkoStep(): number {
    return this.visualPlinkoStep;
  }

  public getVisualTallyStep(): number {
    return this.visualTallyStep;
  }

  /**
   * Returns current 0..1 beat phase for smooth visual interpolation,
   * synchronized precisely to the audio transport origin.
   */
  public getBeatPhase(timeMs: number): number {
    const beatDurationMs = (60.0 / this.bpm) * 1000;
    const elapsedMs = timeMs - this.visualOriginMs;
    const phaseMs = ((elapsedMs % beatDurationMs) + beatDurationMs) % beatDurationMs;
    const phase = phaseMs / beatDurationMs;
    return phase >= 0.9999 ? 0 : phase;
  }

  public getVisualOriginMs(): number {
    return this.visualOriginMs;
  }

  public setVisualOriginMs(originMs: number): void {
    this.visualOriginMs = originMs;
  }

  // ==================== ROOM LIFECYCLE ====================

  public handleRoomChange(room: string): void {
    const isCoins = room === 'coins' || room === 'mint';
    this.setRoomActive(isCoins);
  }

  public setRoomActive(active: boolean): void {
    if (this.inActiveRoom === active) return;
    this.inActiveRoom = active;
    if (!active) {
      if (this.running) {
        this.stop();
      }
      HearthAudio.getInstance().setMintBusActive(false);
    } else {
      HearthAudio.getInstance().setMintBusActive(true);
      const hasActiveLoops =
        this.pressCadence !== 'off' ||
        this.stoneCadence !== 'off' ||
        this.plinkoCadence !== 'off' ||
        this.tallyCadence !== 'off';
      if (hasActiveLoops && !this.running) {
        this.start();
      }
    }
  }
}
