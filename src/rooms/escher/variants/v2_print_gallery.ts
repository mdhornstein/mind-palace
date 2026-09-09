import { RoomConfig, WorldState, DeepReadonly } from '../../../core/types';
import {
  TILE_SIZE,
  ROOM_WIDTH_TILES,
  ROOM_HEIGHT_TILES,
} from '../../../core/constants';
import {
  drawPrintGalleryBackground,
  drawPrintGalleryAtmosphere,
  drawFramedArtworkStation,
  drawFolioStand,
  drawVariantDialStation,
  drawYoungObserver,
} from '../../../render/printGallerySprites';

// =============================================================================
// VARIANT 2: THE M.C. ESCHER "PRINT GALLERY" (1956)
// Living paradoxical architecture of Prentententoonstelling
// =============================================================================

export const escherV2PrintGalleryConfig: RoomConfig = {
  id: 'escher_v2',
  name: 'The M.C. Escher Print Gallery (1956)',
  widthTiles: ROOM_WIDTH_TILES,
  heightTiles: ROOM_HEIGHT_TILES,

  stations: [
    // 1. "Print Gallery" (1956) - The Centerpiece Self-Containing Masterwork
    // Observed by the curly-haired young connoisseur in the gallery arcade
    {
      id: 'art_print_gallery',
      name: 'Print Gallery (Prentententoonstelling, 1956)',
      prompt: "Inspect 'Print Gallery' & Continuous Conformal Surface",
      tileX: 14.2,
      tileY: 6.2,
      tileWidth: 2.2,
      tileHeight: 2.2,
      collisionBox: {
        x: 14.2 * TILE_SIZE,
        y: 6.4 * TILE_SIZE,
        w: 2.0 * TILE_SIZE,
        h: 1.8 * TILE_SIZE,
      },
      approachPoint: {
        x: 13.0 * TILE_SIZE,
        y: 7.6 * TILE_SIZE,
      },
      draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
        drawFramedArtworkStation(ctx, 14.2 * TILE_SIZE, 6.2 * TILE_SIZE, 54, 52, 'print_gallery', timeMs);
      },
      intent: {
        type: 'modal',
        modalId: 'escher_artwork',
        params: { artworkId: 'print_gallery' },
      },
    },

    // 2. "Relativity" (1953) - North Gallery Wall
    {
      id: 'art_relativity',
      name: 'Relativity (1953)',
      prompt: "Inspect 'Relativity' & Three Orthogonal Gravities",
      tileX: 14.2,
      tileY: 1.6,
      tileWidth: 2.2,
      tileHeight: 2.0,
      collisionBox: {
        x: 14.2 * TILE_SIZE,
        y: 1.6 * TILE_SIZE,
        w: 2.0 * TILE_SIZE,
        h: 1.8 * TILE_SIZE,
      },
      approachPoint: {
        x: 15.2 * TILE_SIZE,
        y: 3.8 * TILE_SIZE,
      },
      draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
        drawFramedArtworkStation(ctx, 14.2 * TILE_SIZE, 1.6 * TILE_SIZE, 52, 48, 'relativity', timeMs);
      },
      intent: {
        type: 'modal',
        modalId: 'escher_artwork',
        params: { artworkId: 'relativity' },
      },
    },

    // 3. "Metamorphosis II" (1940) - North Waterfront Townhouse Wall (Panoramic)
    {
      id: 'art_metamorphosis',
      name: 'Metamorphosis II (1940)',
      prompt: "Inspect 'Metamorphosis II' & Continuous Topological Deformations",
      tileX: 6.0,
      tileY: 1.6,
      tileWidth: 3.8,
      tileHeight: 1.8,
      collisionBox: {
        x: 6.0 * TILE_SIZE,
        y: 1.6 * TILE_SIZE,
        w: 3.8 * TILE_SIZE,
        h: 1.8 * TILE_SIZE,
      },
      approachPoint: {
        x: 7.8 * TILE_SIZE,
        y: 3.8 * TILE_SIZE,
      },
      draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
        drawFramedArtworkStation(ctx, 6.0 * TILE_SIZE, 1.6 * TILE_SIZE, 80, 42, 'metamorphosis_ii', timeMs);
      },
      intent: {
        type: 'modal',
        modalId: 'escher_artwork',
        params: { artworkId: 'metamorphosis_ii' },
      },
    },

    // 4. "Drawing Hands" (1948) - Quayside Wall (Southwest)
    {
      id: 'art_drawing_hands',
      name: 'Drawing Hands (Tekenen, 1948)',
      prompt: "Inspect 'Drawing Hands' & Tangled Hierarchies",
      tileX: 1.0,
      tileY: 8.5,
      tileWidth: 2.2,
      tileHeight: 2.0,
      collisionBox: {
        x: 1.0 * TILE_SIZE,
        y: 8.5 * TILE_SIZE,
        w: 2.2 * TILE_SIZE,
        h: 1.8 * TILE_SIZE,
      },
      approachPoint: {
        x: 3.2 * TILE_SIZE,
        y: 9.8 * TILE_SIZE,
      },
      draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
        drawFramedArtworkStation(ctx, 1.0 * TILE_SIZE, 8.5 * TILE_SIZE, 52, 46, 'drawing_hands', timeMs);
      },
      intent: {
        type: 'modal',
        modalId: 'escher_artwork',
        params: { artworkId: 'drawing_hands' },
      },
    },

    // 5. "Belvedere" (1958) - Harbor Promontory Wall (Northwest)
    {
      id: 'art_belvedere',
      name: 'Belvedere (1958)',
      prompt: "Inspect 'Belvedere' & The Impossible Cube",
      tileX: 4.8,
      tileY: 4.5,
      tileWidth: 2.0,
      tileHeight: 2.0,
      collisionBox: {
        x: 4.8 * TILE_SIZE,
        y: 4.5 * TILE_SIZE,
        w: 1.8 * TILE_SIZE,
        h: 1.8 * TILE_SIZE,
      },
      approachPoint: {
        x: 5.6 * TILE_SIZE,
        y: 6.8 * TILE_SIZE,
      },
      draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
        drawFramedArtworkStation(ctx, 4.8 * TILE_SIZE, 4.5 * TILE_SIZE, 48, 54, 'belvedere', timeMs);
      },
      intent: {
        type: 'modal',
        modalId: 'escher_artwork',
        params: { artworkId: 'belvedere' },
      },
    },

    // 6. "Day and Night" (1938) - South Colonnade Wall
    {
      id: 'art_day_and_night',
      name: 'Day and Night (Dag en Nacht, 1938)',
      prompt: "Inspect 'Day and Night' & Figure-Ground Antisymmetry",
      tileX: 7.2,
      tileY: 11.5,
      tileWidth: 2.8,
      tileHeight: 2.0,
      collisionBox: {
        x: 7.2 * TILE_SIZE,
        y: 11.5 * TILE_SIZE,
        w: 2.8 * TILE_SIZE,
        h: 1.8 * TILE_SIZE,
      },
      approachPoint: {
        x: 8.6 * TILE_SIZE,
        y: 10.4 * TILE_SIZE,
      },
      draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
        drawFramedArtworkStation(ctx, 7.2 * TILE_SIZE, 11.5 * TILE_SIZE, 68, 46, 'day_and_night', timeMs);
      },
      intent: {
        type: 'modal',
        modalId: 'escher_artwork',
        params: { artworkId: 'day_and_night' },
      },
    },

    // 7. The Printmaker's Folio Stand (Southeast Gallery Arcade)
    {
      id: 'printmaker_folio',
      name: "The Printmaker's Folio Rack",
      prompt: 'Browse Loose Proofs, Grid Studies & Coxeter Geometry',
      tileX: 15.0,
      tileY: 10.5,
      tileWidth: 2.2,
      tileHeight: 2.2,
      collisionBox: {
        x: 15.0 * TILE_SIZE,
        y: 11.0 * TILE_SIZE,
        w: 2.0 * TILE_SIZE,
        h: 1.4 * TILE_SIZE,
      },
      approachPoint: {
        x: 14.2 * TILE_SIZE,
        y: 10.4 * TILE_SIZE,
      },
      draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
        drawFolioStand(ctx, 15.0 * TILE_SIZE, 10.5 * TILE_SIZE, timeMs);
      },
      intent: {
        type: 'modal',
        modalId: 'escher_artwork',
        params: { artworkId: 'printmaker_folio' },
      },
    },

    // 8. In-World Diegetic Paradox Variant Dial (Near East Wall Doorway)
    {
      id: 'escher_v2_variant_dial',
      name: 'The Chrono-Spatial Dial',
      prompt: 'Turn Dial: Switch to Paradox Courtyard (v1)',
      tileX: 16.8,
      tileY: 3.5,
      tileWidth: 1.6,
      tileHeight: 1.6,
      collisionBox: {
        x: 16.8 * TILE_SIZE,
        y: 3.8 * TILE_SIZE,
        w: 1.4 * TILE_SIZE,
        h: 1.0 * TILE_SIZE,
      },
      approachPoint: {
        x: 17.0 * TILE_SIZE,
        y: 5.0 * TILE_SIZE,
      },
      draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
        drawVariantDialStation(ctx, 16.8 * TILE_SIZE, 3.5 * TILE_SIZE, timeMs, 'v2_print_gallery');
      },
      intent: {
        type: 'modal',
        modalId: 'escher_variant_dial',
      },
    },
  ],

  doors: [
    // Return Doorway to The Study on the East Wall
    {
      id: 'to_study_from_escher_v2',
      name: 'Portal to The Study',
      prompt: 'Return to The Study',
      tileX: 18.5,
      tileY: 5.5,
      tileWidth: 1.5,
      tileHeight: 2.5,
      targetRoomId: 'study',
      targetSpawnPoint: {
        x: 2.0 * TILE_SIZE,
        y: 6.8 * TILE_SIZE,
        facing: 'right',
      },
      transitionMode: 'auto',
    },
  ],

  architecturalCollisions: [
    // 1. North perimeter wall & rooftops
    {
      x: 0,
      y: 0,
      w: ROOM_WIDTH_TILES * TILE_SIZE,
      h: 1.5 * TILE_SIZE,
    },
    // 2. Deep Harbor Water Basin (Northwest Quadrant, inaccessible except by quayside)
    {
      x: 0,
      y: 0,
      w: 4.0 * TILE_SIZE,
      h: 3.5 * TILE_SIZE,
    },
    {
      x: 0,
      y: 4.5 * TILE_SIZE,
      w: 4.0 * TILE_SIZE,
      h: 2.5 * TILE_SIZE,
    },
    // 3. Colonnade Pillar 1 (North-Center)
    {
      x: 11 * TILE_SIZE - 8,
      y: 52,
      w: 20,
      h: 68,
    },
    // 4. Colonnade Pillar 2 (South-Center)
    {
      x: 11 * TILE_SIZE - 8,
      y: 9 * TILE_SIZE + 10,
      w: 20,
      h: 68,
    },
    // 5. Young Observer collision
    {
      x: 11.2 * TILE_SIZE + 2,
      y: 6.8 * TILE_SIZE + 22,
      w: 16,
      h: 18,
    },
  ],

  ambientLight: {
    type: 'day',
    primaryGlowColor: '#fef3c7',
  },

  // Dynamic entities: The curly-haired young observer standing in the arcade
  getEntities: (_state: DeepReadonly<WorldState>, _timeMs: number) => [
    {
      // Feet of the young observer are around y: 6.8 * TILE_SIZE + 38 = 255.6px
      y: 6.8 * TILE_SIZE + 38,
      draw: (ctx: CanvasRenderingContext2D, t: number) => {
        drawYoungObserver(ctx, 11.2 * TILE_SIZE, 6.8 * TILE_SIZE, t);
      },
    },
  ],

  // Static room architecture: Harbor town curving into gallery arcade & center MCE medallion
  customDrawBackground: (ctx: CanvasRenderingContext2D, _state: DeepReadonly<WorldState>) => {
    drawPrintGalleryBackground(ctx, performance.now());
  },

  // Dynamic room atmosphere: Mediterranean sunlit haze, drifting motes, warm picture lamps
  customDrawAtmosphere: (ctx: CanvasRenderingContext2D, timeMs: number) => {
    drawPrintGalleryAtmosphere(ctx, timeMs);
  },
};
