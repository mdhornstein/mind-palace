import { WorldStation, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { drawTelescope } from '../../../render/sprites';
import { openTelescopeModal } from '../../../ui/telescopeModal';

export const telescopeStation: WorldStation = {
  id: 'telescope',
  name: 'Great Refractor Telescope',
  prompt: 'Look Through Eyepiece',
  tileX: 8.5,
  tileY: 4.8,
  tileWidth: 3.2,
  tileHeight: 2.8,
  collisionBox: {
    x: 8.5 * TILE_SIZE,
    y: 5.2 * TILE_SIZE,
    w: 3.2 * TILE_SIZE,
    h: 2.4 * TILE_SIZE,
  },
  approachPoint: {
    x: 10.0 * TILE_SIZE,
    y: 8.2 * TILE_SIZE,
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: WorldState) => {
    drawTelescope(
      ctx,
      8.5 * TILE_SIZE,
      4.8 * TILE_SIZE,
      3.2 * TILE_SIZE,
      2.8 * TILE_SIZE,
      timeMs
    );
  },
  onInteract: (stateManager: any, _overlay: any) => {
    openTelescopeModal(stateManager);
  },
};
