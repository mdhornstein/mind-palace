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

  // In-world visual trigger timestamps (queried by station canvas renderers)
  private lastPressVisualTrigger = 0;
  private lastStoneVisualTrigger = 0;
  private currentArpNoteIndex = 0;
  private visualNoteIndex = 0;

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

  public isStationLooping(stationId: string): boolean {
    if (stationId === 'mint_coin_press' || stationId === 'vault_coin_press') {
      return this.pressCadence !== 'off';
    }
    if (stationId === 'mint_ringing_stone') {
      return this.stoneCadence !== 'off';
    }
    return false;
  }

  private checkAutoTransport(): void {
    const hasActiveLoops = this.pressCadence !== 'off' || this.stoneCadence !== 'off';
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
    if (this.running) return;

    this.running = true;
    this.currentStep = 0;
    this.currentArpNoteIndex = 0;

    const audio = HearthAudio.getInstance();
    audio.setMintBusActive(true);
    const ctx = audio.getContext();
    if (ctx) {
      this.nextStepTime = ctx.currentTime + 0.05;
      this.scheduleLoop();
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
    // Mute bus when stopped so lookahead audio tail doesn't linger
    HearthAudio.getInstance().setMintBusActive(false);
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
  }

  // ==================== VISUAL / GAME LOOP TIMING ====================

  /**
   * Called on each frame update from the room to drive visual step progress.
   * Completely decoupled from audio callback scheduling.
   */
  public update(_dt: number): void {
    if (!this.running || !this.inActiveRoom) return;

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
  }

  public getLastPressVisualTrigger(): number {
    return this.lastPressVisualTrigger;
  }

  public getLastStoneVisualTrigger(): number {
    return this.lastStoneVisualTrigger;
  }

  public getVisualNoteIndex(): number {
    return this.visualNoteIndex;
  }

  /**
   * Returns current 0..1 beat phase for smooth visual interpolation.
   */
  public getBeatPhase(timeMs: number): number {
    const beatDurationMs = (60.0 / this.bpm) * 1000;
    return (timeMs % beatDurationMs) / beatDurationMs;
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
      } else {
        HearthAudio.getInstance().setMintBusActive(false);
      }
    } else {
      HearthAudio.getInstance().setMintBusActive(true);
      const hasActiveLoops = this.pressCadence !== 'off' || this.stoneCadence !== 'off';
      if (hasActiveLoops && !this.running) {
        this.start();
      }
    }
  }
}
