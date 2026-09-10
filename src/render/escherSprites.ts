import { ROOM_WIDTH_TILES, CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants';
import { pRect, drawPixelText } from './sprites';

// =============================================================================
// M.C. ESCHER RENDERING ROUTINES (The Paradox Gallery)
// Complete High-Fidelity Overhaul Faithful to Original Lithographs
// =============================================================================

/**
 * 1. SIDE WALL PORTAL (Doorway between Study and Escher Gallery)
 * Romanesque carved ashlar arch casing, warm hearth light spill, and auto-clamped plaque.
 */
export function drawSideWallPortal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  facing: 'west' | 'east',
  titleText: string
) {
  const px = Math.floor(x);
  const py = Math.floor(y);

  const OUTLINE = '#080c14';
  const STONE_DARK = '#1a2333';
  const STONE_LIGHT = '#64748b';
  const STONE_CREAM = '#cbd5e1';

  // 1. Heavy Stone Arch Casement
  pRect(ctx, px - 3, py - 6, w + 6, h + 10, OUTLINE);
  pRect(ctx, px - 2, py - 5, w + 4, h + 8, STONE_DARK);

  // 2. Alternating Impossible Stone Voussoirs
  const steps = 9;
  const stepH = Math.floor(h / steps);
  for (let i = 0; i < steps; i++) {
    const isLight = i % 2 === 0;
    const col = isLight ? STONE_CREAM : STONE_DARK;
    pRect(ctx, px - 1, py + i * stepH, w + 2, stepH, col);
    pRect(ctx, px, py + i * stepH, w, 1, isLight ? '#f8fafc' : STONE_LIGHT);
  }

  // 3. Inner Doorway Depth
  if (facing === 'east') {
    // Portal leading to The Study: Warm amber hearth glow spilling from within
    const studyGrad = ctx.createLinearGradient(px, py, px + w, py);
    studyGrad.addColorStop(0, '#f59e0b');
    studyGrad.addColorStop(0.3, '#78350f');
    studyGrad.addColorStop(0.7, '#1e1b18');
    studyGrad.addColorStop(1, '#0c0a09');
    ctx.fillStyle = studyGrad;
    ctx.fillRect(px + 2, py + 2, w - 4, h - 4);

    // Warm hearth light spill on the gallery floor outside the doorway
    const floorSpill = ctx.createRadialGradient(px + 4, py + h - 8, 4, px - 24, py + h - 8, 56);
    floorSpill.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
    floorSpill.addColorStop(0.5, 'rgba(180, 83, 9, 0.18)');
    floorSpill.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = floorSpill;
    ctx.beginPath();
    ctx.ellipse(px - 12, py + h - 8, 44, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Half-ajar heavy oak door with black iron strap hinges
    pRect(ctx, px + 8, py + 6, 12, h - 10, '#3f2112');
    pRect(ctx, px + 7, py + 16, 14, 3, '#080c14'); // Iron hinge 1
    pRect(ctx, px + 7, py + h - 24, 14, 3, '#080c14'); // Iron hinge 2
    pRect(ctx, px + 16, py + Math.floor(h / 2), 2, 3, '#ca8a04'); // Brass latch
  } else {
    // Portal leading to Escher Gallery: Deep recursive monochrome illusion
    const escherGrad = ctx.createLinearGradient(px, py, px + w, py);
    escherGrad.addColorStop(0, '#020617');
    escherGrad.addColorStop(0.5, '#0f172a');
    escherGrad.addColorStop(1, '#334155');
    ctx.fillStyle = escherGrad;
    ctx.fillRect(px + 2, py + 2, w - 4, h - 4);

    // Receding concentric arch illusion
    [4, 8, 12, 16].forEach((inset) => {
      pRect(ctx, px + inset, py + inset + 4, w - inset * 2, h - inset * 2, '#1e293b');
    });
  }

  // 4. Carved Stone Inscription Plaque (Auto-clamped within canvas bounds)
  const textW = titleText.length * 4 - 1;
  const plaqueW = textW + 12;
  const desiredX = Math.round(px + w / 2 - plaqueW / 2);
  const plaqueX = Math.max(6, Math.min(CANVAS_WIDTH - plaqueW - 6, desiredX));
  const plaqueY = py - 14;

  pRect(ctx, plaqueX, plaqueY, plaqueW, 11, OUTLINE);
  pRect(ctx, plaqueX + 1, plaqueY + 1, plaqueW - 2, 9, '#334155');
  pRect(ctx, plaqueX + 2, plaqueY + 2, plaqueW - 4, 7, '#0b0f19');
  drawPixelText(ctx, titleText, plaqueX + 6, plaqueY + 3, '#fef08a', 1);
}

/**
 * 2. TRUE INTERLOCKING ESCHER TESSELLATION FLOOR/**
 * Mathematically exact periodic division of the plane: Interlocking Birds (Symmetry 73).
 * Every dark bird and light bird share identical boundary curves (E_top = E_bottom, E_left = E_right)
 * constructed from smooth cubic bezier curves forming graceful wings, sharp beaks, rounded breasts,
 * and notched tail feathers.
 * ZERO background showing, zero gaps, authentic Dutch woodcut lithograph tones.
 */
export function drawTessellatedFloor(ctx: CanvasRenderingContext2D, _timeMs: number) {
  // Clear room background void
  ctx.fillStyle = '#060910';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const TILE_W = 32;

  // Upper Monastery Courtyard Wall (Rows 0 and 1, y: 0..64)
  for (let tx = 0; tx < ROOM_WIDTH_TILES; tx++) {
    const x = tx * TILE_W;
    pRect(ctx, x, 0, TILE_W, 28, '#080c14');
    pRect(ctx, x, 28, TILE_W, 26, '#0f1726');
    // Stone masonry joint lines
    pRect(ctx, x, 28, 1, 26, '#080c14');
    pRect(ctx, x, 54, TILE_W, 8, '#1b2536');
    pRect(ctx, x, 60, TILE_W, 2, '#334155'); // stone molding highlight
    pRect(ctx, x, 62, TILE_W, 2, '#080c14'); // bottom shadow line
    // Corbel brackets along cornice
    if (tx % 2 === 0) {
      pRect(ctx, x + 8, 54, 8, 8, '#26354a');
      pRect(ctx, x + 9, 54, 2, 8, '#475569');
      pRect(ctx, x + 15, 54, 1, 8, '#0f172a');
    }
  }

  // Palette: Antique Dutch Woodcut Lithograph
  const DARK_BIRD = '#0e1422';       // Deep midnight woodcut ink
  const DARK_STROKE = '#05080f';     // Engraved ink contour
  const LIGHT_BIRD = '#586b86';      // Weathered parchment slate
  const LIGHT_STROKE = '#1c2838';    // Slate contour
  const LIGHT_FEATHER = '#8ca0ba';   // Slate feather highlight

  // Fundamental domain tile dimension
  const UNIT_W = 56;
  const UNIT_H = 36;

  const startY = 64;
  const rows = Math.ceil((CANVAS_HEIGHT - startY) / UNIT_H) + 2;
  const cols = Math.ceil(CANVAS_WIDTH / UNIT_W) + 3;

  ctx.save();
  // Clip floor to Courtyard lower ground
  ctx.beginPath();
  ctx.rect(0, startY, CANVAS_WIDTH, CANVAS_HEIGHT - startY);
  ctx.clip();

  // Render all interlocking bird tiles
  for (let r = -1; r < rows; r++) {
    const y = startY + r * UNIT_H;
    for (let c = -2; c < cols; c++) {
      const x = c * UNIT_W;
      const isDark = (c + r) % 2 === 0;

      ctx.fillStyle = isDark ? DARK_BIRD : LIGHT_BIRD;
      ctx.strokeStyle = isDark ? DARK_STROKE : LIGHT_STROKE;
      ctx.lineWidth = 1.2;

      // -----------------------------------------------------------------------
      // EXACT MATHEMATICAL CLOSED PERIODIC CURVE (Interlocking Escher Birds)
      // Top curve matches Bottom curve shifted by (0, H).
      // Right curve matches Left curve shifted by (-W, 0).
      // -----------------------------------------------------------------------
      ctx.beginPath();

      // 1. Top Edge: (0, 0) to (W, 0) — Sweeping wings & crest
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + 4, y - 2, x + 10, y - 8, x + 18, y - 12);
      ctx.bezierCurveTo(x + 22, y - 16, x + 25, y - 20, x + 28, y - 20); // Arched wingtip peak
      ctx.bezierCurveTo(x + 34, y - 18, x + 40, y - 12, x + 44, y - 7);  // Trailing wing edge
      ctx.bezierCurveTo(x + 48, y - 3, x + 52, y - 1, x + UNIT_W, y);   // Nape & crown

      // 2. Right Edge: (W, 0) to (W, H) — Rounded forehead, sharp beak, swelling breast
      ctx.bezierCurveTo(x + UNIT_W + 5, y + 2, x + UNIT_W + 13, y + 6, x + UNIT_W + 19, y + 11); // Beak tip
      ctx.bezierCurveTo(x + UNIT_W + 15, y + 14, x + UNIT_W + 11, y + 16, x + UNIT_W + 7, y + 18); // Chin & throat
      ctx.bezierCurveTo(x + UNIT_W + 5, y + 22, x + UNIT_W + 3, y + 26, x + UNIT_W + 2, y + 29); // Swelling breast
      ctx.bezierCurveTo(x + UNIT_W + 1, y + 31, x + UNIT_W, y + 34, x + UNIT_W, y + UNIT_H);    // Belly to tail root

      // 3. Bottom Edge: (W, H) to (0, H) — Exact reverse of Top Edge translated down by H
      ctx.bezierCurveTo(x + 52, y + UNIT_H - 1, x + 48, y + UNIT_H - 3, x + 44, y + UNIT_H - 7);
      ctx.bezierCurveTo(x + 40, y + UNIT_H - 12, x + 34, y + UNIT_H - 18, x + 28, y + UNIT_H - 20); // Wing notch
      ctx.bezierCurveTo(x + 25, y + UNIT_H - 20, x + 22, y + UNIT_H - 16, x + 18, y + UNIT_H - 12);
      ctx.bezierCurveTo(x + 10, y + UNIT_H - 8, x + 4, y + UNIT_H - 2, x, y + UNIT_H);

      // 4. Left Edge: (0, H) to (0, 0) — Exact reverse of Right Edge translated left by W
      ctx.bezierCurveTo(x + 1, y + 31, x + 2, y + 29, x + 2, y + 29);
      ctx.bezierCurveTo(x + 3, y + 26, x + 5, y + 22, x + 7, y + 18); // Throat notch
      ctx.bezierCurveTo(x + 11, y + 16, x + 15, y + 14, x + 19, y + 11); // Beak notch receiving bird behind
      ctx.bezierCurveTo(x + 13, y + 6, x + 5, y + 2, x, y);

      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // -----------------------------------------------------------------------
      // Authentic Woodcut Anatomical Linework
      // -----------------------------------------------------------------------
      if (isDark) {
        // Dark bird eye: Ivory almond eye with midnight pupil
        pRect(ctx, x + 49, y + 8, 3, 3, '#f8fafc');
        pRect(ctx, x + 50, y + 9, 1, 1, '#05080f');

        // Beak seam
        ctx.strokeStyle = '#05080f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + UNIT_W + 18, y + 11);
        ctx.lineTo(x + UNIT_W + 6, y + 12);
        ctx.stroke();

        // Primary flight feather grooves along wing
        ctx.strokeStyle = '#1b2536';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 28, y - 18);
        ctx.quadraticCurveTo(x + 26, y - 4, x + 22, y + 4);
        ctx.moveTo(x + 34, y - 14);
        ctx.quadraticCurveTo(x + 32, y - 2, x + 28, y + 8);
        ctx.moveTo(x + 40, y - 8);
        ctx.quadraticCurveTo(x + 38, y + 2, x + 34, y + 12);
        ctx.stroke();

        // Wing highlight streaks
        ctx.strokeStyle = '#384c68';
        ctx.beginPath();
        ctx.moveTo(x + 29, y - 16);
        ctx.lineTo(x + 24, y + 2);
        ctx.moveTo(x + 35, y - 12);
        ctx.lineTo(x + 30, y + 6);
        ctx.stroke();

        // Breast contour line
        ctx.strokeStyle = '#05080f';
        ctx.beginPath();
        ctx.moveTo(x + 53, y + 16);
        ctx.quadraticCurveTo(x + 50, y + 22, x + 46, y + 27);
        ctx.stroke();
      } else {
        // Light bird eye: Midnight iris with bright starlight glint
        pRect(ctx, x + 49, y + 8, 3, 3, '#05080f');
        pRect(ctx, x + 50, y + 8, 1, 1, '#f8fafc');

        // Beak seam
        ctx.strokeStyle = '#1c2838';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + UNIT_W + 18, y + 11);
        ctx.lineTo(x + UNIT_W + 6, y + 12);
        ctx.stroke();

        // Primary flight feather grooves along wing
        ctx.strokeStyle = '#2b394d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 28, y - 18);
        ctx.quadraticCurveTo(x + 26, y - 4, x + 22, y + 4);
        ctx.moveTo(x + 34, y - 14);
        ctx.quadraticCurveTo(x + 32, y - 2, x + 28, y + 8);
        ctx.moveTo(x + 40, y - 8);
        ctx.quadraticCurveTo(x + 38, y + 2, x + 34, y + 12);
        ctx.stroke();

        // Starlight feather highlight streaks
        ctx.strokeStyle = LIGHT_FEATHER;
        ctx.beginPath();
        ctx.moveTo(x + 29, y - 16);
        ctx.lineTo(x + 24, y + 2);
        ctx.moveTo(x + 35, y - 12);
        ctx.lineTo(x + 30, y + 6);
        ctx.stroke();

        // Breast contour line
        ctx.strokeStyle = '#2b394d';
        ctx.beginPath();
        ctx.moveTo(x + 53, y + 16);
        ctx.quadraticCurveTo(x + 50, y + 22, x + 46, y + 27);
        ctx.stroke();
      }
    }
  }
  ctx.restore();

  // Outer Room Border Shadow
  ctx.strokeStyle = '#080c14';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, startY, CANVAS_WIDTH, CANVAS_HEIGHT - startY);
}

/**
 * 3. THE PENROSE ENDLESS STAIRCASE (*Ascending and Descending, 1960*)
 * Grounded monastery rooftop cloister courtyard with solid 3D stone steps,
 * inner courtyard void, and animated hooded monk pilgrims.
 */
export function drawPenroseStairs(ctx: CanvasRenderingContext2D, cx: number, cy: number, timeMs: number) {
  const px = Math.floor(cx);
  const py = Math.floor(cy);

  const OUTLINE = '#080c14';
  const STONE_RISER = '#1a2436';     // Step vertical riser in deep shadow
  const STONE_TREAD = '#64748b';     // Step horizontal surface
  const STONE_HIGHLIGHT = '#cbd5e1'; // Step leading edge highlight
  const STONE_BASE = '#243044';

  // 1. Ground Shadow of the Raised Monastery Rooftop
  ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
  ctx.beginPath();
  ctx.ellipse(px, py + 22, 100, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Heavy Ashlar Stone Foundation Platform (Rooftop Terrace)
  pRect(ctx, px - 82, py - 2, 164, 38, OUTLINE);
  pRect(ctx, px - 80, py, 160, 34, STONE_BASE);
  // Masonry stone blocks along base
  for (let b = -2; b <= 2; b++) {
    const bx = px + b * 32 - 12;
    pRect(ctx, bx, py + 12, 24, 18, OUTLINE);
    pRect(ctx, bx + 1, py + 13, 22, 16, '#131c2b');
    // Carved Romanesque cloister arch in each plinth bay
    pRect(ctx, bx + 5, py + 15, 12, 12, '#090d16');
  }
  // Beveled stone cornice
  pRect(ctx, px - 80, py, 160, 3, STONE_TREAD);
  pRect(ctx, px - 80, py + 1, 160, 1, STONE_HIGHLIGHT);

  // 3. Central Recessed Courtyard (Inner Void with Drop Shadow)
  pRect(ctx, px - 36, py - 38, 72, 44, OUTLINE);
  pRect(ctx, px - 34, py - 36, 68, 40, '#0a0e17');
  // Diagonal checkerboard pavement inside inner courtyard
  for (let cyTile = 0; cyTile < 4; cyTile++) {
    for (let cxTile = 0; cxTile < 7; cxTile++) {
      if ((cxTile + cyTile) % 2 === 0) {
        pRect(ctx, px - 30 + cxTile * 8, py - 34 + cyTile * 8, 8, 8, '#1e293b');
      }
    }
  }
  // Deep cast shadow from the surrounding high stair parapets
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(px - 34, py - 36, 68, 12);
  ctx.fillRect(px - 34, py - 36, 14, 40);

  // 4. The Four Interlocking Flights of the Impossible Penrose Staircase:
  // Flight 1: North Flight (Left to Right along top)
  for (let s = 0; s < 7; s++) {
    const sx = px - 46 + s * 13;
    const sy = py - 46 + s * 2;
    pRect(ctx, sx, sy, 14, 6, OUTLINE);
    pRect(ctx, sx + 1, sy + 1, 12, 4, STONE_RISER);
    pRect(ctx, sx, sy - 3, 14, 3, STONE_TREAD);
    pRect(ctx, sx, sy - 3, 14, 1, STONE_HIGHLIGHT);
  }

  // Flight 2: East Flight (Top to Bottom along right)
  for (let s = 0; s < 7; s++) {
    const sx = px + 44 - s * 2;
    const sy = py - 32 + s * 9;
    pRect(ctx, sx, sy, 18, 7, OUTLINE);
    pRect(ctx, sx + 1, sy + 1, 16, 5, STONE_RISER);
    pRect(ctx, sx, sy - 4, 18, 4, STONE_TREAD);
    pRect(ctx, sx, sy - 4, 18, 1, STONE_HIGHLIGHT);
  }

  // Flight 3: South Flight (Right to Left along bottom foreground)
  for (let s = 0; s < 7; s++) {
    const sx = px + 32 - s * 13;
    const sy = py + 18 - s * 3;
    pRect(ctx, sx, sy, 16, 9, OUTLINE);
    pRect(ctx, sx + 1, sy + 1, 14, 7, STONE_RISER);
    pRect(ctx, sx, sy - 4, 16, 4, STONE_TREAD);
    pRect(ctx, sx, sy - 4, 16, 1, STONE_HIGHLIGHT);
  }

  // Flight 4: West Flight (Bottom to Top along left, connecting impossibly back to North!)
  for (let s = 0; s < 7; s++) {
    const sx = px - 58 + s * 2;
    const sy = py + 2 - s * 8;
    pRect(ctx, sx, sy, 18, 7, OUTLINE);
    pRect(ctx, sx + 1, sy + 1, 16, 5, STONE_RISER);
    pRect(ctx, sx, sy - 4, 18, 4, STONE_TREAD);
    pRect(ctx, sx, sy - 4, 18, 1, STONE_HIGHLIGHT);
  }

  // Outer Stone Parapet Balustrades with Carved Quoins
  pRect(ctx, px - 66, py - 48, 12, 12, OUTLINE);
  pRect(ctx, px - 65, py - 47, 10, 10, STONE_BASE);
  pRect(ctx, px + 52, py - 40, 12, 12, OUTLINE);
  pRect(ctx, px + 53, py - 39, 10, 10, STONE_BASE);

  // 5. The Procession of Robed Monk Pilgrims (*Ascending and Descending*)
  const monkCount = 4;
  for (let m = 0; m < monkCount; m++) {
    const monkPhase = ((timeMs * 0.0006) + (m / monkCount) * 4) % 4;
    let mx = px;
    let my = py;

    if (monkPhase < 1.0) {
      const t = monkPhase;
      mx = px - 46 + t * 80;
      my = py - 46 + t * 14;
    } else if (monkPhase < 2.0) {
      const t = monkPhase - 1.0;
      mx = px + 44 - t * 14;
      my = py - 32 + t * 50;
    } else if (monkPhase < 3.0) {
      const t = monkPhase - 2.0;
      mx = px + 30 - t * 84;
      my = py + 18 - t * 16;
    } else {
      const t = monkPhase - 3.0;
      mx = px - 56 + t * 10;
      my = py + 2 - t * 48;
    }

    const bob = Math.sin(timeMs * 0.012 + m * 2) * 1.5;

    // Robe body
    const robeColor = m % 2 === 0 ? '#5a3825' : '#452a1c';
    pRect(ctx, mx + 2, my - 16 + bob, 8, 14, OUTLINE);
    pRect(ctx, mx + 3, my - 15 + bob, 6, 12, robeColor);
    // Monk's Hood / Cowl
    pRect(ctx, mx + 3, my - 19 + bob, 6, 5, OUTLINE);
    pRect(ctx, mx + 4, my - 18 + bob, 4, 4, '#784323');

    // Lead monk (m === 0) holds a glowing brass lantern
    if (m === 0) {
      pRect(ctx, mx + 9, my - 11 + bob, 3, 4, '#ca8a04');
      pRect(ctx, mx + 10, my - 10 + bob, 1, 2, '#fde047');
      const lanGlow = ctx.createRadialGradient(mx + 10, my - 10 + bob, 2, mx + 10, my - 10 + bob, 14);
      lanGlow.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
      lanGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lanGlow;
      ctx.beginPath();
      ctx.arc(mx + 10, my - 10 + bob, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * 4. THE PERPETUAL WATERFALL (*Waterfall, 1961*)
 * Faithful reconstruction matching Escher's 1961 lithograph:
 * - 2-story stone millhouse with gabled slate roof & chimney
 * - Two open-air Romanesque arcaded belfries on slender stone pillars
 * - Left summit: Compound of three interpenetrating cubes
 * - Right summit: Stellated rhombic dodecahedron ("Escher's Solid")
 * - 3-tier impossible Penrose zigzag aqueduct on stone arches
 * - 46px tall vertical cataract falling into a large churning wooden waterwheel
 */
export function drawWaterfallStation(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number) {
  const px = Math.floor(x);
  const py = Math.floor(y);

  const OUTLINE = '#080c14';
  const STONE_DARK = '#1a2333';
  const STONE_WALL = '#475569';
  const STONE_LIGHT = '#94a3b8';
  const STONE_HIGHLIGHT = '#e2e8f0';
  const ROOF_SLATE = '#273449';
  const WOOD_DARK = '#3d2314';
  const WOOD_LIGHT = '#78350f';
  const WATER_DARK = '#0284c7';
  const WATER_CYAN = '#38bdf8';
  const WATER_FOAM = '#ffffff';

  // Ground Shadow of Monument
  ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
  ctx.beginPath();
  ctx.ellipse(px + 76, py + 116, 78, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. Heavy Stone Terrace Foundation & Outflow Culvert
  pRect(ctx, px + 2, py + 92, 148, 28, OUTLINE);
  pRect(ctx, px + 4, py + 94, 144, 24, STONE_DARK);
  // Masonry ashlar courses along base
  for (let b = 0; b < 7; b++) {
    pRect(ctx, px + 6 + b * 20, py + 94, 18, 11, STONE_WALL);
    pRect(ctx, px + 6 + b * 20, py + 94, 18, 1, STONE_LIGHT);
    pRect(ctx, px + 16 + b * 20, py + 106, 18, 10, STONE_WALL);
    pRect(ctx, px + 16 + b * 20, py + 106, 18, 1, STONE_LIGHT);
  }
  // Arched water culvert at base with iron grating
  pRect(ctx, px + 94, py + 98, 22, 20, OUTLINE);
  pRect(ctx, px + 96, py + 100, 18, 18, '#0a0f19');
  for (let g = 0; g < 4; g++) {
    pRect(ctx, px + 99 + g * 4, py + 100, 1, 18, '#475569'); // Grille bars
  }

  // 2. The 2-Story Stone Millhouse (Left Flank)
  const mhX = px + 4;
  const mhY = py + 42;
  const mhW = 46;
  const mhH = 54;

  // Millhouse stone body
  pRect(ctx, mhX, mhY, mhW, mhH, OUTLINE);
  pRect(ctx, mhX + 1, mhY + 1, mhW - 2, mhH - 2, STONE_WALL);
  pRect(ctx, mhX + 2, mhY + 2, 4, mhH - 4, STONE_LIGHT); // Sunlit left quoin

  // Pitched Gabled Slate Roof
  ctx.fillStyle = ROOF_SLATE;
  ctx.beginPath();
  ctx.moveTo(mhX - 4, mhY + 4);
  ctx.lineTo(mhX + Math.floor(mhW / 2), mhY - 18); // Ridge peak
  ctx.lineTo(mhX + mhW + 2, mhY + 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Roof slate shingles
  pRect(ctx, mhX + 2, mhY - 6, mhW - 4, 2, '#3b4a63');
  pRect(ctx, mhX + 8, mhY - 12, mhW - 16, 2, '#3b4a63');

  // Stone Chimney on Roof Ridge
  pRect(ctx, mhX + 12, mhY - 26, 8, 12, OUTLINE);
  pRect(ctx, mhX + 13, mhY - 25, 6, 11, STONE_DARK);
  pRect(ctx, mhX + 11, mhY - 27, 10, 3, STONE_LIGHT); // Chimney cap
  // Faint smoke wisp
  const smokePhase = Math.sin(timeMs * 0.005) * 3;
  pRect(ctx, mhX + 15 + smokePhase, mhY - 32, 2, 3, 'rgba(226, 232, 240, 0.4)');
  pRect(ctx, mhX + 17 - smokePhase, mhY - 36, 3, 3, 'rgba(226, 232, 240, 0.25)');

  // Upper Shuttered Casement Window
  pRect(ctx, mhX + 14, mhY + 12, 14, 14, OUTLINE);
  pRect(ctx, mhX + 15, mhY + 13, 12, 12, '#0a0f19'); // Dark glass pane
  pRect(ctx, mhX + 11, mhY + 13, 3, 12, WOOD_LIGHT); // Left timber shutter
  pRect(ctx, mhX + 27, mhY + 13, 3, 12, WOOD_LIGHT); // Right timber shutter
  pRect(ctx, mhX + 14, mhY + 26, 14, 2, STONE_LIGHT); // Sill

  // Ground Floor Arched Timber Door
  pRect(ctx, mhX + 14, mhY + 32, 16, 22, OUTLINE);
  pRect(ctx, mhX + 15, mhY + 33, 14, 20, WOOD_DARK);
  pRect(ctx, mhX + 17, mhY + 35, 10, 18, WOOD_LIGHT);
  pRect(ctx, mhX + 24, mhY + 44, 2, 2, '#ca8a04'); // Brass doorknob

  // Terrace Balcony with White Railing (matching Escher's wash-hanging terrace)
  pRect(ctx, mhX - 4, mhY + 30, mhW + 10, 3, OUTLINE);
  pRect(ctx, mhX - 3, mhY + 31, mhW + 8, 2, STONE_LIGHT);
  for (let r = 0; r < 5; r++) {
    pRect(ctx, mhX - 2 + r * 11, mhY + 24, 2, 6, '#f8fafc'); // White posts
  }
  pRect(ctx, mhX - 3, mhY + 24, mhW + 8, 1, '#f8fafc'); // Top handrail

  // 3. The Two Open-Air Romanesque Arcaded Belfries (Towers)
  // --- Left Tower (above flume collection chute) ---
  const ltX = px + 50;
  const ltY = py + 14;
  const ltW = 28;
  const ltH = 34;

  // Belfry Base Stringcourse
  pRect(ctx, ltX - 2, ltY + ltH - 4, ltW + 4, 4, OUTLINE);
  pRect(ctx, ltX - 1, ltY + ltH - 3, ltW + 2, 2, STONE_LIGHT);

  // Slender Romanesque Open Columns
  pRect(ctx, ltX + 1, ltY + 6, 4, ltH - 10, OUTLINE);
  pRect(ctx, ltX + 2, ltY + 7, 2, ltH - 12, STONE_LIGHT);
  pRect(ctx, ltX + 12, ltY + 6, 4, ltH - 10, OUTLINE);
  pRect(ctx, ltX + 13, ltY + 7, 2, ltH - 12, STONE_LIGHT);
  pRect(ctx, ltX + 23, ltY + 6, 4, ltH - 10, OUTLINE);
  pRect(ctx, ltX + 24, ltY + 7, 2, ltH - 12, STONE_LIGHT);

  // Semicircular Stone Arches
  pRect(ctx, ltX + 3, ltY + 4, 11, 4, OUTLINE);
  pRect(ctx, ltX + 4, ltY + 5, 9, 2, STONE_WALL);
  pRect(ctx, ltX + 14, ltY + 4, 11, 4, OUTLINE);
  pRect(ctx, ltX + 15, ltY + 5, 9, 2, STONE_WALL);

  // Cornice Platform atop Left Tower
  pRect(ctx, ltX - 3, ltY - 2, ltW + 6, 6, OUTLINE);
  pRect(ctx, ltX - 2, ltY - 1, ltW + 4, 4, STONE_WALL);
  pRect(ctx, ltX - 2, ltY - 1, ltW + 4, 1, STONE_HIGHLIGHT);

  // --- Right Tower (Taller Landmark Belfry) ---
  const rtX = px + 116;
  const rtY = py + 2;
  const rtW = 30;
  const rtH = 52;

  // Lower Pier
  pRect(ctx, rtX, rtY + 22, rtW, rtH - 22, OUTLINE);
  pRect(ctx, rtX + 1, rtY + 23, rtW - 2, rtH - 24, STONE_DARK);
  pRect(ctx, rtX - 2, rtY + 20, rtW + 4, 4, OUTLINE);
  pRect(ctx, rtX - 1, rtY + 21, rtW + 2, 2, STONE_LIGHT); // Mid stringcourse

  // Upper Belfry Open Columns
  pRect(ctx, rtX + 1, rtY + 4, 4, 18, OUTLINE);
  pRect(ctx, rtX + 2, rtY + 5, 2, 16, STONE_LIGHT);
  pRect(ctx, rtX + 13, rtY + 4, 4, 18, OUTLINE);
  pRect(ctx, rtX + 14, rtY + 5, 2, 16, STONE_LIGHT);
  pRect(ctx, rtX + 25, rtY + 4, 4, 18, OUTLINE);
  pRect(ctx, rtX + 26, rtY + 5, 2, 16, STONE_LIGHT);

  // Semicircular Arches
  pRect(ctx, rtX + 3, rtY + 2, 12, 4, OUTLINE);
  pRect(ctx, rtX + 4, rtY + 3, 10, 2, STONE_WALL);
  pRect(ctx, rtX + 15, rtY + 2, 12, 4, OUTLINE);
  pRect(ctx, rtX + 16, rtY + 3, 10, 2, STONE_WALL);

  // Cornice Platform atop Right Tower
  pRect(ctx, rtX - 3, rtY - 3, rtW + 6, 6, OUTLINE);
  pRect(ctx, rtX - 2, rtY - 2, rtW + 4, 4, STONE_WALL);
  pRect(ctx, rtX - 2, rtY - 2, rtW + 4, 1, STONE_HIGHLIGHT);

  // 4. THE TWO ICONIC SUMMIT POLYHEDRA (Escher's Mathematical Solids)
  // --- Left Tower Summit: Compound of Three Cubes ---
  const poly1X = ltX + 6;
  const poly1Y = ltY - 22;

  // Faceted 3D interpenetrating cubes with isometric illumination
  pRect(ctx, poly1X, poly1Y, 16, 16, OUTLINE);
  // Cube 1 (Front top illuminated face)
  pRect(ctx, poly1X + 2, poly1Y + 2, 12, 5, STONE_HIGHLIGHT);
  pRect(ctx, poly1X + 2, poly1Y + 7, 7, 7, STONE_WALL);
  pRect(ctx, poly1X + 9, poly1Y + 7, 5, 7, STONE_DARK);
  // Cube 2 (Interlocking 45° corner points)
  pRect(ctx, poly1X - 3, poly1Y + 5, 4, 6, OUTLINE);
  pRect(ctx, poly1X - 2, poly1Y + 6, 2, 4, STONE_LIGHT);
  pRect(ctx, poly1X + 15, poly1Y + 5, 4, 6, OUTLINE);
  pRect(ctx, poly1X + 16, poly1Y + 6, 2, 4, STONE_DARK);
  // Cube 3 (Vertical crest point)
  pRect(ctx, poly1X + 5, poly1Y - 4, 6, 5, OUTLINE);
  pRect(ctx, poly1X + 6, poly1Y - 3, 4, 3, STONE_HIGHLIGHT);

  // --- Right Tower Summit: Stellated Rhombic Dodecahedron ("Escher's Solid") ---
  const poly2X = rtX + 7;
  const poly2Y = rtY - 24;

  // Central polyhedral core
  pRect(ctx, poly2X, poly2Y, 16, 16, OUTLINE);
  pRect(ctx, poly2X + 2, poly2Y + 2, 12, 12, STONE_WALL);
  pRect(ctx, poly2X + 4, poly2Y + 4, 8, 8, STONE_HIGHLIGHT); // Sunlit core diamond

  // 4 Cardinal 3D Star Pyramids
  // North Point
  ctx.fillStyle = STONE_HIGHLIGHT;
  ctx.beginPath();
  ctx.moveTo(poly2X + 8, poly2Y - 7);
  ctx.lineTo(poly2X + 4, poly2Y);
  ctx.lineTo(poly2X + 12, poly2Y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // South Point
  ctx.fillStyle = STONE_DARK;
  ctx.beginPath();
  ctx.moveTo(poly2X + 8, poly2Y + 23);
  ctx.lineTo(poly2X + 4, poly2Y + 16);
  ctx.lineTo(poly2X + 12, poly2Y + 16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // West Point
  ctx.fillStyle = STONE_LIGHT;
  ctx.beginPath();
  ctx.moveTo(poly2X - 7, poly2Y + 8);
  ctx.lineTo(poly2X, poly2Y + 4);
  ctx.lineTo(poly2X, poly2Y + 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // East Point
  ctx.fillStyle = STONE_DARK;
  ctx.beginPath();
  ctx.moveTo(poly2X + 23, poly2Y + 8);
  ctx.lineTo(poly2X + 16, poly2Y + 4);
  ctx.lineTo(poly2X + 16, poly2Y + 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 5. The 3-Tier Impossible Penrose Zigzag Aqueduct
  // Supporting Slender Stone Pillars under Flume Corners
  pRect(ctx, px + 80, py + 48, 5, 46, OUTLINE);
  pRect(ctx, px + 81, py + 49, 3, 44, STONE_LIGHT);
  pRect(ctx, px + 104, py + 36, 5, 58, OUTLINE);
  pRect(ctx, px + 105, py + 37, 3, 56, STONE_LIGHT);

  // Flume Tier 1 (Upper: Left Tower across to Right Tower)
  pRect(ctx, px + 58, py + 32, 60, 10, OUTLINE);
  pRect(ctx, px + 59, py + 33, 58, 8, STONE_DARK);
  pRect(ctx, px + 58, py + 32, 60, 2, STONE_LIGHT); // Top coping

  // Flume Tier 2 (Right flank sloping forward-down)
  pRect(ctx, px + 112, py + 34, 18, 28, OUTLINE);
  pRect(ctx, px + 113, py + 35, 16, 26, STONE_DARK);
  pRect(ctx, px + 128, py + 34, 2, 28, STONE_LIGHT);

  // Flume Tier 3 (Middle: Across back to left)
  pRect(ctx, px + 68, py + 56, 58, 10, OUTLINE);
  pRect(ctx, px + 69, py + 57, 56, 8, STONE_DARK);
  pRect(ctx, px + 68, py + 56, 58, 2, STONE_LIGHT);

  // Flume Tier 4 (Spout leading out to cataract plunge)
  pRect(ctx, px + 48, py + 42, 24, 11, OUTLINE);
  pRect(ctx, px + 49, py + 43, 22, 9, STONE_DARK);
  pRect(ctx, px + 48, py + 42, 24, 2, STONE_LIGHT);

  // Rushing Water Flow in the Aqueduct Channels
  const flowT = (timeMs * 0.04) % 16;
  // Tier 1 Water
  pRect(ctx, px + 60, py + 35, 54, 5, WATER_DARK);
  pRect(ctx, px + 62 + flowT, py + 36, 12, 2, WATER_CYAN);
  pRect(ctx, px + 94 - flowT, py + 37, 8, 1, WATER_FOAM);
  // Tier 2 Water
  pRect(ctx, px + 115, py + 38, 12, 20, WATER_DARK);
  pRect(ctx, px + 117, py + 40 + (flowT % 14), 8, 3, WATER_CYAN);
  // Tier 3 Water
  pRect(ctx, px + 70, py + 59, 52, 5, WATER_DARK);
  pRect(ctx, px + 72 + flowT, py + 60, 12, 2, WATER_CYAN);
  // Tier 4 Water
  pRect(ctx, px + 50, py + 45, 20, 5, WATER_DARK);
  pRect(ctx, px + 52 + (flowT % 12), py + 46, 8, 2, WATER_CYAN);

  // 6. The Vertical Waterfall Cataract (Cascading 44px straight down over the wheel!)
  const dropX = px + 48;
  const dropY = py + 46;
  const dropH = 46;

  pRect(ctx, dropX, dropY, 14, dropH, OUTLINE);
  pRect(ctx, dropX + 1, dropY + 1, 12, dropH - 2, WATER_DARK);

  // Foaming torrent animation
  const dropCycle = (timeMs * 0.08) % 12;
  for (let d = 0; d < 4; d++) {
    const fy = dropY + 2 + ((dropCycle + d * 12) % (dropH - 6));
    pRect(ctx, dropX + 3, fy, 8, 6, WATER_CYAN);
    pRect(ctx, dropX + 5, fy + 1, 4, 4, WATER_FOAM);
  }

  // 7. Large Churning Wooden Waterwheel (Radius 16px, 12 Curved Timber Buckets)
  const wx = px + 54;
  const wy = py + 86;
  const wheelAngle = timeMs * 0.005;

  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(wheelAngle);

  // Outer Iron Wheel Rim
  pRect(ctx, -16, -16, 32, 32, OUTLINE);
  pRect(ctx, -14, -14, 28, 28, WOOD_LIGHT);
  pRect(ctx, -12, -12, 24, 24, '#0a0f19'); // Recessed wheel void

  // 12 Radiating Timber Spokes and Paddles
  for (let a = 0; a < 6; a++) {
    ctx.rotate(Math.PI / 6);
    pRect(ctx, -15, -1, 30, 2, WOOD_DARK);
    pRect(ctx, 11, -3, 4, 5, '#ca8a04'); // Curved wooden bucket paddle
  }

  // Heavy Iron Hub & Axle Pin
  pRect(ctx, -5, -5, 10, 10, OUTLINE);
  pRect(ctx, -4, -4, 8, 8, '#475569');
  pRect(ctx, -2, -2, 4, 4, STONE_HIGHLIGHT);
  ctx.restore();

  // 8. Churning Water Basin & Billowing Mist
  pRect(ctx, px + 40, py + 92, 36, 16, OUTLINE);
  pRect(ctx, px + 42, py + 94, 32, 12, WATER_DARK);
  pRect(ctx, px + 44, py + 96, 28, 4, WATER_CYAN);
  pRect(ctx, px + 48, py + 97, 20, 2, WATER_FOAM);

  // Water spray particles splashing off the wheel
  for (let s = 0; s < 7; s++) {
    const mistX = px + 46 + Math.sin(timeMs * 0.01 + s * 1.4) * 16;
    const mistY = py + 94 - Math.abs(Math.cos(timeMs * 0.012 + s * 2.1)) * 14;
    pRect(ctx, mistX, mistY, 2, 2, WATER_FOAM);
  }
}

/**
 * 5. THE LITHOGRAPHER'S DRAFTING DESK (*Drawing Hands, 1948*)
 * Tilted walnut drafting easel, pinned cream parchment,
 * and two large, realistically modeled human hands holding drafting pencils
 * actively drawing each other's 2D cuffs in an infinite self-referential loop.
 */
export function drawLithographerDesk(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number) {
  const px = Math.floor(x);
  const py = Math.floor(y);

  const OUTLINE = '#080c14';

  // Table Floor Shadow
  ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
  ctx.beginPath();
  ctx.ellipse(px + 58, py + 74, 60, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. Turned Walnut Easel Table Legs
  pRect(ctx, px + 10, py + 42, 8, 32, OUTLINE);
  pRect(ctx, px + 11, py + 43, 6, 30, '#451a03');
  pRect(ctx, px + 98, py + 42, 8, 32, OUTLINE);
  pRect(ctx, px + 99, py + 43, 6, 30, '#451a03');
  // Stretcher Bar
  pRect(ctx, px + 16, py + 60, 84, 5, OUTLINE);
  pRect(ctx, px + 17, py + 61, 82, 3, '#78350f');

  // 2. Large Tilted Mahogany Drafting Board
  pRect(ctx, px + 4, py + 8, 108, 42, OUTLINE);
  pRect(ctx, px + 6, py + 10, 104, 38, '#78350f');
  pRect(ctx, px + 8, py + 12, 100, 2, '#9a3412'); // Edge highlight

  // 3. Pinned Heavy Cream Parchment Sheet
  pRect(ctx, px + 14, py + 12, 88, 34, OUTLINE);
  pRect(ctx, px + 15, py + 13, 86, 32, '#fefce8'); // Cream parchment

  // 4 Brass Thumbtacks in Paper Corners
  const tacks = [
    [px + 17, py + 15],
    [px + 97, py + 15],
    [px + 17, py + 41],
    [px + 97, py + 41],
  ];
  tacks.forEach(([tx, ty]) => {
    pRect(ctx, tx - 1, ty - 1, 4, 4, OUTLINE);
    pRect(ctx, tx, ty, 2, 2, '#fbbf24');
  });

  // 4. THE TWO ICONIC DRAWING HANDS (*Drawing Hands, 1948*)
  const sketchMove = Math.sin(timeMs * 0.008) * 3;

  // Soft 3D drop shadow beneath hands onto parchment
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(px + 32, py + 26, 24, 10);
  ctx.fillRect(px + 62, py + 26, 24, 10);

  // --- HAND 1 (Left Hand: Emerging from flat 2D cuff on paper to sketch Right Hand) ---
  // Flat 2D penciled shirt cuff on paper (left side)
  pRect(ctx, px + 18, py + 24, 12, 12, OUTLINE);
  pRect(ctx, px + 19, py + 25, 10, 10, '#f1f5f9');
  // Cuff cross-hatching
  for (let h = 0; h < 4; h++) {
    pRect(ctx, px + 21 + h * 2, py + 26, 1, 8, '#64748b');
  }

  // 3D Modeled Wrist & Hand
  pRect(ctx, px + 28, py + 22, 18, 14, OUTLINE);
  pRect(ctx, px + 29, py + 23, 16, 12, '#fed7aa'); // Modeled skin
  pRect(ctx, px + 32, py + 21, 8, 3, '#ffedd5');   // Knuckle highlight
  pRect(ctx, px + 30, py + 31, 14, 3, '#fba765');   // Under-palm shadow

  // Curled Fingers & Thumb gripping pencil
  pRect(ctx, px + 44, py + 23, 12, 7, OUTLINE);
  pRect(ctx, px + 45, py + 24, 10, 5, '#fed7aa');
  pRect(ctx, px + 47, py + 22, 5, 3, '#ffedd5'); // Thumb knuckle

  // Yellow Hexagonal Drafting Pencil
  pRect(ctx, px + 42, py + 27, 20 + sketchMove, 4, OUTLINE);
  pRect(ctx, px + 43, py + 28, 18 + sketchMove, 2, '#f59e0b'); // Yellow lacquer
  // Sharpened Cedar collar & Lead Point
  pRect(ctx, px + 61 + sketchMove, py + 27, 4, 4, '#fed7aa');
  pRect(ctx, px + 65 + sketchMove, py + 28, 3, 2, '#0f172a'); // Lead point sketching right cuff!

  // --- HAND 2 (Right Hand: Emerging from flat 2D cuff on paper to sketch Left Hand) ---
  // Flat 2D penciled shirt cuff on paper (right side)
  pRect(ctx, px + 84, py + 20, 12, 12, OUTLINE);
  pRect(ctx, px + 85, py + 21, 10, 10, '#f1f5f9');
  for (let h = 0; h < 4; h++) {
    pRect(ctx, px + 87 + h * 2, py + 22, 1, 8, '#64748b');
  }

  // 3D Modeled Wrist & Hand
  pRect(ctx, px + 70, py + 22, 18, 14, OUTLINE);
  pRect(ctx, px + 71, py + 23, 16, 12, '#fed7aa');
  pRect(ctx, px + 74, py + 21, 8, 3, '#ffedd5');
  pRect(ctx, px + 72, py + 31, 14, 3, '#fba765');

  // Curled Fingers gripping pencil pointing back left
  pRect(ctx, px + 60, py + 25, 12, 7, OUTLINE);
  pRect(ctx, px + 61, py + 26, 10, 5, '#fed7aa');
  pRect(ctx, px + 62, py + 24, 5, 3, '#ffedd5');

  // Opposing Yellow Drafting Pencil
  pRect(ctx, px + 48 - sketchMove, py + 29, 20, 4, OUTLINE);
  pRect(ctx, px + 49 - sketchMove, py + 30, 18, 2, '#f59e0b');
  pRect(ctx, px + 45 - sketchMove, py + 29, 4, 4, '#fed7aa');
  pRect(ctx, px + 42 - sketchMove, py + 30, 3, 2, '#0f172a'); // Lead point sketching left cuff!

  // Graphite sketches actively being drawn
  pRect(ctx, px + 30, py + 29, 6, 1, '#475569');
  pRect(ctx, px + 78, py + 27, 6, 1, '#475569');

  // Inkpot & Stopper on Desk Margin
  pRect(ctx, px + 98, py + 8, 8, 8, OUTLINE);
  pRect(ctx, px + 99, py + 9, 6, 6, '#080c14');
  pRect(ctx, px + 101, py + 6, 2, 3, '#fde047');
}

/**
 * 6. THE MÖBIUS TERRARIUM (*Möbius Strip II, 1963*)
 * Greatly enlarged grand Victorian display:
 * - 114px wide fluted marble/walnut plinth with brass plaque
 * - Large 96px crystal glass bell jar dome with refraction highlights
 * - Giant 76px wide x 38px tall continuous 3D Möbius ribbon with distinct 180° twist,
 *   dual-tone face/underside shading, and rectangular lattice perforations
 * - Three large articulated clockwork ants actively crawling along its single continuous surface
 */
export function drawMobiusTerrarium(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number) {
  const px = Math.floor(x);
  const py = Math.floor(y);

  const OUTLINE = '#080c14';

  // Ground Pedestal Shadow
  ctx.fillStyle = 'rgba(2, 6, 23, 0.75)';
  ctx.beginPath();
  ctx.ellipse(px + 57, py + 96, 56, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // 1. Classical Fluted Marble & Walnut Pedestal (Width 96px, Height 32px)
  pRect(ctx, px + 12, py + 66, 90, 28, OUTLINE);
  pRect(ctx, px + 14, py + 68, 86, 24, '#1e293b');
  // 6 Fluted Column Grooves
  for (let f = 0; f < 6; f++) {
    pRect(ctx, px + 22 + f * 13, py + 68, 6, 24, '#334155');
    pRect(ctx, px + 24 + f * 13, py + 68, 2, 24, '#64748b'); // Highlight
  }
  // Molded Plinth Cornice Base and Capital
  pRect(ctx, px + 8, py + 62, 98, 6, OUTLINE);
  pRect(ctx, px + 9, py + 63, 96, 4, '#64748b');
  pRect(ctx, px + 9, py + 63, 96, 1, '#cbd5e1'); // Top highlight ridge
  pRect(ctx, px + 8, py + 92, 98, 6, OUTLINE);
  pRect(ctx, px + 9, py + 93, 96, 4, '#0f172a');

  // Engraved Brass Museum Label Plaque
  pRect(ctx, px + 34, py + 84, 46, 7, OUTLINE);
  pRect(ctx, px + 35, py + 85, 44, 5, '#b45309');
  pRect(ctx, px + 36, py + 86, 42, 1, '#fde047');

  // 2. Giant Crystal Blown-Glass Bell Jar Dome (Width 96px, Height 64px)
  const jarX = px + 9;
  const jarY = py + 6;
  const jarW = 96;
  const jarH = 58;

  // Bell Jar Interior Tint
  ctx.fillStyle = 'rgba(56, 189, 248, 0.09)';
  ctx.fillRect(jarX, jarY + 16, jarW, jarH - 16);
  // Glass dome arched ceiling
  ctx.beginPath();
  ctx.arc(jarX + jarW / 2, jarY + 22, jarW / 2, Math.PI, 0);
  ctx.fill();

  // Glass Outlines & Curving Specular Glints
  pRect(ctx, jarX, jarY + 20, jarW, 1, 'rgba(255, 255, 255, 0.55)');
  pRect(ctx, jarX + 3, jarY + 22, 2, jarH - 24, 'rgba(255, 255, 255, 0.4)');
  pRect(ctx, jarX + jarW - 5, jarY + 22, 2, jarH - 24, 'rgba(255, 255, 255, 0.25)');

  // Top Blown-Glass Finial Ball & Brass Mount
  pRect(ctx, jarX + jarW / 2 - 4, jarY, 8, 8, OUTLINE);
  pRect(ctx, jarX + jarW / 2 - 3, jarY + 1, 6, 6, '#38bdf8');
  pRect(ctx, jarX + jarW / 2 - 1, jarY + 1, 2, 2, '#ffffff');

  // 3. THE GIANT MÖBIUS STRIP (Prominent, High-Contrast 3D Twisted Ribbon)
  const mx = px + 57;
  const my = py + 38;

  // Outer Ribbon Loop (Span: 76px wide, 34px tall, 10px thick band)
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#b45309'; // Rich burnished brass body
  ctx.beginPath();
  ctx.ellipse(mx, my, 34, 15, Math.PI / 10, 0, Math.PI * 2);
  ctx.stroke();

  // Highlight Ridge along Top Edge
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#fef08a';
  ctx.beginPath();
  ctx.ellipse(mx, my - 2, 33, 14, Math.PI / 10, 0, Math.PI);
  ctx.stroke();

  // Shaded Underside Ridge
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#451a03';
  ctx.beginPath();
  ctx.ellipse(mx, my + 2, 33, 14, Math.PI / 10, Math.PI, Math.PI * 2);
  ctx.stroke();

  // The 180° Half-Twist Crossover (The Crucial Visual Paradox!)
  // Directly in center: flips outer brass into dark underside patina
  pRect(ctx, mx - 12, my - 10, 24, 20, OUTLINE);
  pRect(ctx, mx - 11, my - 9, 22, 18, '#78350f'); // Patina underside
  pRect(ctx, mx - 6, my - 8, 12, 16, '#f59e0b');  // Beveled outer face crossing diagonally
  pRect(ctx, mx - 3, my - 5, 6, 10, '#fef08a');   // Specular peak on twist crest

  // Rectangular Lattice Perforations (Matching Escher's woodcut wood-lattice)
  for (let s = -3; s <= 3; s++) {
    if (s === 0) continue; // Skip center twist
    pRect(ctx, mx + s * 10 - 2, my + 6, 4, 2, '#080c14');
    pRect(ctx, mx + s * 10 - 4, my - 9, 4, 2, '#080c14');
  }

  // 4. THREE LARGE ARTICULATED CLOCKWORK ANTS (Length ~18px)
  const legCycle = Math.floor((timeMs / 140) % 2);

  // --- Ant 1: Marching to the right on upper brass rim (Right-side up) ---
  const crawl1 = Math.sin(timeMs * 0.005) * 4;
  const a1x = mx - 14 + crawl1;
  const a1y = my - 14;

  pRect(ctx, a1x - 5, a1y - 3, 10, 6, OUTLINE);
  pRect(ctx, a1x - 4, a1y - 2, 8, 4, '#ca8a04'); // Brass abdomen
  // Thorax & Head
  pRect(ctx, a1x + 3, a1y - 2, 4, 4, '#080c14');
  pRect(ctx, a1x + 7, a1y - 3, 2, 3, '#ca8a04'); // Head
  pRect(ctx, a1x + 9, a1y - 4, 1, 2, '#080c14'); // Antenna
  // 6 Jointed Stepping Legs
  pRect(ctx, a1x - 4, a1y - 4 - legCycle, 2, 3, '#080c14');
  pRect(ctx, a1x, a1y - 4 - (1 - legCycle), 2, 3, '#080c14');
  pRect(ctx, a1x + 4, a1y - 4 - legCycle, 2, 3, '#080c14');

  // --- Ant 2: Climbing across the 180° Half-Twist Ridge at 45° ---
  const crawl2 = Math.cos(timeMs * 0.004) * 3;
  const a2x = mx + 4 + crawl2;
  const a2y = my - 1;

  pRect(ctx, a2x - 4, a2y - 4, 8, 8, OUTLINE);
  pRect(ctx, a2x - 3, a2y - 3, 6, 6, '#fde047');
  pRect(ctx, a2x + 1, a2y - 1, 3, 3, '#080c14');
  pRect(ctx, a2x - 5, a2y - 2, 2, 2, '#080c14'); // Left leg clinging to twist

  // --- Ant 3: Crawling on the UNDERSIDE (Upside Down! Proves single surface) ---
  const crawl3 = -Math.sin(timeMs * 0.005) * 4;
  const a3x = mx + 16 + crawl3;
  const a3y = my + 12;

  pRect(ctx, a3x - 5, a3y, 10, 6, OUTLINE);
  pRect(ctx, a3x - 4, a3y + 1, 8, 4, '#ca8a04'); // Abdomen hanging down
  pRect(ctx, a3x - 6, a3y + 1, 3, 3, '#080c14'); // Head facing left
  pRect(ctx, a3x - 8, a3y + 3, 2, 1, '#080c14'); // Antenna
  // Legs reaching UP to cling to the underside of the continuous ribbon
  pRect(ctx, a3x - 4, a3y - 2 + legCycle, 2, 3, '#080c14');
  pRect(ctx, a3x, a3y - 2 + (1 - legCycle), 2, 3, '#080c14');
  pRect(ctx, a3x + 4, a3y - 2 + legCycle, 2, 3, '#080c14');
}
