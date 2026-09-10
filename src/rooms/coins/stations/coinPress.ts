import { WorldStation, DeepReadonly, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { getLastCrankTriggerTime } from '../coinMachineActions';
import { MintConductor } from '../mintConductor';

// Established machine layout & chute aperture geometry
export const COIN_PRESS_BASE_X = 7.0 * TILE_SIZE;
export const COIN_PRESS_BASE_Y = 2.0 * TILE_SIZE;
export const COIN_PRESS_CHUTE_OFFSET_X = 57;
export const COIN_PRESS_CHUTE_OFFSET_Y = 78;
export const COIN_PRESS_CHUTE_X = COIN_PRESS_BASE_X + COIN_PRESS_CHUTE_OFFSET_X;
export const COIN_PRESS_CHUTE_Y = COIN_PRESS_BASE_Y + COIN_PRESS_CHUTE_OFFSET_Y;

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
        originX: COIN_PRESS_CHUTE_X,
        originY: COIN_PRESS_CHUTE_Y,
      },
    },
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
    const baseX = COIN_PRESS_BASE_X;
    const baseY = COIN_PRESS_BASE_Y;
    const conductor = MintConductor.getInstance();
    const isLooping = conductor.isStationLooping('mint_coin_press');

    // 0. Overhead Line Shaft & Leather Drive Belt (When rhythmically engaged)
    const flywheelCx = baseX + 24;
    const flywheelCy = baseY + 36;
    const flywheelR = 22;

    if (isLooping) {
      ctx.save();
      // Moving dual leather belts connecting flywheel to overhead rafters
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(flywheelCx - 16, flywheelCy);
      ctx.lineTo(flywheelCx - 10, 0);
      ctx.moveTo(flywheelCx + 16, flywheelCy);
      ctx.lineTo(flywheelCx + 10, 0);
      ctx.stroke();

      // Scrolling belt texture hashes
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      const beltScroll = (timeMs * 0.08) % 14;
      for (let by = 2; by < flywheelCy; by += 14) {
        const yPos = (by + beltScroll) % flywheelCy;
        const xLeft = flywheelCx - 10 - (yPos / flywheelCy) * 6;
        const xRight = flywheelCx + 10 + (yPos / flywheelCy) * 6;
        ctx.beginPath();
        ctx.moveTo(xLeft - 2, yPos);
        ctx.lineTo(xLeft + 2, yPos);
        ctx.moveTo(xRight - 2, yPos);
        ctx.lineTo(xRight + 2, yPos);
        ctx.stroke();
      }

      // Overhead steel line-shaft bracket
      ctx.fillStyle = '#292524';
      ctx.fillRect(flywheelCx - 18, 0, 36, 5);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.strokeRect(flywheelCx - 18, 0, 36, 5);
      ctx.restore();
    }

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

    // Green indicator lamp for line-shaft clutch
    if (isLooping) {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(baseX + 22, baseY + 26, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Rotating Flywheel on Left (Spins faster when line shaft is engaged)
    const rotSpeed = isLooping ? 0.007 : 0.003;
    const rot = (timeMs * rotSpeed) % (Math.PI * 2);

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

    // 4. Stamping Piston Head (Vertical reciprocating motion + beat hit recoil + crank impact recoil)
    const now = Date.now();
    const lastCrank = getLastCrankTriggerTime();
    const crankElapsed = now - lastCrank;
    const crankRecoil = crankElapsed < 220 ? Math.max(0, 1 - crankElapsed / 220) : 0;

    let pistonY: number;
    let loopImpactGlow = 0;

    if (isLooping) {
      // Precise beat phase from conductor (quarter note = 571ms at 105 BPM)
      const beatPhase = conductor.getBeatPhase(timeMs);
      let strokeOffset = 0;
      if (beatPhase < 0.65) {
        // Lift die block up smoothly
        strokeOffset = -7 * Math.sin((beatPhase / 0.65) * (Math.PI / 2));
      } else if (beatPhase < 0.88) {
        // Downward power acceleration
        const downT = (beatPhase - 0.65) / 0.23;
        strokeOffset = -7 + 16 * downT; // punches down to +9px
      } else {
        // Impact recoil and settle
        const recoilT = (beatPhase - 0.88) / 0.12;
        strokeOffset = 9 - 4 * Math.sin(recoilT * Math.PI);
        loopImpactGlow = 1 - recoilT;
      }
      pistonY = baseY + 26 + strokeOffset + crankRecoil * 5;
    } else {
      const pistonCycle = (Math.sin(timeMs * 0.006) + 1) / 2; // 0 to 1
      pistonY = baseY + 26 + pistonCycle * 8 + crankRecoil * 5;
    }

    // Piston guide shaft
    ctx.fillStyle = '#64748b';
    ctx.fillRect(baseX + 50, baseY + 14, 14, 34);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(baseX + 50, baseY + 14, 14, 34);

    // Hardened tool-steel die block (Glows white-gold on beat impact or manual crank)
    ctx.fillStyle = (crankRecoil > 0.4 || loopImpactGlow > 0.3) ? '#fef08a' : '#f59e0b';
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

    // Vibrating pressure needle (kicks hard on beat impact and manual crank)
    const impactPulse = Math.max(crankRecoil, loopImpactGlow * 0.85);
    const needleJitter = (Math.sin(timeMs * 0.02) * 0.3 + 0.3) + impactPulse * 0.85;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(gaugeCx, gaugeCy);
    ctx.lineTo(
      gaugeCx + Math.cos(needleJitter - Math.PI / 2) * 6.5,
      gaugeCy + Math.sin(needleJitter - Math.PI / 2) * 6.5
    );
    ctx.stroke();

    // Steam exhaust wisp & rhythmic puff burst
    const steamAlpha = (Math.sin(timeMs * 0.005) + 1) * 0.25 + impactPulse * 0.65;
    ctx.fillStyle = `rgba(241, 245, 249, ${Math.min(1, steamAlpha)})`;
    ctx.beginPath();
    ctx.arc(baseX + 88, baseY + 4 - (timeMs * 0.02 % 14), 4 + (timeMs * 0.01 % 5) + impactPulse * 5, 0, Math.PI * 2);
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
        originX: COIN_PRESS_CHUTE_X,
        originY: COIN_PRESS_CHUTE_Y,
      },
    },
  },
};

