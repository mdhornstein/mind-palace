import { WorldStation, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { drawReadingNook } from '../../../render/sprites';
import { openLibraryModal } from '../../../ui/libraryModal';

export const readingNookStation: WorldStation = {
  id: 'reading_nook',
  name: 'Reading Nook',
  prompt: 'Rest in Wingback Chair & Read',
  tileX: 3.5,
  tileY: 5.5,
  tileWidth: 1.8,
  tileHeight: 1.8,
  collisionBox: {
    x: 3.5 * TILE_SIZE,
    y: 5.5 * TILE_SIZE,
    w: 1.8 * TILE_SIZE,
    h: 1.8 * TILE_SIZE,
  },
  approachPoint: {
    x: 5.5 * TILE_SIZE,
    y: 5.8 * TILE_SIZE,
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, state: WorldState) => {
    drawReadingNook(
      ctx,
      3.5 * TILE_SIZE,
      5.5 * TILE_SIZE,
      timeMs,
      state.environment.bookOpenOnRug
    );
  },
  onInteract: (stateManager: any, _overlay: any) => {
    // Reading nook seamlessly connects to library memories
    openLibraryModal(stateManager);
  },
};
