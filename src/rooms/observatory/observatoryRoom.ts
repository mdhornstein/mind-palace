import { RoomConfig, WorldState, DeepReadonly } from '../../core/types';
import {
  TILE_SIZE,
  ROOM_WIDTH_TILES,
  ROOM_HEIGHT_TILES,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../../core/constants';
import { telescopeStation } from './stations/telescope';
import { starChartStation } from './stations/starChart';
import { orreryStation } from './stations/orrery';
import { drawObservatoryDoorway } from '../../render/sprites';

// Fixed seed random generator for stable starfield positions
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const observatoryRoomConfig: RoomConfig = {
  id: 'observatory',
  name: 'The Stargazing Observatory',
  widthTiles: ROOM_WIDTH_TILES,
  heightTiles: ROOM_HEIGHT_TILES,
  stations: [telescopeStation, starChartStation, orreryStation],
  doors: [
    {
      id: 'to_study',
      name: 'Portal to The Study',
      prompt: 'Return to The Study',
      tileX: 8.5,
      tileY: 1.0,
      tileWidth: 3.0,
      tileHeight: 2.5,
      targetRoomId: 'study',
      targetSpawnPoint: {
        x: 10 * TILE_SIZE,
        y: 13.0 * TILE_SIZE,
        facing: 'up',
      },
      transitionMode: 'auto',
    },
  ],
  ambientLight: {
    type: 'night',
    primaryGlowColor: '#38bdf8',
  },

  // 1. Static Room Architecture (Midnight Stone Flagstones, Open Panoramic Dome, Brass Inlays)
  customDrawBackground: (ctx: CanvasRenderingContext2D, _state: DeepReadonly<WorldState>) => {
    // Fill background void
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Panoramic Open Dome Aperture (Sky above y = 145)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 145);
    skyGrad.addColorStop(0, '#020617');
    skyGrad.addColorStop(0.5, '#0b132b');
    skyGrad.addColorStop(1, '#1c2541');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 145);

    // Subtle violet & cyan nebula gas clouds
    const nebGrad1 = ctx.createRadialGradient(220, 60, 10, 220, 60, 90);
    nebGrad1.addColorStop(0, 'rgba(139, 92, 246, 0.18)');
    nebGrad1.addColorStop(0.6, 'rgba(129, 140, 248, 0.08)');
    nebGrad1.addColorStop(1, 'transparent');
    ctx.fillStyle = nebGrad1;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 145);

    const nebGrad2 = ctx.createRadialGradient(450, 45, 10, 450, 45, 80);
    nebGrad2.addColorStop(0, 'rgba(56, 189, 248, 0.20)');
    nebGrad2.addColorStop(0.7, 'rgba(6, 182, 212, 0.06)');
    nebGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = nebGrad2;
    ctx.fillRect(0, 0, CANVAS_WIDTH, 145);

    // Static base stars (animated twinkle overlaid in atmosphere)
    for (let i = 0; i < 90; i++) {
      const sx = pseudoRandom(i * 13.7) * CANVAS_WIDTH;
      const sy = pseudoRandom(i * 29.3) * 130 + 6;
      const mag = pseudoRandom(i * 7.1);
      ctx.fillStyle = mag > 0.8 ? '#f8fafc' : mag > 0.4 ? '#93c5fd' : '#cbd5e1';
      const sz = mag > 0.85 ? 1.8 : 1.0;
      ctx.fillRect(sx, sy, sz, sz);
    }

    // Curved Gothic Iron Dome Arches & Ribs
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    // Outer dome arch
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, 170, 290, Math.PI, 0);
    ctx.stroke();

    // Curved architectural dome ribs radiating to summit
    ctx.lineWidth = 2.5;
    [-0.38, -0.22, -0.08, 0.08, 0.22, 0.38].forEach((radOffset) => {
      ctx.beginPath();
      ctx.moveTo(CANVAS_WIDTH / 2 + Math.sin(radOffset * Math.PI) * 290, 145);
      ctx.quadraticCurveTo(
        CANVAS_WIDTH / 2 + Math.sin(radOffset * Math.PI) * 140,
        40,
        CANVAS_WIDTH / 2,
        6
      );
      ctx.stroke();
    });

    // Dome aperture rim with brass rivets
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 140, CANVAS_WIDTH, 10);
    ctx.fillStyle = '#d97706';
    for (let rx = 12; rx < CANVAS_WIDTH; rx += 24) {
      ctx.fillRect(rx, 144, 2, 2);
    }

    // 2. Midnight Stone Flagstone Floor (y: 150 to CANVAS_HEIGHT)
    const floorRows = Math.ceil((CANVAS_HEIGHT - 150) / 24);
    for (let r = 0; r < floorRows; r++) {
      const fy = 150 + r * 24;
      const offset = (r % 2) * 24;
      for (let fx = -24; fx < CANVAS_WIDTH + 24; fx += 48) {
        const stoneX = fx + offset;
        const hash = Math.sin(r * 9.1 + stoneX * 3.3);
        ctx.fillStyle = hash > 0.3 ? '#1e293b' : hash > -0.3 ? '#182030' : '#131b28';
        ctx.fillRect(stoneX, fy, 46, 22);

        // Mortar grooves
        ctx.strokeStyle = '#0a0f1d';
        ctx.lineWidth = 1;
        ctx.strokeRect(stoneX + 0.5, fy + 0.5, 45, 21);
      }
    }

    // 3. Celestial Brass Floor Inlay (Grand central astronomical compass)
    const floorCenterX = CANVAS_WIDTH / 2;
    const floorCenterY = 320;

    // Outer brass zodiac ring
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(floorCenterX, floorCenterY, 150, 68, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Inner brass ring
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(floorCenterX, floorCenterY, 120, 54, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 8-Point Astronomical Compass Star inlaid in stone
    const starRadii = [
      { rx: 90, ry: 40 },
      { rx: 36, ry: 16 },
    ];
    ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
    ctx.beginPath();
    for (let pt = 0; pt < 16; pt++) {
      const ang = (pt * Math.PI) / 8;
      const rIdx = pt % 2 === 0 ? 0 : 1;
      const rad = starRadii[rIdx];
      const px = floorCenterX + Math.cos(ang) * rad.rx;
      const py = floorCenterY + Math.sin(ang) * rad.ry;
      if (pt === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // 4. Grand Entrance Terrace, Balustrades & Steps from Study
    const terrX = 236;
    const terrW = 168;
    // Raised stone entrance landing
    ctx.fillStyle = '#182030';
    ctx.fillRect(terrX, 34, terrW, 56);

    // Flagstone texture on landing
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for (let lx = terrX + 14; lx < terrX + terrW; lx += 28) {
      ctx.strokeRect(lx, 34, 28, 28);
      ctx.strokeRect(lx - 14, 62, 28, 28);
    }

    // Side stone balustrades / parapets
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(terrX - 6, 32, 12, 60);
    ctx.fillRect(terrX + terrW - 6, 32, 12, 60);
    // Brass balustrade top rails
    ctx.fillStyle = '#d97706';
    ctx.fillRect(terrX - 7, 30, 14, 3);
    ctx.fillRect(terrX + terrW - 7, 30, 14, 3);

    // Warm Brass Lanterns on Balustrade Pedestals
    [terrX, terrX + terrW].forEach((lx) => {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(lx - 4, 20, 8, 10);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(lx - 2, 22, 4, 6);
      // Soft lantern radial glow
      const lanternGlow = ctx.createRadialGradient(lx, 25, 2, lx, 25, 24);
      lanternGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
      lanternGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = lanternGlow;
      ctx.beginPath();
      ctx.arc(lx, 25, 24, 0, Math.PI * 2);
      ctx.fill();
    });

    // Grand Flagstone Steps descending to main floor (y: 90 to 150)
    const stairSteps = [
      { y: 90, h: 14, inset: 4 },
      { y: 104, h: 14, inset: 2 },
      { y: 118, h: 14, inset: 0 },
      { y: 132, h: 18, inset: -4 },
    ];
    stairSteps.forEach((st) => {
      const sx = terrX + st.inset;
      const sw = terrW - st.inset * 2;
      // Step riser
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(sx, st.y, sw, 3);
      // Step tread
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(sx, st.y + 3, sw, st.h - 3);
      // Polished brass edge nosing
      ctx.fillStyle = '#d97706';
      ctx.fillRect(sx, st.y + st.h - 1, sw, 1);
    });

    // Arched portal leading to the Study
    drawObservatoryDoorway(
      ctx,
      8.5 * TILE_SIZE,
      0.9 * TILE_SIZE,
      3.0 * TILE_SIZE,
      50,
      'THE STUDY ⮤',
      true
    );
  },

  // 2. Dynamic Atmosphere (Twinkling starfield & starlight rays)
  customDrawAtmosphere: (ctx: CanvasRenderingContext2D, timeMs: number) => {
    // Dynamic Twinkling Stars across dome aperture
    for (let i = 0; i < 40; i++) {
      const sx = pseudoRandom(i * 17.3 + 9) * CANVAS_WIDTH;
      const sy = pseudoRandom(i * 31.7 + 5) * 130 + 8;
      const pulseSpeed = 0.003 + pseudoRandom(i * 3.1) * 0.005;
      const alpha = Math.sin(timeMs * pulseSpeed + i) * 0.45 + 0.55;

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(sx, sy, 1.5, 1.5);

      // Diffraction cross spike on brightest stars
      if (i % 7 === 0 && alpha > 0.7) {
        ctx.strokeStyle = `rgba(186, 230, 253, ${alpha * 0.5})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(sx - 3, sy + 0.75);
        ctx.lineTo(sx + 4.5, sy + 0.75);
        ctx.moveTo(sx + 0.75, sy - 3);
        ctx.lineTo(sx + 0.75, sy + 4.5);
        ctx.stroke();
      }
    }

    // Soft starlight shafts streaming down from the open dome
    const rayGrad1 = ctx.createLinearGradient(160, 20, 100, 360);
    rayGrad1.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
    rayGrad1.addColorStop(1, 'transparent');
    ctx.fillStyle = rayGrad1;
    ctx.beginPath();
    ctx.moveTo(160, 30);
    ctx.lineTo(240, 30);
    ctx.lineTo(190, 380);
    ctx.lineTo(70, 380);
    ctx.closePath();
    ctx.fill();

    const rayGrad2 = ctx.createLinearGradient(480, 20, 540, 360);
    rayGrad2.addColorStop(0, 'rgba(129, 140, 248, 0.07)');
    rayGrad2.addColorStop(1, 'transparent');
    ctx.fillStyle = rayGrad2;
    ctx.beginPath();
    ctx.moveTo(420, 30);
    ctx.lineTo(500, 30);
    ctx.lineTo(570, 380);
    ctx.lineTo(450, 380);
    ctx.closePath();
    ctx.fill();
  },
};
