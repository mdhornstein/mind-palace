/**
 * Procedural Web Audio Fireplace Sound Generator
 * Generates cozy, calming ambient hearth sounds:
 * - Soft, muffled low-frequency ember bed (gentle warm flue draft, non-resonant)
 * - Infrequent, gentle wood snaps and warm settling pops (warm acoustic resonance, not harsh static)
 * Pure Web Audio API: zero external assets, instant loading, zero latency.
 */

export class HearthAudio {
  private static instance: HearthAudio;
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private roarNode: AudioBufferSourceNode | null = null;
  private driftGain: GainNode | null = null;
  private crackleTimeout: number | null = null;

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

    // Master volume with smooth, gentle fade-in (calm ambient level)
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 1.8);
    this.masterGain.connect(this.ctx.destination);

    // 1. Warm, gentle muffled hearth bed (low-frequency flame draft)
    this.startWarmBed();

    // 2. Rare, pleasant wood ember snaps
    this.startGentleCrackles();
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    this.isPlaying = false;

    // Smooth fade out
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

    setTimeout(() => {
      if (this.roarNode) {
        try {
          this.roarNode.stop();
          this.roarNode.disconnect();
        } catch {
          // Ignore if already stopped
        }
        this.roarNode = null;
      }
      if (this.crackleTimeout !== null) {
        window.clearTimeout(this.crackleTimeout);
        this.crackleTimeout = null;
      }
    }, 850);
  }

  private startWarmBed() {
    if (!this.ctx || !this.masterGain) return;

    // Generate 5 seconds of seamless pink/brown noise (soft flame body)
    const bufferSize = this.ctx.sampleRate * 5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Classic Paul Kellet pink-noise filtering for natural organic hiss/rumble
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.08) * 0.45;
    }

    this.roarNode = this.ctx.createBufferSource();
    this.roarNode.buffer = buffer;
    this.roarNode.loop = true;

    // Cascaded smooth lowpass filters: NO resonant spike, pure warmth
    const lp1 = this.ctx.createBiquadFilter();
    lp1.type = 'lowpass';
    lp1.frequency.setValueAtTime(160, this.ctx.currentTime);
    lp1.Q.setValueAtTime(0.6, this.ctx.currentTime);

    const lp2 = this.ctx.createBiquadFilter();
    lp2.type = 'lowpass';
    lp2.frequency.setValueAtTime(220, this.ctx.currentTime);
    lp2.Q.setValueAtTime(0.5, this.ctx.currentTime);

    // Subtle natural draft breath (drift gain)
    this.driftGain = this.ctx.createGain();
    this.driftGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    this.roarNode.connect(lp1);
    lp1.connect(lp2);
    lp2.connect(this.driftGain);
    this.driftGain.connect(this.masterGain);

    this.roarNode.start();
  }

  private startGentleCrackles() {
    const triggerGentlePop = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      // Is this a tiny snap or a soft settling ember?
      const isSoftSnap = Math.random() < 0.65;
      const duration = isSoftSnap ? 0.03 : 0.06;
      const bufferLength = Math.floor(this.ctx.sampleRate * duration);
      const crackleBuffer = this.ctx.createBuffer(1, bufferLength, this.ctx.sampleRate);
      const output = crackleBuffer.getChannelData(0);

      // Warm decay envelope
      for (let i = 0; i < output.length; i++) {
        const decay = Math.exp(-i / (output.length * 0.25));
        output[i] = (Math.random() * 2 - 1) * decay;
      }

      const source = this.ctx.createBufferSource();
      source.buffer = crackleBuffer;

      // Warm wooden acoustic frequencies (600Hz - 1100Hz, no harsh 3kHz clicks)
      const popFilter = this.ctx.createBiquadFilter();
      popFilter.type = 'bandpass';
      popFilter.frequency.value = isSoftSnap ? 750 + Math.random() * 350 : 500 + Math.random() * 250;
      popFilter.Q.value = 2.2;

      const popGain = this.ctx.createGain();
      popGain.gain.setValueAtTime(isSoftSnap ? 0.09 : 0.15, now);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      source.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(this.masterGain);

      source.start();

      // Fireplaces pop occasionally and pleasantly, not constantly!
      // Schedule next crackle between 1.8s and 4.8s
      const nextDelay = 1800 + Math.random() * 3000;
      this.crackleTimeout = window.setTimeout(triggerGentlePop, nextDelay);
    };

    // First pop starts after 1.2 seconds of warm rumble
    this.crackleTimeout = window.setTimeout(triggerGentlePop, 1200);
  }
}
