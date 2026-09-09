import { WorldState, Direction } from './types';

function isValidDirection(dir: unknown): dir is Direction {
  return dir === 'up' || dir === 'down' || dir === 'left' || dir === 'right';
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/**
 * Pure schema validation and versioned migration.
 * Distinguishes missing fields (filled from seed), valid fields (preserved,
 * including empty arrays), and malformed fields (logged and safely recovered).
 */
export function migrateState(raw: unknown, seedState: WorldState): WorldState {
  if (!isPlainObject(raw)) {
    if (raw !== null && raw !== undefined) {
      console.warn('[migrateState] Persisted state is not a valid object, resetting to seed.');
    }
    return structuredClone(seedState);
  }

  // Handle version upgrades in the future if raw.version < targetVersion
  // Currently version = 1
  const version = typeof raw.version === 'number' ? raw.version : 1;

  // 1. Current Room ID
  const currentRoomId =
    typeof raw.currentRoomId === 'string' && raw.currentRoomId.trim().length > 0
      ? raw.currentRoomId
      : seedState.currentRoomId;

  // 2. Time
  const rawTime = isPlainObject(raw.time) ? raw.time : null;
  if (!rawTime && raw.time !== undefined) {
    console.warn('[migrateState] Malformed "time" object in persisted state; using seed defaults.');
  }
  const time = {
    createdAt: typeof rawTime?.createdAt === 'number' ? rawTime.createdAt : seedState.time.createdAt,
    lastVisitedAt: typeof rawTime?.lastVisitedAt === 'number' ? rawTime.lastVisitedAt : seedState.time.lastVisitedAt,
    currentVirtualTime:
      typeof rawTime?.currentVirtualTime === 'number' ? rawTime.currentVirtualTime : seedState.time.currentVirtualTime,
    elapsedAwaySeconds:
      typeof rawTime?.elapsedAwaySeconds === 'number' ? rawTime.elapsedAwaySeconds : 0,
    totalVisits: typeof rawTime?.totalVisits === 'number' ? rawTime.totalVisits : 1,
  };

  // 3. Player
  const rawPlayer = isPlainObject(raw.player) ? raw.player : null;
  if (!rawPlayer && raw.player !== undefined) {
    console.warn('[migrateState] Malformed "player" object in persisted state; using seed defaults.');
  }
  const player = {
    x: typeof rawPlayer?.x === 'number' && Number.isFinite(rawPlayer.x) ? rawPlayer.x : seedState.player.x,
    y: typeof rawPlayer?.y === 'number' && Number.isFinite(rawPlayer.y) ? rawPlayer.y : seedState.player.y,
    facing: isValidDirection(rawPlayer?.facing) ? rawPlayer.facing : seedState.player.facing,
  };

  // 4. Companion
  const rawComp = isPlainObject(raw.companion) ? raw.companion : null;
  if (!rawComp && raw.companion !== undefined) {
    console.warn('[migrateState] Malformed "companion" object in persisted state; using seed defaults.');
  }
  const companionDiscussedItems = Array.isArray(rawComp?.discussedItems)
    ? (rawComp.discussedItems as string[])
    : rawComp?.discussedItems === undefined
    ? structuredClone(seedState.companion.discussedItems)
    : (console.warn('[migrateState] Malformed "companion.discussedItems", resetting.'), []);

  const companion = {
    name: typeof rawComp?.name === 'string' ? rawComp.name : seedState.companion.name,
    role: typeof rawComp?.role === 'string' ? rawComp.role : seedState.companion.role,
    x: typeof rawComp?.x === 'number' && Number.isFinite(rawComp.x) ? rawComp.x : seedState.companion.x,
    y: typeof rawComp?.y === 'number' && Number.isFinite(rawComp.y) ? rawComp.y : seedState.companion.y,
    facing: isValidDirection(rawComp?.facing) ? rawComp.facing : seedState.companion.facing,
    location: (rawComp?.location as any) || seedState.companion.location,
    activity: (rawComp?.activity as any) || seedState.companion.activity,
    presenceLevel: (typeof rawComp?.presenceLevel === 'number' ? rawComp.presenceLevel : seedState.companion.presenceLevel) as any,
    speech: isPlainObject(rawComp?.speech) || rawComp?.speech === null ? (rawComp?.speech as any) : seedState.companion.speech,
    pendingRemark: isPlainObject(rawComp?.pendingRemark) || rawComp?.pendingRemark === null ? (rawComp?.pendingRemark as any) : seedState.companion.pendingRemark,
    discussedItems: companionDiscussedItems,
    lastNoticedPlayerAt:
      typeof rawComp?.lastNoticedPlayerAt === 'number' ? rawComp.lastNoticedPlayerAt : seedState.companion.lastNoticedPlayerAt,
  };

  // 5. Environment
  const rawEnv = isPlainObject(raw.environment) ? raw.environment : null;
  if (!rawEnv && raw.environment !== undefined) {
    console.warn('[migrateState] Malformed "environment" object in persisted state; using seed defaults.');
  }
  const environment = {
    bookOpenOnRug: typeof rawEnv?.bookOpenOnRug === 'boolean' ? rawEnv.bookOpenOnRug : seedState.environment.bookOpenOnRug,
    activePedestalSpecimenId:
      typeof rawEnv?.activePedestalSpecimenId === 'string' || rawEnv?.activePedestalSpecimenId === null
        ? rawEnv.activePedestalSpecimenId
        : seedState.environment.activePedestalSpecimenId,
    chalkboardEquation:
      typeof rawEnv?.chalkboardEquation === 'string' ? rawEnv.chalkboardEquation : seedState.environment.chalkboardEquation,
    fireplaceLit: typeof rawEnv?.fireplaceLit === 'boolean' ? rawEnv.fireplaceLit : seedState.environment.fireplaceLit,
    ambientLight:
      rawEnv?.ambientLight === 'day' || rawEnv?.ambientLight === 'evening' || rawEnv?.ambientLight === 'night'
        ? rawEnv.ambientLight
        : seedState.environment.ambientLight,
  };

  // 6. Collections (Distinguish missing from valid empty arrays!)
  // Memories
  const memories = Array.isArray(raw.memories)
    ? (raw.memories as any)
    : raw.memories === undefined
    ? structuredClone(seedState.memories)
    : (console.warn('[migrateState] Malformed "memories" array in persisted state; using seed defaults.'), structuredClone(seedState.memories));

  // Projects
  const projects = Array.isArray(raw.projects)
    ? (raw.projects as any)
    : raw.projects === undefined
    ? structuredClone(seedState.projects)
    : (console.warn('[migrateState] Malformed "projects" array in persisted state; using seed defaults.'), structuredClone(seedState.projects));

  // Specimens
  const specimens = Array.isArray(raw.specimens)
    ? (raw.specimens as any)
    : raw.specimens === undefined
    ? structuredClone(seedState.specimens)
    : (console.warn('[migrateState] Malformed "specimens" array in persisted state; using seed defaults.'), structuredClone(seedState.specimens));

  // Encounters
  const rawEncounters = isPlainObject(raw.encounters) ? raw.encounters : null;
  const history = Array.isArray(rawEncounters?.history)
    ? (rawEncounters.history as any)
    : (rawEncounters?.history !== undefined && console.warn('[migrateState] Malformed "encounters.history", resetting to empty.'), []);

  return {
    version,
    currentRoomId,
    time,
    player,
    companion,
    environment,
    memories,
    projects,
    specimens,
    encounters: {
      history,
    },
  };
}
