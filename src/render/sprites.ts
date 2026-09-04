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
  // Base rug crimson
  pRect(ctx, x, y, w, h, '#7f1d1d');
  // Outer gold fringe border
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  // Inner navy band
  pRect(ctx, x + 5, y + 5, w - 10, h - 10, '#1e293b');
  // Inner field
  pRect(ctx, x + 8, y + 8, w - 16, h - 16, '#991b1b');

  // Decorative diamond medallion in center
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 12);
  ctx.lineTo(cx + 14, cy);
  ctx.lineTo(cx, cy + 12);
  ctx.lineTo(cx - 14, cy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.moveTo(cx, cy - 7);
  ctx.lineTo(cx + 8, cy);
  ctx.lineTo(cx, cy + 7);
  ctx.lineTo(cx - 8, cy);
  ctx.closePath();
  ctx.fill();

  // Fringe ends
  ctx.fillStyle = '#fef3c7';
  for (let i = x + 3; i < x + w - 3; i += 3) {
    ctx.fillRect(i, y, 1, 2);
    ctx.fillRect(i, y + h - 2, 1, 2);
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

// Draw Armchair & substantial library table with steaming tea, lamp, and open book
export function drawReadingNook(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number, bookOnRug: boolean) {
  // 1. Wingback Armchair
  const ax = x;
  const ay = y;

  // Chair Shadow
  ctx.fillStyle = 'rgba(15, 10, 5, 0.45)';
  ctx.beginPath();
  ctx.ellipse(ax + 16, ay + 29, 15, 7, 0, 0, Math.PI * 2);
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
  pRect(ctx, ax + 4, ay + 30, 2, 2, '#d97706'); // brass claw
  pRect(ctx, ax + 26, ay + 30, 2, 2, '#d97706');

  // 2. Substantial Dark Walnut Occasional Library Table
  const tx = ax + 32;
  const ty = ay + 4;

  // Table Shadow
  ctx.fillStyle = 'rgba(15, 10, 5, 0.4)';
  ctx.beginPath();
  ctx.ellipse(tx + 14, ty + 28, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Carved Pedestal Stem & Tripod Legs
  pRect(ctx, tx + 12, ty + 15, 4, 12, '#2e180d'); // main column
  pRect(ctx, tx + 13, ty + 16, 2, 10, '#452616'); // column highlight
  pRect(ctx, tx + 6, ty + 24, 16, 4, '#201008'); // spreading tripod feet
  pRect(ctx, tx + 5, ty + 26, 3, 2, '#b45309'); // brass foot
  pRect(ctx, tx + 20, ty + 26, 3, 2, '#b45309');

  // Polished Oval Tabletop (Beveled Rim & Rich Woodgrain)
  pRect(ctx, tx, ty + 7, 28, 10, '#2b160b'); // rim shadow
  pRect(ctx, tx + 1, ty + 5, 26, 9, '#4d2916'); // beveled rim
  pRect(ctx, tx + 2, ty + 6, 24, 7, '#66391f'); // polished mahogany surface
  pRect(ctx, tx + 3, ty + 7, 22, 1, '#854d2b'); // wood luster reflection

  // Stack of Research Volumes on Table Left
  pRect(ctx, tx + 3, ty + 6, 9, 3, '#1e3a5f'); // blue leather volume
  pRect(ctx, tx + 3, ty + 4, 8, 3, '#78350f'); // brown leather volume
  pRect(ctx, tx + 10, ty + 5, 1, 2, '#fde047'); // gold page edges

  // Classic Banker's Brass Reading Lamp with Emerald Shade
  const lx = tx + 16;
  const ly = ty - 8;
  pRect(ctx, lx + 3, ly + 14, 5, 2, '#ca8a04'); // brass base
  pRect(ctx, lx + 5, ly + 4, 2, 10, '#eab308'); // curved brass arm
  pRect(ctx, lx + 1, ly + 2, 10, 5, '#065f46'); // emerald glass shade
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
  pRect(ctx, cx + 1, cy + 1, 3, 1, '#92400e'); // dark steeped amber tea
  pRect(ctx, cx + 5, cy + 2, 1, 2, '#94a3b8'); // handle

  // Animated delicate steam curls rising from the tea
  const sWave1 = Math.sin(timeMs * 0.004) * 2;
  const sWave2 = Math.cos(timeMs * 0.005) * 2;
  const sY = (timeMs * 0.015) % 12;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillRect(cx + 2 + sWave1, cy - 2 - sY, 1, 3);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(cx + 3 + sWave2, cy - 6 - sY * 0.8, 1, 2);

  // 3. Open Book on Persian Rug (when memory was recalled)
  if (bookOnRug) {
    const rbx = ax - 8;
    const rby = ay + 26;

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
    ctx.quadraticCurveTo(rbx + 8, rby + 15, rbx + 12, rby + 17);
    ctx.stroke();
  }
}

// Draw Workshop Desk with Prominent CRT Terminal (Active FEA / von Mises Heatmap) and Stegoceras Skull
export function drawWorkshop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  project: ProjectItem,
  equation: string,
  timeMs: number
) {
  // Wall Chalkboard behind desk
  const cbW = w - 16;
  const cbH = 26;
  pRect(ctx, x + 8, y - 24, cbW, cbH, '#374151'); // dark chalkboard frame
  pRect(ctx, x + 10, y - 22, cbW - 4, cbH - 4, '#111827'); // slate board
  pRect(ctx, x + 10, y - 22, cbW - 4, 1, '#1f2937'); // inner shadow
  // Chalkboard text
  ctx.fillStyle = '#f3f4f6';
  ctx.font = '7px monospace';
  ctx.fillText(equation.slice(0, 28), x + 14, y - 9);
  // Chalk dust ledge & chalk stick
  pRect(ctx, x + 8, y + 2, cbW, 2, '#4b5563');
  pRect(ctx, x + 24, y + 1, 4, 1, '#ffffff');

  // Desk Shadow
  ctx.fillStyle = 'rgba(10, 8, 6, 0.5)';
  ctx.fillRect(x + 4, y + h - 4, w - 8, 6);

  // Heavy Oak Desk Architecture
  pRect(ctx, x, y, w, h - 6, '#381f12'); // main frame
  pRect(ctx, x + 2, y + 2, w - 4, 10, '#532e1a'); // tabletop front bevel
  pRect(ctx, x + 2, y + 2, w - 4, 1, '#6e3e24'); // highlight line

  // Left & Right Drawers with Polished Brass Handles
  pRect(ctx, x + 4, y + 14, 24, h - 22, '#27140a');
  pRect(ctx, x + 6, y + 16, 20, 8, '#3d2213');
  pRect(ctx, x + 14, y + 19, 5, 2, '#f59e0b');
  pRect(ctx, x + 6, y + 27, 20, 8, '#3d2213');
  pRect(ctx, x + 14, y + 30, 5, 2, '#f59e0b');

  // Scientific Blueprints & Scratchpads on Desk Surface
  pRect(ctx, x + 30, y + 4, 26, 16, '#1e3a8a'); // blueprint paper
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 32.5, y + 5.5, 21, 13);
  ctx.beginPath();
  ctx.arc(x + 42, y + 11, 4, 0, Math.PI * 2);
  ctx.stroke();

  // =========================================================================
  // 1. PROMINENT RETRO CRT WORKSTATION TERMINAL (FEA & von Mises Display)
  // =========================================================================
  const mx = x + 58;
  const my = y - 10;
  const mw = 48;
  const mh = 36;
  const isComplete = project.status === 'completed';

  // CRT Monitor Housing (vintage industrial dark slate)
  pRect(ctx, mx, my, mw, mh, '#1e293b'); // outer casing
  pRect(ctx, mx + 2, my + 2, mw - 4, mh - 4, '#0f172a'); // inner bezel
  pRect(ctx, mx + 3, my + 3, mw - 6, mh - 10, '#020617'); // dark cathode screen area

  // Power LED & Ventilation Grille
  const ledColor = isComplete ? '#10b981' : (Math.sin(timeMs * 0.008) > 0 ? '#38bdf8' : '#0284c7');
  pRect(ctx, mx + mw - 8, my + mh - 6, 3, 2, ledColor);
  pRect(ctx, mx + 6, my + mh - 6, 16, 2, '#334155');

  // Active Cathode Phosphor Glow
  const scrX = mx + 4;
  const scrY = my + 4;
  const scrW = mw - 8; // 40px
  const scrH = mh - 12; // 24px

  // CRT Scanlines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  for (let l = scrY; l < scrY + scrH; l += 2) {
    ctx.fillRect(scrX, l, scrW, 1);
  }

  // Stegoceras Skull Geometry on CRT Screen
  // Coordinates mapped inside [scrX, scrY, scrW, scrH]
  const kx = scrX + 6;
  const ky = scrY + 3;

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
    // Dome contours
    ctx.moveTo(kx + 4, ky + 9);
    ctx.lineTo(kx + 10, ky + 3);
    ctx.lineTo(kx + 14, ky + 1);
    ctx.lineTo(kx + 20, ky + 1);
    ctx.lineTo(kx + 24, ky + 5);
    ctx.lineTo(kx + 24, ky + 9);
    ctx.lineTo(kx + 23, ky + 14);
    ctx.lineTo(kx + 8, ky + 14);
    ctx.lineTo(kx + 4, ky + 9);
    // Internal element dividers
    ctx.moveTo(kx + 14, ky + 1); ctx.lineTo(kx + 17, ky + 6); ctx.lineTo(kx + 20, ky + 1);
    ctx.moveTo(kx + 10, ky + 3); ctx.lineTo(kx + 17, ky + 6); ctx.lineTo(kx + 21, ky + 8);
    ctx.moveTo(kx + 12, ky + 7); ctx.lineTo(kx + 18, ky + 12);
    ctx.stroke();

    // Vertical von Mises Stress Legend Colorbar on right of screen
    const barX = scrX + scrW - 6;
    const barY = scrY + 3;
    const barH = 15;
    const grad = ctx.createLinearGradient(barX, barY, barX, barY + barH);
    grad.addColorStop(0, '#ef4444'); // Red max
    grad.addColorStop(0.3, '#f97316'); // Orange
    grad.addColorStop(0.6, '#eab308'); // Yellow
    grad.addColorStop(0.8, '#22c55e'); // Green
    grad.addColorStop(1, '#3b82f6'); // Blue min
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, 4, barH);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(barX, barY, 4, barH);

    // Status Banner at bottom of CRT
    ctx.fillStyle = '#10b981';
    ctx.font = '6px monospace';
    ctx.fillText('CONV ✓', scrX + 2, scrY + scrH - 2);
  } else {
    // -----------------------------------------------------------------------
    // STATE: RUNNING -> PULSATING ELECTRIC CYAN WIREFRAME SIMULATION!
    // -----------------------------------------------------------------------
    const meshPulse = Math.sin(timeMs * 0.007) * 0.35 + 0.65;
    const scanSweep = (timeMs * 0.02) % scrW;

    // Skull wireframe silhouette & elements
    ctx.strokeStyle = `rgba(56, 189, 248, ${meshPulse})`;
    ctx.lineWidth = 1;

    ctx.beginPath();
    // Outer Stegoceras skull envelope
    ctx.moveTo(kx + 4, ky + 9);
    ctx.lineTo(kx + 10, ky + 3);
    ctx.lineTo(kx + 14, ky + 1);
    ctx.lineTo(kx + 20, ky + 1);
    ctx.lineTo(kx + 24, ky + 5);
    ctx.lineTo(kx + 24, ky + 9);
    ctx.lineTo(kx + 23, ky + 14);
    ctx.lineTo(kx + 8, ky + 14);
    ctx.lineTo(kx + 4, ky + 9);
    // Internal triangular finite elements
    ctx.moveTo(kx + 14, ky + 1); ctx.lineTo(kx + 17, ky + 6); ctx.lineTo(kx + 20, ky + 1);
    ctx.moveTo(kx + 10, ky + 3); ctx.lineTo(kx + 17, ky + 6); ctx.lineTo(kx + 21, ky + 8);
    ctx.moveTo(kx + 12, ky + 7); ctx.lineTo(kx + 18, ky + 12); ctx.lineTo(kx + 17, ky + 6);
    ctx.moveTo(kx + 4, ky + 9); ctx.lineTo(kx + 12, ky + 7);
    ctx.moveTo(kx + 24, ky + 9); ctx.lineTo(kx + 18, ky + 12);
    ctx.stroke();

    // Glowing active calculation nodes (blinking green/cyan)
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
    ctx.font = '6px monospace';
    ctx.fillText('FEA SOLV..', scrX + 2, scrY + scrH - 2);
  }

  // =========================================================================
  // 2. PHYSICAL STEGOCERAS SKULL & HOLOGRAPHIC EMISSION ON DESK
  // =========================================================================
  const skX = x + 112;
  const skY = y - 4;

  // Brass Display Stand
  pRect(ctx, skX + 14, skY + 20, 4, 10, '#b45309'); // brass vertical rod
  pRect(ctx, skX + 8, skY + 28, 16, 4, '#78350f'); // weighted brass base
  pRect(ctx, skX + 9, skY + 28, 14, 1, '#d97706'); // brass luster

  // Physical Fossil Bone Silhouette
  ctx.fillStyle = '#d6cbaf'; // weathered bone ivory
  ctx.beginPath();
  ctx.moveTo(skX + 6, skY + 14);
  // Steep frontoparietal dome curve
  ctx.quadraticCurveTo(skX + 16, skY - 4, skX + 26, skY + 8);
  // Posterior skull shelf with row of tubercles
  ctx.lineTo(skX + 30, skY + 14);
  ctx.lineTo(skX + 26, skY + 18);
  // Snout & jaw
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
    // Stress field aura contour radiating above dome
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
    // Active holographic grid hovering above dome
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
