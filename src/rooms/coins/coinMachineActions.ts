import { CoinPhysicsEngine } from './coinPhysics';

/**
 * Coin Room Gameplay Module
 *
 * Encapsulates the physical gameplay behavior of the coin machines, keeping
 * the InteractionDispatcher purely as a router and station definitions purely declarative.
 * Does not import from UI layer to respect clean architectural domain boundaries.
 */

export interface MintCrankParams {
  originX?: number;
  originY?: number;
  originZ?: number;
  stationId?: string;
}

// Default fallback emission configuration (used if station does not provide coordinates)
const MINT_DEFAULT_CHUTE_X = 224;
const MINT_DEFAULT_CHUTE_Y = 144;
const MINT_DEFAULT_CHUTE_Z = 28;

// Throttle cooldown (ms) allowing rapid, rhythmic arcade mashing without UI locking
const CRANK_COOLDOWN_MS = 140;

// Per-station and global cooldown tracking
const lastCrankTimes: Map<string, number> = new Map();
let lastCrankTriggerTime = 0;
const lastCrankTriggerTimes: Map<string, number> = new Map();

/**
 * Executes an in-world crank of a minting engine or press.
 * Spawns a physical spray of 2–4 bouncing coins from the machine's chute aperture.
 *
 * Supports both:
 * - executeMintCrankPress(params, now)
 * - executeMintCrankPress(now)
 *
 * @returns true if coins were stamped and ejected; false if throttled by cooldown.
 */
export function executeMintCrankPress(
  paramsOrNow?: MintCrankParams | number,
  maybeNow?: number
): boolean {
  let params: MintCrankParams | undefined;
  let now: number;

  if (typeof paramsOrNow === 'number') {
    now = paramsOrNow;
  } else {
    params = paramsOrNow;
    now = typeof maybeNow === 'number' ? maybeNow : Date.now();
  }

  const stationKey = params?.stationId || 'default';
  const lastTime = lastCrankTimes.get(stationKey);

  if (lastTime !== undefined && now - lastTime < CRANK_COOLDOWN_MS) {
    return false;
  }

  lastCrankTimes.set(stationKey, now);
  lastCrankTriggerTime = now;
  lastCrankTriggerTimes.set(stationKey, now);

  const engine = CoinPhysicsEngine.getInstance();

  // Randomized burst of 2–4 coins per crank for dynamic gameplay feel
  // 50% chance of 2 coins, 35% chance of 3 coins, 15% chance of 4 coins
  const roll = Math.random();
  const coinCount = roll < 0.50 ? 2 : roll < 0.85 ? 3 : 4;

  const targetX = typeof params?.originX === 'number' ? params.originX : MINT_DEFAULT_CHUTE_X;
  const targetY = typeof params?.originY === 'number' ? params.originY : MINT_DEFAULT_CHUTE_Y;
  const targetZ = typeof params?.originZ === 'number' ? params.originZ : MINT_DEFAULT_CHUTE_Z;

  // Small randomized lateral origin offset to simulate ejection spread from the chute mouth
  const originX = targetX + (Math.random() * 8 - 4);
  const originY = targetY + (Math.random() * 4 - 2);

  engine.spawnBurst(originX, originY, coinCount, undefined, targetZ);
  return true;
}

/**
 * Returns the timestamp of the last successful crank trigger.
 * Can be queried with a specific stationId or globally.
 * Used by station renderers to add extra steam puffs or piston recoil.
 */
export function getLastCrankTriggerTime(stationId?: string): number {
  if (stationId && lastCrankTriggerTimes.has(stationId)) {
    return lastCrankTriggerTimes.get(stationId)!;
  }
  return lastCrankTriggerTime;
}

/**
 * Resets cooldown timers (useful for unit tests and room resets).
 */
export function resetMintCrankCooldown(stationId?: string): void {
  if (stationId) {
    lastCrankTimes.delete(stationId);
    lastCrankTriggerTimes.delete(stationId);
  } else {
    lastCrankTimes.clear();
    lastCrankTriggerTimes.clear();
    lastCrankTriggerTime = 0;
  }
}
