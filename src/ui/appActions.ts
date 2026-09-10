import { InteractionDispatcher } from './interactionDispatcher';
import { executeMintCrankPress, MintCrankParams } from '../rooms/coins/coinMachineActions';

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
 * Registers application gameplay action handlers with the generic InteractionDispatcher.
 * Maintained in the application/composition layer so that room modules remain purely
 * declarative and free of UI imports.
 */
export function registerApplicationActions(): void {
  InteractionDispatcher.registerAction('mint_crank_press', (intent) => {
    const params = parseMintCrankParams(intent.params);
    executeMintCrankPress(params);
  });
}
