import { RoomConfig, WorldState, DeepReadonly } from '../../core/types';
import { TILE_SIZE, ROOM_WIDTH_TILES, ROOM_HEIGHT_TILES, CANVAS_WIDTH, CANVAS_HEIGHT } from '../../core/constants';
import {
  drawFloorPlank,
  drawWallTile,
  drawOrnateRug,
  drawFireplace,
  drawWindow,
  drawObservatoryDoorway,
  drawMonsteraPlant,
  drawCascadingIvy,
  drawBostonFern,
} from '../../render/sprites';
import { drawSideWallPortal } from '../../render/escherSprites';
import { bookshelfStation } from './stations/bookshelf';
import { readingNookStation } from './stations/readingNook';
import { curioCabinetStation } from './stations/curioCabinet';
import { pedestalStation } from './stations/pedestal';
import { workstationStation } from './stations/workstation';
import { duckephantStation, duckephantEntity } from './stations/duckephant';

export const studyRoomConfig: RoomConfig = {
  id: 'study',
  name: 'The Scholar\'s Study',
  widthTiles: ROOM_WIDTH_TILES,
  heightTiles: ROOM_HEIGHT_TILES,
  stations: [
    bookshelfStation,
    readingNookStation,
    workstationStation,
    curioCabinetStation,
    pedestalStation,
    duckephantStation,
  ],
  decorativeProps: [
    // 1. Monstera Deliciosa nestled between Bookshelf and Window
    {
      id: 'prop_monstera',
      name: 'Monstera Deliciosa',
      y: 3.2 * TILE_SIZE,
      draw: (ctx: CanvasRenderingContext2D) => drawMonsteraPlant(ctx, 5.8 * TILE_SIZE, 1.4 * TILE_SIZE, 0),
    },
    // 2. Cascading English Ivy climbing down the fireplace brickwork
    {
      id: 'prop_fireplace_ivy',
      name: 'Cascading English Ivy',
      y: 2.8 * TILE_SIZE,
      draw: (ctx: CanvasRenderingContext2D) => drawCascadingIvy(ctx, 8.4 * TILE_SIZE, 1.2 * TILE_SIZE, 0),
    },
    // 3. Lush Boston Fern on turned plant stand in northeast corner
    {
      id: 'prop_boston_fern',
      name: 'Boston Fern on Stand',
      y: 3.2 * TILE_SIZE,
      draw: (ctx: CanvasRenderingContext2D) => drawBostonFern(ctx, 18.2 * TILE_SIZE, 1.3 * TILE_SIZE, 0),
    },
  ],
  doors: [
    // Doorway to The Royal Observatory on the South Wall
    {
      id: 'to_observatory',
      name: 'Portal to The Observatory',
      prompt: 'Enter Observatory',
      tileX: 8.5,
      tileY: 13.0,
      tileWidth: 3.0,
      tileHeight: 2.0,
      targetRoomId: 'observatory',
      targetSpawnPoint: {
        x: 10 * TILE_SIZE,
        y: 3 * TILE_SIZE,
        facing: 'down',
      },
      transitionMode: 'auto',
    },
    // Doorway to The M.C. Escher Paradox Gallery on the West Wall
    {
      id: 'to_escher',
      name: 'Portal to The Paradox Gallery',
      prompt: 'Enter Paradox Gallery (M.C. Escher)',
      tileX: 0,
      tileY: 5.5,
      tileWidth: 1.5,
      tileHeight: 2.5,
      targetRoomId: 'escher',
      targetSpawnPoint: {
        x: 17.5 * TILE_SIZE,
        y: 7 * TILE_SIZE,
        facing: 'left',
      },
      transitionMode: 'auto',
    },
    // Doorway to The Royal Mint on the East Wall
    {
      id: 'to_coins',
      name: 'Portal to The Royal Mint',
      prompt: 'Enter The Royal Mint (Coins & Mechanics)',
      tileX: 18.5,
      tileY: 5.5,
      tileWidth: 1.5,
      tileHeight: 2.5,
      targetRoomId: 'coins',
      targetSpawnPoint: {
        x: 2.5 * TILE_SIZE,
        y: 7.0 * TILE_SIZE,
        facing: 'right',
      },
      transitionMode: 'auto',
    },
  ],
  architecturalCollisions: [
    {
      x: 8.5 * TILE_SIZE,
      y: 1.2 * TILE_SIZE,
      w: 2.5 * TILE_SIZE,
      h: 2.0 * TILE_SIZE,
    },
  ],
  ambientLight: {
    type: 'evening',
    primaryGlowColor: '#f59e0b',
  },
  hasCompanion: true,
  getEntities: () => [
    {
      y: duckephantEntity.y,
      draw: (ctx, timeMs) => duckephantEntity.render(ctx, timeMs),
    },
  ],
  onUpdate: (dt, player) => {
    duckephantEntity.update(dt * 1000, player.x, player.y);
  },

  // 1. Static Room Architecture (floors, walls, wainscoting, entrance mat, reading rug)
  customDrawBackground: (ctx: CanvasRenderingContext2D, _state: DeepReadonly<WorldState>) => {
    // Fill deep room void
    ctx.fillStyle = '#0f0a07';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Walls & Floors
    for (let ty = 0; ty < ROOM_HEIGHT_TILES; ty++) {
      for (let tx = 0; tx < ROOM_WIDTH_TILES; tx++) {
        const x = tx * TILE_SIZE;
        const y = ty * TILE_SIZE;

        if (ty === 0) {
          drawWallTile(ctx, x, y, false);
        } else if (ty === 1) {
          drawWallTile(ctx, x, y, true);
        } else {
          const variant = (tx * 3 + ty * 7) % 4;
          drawFloorPlank(ctx, x, y, variant);
        }
      }
    }

    // Architectural Persian Rug under the reading nook
    drawOrnateRug(ctx, 2.0 * TILE_SIZE, 4.2 * TILE_SIZE, 4.8 * TILE_SIZE, 4.6 * TILE_SIZE);

    // West Doorway Portal leading to Paradox Gallery
    drawSideWallPortal(
      ctx,
      0,
      5.5 * TILE_SIZE,
      28,
      80,
      'west',
      'PARADOX GALLERY'
    );

    // South Doorway Threshold leading down to Observatory
    drawObservatoryDoorway(
      ctx,
      9 * TILE_SIZE,
      14 * TILE_SIZE + 4,
      2 * TILE_SIZE,
      28,
      'OBSERVATORY',
      false
    );

    // East Doorway Portal leading to The Royal Mint
    const eastDoorX = CANVAS_WIDTH - 24;
    const eastDoorY = 5.5 * TILE_SIZE;
    ctx.fillStyle = '#1e140c';
    ctx.fillRect(eastDoorX, eastDoorY, 24, 2.5 * TILE_SIZE);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(eastDoorX, eastDoorY, 24, 2.5 * TILE_SIZE);

    // Warm golden metallic gleam spilling out
    const mintSpill = ctx.createLinearGradient(eastDoorX, eastDoorY, eastDoorX - 45, eastDoorY);
    mintSpill.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    mintSpill.addColorStop(1, 'transparent');
    ctx.fillStyle = mintSpill;
    ctx.fillRect(eastDoorX - 45, eastDoorY, 45, 2.5 * TILE_SIZE);

    // Inscribed plaque above doorway
    ctx.fillStyle = '#1c1511';
    ctx.fillRect(CANVAS_WIDTH - 84, eastDoorY - 14, 80, 12);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.strokeRect(CANVAS_WIDTH - 84, eastDoorY - 14, 80, 12);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ROYAL MINT ⮞', CANVAS_WIDTH - 44, eastDoorY - 5);
  },

  // 2. Dynamic Room Architecture & Atmospheric Light (Windows, Fireplace, Light Shafts, Hearth Glow)
  customDrawAtmosphere: (ctx: CanvasRenderingContext2D, timeMs: number) => {
    // Symmetrical Arched Mullioned Windows flanking the fireplace
    // Left window (between Bookshelf and Fireplace)
    drawWindow(ctx, 6.2 * TILE_SIZE, 6, timeMs);
    // Right window (between Fireplace and Fossil Cabinet)
    drawWindow(ctx, 11.8 * TILE_SIZE, 6, timeMs);

    // Crackling Stone Fireplace with animated flames
    drawFireplace(ctx, 8.5 * TILE_SIZE, 6, timeMs);

    // Atmospheric Moonbeam Rays
    const rayLeft = ctx.createLinearGradient(6.2 * TILE_SIZE, 20, 4.5 * TILE_SIZE, 9 * TILE_SIZE);
    rayLeft.addColorStop(0, 'rgba(186, 230, 253, 0.12)');
    rayLeft.addColorStop(1, 'rgba(186, 230, 253, 0.0)');

    ctx.fillStyle = rayLeft;
    ctx.beginPath();
    ctx.moveTo(6.2 * TILE_SIZE, 24);
    ctx.lineTo(7.7 * TILE_SIZE, 24);
    ctx.lineTo(7.0 * TILE_SIZE, 9 * TILE_SIZE);
    ctx.lineTo(3.2 * TILE_SIZE, 9 * TILE_SIZE);
    ctx.closePath();
    ctx.fill();

    const rayRight = ctx.createLinearGradient(11.8 * TILE_SIZE, 20, 13 * TILE_SIZE, 9 * TILE_SIZE);
    rayRight.addColorStop(0, 'rgba(186, 230, 253, 0.10)');
    rayRight.addColorStop(1, 'rgba(186, 230, 253, 0.0)');

    ctx.fillStyle = rayRight;
    ctx.beginPath();
    ctx.moveTo(11.8 * TILE_SIZE, 24);
    ctx.lineTo(13.3 * TILE_SIZE, 24);
    ctx.lineTo(14.5 * TILE_SIZE, 9 * TILE_SIZE);
    ctx.lineTo(10.5 * TILE_SIZE, 9 * TILE_SIZE);
    ctx.closePath();
    ctx.fill();

    // Fireplace warm radial glow
    const firePulse = Math.sin(timeMs * 0.01) * 6;
    const fireGlow = ctx.createRadialGradient(
      9.5 * TILE_SIZE,
      2.5 * TILE_SIZE,
      10,
      9.5 * TILE_SIZE,
      2.5 * TILE_SIZE,
      110 + firePulse
    );
    fireGlow.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
    fireGlow.addColorStop(0.5, 'rgba(220, 38, 38, 0.08)');
    fireGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = fireGlow;
    ctx.beginPath();
    ctx.arc(9.5 * TILE_SIZE, 2.5 * TILE_SIZE, 120, 0, Math.PI * 2);
    ctx.fill();

    // Subtle dark room vignette around borders
    const vignette = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.35,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.72
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  },
};
