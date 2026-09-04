import { TILE_SIZE } from '../core/constants';
import { Direction, CompanionActivity, ProjectItem } from '../core/types';

// Helper to draw a pixel-perfect rectangle
export function pRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

// Draw a cozy herringbone / wooden plank floor tile
export function drawFloorPlank(ctx: CanvasRenderingContext2D, x: number, y: number, variant: number) {
  const baseTones = ['#3d2817', '#452e1b', '#3f2918', '#49311d'];
  const base = baseTones[variant % baseTones.length];
  pRect(ctx, x, y, TILE_SIZE, TILE_SIZE, base);

  // Plank grooves
  ctx.fillStyle = '#27170c';
  ctx.fillRect(x, y + 15, TILE_SIZE, 1);
  ctx.fillRect(x, y + 31, TILE_SIZE, 1);
  if (variant % 2 === 0) {
    ctx.fillRect(x + 15, y, 1, 15);
    ctx.fillRect(x + 7, y + 16, 1, 15);
  } else {
    ctx.fillRect(x + 23, y, 1, 15);
    ctx.fillRect(x + 15, y + 16, 1, 15);
  }

  // Subtle highlight on wood edge
  ctx.fillStyle = '#573b22';
  ctx.fillRect(x, y, TILE_SIZE, 1);
  ctx.fillRect(x, y + 16, TILE_SIZE, 1);
}

// Draw decorative wall tile
export function drawWallTile(ctx: CanvasRenderingContext2D, x: number, y: number, isBottom: boolean) {
  if (isBottom) {
    // Wainscoting
    pRect(ctx, x, y, TILE_SIZE, TILE_SIZE, '#2a1a10');
    // Wood panel inset
    pRect(ctx, x + 3, y + 4, TILE_SIZE - 6, TILE_SIZE - 8, '#3b2517');
    pRect(ctx, x + 4, y + 5, TILE_SIZE - 8, 1, '#4f3320'); // highlight
    pRect(ctx, x + 4, y + TILE_SIZE - 5, TILE_SIZE - 8, 1, '#1b0f08'); // shadow
    // Baseboard
    pRect(ctx, x, y + TILE_SIZE - 3, TILE_SIZE, 3, '#1d1109');
  } else {
    // Upper wall (warm plaster / library stone)
    pRect(ctx, x, y, TILE_SIZE, TILE_SIZE, '#221e1c');
    pRect(ctx, x, y + TILE_SIZE - 2, TILE_SIZE, 2, '#38322e');
    // Subtle wallpaper / plaster texture
    pRect(ctx, x + 8, y + 6, 2, 2, '#2b2623');
    pRect(ctx, x + 20, y + 18, 2, 2, '#2b2623');
  }
}

// Draw arched mullioned window casting soft moonlight/dusk
export function drawWindow(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number) {
  const w = 48;
  const h = 54;
  // Frame
  pRect(ctx, x, y, w, h, '#1a120b');
  pRect(ctx, x + 2, y + 2, w - 4, h - 4, '#2d1f14');

  // Glass panes (deep night sky with stars and moon glow)
  const pulse = Math.sin(timeMs * 0.001) * 0.05 + 0.95;
  const glassColor = `rgba(50, 75, 110, ${0.85 * pulse})`;
  pRect(ctx, x + 4, y + 4, w - 8, h - 8, glassColor);

  // Stars
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 12, y + 12, 1, 1);
  ctx.fillRect(x + 32, y + 18, 1, 1);
  ctx.fillRect(x + 22, y + 28, 1, 1);

  // Soft moon crescent in upper corner
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(x + 34, y + 14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = glassColor;
  ctx.beginPath();
  ctx.arc(x + 32, y + 13, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Mullion grid bars
  ctx.fillStyle = '#1e140c';
  ctx.fillRect(x + Math.floor(w / 2) - 1, y + 4, 2, h - 8);
  ctx.fillRect(x + 4, y + 20, w - 8, 2);
  ctx.fillRect(x + 4, y + 36, w - 8, 2);

  // Sill
  pRect(ctx, x - 2, y + h - 4, w + 4, 5, '#3d2817');
  pRect(ctx, x - 2, y + h - 4, w + 4, 1, '#5a3d24');
}

// Draw crackling stone fireplace
export function drawFireplace(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number) {
  const w = 64;
  const h = 54;

  // Stone masonry mantle
  pRect(ctx, x, y, w, h, '#2b2623');
  pRect(ctx, x + 2, y + 2, w - 4, 8, '#443d38'); // top mantle shelf
  pRect(ctx, x + 2, y + 2, w - 4, 1, '#635b54'); // highlight

  // Stone pillars
  pRect(ctx, x + 4, y + 10, 12, h - 12, '#38322e');
  pRect(ctx, x + w - 16, y + 10, 12, h - 12, '#38322e');

  // Hearth chamber
  pRect(ctx, x + 16, y + 16, w - 32, h - 18, '#0f0c0a');

  // Logs
  pRect(ctx, x + 20, y + h - 10, w - 40, 6, '#382215');
  pRect(ctx, x + 22, y + h - 13, w - 44, 4, '#24140b');

  // Animated fire flames
  const f1 = Math.sin(timeMs * 0.012) * 3;
  const f2 = Math.cos(timeMs * 0.015) * 2;
  const f3 = Math.sin(timeMs * 0.009 + 2) * 3;

  // Outer red-orange flame
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(x + 22, y + h - 8);
  ctx.lineTo(x + 28 + f1, y + 26 + f2);
  ctx.lineTo(x + 34, y + 22 + f3);
  ctx.lineTo(x + 40 - f1, y + 28 + f2);
  ctx.lineTo(x + 44, y + h - 8);
  ctx.closePath();
  ctx.fill();

  // Inner warm amber flame
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(x + 24, y + h - 8);
  ctx.lineTo(x + 30 + f2, y + 29 + f1);
  ctx.lineTo(x + 35, y + 27);
  ctx.lineTo(x + 38 - f3, y + 31);
  ctx.lineTo(x + 42, y + h - 8);
  ctx.closePath();
  ctx.fill();

  // White-hot core
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(x + 33, y + h - 9, 4 + Math.sin(timeMs * 0.02) * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Ember spark particles
  const sparkY = ((timeMs * 0.04) % 24);
  const sparkX = Math.sin(timeMs * 0.01) * 6;
  ctx.fillStyle = '#fde047';
  ctx.fillRect(x + 32 + sparkX, y + h - 14 - sparkY, 1, 1);
}

// Draw Persian patterned rug
export function drawOrnateRug(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // 1. Soft drop shadow on wooden floorboards
  ctx.fillStyle = 'rgba(10, 6, 3, 0.4)';
  ctx.fillRect(x + 2, y + 2, w, h);

  // 2. Base rug rich madder crimson field
  pRect(ctx, x, y, w, h, '#7c1525');

  // 3. Fringed ends (delicate ivory linen threads top & bottom)
  ctx.fillStyle = '#fef3c7';
  for (let i = x + 4; i < x + w - 4; i += 3) {
    ctx.fillRect(i, y - 2, 1, 3);
    ctx.fillRect(i, y + h - 1, 1, 3);
  }

  // 4. Multi-tier Persian guard borders
  // Outer gold guard border
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);

  // Wide midnight navy border band
  pRect(ctx, x + 4, y + 4, w - 8, h - 8, '#1e293b');
  // Delicate repeating florets along the navy border
  ctx.fillStyle = '#d97706';
  for (let bx = x + 8; bx < x + w - 8; bx += 12) {
    ctx.fillRect(bx, y + 5, 2, 2);
    ctx.fillRect(bx, y + h - 7, 2, 2);
  }
  for (let by = y + 8; by < y + h - 8; by += 12) {
    ctx.fillRect(x + 5, by, 2, 2);
    ctx.fillRect(x + w - 7, by, 2, 2);
  }

  // Inner gold filigree stripe
  ctx.strokeStyle = '#d97706';
  ctx.strokeRect(x + 8.5, y + 8.5, w - 17, h - 17);

  // Inner field: deep plush burgundy
  pRect(ctx, x + 10, y + 10, w - 20, h - 20, '#881337');

  // Four ornate corner spandrels (bracketed corner ornaments)
  // Top-left
  pRect(ctx, x + 10, y + 10, 10, 10, '#1e293b');
  pRect(ctx, x + 11, y + 11, 8, 8, '#b45309');
  pRect(ctx, x + 12, y + 12, 6, 6, '#881337');
  // Top-right
  pRect(ctx, x + w - 20, y + 10, 10, 10, '#1e293b');
  pRect(ctx, x + w - 19, y + 11, 8, 8, '#b45309');
  pRect(ctx, x + w - 18, y + 12, 6, 6, '#881337');
  // Bottom-left
  pRect(ctx, x + 10, y + h - 20, 10, 10, '#1e293b');
  pRect(ctx, x + 11, y + h - 19, 8, 8, '#b45309');
  pRect(ctx, x + 12, y + h - 18, 6, 6, '#881337');
  // Bottom-right
  pRect(ctx, x + w - 20, y + h - 20, 10, 10, '#1e293b');
  pRect(ctx, x + w - 19, y + h - 19, 8, 8, '#b45309');
  pRect(ctx, x + w - 18, y + h - 18, 6, 6, '#881337');

  // Subtle, quiet field texture (repeating mini cross-stitch dots in dark amber)
  ctx.fillStyle = 'rgba(180, 83, 9, 0.35)';
  for (let fx = x + 24; fx < x + w - 24; fx += 16) {
    for (let fy = y + 24; fy < y + h - 24; fy += 16) {
      ctx.fillRect(fx, fy, 2, 2);
    }
  }
}

// Draw the Library Bookshelf
export function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Heavy walnut cabinet frame
  pRect(ctx, x, y, w, h, '#2c1810');
  pRect(ctx, x + 2, y + 2, w - 4, 3, '#4a2b1c'); // top molding

  // Shelf levels
  const shelfCount = 3;
  const shelfH = (h - 8) / shelfCount;

  const bookSpineColors = [
    '#991b1b', '#1e3a5f', '#166534', '#854d0e', '#701a75', '#334155', '#9a3412', '#431407'
  ];

  for (let s = 0; s < shelfCount; s++) {
    const sy = y + 6 + s * shelfH;
    // Wood shelf divider
    pRect(ctx, x + 2, sy + shelfH - 3, w - 4, 3, '#432617');

    // Fill shelf with book spines
    let bx = x + 4;
    let bIdx = (s * 5) % bookSpineColors.length;
    while (bx < x + w - 6) {
      const bw = 3 + ((bx + s * 7) % 3);
      const bh = shelfH - 5 - ((bx * 3) % 4);
      const color = bookSpineColors[bIdx % bookSpineColors.length];

      // Jerry Pallotta special red/gold book on lower shelf
      const isPallotta = (s === 1 && bx >= x + 16 && bx <= x + 22);
      const bookColor = isPallotta ? '#b91c1c' : color;

      pRect(ctx, bx, sy + shelfH - 3 - bh, bw, bh, bookColor);

      // Gold spine embossing band
      if (isPallotta) {
        pRect(ctx, bx, sy + shelfH - 3 - bh + 2, bw, 1, '#fde047');
        pRect(ctx, bx, sy + shelfH - 3 - 3, bw, 1, '#fde047');
      } else if (bw >= 4) {
        pRect(ctx, bx, sy + shelfH - 3 - bh + 2, bw, 1, '#ca8a04');
      }

      bx += bw + 1;
      bIdx++;
    }
  }
}

// Draw Armchair & substantial library table with steaming tea, lamp, ottoman, and open book
export function drawReadingNook(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number, bookOnRug: boolean) {
  const ax = x;
  const ay = y;

  // 1. Wingback Armchair
  // Chair Shadow
  ctx.fillStyle = 'rgba(15, 10, 5, 0.4)';
  ctx.beginPath();
  ctx.ellipse(ax + 16, ay + 28, 16, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chair Carved Mahogany Frame & Back
  pRect(ctx, ax + 2, ay + 2, 28, 24, '#3b1419'); // dark mahogany silhouette
  pRect(ctx, ax + 4, ay + 3, 24, 20, '#6b1d28'); // rich velvet burgundy
  pRect(ctx, ax + 6, ay + 5, 20, 16, '#882232'); // inner backrest
  // Button tufting on backrest
  ctx.fillStyle = '#4a121b';
  ctx.fillRect(ax + 9, ay + 8, 2, 2);
  ctx.fillRect(ax + 15, ay + 8, 2, 2);
  ctx.fillRect(ax + 21, ay + 8, 2, 2);
  ctx.fillRect(ax + 12, ay + 13, 2, 2);
  ctx.fillRect(ax + 18, ay + 13, 2, 2);

  // Rolled wing armrests
  pRect(ctx, ax - 1, ay + 8, 6, 20, '#4f161e');
  pRect(ctx, ax, ay + 9, 4, 18, '#731f2b');
  pRect(ctx, ax + 27, ay + 8, 6, 20, '#4f161e');
  pRect(ctx, ax + 28, ay + 9, 4, 18, '#731f2b');

  // Deep seat cushion
  pRect(ctx, ax + 4, ay + 16, 24, 13, '#992638');
  pRect(ctx, ax + 5, ay + 17, 22, 3, '#ba3045'); // plush cushion highlight

  // Carved wooden feet with brass claw caps
  pRect(ctx, ax + 3, ay + 28, 4, 4, '#241007');
  pRect(ctx, ax + 25, ay + 28, 4, 4, '#241007');
  pRect(ctx, ax + 4, ay + 30, 2, 2, '#d97706');
  pRect(ctx, ax + 26, ay + 30, 2, 2, '#d97706');

  // 2. Matching Velvet Footstool / Ottoman in front of Chair
  const ox = ax + 5;
  const oy = ay + 33;
  ctx.fillStyle = 'rgba(15, 10, 5, 0.35)';
  ctx.fillRect(ox + 1, oy + 8, 20, 4);
  pRect(ctx, ox, oy, 22, 9, '#3b1419'); // wood frame
  pRect(ctx, ox + 2, oy + 1, 18, 6, '#882232'); // burgundy tufted cushion
  pRect(ctx, ox + 3, oy + 2, 16, 2, '#ba3045'); // cushion highlight
  pRect(ctx, ox + 1, oy + 8, 3, 2, '#d97706'); // brass foot
  pRect(ctx, ox + 18, oy + 8, 3, 2, '#d97706'); // brass foot

  // 3. Substantial Dark Walnut Occasional Library Table (spaced comfortably to the right)
  const tx = ax + 38; // generous 10px breathing room
  const ty = ay + 2;

  // Table Shadow
  ctx.fillStyle = 'rgba(15, 10, 5, 0.35)';
  ctx.beginPath();
  ctx.ellipse(tx + 14, ty + 30, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Carved Pedestal Stem & Tripod Legs
  pRect(ctx, tx + 12, ty + 16, 4, 13, '#2e180d'); // main column
  pRect(ctx, tx + 13, ty + 17, 2, 11, '#452616'); // column highlight
  pRect(ctx, tx + 6, ty + 26, 16, 4, '#201008'); // tripod feet
  pRect(ctx, tx + 5, ty + 28, 3, 2, '#b45309'); // brass foot
  pRect(ctx, tx + 20, ty + 28, 3, 2, '#b45309');

  // Polished Oval Tabletop
  pRect(ctx, tx, ty + 7, 28, 11, '#2b160b'); // rim shadow
  pRect(ctx, tx + 1, ty + 5, 26, 10, '#4d2916'); // beveled rim
  pRect(ctx, tx + 2, ty + 6, 24, 8, '#66391f'); // polished mahogany
  pRect(ctx, tx + 3, ty + 7, 22, 1, '#854d2b'); // wood luster

  // Stack of Research Volumes on Table Left
  pRect(ctx, tx + 3, ty + 6, 8, 3, '#1e3a5f'); // blue volume
  pRect(ctx, tx + 3, ty + 4, 7, 3, '#78350f'); // brown volume
  pRect(ctx, tx + 9, ty + 5, 1, 2, '#fde047'); // gold page edges

  // Classic Banker's Brass Reading Lamp with Emerald Shade
  const lx = tx + 16;
  const ly = ty - 8;
  pRect(ctx, lx + 3, ly + 14, 5, 2, '#ca8a04'); // brass base
  pRect(ctx, lx + 5, ly + 4, 2, 10, '#eab308'); // curved brass arm
  pRect(ctx, lx + 1, ly + 2, 10, 5, '#065f46'); // emerald shade
  pRect(ctx, lx + 2, ly + 3, 8, 2, '#059669'); // emerald highlight
  // Warm golden bulb glow pool on table
  ctx.fillStyle = 'rgba(253, 224, 71, 0.18)';
  ctx.beginPath();
  ctx.ellipse(tx + 18, ty + 9, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fine Porcelain Teacup on Saucer
  const cx = tx + 17;
  const cy = ty + 7;
  pRect(ctx, cx - 1, cy + 3, 7, 2, '#cbd5e1'); // saucer
  pRect(ctx, cx, cy + 1, 5, 3, '#f8fafc'); // cup body
  pRect(ctx, cx + 1, cy + 1, 3, 1, '#92400e'); // tea
  pRect(ctx, cx + 5, cy + 2, 1, 2, '#94a3b8'); // handle

  // Animated delicate steam curls rising from the tea
  const sWave1 = Math.sin(timeMs * 0.004) * 2;
  const sWave2 = Math.cos(timeMs * 0.005) * 2;
  const sY = (timeMs * 0.015) % 12;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(cx + 2 + sWave1, cy - 2 - sY, 1, 3);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(cx + 3 + sWave2, cy - 6 - sY * 0.8, 1, 2);

  // 4. Open Book on Persian Rug (when memory was recalled)
  if (bookOnRug) {
    // Placed neatly to the right of the footstool with clear space around it!
    const rbx = ax + 34;
    const rby = ay + 33;

    // Book drop shadow on rug
    ctx.fillStyle = 'rgba(10, 6, 4, 0.4)';
    ctx.fillRect(rbx + 1, rby + 1, 24, 14);

    // Red Morocco leather binding cover
    pRect(ctx, rbx, rby, 22, 13, '#7f1d1d');
    pRect(ctx, rbx + 1, rby + 1, 20, 11, '#991b1b');

    // Open cream parchment spreads (left and right pages)
    pRect(ctx, rbx + 2, rby + 2, 8, 9, '#fef9c3'); // left page
    pRect(ctx, rbx + 11, rby + 2, 8, 9, '#fef9c3'); // right page
    pRect(ctx, rbx + 10, rby + 1, 1, 11, '#ca8a04'); // gilded spine valley

    // Miniature printed paragraph lines
    ctx.fillStyle = '#475569';
    ctx.fillRect(rbx + 3, rby + 4, 6, 1);
    ctx.fillRect(rbx + 3, rby + 6, 5, 1);
    ctx.fillRect(rbx + 3, rby + 8, 6, 1);
    ctx.fillRect(rbx + 12, rby + 4, 6, 1);
    ctx.fillRect(rbx + 12, rby + 6, 6, 1);
    ctx.fillRect(rbx + 12, rby + 8, 4, 1);

    // Crimson silk ribbon bookmark trailing out onto rug
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rbx + 10, rby + 10);
    ctx.quadraticCurveTo(rbx + 8, rby + 16, rbx + 12, rby + 18);
    ctx.stroke();
  }
}

// Draw Workshop Desk with Prominent CRT Terminal (Active FEA / von Mises Heatmap) and Stegoceras Skull
// Draw Workshop: Independent University Blackboard on Easel + Victorian Laboratory Workbench
export function drawWorkshop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  _w: number,
  _h: number,
  project: ProjectItem,
  _equation: string,
  timeMs: number
) {
  // =========================================================================
  // 1. STATELY UNIVERSITY BLACKBOARD ON A-FRAME ROLLING EASEL (Left Side)
  // =========================================================================
  const ex = x + 2;
  const ey = y - 10;
  const ew = 74; // widened from 56 to 74px so equations fit comfortably!
  const eh = 46;

  // Easel shadow on floorboards
  ctx.fillStyle = 'rgba(10, 8, 6, 0.4)';
  ctx.fillRect(ex + 2, ey + 68, ew - 4, 4);

  // A-Frame Wooden Easel Stand Legs
  pRect(ctx, ex + 2, ey + 6, 3, 62, '#3d2213'); // left front leg
  pRect(ctx, ex + ew - 5, ey + 6, 3, 62, '#3d2213'); // right front leg
  pRect(ctx, ex + Math.floor(ew / 2) - 2, ey + 4, 4, 64, '#221208'); // rear tilt prop leg
  pRect(ctx, ex + 2, ey + 52, ew - 4, 3, '#4a2b1a'); // horizontal cross brace
  pRect(ctx, ex + 1, ey + 66, 5, 2, '#b45309'); // brass castor foot left
  pRect(ctx, ex + ew - 6, ey + 66, 5, 2, '#b45309'); // brass castor foot right

  // Framed Slate Blackboard (mounted at comfortable reading height)
  pRect(ctx, ex + 2, ey, ew - 4, eh, '#452615'); // oak frame
  pRect(ctx, ex + 4, ey + 2, ew - 8, eh - 4, '#2d180d'); // inner beveled shadow
  pRect(ctx, ex + 5, ey + 3, ew - 10, eh - 6, '#0f172a'); // dark charcoal slate

  // Brass pivot knobs on sides
  pRect(ctx, ex, ey + 20, 3, 4, '#f59e0b');
  pRect(ctx, ex + ew - 3, ey + 20, 3, 4, '#f59e0b');

  // Chalk dust ledge & chalk sticks
  pRect(ctx, ex + 2, ey + eh - 2, ew - 4, 3, '#5c331c'); // ledge
  pRect(ctx, ex + 8, ey + eh - 3, 5, 1, '#ffffff'); // white chalk
  pRect(ctx, ex + 16, ey + eh - 3, 4, 1, '#fde047'); // yellow chalk
  pRect(ctx, ex + ew - 16, ey + eh - 4, 10, 2, '#78350f'); // felt eraser

  // Chalk text (COMPLETELY UNOBSTRUCTED & 100% LEGIBLE with comfortable margins!)
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 7px monospace';
  ctx.fillText('∇ · σ + f = 0', ex + 8, ey + 15);
  ctx.fillStyle = '#fde68a';
  ctx.font = '6px monospace';
  ctx.fillText('Linear Elasticity', ex + 8, ey + 25);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '5px monospace';
  ctx.fillText('FEA Stress Tensor σ_ij', ex + 8, ey + 34);

  // Tiny hand-drawn stress element cube on slate
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.75)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(ex + ew - 20, ey + 25, 7, 7);
  ctx.beginPath();
  ctx.moveTo(ex + ew - 13, ey + 28.5); ctx.lineTo(ex + ew - 8, ey + 28.5); // sigma arrow
  ctx.stroke();

  // =========================================================================
  // 2. HEAVY VICTORIAN LABORATORY WORKBENCH (Right Side)
  // =========================================================================
  const dx = ex + ew + 8; // 8px breathing space between easel and workbench
  const dy = y + 6;
  const dw = 120; // 120px wide workbench
  const dh = 54;

  // Table drop shadow on floor
  ctx.fillStyle = 'rgba(10, 8, 6, 0.45)';
  ctx.fillRect(dx + 4, dy + dh - 2, dw - 8, 6);

  // Tabletop Beveled Mahogany Surface
  pRect(ctx, dx, dy + 2, dw, 22, '#452615'); // mahogany top
  pRect(ctx, dx + 1, dy + 2, dw - 2, 2, '#6e3c20'); // polished top bevel highlight
  pRect(ctx, dx, dy + 22, dw, 3, '#2a160b'); // front lip shadow
  pRect(ctx, dx, dy + 2, 4, 4, '#b45309'); // brass corner bracket left
  pRect(ctx, dx + dw - 4, dy + 2, 4, 4, '#b45309'); // brass corner bracket right

  // Table Front Architecture
  // Left Pedestal (drawers)
  pRect(ctx, dx + 4, dy + 25, 26, dh - 27, '#331a0e');
  pRect(ctx, dx + 6, dy + 27, 22, 10, '#452615');
  pRect(ctx, dx + 14, dy + 31, 6, 2, '#f59e0b'); // brass handle
  pRect(ctx, dx + 6, dy + 39, 22, 10, '#452615');
  pRect(ctx, dx + 14, dy + 43, 6, 2, '#f59e0b'); // brass handle

  // Right Pedestal (drawers)
  pRect(ctx, dx + dw - 30, dy + 25, 26, dh - 27, '#331a0e');
  pRect(ctx, dx + dw - 28, dy + 27, 22, 10, '#452615');
  pRect(ctx, dx + dw - 20, dy + 31, 6, 2, '#f59e0b'); // brass handle
  pRect(ctx, dx + dw - 28, dy + 39, 22, 10, '#452615');
  pRect(ctx, dx + dw - 20, dy + 43, 6, 2, '#f59e0b'); // brass handle

  // Open Center Kneehole (shows dark recessed cavity & floorboards!)
  pRect(ctx, dx + 30, dy + 25, dw - 60, dh - 27, '#150a05');
  pRect(ctx, dx + 30, dy + 25, dw - 60, 4, '#241209'); // arch apron

  // Turned Table Legs with Brass Caps
  pRect(ctx, dx + 5, dy + dh - 2, 4, 3, '#b45309');
  pRect(ctx, dx + 25, dy + dh - 2, 4, 3, '#b45309');
  pRect(ctx, dx + dw - 29, dy + dh - 2, 4, 3, '#b45309');
  pRect(ctx, dx + dw - 9, dy + dh - 2, 4, 3, '#b45309');

  // Scientific Blueprints & Drafting Tools (Centered between CRT and Skull with ample margin!)
  const bx = dx + 52;
  pRect(ctx, bx, dy + 5, 24, 15, '#1e3a8a'); // blueprint paper
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(bx + 1.5, dy + 6.5, 21, 12);
  ctx.beginPath();
  ctx.arc(bx + 11, dy + 12.5, 4, 0, Math.PI * 2);
  ctx.stroke();
  // Brass drafting compass & ruler
  pRect(ctx, bx + 16, dy + 7, 2, 11, '#d97706');
  pRect(ctx, bx + 2, dy + 20, 18, 1, '#b45309');

  // =========================================================================
  // 3. PROMINENT RETRO CRT WORKSTATION TERMINAL (FEA & von Mises Display)
  // =========================================================================
  const mx = dx + 6;
  const my = dy - 12;
  const mw = 40;
  const mh = 32;
  const isComplete = project.status === 'completed';

  // CRT Monitor Housing (vintage industrial dark slate)
  pRect(ctx, mx, my, mw, mh, '#1e293b'); // outer casing
  pRect(ctx, mx + 2, my + 2, mw - 4, mh - 4, '#0f172a'); // inner bezel
  pRect(ctx, mx + 3, my + 3, mw - 6, mh - 10, '#020617'); // dark cathode screen area

  // Power LED & Ventilation Grille
  const ledColor = isComplete ? '#10b981' : (Math.sin(timeMs * 0.008) > 0 ? '#38bdf8' : '#0284c7');
  pRect(ctx, mx + mw - 7, my + mh - 6, 3, 2, ledColor);
  pRect(ctx, mx + 5, my + mh - 6, 14, 2, '#334155');

  // Active Cathode Phosphor Glow
  const scrX = mx + 4;
  const scrY = my + 4;
  const scrW = mw - 8;
  const scrH = mh - 12;

  // CRT Scanlines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  for (let l = scrY; l < scrY + scrH; l += 2) {
    ctx.fillRect(scrX, l, scrW, 1);
  }

  // Stegoceras Skull Geometry on CRT Screen
  const kx = scrX + 4;
  const ky = scrY + 2;

  if (isComplete) {
    // -----------------------------------------------------------------------
    // STATE: COMPLETED -> FULL VON MISES STRESS HEATMAP!
    // -----------------------------------------------------------------------
    // Element 1: Dorsal Impact Apex (High Stress Concentration: Red / Crimson)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(kx + 14, ky + 1);
    ctx.lineTo(kx + 20, ky + 1);
    ctx.lineTo(kx + 17, ky + 6);
    ctx.closePath();
    ctx.fill();

    // Element 2: Frontoparietal Dome Core (High-Mid Stress: Orange)
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(kx + 10, ky + 3);
    ctx.lineTo(kx + 14, ky + 1);
    ctx.lineTo(kx + 17, ky + 6);
    ctx.lineTo(kx + 12, ky + 7);
    ctx.closePath();
    ctx.fill();

    // Element 3: Posterior Dome & Shelf (Mid Stress: Amber / Yellow)
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(kx + 20, ky + 1);
    ctx.lineTo(kx + 24, ky + 5);
    ctx.lineTo(kx + 21, ky + 8);
    ctx.lineTo(kx + 17, ky + 6);
    ctx.closePath();
    ctx.fill();

    // Element 4: Skull Roof & Temporal Bar (Low-Mid Stress: Green)
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(kx + 12, ky + 7);
    ctx.lineTo(kx + 17, ky + 6);
    ctx.lineTo(kx + 21, ky + 8);
    ctx.lineTo(kx + 18, ky + 12);
    ctx.lineTo(kx + 11, ky + 12);
    ctx.closePath();
    ctx.fill();

    // Element 5: Snout & Maxilla (Low Stress: Cyan)
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.moveTo(kx + 4, ky + 9);
    ctx.lineTo(kx + 10, ky + 3);
    ctx.lineTo(kx + 12, ky + 7);
    ctx.lineTo(kx + 8, ky + 12);
    ctx.closePath();
    ctx.fill();

    // Element 6: Occipital Condyle & Braincase (Minimal Stress: Deep Cobalt Blue)
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(kx + 18, ky + 12);
    ctx.lineTo(kx + 24, ky + 9);
    ctx.lineTo(kx + 23, ky + 14);
    ctx.lineTo(kx + 16, ky + 14);
    ctx.closePath();
    ctx.fill();

    // White mesh boundary element lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(kx + 4, ky + 9);
    ctx.lineTo(kx + 10, ky + 3);
    ctx.lineTo(kx + 14, ky + 1);
    ctx.lineTo(kx + 20, ky + 1);
    ctx.lineTo(kx + 24, ky + 5);
    ctx.lineTo(kx + 24, ky + 9);
    ctx.lineTo(kx + 23, ky + 14);
    ctx.lineTo(kx + 8, ky + 14);
    ctx.lineTo(kx + 4, ky + 9);
    ctx.moveTo(kx + 14, ky + 1); ctx.lineTo(kx + 17, ky + 6); ctx.lineTo(kx + 20, ky + 1);
    ctx.moveTo(kx + 10, ky + 3); ctx.lineTo(kx + 17, ky + 6); ctx.lineTo(kx + 21, ky + 8);
    ctx.moveTo(kx + 12, ky + 7); ctx.lineTo(kx + 18, ky + 12);
    ctx.stroke();

    // Vertical von Mises Stress Legend Colorbar on right of screen
    const barX = scrX + scrW - 5;
    const barY = scrY + 2;
    const barH = 15;
    const grad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
    grad.addColorStop(0, '#ef4444');
    grad.addColorStop(0.3, '#f97316');
    grad.addColorStop(0.6, '#eab308');
    grad.addColorStop(0.8, '#22c55e');
    grad.addColorStop(1, '#3b82f6');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, 3, barH);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(barX, barY, 3, barH);

    // Status Banner at bottom of CRT
    ctx.fillStyle = '#10b981';
    ctx.font = '5px monospace';
    ctx.fillText('CONV ✓', scrX + 2, scrY + scrH - 2);
  } else {
    // -----------------------------------------------------------------------
    // STATE: RUNNING -> PULSATING ELECTRIC CYAN WIREFRAME SIMULATION!
    // -----------------------------------------------------------------------
    const meshPulse = Math.sin(timeMs * 0.007) * 0.35 + 0.65;
    const scanSweep = (timeMs * 0.02) % scrW;

    ctx.strokeStyle = `rgba(56, 189, 248, ${meshPulse})`;
    ctx.lineWidth = 0.9;

    ctx.beginPath();
    ctx.moveTo(kx + 4, ky + 9);
    ctx.lineTo(kx + 10, ky + 3);
    ctx.lineTo(kx + 14, ky + 1);
    ctx.lineTo(kx + 20, ky + 1);
    ctx.lineTo(kx + 24, ky + 5);
    ctx.lineTo(kx + 24, ky + 9);
    ctx.lineTo(kx + 23, ky + 14);
    ctx.lineTo(kx + 8, ky + 14);
    ctx.lineTo(kx + 4, ky + 9);
    ctx.moveTo(kx + 14, ky + 1); ctx.lineTo(kx + 17, ky + 6); ctx.lineTo(kx + 20, ky + 1);
    ctx.moveTo(kx + 10, ky + 3); ctx.lineTo(kx + 17, ky + 6); ctx.lineTo(kx + 21, ky + 8);
    ctx.moveTo(kx + 12, ky + 7); ctx.lineTo(kx + 18, ky + 12); ctx.lineTo(kx + 17, ky + 6);
    ctx.moveTo(kx + 4, ky + 9); ctx.lineTo(kx + 12, ky + 7);
    ctx.moveTo(kx + 24, ky + 9); ctx.lineTo(kx + 18, ky + 12);
    ctx.stroke();

    // Glowing active calculation nodes
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(kx + 14, ky + 1, 2, 2);
    ctx.fillRect(kx + 20, ky + 1, 2, 2);
    ctx.fillRect(kx + 17, ky + 6, 2, 2);
    ctx.fillRect(kx + 10, ky + 3, 2, 2);
    ctx.fillRect(kx + 21, ky + 8, 2, 2);

    // Active sweep scanline
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.fillRect(scrX + scanSweep, scrY, 2, scrH);

    // Running status telemetry
    ctx.fillStyle = '#38bdf8';
    ctx.font = '5px monospace';
    ctx.fillText('FEA SOLV..', scrX + 2, scrY + scrH - 2);
  }

  // =========================================================================
  // 4. PHYSICAL STEGOCERAS SKULL & HOLOGRAPHIC EMISSION ON DESK (Right Pedestal)
  // =========================================================
  const skX = dx + 86; // Placed on right pedestal with 8px margin from blueprint and 6px from edge!
  const skY = dy - 6;

  // Brass Display Stand
  pRect(ctx, skX + 14, skY + 18, 4, 10, '#b45309'); // brass vertical rod
  pRect(ctx, skX + 8, skY + 26, 16, 4, '#78350f'); // weighted brass base
  pRect(ctx, skX + 9, skY + 26, 14, 1, '#d97706'); // brass luster

  // Physical Fossil Bone Silhouette
  ctx.fillStyle = '#d6cbaf'; // weathered bone ivory
  ctx.beginPath();
  ctx.moveTo(skX + 6, skY + 14);
  ctx.quadraticCurveTo(skX + 16, skY - 4, skX + 26, skY + 8);
  ctx.lineTo(skX + 30, skY + 14);
  ctx.lineTo(skX + 26, skY + 18);
  ctx.lineTo(skX + 10, skY + 18);
  ctx.lineTo(skX + 4, skY + 15);
  ctx.closePath();
  ctx.fill();

  // Eye orbit & temporal opening
  ctx.fillStyle = '#262626';
  ctx.beginPath();
  ctx.ellipse(skX + 14, skY + 12, 3, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(skX + 22, skY + 11, 3, 2);

  // Holographic Projection hovering over the physical skull
  const holoPulse = Math.sin(timeMs * 0.006) * 0.3 + 0.7;
  ctx.save();
  if (isComplete) {
    ctx.strokeStyle = `rgba(239, 68, 68, ${holoPulse * 0.8})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(skX + 16, skY + 4, 9, Math.PI * 0.9, Math.PI * 2.1);
    ctx.stroke();

    ctx.strokeStyle = `rgba(245, 158, 11, ${holoPulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(skX + 16, skY + 4, 13, Math.PI * 0.85, Math.PI * 2.15);
    ctx.stroke();
  } else {
    ctx.strokeStyle = `rgba(56, 189, 248, ${holoPulse * 0.85})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(skX + 10, skY + 4);
    ctx.lineTo(skX + 16, skY - 2);
    ctx.lineTo(skX + 22, skY + 4);
    ctx.lineTo(skX + 16, skY + 8);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(skX + 15, skY - 3, 2, 2);
  }
  ctx.restore();
}

// Draw Ornate Fossil Curio Vitrine Cabinet with Recognizable Prehistoric Specimens
export function drawFossilCabinet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  hasUndiscovered: boolean,
  timeMs: number
) {
  // 1. Rich Polished Mahogany Vitrine Cabinet
  pRect(ctx, x, y, w, h, '#24120a'); // outer frame shadow
  pRect(ctx, x + 2, y + 2, w - 4, h - 4, '#381c10'); // mahogany cabinet body
  // Arched Cornice Top Molding
  pRect(ctx, x + 1, y, w - 2, 5, '#4f2818');
  pRect(ctx, x + 4, y - 2, w - 8, 3, '#5e311e'); // carved pediment
  pRect(ctx, x + 1, y + 1, w - 2, 1, '#7a422a'); // wood luster

  // 3 Velvet-Lined Display Shelves
  const shelfCount = 3;
  const topPad = 6;
  const botPad = 4;
  const shelfH = Math.floor((h - topPad - botPad) / shelfCount);

  for (let s = 0; s < shelfCount; s++) {
    const sy = y + topPad + s * shelfH;

    // Shelf interior recess (rich deep navy-black velvet lining)
    pRect(ctx, x + 4, sy, w - 8, shelfH - 3, '#0f172a');

    // Glass shelf divider with polished bevel highlight
    pRect(ctx, x + 3, sy + shelfH - 3, w - 6, 2, 'rgba(186, 230, 253, 0.45)');
    pRect(ctx, x + 4, sy + shelfH - 3, w - 8, 1, 'rgba(255, 255, 255, 0.7)');

    // =======================================================================
    // SHELF 1 (TOP): Ammonite, Ankylosaur Osteoderm, Amber Gemstone
    // =======================================================================
    if (s === 0) {
      // 1. Coiled Ribbed Ammonite Fossil
      const ax = x + 14;
      const ay = sy + shelfH - 12;
      ctx.fillStyle = '#a8a29e'; // pearly fossil shell
      ctx.beginPath();
      ctx.arc(ax + 6, ay + 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#57534e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ax + 6, ay + 6, 4, 0, Math.PI * 1.6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ax + 6, ay + 6, 2, 0, Math.PI * 1.2);
      ctx.stroke();

      // 2. Ankylosaurus Osteoderm Shield Plate
      const ox = x + 48;
      const oy = sy + shelfH - 11;
      ctx.fillStyle = '#78716c'; // dense pitted cortical bone
      ctx.beginPath();
      ctx.moveTo(ox, oy + 8);
      ctx.lineTo(ox + 8, oy); // dorsal peaked keel
      ctx.lineTo(ox + 16, oy + 8);
      ctx.closePath();
      ctx.fill();
      // Keel ridge highlight
      ctx.strokeStyle = '#a8a29e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ox + 8, oy);
      ctx.lineTo(ox + 8, oy + 8);
      ctx.stroke();

      // 3. Honey-Gold Amber Cabochon with Preserved Prehistoric Insect
      const ambX = x + 88;
      const ambY = sy + shelfH - 12;
      ctx.fillStyle = '#f59e0b'; // glowing amber
      ctx.beginPath();
      ctx.ellipse(ambX + 6, ambY + 6, 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24'; // inner jewel light
      ctx.beginPath();
      ctx.ellipse(ambX + 5, ambY + 5, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tiny fossilized insect silhouette inside amber
      ctx.fillStyle = '#451a03';
      ctx.fillRect(ambX + 5, ambY + 5, 2, 2);
      ctx.fillRect(ambX + 4, ambY + 6, 4, 1);
    }

    // =======================================================================
    // SHELF 2 (MIDDLE): Triceratops Horn Core, Theropod Tooth, Trilobite Matrix
    // =======================================================================
    else if (s === 1) {
      // 1. Triceratops Brow Horn Core mounted on brass display pegs
      const hx = x + 16;
      const hy = sy + shelfH - 13;
      pRect(ctx, hx + 4, hy + 8, 2, 4, '#ca8a04'); // brass peg
      pRect(ctx, hx + 14, hy + 8, 2, 4, '#ca8a04');
      // Curving horn core
      ctx.fillStyle = '#e7e5e4'; // pale bone
      ctx.beginPath();
      ctx.moveTo(hx, hy + 8);
      ctx.quadraticCurveTo(hx + 10, hy - 4, hx + 22, hy + 2);
      ctx.quadraticCurveTo(hx + 12, hy + 1, hx + 2, hy + 9);
      ctx.closePath();
      ctx.fill();

      // 2. Serrated Tyrannosaur Theropod Tooth
      const tx = x + 54;
      const ty = sy + shelfH - 12;
      ctx.fillStyle = '#44403c'; // dark root
      ctx.fillRect(tx + 2, ty + 5, 6, 5);
      ctx.fillStyle = '#f5f5f4'; // ivory crown
      ctx.beginPath();
      ctx.moveTo(tx + 2, ty + 5);
      ctx.quadraticCurveTo(tx + 4, ty - 1, tx + 9, ty);
      ctx.lineTo(tx + 7, ty + 5);
      ctx.closePath();
      ctx.fill();

      // 3. Segmented Trilobite Fossil Slab
      const tbx = x + 84;
      const tby = sy + shelfH - 11;
      pRect(ctx, tbx, tby, 18, 9, '#52525b'); // limestone matrix
      pRect(ctx, tbx + 4, tby + 2, 10, 6, '#27272a'); // trilobite body
      // Segment ribs
      ctx.fillStyle = '#71717a';
      ctx.fillRect(tbx + 5, tby + 3, 8, 1);
      ctx.fillRect(tbx + 5, tby + 5, 8, 1);
    }

    // =======================================================================
    // SHELF 3 (BOTTOM): The Asian Pachycephalosaur "Prenocephale brevis"
    // =======================================================================
    else {
      const px = x + 38;
      const py = sy + shelfH - 14;

      if (hasUndiscovered) {
        // UNDISCOVERED: Mysterious glass cloche bell jar with celestial starlight shimmer!
        // Brass base plate
        pRect(ctx, px, py + 10, 26, 3, '#ca8a04');
        pRect(ctx, px + 1, py + 10, 24, 1, '#fde047');

        // Glass cloche bell dome
        ctx.fillStyle = 'rgba(186, 230, 253, 0.22)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(px + 13, py + 6, 9, Math.PI, 0);
        ctx.lineTo(px + 22, py + 10);
        ctx.lineTo(px + 4, py + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Shrouded specimen silhouette inside
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(px + 13, py + 7, 5, Math.PI, 0);
        ctx.fill();

        // Pulsating Golden Curiosity Rune ("?")
        const pulse = Math.sin(timeMs * 0.007) * 0.35 + 0.65;
        ctx.fillStyle = `rgba(253, 224, 71, ${pulse})`;
        ctx.font = 'bold 9px monospace';
        ctx.fillText('?', px + 11, py + 4);

        // Animated Twinkling Constellation Stars
        const starPhase = (timeMs * 0.004) % (Math.PI * 2);
        const sAlpha = Math.max(0, Math.sin(starPhase));
        if (sAlpha > 0.1) {
          ctx.fillStyle = `rgba(254, 240, 138, ${sAlpha})`;
          ctx.fillRect(px + 26, py + 2, 3, 1);
          ctx.fillRect(px + 27, py + 1, 1, 3);
          ctx.fillRect(px - 4, py + 5, 2, 2);
        }
      } else {
        // DISCOVERED: The Distinct Asian Globular Prenocephale Skull Dome!
        // Royal purple velvet cushion
        pRect(ctx, px - 2, py + 7, 28, 5, '#581c87');
        pRect(ctx, px - 1, py + 8, 26, 3, '#7e22ce');

        // Prenocephale Steep Globular Dome
        ctx.fillStyle = '#f5f5f4'; // pristine ivory fossil bone
        ctx.beginPath();
        ctx.arc(px + 12, py + 7, 7, Math.PI, 0);
        ctx.fill();

        // Row of small bony tubercles on rear skull margin
        ctx.fillStyle = '#d6d3d1';
        ctx.fillRect(px + 5, py + 6, 2, 2);
        ctx.fillRect(px + 8, py + 6, 2, 2);
        ctx.fillRect(px + 14, py + 6, 2, 2);
        ctx.fillRect(px + 17, py + 6, 2, 2);

        // Miniature polished brass museum plaque
        pRect(ctx, px + 2, py + 12, 20, 3, '#ca8a04');
        pRect(ctx, px + 3, py + 12, 18, 1, '#fde047');
      }

      // Brass Jeweler's Loupe & Leather Field Notebook on shelf right
      const jx = x + 88;
      const jy = sy + shelfH - 12;
      pRect(ctx, jx, jy + 2, 14, 9, '#78350f'); // brown leather notebook
      pRect(ctx, jx + 1, jy + 3, 12, 7, '#fef3c7'); // notebook pages
      // Brass loupe ring
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(jx + 16, jy + 1, 6, 6);
      pRect(ctx, jx + 22, jy + 6, 4, 1.5, '#78350f'); // wooden handle
    }
  }

  // 2. Beveled Glass Doors with Brass Corner Hinges & Center Handles
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 4, y + 6, w - 8, h - 10);
  // Center vertical glass division bar
  pRect(ctx, x + Math.floor(w / 2) - 1, y + 6, 2, h - 10, '#24120a');
  // Twin brass door handles
  pRect(ctx, x + Math.floor(w / 2) - 3, y + Math.floor(h / 2) - 4, 2, 8, '#eab308');
  pRect(ctx, x + Math.floor(w / 2) + 1, y + Math.floor(h / 2) - 4, 2, 8, '#eab308');
  // Brass corner bracket accents
  pRect(ctx, x + 3, y + 5, 4, 4, '#ca8a04');
  pRect(ctx, x + w - 7, y + 5, 4, 4, '#ca8a04');
  pRect(ctx, x + 3, y + h - 8, 4, 4, '#ca8a04');
  pRect(ctx, x + w - 7, y + h - 8, 4, 4, '#ca8a04');
}

// Draw Marble Display Pedestal with Featured Specimen
export function drawPedestal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  featuredName: string | null
) {
  // Classical Fluted Marble Pedestal Column
  pRect(ctx, x + 2, y + 2, 28, 6, '#475569'); // top cap
  pRect(ctx, x + 3, y + 3, 26, 1, '#94a3b8'); // highlight
  pRect(ctx, x + 5, y + 8, 22, 20, '#334155'); // shaft
  // Fluting vertical shadow lines
  pRect(ctx, x + 7, y + 8, 2, 20, '#64748b');
  pRect(ctx, x + 12, y + 8, 2, 20, '#64748b');
  pRect(ctx, x + 17, y + 8, 2, 20, '#64748b');
  pRect(ctx, x + 22, y + 8, 2, 20, '#64748b');
  pRect(ctx, x + 1, y + 28, 30, 6, '#1e293b'); // base plinth
  pRect(ctx, x + 2, y + 28, 28, 1, '#475569');

  // If featured specimen is placed on pedestal (e.g. newly discovered Prenocephale):
  if (featuredName) {
    // Royal Velvet Display Cushion
    pRect(ctx, x + 4, y - 3, 24, 6, '#581c87');
    pRect(ctx, x + 5, y - 2, 22, 4, '#7e22ce');

    // High-Fidelity Prenocephale Globular Skull Dome
    ctx.fillStyle = '#f5f5f4'; // pristine ivory fossil bone
    ctx.beginPath();
    ctx.arc(x + 16, y - 4, 8, Math.PI, 0);
    ctx.fill();

    // Row of small bony tubercles along rear rim
    ctx.fillStyle = '#d6d3d1';
    ctx.fillRect(x + 9, y - 5, 2, 2);
    ctx.fillRect(x + 12, y - 5, 2, 2);
    ctx.fillRect(x + 18, y - 5, 2, 2);
    ctx.fillRect(x + 21, y - 5, 2, 2);

    // Polished Brass Museum Placard on Pedestal Face
    pRect(ctx, x + 6, y + 13, 20, 8, '#b45309');
    pRect(ctx, x + 7, y + 14, 18, 6, '#fef3c7');
    // Mini black placard lettering
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 9, y + 16, 14, 1);
    ctx.fillRect(x + 10, y + 18, 12, 1);
  }
}

// Draw Companion Inhabitant
export function drawCompanionSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  activity: CompanionActivity,
  facing: Direction,
  timeMs: number
) {
  const breath = Math.sin(timeMs * 0.003) * 1;

  // Shadow
  ctx.fillStyle = 'rgba(12, 8, 5, 0.4)';
  ctx.beginPath();
  ctx.ellipse(x + 8, y + 24, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair & Head
  pRect(ctx, x + 4, y + 2 - breath, 8, 7, '#44403c'); // dark grey-brown hair
  pRect(ctx, x + 5, y + 5 - breath, 6, 5, '#fed7aa'); // face tone

  // Spectacles
  ctx.fillStyle = '#ca8a04';
  if (facing === 'down' || facing === 'left') {
    ctx.fillRect(x + 5, y + 6 - breath, 2, 1);
  }
  if (facing === 'down' || facing === 'right') {
    ctx.fillRect(x + 8, y + 6 - breath, 2, 1);
  }

  // Tweed Waistcoat / Cardigan
  pRect(ctx, x + 3, y + 10 - breath, 10, 8, '#78350f'); // warm brown tweed
  pRect(ctx, x + 6, y + 10 - breath, 4, 8, '#f8fafc'); // white shirt & cravat
  pRect(ctx, x + 7, y + 12 - breath, 2, 1, '#1e293b'); // tie knot

  // Trousers
  pRect(ctx, x + 4, y + 18, 8, 6, '#334155'); // charcoal slates
  pRect(ctx, x + 4, y + 24, 3, 2, '#1c1917'); // left shoe
  pRect(ctx, x + 9, y + 24, 3, 2, '#1c1917'); // right shoe

  // Activity props (holding book or magnifying glass)
  if (activity === 'reading') {
    pRect(ctx, x + 1, y + 12, 5, 6, '#991b1b'); // red book in hands
    pRect(ctx, x + 2, y + 13, 3, 4, '#fef3c7'); // pages
  } else if (activity === 'examining_fossil') {
    // Magnifying glass
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 11, y + 11, 3, 3);
    ctx.fillStyle = 'rgba(186, 230, 253, 0.5)';
    ctx.fillRect(x + 11, y + 11, 3, 3);
  }
}

// Draw Player Character with high-visibility, 4-directional walk and idle animation
export function drawPlayerSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: Direction,
  isMoving: boolean,
  walkFrame: number
) {
  const cx = x + 10;
  const cy = y + 28;

  // 1. Soft Luminous Player Beacon Ring (ensures immediate visibility)
  const pulse = Math.sin(walkFrame * 0.15) * 2;
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 14 + pulse, 6 + pulse * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Soft shadow
  ctx.fillStyle = 'rgba(10, 6, 4, 0.55)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 10, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const step1 = isMoving ? Math.sin(walkFrame * 0.8) * 4 : 0;
  const step2 = isMoving ? -Math.sin(walkFrame * 0.8) * 4 : 0;
  const bodyBob = isMoving ? Math.abs(Math.sin(walkFrame * 0.8)) * 1.5 : 0;

  const bx = x + 1;
  const by = y - bodyBob;

  // 2. Head & Hair (distinct, clean silhouette)
  pRect(ctx, bx + 5, by + 1, 10, 8, '#1c1917'); // dark styled hair
  pRect(ctx, bx + 6, by + 5, 8, 7, '#ffedd5'); // face

  // Eyes and Facing Direction
  ctx.fillStyle = '#0f172a';
  if (facing === 'down') {
    ctx.fillRect(bx + 7, by + 7, 2, 2);
    ctx.fillRect(bx + 11, by + 7, 2, 2);
    // Gold spectacle frames
    ctx.fillStyle = '#d97706';
    ctx.fillRect(bx + 6, by + 6, 4, 1);
    ctx.fillRect(bx + 10, by + 6, 4, 1);
  } else if (facing === 'left') {
    ctx.fillRect(bx + 6, by + 7, 2, 2);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(bx + 5, by + 6, 4, 1);
  } else if (facing === 'right') {
    ctx.fillRect(bx + 12, by + 7, 2, 2);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(bx + 11, by + 6, 4, 1);
  } else {
    // Up - back of hair
    pRect(ctx, bx + 5, by + 3, 10, 8, '#1c1917');
  }

  // 3. Vibrant Scholar Coat (Royal Blue + Gold Trim for high visibility)
  pRect(ctx, bx + 3, by + 12, 14, 11, '#2563eb'); // rich royal blue coat
  pRect(ctx, bx + 7, by + 12, 6, 11, '#f8fafc'); // crisp white shirt & lapel
  pRect(ctx, bx + 9, by + 13, 2, 5, '#dc2626'); // red necktie/cravat

  // Gold coat buttons & border trim
  pRect(ctx, bx + 3, by + 12, 14, 1, '#fbbf24');
  pRect(ctx, bx + 3, by + 22, 14, 1, '#fbbf24');
  pRect(ctx, bx + 9, by + 19, 2, 2, '#fbbf24');

  // Coat tails / arms swinging
  if (isMoving) {
    pRect(ctx, bx + 1, by + 13 - step1 * 0.5, 3, 9, '#1d4ed8');
    pRect(ctx, bx + 16, by + 13 - step2 * 0.5, 3, 9, '#1d4ed8');
  } else {
    pRect(ctx, bx + 1, by + 13, 3, 9, '#1d4ed8');
    pRect(ctx, bx + 16, by + 13, 3, 9, '#1d4ed8');
  }

  // 4. Legs & Boots (animated stride)
  pRect(ctx, bx + 5, by + 23, 4, 6 + step1, '#1e293b'); // left leg
  pRect(ctx, bx + 11, by + 23, 4, 6 + step2, '#1e293b'); // right leg
  pRect(ctx, bx + 4, by + 29 + step1, 5, 3, '#0f172a'); // left boot
  pRect(ctx, bx + 11, by + 29 + step2, 5, 3, '#0f172a'); // right boot
}
