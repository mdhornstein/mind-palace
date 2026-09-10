import { InteractionDispatcher } from './interactionDispatcher';
import { executeMintCrankPress, MintCrankParams } from '../rooms/coins/coinMachineActions';
import { executeRingingStoneStrike, RingingStoneParams } from '../rooms/coins/ringingStoneActions';

/**
 * Validates and normalizes parameters for the "mint_crank_press" custom action.
 * Conforms to the strict parameter contract pattern established in InteractionDispatcher.
 * Fails loudly on unknown keys or invalid types rather than trusting unchecked casts.
 */
export function parseMintCrankParams(
  raw?: Record<string, string | number | boolean>
): MintCrankParams | undefined {
  if (!raw) return undefined;

  const allowedKeys = ['originX', 'originY', 'originZ', 'stationId'];
  for (const key of Object.keys(raw)) {
    if (!allowedKeys.includes(key)) {
      throw new Error(
        `[appActions] Unknown parameter "${key}" for action "mint_crank_press"`
      );
    }
  }

  const params: MintCrankParams = {};

  if (raw.originX !== undefined) {
    if (typeof raw.originX !== 'number' || !Number.isFinite(raw.originX)) {
      throw new Error(
        `[appActions] Invalid originX parameter for "mint_crank_press": expected finite number, got ${typeof raw.originX}`
      );
    }
    params.originX = raw.originX;
  }

  if (raw.originY !== undefined) {
    if (typeof raw.originY !== 'number' || !Number.isFinite(raw.originY)) {
      throw new Error(
        `[appActions] Invalid originY parameter for "mint_crank_press": expected finite number, got ${typeof raw.originY}`
      );
    }
    params.originY = raw.originY;
  }

  if (raw.originZ !== undefined) {
    if (typeof raw.originZ !== 'number' || !Number.isFinite(raw.originZ)) {
      throw new Error(
        `[appActions] Invalid originZ parameter for "mint_crank_press": expected finite number, got ${typeof raw.originZ}`
      );
    }
    params.originZ = raw.originZ;
  }

  if (raw.stationId !== undefined) {
    if (typeof raw.stationId !== 'string' || raw.stationId.trim().length === 0) {
      throw new Error(
        `[appActions] Invalid stationId parameter for "mint_crank_press": expected non-empty string`
      );
    }
    params.stationId = raw.stationId;
  }

  return params;
}

/**
 * Validates and normalizes parameters for the "strike_ringing_stone" custom action.
 */
export function parseRingingStoneParams(
  raw?: Record<string, string | number | boolean>
): RingingStoneParams | undefined {
  if (!raw) return undefined;

  const allowedKeys = ['stationId'];
  for (const key of Object.keys(raw)) {
    if (!allowedKeys.includes(key)) {
      throw new Error(
        `[appActions] Unknown parameter "${key}" for action "strike_ringing_stone"`
      );
    }
  }

  const params: RingingStoneParams = {};

  if (raw.stationId !== undefined) {
    if (typeof raw.stationId !== 'string' || raw.stationId.trim().length === 0) {
      throw new Error(
        `[appActions] Invalid stationId parameter for "strike_ringing_stone": expected non-empty string`
      );
    }
    params.stationId = raw.stationId;
  }

  return params;
}

/**
 * Registers application gameplay action handlers with the generic InteractionDispatcher.
 * Maintained in the application/composition layer so that room modules remain purely
 * declarative and free of UI imports.
 */
export function registerApplicationActions(): void {
  InteractionDispatcher.registerAction('mint_crank_press', (intent) => {
    const params = parseMintCrankParams(intent.params);
    executeMintCrankPress(params);
  });

  InteractionDispatcher.registerAction('strike_ringing_stone', (intent) => {
    const params = parseRingingStoneParams(intent.params);
    executeRingingStoneStrike(params);
  });
}

