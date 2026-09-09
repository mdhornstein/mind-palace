import { WorldStation, WorldState, DeepReadonly } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { Duckephant } from '../../../entities/duckephant';

// Singleton Duckephant entity stationed on the warm right side of the hearth
export const duckephantEntity = new Duckephant(12.5 * TILE_SIZE, 4.5 * TILE_SIZE);

export const duckephantStation: WorldStation = {
  id: 'station_duckephant',
  name: 'The Duckephant',
  prompt: 'Pet & Inspect Chimeric Inhabitant',
  tileX: 11.5,
  tileY: 3.5,
  tileWidth: 2.0,
  tileHeight: 2.0,
  approachPoint: {
    x: 12.5 * TILE_SIZE,
    y: 5.5 * TILE_SIZE,
  },
  draw: (ctx: CanvasRenderingContext2D, _timeMs: number, _state: DeepReadonly<WorldState>) => {
    // Render the woven reed pet mat on the floor (behind characters)
    duckephantEntity.renderHomeMat(ctx);
  },
  intent: {
    type: 'modal',
    modalId: 'duckephant',
  },
};
