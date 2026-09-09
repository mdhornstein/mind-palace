export interface GameLoopCallbacks {
  onUpdate: (dtSeconds: number, nowMs: number) => void;
  onRender: (nowMs: number) => void;
}

/**
 * Pure timing engine for the interactive requestAnimationFrame loop.
 *
 * Architectural Invariants:
 * 1. dtSeconds is in seconds, clamped to [0, 0.1]s (100ms max) to prevent
 *    spiral-of-death or physics explosions upon tab switching or backgrounding.
 * 2. Frame-only delta: GameLoop caps frame delta for interactive simulation only;
 *    it does NOT govern persistent offline world time evolution (which uses real wall-clock time).
 * 3. Double-start protection: calling start() multiple times is a no-op and
 *    does not schedule concurrent duplicate loops.
 * 4. Explicit cancel: stop() cancels the active animation frame ID via cancelAnimationFrame.
 */
export class GameLoop {
  private callbacks: GameLoopCallbacks;
  private running: boolean = false;
  private rafId: number | null = null;
  private lastTimeMs: number | null = null;

  constructor(callbacks: GameLoopCallbacks) {
    this.callbacks = callbacks;
  }

  public start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTimeMs = null;
    this.scheduleNext();
  }

  public stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public isRunning(): boolean {
    return this.running;
  }

  private scheduleNext(): void {
    this.rafId = requestAnimationFrame((nowMs: number) => {
      if (!this.running) {
        return;
      }

      let dtSeconds: number;
      if (this.lastTimeMs === null) {
        // First frame after startup: nominal zero delta
        dtSeconds = 0;
      } else {
        const rawDtSeconds = (nowMs - this.lastTimeMs) / 1000;
        // Clamp dtSeconds to [0, 0.1]s (100ms max)
        dtSeconds = Math.max(0, Math.min(0.1, rawDtSeconds));
      }
      this.lastTimeMs = nowMs;

      this.callbacks.onUpdate(dtSeconds, nowMs);
      this.callbacks.onRender(nowMs);

      if (this.running) {
        this.scheduleNext();
      }
    });
  }
}
