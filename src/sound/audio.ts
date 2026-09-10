/**
 * Procedural Web Audio 8-Bit Soundtrack Engine
 * Generates rich, nostalgic, looping chiptune compositions tailored to each sanctuary room:
 * 
 * 1. THE STUDY ("Hearthside Chiptune"):
 *    - Cozy, warm, reflective lullaby (68 BPM)
 *    - Chord Progression: Cmaj7 -> Am7 -> Fmaj7 -> G6
 *    - Voice 1: Warm pulse lead with 4.5Hz vibrato
 *    - Voice 2: Rounded walking triangle-wave bassline
 *    - Voice 3: Delicate music-box broken chord arpeggios
 *    - Lowpass filter: 1750 Hz (warm console character)
 * 
 * 2. THE OBSERVATORY ("Starlight Chiptune"):
 *    - Ethereal, contemplative, cosmic space theme (50 BPM)
 *    - Chord Progression: Em9 -> Cmaj7#11 -> Dadd9 -> Bm7 (Celestial Lydian/Dorian)
 *    - Voice 1: Mystical high pulse lead with gentle slow attack and 3.8Hz shimmer
 *    - Voice 2: Deep cosmic triangle sub-bass drone
 *    - Voice 3: Sparkling high-register sine star arpeggios (twinkling constellations)
 *    - Lowpass filter: 2400 Hz with resonant sparkle Q 1.2
 * 
 * Pure Web Audio API: zero audio files, instant loading, seamless procedural looping, smooth room crossfading.
 */

export type RoomMusicTheme = 'study' | 'observatory' | 'escher' | 'coins';

export class HearthAudio {
  private static instance: HearthAudio;
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentRoom: RoomMusicTheme = 'study';
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private sequenceTimer: number | null = null;
  private stepIndex = 0;
  private onRoomChangeCallbacks: Array<(room: RoomMusicTheme) => void> = [];

  // ==================== STUDY SOUNDTRACK ====================
  private readonly studyLeadMelody: Array<{ note: number | null; dur: number }> = [
    // Measure 1: Cmaj7 (Gentle opening)
    { note: 329.63, dur: 0.4 },  // E4
    { note: 392.00, dur: 0.4 },  // G4
    { note: 523.25, dur: 0.8 },  // C5
    { note: 493.88, dur: 0.4 },  // B4
    { note: 392.00, dur: 0.8 },  // G4
    { note: null,   dur: 0.4 },

    // Measure 2: Am7 (Reflective fall)
    { note: 440.00, dur: 0.4 },  // A4
    { note: 523.25, dur: 0.4 },  // C5
    { note: 659.25, dur: 0.8 },  // E5
    { note: 587.33, dur: 0.4 },  // D5
    { note: 523.25, dur: 0.8 },  // C5
    { note: null,   dur: 0.4 },

    // Measure 3: Fmaj7 (Warm expansion)
    { note: 349.23, dur: 0.4 },  // F4
    { note: 440.00, dur: 0.4 },  // A4
    { note: 523.25, dur: 0.6 },  // C5
    { note: 659.25, dur: 0.6 },  // E5
    { note: 587.33, dur: 0.6 },  // D5
    { note: null,   dur: 0.6 },

    // Measure 4: G6 / Gsus (Cozy resolution back to C)
    { note: 392.00, dur: 0.4 },  // G4
    { note: 493.88, dur: 0.4 },  // B4
    { note: 587.33, dur: 0.8 },  // D5
    { note: 493.88, dur: 0.6 },  // B4
    { note: 523.25, dur: 0.8 },  // C5
    { note: null,   dur: 0.2 },
  ];

  private readonly studyBass = [
    130.81, 130.81, 196.00, 130.81, // C3
    110.00, 110.00, 164.81, 110.00, // A2
    87.31,  87.31,  130.81, 87.31,  // F2
    98.00,  98.00,  146.83, 98.00,  // G2
  ];

  private readonly studyArps = [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7
    [220.00, 261.63, 329.63, 392.00], // Am7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [196.00, 246.94, 293.66, 329.63], // G6
  ];

  // ==================== OBSERVATORY SOUNDTRACK ====================
  // Celestial Lydian/Dorian Space Odyssey: Em9 -> Cmaj7#11 -> Dadd9 -> Bm7
  // Soaring celestial square lead with slow ethereal bloom
  private readonly observatoryLeadMelody: Array<{ note: number | null; dur: number }> = [
    // Measure 1: Em9 (Floating into the cosmic void)
    { note: 659.25, dur: 0.8 },  // E5
    { note: 739.99, dur: 0.5 },  // F#5
    { note: 783.99, dur: 1.0 },  // G5
    { note: 987.77, dur: 0.9 },  // B5
    { note: null,   dur: 0.4 },

    // Measure 2: Cmaj7#11 (Lydian starlight lift)
    { note: 1046.50, dur: 0.7 }, // C6
    { note: 987.77,  dur: 0.6 }, // B5
    { note: 739.99,  dur: 0.8 }, // F#5 (#11 high sparkle)
    { note: 659.25,  dur: 0.9 }, // E5
    { note: null,    dur: 0.4 },

    // Measure 3: Dadd9 (Expansive cosmic horizon)
    { note: 587.33, dur: 0.6 },  // D5
    { note: 739.99, dur: 0.6 },  // F#5
    { note: 880.00, dur: 1.0 },  // A5
    { note: 987.77, dur: 0.8 },  // B5
    { note: null,   dur: 0.4 },

    // Measure 4: Bm7 (Quiet celestial wonder)
    { note: 739.99, dur: 0.6 },  // F#5
    { note: 587.33, dur: 0.6 },  // D5
    { note: 493.88, dur: 1.2 },  // B4
    { note: 659.25, dur: 0.6 },  // E5
    { note: null,   dur: 0.4 },
  ];

  // Deep resonant sub-bass triangle drones (E2, C2, D2, B1)
  private readonly observatoryBass = [
    82.41, 82.41, 123.47, 82.41,   // E2 / B2
    65.41, 65.41, 98.00,  65.41,   // C2 / G2
    73.42, 73.42, 110.00, 73.42,   // D2 / A2
    61.74, 61.74, 92.50,  61.74,   // B1 / F#2
  ];

  // Sparkling celestial constellation arpeggios in 5th and 6th octaves
  private readonly observatoryArps = [
    [493.88, 659.25, 783.99, 987.77, 739.99, 659.25, 987.77, 1174.66], // Em9
    [392.00, 493.88, 659.25, 739.99, 783.99, 987.77, 1046.50, 739.99], // Cmaj7#11
    [440.00, 587.33, 739.99, 880.00, 987.77, 880.00, 739.99, 1174.66], // Dadd9
    [369.99, 493.88, 587.33, 739.99, 880.00, 739.99, 587.33, 987.77],  // Bm7
  ];

  // ==================== COIN ROOM / ROYAL MINT SOUNDTRACK ====================
  // Upbeat, mechanical, rhythmic steampunk clockwork theme (84 BPM)
  // Harmonic progression: Fmaj -> Dm -> Bb -> C (Lively, industrious)
  private readonly mintLeadMelody: Array<{ note: number | null; dur: number }> = [
    { note: 349.23, dur: 0.35 }, // F4
    { note: 440.00, dur: 0.35 }, // A4
    { note: 523.25, dur: 0.5 },  // C5
    { note: 698.46, dur: 0.6 },  // F5
    { note: 587.33, dur: 0.4 },  // D5
    { note: 523.25, dur: 0.6 },  // C5
    { note: null,   dur: 0.2 },
    { note: 440.00, dur: 0.35 }, // A4
    { note: 523.25, dur: 0.35 }, // C5
    { note: 587.33, dur: 0.6 },  // D5
    { note: 659.25, dur: 0.5 },  // E5
    { note: 698.46, dur: 0.7 },  // F5
    { note: null,   dur: 0.3 },
  ];

  private readonly mintBass = [
    87.31, 130.81, 87.31, 174.61,  // F2 / C3 / F2 / F3
    73.42, 110.00, 73.42, 146.83,  // D2 / A2 / D2 / D3
    116.54, 116.54, 174.61, 116.54, // Bb2 / F3
    130.81, 130.81, 196.00, 130.81, // C3 / G3
  ];

  private readonly mintArps = [
    [349.23, 440.00, 523.25, 698.46], // F
    [293.66, 349.23, 440.00, 587.33], // Dm
    [233.08, 293.66, 349.23, 466.16], // Bb
    [261.63, 329.63, 392.00, 523.25], // C
  ];

  public static getInstance(): HearthAudio {
    if (!HearthAudio.instance) {
      HearthAudio.instance = new HearthAudio();
    }
    return HearthAudio.instance;
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getRoom(): RoomMusicTheme {
    return this.currentRoom;
  }

  public getRoomName(): string {
    if (this.currentRoom === 'escher') return 'Paradox Gallery';
    if (this.currentRoom === 'observatory') return 'Observatory';
    if (this.currentRoom === 'coins') return 'The Royal Mint';
    return 'Study';
  }

  public onRoomChange(callback: (room: RoomMusicTheme) => void) {
    this.onRoomChangeCallbacks.push(callback);
  }

  public setRoom(room: string) {
    let targetRoom: RoomMusicTheme = 'study';
    if (room === 'observatory') targetRoom = 'observatory';
    else if (room === 'escher') targetRoom = 'escher';
    else if (room === 'coins' || room === 'mint') targetRoom = 'coins';

    if (this.currentRoom === targetRoom) return;

    this.currentRoom = targetRoom;
    this.onRoomChangeCallbacks.forEach((cb) => cb(this.currentRoom));

    if (this.isPlaying && this.ctx && this.masterGain && this.filterNode) {
      const now = this.ctx.currentTime;
      // Smoothly crossfade theme without audible click
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.015, now + 0.25);

      window.setTimeout(() => {
        if (!this.isPlaying || !this.ctx || !this.masterGain || !this.filterNode) return;
        const rampNow = this.ctx.currentTime;
        this.stepIndex = 0;

        if (this.currentRoom === 'escher') {
          this.filterNode.frequency.setTargetAtTime(3200, rampNow, 0.2);
          this.filterNode.Q.setTargetAtTime(1.8, rampNow, 0.2);
        } else if (this.currentRoom === 'coins') {
          this.filterNode.frequency.setTargetAtTime(3000, rampNow, 0.2);
          this.filterNode.Q.setTargetAtTime(1.4, rampNow, 0.2);
        } else if (this.currentRoom === 'observatory') {
          this.filterNode.frequency.setTargetAtTime(2400, rampNow, 0.2);
          this.filterNode.Q.setTargetAtTime(1.2, rampNow, 0.2);
        } else {
          this.filterNode.frequency.setTargetAtTime(1750, rampNow, 0.2);
          this.filterNode.Q.setTargetAtTime(0.7, rampNow, 0.2);
        }

        this.masterGain.gain.setValueAtTime(0.015, rampNow);
        this.masterGain.gain.exponentialRampToValueAtTime(0.09, rampNow + 0.5);
      }, 260);
    }
  }

  public start() {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.stepIndex = 0;

    // Master volume with smooth, gentle fade-in
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.09, this.ctx.currentTime + 1.2);

    // Warm vintage console filter
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    const initialFreq =
      this.currentRoom === 'escher'
        ? 3200
        : this.currentRoom === 'coins'
        ? 3000
        : this.currentRoom === 'observatory'
        ? 2400
        : 1750;
    const initialQ =
      this.currentRoom === 'escher'
        ? 1.8
        : this.currentRoom === 'coins'
        ? 1.4
        : this.currentRoom === 'observatory'
        ? 1.2
        : 0.7;
    this.filterNode.frequency.setValueAtTime(initialFreq, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(initialQ, this.ctx.currentTime);

    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.startSequencer();
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    this.isPlaying = false;

    // Smooth fade out
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    if (this.sequenceTimer !== null) {
      window.clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
  }

  private playTone(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    attackSec: number = 0.03
  ) {
    if (!this.ctx || !this.filterNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Dynamic vibrato
    if (type === 'square') {
      const vib = this.ctx.createOscillator();
      const vibGain = this.ctx.createGain();
      const vibRate = this.currentRoom === 'observatory' ? 3.8 : 4.5;
      const vibDepth = this.currentRoom === 'observatory' ? 2.8 : 2.2;
      vib.frequency.setValueAtTime(vibRate, startTime);
      vibGain.gain.setValueAtTime(vibDepth, startTime);
      vib.connect(vibGain);
      vibGain.connect(osc.frequency);
      vib.start(startTime);
      vib.stop(startTime + duration);
    }

    // Soft chiptune envelope
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + attackSec);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private startSequencer() {
    const tick = () => {
      if (!this.isPlaying || !this.ctx) return;

      const now = this.ctx.currentTime;
      const step = this.stepIndex;

      // ----------------- ESCHER PARADOX SOUNDTRACK (Shepard Tone & Escapement) -----------------
      if (this.currentRoom === 'escher') {
        // 1. Shepard Tone Glissando / Infinite Chord
        // 5 Octaves spaced by 12 semitones: A1 (55Hz) to A6 (1760Hz)
        const s = step % 12;
        const totalOctaves = 5;
        for (let k = 0; k < totalOctaves; k++) {
          const freq = 55 * Math.pow(2, k + s / 12);
          // Cosine bell-curve envelope centered at ~440 Hz
          const t = (k + s / 12) / totalOctaves;
          const weight = 0.5 * (1 - Math.cos(2 * Math.PI * t));
          const shepardVol = weight * 0.12;
          if (shepardVol > 0.005) {
            this.playTone(freq, now, 0.45, 'sine', shepardVol, 0.04);
          }
        }

        // 2. Mechanical Clockwork Escapement Tick (Möbius & Waterfall gear train)
        if (step % 2 === 0) {
          const tickFreq = step % 4 === 0 ? 1400 : 980;
          this.playTone(tickFreq, now, 0.035, 'triangle', 0.07, 0.005);
        }

        // 3. Bach-Escher Modal Canon Lead (D Hungarian Minor / Dorian #4)
        const canonNotes = [293.66, 349.23, 415.3, 440.0, 523.25, 493.88, 415.3, 349.23];
        if (step % 4 === 1 || step % 4 === 3) {
          const note = canonNotes[Math.floor(step / 2) % canonNotes.length];
          this.playTone(note, now, 0.32, 'triangle', 0.12, 0.02);
        }

        this.stepIndex++;
        this.sequenceTimer = window.setTimeout(tick, 250); // 60 BPM
        return;
      }

      // ----------------- ROOM MUSIC SEQUENCING -----------------
      const isMint = this.currentRoom === 'coins';
      const isObs = this.currentRoom === 'observatory';
      const measure = Math.floor((step % 64) / 16);
      const beatInMeasure = step % 16;

      // 1. Bassline (quarter note pulse)
      if (step % 4 === 0) {
        const bassList = isMint ? this.mintBass : isObs ? this.observatoryBass : this.studyBass;
        const bassNoteIdx = (Math.floor(step / 4)) % bassList.length;
        const bassFreq = bassList[bassNoteIdx];
        const bassVol = isMint ? 0.30 : isObs ? 0.32 : 0.28;
        const bassDur = isMint ? 0.55 : isObs ? 0.9 : 0.7;
        this.playTone(bassFreq, now, bassDur, 'triangle', bassVol, 0.03);
      }

      // 2. Delicate Arpeggios (eighth note pulse)
      if (step % 2 === 0) {
        const arpMatrix = isMint ? this.mintArps : isObs ? this.observatoryArps : this.studyArps;
        const arpPattern = arpMatrix[measure];
        const arpNote = arpPattern[(beatInMeasure / 2) % arpPattern.length];
        const arpVol = isMint ? 0.14 : isObs ? 0.15 : 0.12;
        const arpDur = isMint ? 0.28 : isObs ? 0.45 : 0.35;
        this.playTone(arpNote, now, arpDur, isMint ? 'triangle' : 'sine', arpVol, 0.015);
      }

      // 3. Melodic Chiptune Lead
      const leadTicks = isMint
        ? [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48]
        : [0, 2, 4, 8, 10, 16, 18, 20, 24, 26, 32, 34, 36, 40, 43, 48, 50, 52, 56, 59];
      const tickPos = step % 64;
      const leadIdx = leadTicks.indexOf(tickPos);
      const melody = isMint ? this.mintLeadMelody : isObs ? this.observatoryLeadMelody : this.studyLeadMelody;

      if (leadIdx !== -1 && leadIdx < melody.length) {
        const m = melody[leadIdx];
        if (m.note !== null) {
          const leadVol = isMint ? 0.17 : isObs ? 0.16 : 0.14;
          const attack = isMint ? 0.02 : isObs ? 0.05 : 0.025;
          this.playTone(m.note, now, m.dur, 'square', leadVol, attack);
        }
      }

      this.stepIndex++;

      // Adaptive tempo: Mint is 84 BPM (0.18s), Observatory is 50 BPM (0.28s), Study is 68 BPM (0.22s)
      const stepDurationSec = isMint ? 0.18 : isObs ? 0.28 : 0.22;
      this.sequenceTimer = window.setTimeout(tick, stepDurationSec * 1000);
    };

    tick();
  }

  /**
   * Procedural Trumpet-Quack:
   * A delightful hybrid sound combining an elephant's rising brassy pulse swell
   * with a resonant downward duck formant chirp.
   */
  public playTrumpetQuack() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Elephant Trumpet swell (brassy upward pulse swell)
    const trumpetOsc = this.ctx.createOscillator();
    const trumpetGain = this.ctx.createGain();
    trumpetOsc.type = 'sawtooth';
    trumpetOsc.frequency.setValueAtTime(145, now);
    trumpetOsc.frequency.exponentialRampToValueAtTime(290, now + 0.12);
    trumpetOsc.frequency.exponentialRampToValueAtTime(240, now + 0.22);

    trumpetGain.gain.setValueAtTime(0.001, now);
    trumpetGain.gain.linearRampToValueAtTime(0.22, now + 0.04);
    trumpetGain.gain.linearRampToValueAtTime(0.18, now + 0.12);
    trumpetGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    const trumpetFilter = this.ctx.createBiquadFilter();
    trumpetFilter.type = 'bandpass';
    trumpetFilter.frequency.setValueAtTime(800, now);
    trumpetFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
    trumpetFilter.Q.value = 2.5;

    trumpetOsc.connect(trumpetFilter);
    trumpetFilter.connect(trumpetGain);
    trumpetGain.connect(this.ctx.destination);

    trumpetOsc.start(now);
    trumpetOsc.stop(now + 0.26);

    // 2. Duck Quack formant drop (resonant nasal downward chirp)
    const quackTime = now + 0.14;
    const quackOsc = this.ctx.createOscillator();
    const quackGain = this.ctx.createGain();
    quackOsc.type = 'triangle';
    quackOsc.frequency.setValueAtTime(320, quackTime);
    quackOsc.frequency.exponentialRampToValueAtTime(180, quackTime + 0.18);

    quackGain.gain.setValueAtTime(0.001, quackTime);
    quackGain.gain.linearRampToValueAtTime(0.24, quackTime + 0.02);
    quackGain.gain.exponentialRampToValueAtTime(0.001, quackTime + 0.22);

    const quackFilter = this.ctx.createBiquadFilter();
    quackFilter.type = 'bandpass';
    quackFilter.frequency.setValueAtTime(650, quackTime);
    quackFilter.frequency.exponentialRampToValueAtTime(360, quackTime + 0.2);
    quackFilter.Q.value = 4.0;

    quackOsc.connect(quackFilter);
    quackFilter.connect(quackGain);
    quackGain.connect(this.ctx.destination);

    quackOsc.start(quackTime);
    quackOsc.stop(quackTime + 0.23);
  }

  /**
   * Cute rhythmic munching crunch sound for peanut treats
   */
  public playMunch() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450 - i * 60, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.05);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    }
  }

  /**
   * Perpetual Waterfall pebble drop:
   * Combines an acoustic water droplet descent with a resonant crystalline chime.
   */
  public playWaterSplash() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Resonant water droplet downward chirp
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1600, now);
    osc1.frequency.exponentialRampToValueAtTime(700, now + 0.15);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Crystalline chime harmonic (G6: 1567.98 Hz)
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1567.98, now + 0.04);
    gain2.gain.setValueAtTime(0.12, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.38);
  }

  /**
   * Clockwork Terrarium escapement click
   */
  public playClockworkTick() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Pencil scratch / graphite sketch stroke
   */
  public playPencilScratch() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(3200 + i * 400, t);
      osc.frequency.exponentialRampToValueAtTime(1800, t + 0.025);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.035);
    }
  }

  // ==================== COIN & PHYSICAL SFX SYNTHESIS ====================

  /**
   * Mechanical coin stamping / dispenser chute burst sound
   */
  public playCoinEject() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Heavy piston thud
    const oscThud = this.ctx.createOscillator();
    const gainThud = this.ctx.createGain();
    oscThud.type = 'triangle';
    oscThud.frequency.setValueAtTime(140, now);
    oscThud.frequency.exponentialRampToValueAtTime(45, now + 0.09);

    gainThud.gain.setValueAtTime(0.35, now);
    gainThud.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    oscThud.connect(gainThud);
    gainThud.connect(this.ctx.destination);
    oscThud.start(now);
    oscThud.stop(now + 0.11);

    // Mechanical gear/latch snap
    const oscLatch = this.ctx.createOscillator();
    const gainLatch = this.ctx.createGain();
    oscLatch.type = 'square';
    oscLatch.frequency.setValueAtTime(2400, now + 0.02);
    oscLatch.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    gainLatch.gain.setValueAtTime(0.18, now + 0.02);
    gainLatch.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    oscLatch.connect(gainLatch);
    gainLatch.connect(this.ctx.destination);
    oscLatch.start(now + 0.02);
    oscLatch.stop(now + 0.07);

    // Metallic chime ring of freshly minted coin
    const oscRing = this.ctx.createOscillator();
    const gainRing = this.ctx.createGain();
    oscRing.type = 'sine';
    oscRing.frequency.setValueAtTime(1760, now + 0.04);

    gainRing.gain.setValueAtTime(0.12, now + 0.04);
    gainRing.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    oscRing.connect(gainRing);
    gainRing.connect(this.ctx.destination);
    oscRing.start(now + 0.04);
    oscRing.stop(now + 0.3);
  }

  /**
   * Resonant metallic coin bounce on stone/wood floor
   * Synthesized using dual-carrier FM metallic impact with rapid decay
   */
  public playCoinBounce(coinType: 'copper' | 'silver' | 'gold' | 'star' = 'gold', impactSpeed: number = 80) {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const normSpeed = Math.min(Math.max(impactSpeed / 180, 0.15), 1.0);

    // Base pitch depends on coin density/denomination
    let baseFreq = 1864.66; // A#6 (Gold)
    if (coinType === 'copper') baseFreq = 3135.96; // G7 (Copper)
    else if (coinType === 'silver') baseFreq = 2489.02; // D#7 (Silver)
    else if (coinType === 'star') baseFreq = 4186.01; // C8 (Special Star)

    // Slight random micro-detune for realistic acoustic variation
    const detune = (Math.random() - 0.5) * 80;
    const freq = baseFreq + detune;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Inharmonic metallic partial via FM carrier
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const dur = 0.04 + normSpeed * 0.08;
    gain.gain.setValueAtTime(0.14 * normSpeed, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + dur);

    // Resonant metallic ping filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq, now);
    filter.Q.value = 8.0;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  /**
   * Rewarding ascending musical chime when player collects a coin
   * Scales up musically as coins are collected in rapid combo succession!
   */
  public playCoinPickup(comboCount: number = 0) {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Major pentatonic collection notes: C6, D6, E6, G6, A6, C7
    const scale = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00, 2093.00, 2637.02];
    const noteIdx = Math.min(comboCount, scale.length - 1);
    const rootFreq = scale[noteIdx];
    const fifthFreq = rootFreq * 1.5;

    // Primary bell sine
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(rootFreq, now);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.24, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Harmonic crystalline fifth
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(fifthFreq, now + 0.025);

    gain2.gain.setValueAtTime(0.001, now + 0.025);
    gain2.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.025);
    osc2.stop(now + 0.42);
  }

  /**
   * Plinko peg click for the gilded coin chute
   */
  public playPlinkoPegHit() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const pegFreq = 2200 + (Math.random() - 0.5) * 400;
    osc.frequency.setValueAtTime(pegFreq, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.025);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  /**
   * Fountain water drop / splash for the wishing well
   */
  public playFountainSplash() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}


