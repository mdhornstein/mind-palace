import { describe, it, expect } from 'vitest';
import { evolveWorld } from '../../src/core/simulation';
import { INITIAL_SEED_STATE } from '../../src/core/constants';
import { WorldState, ProjectItem, SpecimenItem } from '../../src/core/types';

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    const prop = (obj as Record<string, unknown>)[key];
    if (typeof prop === 'object' && prop !== null && !Object.isFrozen(prop)) {
      deepFreeze(prop);
    }
  }
  return obj;
}

describe('evolveWorld', () => {
  it('is deterministic: identical inputs yield identical outputs', () => {
    const inputState: WorldState = structuredClone(INITIAL_SEED_STATE);
    const simInput = { elapsedSeconds: 30, currentTime: 1700000000000 };

    const result1 = evolveWorld(inputState, simInput);
    const result2 = evolveWorld(inputState, simInput);

    expect(result1).toEqual(result2);
    expect(result1).not.toBe(result2); // New reference
  });

  it('is purely functional and does not mutate the input state (deeply frozen)', () => {
    const inputState: WorldState = deepFreeze(structuredClone(INITIAL_SEED_STATE));
    const snapshotBefore = JSON.stringify(inputState);

    const result = evolveWorld(inputState, { elapsedSeconds: 100, currentTime: 1700000000000 });

    const snapshotAfter = JSON.stringify(inputState);
    expect(snapshotBefore).toBe(snapshotAfter);
    expect(result).not.toBe(inputState);
  });

  it('advances running projects proportionally and triggers completion remarks', () => {
    const inputState: WorldState = structuredClone(INITIAL_SEED_STATE);
    // Find or setup running project
    const project: ProjectItem = {
      id: 'test_proj',
      name: 'Dome FEA Simulation',
      subtitle: 'Finite Element Analysis',
      category: 'Biomechanics',
      description: 'Test FEA',
      status: 'running',
      progress: 0.9,
      durationSeconds: 100,
      visualState: 'wireframe_rough',
      trainingPrompt: {
        question: 'Q',
        context: 'C',
        referenceKeywords: ['k'],
      },
    };
    inputState.projects = [project];

    // Advance 5 seconds: (0.9 + 5/100) = 0.95 (still running)
    const midResult = evolveWorld(inputState, { elapsedSeconds: 5, currentTime: 1000 });
    expect(midResult.projects[0].status).toBe('running');
    expect(midResult.projects[0].progress).toBeCloseTo(0.95);
    expect(midResult.projects[0].visualState).toBe('mesh_dense');

    // Advance another 10 seconds: (0.95 + 10/100) = 1.05 -> clamped to 1.0, completed
    const completedResult = evolveWorld(midResult, { elapsedSeconds: 10, currentTime: 2000 });
    expect(completedResult.projects[0].status).toBe('completed');
    expect(completedResult.projects[0].progress).toBe(1.0);
    expect(completedResult.projects[0].visualState).toBe('stress_contours');
    expect(completedResult.projects[0].completedAt).toBe(2000);
    expect(completedResult.companion.pendingRemark?.trigger).toBe('simulation_finished');
    expect(completedResult.companion.speech?.text).toBe('The simulation finished.');
  });

  it('places newly discovered prenocephale specimen on pedestal after elapsed time > 60s', () => {
    const inputState: WorldState = structuredClone(INITIAL_SEED_STATE);
    const prenocephale: SpecimenItem = {
      id: 'spec_prenocephale',
      name: 'Prenocephale prenes',
      scientificName: 'Prenocephale prenes',
      classification: 'Pachycephalosauridae',
      period: 'Late Cretaceous',
      region: 'Mongolia',
      description: 'Cranial dome specimen',
      discovered: true,
      onPedestal: false,
      topics: [],
    };
    inputState.specimens = [prenocephale];

    // Less than 60 seconds: does NOT place on pedestal
    const shortResult = evolveWorld(inputState, { elapsedSeconds: 30, currentTime: 5000 });
    expect(shortResult.specimens[0].onPedestal).toBe(false);

    // Over 60 seconds: places on pedestal and triggers companion announcement
    const placedResult = evolveWorld(inputState, { elapsedSeconds: 61, currentTime: 10000 });
    expect(placedResult.specimens[0].onPedestal).toBe(true);
    expect(placedResult.environment.activePedestalSpecimenId).toBe('spec_prenocephale');
    expect(placedResult.companion.pendingRemark?.trigger).toBe('fossil_displayed');
    expect(placedResult.companion.speech?.text).toBe('I put this one out.');
  });

  it('updates chalkboard and greeting if elapsed time exceeds 1 day (86400s)', () => {
    const inputState: WorldState = structuredClone(INITIAL_SEED_STATE);
    inputState.projects = [];
    inputState.companion.speech = null;
    inputState.companion.pendingRemark = null;

    const result = evolveWorld(inputState, { elapsedSeconds: 86401, currentTime: 500000 });
    expect(result.environment.chalkboardEquation).toContain('Isotropic Strain');
    expect(result.companion.speech?.text).toBe("Welcome back. It's been quiet here.");
  });

  it('returns untouched clone when elapsedSeconds <= 0', () => {
    const inputState: WorldState = structuredClone(INITIAL_SEED_STATE);
    const result = evolveWorld(inputState, { elapsedSeconds: 0, currentTime: 1000 });
    expect(result).toEqual(inputState);
  });
});
