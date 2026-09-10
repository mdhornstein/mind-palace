import { HearthAudio } from '../../sound/audio';

/**
 * Ringing Stone Gameplay Action Module
 *
 * Encapsulates the acoustic sounding stone gameplay state for the Royal Mint.
 * Does not import from the UI layer to maintain strict architectural domain boundaries.
 */

export interface RingingStoneParams {
  stationId?: string;
}

// Throttle cooldown (ms) preventing audio clipping while permitting rapid musical tapping
const STONE_STRIKE_COOLDOWN_MS = 90;
// Reset interval (ms): after 2.5 seconds of silence, the musical scale resets back to root
const SCALE_RESET_INTERVAL_MS = 2500;

const lastStrikeTimes: Map<string, number> = new Map();
let lastStrikeTriggerTime = 0;

const stationNoteIndices: Map<string, number> = new Map();
let lastGlobalNoteIndex = 0;

/**
 * Executes a mechanical strike on the Assayer's Ringing Stone.
 * Synthesizes the authentic ringing resonance of sterling silver or crown gold.
 * Consecutive strikes within 2.5s advance up the pentatonic harmonic scale.
 *
 * @returns true if the strike was sounded; false if throttled.
 */
export function executeRingingStoneStrike(
  params?: RingingStoneParams,
  now: number = Date.now()
): boolean {
  const stationKey = params?.stationId || 'default';
  const lastTime = lastStrikeTimes.get(stationKey);

  if (lastTime !== undefined && now - lastTime < STONE_STRIKE_COOLDOWN_MS) {
    return false;
  }

  // If time elapsed since last strike exceeds threshold, reset scale to 0; otherwise advance
  let currentNoteIndex = stationNoteIndices.get(stationKey) ?? 0;
  if (lastTime === undefined || now - lastTime > SCALE_RESET_INTERVAL_MS) {
    currentNoteIndex = 0;
  } else {
    currentNoteIndex += 1;
  }

  lastStrikeTimes.set(stationKey, now);
  lastStrikeTriggerTime = now;
  stationNoteIndices.set(stationKey, currentNoteIndex);
  lastGlobalNoteIndex = currentNoteIndex;

  // Trigger high-fidelity crystalline bell chime synthesis
  HearthAudio.getInstance().playRingingStoneChime(currentNoteIndex);

  return true;
}

/**
 * Returns the timestamp of the last strike on the sounding stone.
 * Queried by the station renderer for hammer recoil and soundwave ripple animations.
 */
export function getLastStoneStrikeTime(stationId?: string): number {
  if (stationId && lastStrikeTimes.has(stationId)) {
    return lastStrikeTimes.get(stationId)!;
  }
  return lastStrikeTriggerTime;
}

/**
 * Returns the current note index in the musical scale sequence.
 */
export function getStoneNoteIndex(stationId?: string): number {
  if (stationId && stationNoteIndices.has(stationId)) {
    return stationNoteIndices.get(stationId)!;
  }
  return lastGlobalNoteIndex;
}

/**
 * Resets state timers and note counters (useful for unit tests and room transitions).
 */
export function resetRingingStoneState(stationId?: string): void {
  if (stationId) {
    lastStrikeTimes.delete(stationId);
    stationNoteIndices.delete(stationId);
  } else {
    lastStrikeTimes.clear();
    stationNoteIndices.clear();
    lastStrikeTriggerTime = 0;
    lastGlobalNoteIndex = 0;
  }
}
