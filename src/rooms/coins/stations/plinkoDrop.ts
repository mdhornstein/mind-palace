import { WorldStation, DeepReadonly, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { getActiveGaltonTokens } from '../galtonChuteActions';
import { MintConductor } from '../mintConductor';

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

    const conductor = MintConductor.getInstance();
    const isLooping = conductor.isStationLooping('plinko_drop');
    const cadence = conductor.getPlinkoCadence();

    // 0. Line-Shaft Drive Belt & Overhead Pulley (Active when looping)
    if (isLooping) {
      const pulleyCx = x + w - 12;
      const pulleyCy = y - 2;

      ctx.save();
      // Ceiling bracket
      ctx.fillStyle = '#292524';
      ctx.fillRect(pulleyCx - 10, 0, 20, 5);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(pulleyCx - 10, 0, 20, 5);

      // Taut leather drive belt running from ceiling rafters (y=0) to cabinet pulley
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pulleyCx - 5, 0);
      ctx.lineTo(pulleyCx - 5, pulleyCy);
      ctx.moveTo(pulleyCx + 5, 0);
      ctx.lineTo(pulleyCx + 5, pulleyCy);
      ctx.stroke();

      // Moving stitches along the drive belt
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      const stitchOffset = (timeMs * 0.08) % 8;
      for (let sy = stitchOffset; sy < pulleyCy; sy += 8) {
        ctx.beginPath();
        ctx.moveTo(pulleyCx - 6, sy);
        ctx.lineTo(pulleyCx - 4, sy);
        ctx.moveTo(pulleyCx + 4, sy);
        ctx.lineTo(pulleyCx + 6, sy);
        ctx.stroke();
      }

      // Brass drive pulley
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(pulleyCx, pulleyCy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Rotating pulley spokes
      const spokeRot = (timeMs * 0.007) % (Math.PI * 2);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pulleyCx - Math.cos(spokeRot) * 5, pulleyCy - Math.sin(spokeRot) * 5);
      ctx.lineTo(pulleyCx + Math.cos(spokeRot) * 5, pulleyCy + Math.sin(spokeRot) * 5);
      ctx.moveTo(pulleyCx - Math.cos(spokeRot + Math.PI / 2) * 5, pulleyCy - Math.sin(spokeRot + Math.PI / 2) * 5);
      ctx.lineTo(pulleyCx + Math.cos(spokeRot + Math.PI / 2) * 5, pulleyCy + Math.sin(spokeRot + Math.PI / 2) * 5);
      ctx.stroke();

      ctx.restore();
    }

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

    // Clutch indicator lamp on pediment
    ctx.fillStyle = isLooping ? '#22c55e' : '#292524';
    ctx.beginPath();
    ctx.arc(x + 10, y + 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    if (isLooping) {
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Golden marquee emblem
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('• GALTON CHUTE •', x + w / 2, y - 4);

    // 1.5. Rocking Brass Escapement Feeder Gate in the Hopper Mouth
    const gateX = x + w / 2;
    const gateY = y + 7;
    const rockAngle = isLooping ? Math.sin((timeMs / (60000 / 105)) * Math.PI * 2) * 0.35 : 0;

    ctx.save();
    ctx.translate(gateX, gateY);
    ctx.rotate(rockAngle);

    // Escapement rocker arm
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-10, -1.5, 20, 3);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-10, -1.5, 20, 3);

    // Left and right feeder pallets
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-10, 1.5, 2.5, 4);
    ctx.fillRect(7.5, -5.5, 2.5, 4);

    // Central brass pivot rivet
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

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

    // 3.2. Automated Kinetic Sovereign Stream (when loop is engaged)
    if (isLooping) {
      const streamCount = cadence === 'sixteenth_shaker' ? 3 : 2;
      const cycleDuration = cadence === 'sixteenth_shaker' ? 571 : 850;

      for (let s = 0; s < streamCount; s++) {
        const streamOffset = s / streamCount;
        const progress = ((timeMs + streamOffset * cycleDuration) % cycleDuration) / cycleDuration;
        const py = glassY + 4 + progress * (glassH - 14);

        // Sinusoidal deflection across pins
        const wiggle = Math.sin(progress * Math.PI * 4 + s * 2.1) * (glassW * 0.26);
        const px = glassX + glassW / 2 + wiggle;

        // Shiny mini gold sovereign
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Pin flash near coin
        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.beginPath();
        ctx.arc(px, py, 4.0, 0, Math.PI * 2);
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

      // Subtle pulse glow when looping
      if (isLooping) {
        const pulse = Math.sin(timeMs * 0.006 + b) > 0.4;
        if (pulse) {
          ctx.fillStyle = colors[b];
          ctx.globalAlpha = 0.25;
          ctx.fillRect(bx + 2, by + 1, binW - 4, 10);
          ctx.globalAlpha = 1.0;
        }
      }
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
