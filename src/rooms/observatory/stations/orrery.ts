import { WorldStation, WorldState, DeepReadonly } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { drawOrrery } from '../../../render/sprites';
import { openOrreryModal } from '../../../ui/orreryModal';

export const orreryStation: WorldStation = {
  id: 'orrery',
  name: 'Mechanical Clockwork Orrery',
  prompt: 'Examine Heliocentric Gearwork',
  tileX: 14.5,
  tileY: 6.8,
  tileWidth: 3.5,
  tileHeight: 2.2,
  collisionBox: {
    x: 14.5 * TILE_SIZE,
    y: 6.8 * TILE_SIZE,
    w: 3.5 * TILE_SIZE,
    h: 2.2 * TILE_SIZE,
  },
  approachPoint: {
    x: 16.0 * TILE_SIZE,
    y: 9.6 * TILE_SIZE,
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
    drawOrrery(
      ctx,
      14.5 * TILE_SIZE,
      6.8 * TILE_SIZE,
      3.5 * TILE_SIZE,
      2.2 * TILE_SIZE,
      timeMs
    );
  },
  onInteract: (stateManager: any, _overlay: any) => {
    openOrreryModal(stateManager);
  },
};
