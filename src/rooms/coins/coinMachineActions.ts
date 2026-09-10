import { CoinPhysicsEngine } from './coinPhysics';

/**
 * Coin Room Gameplay Module
 *
 * Encapsulates the physical gameplay behavior of the coin machines, keeping
 * the InteractionDispatcher purely as a router and station definitions purely declarative.
 */

// Machine emission configuration
const MINT_CHUTE_X = 224;
const MINT_CHUTE_Y = 144;
const MINT_CHUTE_Z = 28;

// Throttle cooldown (ms) allowing rapid, rhythmic arcade mashing without UI locking
const CRANK_COOLDOWN_MS = 140;
let lastCrankTime = 0;

// State tracking for external animation/visual effects
let lastCrankTriggerTime = 0;

/**
 * Executes an in-world crank of the Grand Minting Engine.
 * Spawns a physical spray of 2–4 bouncing coins from the machine's chute.
 *
 * @returns true if coins were stamped and ejected; false if throttled by cooldown.
 */
export function executeMintCrankPress(now: number = Date.now()): boolean {
  if (now - lastCrankTime < CRANK_COOLDOWN_MS) {
    return false;
  }
  lastCrankTime = now;
  lastCrankTriggerTime = now;

  const engine = CoinPhysicsEngine.getInstance();

  // Randomized burst of 2–4 coins per crank for dynamic gameplay feel
  // 50% chance of 2 coins, 35% chance of 3 coins, 15% chance of 4 coins
  const roll = Math.random();
  const coinCount = roll < 0.50 ? 2 : roll < 0.85 ? 3 : 4;

  // Small randomized lateral origin offset to simulate ejection spread from the chute mouth
  const originX = MINT_CHUTE_X + (Math.random() * 8 - 4);
  const originY = MINT_CHUTE_Y + (Math.random() * 4 - 2);

  engine.spawnBurst(originX, originY, coinCount, undefined, MINT_CHUTE_Z);
  return true;
}

/**
 * Returns the timestamp of the last successful crank trigger.
 * Can be used by station renderers to add extra steam puffs or piston recoil.
 */
export function getLastCrankTriggerTime(): number {
  return lastCrankTriggerTime;
}

/**
 * Resets cooldown timers (useful for unit tests).
 */
export function resetMintCrankCooldown(): void {
  lastCrankTime = 0;
  lastCrankTriggerTime = 0;
}
