import { WorldStation, WorldState, DeepReadonly } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { drawStarChartDesk } from '../../../render/sprites';
import { openStarChartModal } from '../../../ui/starChartModal';

export const starChartStation: WorldStation = {
  id: 'starchart',
  name: 'Celestial Star Chart Table',
  prompt: 'Inspect Astrolabe & Constellations',
  tileX: 1.8,
  tileY: 6.8,
  tileWidth: 3.5,
  tileHeight: 2.2,
  collisionBox: {
    x: 1.8 * TILE_SIZE,
    y: 6.8 * TILE_SIZE,
    w: 3.5 * TILE_SIZE,
    h: 2.2 * TILE_SIZE,
  },
  approachPoint: {
    x: 3.5 * TILE_SIZE,
    y: 9.6 * TILE_SIZE,
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
    drawStarChartDesk(
      ctx,
      1.8 * TILE_SIZE,
      6.8 * TILE_SIZE,
      3.5 * TILE_SIZE,
      2.2 * TILE_SIZE,
      timeMs
    );
  },
  onInteract: (stateManager: any, _overlay: any) => {
    openStarChartModal(stateManager);
  },
};
