import { WorldState, ProjectItem, SpecimenItem } from './types';
import { STORAGE_KEY, INITIAL_SEED_STATE, TILE_SIZE } from './constants';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export class StateManager {
  private static instance: StateManager;
  private state: WorldState;
  private listeners: Array<(state: WorldState) => void> = [];

  private constructor() {
    this.state = this.loadAndEvolveState();
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  public getState(): WorldState {
    return this.state;
  }

  public subscribe(listener: (state: WorldState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.state));
    this.persist();
  }

  private loadAndEvolveState(): WorldState {
    const raw = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (!raw) {
      const fresh = deepClone(INITIAL_SEED_STATE);
      fresh.time.createdAt = now;
      fresh.time.lastVisitedAt = now;
      fresh.time.currentVirtualTime = now;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }

    try {
      const parsed: WorldState = JSON.parse(raw);
      // Merge with initial seed state to ensure newly added schema fields exist
      const merged: WorldState = {
        ...deepClone(INITIAL_SEED_STATE),
        ...parsed,
        time: {
          ...INITIAL_SEED_STATE.time,
          ...parsed.time,
        },
        player: {
          ...INITIAL_SEED_STATE.player,
          ...parsed.player,
        },
        companion: {
          ...INITIAL_SEED_STATE.companion,
          ...parsed.companion,
        },
        environment: {
          ...INITIAL_SEED_STATE.environment,
          ...parsed.environment,
        },
        memories: parsed.memories?.length ? parsed.memories : deepClone(INITIAL_SEED_STATE.memories),
        projects: parsed.projects?.length ? parsed.projects : deepClone(INITIAL_SEED_STATE.projects),
        specimens: parsed.specimens?.length ? parsed.specimens : deepClone(INITIAL_SEED_STATE.specimens),
        encounters: parsed.encounters || { history: [] },
      };

      const elapsedSeconds = Math.max(0, Math.floor((now - merged.time.lastVisitedAt) / 1000));
      merged.time.elapsedAwaySeconds = elapsedSeconds;
      merged.time.totalVisits = (merged.time.totalVisits || 1) + 1;
      merged.time.lastVisitedAt = now;
      merged.time.currentVirtualTime = now;

      // Evolve world based on elapsed time away
      this.evolveWorld(merged, elapsedSeconds, false);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } catch (err) {
      console.warn('Failed to parse saved state, resetting to initial seed:', err);
      const fresh = deepClone(INITIAL_SEED_STATE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
  }

  private evolveWorld(state: WorldState, elapsedSeconds: number, isSimulated: boolean = false) {
    if (elapsedSeconds <= 0) return;

    // 1. Advance active projects
    state.projects.forEach((proj: ProjectItem) => {
      if (proj.status === 'running') {
        const deltaProgress = elapsedSeconds / proj.durationSeconds;
        proj.progress = Math.min(1.0, proj.progress + deltaProgress);

        if (proj.progress >= 1.0) {
          proj.status = 'completed';
          proj.completedAt = Date.now();
          proj.visualState = 'stress_contours';

          // Companion prepares to approach player on next opportune moment
          state.companion.pendingRemark = {
            text: `The ${proj.name} mesh convergence simulation has finished. Stress concentrations across the dome are quite telling.`,
            trigger: 'simulation_finished',
            presenceLevel: 3, // Rare approach level
          };
          state.companion.speech = {
            text: "The simulation finished.",
            timestamp: Date.now(),
            durationMs: 6000,
          };
        } else if (proj.progress > 0.8) {
          proj.visualState = 'mesh_dense';
        }
      }
    });

    // 2. Newly discovered specimen placed on pedestal if user discovered it on prior visit
    const newlyDiscovered = state.specimens.find(
      (s: SpecimenItem) => s.discovered && !s.onPedestal && s.id === 'spec_prenocephale'
    );
    if (newlyDiscovered && (elapsedSeconds > 60 || isSimulated)) {
      newlyDiscovered.onPedestal = true;
      state.environment.activePedestalSpecimenId = newlyDiscovered.id;

      // Position companion admiring the new display pedestal
      state.companion.location = 'cabinet';
      state.companion.x = 15 * TILE_SIZE;
      state.companion.y = 4 * TILE_SIZE;
      state.companion.facing = 'down';
      state.companion.activity = 'examining_fossil';
      state.companion.pendingRemark = {
        text: `I put the ${newlyDiscovered.name} out on the pedestal for closer study.`,
        trigger: 'fossil_displayed',
        presenceLevel: 2, // Subtle invitation
      };
      state.companion.speech = {
        text: "I put this one out.",
        timestamp: Date.now(),
        durationMs: 5000,
      };
    }

    // 3. If elapsed time is substantial (> 1 day), subtle room shifts
    if (elapsedSeconds > 86400 || (isSimulated && elapsedSeconds >= 86400)) {
      state.environment.chalkboardEquation = 'σ_ij = λ δ_ij ε_kk + 2μ ε_ij  [Isotropic Strain]';
      if (!state.companion.pendingRemark && state.companion.speech === null) {
        state.companion.speech = {
          text: "Welcome back. It's been quiet here.",
          timestamp: Date.now(),
          durationMs: 4000,
        };
      }
    }
  }

  public persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  public syncPlayerPosition(x: number, y: number, facing: WorldState['player']['facing']) {
    this.state.player.x = x;
    this.state.player.y = y;
    this.state.player.facing = facing;
  }

  public updatePlayer(x: number, y: number, facing: WorldState['player']['facing']) {
    this.syncPlayerPosition(x, y, facing);
    this.persist();
  }

  public updateCompanion(updater: (companion: WorldState['companion']) => void) {
    updater(this.state.companion);
    this.notify();
  }

  public unlockMemory(memoryId: string) {
    const mem = this.state.memories.find((m) => m.id === memoryId);
    if (mem) {
      mem.unlocked = true;
      mem.lastRecalledAt = Date.now();
      this.state.environment.bookOpenOnRug = true;
      this.recordEncounter('memory', memoryId, `Recalled memory: ${mem.title}`);
      this.notify();
    }
  }

  public discoverSpecimen(specimenId: string) {
    const spec = this.state.specimens.find((s) => s.id === specimenId);
    if (spec) {
      spec.discovered = true;
      spec.highlightNew = false;
      this.recordEncounter('discovery', specimenId, `Explored specimen: ${spec.name}`);
      // Companion notices quietly
      if (!this.state.companion.discussedItems.includes(specimenId)) {
        this.state.companion.discussedItems.push(specimenId);
      }
      this.notify();
    }
  }

  public updateProjectEvaluation(projectId: string, userAnswer: string, feedback: string) {
    const proj = this.state.projects.find((p) => p.id === projectId);
    if (proj) {
      proj.lastEvaluation = {
        userAnswer,
        evaluationText: feedback,
        evaluatedAt: Date.now(),
      };
      this.recordEncounter('training', projectId, `Trained on ${proj.name}: ${userAnswer.slice(0, 40)}...`);
      this.notify();
    }
  }

  public recordEncounter(type: WorldState['encounters']['history'][0]['type'], targetId: string, summary: string) {
    this.state.encounters.history.unshift({
      id: 'enc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type,
      targetId,
      timestamp: Date.now(),
      summary,
    });
    // Keep last 50 encounters
    if (this.state.encounters.history.length > 50) {
      this.state.encounters.history.pop();
    }
  }

  // --- Dev / Time Machine Controls ---

  public simulateTimeFastForward(seconds: number) {
    this.state.time.currentVirtualTime += seconds * 1000;
    this.state.time.elapsedAwaySeconds += seconds;
    this.evolveWorld(this.state, seconds, true);
    this.notify();
  }

  public completeActiveSimulation() {
    this.state.projects.forEach((p) => {
      if (p.status === 'running') {
        p.progress = 1.0;
        p.status = 'completed';
        p.completedAt = Date.now();
        p.visualState = 'stress_contours';
      }
    });
    this.state.companion.pendingRemark = {
      text: "The FEA simulation finished. The stress concentrations around the dome are quite telling.",
      trigger: 'simulation_finished',
      presenceLevel: 3,
    };
    this.state.companion.speech = {
      text: "The simulation finished.",
      timestamp: Date.now(),
      durationMs: 6000,
    };
    this.notify();
  }

  public setRoomId(roomId: string) {
    this.state.currentRoomId = roomId;
    this.persist();
    this.notify();
  }

  public setState(updater: (prev: WorldState) => WorldState) {
    this.state = updater(this.state);
    this.persist();
    this.notify();
  }

  public resetWorld() {
    const fresh = deepClone(INITIAL_SEED_STATE);
    const now = Date.now();
    fresh.time.createdAt = now;
    fresh.time.lastVisitedAt = now;
    fresh.time.currentVirtualTime = now;
    this.state = fresh;
    this.notify();
  }
}
