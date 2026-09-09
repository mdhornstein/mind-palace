import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '../../src/core/gameLoop';

describe('GameLoop', () => {
  let callbacks: Map<number, (now: number) => void>;
  let nextId: number;
  let cancelledIds: number[];

  beforeEach(() => {
    callbacks = new Map();
    nextId = 1;
    cancelledIds = [];

    vi.stubGlobal('requestAnimationFrame', (cb: (now: number) => void) => {
      const id = nextId++;
      callbacks.set(id, cb);
      return id;
    });

    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      cancelledIds.push(id);
      callbacks.delete(id);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function stepFrame(nowMs: number) {
    const current = Array.from(callbacks.entries());
    callbacks.clear();
    for (const [, cb] of current) {
      cb(nowMs);
    }
  }

  it('reports isRunning correctly on start and stop', () => {
    const loop = new GameLoop({
      onUpdate: () => {},
      onRender: () => {},
    });

    expect(loop.isRunning()).toBe(false);
    loop.start();
    expect(loop.isRunning()).toBe(true);
    loop.stop();
    expect(loop.isRunning()).toBe(false);
  });

  it('prevents double-start from scheduling duplicate concurrent loops', () => {
    const onUpdate = vi.fn();
    const loop = new GameLoop({
      onUpdate,
      onRender: () => {},
    });

    loop.start();
    expect(callbacks.size).toBe(1);

    // Call start second time while already running
    loop.start();
    expect(callbacks.size).toBe(1); // Must still be only 1 scheduled frame

    // Advance frame
    stepFrame(1000);
    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(callbacks.size).toBe(1); // Continues single loop
    loop.stop();
  });

  it('cancels scheduled frame on stop() and does not invoke callbacks', () => {
    const onUpdate = vi.fn();
    const onRender = vi.fn();
    const loop = new GameLoop({
      onUpdate,
      onRender,
    });

    loop.start();
    expect(callbacks.size).toBe(1);

    loop.stop();
    expect(cancelledIds.length).toBe(1);
    expect(callbacks.size).toBe(0);

    stepFrame(1000);
    expect(onUpdate).not.toHaveBeenCalled();
    expect(onRender).not.toHaveBeenCalled();
  });

  it('resumes cleanly when restarted after stop()', () => {
    const updates: number[] = [];
    const loop = new GameLoop({
      onUpdate: (dt) => updates.push(dt),
      onRender: () => {},
    });

    loop.start();
    stepFrame(1000); // Frame 1: dt = 0
    stepFrame(1016); // Frame 2: dt = 0.016

    loop.stop();
    stepFrame(1032); // Stopped: no callback

    // Restart loop
    loop.start();
    stepFrame(2000); // First frame of restarted loop: dt = 0
    stepFrame(2016); // Second frame: dt = 0.016

    expect(updates).toEqual([0, 0.016, 0, 0.016]);
    loop.stop();
  });

  it('handles first-frame delta as nominal zero seconds', () => {
    let firstDt: number | null = null;
    const loop = new GameLoop({
      onUpdate: (dt) => {
        if (firstDt === null) firstDt = dt;
      },
      onRender: () => {},
    });

    loop.start();
    stepFrame(10000); // Startup timestamp is arbitrary high number
    expect(firstDt).toBe(0);
    loop.stop();
  });

  it('correctly handles rAF timestamp starting at 0ms and calculates next frame delta', () => {
    const dtValues: number[] = [];
    const loop = new GameLoop({
      onUpdate: (dt) => dtValues.push(dt),
      onRender: () => {},
    });

    loop.start();
    // Theoretical browser edge case: first frame begins exactly at 0ms
    stepFrame(0);
    // Second frame arrives 16ms later
    stepFrame(16);
    // Third frame arrives 32ms later
    stepFrame(32);

    expect(dtValues[0]).toBe(0);
    expect(dtValues[1]).toBeCloseTo(0.016, 3);
    expect(dtValues[2]).toBeCloseTo(0.016, 3);
    loop.stop();
  });

  it('clamps dtSeconds to 0.1s (100ms) maximum when frame gap is large', () => {
    const dtValues: number[] = [];
    const loop = new GameLoop({
      onUpdate: (dt) => dtValues.push(dt),
      onRender: () => {},
    });

    loop.start();
    stepFrame(1000); // First frame: dt = 0
    stepFrame(1016.6); // Normal ~60fps frame: dt ≈ 0.0166s

    // Simulate tab inactive or lagged for 30 seconds (30,000ms jump)
    stepFrame(31016.6);

    expect(dtValues[0]).toBe(0);
    expect(dtValues[1]).toBeCloseTo(0.0166, 3);
    // Large jump must be clamped to exactly 0.1s (100ms)
    expect(dtValues[2]).toBe(0.1);

    loop.stop();
  });

  it('passes performance nowMs to both onUpdate and onRender', () => {
    let updateTime = -1;
    let renderTime = -1;
    const loop = new GameLoop({
      onUpdate: (_dt, now) => {
        updateTime = now;
      },
      onRender: (now) => {
        renderTime = now;
      },
    });

    loop.start();
    stepFrame(4242.5);

    expect(updateTime).toBe(4242.5);
    expect(renderTime).toBe(4242.5);
    loop.stop();
  });
});
