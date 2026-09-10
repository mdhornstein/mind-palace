import { WorldStation, DeepReadonly, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';

export const vaultFountainStation: WorldStation = {
  id: 'vault_fountain',
  name: 'The Treasury Wishing Well',
  prompt: 'Make a Wish (Toss Coin)',
  tileX: 9.0,
  tileY: 8.0,
  tileWidth: 3.5,
  tileHeight: 3.0,
  collisionBox: {
    x: 9.0 * TILE_SIZE,
    y: 8.3 * TILE_SIZE,
    w: 3.5 * TILE_SIZE,
    h: 2.4 * TILE_SIZE,
  },
  approachPoint: {
    x: 10.75 * TILE_SIZE,
    y: 11.0 * TILE_SIZE,
  },
  intent: {
    type: 'modal',
    modalId: 'vault_wishing_well',
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
    const cx = (9.0 + 1.75) * TILE_SIZE;
    const cy = (8.0 + 1.5) * TILE_SIZE;
    const rx = 48;
    const ry = 28;

    // 1. Octagonal Carved White Marble Plinth & Basin
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 8, rx + 6, ry + 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Marble rim
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Carved classical molding around basin rim
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 3, ry - 3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Clear Water Pool
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 8, ry - 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Submerged glittering coins in well bottom
    const coinGlints = [
      { dx: -18, dy: -2, c: '#facc15' },
      { dx: -6, dy: 4, c: '#f59e0b' },
      { dx: 14, dy: -4, c: '#e2e8f0' },
      { dx: 22, dy: 3, c: '#facc15' },
      { dx: 4, dy: -8, c: '#38bdf8' },
    ];
    for (const g of coinGlints) {
      ctx.fillStyle = g.c;
      ctx.beginPath();
      ctx.ellipse(cx + g.dx, cy + g.dy, 3, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Animated Concentric Water Ripples
    const ripplePhase1 = (timeMs * 0.0018) % 1;
    const ripplePhase2 = (timeMs * 0.0018 + 0.5) % 1;

    [ripplePhase1, ripplePhase2].forEach((phase) => {
      const rippleRx = (rx - 10) * phase;
      const rippleRy = (ry - 8) * phase;
      const alpha = (1 - phase) * 0.45;
      ctx.strokeStyle = `rgba(186, 230, 253, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rippleRx, rippleRy, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 4. Central Lion-Head Fountain Spout
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(cx, cy - 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(cx - 2, cy - 6, 4, 3); // brass spout

    // Falling water droplet
    const dropY = (timeMs * 0.04) % 8;
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(cx, cy - 4 + dropY, 1.5, 0, Math.PI * 2);
    ctx.fill();
  },
};
