import { WorldState, ProjectItem, SpecimenItem } from './types';
import { TILE_SIZE } from './constants';

export interface SimulationInput {
  elapsedSeconds: number;
  currentTime: number;
}

/**
 * Pure, deterministic world simulation.
 * Advances the world state according to elapsedSeconds and currentTime without side-effects.
 * Does NOT mutate the input state; returns a new WorldState instance.
 */
export function evolveWorld(
  state: WorldState,
  input: SimulationInput
): WorldState {
  // Always create an isolated clone to ensure purity and no in-place mutation of input
  const next: WorldState = structuredClone(state);

  if (input.elapsedSeconds <= 0) {
    return next;
  }

  const { elapsedSeconds, currentTime } = input;

  // 1. Advance active projects
  next.projects = next.projects.map((proj: ProjectItem) => {
    if (proj.status !== 'running') {
      return proj;
    }

    const updatedProj: ProjectItem = { ...proj };
    const deltaProgress = elapsedSeconds / updatedProj.durationSeconds;
    updatedProj.progress = Math.min(1.0, updatedProj.progress + deltaProgress);

    if (updatedProj.progress >= 1.0) {
      updatedProj.status = 'completed';
      updatedProj.completedAt = currentTime;
      updatedProj.visualState = 'stress_contours';

      // Companion prepares remark
      next.companion = {
        ...next.companion,
        pendingRemark: {
          text: `The ${updatedProj.name} mesh convergence simulation has finished. Stress concentrations across the dome are quite telling.`,
          trigger: 'simulation_finished',
          presenceLevel: 3,
        },
        speech: {
          text: 'The simulation finished.',
          timestamp: currentTime,
          durationMs: 6000,
        },
      };
    } else if (updatedProj.progress > 0.8) {
      updatedProj.visualState = 'mesh_dense';
    }

    return updatedProj;
  });

  // 2. Newly discovered specimen placed on pedestal if user discovered it on prior visit
  const newlyDiscoveredIdx = next.specimens.findIndex(
    (s: SpecimenItem) => s.discovered && !s.onPedestal && s.id === 'spec_prenocephale'
  );

  if (newlyDiscoveredIdx !== -1 && elapsedSeconds > 60) {
    const newlyDiscovered = { ...next.specimens[newlyDiscoveredIdx], onPedestal: true };
    next.specimens = [
      ...next.specimens.slice(0, newlyDiscoveredIdx),
      newlyDiscovered,
      ...next.specimens.slice(newlyDiscoveredIdx + 1),
    ];

    next.environment = {
      ...next.environment,
      activePedestalSpecimenId: newlyDiscovered.id,
    };

    next.companion = {
      ...next.companion,
      location: 'cabinet',
      x: 15 * TILE_SIZE,
      y: 4 * TILE_SIZE,
      facing: 'down',
      activity: 'examining_fossil',
      pendingRemark: {
        text: `I put the ${newlyDiscovered.name} out on the pedestal for closer study.`,
        trigger: 'fossil_displayed',
        presenceLevel: 2,
      },
      speech: {
        text: 'I put this one out.',
        timestamp: currentTime,
        durationMs: 5000,
      },
    };
  }

  // 3. Substantial elapsed time (> 1 day): subtle chalkboard update and greeting
  if (elapsedSeconds >= 86400) {
    next.environment = {
      ...next.environment,
      chalkboardEquation: 'σ_ij = λ δ_ij ε_kk + 2μ ε_ij  [Isotropic Strain]',
    };

    if (!next.companion.pendingRemark && next.companion.speech === null) {
      next.companion = {
        ...next.companion,
        speech: {
          text: "Welcome back. It's been quiet here.",
          timestamp: currentTime,
          durationMs: 4000,
        },
      };
    }
  }

  return next;
}
