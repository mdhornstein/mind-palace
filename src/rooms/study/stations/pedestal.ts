import { WorldStation, WorldState, DeepReadonly } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { drawPedestal } from '../../../render/sprites';
import { openCabinetModal } from '../../../ui/cabinetModal';

export const pedestalStation: WorldStation = {
  id: 'pedestal',
  name: 'Display Pedestal',
  prompt: 'Inspect Featured Specimen',
  tileX: 15.0,
  tileY: 5.0,
  tileWidth: 1.0,
  tileHeight: 1.0,
  collisionBox: {
    x: 15.0 * TILE_SIZE,
    y: 5.0 * TILE_SIZE,
    w: 1.0 * TILE_SIZE,
    h: 1.0 * TILE_SIZE,
  },
  approachPoint: {
    x: 14.0 * TILE_SIZE,
    y: 5.5 * TILE_SIZE,
  },
  draw: (ctx: CanvasRenderingContext2D, _timeMs: number, state: DeepReadonly<WorldState>) => {
    const featuredSpecimen = state.specimens.find(
      (s) => s.id === state.environment.activePedestalSpecimenId
    );
    drawPedestal(
      ctx,
      15.0 * TILE_SIZE,
      5.0 * TILE_SIZE,
      featuredSpecimen ? featuredSpecimen.name : null
    );
  },
  onInteract: (stateManager: any, _overlay: any) => {
    // Inspecting pedestal opens cabinet view to examine specimen details
    const state = stateManager.getState();
    openCabinetModal(stateManager, state.environment.activePedestalSpecimenId || undefined);
  },
};
