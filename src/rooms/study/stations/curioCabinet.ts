import { WorldStation, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { drawFossilCabinet } from '../../../render/sprites';
import { openCabinetModal } from '../../../ui/cabinetModal';

export const curioCabinetStation: WorldStation = {
  id: 'cabinet',
  name: 'The Fossil Cabinet',
  prompt: 'Examine Specimens',
  tileX: 14.0,
  tileY: 1.0,
  tileWidth: 4.0,
  tileHeight: 2.5,
  collisionBox: {
    x: 14.0 * TILE_SIZE,
    y: 1.2 * TILE_SIZE,
    w: 4.0 * TILE_SIZE,
    h: 2.2 * TILE_SIZE,
  },
  approachPoint: {
    x: 15.5 * TILE_SIZE,
    y: 3.5 * TILE_SIZE,
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, state: WorldState) => {
    const hasUndiscovered = state.specimens.some((s) => !s.discovered);
    drawFossilCabinet(
      ctx,
      14.0 * TILE_SIZE,
      1.0 * TILE_SIZE,
      4.0 * TILE_SIZE,
      2.5 * TILE_SIZE,
      hasUndiscovered,
      timeMs
    );
  },
  onInteract: (stateManager: any, _overlay: any) => {
    openCabinetModal(stateManager);
  },
};
