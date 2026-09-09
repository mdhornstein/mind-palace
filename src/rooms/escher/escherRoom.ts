import { RoomConfig, WorldState, DeepReadonly } from '../../core/types';
import {
  TILE_SIZE,
  ROOM_WIDTH_TILES,
  ROOM_HEIGHT_TILES,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../../core/constants';
import {
  drawSideWallPortal,
  drawTessellatedFloor,
  drawPenroseStairs,
  drawWaterfallStation,
  drawLithographerDesk,
  drawMobiusTerrarium,
} from '../../render/escherSprites';


// =============================================================================
// ROOM 3: THE M.C. ESCHER PARADOX GALLERY
// =============================================================================

export const escherRoomConfig: RoomConfig = {
  id: 'escher',
  name: 'The M.C. Escher Paradox Gallery',
  widthTiles: ROOM_WIDTH_TILES,
  heightTiles: ROOM_HEIGHT_TILES,
  stations: [
    // 1. The Perpetual Waterfall (Northwest)
    {
      id: 'escher_waterfall',
      name: 'The Perpetual Waterfall (1961)',
      prompt: 'Inspect Perpetual Flume & Waterwheel',
      tileX: 1.0,
      tileY: 1.5,
      tileWidth: 4.8,
      tileHeight: 4.0,
      collisionBox: {
        x: 1.0 * TILE_SIZE,
        y: 3.2 * TILE_SIZE,
        w: 4.8 * TILE_SIZE,
        h: 2.2 * TILE_SIZE,
      },
      approachPoint: {
        x: 3.5 * TILE_SIZE,
        y: 5.8 * TILE_SIZE,
      },
      draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
        drawWaterfallStation(ctx, 1.0 * TILE_SIZE, 1.5 * TILE_SIZE, timeMs);
      },
      intent: {
        type: 'modal',
        modalId: 'escher_waterfall',
      },
    },

    // 2. The Lithographer's Drafting Desk (Northeast)
    {
      id: 'escher_drawing_hands',
      name: "The Lithographer's Drafting Desk (1948)",
      prompt: 'Examine Self-Drawing Hands & Strange Loops',
      tileX: 14.2,
      tileY: 1.6,
      tileWidth: 3.8,
      tileHeight: 2.6,
      collisionBox: {
        x: 14.2 * TILE_SIZE,
        y: 2.2 * TILE_SIZE,
        w: 3.6 * TILE_SIZE,
        h: 1.8 * TILE_SIZE,
      },
      approachPoint: {
        x: 16.0 * TILE_SIZE,
        y: 4.6 * TILE_SIZE,
      },
      draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
        drawLithographerDesk(ctx, 14.2 * TILE_SIZE, 1.6 * TILE_SIZE, timeMs);
      },
      intent: {
        type: 'modal',
        modalId: 'escher_drawing_hands',
      },
    },

    // 3. The Möbius Terrarium (Southeast)
    {
      id: 'escher_mobius',
      name: 'The Möbius Terrarium (1963)',
      prompt: 'Observe Clockwork Ants on Bronze Strip',
      tileX: 14.0,
      tileY: 9.0,
      tileWidth: 3.8,
      tileHeight: 3.4,
      collisionBox: {
        x: 14.2 * TILE_SIZE,
        y: 10.8 * TILE_SIZE,
        w: 3.4 * TILE_SIZE,
        h: 1.6 * TILE_SIZE,
      },
      approachPoint: {
        x: 15.8 * TILE_SIZE,
        y: 8.6 * TILE_SIZE,
      },
      draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
        drawMobiusTerrarium(ctx, 14.0 * TILE_SIZE, 9.0 * TILE_SIZE, timeMs);
      },
      intent: {
        type: 'modal',
        modalId: 'escher_mobius',
      },
    },

    // 4. The Penrose Endless Staircase (Room Centerpiece)
    {
      id: 'escher_penrose_stairs',
      name: 'The Penrose Staircase (Ascending & Descending)',
      prompt: 'Contemplate Pilgrim on Impossible Steps',
      tileX: 7.2,
      tileY: 5.2,
      tileWidth: 5.6,
      tileHeight: 4.0,
      collisionBox: {
        x: 7.4 * TILE_SIZE,
        y: 5.4 * TILE_SIZE,
        w: 5.2 * TILE_SIZE,
        h: 3.4 * TILE_SIZE,
      },
      approachPoint: {
        x: 10.0 * TILE_SIZE,
        y: 9.4 * TILE_SIZE,
      },
      draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
        drawPenroseStairs(ctx, 10.0 * TILE_SIZE, 7.2 * TILE_SIZE, timeMs);
      },
      intent: {
        type: 'modal',
        modalId: 'escher_penrose_stairs',
      },
    },
  ],

  doors: [
    // Return Doorway to The Study on the East Wall
    {
      id: 'to_study_from_escher',
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
    },
  ],

  ambientLight: {
    type: 'night',
    primaryGlowColor: '#94a3b8',
  },

  // 1. Static Room Architecture & Dynamic Tessellation Floor
  customDrawBackground: (ctx: CanvasRenderingContext2D, _state: DeepReadonly<WorldState>) => {
    // Dynamic Tessellated Floor (True Interlocking periodic division of the plane)
    drawTessellatedFloor(ctx, performance.now());

    // East Doorway Portal leading back to The Study
    drawSideWallPortal(
      ctx,
      CANVAS_WIDTH - 28,
      5.5 * TILE_SIZE,
      26,
      80,
      'east',
      'THE STUDY'
    );
  },

  // 2. Dynamic Room Atmosphere & Optical Lighting
  customDrawAtmosphere: (ctx: CanvasRenderingContext2D, timeMs: number) => {
    // Impossible geometric light cones casting from corners
    const cone1 = ctx.createLinearGradient(0, 0, 200, 250);
    cone1.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    cone1.addColorStop(0.5, 'rgba(148, 163, 184, 0.03)');
    cone1.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = cone1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(120, 0);
    ctx.lineTo(240, 260);
    ctx.lineTo(0, 260);
    ctx.closePath();
    ctx.fill();

    // Subtle Penrose central pedestal lantern glow
    const stairsGlow = ctx.createRadialGradient(
      10.0 * TILE_SIZE,
      7.5 * TILE_SIZE,
      10,
      10.0 * TILE_SIZE,
      7.5 * TILE_SIZE,
      120
    );
    stairsGlow.addColorStop(0, 'rgba(254, 240, 138, 0.12)');
    stairsGlow.addColorStop(0.6, 'rgba(100, 116, 139, 0.05)');
    stairsGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = stairsGlow;
    ctx.beginPath();
    ctx.arc(10.0 * TILE_SIZE, 7.5 * TILE_SIZE, 120, 0, Math.PI * 2);
    ctx.fill();

    // Floating optical dust motes
    ctx.fillStyle = 'rgba(241, 245, 249, 0.35)';
    for (let i = 0; i < 18; i++) {
      const mx = (Math.sin(timeMs * 0.0006 + i * 2.3) * 0.5 + 0.5) * CANVAS_WIDTH;
      const my = (Math.cos(timeMs * 0.0004 + i * 3.7) * 0.5 + 0.5) * (CANVAS_HEIGHT - 64) + 64;
      const size = (i % 3 === 0) ? 2 : 1;
      ctx.fillRect(mx, my, size, size);
    }

    // High-contrast lithographic vignette
    const vignette = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.3,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.75
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  },
};
