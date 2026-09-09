import { WorldStation, WorldState, DeepReadonly } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { drawWorkshop } from '../../../render/sprites';
import { openWorkshopModal } from '../../../ui/workshopModal';

export const workstationStation: WorldStation = {
  id: 'workshop',
  name: 'Science Workstation',
  prompt: 'Inspect FEA Project & Skull',
  tileX: 10.8,
  tileY: 9.5,
  tileWidth: 7.6,
  tileHeight: 2.7,
  collisionBox: {
    x: 10.8 * TILE_SIZE,
    y: 9.0 * TILE_SIZE,
    w: 7.6 * TILE_SIZE,
    h: 2.8 * TILE_SIZE,
  },
  approachPoint: {
    x: 14.8 * TILE_SIZE,
    y: 12.2 * TILE_SIZE,
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, state: DeepReadonly<WorldState>) => {
    const activeProject = state.projects[0];
    drawWorkshop(
      ctx,
      10.8 * TILE_SIZE,
      9.5 * TILE_SIZE,
      7.6 * TILE_SIZE,
      2.7 * TILE_SIZE,
      activeProject,
      state.environment.chalkboardEquation,
      timeMs
    );
  },
  onInteract: (stateManager: any, _overlay: any) => {
    openWorkshopModal(stateManager);
  },
};
