import { describe, it, expect, vi } from 'vitest';
import { migrateState } from '../../src/core/migrations';
import { StateManager } from '../../src/core/state';
import { MemoryStore } from '../../src/core/store';
import { Clock } from '../../src/core/clock';
import { INITIAL_SEED_STATE } from '../../src/core/constants';
import { WorldState, DeepReadonly } from '../../src/core/types';

class MockClock implements Clock {
  constructor(public currentTime: number) {}
  now(): number {
    return this.currentTime;
  }
}

describe('migrateState', () => {
  it('preserves empty collections and distinguishes empty arrays from missing ones', () => {
    const rawWithEmptyCollections = {
      version: 1,
      currentRoomId: 'study',
      memories: [],
      projects: [],
      specimens: [],
      encounters: {
        history: [],
      },
      companion: {
        discussedItems: [],
      },
    };

    const migrated = migrateState(rawWithEmptyCollections, INITIAL_SEED_STATE);

    // Collections must be preserved as empty arrays, NOT restored from INITIAL_SEED_STATE!
    expect(migrated.memories).toEqual([]);
    expect(migrated.projects).toEqual([]);
    expect(migrated.specimens).toEqual([]);
    expect(migrated.encounters.history).toEqual([]);
    expect(migrated.companion.discussedItems).toEqual([]);
  });

  it('populates missing fields from INITIAL_SEED_STATE when undefined', () => {
    const rawEmpty = {};

    const migrated = migrateState(rawEmpty, INITIAL_SEED_STATE);

    expect(migrated.currentRoomId).toBe(INITIAL_SEED_STATE.currentRoomId);
    expect(migrated.memories.length).toBe(INITIAL_SEED_STATE.memories.length);
    expect(migrated.projects.length).toBe(INITIAL_SEED_STATE.projects.length);
    expect(migrated.specimens.length).toBe(INITIAL_SEED_STATE.specimens.length);
    expect(migrated.player.x).toBe(INITIAL_SEED_STATE.player.x);
  });

  it('safely recovers from malformed fields with fallback to seed and console warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const malformedRaw = {
      version: 'invalid_version',
      memories: 'not-an-array',
      projects: 12345,
      specimens: null,
      player: 'walkin-around',
      time: true,
      companion: {
        discussedItems: 'should-be-array',
        x: 'not-a-number',
      },
    };

    const migrated = migrateState(malformedRaw, INITIAL_SEED_STATE);

    expect(warnSpy).toHaveBeenCalled();
    expect(migrated.memories.length).toBe(INITIAL_SEED_STATE.memories.length);
    expect(migrated.projects.length).toBe(INITIAL_SEED_STATE.projects.length);
    expect(migrated.specimens.length).toBe(INITIAL_SEED_STATE.specimens.length);
    expect(migrated.player.x).toBe(INITIAL_SEED_STATE.player.x);
    expect(migrated.companion.discussedItems).toEqual([]);

    warnSpy.mockRestore();
  });

  it('preserves valid collection items when structurally sound', () => {
    const singleMemory = {
      id: 'custom_mem_1',
      targetObjectId: 'bookshelf',
      title: 'Structural Geology Notes',
      subtitle: 'Field Observations',
      date: '1904',
      snippet: 'Observations on fold geometry.',
      fullContent: ['Detailed notes on anticlines.'],
      tags: ['geology'],
      unlocked: true,
      lastRecalledAt: 1234567,
    };

    const raw = {
      version: 1,
      memories: [singleMemory],
    };

    const migrated = migrateState(raw, INITIAL_SEED_STATE);
    expect(migrated.memories).toEqual([singleMemory]);
  });

  it('rejects arrays with malformed collection elements (e.g. [42, null], [{}]) and safely defaults with warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const rawWithMalformedItems = {
      version: 1,
      memories: [42, 'garbage', null],
      projects: [{}],
      specimens: [{ id: 'partial_spec' }],
      encounters: {
        history: ['not-an-encounter-record', 99],
      },
    };

    const migrated = migrateState(rawWithMalformedItems, INITIAL_SEED_STATE);

    expect(warnSpy).toHaveBeenCalled();
    // Memories, projects, specimens fall back to valid seed collections
    expect(migrated.memories).toEqual(INITIAL_SEED_STATE.memories);
    expect(migrated.projects).toEqual(INITIAL_SEED_STATE.projects);
    expect(migrated.specimens).toEqual(INITIAL_SEED_STATE.specimens);
    // Encounter history safely defaults to empty array
    expect(migrated.encounters.history).toEqual([]);

    warnSpy.mockRestore();
  });

  it('validates nested companion fields and recovers from malformed unions and speech/pendingRemark objects', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const rawWithMalformedCompanion = {
      version: 1,
      companion: {
        location: 'spaceship', // invalid union
        activity: 'eating_pizza', // invalid union
        presenceLevel: 99, // invalid presenceLevel
        speech: { banana: true }, // invalid speech shape
        pendingRemark: { trigger: 'flying_saucer' }, // invalid trigger & missing presenceLevel
      },
    };

    const migrated = migrateState(rawWithMalformedCompanion, INITIAL_SEED_STATE);

    expect(warnSpy).toHaveBeenCalled();
    expect(migrated.companion.location).toBe(INITIAL_SEED_STATE.companion.location);
    expect(migrated.companion.activity).toBe(INITIAL_SEED_STATE.companion.activity);
    expect(migrated.companion.presenceLevel).toBe(INITIAL_SEED_STATE.companion.presenceLevel);
    expect(migrated.companion.speech).toBe(INITIAL_SEED_STATE.companion.speech);
    expect(migrated.companion.pendingRemark).toBe(INITIAL_SEED_STATE.companion.pendingRemark);

    warnSpy.mockRestore();
  });

  it('accepts structurally valid speech, pendingRemark, and nulls on companion', () => {
    const rawWithValidCompanion = {
      version: 1,
      companion: {
        location: 'cabinet',
        activity: 'examining_fossil',
        presenceLevel: 2,
        speech: {
          text: 'Notice the texture.',
          timestamp: 5000,
          durationMs: 4000,
        },
        pendingRemark: {
          text: 'Remark queued.',
          trigger: 'fossil_displayed',
          presenceLevel: 2,
        },
      },
    };

    const migrated = migrateState(rawWithValidCompanion, INITIAL_SEED_STATE);
    expect(migrated.companion.location).toBe('cabinet');
    expect(migrated.companion.activity).toBe('examining_fossil');
    expect(migrated.companion.presenceLevel).toBe(2);
    expect(migrated.companion.speech?.text).toBe('Notice the texture.');
    expect(migrated.companion.pendingRemark?.trigger).toBe('fossil_displayed');
  });

  it('validates environment ambientLight and recovers from invalid values', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const raw = {
      version: 1,
      environment: {
        ambientLight: 'disco_lights',
      },
    };

    const migrated = migrateState(raw, INITIAL_SEED_STATE);
    expect(warnSpy).toHaveBeenCalled();
    expect(migrated.environment.ambientLight).toBe(INITIAL_SEED_STATE.environment.ambientLight);

    warnSpy.mockRestore();
  });

  it('returns cloned INITIAL_SEED_STATE when raw data is not a plain object', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(migrateState(null, INITIAL_SEED_STATE)).toEqual(INITIAL_SEED_STATE);
    expect(migrateState(undefined, INITIAL_SEED_STATE)).toEqual(INITIAL_SEED_STATE);
    expect(migrateState('corrupted_string', INITIAL_SEED_STATE)).toEqual(INITIAL_SEED_STATE);
    expect(migrateState([1, 2, 3], INITIAL_SEED_STATE)).toEqual(INITIAL_SEED_STATE);

    warnSpy.mockRestore();
  });
});

describe('StateManager', () => {
  it('initializes headlessly with MemoryStore and MockClock', () => {
    const store = new MemoryStore();
    const clock = new MockClock(1700000000000);
    const stateManager = new StateManager(store, clock);

    const state = stateManager.getState();
    expect(state).toBeDefined();
    expect(state.currentRoomId).toBe('study');
    expect(state.time.createdAt).toBe(1700000000000);
    expect(state.time.lastVisitedAt).toBe(1700000000000);
  });

  it('publishes state updates immutably and notifies subscribers', () => {
    const store = new MemoryStore();
    const clock = new MockClock(1700000000000);
    const stateManager = new StateManager(store, clock);

    const notifications: DeepReadonly<WorldState>[] = [];
    const unsubscribe = stateManager.subscribe((s) => notifications.push(s));

    const initial = stateManager.getState();
    stateManager.setRoomId('observatory');
    const updated = stateManager.getState();

    expect(notifications.length).toBe(1);
    expect(updated).not.toBe(initial); // Immutable replacement
    expect(updated.currentRoomId).toBe('observatory');

    unsubscribe();
    stateManager.setRoomId('study');
    expect(notifications.length).toBe(1); // No new notification after unsubscribe
  });

  it('persists and restores state across multiple sessions via StateStore', () => {
    const store = new MemoryStore();
    const clock = new MockClock(1700000000000);

    // Session 1: User interacts and unlocks a memory
    const session1 = new StateManager(store, clock);
    const firstMemId = session1.getState().memories[0].id;
    session1.unlockMemory(firstMemId);

    const unlockedMem = session1.getState().memories.find((m) => m.id === firstMemId);
    expect(unlockedMem?.unlocked).toBe(true);
    expect(unlockedMem?.lastRecalledAt).toBe(1700000000000);

    // Session 2: User returns 120 seconds later
    clock.currentTime += 120 * 1000;
    const session2 = new StateManager(store, clock);
    const loadedState = session2.getState();

    expect(loadedState.time.totalVisits).toBe(2);
    expect(loadedState.time.elapsedAwaySeconds).toBe(120);

    const loadedMem = loadedState.memories.find((m) => m.id === firstMemId);
    expect(loadedMem?.unlocked).toBe(true);
    expect(loadedMem?.lastRecalledAt).toBe(1700000000000);
  });

  it('simulates running project progress during elapsed absence between sessions', () => {
    const store = new MemoryStore();
    const clock = new MockClock(1700000000000);

    const session1 = new StateManager(store, clock);
    const projId = session1.getState().projects[0].id;
    // Set project running with 50s duration and 0 initial progress
    session1.setState((s) => ({
      ...s,
      projects: s.projects.map((p) =>
        p.id === projId ? { ...p, status: 'running', progress: 0, durationSeconds: 50 } : p
      ),
    }));

    // User leaves and returns 60 seconds later (longer than duration)
    clock.currentTime += 60 * 1000;
    const session2 = new StateManager(store, clock);
    const proj = session2.getState().projects.find((p) => p.id === projId);

    expect(proj?.status).toBe('completed');
    expect(proj?.progress).toBe(1.0);
    expect(session2.getState().companion.speech?.text).toBe('The simulation finished.');
  });
});
