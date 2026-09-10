import { WorldStation, DeepReadonly, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { getLastStoneStrikeTime, getStoneNoteIndex } from '../ringingStoneActions';
import { MintConductor } from '../mintConductor';

export const RINGING_STONE_TILE_X = 13.5;
export const RINGING_STONE_TILE_Y = 6.8;

export const ringingStoneStation: WorldStation = {
  id: 'mint_ringing_stone',
  name: 'The Ringing Stone',
  prompt: "Inspect Assayer's Acoustic Bench",
  tileX: RINGING_STONE_TILE_X,
  tileY: RINGING_STONE_TILE_Y,
  tileWidth: 2.5,
  tileHeight: 2.5,
  collisionBox: {
    x: RINGING_STONE_TILE_X * TILE_SIZE,
    y: 7.2 * TILE_SIZE,
    w: 2.5 * TILE_SIZE,
    h: 2.0 * TILE_SIZE,
  },
  approachPoint: {
    x: 12.0 * TILE_SIZE,
    y: 8.2 * TILE_SIZE,
  },
  intent: {
    type: 'modal',
    modalId: 'ringing_stone',
  },
  primaryAction: {
    label: 'Sound the Stone',
    intent: {
      type: 'custom',
      actionId: 'strike_ringing_stone',
      params: {
        stationId: 'mint_ringing_stone',
      },
    },
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
    const baseX = RINGING_STONE_TILE_X * TILE_SIZE;
    const baseY = RINGING_STONE_TILE_Y * TILE_SIZE;
    const cx = baseX + 1.25 * TILE_SIZE;
    const cy = baseY + 1.25 * TILE_SIZE;

    const conductor = MintConductor.getInstance();
    const isLooping = conductor.isStationLooping('mint_ringing_stone');

    // Check strike timing for dynamic physical animations
    const now = Date.now();
    const lastManualStrike = getLastStoneStrikeTime('mint_ringing_stone');
    const manualElapsed = now - lastManualStrike;
    const isManualStriking = manualElapsed < 650;

    let isStriking = false;
    let strikeProgress = 1;
    let activeNoteIdx = 0;

    if (isManualStriking) {
      isStriking = true;
      strikeProgress = manualElapsed / 650;
      activeNoteIdx = getStoneNoteIndex('mint_ringing_stone');
    } else if (isLooping) {
      const stoneCadence = conductor.getStoneCadence();
      const beatPhase = conductor.getBeatPhase(timeMs);
      isStriking = true;

      if (stoneCadence === 'quarter_chime') {
        // Quarter note strikes once per quarter beat
        strikeProgress = beatPhase;
        activeNoteIdx = conductor.getVisualNoteIndex();
      } else if (stoneCadence === 'offbeat') {
        // Syncopated upbeat strikes halfway through the beat
        strikeProgress = (beatPhase + 0.5) % 1;
        activeNoteIdx = conductor.getVisualNoteIndex();
      } else if (stoneCadence === 'root_drone') {
        // Whole-note downbeat once per 4 beats (measure cycle)
        const barDurationMs = (60.0 / conductor.getBpm()) * 4000;
        strikeProgress = (timeMs % barDurationMs) / barDurationMs;
        activeNoteIdx = 0;
      } else {
        // pentatonic_arp: 8th-note cadence
        const eighthPhase = (beatPhase * 2) % 1;
        strikeProgress = eighthPhase;
        activeNoteIdx = conductor.getVisualNoteIndex();
      }
    }

    // 1. Acoustic Shockwave Ripple expanding across the floor
    if (isStriking) {
      const maxRadius = isManualStriking ? 38 : 22;
      const rippleRadius = strikeProgress * maxRadius;
      const rippleAlpha = Math.max(0, 1 - strikeProgress);
      ctx.save();
      const strokeCol = isManualStriking
        ? `rgba(250, 204, 21, ${rippleAlpha * 0.75})`
        : `rgba(56, 189, 248, ${rippleAlpha * 0.65})`;
      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = (isManualStriking ? 2 : 1.5) * (1 - strikeProgress * 0.5);
      ctx.beginPath();
      ctx.ellipse(cx, cy + 10, rippleRadius, rippleRadius * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Secondary faint outer ripple
      if (strikeProgress > 0.15) {
        const r2 = (strikeProgress - 0.15) * (maxRadius * 0.9);
        ctx.strokeStyle = isManualStriking
          ? `rgba(245, 158, 11, ${rippleAlpha * 0.4})`
          : `rgba(250, 204, 21, ${rippleAlpha * 0.35})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10, r2, r2 * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Carved Dark Mahogany Octagonal Pedestal Base
    ctx.fillStyle = '#1c1008';
    ctx.fillRect(baseX + 10, baseY + 36, 60, 28);
    ctx.strokeStyle = '#5c2d10';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(baseX + 10, baseY + 36, 60, 28);

    // Horological Clockwork Vitrine Window (Recessed glass display on pedestal face)
    const clockX = baseX + 28;
    const clockY = baseY + 40;
    const clockW = 24;
    const clockH = 18;
    ctx.fillStyle = '#0a0705';
    ctx.fillRect(clockX, clockY, clockW, clockH);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.strokeRect(clockX, clockY, clockW, clockH);

    // Winding arbor keyhole on left
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(clockX - 8, clockY + 9, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f0a07';
    ctx.fillRect(clockX - 9, clockY + 8, 2, 2);

    // Miniature descending brass counterweight chain on right
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(clockX + clockW + 6, clockY);
    ctx.lineTo(clockX + clockW + 6, clockY + 14);
    ctx.stroke();
    // Teardrop brass counterweight
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(clockX + clockW + 6, clockY + 15, 2, 0, Math.PI * 2);
    ctx.fill();

    // Horological Escapement Pendulum (Oscillates at 105 BPM when engaged)
    const pendPivotX = clockX + clockW / 2;
    const pendPivotY = clockY + 2;
    const bpmFreq = (conductor.getBpm() / 60) * Math.PI;
    const pendAngle = isLooping ? Math.sin(timeMs * 0.001 * bpmFreq) * 0.28 : 0;
    const pendLen = 11;
    const bobX = pendPivotX + Math.sin(pendAngle) * pendLen;
    const bobY = pendPivotY + Math.cos(pendAngle) * pendLen;

    // Pendulum rod
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pendPivotX, pendPivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();

    // Polished brass pendulum bob
    ctx.fillStyle = isLooping ? '#fef08a' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(bobX, bobY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Glass reflection gleam across clock window
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(clockX + 2, clockY + clockH - 2);
    ctx.lineTo(clockX + clockW - 2, clockY + 2);
    ctx.stroke();

    // Turned wood plinth mouldings
    ctx.fillStyle = '#2a160a';
    ctx.fillRect(baseX + 6, baseY + 60, 68, 6);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.strokeRect(baseX + 6, baseY + 60, 68, 6);

    // Brass corner studs
    ctx.fillStyle = '#d97706';
    ctx.fillRect(baseX + 12, baseY + 40, 3, 3);
    ctx.fillRect(baseX + 65, baseY + 40, 3, 3);
    ctx.fillRect(baseX + 12, baseY + 54, 3, 3);
    ctx.fillRect(baseX + 65, baseY + 54, 3, 3);

    // 3. Heavy Circular Brass Bezel & Acoustic Sounding Collar
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 32, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Outer brass calibration ticks
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    for (let a = 0; a < 8; a++) {
      const ang = (a * Math.PI) / 4;
      const tx1 = cx + Math.cos(ang) * 28;
      const ty1 = cy + 4 + Math.sin(ang) * 15;
      const tx2 = cx + Math.cos(ang) * 31;
      const ty2 = cy + 4 + Math.sin(ang) * 17;
      ctx.beginPath();
      ctx.moveTo(tx1, ty1);
      ctx.lineTo(tx2, ty2);
      ctx.stroke();
    }

    // 4. Central Mirror-Black Polished Basalt Anvil Disc
    const basaltGrad = ctx.createRadialGradient(cx - 4, cy + 1, 2, cx, cy + 4, 25);
    basaltGrad.addColorStop(0, '#262626');
    basaltGrad.addColorStop(0.6, '#0f1115');
    basaltGrad.addColorStop(1, '#05070a');
    ctx.fillStyle = basaltGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, 25, 13.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#171717';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Polished stone surface specular gleam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.ellipse(cx - 7, cy + 1, 10, 4.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 5. Spring-Loaded Brass Striker Hammer (Left side)
    const hammerThreshold = isManualStriking ? 0.25 : 0.35;
    const hammerRecoil = isStriking && strikeProgress < hammerThreshold ? Math.sin((strikeProgress / hammerThreshold) * Math.PI) : 0;
    const hammerPivotX = cx - 26;
    const hammerPivotY = cy - 2;
    const hammerAngle = -0.4 - hammerRecoil * 0.65;

    // Clockwork Escapement Cam Wheel (Visible when carillon is engaged)
    if (isLooping) {
      const stoneCadence = conductor.getStoneCadence();
      const camX = baseX + 14;
      const camY = baseY + 28;
      const camSpeed = stoneCadence === 'pentatonic_arp' ? 0.006 : stoneCadence === 'root_drone' ? 0.0015 : 0.003;
      const camRot = (timeMs * camSpeed) % (Math.PI * 2);
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(camX, camY, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Pinned brass escapement pegs
      for (let p = 0; p < 6; p++) {
        const pAng = camRot + (p * Math.PI) / 3;
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(camX + Math.cos(pAng) * 4 - 1, camY + Math.sin(pAng) * 4 - 1, 2, 2);
      }
    }

    ctx.save();
    ctx.translate(hammerPivotX, hammerPivotY);
    ctx.rotate(hammerAngle);

    // Spring leaf
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, -8);
    ctx.stroke();

    // Brass hammer arm
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(16, 6);
    ctx.stroke();

    // Hammer head
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(14, 2, 7, 7);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 2, 7, 7);
    ctx.restore();

    // 6. Acoustic Brass Listening Horn / Resonator (Right side)
    const hornX = cx + 22;
    const hornY = cy - 6;
    ctx.save();
    // Supporting brass gooseneck arm
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + 28, cy + 14);
    ctx.quadraticCurveTo(cx + 34, hornY + 12, hornX + 6, hornY + 4);
    ctx.stroke();

    // Horn bell funnel
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(hornX - 6, hornY - 6);
    ctx.lineTo(hornX + 10, hornY - 2);
    ctx.lineTo(hornX + 10, hornY + 10);
    ctx.lineTo(hornX - 6, hornY + 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Horn bell mouth aperture
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(hornX - 6, hornY + 4, 3, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 7. The Silver Shilling on the Basalt Stone (Animated Coin Toss)
    let coinElevation = 0;
    let coinScaleX = 1;
    let coinScaleY = 1;

    if (isStriking) {
      // Parabolic flip arc up and down
      const maxElev = isManualStriking ? 18 : 6;
      const spinSpeed = isManualStriking ? 6 : 2;
      coinElevation = Math.sin(strikeProgress * Math.PI) * maxElev;
      // High-speed tumble spinning
      coinScaleX = Math.cos(strikeProgress * Math.PI * spinSpeed);
      coinScaleY = 1 + (1 - strikeProgress) * 0.2;
    } else {
      // Idle resting coin on stone
      coinElevation = 0;
    }

    const coinX = cx + (isStriking ? (1 - strikeProgress) * 4 : 2);
    const coinY = cy + 2 - coinElevation;

    // Coin ground shadow when in mid-air
    if (coinElevation > 1) {
      const shadowAlpha = Math.max(0.1, 0.45 * (1 - coinElevation / 20));
      ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(cx + 2, cy + 4, 6 * (1 + coinElevation * 0.05), 3 * (1 + coinElevation * 0.05), 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render spinning Sterling Shilling
    ctx.save();
    ctx.translate(coinX, coinY);
    ctx.scale(coinScaleX, coinScaleY);

    // Silver coin rim
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.ellipse(0, 0, 6.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner face
    if (Math.abs(coinScaleX) > 0.3) {
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.ellipse(0, 0, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Gleam glint
      const gleam = (Math.sin(timeMs * 0.007) + 1) * 0.5;
      if (gleam > 0.7 && !isStriking) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(-1.5, -0.8, 2.5, 1, -0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // 8. Floating Musical Note glyph on strike
    if (isStriking) {
      const noteNames = ['C', 'D', 'E', 'G', 'A', 'C′', 'D′'];
      const currentNote = noteNames[activeNoteIdx % noteNames.length];

      const noteAlpha = Math.sin(strikeProgress * Math.PI);
      const noteY = cy - 14 - strikeProgress * 16;
      ctx.save();
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = isManualStriking
        ? `rgba(254, 240, 138, ${noteAlpha})`
        : `rgba(56, 189, 248, ${noteAlpha})`;
      ctx.shadowColor = isManualStriking ? '#f59e0b' : '#38bdf8';
      ctx.shadowBlur = 4;
      ctx.fillText(`♪ ${currentNote}`, cx, noteY);
      ctx.restore();
    }
  },
};
