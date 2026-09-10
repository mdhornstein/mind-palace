import { WorldStation, DeepReadonly, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { getLastCrankTriggerTime } from '../coinMachineActions';

export const coinPressStation: WorldStation = {
  id: 'mint_coin_press',
  name: 'The Grand Minting Engine',
  prompt: 'Inspect Mint Controls & Ledger',
  tileX: 7.0,
  tileY: 2.5,
  tileWidth: 3.5,
  tileHeight: 2.8,
  collisionBox: {
    x: 7.0 * TILE_SIZE,
    y: 2.8 * TILE_SIZE,
    w: 3.5 * TILE_SIZE,
    h: 2.2 * TILE_SIZE,
  },
  approachPoint: {
    x: 8.75 * TILE_SIZE,
    y: 5.3 * TILE_SIZE,
  },
  intent: {
    type: 'modal',
    modalId: 'coin_press',
  },
  primaryAction: {
    label: 'Crank Press',
    intent: {
      type: 'custom',
      actionId: 'mint_crank_press',
      params: {
        stationId: 'mint_coin_press',
        originX: 7.0 * TILE_SIZE + 57,
        originY: 2.0 * TILE_SIZE + 78,
      },
    },
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
    const baseX = 7.0 * TILE_SIZE;
    const baseY = 2.0 * TILE_SIZE;

    // 1. Cast-Iron Base & Stone Plinth
    ctx.fillStyle = '#1e1b18';
    ctx.fillRect(baseX + 4, baseY + 64, 104, 26);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(baseX + 4, baseY + 64, 104, 26);

    // Bolted foundation rivets
    ctx.fillStyle = '#d97706';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(baseX + 10 + i * 22, baseY + 84, 3, 3);
    }

    // 2. Heavy Minting Frame (Deep bronze with dark green enamel)
    ctx.fillStyle = '#143026';
    ctx.fillRect(baseX + 14, baseY + 18, 84, 52);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.strokeRect(baseX + 14, baseY + 18, 84, 52);

    // 3. Rotating Flywheel on Left (Spokes rotate continuously)
    const flywheelCx = baseX + 24;
    const flywheelCy = baseY + 36;
    const flywheelR = 22;
    const rot = (timeMs * 0.003) % (Math.PI * 2);

    // Outer flywheel rim
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(flywheelCx, flywheelCy, flywheelR, 0, Math.PI * 2);
    ctx.stroke();

    // Inner bronze hub
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(flywheelCx, flywheelCy, 6, 0, Math.PI * 2);
    ctx.fill();

    // Rotating spokes
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#d97706';
    for (let a = 0; a < 4; a++) {
      const angle = rot + (a * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(flywheelCx, flywheelCy);
      ctx.lineTo(
        flywheelCx + Math.cos(angle) * (flywheelR - 2),
        flywheelCy + Math.sin(angle) * (flywheelR - 2)
      );
      ctx.stroke();
    }

    // 4. Stamping Piston Head (Vertical reciprocating motion + crank impact recoil)
    const now = Date.now();
    const lastCrank = getLastCrankTriggerTime();
    const crankElapsed = now - lastCrank;
    const crankRecoil = crankElapsed < 220 ? Math.max(0, 1 - crankElapsed / 220) : 0;

    const pistonCycle = (Math.sin(timeMs * 0.006) + 1) / 2; // 0 to 1
    const pistonY = baseY + 26 + pistonCycle * 8 + crankRecoil * 5;

    // Piston guide shaft
    ctx.fillStyle = '#64748b';
    ctx.fillRect(baseX + 50, baseY + 14, 14, 34);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(baseX + 50, baseY + 14, 14, 34);

    // Hardened tool-steel die block
    ctx.fillStyle = crankRecoil > 0.4 ? '#fef08a' : '#f59e0b';
    ctx.fillRect(baseX + 46, pistonY + 12, 22, 10);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(baseX + 48, pistonY + 14, 18, 2); // polished mirror face

    // 5. Overhead Steam Pressure Gauge
    const gaugeCx = baseX + 78;
    const gaugeCy = baseY + 14;
    ctx.fillStyle = '#fefce8';
    ctx.beginPath();
    ctx.arc(gaugeCx, gaugeCy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Vibrating pressure needle (kicks hard on crank)
    const needleJitter = (Math.sin(timeMs * 0.02) * 0.4 + 0.3) + crankRecoil * 0.8;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(gaugeCx, gaugeCy);
    ctx.lineTo(
      gaugeCx + Math.cos(needleJitter - Math.PI / 2) * 6.5,
      gaugeCy + Math.sin(needleJitter - Math.PI / 2) * 6.5
    );
    ctx.stroke();

    // Steam exhaust wisp & crank puff burst
    const steamAlpha = (Math.sin(timeMs * 0.005) + 1) * 0.25 + crankRecoil * 0.6;
    ctx.fillStyle = `rgba(241, 245, 249, ${Math.min(1, steamAlpha)})`;
    ctx.beginPath();
    ctx.arc(baseX + 88, baseY + 4 - (timeMs * 0.02 % 14), 4 + (timeMs * 0.01 % 5) + crankRecoil * 4, 0, Math.PI * 2);
    ctx.fill();

    // 6. Polished Brass Ejection Chute (angled toward room floor)
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(baseX + 50, baseY + 58);
    ctx.lineTo(baseX + 64, baseY + 58);
    ctx.lineTo(baseX + 70, baseY + 78);
    ctx.lineTo(baseX + 44, baseY + 78);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Chute mouth aperture
    ctx.fillStyle = '#0f0a07';
    ctx.beginPath();
    ctx.ellipse(baseX + 57, baseY + 78, 13, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ready golden coin poised at chute rim
    const gleam = (Math.sin(timeMs * 0.008) + 1) * 0.5;
    ctx.fillStyle = gleam > 0.6 ? '#fef08a' : '#eab308';
    ctx.beginPath();
    ctx.ellipse(baseX + 57, baseY + 77, 8, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  },
};

export const vaultCoinPressStation: WorldStation = {
  ...coinPressStation,
  id: 'vault_coin_press',
  primaryAction: {
    label: 'Crank Press',
    intent: {
      type: 'custom',
      actionId: 'mint_crank_press',
      params: {
        stationId: 'vault_coin_press',
        originX: 7.0 * TILE_SIZE + 57,
        originY: 2.0 * TILE_SIZE + 78,
      },
    },
  },
};

