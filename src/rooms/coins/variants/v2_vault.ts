import { RoomConfig, DeepReadonly, WorldState } from '../../../core/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_SIZE,
  ROOM_WIDTH_TILES,
  ROOM_HEIGHT_TILES,
} from '../../../core/constants';
import { vaultFountainStation } from '../stations/vaultFountain';
import { vaultScaleStation } from '../stations/vaultScale';
import { vaultCoinPressStation } from '../stations/coinPress';
import { CoinPhysicsEngine } from '../coinPhysics';

export const v2VaultConfig: RoomConfig = {
  id: 'coins_v2',
  name: 'The Sovereign Vault',
  widthTiles: ROOM_WIDTH_TILES,
  heightTiles: ROOM_HEIGHT_TILES,
  stations: [vaultFountainStation, vaultScaleStation, vaultCoinPressStation],
  doors: [
    // Return Doorway to The Study on the West Wall
    {
      id: 'vault_to_study',
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
    {
      x: 0,
      y: 0,
      w: CANVAS_WIDTH,
      h: 2.0 * TILE_SIZE,
    },
  ],
  ambientLight: {
    type: 'evening',
    primaryGlowColor: '#eab308',
  },
  hasCompanion: false,

  onUpdate: (dt: number, player: { x: number; y: number }) => {
    CoinPhysicsEngine.getInstance().update(dt, player, {
      minX: 24,
      maxX: CANVAS_WIDTH - 24,
      minY: 2.2 * TILE_SIZE,
      maxY: CANVAS_HEIGHT - 24,
    });
  },

  getEntities: () => {
    return CoinPhysicsEngine.getInstance().getRenderableEntities();
  },

  // Vaulted Marble Architecture with Gold Tessellation and Glistening Coin Piles
  customDrawBackground: (ctx: CanvasRenderingContext2D, _state: DeepReadonly<WorldState>) => {
    // Fill deep midnight void
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Vaulted Marble Upper Wall with Classical Arches
    const wallHeight = 2.2 * TILE_SIZE;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, wallHeight);

    // Marble arch ribs
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    for (let ax = 0; ax < CANVAS_WIDTH; ax += 128) {
      ctx.beginPath();
      ctx.arc(ax + 64, wallHeight + 10, 64, Math.PI, 0);
      ctx.stroke();

      // Gold mosaic keystones
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(ax + 60, wallHeight - 54, 8, 10);
    }

    // 2. Polished Checkered Marble & Gold Tessellated Floor
    const floorYStart = wallHeight;
    for (let fy = floorYStart; fy < CANVAS_HEIGHT; fy += 28) {
      const row = Math.floor((fy - floorYStart) / 28);
      const offset = (row % 2) * 28;
      for (let fx = -28; fx < CANVAS_WIDTH + 28; fx += 56) {
        const tileX = fx + offset;
        const isDark = (row + Math.floor(fx / 56)) % 2 === 0;

        ctx.fillStyle = isDark ? '#141b26' : '#1f2937';
        ctx.fillRect(tileX, fy, 54, 26);

        // Gold corner insets
        ctx.fillStyle = '#d97706';
        ctx.fillRect(tileX + 1, fy + 1, 3, 3);
        ctx.fillRect(tileX + 50, fy + 1, 3, 3);

        ctx.strokeStyle = '#090d15';
        ctx.lineWidth = 1;
        ctx.strokeRect(tileX + 0.5, fy + 0.5, 53, 25);
      }
    }

    // 3. Piles of Glistening Gold Coin Bullion along North Wall
    const coinHeaps = [
      { x: 18, y: wallHeight + 6, w: 42, h: 18 },
      { x: CANVAS_WIDTH - 65, y: wallHeight + 8, w: 48, h: 22 },
    ];
    for (const heap of coinHeaps) {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(heap.x + heap.w / 2, heap.y + heap.h / 2, heap.w / 2, heap.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gleaming coin dots
      for (let d = 0; d < 18; d++) {
        const cx = heap.x + 4 + (d * 7.7) % (heap.w - 8);
        const cy = heap.y + 4 + (d * 5.3) % (heap.h - 8);
        ctx.fillStyle = d % 3 === 0 ? '#fef08a' : d % 2 === 0 ? '#facc15' : '#eab308';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 3, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Inlaid Celestial Treasury Mosaic in Floor Center
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, 280, 78, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, 280, 84, 0, Math.PI * 2);
    ctx.stroke();

    // 5. West Doorway to The Study
    const doorX = 0;
    const doorY = 5.5 * TILE_SIZE;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(doorX, doorY, 18, 2.5 * TILE_SIZE);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(doorX, doorY, 18, 2.5 * TILE_SIZE);

    const doorGlow = ctx.createLinearGradient(doorX + 18, doorY, doorX + 60, doorY);
    doorGlow.addColorStop(0, 'rgba(234, 179, 8, 0.25)');
    doorGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = doorGlow;
    ctx.fillRect(doorX + 18, doorY, 42, 2.5 * TILE_SIZE);

    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('⮜ THE STUDY', doorX + 4, doorY - 4);
  },

  customDrawAtmosphere: (ctx: CanvasRenderingContext2D, timeMs: number) => {
    // Shimmering golden treasure ambiance
    const treasureGlow = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      280,
      30,
      CANVAS_WIDTH / 2,
      280,
      260
    );
    treasureGlow.addColorStop(0, 'rgba(234, 179, 8, 0.09)');
    treasureGlow.addColorStop(0.7, 'rgba(180, 83, 9, 0.03)');
    treasureGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = treasureGlow;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Tiny ambient golden dust particles drifting gently
    ctx.save();
    for (let p = 0; p < 12; p++) {
      const px = ((p * 57.3 + timeMs * 0.01) % CANVAS_WIDTH);
      const py = 120 + Math.sin(timeMs * 0.001 + p) * 80 + (p * 23) % 200;
      const alpha = Math.sin(timeMs * 0.003 + p) * 0.35 + 0.45;
      ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.fillRect(px, py, 1.5, 1.5);
    }
    ctx.restore();
  },
};
