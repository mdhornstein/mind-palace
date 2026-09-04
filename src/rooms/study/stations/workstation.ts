import { WorldStation, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { drawWorkshop } from '../../../render/sprites';
import { openWorkshopModal } from '../../../ui/workshopModal';

export const workstationStation: WorldStation = {
  id: 'workshop',
  name: 'Science Workstation',
  prompt: 'Inspect FEA Project & Skull',
  tileX: 13.0,
  tileY: 9.5,
  tileWidth: 5.5,
  tileHeight: 3.5,
  collisionBox: {
    x: 13.0 * TILE_SIZE,
    y: 9.5 * TILE_SIZE,
    w: 5.5 * TILE_SIZE,
    h: 3.5 * TILE_SIZE,
  },
  approachPoint: {
    x: 14.5 * TILE_SIZE,
    y: 8.5 * TILE_SIZE,
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, state: WorldState) => {
    const activeProject = state.projects[0];
    drawWorkshop(
      ctx,
      13.0 * TILE_SIZE,
      9.5 * TILE_SIZE,
      5.5 * TILE_SIZE,
      3.5 * TILE_SIZE,
      activeProject,
      state.environment.chalkboardEquation,
      timeMs
    );
  },
  onInteract: (stateManager: any, _overlay: any) => {
    openWorkshopModal(stateManager);
  },
};
