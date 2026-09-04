import { WorldStation, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { drawWorkshop } from '../../../render/sprites';
import { openWorkshopModal } from '../../../ui/workshopModal';

export const workstationStation: WorldStation = {
  id: 'workshop',
  name: 'Science Workstation',
  prompt: 'Inspect FEA Project & Skull',
  tileX: 11.8,
  tileY: 9.5,
  tileWidth: 6.5,
  tileHeight: 2.6,
  collisionBox: {
    x: 11.8 * TILE_SIZE,
    y: 9.0 * TILE_SIZE,
    w: 6.5 * TILE_SIZE,
    h: 2.7 * TILE_SIZE,
  },
  approachPoint: {
    x: 15.2 * TILE_SIZE,
    y: 12.2 * TILE_SIZE,
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, state: WorldState) => {
    const activeProject = state.projects[0];
    drawWorkshop(
      ctx,
      11.8 * TILE_SIZE,
      9.5 * TILE_SIZE,
      6.5 * TILE_SIZE,
      2.6 * TILE_SIZE,
      activeProject,
      state.environment.chalkboardEquation,
      timeMs
    );
  },
  onInteract: (stateManager: any, _overlay: any) => {
    openWorkshopModal(stateManager);
  },
};
