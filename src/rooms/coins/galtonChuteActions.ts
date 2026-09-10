import { HearthAudio } from '../../sound/audio';
import { CoinPhysicsEngine } from './coinPhysics';
import { TILE_SIZE } from '../../core/constants';

/**
 * Galton Chute Gameplay Action Module
 *
 * Encapsulates in-world quick drop mechanics for The Gilded Chute (Galton pegboard).
 * Zero UI imports to respect strict architectural domain boundaries.
 */

export interface GaltonQuickDropParams {
  stationId?: string;
  chuteX?: number;
  chuteY?: number;
}

export interface GaltonVisualToken {
  id: number;
  startTime: number;
  durationMs: number;
  // Pin row lateral path offsets (-1 to 1 normalized across width)
  path: number[];
}

const QUICK_DROP_COOLDOWN_MS = 120;
const DROP_ANIMATION_DURATION_MS = 640;

// Default emission coordinate (trough mouth at base of plinko cabinet)
const DEFAULT_CHUTE_X = 15.6 * TILE_SIZE;
const DEFAULT_CHUTE_Y = 5.2 * TILE_SIZE;

let nextTokenId = 1;
const activeTokens: GaltonVisualToken[] = [];
const lastDropTimes: Map<string, number> = new Map();
let lastGlobalDropTime = 0;

/**
 * Executes an in-world quick drop of a sovereign down the Galton Chute pegboard.
 * Schedules pin deflection chimes, tracks in-world tumbling coin animation,
 * and ejects payout coins from the bottom collection trough onto the room floor.
 *
 * @returns true if the coin was dropped; false if throttled.
 */
export function executeGaltonQuickDrop(
  params?: GaltonQuickDropParams,
  now: number = Date.now()
): boolean {
  const stationKey = params?.stationId || 'plinko_drop';
  const lastTime = lastDropTimes.get(stationKey);

  if (lastTime !== undefined && now - lastTime < QUICK_DROP_COOLDOWN_MS) {
    return false;
  }

  lastDropTimes.set(stationKey, now);
  lastGlobalDropTime = now;

  const chuteX = typeof params?.chuteX === 'number' ? params.chuteX : DEFAULT_CHUTE_X;
  const chuteY = typeof params?.chuteY === 'number' ? params.chuteY : DEFAULT_CHUTE_Y;

  // Generate a randomized 5-row path through the staggered pins
  // Normal distribution tendency toward center
  let currentOffset = (Math.random() - 0.5) * 0.3;
  const path: number[] = [currentOffset];
  for (let r = 0; r < 5; r++) {
    const step = (Math.random() - 0.5) * 0.4;
    currentOffset = Math.max(-0.85, Math.min(0.85, currentOffset + step));
    path.push(currentOffset);
  }

  const token: GaltonVisualToken = {
    id: nextTokenId++,
    startTime: now,
    durationMs: DROP_ANIMATION_DURATION_MS,
    path,
  };
  activeTokens.push(token);

  // Clean up completed tokens
  pruneFinishedTokens(now);

  const audio = HearthAudio.getInstance();

  // Schedule rhythmic pin pings for each row traversal
  const pinStepInterval = 95;
  for (let row = 0; row < 5; row++) {
    const delay = 60 + row * pinStepInterval;
    setTimeout(() => {
      audio.playPlinkoPegHit();
    }, delay);
  }

  // Multiplier payout upon landing in bottom bin
  // 50% 1 coin, 35% 2 coins, 15% 3 coins (jackpot)
  const roll = Math.random();
  const payout = roll < 0.5 ? 1 : roll < 0.85 ? 2 : 3;

  const totalDropTime = 60 + 5 * pinStepInterval + 50;
  setTimeout(() => {
    const engine = CoinPhysicsEngine.getInstance();
    // Eject bouncing coins from the collection trough aperture
    engine.spawnBurst(chuteX, chuteY, payout, undefined, 20);
  }, totalDropTime);

  return true;
}

/**
 * Returns currently falling coins inside the Galton cabinet for dynamic canvas rendering.
 */
export function getActiveGaltonTokens(now: number = Date.now()): readonly GaltonVisualToken[] {
  pruneFinishedTokens(now);
  return activeTokens;
}

function pruneFinishedTokens(now: number): void {
  for (let i = activeTokens.length - 1; i >= 0; i--) {
    if (now - activeTokens[i].startTime > activeTokens[i].durationMs + 200) {
      activeTokens.splice(i, 1);
    }
  }
}

/**
 * Returns the timestamp of the last quick drop.
 */
export function getLastGaltonDropTime(stationId?: string): number {
  if (stationId && lastDropTimes.has(stationId)) {
    return lastDropTimes.get(stationId)!;
  }
  return lastGlobalDropTime;
}

/**
 * Resets state timers and active tokens (useful for unit tests).
 */
export function resetGaltonChuteState(stationId?: string): void {
  if (stationId) {
    lastDropTimes.delete(stationId);
  } else {
    lastDropTimes.clear();
    lastGlobalDropTime = 0;
  }
  activeTokens.length = 0;
}
