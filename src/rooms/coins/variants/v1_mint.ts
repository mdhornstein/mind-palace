import { RoomConfig, DeepReadonly, WorldState } from '../../../core/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_SIZE,
  ROOM_WIDTH_TILES,
  ROOM_HEIGHT_TILES,
} from '../../../core/constants';
import { coinPressStation } from '../stations/coinPress';
import { plinkoDropStation } from '../stations/plinkoDrop';
import { mintScaleStation } from '../stations/vaultScale';
import { ringingStoneStation } from '../stations/ringingStone';
import { CoinPhysicsEngine } from '../coinPhysics';

export const v1MintConfig: RoomConfig = {
  id: 'coins_v1',
  name: 'The Royal Mint',
  widthTiles: ROOM_WIDTH_TILES,
  heightTiles: ROOM_HEIGHT_TILES,
  stations: [coinPressStation, plinkoDropStation, mintScaleStation, ringingStoneStation],
  doors: [
    // Return Doorway to The Study on the West Wall
    {
      id: 'mint_to_study',
      name: 'Portal to The Study',
      prompt: 'Return to Study',
      tileX: 0,
      tileY: 6.0,
      tileWidth: 1.5,
      tileHeight: 2.5,
      targetRoomId: 'study',
      targetSpawnPoint: {
        x: 17.0 * TILE_SIZE,
        y: 7.0 * TILE_SIZE,
        facing: 'left',
      },
      transitionMode: 'auto',
    },
  ],
  architecturalCollisions: [
    // North wall machinery boundary
    {
      x: 0,
      y: 0,
      w: CANVAS_WIDTH,
      h: 2.0 * TILE_SIZE,
    },
  ],
  ambientLight: {
    type: 'evening',
    primaryGlowColor: '#f59e0b',
  },
  hasCompanion: false,

  // Frame update hook: advances 2.5D coin trajectories, ground bouncing, and player pickup
  onUpdate: (dt: number, player: { x: number; y: number }) => {
    CoinPhysicsEngine.getInstance().update(dt, player, {
      minX: 24,
      maxX: CANVAS_WIDTH - 24,
      minY: 2.2 * TILE_SIZE,
      maxY: CANVAS_HEIGHT - 24,
    });
  },

  // Dynamic entities: returns active bouncing coins and floating score pills for Y-depth sorting
  getEntities: () => {
    return CoinPhysicsEngine.getInstance().getRenderableEntities();
  },

  // Background Architecture: Industrial Victorian Brick, Copper Vents, and Brass Floor Inlays
  customDrawBackground: (ctx: CanvasRenderingContext2D, _state: DeepReadonly<WorldState>) => {
    // Fill deep iron void
    ctx.fillStyle = '#110d0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. North Victorian Machinery Wall (y: 0 to 2*TILE_SIZE)
    const wallHeight = 2.2 * TILE_SIZE;
    for (let wy = 0; wy < wallHeight; wy += 8) {
      const row = Math.floor(wy / 8);
      const rowOffset = (row % 2) * 16;
      for (let wx = -16; wx < CANVAS_WIDTH + 16; wx += 32) {
        const brickX = wx + rowOffset;
        ctx.fillStyle = (row + Math.floor(wx / 32)) % 3 === 0 ? '#381a10' : '#27120a';
        ctx.fillRect(brickX, wy, 30, 7);
      }
    }

    // Heavy riveted copper steam conduits across the upper wall
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 16, CANVAS_WIDTH, 12);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 18, CANVAS_WIDTH, 2); // highlight line
    ctx.fillStyle = '#78350f';
    for (let cx = 12; cx < CANVAS_WIDTH; cx += 28) {
      ctx.fillRect(cx, 15, 4, 14); // pipe coupling brackets
    }

    // 2. Stone Flagstone Floor (y: wallHeight to CANVAS_HEIGHT)
    const floorYStart = wallHeight;
    for (let fy = floorYStart; fy < CANVAS_HEIGHT; fy += 24) {
      const row = Math.floor((fy - floorYStart) / 24);
      const offset = (row % 2) * 24;
      for (let fx = -24; fx < CANVAS_WIDTH + 24; fx += 48) {
        const stoneX = fx + offset;
        const hash = Math.sin(stoneX * 12.3 + fy * 7.7);
        ctx.fillStyle = hash > 0.3 ? '#231b14' : hash > -0.3 ? '#1c150f' : '#17110c';
        ctx.fillRect(stoneX, fy, 46, 22);

        // Mortar seams
        ctx.strokeStyle = '#0e0906';
        ctx.lineWidth = 1;
        ctx.strokeRect(stoneX + 0.5, fy + 0.5, 45, 21);
      }
    }

    // 3. Central Brass Geometric Tram Lines (inlaid tramway for coin carts)
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    // Left tram rail
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2 - 40, wallHeight);
    ctx.lineTo(CANVAS_WIDTH / 2 - 40, CANVAS_HEIGHT - 10);
    ctx.stroke();

    // Right tram rail
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2 + 40, wallHeight);
    ctx.lineTo(CANVAS_WIDTH / 2 + 40, CANVAS_HEIGHT - 10);
    ctx.stroke();

    // Cross ties / brass ties
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    for (let ty = wallHeight + 16; ty < CANVAS_HEIGHT - 15; ty += 24) {
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2 - 42, ty);
      ctx.lineTo(CANVAS_WIDTH / 2 + 42, ty);
      ctx.stroke();
    }

    // 4. Inlaid Floor Marquee: "THE ROYAL MINT"
    ctx.fillStyle = 'rgba(217, 119, 6, 0.4)';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('• THE ROYAL MINT • ANNO 1892 •', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 38);

    // 5. West Doorway to The Study (x: 0, y: 6.0*TILE_SIZE)
    const doorX = 0;
    const doorY = 5.5 * TILE_SIZE;
    ctx.fillStyle = '#2e190d';
    ctx.fillRect(doorX, doorY, 18, 2.5 * TILE_SIZE);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(doorX, doorY, 18, 2.5 * TILE_SIZE);

    // Warm hearth light spilling from the Study door
    const doorGlow = ctx.createLinearGradient(doorX + 18, doorY, doorX + 70, doorY);
    doorGlow.addColorStop(0, 'rgba(245, 158, 11, 0.25)');
    doorGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = doorGlow;
    ctx.fillRect(doorX + 18, doorY, 52, 2.5 * TILE_SIZE);

    // Sign above doorway
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('⮜ THE STUDY', doorX + 4, doorY - 4);
  },

  // Dynamic Ambient Atmosphere: Steam Wisps and Warm Forge Lantern Glows
  customDrawAtmosphere: (ctx: CanvasRenderingContext2D, timeMs: number) => {
    // 1. Warm amber overhead forge lamp glow
    const lampGlow = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      90,
      10,
      CANVAS_WIDTH / 2,
      90,
      280
    );
    lampGlow.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
    lampGlow.addColorStop(0.6, 'rgba(217, 119, 6, 0.04)');
    lampGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = lampGlow;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Ambient drifting chimney steam wisps
    ctx.save();
    for (let w = 0; w < 3; w++) {
      const wx = 120 + w * 180 + Math.sin(timeMs * 0.001 + w) * 20;
      const wy = 45 - ((timeMs * 0.015 + w * 25) % 35);
      const alpha = Math.sin((timeMs * 0.002) + w) * 0.08 + 0.1;
      ctx.fillStyle = `rgba(226, 232, 240, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(wx, wy, 16 + w * 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
};
