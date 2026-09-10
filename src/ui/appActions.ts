import { InteractionDispatcher } from './interactionDispatcher';
import { executeMintCrankPress, MintCrankParams } from '../rooms/coins/coinMachineActions';
import { executeRingingStoneStrike, RingingStoneParams } from '../rooms/coins/ringingStoneActions';
import { executeGaltonQuickDrop, GaltonQuickDropParams } from '../rooms/coins/galtonChuteActions';
import { executeTallyBoardPour, TallyBoardParams } from '../rooms/coins/tallyBoardActions';
import { executeToggleMasterClutch } from '../rooms/coins/conductorVitrineActions';

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
 * Validates and normalizes parameters for the "plinko_quick_drop" custom action.
 */
export function parsePlinkoQuickDropParams(
  raw?: Record<string, string | number | boolean>
): GaltonQuickDropParams | undefined {
  if (!raw) return undefined;

  const allowedKeys = ['stationId', 'chuteX', 'chuteY'];
  for (const key of Object.keys(raw)) {
    if (!allowedKeys.includes(key)) {
      throw new Error(
        `[appActions] Unknown parameter "${key}" for action "plinko_quick_drop"`
      );
    }
  }

  const params: GaltonQuickDropParams = {};

  if (raw.stationId !== undefined) {
    if (typeof raw.stationId !== 'string' || raw.stationId.trim().length === 0) {
      throw new Error(
        `[appActions] Invalid stationId parameter for "plinko_quick_drop": expected non-empty string`
      );
    }
    params.stationId = raw.stationId;
  }

  if (raw.chuteX !== undefined) {
    if (typeof raw.chuteX !== 'number' || !Number.isFinite(raw.chuteX)) {
      throw new Error(
        `[appActions] Invalid chuteX parameter for "plinko_quick_drop": expected finite number, got ${typeof raw.chuteX}`
      );
    }
    params.chuteX = raw.chuteX;
  }

  if (raw.chuteY !== undefined) {
    if (typeof raw.chuteY !== 'number' || !Number.isFinite(raw.chuteY)) {
      throw new Error(
        `[appActions] Invalid chuteY parameter for "plinko_quick_drop": expected finite number, got ${typeof raw.chuteY}`
      );
    }
    params.chuteY = raw.chuteY;
  }

  return params;
}

/**
 * Validates and normalizes parameters for the "pour_tally_board" custom action.
 */
export function parseTallyBoardParams(
  raw?: Record<string, string | number | boolean>
): TallyBoardParams | undefined {
  if (!raw) return undefined;

  const allowedKeys = ['stationId', 'chestX', 'chestY'];
  for (const key of Object.keys(raw)) {
    if (!allowedKeys.includes(key)) {
      throw new Error(
        `[appActions] Unknown parameter "${key}" for action "pour_tally_board"`
      );
    }
  }

  const params: TallyBoardParams = {};

  if (raw.stationId !== undefined) {
    if (typeof raw.stationId !== 'string' || raw.stationId.trim().length === 0) {
      throw new Error(
        `[appActions] Invalid stationId parameter for "pour_tally_board": expected non-empty string`
      );
    }
    params.stationId = raw.stationId;
  }

  if (raw.chestX !== undefined) {
    if (typeof raw.chestX !== 'number' || !Number.isFinite(raw.chestX)) {
      throw new Error(
        `[appActions] Invalid chestX parameter for "pour_tally_board": expected finite number, got ${typeof raw.chestX}`
      );
    }
    params.chestX = raw.chestX;
  }

  if (raw.chestY !== undefined) {
    if (typeof raw.chestY !== 'number' || !Number.isFinite(raw.chestY)) {
      throw new Error(
        `[appActions] Invalid chestY parameter for "pour_tally_board": expected finite number, got ${typeof raw.chestY}`
      );
    }
    params.chestY = raw.chestY;
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

  InteractionDispatcher.registerAction('plinko_quick_drop', (intent) => {
    const params = parsePlinkoQuickDropParams(intent.params);
    executeGaltonQuickDrop(params);
  });

  InteractionDispatcher.registerAction('pour_tally_board', (intent) => {
    const params = parseTallyBoardParams(intent.params);
    executeTallyBoardPour(params);
  });

  InteractionDispatcher.registerAction('toggle_mint_master_clutch', () => {
    executeToggleMasterClutch();
  });
}



