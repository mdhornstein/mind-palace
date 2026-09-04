import { WorldStation, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { drawTelescope } from '../../../render/sprites';
import { openTelescopeModal } from '../../../ui/telescopeModal';

export const telescopeStation: WorldStation = {
  id: 'telescope',
  name: 'Great Refractor Telescope',
  prompt: 'Look Through Eyepiece',
  tileX: 8.5,
  tileY: 6.0,
  tileWidth: 3.2,
  tileHeight: 2.8,
  collisionBox: {
    x: 8.8 * TILE_SIZE,
    y: 6.4 * TILE_SIZE,
    w: 2.4 * TILE_SIZE,
    h: 1.8 * TILE_SIZE,
  },
  approachPoint: {
    x: 10.0 * TILE_SIZE,
    y: 9.0 * TILE_SIZE,
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: WorldState) => {
    drawTelescope(
      ctx,
      8.5 * TILE_SIZE,
      6.0 * TILE_SIZE,
      3.2 * TILE_SIZE,
      2.8 * TILE_SIZE,
      timeMs
    );
  },
  onInteract: (stateManager: any, _overlay: any) => {
    openTelescopeModal(stateManager);
  },
};
