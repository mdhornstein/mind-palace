import { WorldStation, DeepReadonly, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { MintConductor } from '../mintConductor';
import { getLastMasterClutchTime } from '../conductorVitrineActions';

export const CONDUCTOR_VITRINE_TILE_X = 10.6;
export const CONDUCTOR_VITRINE_TILE_Y = 1.8;
export const CONDUCTOR_VITRINE_WIDTH = 2.2;
export const CONDUCTOR_VITRINE_HEIGHT = 3.2;

export const conductorVitrineStation: WorldStation = {
  id: 'mint_vitrine_console',
  name: "The Conductor's Horological Vitrine",
  prompt: 'Inspect Master Console (Space) / [F] Master Clutch',
  tileX: CONDUCTOR_VITRINE_TILE_X,
  tileY: CONDUCTOR_VITRINE_TILE_Y,
  tileWidth: CONDUCTOR_VITRINE_WIDTH,
  tileHeight: CONDUCTOR_VITRINE_HEIGHT,
  collisionBox: {
    x: CONDUCTOR_VITRINE_TILE_X * TILE_SIZE,
    y: 2.2 * TILE_SIZE,
    w: CONDUCTOR_VITRINE_WIDTH * TILE_SIZE,
    h: 2.4 * TILE_SIZE,
  },
  approachPoint: {
    x: (CONDUCTOR_VITRINE_TILE_X + CONDUCTOR_VITRINE_WIDTH / 2) * TILE_SIZE,
    y: 4.8 * TILE_SIZE,
  },
  intent: {
    type: 'modal',
    modalId: 'mint_conductor_vitrine',
  },
  primaryAction: {
    label: 'Master Clutch',
    intent: {
      type: 'custom',
      actionId: 'toggle_mint_master_clutch',
    },
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
    const baseX = CONDUCTOR_VITRINE_TILE_X * TILE_SIZE;
    const baseY = CONDUCTOR_VITRINE_TILE_Y * TILE_SIZE;
    const w = CONDUCTOR_VITRINE_WIDTH * TILE_SIZE;
    const h = CONDUCTOR_VITRINE_HEIGHT * TILE_SIZE;
    const cx = baseX + w / 2;

    const conductor = MintConductor.getInstance();
    const isRunning = conductor.isRunning();
    const beatPhase = conductor.getBeatPhase(timeMs);

    // 1. Overhead Copper Clockwork Conduits (Connecting to North Steam Trunk)
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    // Left conduit branch toward Steam Press
    ctx.beginPath();
    ctx.moveTo(cx - 10, baseY + 6);
    ctx.lineTo(cx - 10, baseY - 12);
    ctx.lineTo(baseX - 24, baseY - 12);
    ctx.stroke();
    // Right conduit branch toward Ringing Stone
    ctx.beginPath();
    ctx.moveTo(cx + 10, baseY + 6);
    ctx.lineTo(cx + 10, baseY - 12);
    ctx.lineTo(baseX + w + 28, baseY - 12);
    ctx.stroke();

    // Brass pipe couplings
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(cx - 13, baseY - 14, 6, 6);
    ctx.fillRect(cx + 7, baseY - 14, 6, 6);

    // 2. Carved Cuban Mahogany Cabinet Plinth & Frame
    ctx.fillStyle = '#1c0d06';
    ctx.fillRect(baseX + 2, baseY + h - 14, w - 4, 14); // lower base
    ctx.fillStyle = '#2b140b';
    ctx.fillRect(baseX + 4, baseY + 12, w - 8, h - 22); // main body casing

    // Ornate Pediment Top
    ctx.fillStyle = '#1c0d06';
    ctx.fillRect(baseX + 2, baseY + 8, w - 4, 6);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(baseX + 6, baseY + 4, w - 12, 5);

    // Brass corner brackets and finials
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(cx, baseY + 3, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(baseX + 3, baseY + 7, 3, 3);
    ctx.fillRect(baseX + w - 6, baseY + 7, 3, 3);

    // 3. Beveled Glass Vitrine Display (Dark felt interior with glass reflection)
    const glassX = baseX + 8;
    const glassY = baseY + 16;
    const glassW = w - 16;
    const glassH = h - 34;

    // Dark midnight felt backing
    ctx.fillStyle = '#080d14';
    ctx.fillRect(glassX, glassY, glassW, glassH);

    // Brass inner frame border
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(glassX, glassY, glassW, glassH);

    // 4. Exposed Rotating Escapement Gear Train (Top of Vitrine)
    const gearY = glassY + 14;
    ctx.save();
    ctx.translate(cx, gearY);

    const gearAngle = isRunning ? beatPhase * Math.PI * 2 : 0;
    ctx.rotate(gearAngle);

    // Brass gear body
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Gear teeth (8 teeth)
    ctx.fillStyle = '#f59e0b';
    for (let t = 0; t < 8; t++) {
      ctx.rotate((Math.PI * 2) / 8);
      ctx.fillRect(-1.5, -11, 3, 3);
    }
    ctx.restore();

    // Steel anchor verge arbor (stationary pivot pin)
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(cx, gearY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. Precision Master Compensation Pendulum
    const pendulumPivotY = gearY + 3;
    const pendulumLength = glassH - 24;
    const swingAngle = isRunning ? Math.sin(beatPhase * Math.PI * 2) * 0.24 : 0;

    ctx.save();
    ctx.translate(cx, pendulumPivotY);
    ctx.rotate(swingAngle);

    // Burnished steel pendulum suspension rod
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, pendulumLength);
    ctx.stroke();

    // Heavy cylindrical brass pendulum bob
    const bobY = pendulumLength - 4;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, bobY, 7, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight glint on bob
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(-1.5, bobY - 1.5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Mercury / zinc compensation cylinders inside bob
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3, bobY - 2.5, 6, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-2, bobY - 1.5, 4, 3);

    ctx.restore();

    // 6. Glass Specular Sheen (Subtle diagonal reflection across the vitrine face)
    const glassGrad = ctx.createLinearGradient(glassX, glassY, glassX + glassW, glassY + glassH);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    glassGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.05)');
    glassGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
    glassGrad.addColorStop(0.85, 'rgba(255, 255, 255, 0.12)');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(glassX, glassY, glassW, glassH);

    // 7. Four Miniature Instrument Status Lamps (Lower Console Rail)
    // Ordered: Press (Kick), Tally (Snare), Chute (Hi-Hat), Stone (Lead Bells)
    const lampY = baseY + h - 11;
    const channels = [
      { id: 'mint_coin_press', muted: conductor.isChannelMuted('press') },
      { id: 'mint_tally_board', muted: conductor.isChannelMuted('tally') },
      { id: 'plinko_drop', muted: conductor.isChannelMuted('plinko') },
      { id: 'mint_ringing_stone', muted: conductor.isChannelMuted('stone') },
    ];

    const lampSpacing = (w - 20) / 3;
    channels.forEach((ch, idx) => {
      const lx = baseX + 10 + idx * lampSpacing;
      const isLoop = conductor.isStationLooping(ch.id);

      ctx.beginPath();
      ctx.arc(lx, lampY, 2.2, 0, Math.PI * 2);

      if (isLoop && !ch.muted) {
        // Emerald active pulse
        ctx.fillStyle = '#22c55e';
        ctx.fill();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      } else if (isLoop && ch.muted) {
        // Amber muted loop
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
      } else {
        // Ruby disengaged
        ctx.fillStyle = '#7f1d1d';
        ctx.fill();
      }
    });

    // 8. Heavy Cast-Iron & Brass Master Clutch Hand Lever (Right Side)
    const clutchElapsed = timeMs - getLastMasterClutchTime();
    const clutchThrowProgress = Math.min(1, clutchElapsed / 220);
    // Lever angle: 0 = upright (disengaged), ~0.6 rad forward = engaged
    const targetAngle = isRunning ? 0.65 : 0.05;
    const initialAngle = isRunning ? 0.05 : 0.65;
    const leverAngle =
      clutchElapsed < 220
        ? initialAngle + (targetAngle - initialAngle) * (1 - Math.cos(clutchThrowProgress * Math.PI)) / 2
        : targetAngle;

    const leverBaseX = baseX + w - 2;
    const leverBaseY = baseY + 46;

    ctx.save();
    ctx.translate(leverBaseX, leverBaseY);

    // Cast-iron mounting bracket
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2, -3, 6, 7);

    // Pivot and rotate lever arm
    ctx.rotate(leverAngle);

    // Steel lever arm
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, -16);
    ctx.stroke();

    // Polished brass handle grip
    ctx.fillStyle = isRunning ? '#22c55e' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(8, -16, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.restore();
  },
};
