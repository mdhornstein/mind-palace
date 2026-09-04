/**
 * Procedural Web Audio 8-Bit Cozy Chiptune Soundtrack
 * Generates a nostalgic, gentle, looping chiptune music-box lullaby for the Mind Palace:
 * - Voice 1: Soft pulse-wave melodic lead (warm nostalgic melody with subtle vibrato)
 * - Voice 2: Rounded triangle-wave 8-bit bassline (walking root chord progression)
 * - Voice 3: Delicate arpeggio bells (rippling music-box broken chords)
 * - Warm 1600Hz low-pass vintage console filter for cozy warmth
 * Pure Web Audio API: zero audio files, instant loading, seamless procedural looping.
 */

export class HearthAudio {
  private static instance: HearthAudio;
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private sequenceTimer: number | null = null;
  private stepIndex = 0;

  // Chord progression: Cmaj7 -> Am7 -> Fmaj7 -> G6 (Cozy, reflective sanctuary loop)
  // Notes in Hz:
  // C3: 130.81, E3: 164.81, G3: 196.00, B3: 246.94
  // A2: 110.00, C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25
  // F2: 87.31, G2: 98.00

  private readonly leadMelody: Array<{ note: number | null; dur: number }> = [
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
    { note: 523.25, dur: 0.8 },  // C5 (lingers softly)
    { note: null,   dur: 0.2 },
  ];

  private readonly bassProgression = [
    // Measure 1: C
    130.81, 130.81, 196.00, 130.81,
    // Measure 2: A
    110.00, 110.00, 164.81, 110.00,
    // Measure 3: F
    87.31, 87.31, 130.81, 87.31,
    // Measure 4: G
    98.00, 98.00, 146.83, 98.00,
  ];

  private readonly arpPatterns = [
    // Measure 1: Cmaj7 arpeggios
    [261.63, 329.63, 392.00, 493.88],
    // Measure 2: Am7 arpeggios
    [220.00, 261.63, 329.63, 392.00],
    // Measure 3: Fmaj7 arpeggios
    [174.61, 220.00, 261.63, 329.63],
    // Measure 4: G6 arpeggios
    [196.00, 246.94, 293.66, 329.63],
  ];

  public static getInstance(): HearthAudio {
    if (!HearthAudio.instance) {
      HearthAudio.instance = new HearthAudio();
    }
    return HearthAudio.instance;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  public start() {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.stepIndex = 0;

    // Master volume with smooth, gentle fade-in (calm ambient music level)
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.09, this.ctx.currentTime + 1.2);

    // Warm vintage console low-pass filter (no harsh highs)
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(1750, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(0.7, this.ctx.currentTime);

    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.startSequencer();
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    this.isPlaying = false;

    // Smooth fade out
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

    if (this.sequenceTimer !== null) {
      window.clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
  }

  private playTone(freq: number, startTime: number, duration: number, type: OscillatorType, volume: number) {
    if (!this.ctx || !this.filterNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle 8-bit vibrato for lead notes
    if (type === 'square') {
      const vib = this.ctx.createOscillator();
      const vibGain = this.ctx.createGain();
      vib.frequency.setValueAtTime(4.5, startTime); // 4.5 Hz gentle warble
      vibGain.gain.setValueAtTime(2.2, startTime);
      vib.connect(vibGain);
      vibGain.connect(osc.frequency);
      vib.start(startTime);
      vib.stop(startTime + duration);
    }

    // Soft chiptune envelope (quick attack, gentle exponential release decay)
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private startSequencer() {
    const stepDurationSec = 0.22; // ~68 BPM sixteenth note pace

    const tick = () => {
      if (!this.isPlaying || !this.ctx) return;

      const now = this.ctx.currentTime;
      const step = this.stepIndex;
      const measure = Math.floor((step % 64) / 16);
      const beatInMeasure = step % 16;

      // 1. Bassline (every 4 steps / quarter note)
      if (step % 4 === 0) {
        const bassNoteIdx = (Math.floor(step / 4)) % this.bassProgression.length;
        const bassFreq = this.bassProgression[bassNoteIdx];
        this.playTone(bassFreq, now, 0.7, 'triangle', 0.28);
      }

      // 2. Delicate Music-Box Arpeggio (every 2 steps / eighth note)
      if (step % 2 === 0) {
        const arpPattern = this.arpPatterns[measure];
        const arpNote = arpPattern[(beatInMeasure / 2) % arpPattern.length];
        this.playTone(arpNote, now, 0.35, 'sine', 0.12);
      }

      // 3. Melodic Chiptune Lead (calculated from leadMelody pacing)
      // Play lead notes on specific sixteenth ticks
      const leadTicks = [0, 2, 4, 8, 10, 16, 18, 20, 24, 26, 32, 34, 36, 40, 43, 48, 50, 52, 56, 59];
      const tickPos = step % 64;
      const leadIdx = leadTicks.indexOf(tickPos);
      if (leadIdx !== -1 && leadIdx < this.leadMelody.length) {
        const m = this.leadMelody[leadIdx];
        if (m.note !== null) {
          this.playTone(m.note, now, m.dur, 'square', 0.14);
        }
      }

      this.stepIndex++;
      this.sequenceTimer = window.setTimeout(tick, stepDurationSec * 1000);
    };

    tick();
  }
}
