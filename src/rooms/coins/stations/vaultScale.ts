import { WorldStation, DeepReadonly, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';

export const vaultScaleStation: WorldStation = {
  id: 'vault_scale',
  name: 'The Sovereign Balance',
  prompt: 'Weigh Sovereigns (Inspect Vault Records)',
  tileX: 2.5,
  tileY: 2.2,
  tileWidth: 2.5,
  tileHeight: 2.8,
  collisionBox: {
    x: 2.5 * TILE_SIZE,
    y: 2.5 * TILE_SIZE,
    w: 2.5 * TILE_SIZE,
    h: 2.2 * TILE_SIZE,
  },
  approachPoint: {
    x: 3.75 * TILE_SIZE,
    y: 5.2 * TILE_SIZE,
  },
  intent: {
    type: 'modal',
    modalId: 'vault_scale',
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
    const baseX = 2.5 * TILE_SIZE;
    const baseY = 2.0 * TILE_SIZE;
    const cx = baseX + 1.25 * TILE_SIZE;

    // 1. Polished Rosewood Cabinet Plinth
    ctx.fillStyle = '#261208';
    ctx.fillRect(baseX + 6, baseY + 54, 68, 22);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(baseX + 6, baseY + 54, 68, 22);

    // Green velvet scale mat
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(baseX + 10, baseY + 52, 60, 4);

    // 2. Central Polished Brass Column
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(cx - 2.5, baseY + 18, 5, 34);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cx - 1, baseY + 18, 2, 34); // highlight glint

    // Ornate brass finial atop the column
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(cx, baseY + 16, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Tilting Balance Beam (Gentle harmonic oscillation)
    const beamAngle = Math.sin(timeMs * 0.002) * 0.08; // subtle tilt
    const beamHalfWidth = 28;

    ctx.save();
    ctx.translate(cx, baseY + 18);
    ctx.rotate(beamAngle);

    // Main horizontal beam
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-beamHalfWidth, 0);
    ctx.lineTo(beamHalfWidth, 0);
    ctx.stroke();

    // Left suspension cord & pan
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-beamHalfWidth, 0);
    ctx.lineTo(-beamHalfWidth - 6, 22);
    ctx.moveTo(-beamHalfWidth, 0);
    ctx.lineTo(-beamHalfWidth + 6, 22);
    ctx.stroke();

    // Left brass pan
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(-beamHalfWidth, 22, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden sovereign sitting on left pan
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-beamHalfWidth - 3, 19, 6, 3);

    // Right suspension cord & pan
    ctx.beginPath();
    ctx.moveTo(beamHalfWidth, 0);
    ctx.lineTo(beamHalfWidth - 6, 22);
    ctx.moveTo(beamHalfWidth, 0);
    ctx.lineTo(beamHalfWidth + 6, 22);
    ctx.stroke();

    // Right brass pan
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(beamHalfWidth, 22, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cylindrical basalt reference weight on right pan
    ctx.fillStyle = '#334155';
    ctx.fillRect(beamHalfWidth - 4, 17, 8, 5);

    ctx.restore();
  },
};

export const mintScaleStation: WorldStation = {
  ...vaultScaleStation,
  id: 'mint_scale',
};

