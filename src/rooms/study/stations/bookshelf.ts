import { WorldStation, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { drawBookshelf } from '../../../render/sprites';
import { openLibraryModal } from '../../../ui/libraryModal';

export const bookshelfStation: WorldStation = {
  id: 'library',
  name: 'The Library',
  prompt: 'Inspect Bookshelf & Memories',
  tileX: 1.5,
  tileY: 1.0,
  tileWidth: 4.0,
  tileHeight: 2.5,
  collisionBox: {
    x: 1.5 * TILE_SIZE,
    y: 1.2 * TILE_SIZE,
    w: 4.0 * TILE_SIZE,
    h: 2.2 * TILE_SIZE,
  },
  approachPoint: {
    x: 3.5 * TILE_SIZE,
    y: 3.5 * TILE_SIZE,
  },
  draw: (ctx: CanvasRenderingContext2D, _timeMs: number, _state: WorldState) => {
    drawBookshelf(ctx, 1.5 * TILE_SIZE, 1.0 * TILE_SIZE, 4.0 * TILE_SIZE, 2.5 * TILE_SIZE);
  },
  onInteract: (stateManager: any, _overlay: any) => {
    openLibraryModal(stateManager);
  },
};
