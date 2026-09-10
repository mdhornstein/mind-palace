import { HearthAudio } from '../../sound/audio';
import { MintConductor } from './mintConductor';

/**
 * Conductor's Horological Vitrine Gameplay Action Module
 *
 * Encapsulates the in-world master clutch lever engagement.
 * Throttles rapid lever slamming and coordinates audio with conductor transport state.
 *
 * Zero UI imports to maintain strict architectural domain boundaries.
 */

const CLUTCH_COOLDOWN_MS = 250;
let lastClutchTime: number | null = null;

/**
 * Toggles the master clockwork transport lever.
 * Plays the heavy Victorian mechanical latch clank and engages/disengages the orchestra.
 *
 * @returns true if transport was toggled; false if throttled.
 */
export function executeToggleMasterClutch(now: number = Date.now()): boolean {
  if (lastClutchTime !== null && now - lastClutchTime < CLUTCH_COOLDOWN_MS) {
    return false;
  }

  lastClutchTime = now;

  const conductor = MintConductor.getInstance();
  const isNowRunning = conductor.toggleMasterTransport();

  const audio = HearthAudio.getInstance();
  audio.playClutchLeverThrow(isNowRunning);

  return true;
}

/**
 * Returns the timestamp of the last master clutch throw.
 * Queried by station canvas renderer for the physical lever throw and spring animation.
 */
export function getLastMasterClutchTime(): number {
  return lastClutchTime ?? 0;
}

/**
 * Resets clutch timing state (useful for unit tests).
 */
export function resetMasterClutchState(): void {
  lastClutchTime = null;
}
