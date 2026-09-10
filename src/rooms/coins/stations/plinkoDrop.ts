import { WorldStation, DeepReadonly, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { getActiveGaltonTokens } from '../galtonChuteActions';

export const plinkoDropStation: WorldStation = {
  id: 'plinko_drop',
  name: 'The Gilded Chute',
  prompt: 'Play Gilded Chute (Coin Drop)',
  tileX: 14.2,
  tileY: 2.2,
  tileWidth: 2.8,
  tileHeight: 3.2,
  collisionBox: {
    x: 14.2 * TILE_SIZE,
    y: 2.5 * TILE_SIZE,
    w: 2.8 * TILE_SIZE,
    h: 2.6 * TILE_SIZE,
  },
  approachPoint: {
    x: 15.6 * TILE_SIZE,
    y: 5.4 * TILE_SIZE,
  },
  intent: {
    type: 'modal',
    modalId: 'plinko_game',
  },
  primaryAction: {
    label: 'Drop Sovereign',
    intent: {
      type: 'custom',
      actionId: 'plinko_quick_drop',
      params: {
        stationId: 'plinko_drop',
        chuteX: 15.6 * TILE_SIZE,
        chuteY: 5.2 * TILE_SIZE,
      },
    },
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
    const x = 14.2 * TILE_SIZE;
    const y = 2.0 * TILE_SIZE;
    const w = 2.8 * TILE_SIZE;
    const h = 3.2 * TILE_SIZE;

    // 1. Ornate Mahogany Cabinet Frame
    ctx.fillStyle = '#27170f';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Decorative arched pediment on top
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 4, w * 0.45, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // Golden marquee emblem
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('• GALTON CHUTE •', x + w / 2, y - 4);

    // 2. Glass Vitrine Display (Dark felt background with glass reflections)
    const glassX = x + 8;
    const glassY = y + 14;
    const glassW = w - 16;
    const glassH = h - 28;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(glassX, glassY, glassW, glassH);

    // 3. Staggered Brass Pins
    for (let row = 0; row < 5; row++) {
      const pinY = glassY + 16 + row * 12;
      const count = row + 2;
      const spacing = glassW / (count + 1);
      for (let c = 1; c <= count; c++) {
        const pinX = glassX + c * spacing;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(pinX, pinY, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3.5. Active Falling Sovereigns from in-world Quick Drops
    const now = Date.now();
    const activeTokens = getActiveGaltonTokens(now);
    for (const tok of activeTokens) {
      const elapsed = now - tok.startTime;
      const progress = Math.min(1, Math.max(0, elapsed / tok.durationMs));
      const py = glassY + 4 + progress * (glassH - 12);

      // Interpolate horizontal deflection across rows
      const rowIndex = progress * (tok.path.length - 1);
      const r0 = Math.floor(rowIndex);
      const r1 = Math.min(tok.path.length - 1, r0 + 1);
      const rFrac = rowIndex - r0;
      const offset = tok.path[r0] * (1 - rFrac) + tok.path[r1] * rFrac;
      const px = glassX + glassW / 2 + offset * (glassW * 0.38);

      // Gold coin with gleam
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(px, py, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Specular shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px - 0.8, py - 0.8, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Multiplier Chutes at bottom of glass
    const binCount = 4;
    const binW = glassW / binCount;
    const colors = ['#f59e0b', '#94a3b8', '#38bdf8', '#f59e0b'];
    for (let b = 0; b < binCount; b++) {
      const bx = glassX + b * binW;
      const by = glassY + glassH - 14;
      ctx.fillStyle = colors[b];
      ctx.fillRect(bx + 1, by, binW - 2, 12);
      ctx.fillStyle = '#0f0a07';
      ctx.fillRect(bx + 2, by + 1, binW - 4, 10);
    }

    // Glass diagonal sheen/reflection
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(glassX + 6, glassY + 4);
    ctx.lineTo(glassX + glassW - 6, glassY + glassH - 10);
    ctx.stroke();

    // 5. Brass Coin Chute / Hopper at bottom
    ctx.fillStyle = '#b45309';
    ctx.fillRect(x + 14, y + h - 10, w - 28, 8);
    ctx.fillStyle = '#facc15';
    // Glinting coin in collection trough
    const coinFlash = Math.sin(timeMs * 0.005) > 0.3;
    if (coinFlash) {
      ctx.fillRect(x + w / 2 - 4, y + h - 8, 8, 4);
    }
  },
};
