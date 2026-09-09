import {
  WorldState,
  Direction,
  MemoryItem,
  ProjectItem,
  SpecimenItem,
  ExplorationTopic,
  EncounterRecord,
  CompanionState,
  CompanionLocation,
  CompanionActivity,
  CompanionSpeech,
  PendingRemark,
  RoomEnvironment,
} from './types';

function isValidDirection(dir: unknown): dir is Direction {
  return dir === 'up' || dir === 'down' || dir === 'left' || dir === 'right';
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function isCompanionLocation(loc: unknown): loc is CompanionLocation {
  return (
    loc === 'reading_nook' ||
    loc === 'cabinet' ||
    loc === 'desk' ||
    loc === 'fireplace' ||
    loc === 'wandering'
  );
}

function isCompanionActivity(act: unknown): act is CompanionActivity {
  return (
    act === 'reading' ||
    act === 'writing' ||
    act === 'examining_fossil' ||
    act === 'contemplating' ||
    act === 'observing_player'
  );
}

function isPresenceLevel(lvl: unknown): lvl is CompanionState['presenceLevel'] {
  return lvl === 0 || lvl === 1 || lvl === 2 || lvl === 3;
}

function isPendingRemarkPresenceLevel(lvl: unknown): lvl is PendingRemark['presenceLevel'] {
  return lvl === 1 || lvl === 2 || lvl === 3;
}

export function isCompanionSpeech(val: unknown): val is CompanionSpeech {
  if (!isPlainObject(val)) return false;
  return (
    typeof val.text === 'string' &&
    typeof val.timestamp === 'number' &&
    Number.isFinite(val.timestamp) &&
    typeof val.durationMs === 'number' &&
    Number.isFinite(val.durationMs)
  );
}

export function isPendingRemark(val: unknown): val is PendingRemark {
  if (!isPlainObject(val)) return false;
  const validTriggers = [
    'simulation_finished',
    'fossil_displayed',
    'returned_after_days',
    'book_left_open',
    'generic',
  ];
  return (
    typeof val.text === 'string' &&
    typeof val.trigger === 'string' &&
    validTriggers.includes(val.trigger) &&
    isPendingRemarkPresenceLevel(val.presenceLevel)
  );
}

export function isMemoryItem(val: unknown): val is MemoryItem {
  if (!isPlainObject(val)) return false;
  return (
    typeof val.id === 'string' &&
    typeof val.targetObjectId === 'string' &&
    typeof val.title === 'string' &&
    (val.subtitle === undefined || typeof val.subtitle === 'string') &&
    typeof val.date === 'string' &&
    typeof val.snippet === 'string' &&
    Array.isArray(val.fullContent) &&
    val.fullContent.every((c) => typeof c === 'string') &&
    Array.isArray(val.tags) &&
    val.tags.every((t) => typeof t === 'string') &&
    typeof val.unlocked === 'boolean' &&
    (val.lastRecalledAt === undefined ||
      (typeof val.lastRecalledAt === 'number' && Number.isFinite(val.lastRecalledAt)))
  );
}

export function isProjectItem(val: unknown): val is ProjectItem {
  if (!isPlainObject(val)) return false;
  const validStatuses = ['running', 'paused', 'completed'];
  const validVisualStates = ['wireframe_rough', 'mesh_dense', 'stress_contours', 'optimized'];

  if (
    typeof val.id !== 'string' ||
    typeof val.name !== 'string' ||
    typeof val.subtitle !== 'string' ||
    typeof val.category !== 'string' ||
    typeof val.description !== 'string' ||
    typeof val.status !== 'string' ||
    !validStatuses.includes(val.status) ||
    typeof val.progress !== 'number' ||
    !Number.isFinite(val.progress) ||
    typeof val.durationSeconds !== 'number' ||
    !Number.isFinite(val.durationSeconds) ||
    (val.completedAt !== undefined &&
      (typeof val.completedAt !== 'number' || !Number.isFinite(val.completedAt))) ||
    typeof val.visualState !== 'string' ||
    !validVisualStates.includes(val.visualState)
  ) {
    return false;
  }

  if (!isPlainObject(val.trainingPrompt)) return false;
  const tp = val.trainingPrompt;
  if (
    typeof tp.question !== 'string' ||
    typeof tp.context !== 'string' ||
    !Array.isArray(tp.referenceKeywords) ||
    !tp.referenceKeywords.every((k) => typeof k === 'string')
  ) {
    return false;
  }

  if (val.lastEvaluation !== undefined) {
    if (!isPlainObject(val.lastEvaluation)) return false;
    const le = val.lastEvaluation;
    if (
      typeof le.userAnswer !== 'string' ||
      typeof le.evaluationText !== 'string' ||
      typeof le.evaluatedAt !== 'number' ||
      !Number.isFinite(le.evaluatedAt)
    ) {
      return false;
    }
  }

  return true;
}

export function isExplorationTopic(val: unknown): val is ExplorationTopic {
  if (!isPlainObject(val)) return false;
  return (
    typeof val.id === 'string' &&
    typeof val.label === 'string' &&
    typeof val.teaser === 'string' &&
    typeof val.content === 'string'
  );
}

export function isSpecimenItem(val: unknown): val is SpecimenItem {
  if (!isPlainObject(val)) return false;
  return (
    typeof val.id === 'string' &&
    typeof val.name === 'string' &&
    typeof val.scientificName === 'string' &&
    typeof val.classification === 'string' &&
    typeof val.period === 'string' &&
    typeof val.region === 'string' &&
    typeof val.description === 'string' &&
    typeof val.discovered === 'boolean' &&
    typeof val.onPedestal === 'boolean' &&
    (val.highlightNew === undefined || typeof val.highlightNew === 'boolean') &&
    Array.isArray(val.topics) &&
    val.topics.every(isExplorationTopic)
  );
}

export function isEncounterRecord(val: unknown): val is EncounterRecord {
  if (!isPlainObject(val)) return false;
  const validTypes = ['memory', 'training', 'discovery', 'companion'];
  return (
    typeof val.id === 'string' &&
    typeof val.type === 'string' &&
    validTypes.includes(val.type) &&
    typeof val.targetId === 'string' &&
    typeof val.timestamp === 'number' &&
    Number.isFinite(val.timestamp) &&
    typeof val.summary === 'string'
  );
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
    createdAt:
      typeof rawTime?.createdAt === 'number' && Number.isFinite(rawTime.createdAt)
        ? rawTime.createdAt
        : seedState.time.createdAt,
    lastVisitedAt:
      typeof rawTime?.lastVisitedAt === 'number' && Number.isFinite(rawTime.lastVisitedAt)
        ? rawTime.lastVisitedAt
        : seedState.time.lastVisitedAt,
    currentVirtualTime:
      typeof rawTime?.currentVirtualTime === 'number' && Number.isFinite(rawTime.currentVirtualTime)
        ? rawTime.currentVirtualTime
        : seedState.time.currentVirtualTime,
    elapsedAwaySeconds:
      typeof rawTime?.elapsedAwaySeconds === 'number' && Number.isFinite(rawTime.elapsedAwaySeconds)
        ? rawTime.elapsedAwaySeconds
        : 0,
    totalVisits:
      typeof rawTime?.totalVisits === 'number' && Number.isFinite(rawTime.totalVisits)
        ? rawTime.totalVisits
        : 1,
  };

  // 3. Player
  const rawPlayer = isPlainObject(raw.player) ? raw.player : null;
  if (!rawPlayer && raw.player !== undefined) {
    console.warn('[migrateState] Malformed "player" object in persisted state; using seed defaults.');
  }
  const player = {
    x:
      typeof rawPlayer?.x === 'number' && Number.isFinite(rawPlayer.x)
        ? rawPlayer.x
        : seedState.player.x,
    y:
      typeof rawPlayer?.y === 'number' && Number.isFinite(rawPlayer.y)
        ? rawPlayer.y
        : seedState.player.y,
    facing: isValidDirection(rawPlayer?.facing) ? rawPlayer.facing : seedState.player.facing,
  };

  // 4. Companion
  const rawComp = isPlainObject(raw.companion) ? raw.companion : null;
  if (!rawComp && raw.companion !== undefined) {
    console.warn('[migrateState] Malformed "companion" object in persisted state; using seed defaults.');
  }

  let companionDiscussedItems: string[];
  if (rawComp?.discussedItems === undefined) {
    companionDiscussedItems = structuredClone(seedState.companion.discussedItems);
  } else if (
    Array.isArray(rawComp.discussedItems) &&
    rawComp.discussedItems.every((x) => typeof x === 'string')
  ) {
    companionDiscussedItems = rawComp.discussedItems;
  } else {
    console.warn('[migrateState] Malformed "companion.discussedItems", resetting to empty array.');
    companionDiscussedItems = [];
  }

  const location = isCompanionLocation(rawComp?.location)
    ? rawComp.location
    : (rawComp?.location !== undefined &&
        console.warn(`[migrateState] Malformed "companion.location" (${String(rawComp.location)}); defaulting.`),
      seedState.companion.location);

  const activity = isCompanionActivity(rawComp?.activity)
    ? rawComp.activity
    : (rawComp?.activity !== undefined &&
        console.warn(`[migrateState] Malformed "companion.activity" (${String(rawComp.activity)}); defaulting.`),
      seedState.companion.activity);

  const presenceLevel = isPresenceLevel(rawComp?.presenceLevel)
    ? rawComp.presenceLevel
    : (rawComp?.presenceLevel !== undefined &&
        console.warn('[migrateState] Malformed "companion.presenceLevel"; defaulting.'),
      seedState.companion.presenceLevel);

  let speech: CompanionSpeech | null;
  if (rawComp?.speech === null) {
    speech = null;
  } else if (isCompanionSpeech(rawComp?.speech)) {
    speech = rawComp.speech;
  } else {
    if (rawComp?.speech !== undefined) {
      console.warn('[migrateState] Malformed "companion.speech"; defaulting to seed.');
    }
    speech = seedState.companion.speech;
  }

  let pendingRemark: PendingRemark | null;
  if (rawComp?.pendingRemark === null) {
    pendingRemark = null;
  } else if (isPendingRemark(rawComp?.pendingRemark)) {
    pendingRemark = rawComp.pendingRemark;
  } else {
    if (rawComp?.pendingRemark !== undefined) {
      console.warn('[migrateState] Malformed "companion.pendingRemark"; defaulting to seed.');
    }
    pendingRemark = seedState.companion.pendingRemark;
  }

  const companion: CompanionState = {
    name: typeof rawComp?.name === 'string' ? rawComp.name : seedState.companion.name,
    role: typeof rawComp?.role === 'string' ? rawComp.role : seedState.companion.role,
    x:
      typeof rawComp?.x === 'number' && Number.isFinite(rawComp.x)
        ? rawComp.x
        : seedState.companion.x,
    y:
      typeof rawComp?.y === 'number' && Number.isFinite(rawComp.y)
        ? rawComp.y
        : seedState.companion.y,
    facing: isValidDirection(rawComp?.facing) ? rawComp.facing : seedState.companion.facing,
    location,
    activity,
    presenceLevel,
    speech,
    pendingRemark,
    discussedItems: companionDiscussedItems,
    lastNoticedPlayerAt:
      typeof rawComp?.lastNoticedPlayerAt === 'number' &&
      Number.isFinite(rawComp.lastNoticedPlayerAt)
        ? rawComp.lastNoticedPlayerAt
        : seedState.companion.lastNoticedPlayerAt,
  };

  // 5. Environment
  const rawEnv = isPlainObject(raw.environment) ? raw.environment : null;
  if (!rawEnv && raw.environment !== undefined) {
    console.warn('[migrateState] Malformed "environment" object in persisted state; using seed defaults.');
  }

  const ambientLight =
    rawEnv?.ambientLight === 'day' ||
    rawEnv?.ambientLight === 'evening' ||
    rawEnv?.ambientLight === 'night'
      ? rawEnv.ambientLight
      : (rawEnv?.ambientLight !== undefined &&
          console.warn('[migrateState] Malformed "environment.ambientLight"; defaulting.'),
        seedState.environment.ambientLight);

  const activePedestalSpecimenId =
    typeof rawEnv?.activePedestalSpecimenId === 'string' ||
    rawEnv?.activePedestalSpecimenId === null
      ? rawEnv.activePedestalSpecimenId
      : seedState.environment.activePedestalSpecimenId;

  const environment: RoomEnvironment = {
    bookOpenOnRug:
      typeof rawEnv?.bookOpenOnRug === 'boolean'
        ? rawEnv.bookOpenOnRug
        : seedState.environment.bookOpenOnRug,
    activePedestalSpecimenId,
    chalkboardEquation:
      typeof rawEnv?.chalkboardEquation === 'string'
        ? rawEnv.chalkboardEquation
        : seedState.environment.chalkboardEquation,
    fireplaceLit:
      typeof rawEnv?.fireplaceLit === 'boolean'
        ? rawEnv.fireplaceLit
        : seedState.environment.fireplaceLit,
    ambientLight,
  };

  // 6. Collections (Distinguish missing from valid empty arrays & structurally validate elements)
  // Memories
  let memories: MemoryItem[];
  if (raw.memories === undefined) {
    memories = structuredClone(seedState.memories);
  } else if (Array.isArray(raw.memories) && raw.memories.every(isMemoryItem)) {
    memories = raw.memories;
  } else {
    console.warn(
      '[migrateState] Malformed "memories" collection in persisted state; using seed defaults.'
    );
    memories = structuredClone(seedState.memories);
  }

  // Projects
  let projects: ProjectItem[];
  if (raw.projects === undefined) {
    projects = structuredClone(seedState.projects);
  } else if (Array.isArray(raw.projects) && raw.projects.every(isProjectItem)) {
    projects = raw.projects;
  } else {
    console.warn(
      '[migrateState] Malformed "projects" collection in persisted state; using seed defaults.'
    );
    projects = structuredClone(seedState.projects);
  }

  // Specimens
  let specimens: SpecimenItem[];
  if (raw.specimens === undefined) {
    specimens = structuredClone(seedState.specimens);
  } else if (Array.isArray(raw.specimens) && raw.specimens.every(isSpecimenItem)) {
    specimens = raw.specimens;
  } else {
    console.warn(
      '[migrateState] Malformed "specimens" collection in persisted state; using seed defaults.'
    );
    specimens = structuredClone(seedState.specimens);
  }

  // Encounters
  const rawEncounters = isPlainObject(raw.encounters) ? raw.encounters : null;
  let history: EncounterRecord[];
  if (rawEncounters?.history === undefined) {
    history = [];
  } else if (
    Array.isArray(rawEncounters.history) &&
    rawEncounters.history.every(isEncounterRecord)
  ) {
    history = rawEncounters.history;
  } else {
    console.warn('[migrateState] Malformed "encounters.history", resetting to empty.');
    history = [];
  }

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
