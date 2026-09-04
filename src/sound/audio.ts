/**
 * Procedural Web Audio Fireplace Sound Generator
 * Generates realistic ambient hearth sounds (low roaring body + random wood pops/crackles)
 * Pure Web Audio API: zero external assets, instant loading, zero latency.
 */

export class HearthAudio {
  private static instance: HearthAudio;
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private roarNode: AudioBufferSourceNode | null = null;
  private crackleInterval: number | null = null;

  public static getInstance(): HearthAudio {
    if (!HearthAudio.instance) {
      HearthAudio.instance = new HearthAudio();
    }
    return HearthAudio.instance;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

    // Master volume with smooth fade in
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.28, this.ctx.currentTime + 1.2);
    this.masterGain.connect(this.ctx.destination);

    // 1. Low warm hearth roar (brownian/pink noise through low-pass resonant filter)
    this.startHearthRoar();

    // 2. Realistic randomized wood embers snapping & crackling
    this.startCrackles();
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    this.isPlaying = false;

    // Smooth fade out
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

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
      if (this.crackleInterval !== null) {
        window.clearInterval(this.crackleInterval);
        this.crackleInterval = null;
      }
    }, 650);
  }

  private startHearthRoar() {
    if (!this.ctx || !this.masterGain) return;

    // Generate 4 seconds of looping pink/brown noise for hearth rumble
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise integration
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }

    this.roarNode = this.ctx.createBufferSource();
    this.roarNode.buffer = buffer;
    this.roarNode.loop = true;

    // Low-pass filter for cozy fireplace muffled rumble
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    this.roarNode.connect(filter);
    filter.connect(this.masterGain);
    this.roarNode.start();
  }

  private startCrackles() {
    const triggerCrackle = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      // Small burst of high-frequency popping noise (wood snapping)
      const isBigPop = Math.random() < 0.2;
      const duration = isBigPop ? 0.04 : 0.015;
      const crackleBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * duration), this.ctx.sampleRate);
      const output = crackleBuffer.getChannelData(0);

      for (let i = 0; i < output.length; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (output.length * 0.3));
      }

      const source = this.ctx.createBufferSource();
      source.buffer = crackleBuffer;

      const popFilter = this.ctx.createBiquadFilter();
      popFilter.type = 'bandpass';
      popFilter.frequency.value = isBigPop ? 1100 + Math.random() * 800 : 2200 + Math.random() * 1600;
      popFilter.Q.value = 4.0;

      const popGain = this.ctx.createGain();
      popGain.gain.value = isBigPop ? 0.7 + Math.random() * 0.4 : 0.25 + Math.random() * 0.3;

      source.connect(popFilter);
      popFilter.connect(popGain);
      popGain.connect(this.masterGain);

      source.start();

      // Schedule next random pop
      const nextDelay = isBigPop ? 180 + Math.random() * 350 : 60 + Math.random() * 220;
      setTimeout(triggerCrackle, nextDelay);
    };

    triggerCrackle();
  }
}
