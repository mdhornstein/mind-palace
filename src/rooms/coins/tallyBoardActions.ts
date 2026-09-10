import { HearthAudio } from '../../sound/audio';
import { CoinPhysicsEngine } from './coinPhysics';
import { TILE_SIZE } from '../../core/constants';

/**
 * Moneyer's Tally Board Gameplay Action Module
 *
 * Encapsulates in-world coin counting, granular cascading, strike-bar sweeping,
 * and chest dumping actions.
 * Zero UI imports to respect strict architectural domain boundaries.
 */

export interface TallyBoardParams {
  stationId?: string;
  chestX?: number;
  chestY?: number;
}

// Throttle cooldown (ms) preventing acoustic clipping while allowing rhythmic interactions
const TALLY_POUR_COOLDOWN_MS = 180;

// Default emission coordinates for payout coins from under the tally table
const DEFAULT_CHEST_X = 3.6 * TILE_SIZE;
const DEFAULT_CHEST_Y = 9.8 * TILE_SIZE;

const lastPourTimes: Map<string, number> = new Map();
let lastGlobalPourTime = 0;

/**
 * Executes an in-world pour, sweep, and batch dump on the Moneyer's Tally Board.
 * Schedules the rich acoustic sequence:
 * 1. Granular coin cascade down brass flutes (t = 0)
 * 2. Mahogany strike-bar sweep across the grooves (t = +120ms)
 * 3. Oak chest trapdoor release & bottom impact (t = +360ms)
 * 4. Payout coins ejected from the chest mouth onto the flagstone floor (t = +400ms)
 *
 * @returns true if the batch pour was executed; false if throttled.
 */
export function executeTallyBoardPour(
  params?: TallyBoardParams,
  now: number = Date.now()
): boolean {
  const stationKey = params?.stationId || 'mint_tally_board';
  const lastTime = lastPourTimes.get(stationKey);

  if (lastTime !== undefined && now - lastTime < TALLY_POUR_COOLDOWN_MS) {
    return false;
  }

  lastPourTimes.set(stationKey, now);
  lastGlobalPourTime = now;

  const chestX = typeof params?.chestX === 'number' ? params.chestX : DEFAULT_CHEST_X;
  const chestY = typeof params?.chestY === 'number' ? params.chestY : DEFAULT_CHEST_Y;

  const audio = HearthAudio.getInstance();

  // 1. Immediate granular coin cascade down brass fluted grooves
  audio.playCoinCascade(28);

  // 2. Wooden strike-bar sweep across the board
  setTimeout(() => {
    audio.playWoodenStrikeSweep();
  }, 120);

  // 3. Chest release latch & batch dump thud
  setTimeout(() => {
    audio.playChestDump();
  }, 360);

  // 4. Physical coin burst onto the room floor from the chest mouth
  // 50% chance 2 coins, 35% chance 3 coins, 15% chance 4 coins
  const roll = Math.random();
  const payout = roll < 0.5 ? 2 : roll < 0.85 ? 3 : 4;

  setTimeout(() => {
    const engine = CoinPhysicsEngine.getInstance();
    engine.spawnBurst(chestX, chestY, payout, undefined, 20);
  }, 400);

  return true;
}

/**
 * Returns the timestamp of the last tally pour trigger.
 * Queried by station canvas renderer for hopper tilt and strike-bar reciprocating animations.
 */
export function getLastTallyPourTime(stationId?: string): number {
  if (stationId && lastPourTimes.has(stationId)) {
    return lastPourTimes.get(stationId)!;
  }
  return lastGlobalPourTime;
}

/**
 * Resets state timers (useful for unit tests and room transitions).
 */
export function resetTallyBoardState(stationId?: string): void {
  if (stationId) {
    lastPourTimes.delete(stationId);
  } else {
    lastPourTimes.clear();
    lastGlobalPourTime = 0;
  }
}
