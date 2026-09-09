import { WorldState, ProjectItem, DeepReadonly } from './types';
import { STORAGE_KEY, INITIAL_SEED_STATE } from './constants';
import { Clock, SystemClock } from './clock';
import { StateStore, LocalStorageStore } from './store';
import { evolveWorld } from './simulation';
import { migrateState } from './migrations';

export class StateManager {
  private static instance: StateManager | null = null;
  private state: WorldState;
  private listeners: Array<(state: DeepReadonly<WorldState>) => void> = [];
  private store: StateStore;
  private clock: Clock;

  public constructor(store?: StateStore, clock?: Clock) {
    this.store = store || new LocalStorageStore(STORAGE_KEY);
    this.clock = clock || new SystemClock();
    this.state = this.loadAndEvolveState();
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  /**
   * Reset the singleton instance with optional custom store & clock (useful for isolated tests).
   */
  public static resetInstance(store?: StateStore, clock?: Clock): StateManager {
    StateManager.instance = new StateManager(store, clock);
    return StateManager.instance;
  }

  /**
   * Returns a DeepReadonly view of the world state.
   * Consumers cannot mutate state properties directly.
   */
  public getState(): DeepReadonly<WorldState> {
    return this.state;
  }

  /**
   * Transitional convenience method returning a deep clone of the current state.
   */
  public getClonedState(): WorldState {
    return structuredClone(this.state);
  }

  public subscribe(listener: (state: DeepReadonly<WorldState>) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public persist(): void {
    this.store.save(this.state);
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.state));
    this.persist();
  }

  private loadAndEvolveState(): WorldState {
    const raw = this.store.load();
    const now = this.clock.now();

    // Pure schema validation & migration
    const migrated = migrateState(raw, INITIAL_SEED_STATE);

    if (!raw) {
      migrated.time.createdAt = now;
      migrated.time.lastVisitedAt = now;
      migrated.time.currentVirtualTime = now;
      this.store.save(migrated);
      return migrated;
    }

    const elapsedSeconds = Math.max(0, Math.floor((now - migrated.time.lastVisitedAt) / 1000));
    migrated.time.elapsedAwaySeconds = elapsedSeconds;
    migrated.time.totalVisits = (migrated.time.totalVisits || 1) + 1;
    migrated.time.lastVisitedAt = now;
    migrated.time.currentVirtualTime = now;

    // Pure world simulation evolution
    const evolved = evolveWorld(migrated, { elapsedSeconds, currentTime: now });

    this.store.save(evolved);
    return evolved;
  }

  public syncPlayerPosition(x: number, y: number, facing: WorldState['player']['facing']): void {
    this.state = {
      ...this.state,
      player: {
        ...this.state.player,
        x,
        y,
        facing,
      },
    };
  }

  public updatePlayer(x: number, y: number, facing: WorldState['player']['facing']): void {
    this.syncPlayerPosition(x, y, facing);
    this.persist();
  }

  public updateCompanion(updater: (companion: WorldState['companion']) => void): void {
    const clonedCompanion = structuredClone(this.state.companion);
    updater(clonedCompanion);
    this.state = {
      ...this.state,
      companion: clonedCompanion,
    };
    this.notify();
  }

  public unlockMemory(memoryId: string): void {
    const memIdx = this.state.memories.findIndex((m) => m.id === memoryId);
    if (memIdx !== -1) {
      const now = this.clock.now();
      const updatedMem = {
        ...this.state.memories[memIdx],
        unlocked: true,
        lastRecalledAt: now,
      };

      const updatedMemories = [
        ...this.state.memories.slice(0, memIdx),
        updatedMem,
        ...this.state.memories.slice(memIdx + 1),
      ];

      this.state = {
        ...this.state,
        memories: updatedMemories,
        environment: {
          ...this.state.environment,
          bookOpenOnRug: true,
        },
      };

      this.recordEncounter('memory', memoryId, `Recalled memory: ${updatedMem.title}`);
      this.notify();
    }
  }

  public discoverSpecimen(specimenId: string): void {
    const specIdx = this.state.specimens.findIndex((s) => s.id === specimenId);
    if (specIdx !== -1) {
      const updatedSpec = {
        ...this.state.specimens[specIdx],
        discovered: true,
        highlightNew: false,
      };

      const updatedSpecimens = [
        ...this.state.specimens.slice(0, specIdx),
        updatedSpec,
        ...this.state.specimens.slice(specIdx + 1),
      ];

      const discussed = this.state.companion.discussedItems.includes(specimenId)
        ? this.state.companion.discussedItems
        : [...this.state.companion.discussedItems, specimenId];

      this.state = {
        ...this.state,
        specimens: updatedSpecimens,
        companion: {
          ...this.state.companion,
          discussedItems: discussed,
        },
      };

      this.recordEncounter('discovery', specimenId, `Explored specimen: ${updatedSpec.name}`);
      this.notify();
    }
  }

  public updateProjectEvaluation(projectId: string, userAnswer: string, feedback: string): void {
    const projIdx = this.state.projects.findIndex((p) => p.id === projectId);
    if (projIdx !== -1) {
      const now = this.clock.now();
      const updatedProj: ProjectItem = {
        ...this.state.projects[projIdx],
        lastEvaluation: {
          userAnswer,
          evaluationText: feedback,
          evaluatedAt: now,
        },
      };

      this.state = {
        ...this.state,
        projects: [
          ...this.state.projects.slice(0, projIdx),
          updatedProj,
          ...this.state.projects.slice(projIdx + 1),
        ],
      };

      this.recordEncounter('training', projectId, `Trained on ${updatedProj.name}: ${userAnswer.slice(0, 40)}...`);
      this.notify();
    }
  }

  public recordEncounter(
    type: WorldState['encounters']['history'][0]['type'],
    targetId: string,
    summary: string
  ): void {
    const now = this.clock.now();
    const newEncounter = {
      id: 'enc_' + now + '_' + Math.random().toString(36).substring(2, 6),
      type,
      targetId,
      timestamp: now,
      summary,
    };

    const updatedHistory = [newEncounter, ...this.state.encounters.history].slice(0, 50);

    this.state = {
      ...this.state,
      encounters: {
        history: updatedHistory,
      },
    };
  }

  // --- Dev / Time Machine Controls ---

  public simulateTimeFastForward(seconds: number): void {
    const nextVirtualTime = this.state.time.currentVirtualTime + seconds * 1000;
    const nextElapsedAway = this.state.time.elapsedAwaySeconds + seconds;

    const evolved = evolveWorld(this.state, {
      elapsedSeconds: seconds,
      currentTime: nextVirtualTime,
    });

    evolved.time.currentVirtualTime = nextVirtualTime;
    evolved.time.elapsedAwaySeconds = nextElapsedAway;

    this.state = evolved;
    this.notify();
  }

  public completeActiveSimulation(): void {
    const now = this.clock.now();
    const updatedProjects = this.state.projects.map((p) => {
      if (p.status === 'running') {
        return {
          ...p,
          progress: 1.0,
          status: 'completed' as const,
          completedAt: now,
          visualState: 'stress_contours' as const,
        };
      }
      return p;
    });

    this.state = {
      ...this.state,
      projects: updatedProjects,
      companion: {
        ...this.state.companion,
        pendingRemark: {
          text: 'The FEA simulation finished. The stress concentrations around the dome are quite telling.',
          trigger: 'simulation_finished',
          presenceLevel: 3,
        },
        speech: {
          text: 'The simulation finished.',
          timestamp: now,
          durationMs: 6000,
        },
      },
    };

    this.notify();
  }

  public setRoomId(roomId: string): void {
    this.state = {
      ...this.state,
      currentRoomId: roomId,
    };
    this.notify();
  }

  public setState(updater: (prev: WorldState) => WorldState): void {
    this.state = updater(structuredClone(this.state));
    this.notify();
  }

  public resetWorld(): void {
    const fresh = structuredClone(INITIAL_SEED_STATE);
    const now = this.clock.now();
    fresh.time.createdAt = now;
    fresh.time.lastVisitedAt = now;
    fresh.time.currentVirtualTime = now;
    this.state = fresh;
    this.notify();
  }
}
