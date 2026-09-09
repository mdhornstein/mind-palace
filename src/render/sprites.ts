import { TILE_SIZE } from '../core/constants';
import { Direction, CompanionActivity, ProjectItem, DeepReadonly } from '../core/types';

// Helper to draw a pixel-perfect rectangle
export function pRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

// Crisp Pixel-Art 3x5 Bitmap Font (100% solid pixels, zero anti-aliasing)
const FONT_3X5: Record<string, number[]> = {
  'A': [0b010, 0b101, 0b111, 0b101, 0b101],
  'B': [0b110, 0b101, 0b110, 0b101, 0b110],
  'C': [0b011, 0b100, 0b100, 0b100, 0b011],
  'D': [0b110, 0b101, 0b101, 0b101, 0b110],
  'E': [0b111, 0b100, 0b110, 0b100, 0b111],
  'F': [0b111, 0b100, 0b110, 0b100, 0b100],
  'G': [0b011, 0b100, 0b101, 0b101, 0b011],
  'H': [0b101, 0b101, 0b111, 0b101, 0b101],
  'I': [0b111, 0b010, 0b010, 0b010, 0b111],
  'J': [0b001, 0b001, 0b001, 0b101, 0b010],
  'K': [0b101, 0b110, 0b100, 0b110, 0b101],
  'L': [0b100, 0b100, 0b100, 0b100, 0b111],
  'M': [0b101, 0b111, 0b101, 0b101, 0b101],
  'N': [0b110, 0b101, 0b101, 0b101, 0b101],
  'O': [0b010, 0b101, 0b101, 0b101, 0b010],
  'P': [0b110, 0b101, 0b110, 0b100, 0b100],
  'Q': [0b010, 0b101, 0b101, 0b110, 0b011],
  'R': [0b110, 0b101, 0b110, 0b101, 0b101],
  'S': [0b011, 0b100, 0b010, 0b001, 0b110],
  'T': [0b111, 0b010, 0b010, 0b010, 0b010],
  'U': [0b101, 0b101, 0b101, 0b101, 0b010],
  'V': [0b101, 0b101, 0b101, 0b010, 0b010],
  'W': [0b101, 0b101, 0b101, 0b111, 0b101],
  'X': [0b101, 0b101, 0b010, 0b101, 0b101],
  'Y': [0b101, 0b101, 0b010, 0b010, 0b010],
  'Z': [0b111, 0b001, 0b010, 0b100, 0b111],
  '0': [0b010, 0b101, 0b101, 0b101, 0b010],
  '1': [0b010, 0b110, 0b010, 0b010, 0b111],
  '2': [0b110, 0b001, 0b010, 0b100, 0b111],
  '3': [0b110, 0b001, 0b010, 0b001, 0b110],
  '4': [0b101, 0b101, 0b111, 0b001, 0b001],
  '5': [0b111, 0b100, 0b110, 0b001, 0b110],
  '6': [0b011, 0b100, 0b110, 0b101, 0b010],
  '7': [0b111, 0b001, 0b010, 0b010, 0b010],
  '8': [0b010, 0b101, 0b010, 0b101, 0b010],
  '9': [0b010, 0b101, 0b011, 0b001, 0b110],
  ' ': [0, 0, 0, 0, 0],
  '.': [0, 0, 0, 0, 0b010],
  ',': [0, 0, 0, 0b010, 0b100],
  ':': [0, 0b010, 0, 0b010, 0],
  ';': [0, 0b010, 0, 0b010, 0b100],
  '+': [0, 0b010, 0b111, 0b010, 0],
  '-': [0, 0, 0b111, 0, 0],
  '=': [0, 0b111, 0, 0b111, 0],
  '&': [0b010, 0b101, 0b010, 0b101, 0b011],
  '/': [0b001, 0b001, 0b010, 0b100, 0b100],
  '✓': [0, 0b001, 0b001, 0b101, 0b010],
  '·': [0, 0, 0b010, 0, 0],
  '∇': [0b111, 0b111, 0b101, 0b010, 0b010],
  'σ': [0b011, 0b101, 0b101, 0b011, 0b000],
  '_': [0, 0, 0, 0, 0b111],
  '?': [0b110, 0b001, 0b010, 0, 0b010],
  '!': [0b010, 0b010, 0b010, 0, 0b010],
  '(': [0b010, 0b100, 0b100, 0b100, 0b010],
  ')': [0b010, 0b001, 0b001, 0b001, 0b010],
};

export function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  startX: number,
  startY: number,
  color: string,
  scale = 1
) {
  ctx.fillStyle = color;
  let curX = Math.round(startX);
  const curY = Math.round(startY);

  for (let i = 0; i < text.length; i++) {
    const ch = text[i].toUpperCase();
    const rows = FONT_3X5[ch] || FONT_3X5[' '];
    for (let r = 0; r < 5; r++) {
      const b = rows[r];
      if ((b & 0b100) !== 0) ctx.fillRect(curX, curY + r * scale, scale, scale);
      if ((b & 0b010) !== 0) ctx.fillRect(curX + scale, curY + r * scale, scale, scale);
      if ((b & 0b001) !== 0) ctx.fillRect(curX + scale * 2, curY + r * scale, scale, scale);
    }
    curX += (3 + 1) * scale;
  }
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
  project: ProjectItem | DeepReadonly<ProjectItem>,
  _equation: string,
  timeMs: number
) {
  // =========================================================================
  // 1. STATELY UNIVERSITY BLACKBOARD ON A-FRAME ROLLING EASEL (Left Side)
  // =========================================================================
  const ex = x + 2;
  const ey = y - 12;
  const ew = 104; // Generously widened to 104px so all equations have ample breathing room!
  const eh = 54;

  // Easel shadow on floorboards
  ctx.fillStyle = 'rgba(10, 8, 6, 0.4)';
  ctx.fillRect(ex + 2, ey + 75, ew - 4, 4);

  // A-Frame Wooden Easel Stand Legs
  pRect(ctx, ex + 2, ey + 6, 3, 70, '#3d2213'); // left front leg
  pRect(ctx, ex + ew - 5, ey + 6, 3, 70, '#3d2213'); // right front leg
  pRect(ctx, ex + Math.floor(ew / 2) - 2, ey + 4, 4, 72, '#221208'); // rear tilt prop leg
  pRect(ctx, ex + 2, ey + 58, ew - 4, 3, '#4a2b1a'); // horizontal cross brace
  pRect(ctx, ex + 1, ey + 74, 5, 2, '#b45309'); // brass castor foot left
  pRect(ctx, ex + ew - 6, ey + 74, 5, 2, '#b45309'); // brass castor foot right

  // Framed Slate Blackboard (mounted at comfortable reading height)
  pRect(ctx, ex + 2, ey, ew - 4, eh, '#452615'); // oak frame
  pRect(ctx, ex + 4, ey + 2, ew - 8, eh - 4, '#2d180d'); // inner beveled shadow
  pRect(ctx, ex + 5, ey + 3, ew - 10, eh - 6, '#0f172a'); // dark charcoal slate

  // Brass pivot knobs on sides
  pRect(ctx, ex, ey + 24, 3, 4, '#f59e0b');
  pRect(ctx, ex + ew - 3, ey + 24, 3, 4, '#f59e0b');

  // Chalk dust ledge & chalk sticks
  pRect(ctx, ex + 2, ey + eh - 2, ew - 4, 3, '#5c331c'); // ledge
  pRect(ctx, ex + 8, ey + eh - 3, 6, 2, '#ffffff'); // white chalk
  pRect(ctx, ex + 17, ey + eh - 3, 5, 2, '#fde047'); // yellow chalk
  pRect(ctx, ex + 25, ey + eh - 3, 5, 2, '#60a5fa'); // blue chalk
  pRect(ctx, ex + ew - 18, ey + eh - 4, 12, 3, '#78350f'); // felt eraser

  // Chalk text (100% crisp solid pixel-art chalk, ZERO anti-aliasing blur!)
  drawPixelText(ctx, '∇·σ + f = 0', ex + 8, ey + 9, '#f8fafc', 1);
  drawPixelText(ctx, 'LINEAR ELASTICITY', ex + 8, ey + 18, '#fde68a', 1);
  drawPixelText(ctx, 'FEA STRESS TENSOR', ex + 8, ey + 27, '#93c5fd', 1);
  drawPixelText(ctx, 'BOUNDARY COND.', ex + 8, ey + 36, '#94a3b8', 1);

  // Isometric 3D Stress Element Cube on Slate (neatly positioned on the right side)
  const cx = ex + ew - 24;
  const cy = ey + 10;
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.85)';
  ctx.lineWidth = 0.8;
  // Front square
  ctx.strokeRect(cx, cy + 4, 9, 9);
  // Top face
  ctx.beginPath();
  ctx.moveTo(cx, cy + 4); ctx.lineTo(cx + 4, cy); ctx.lineTo(cx + 13, cy); ctx.lineTo(cx + 9, cy + 4);
  // Right face
  ctx.moveTo(cx + 9, cy + 4); ctx.lineTo(cx + 13, cy); ctx.lineTo(cx + 13, cy + 9); ctx.lineTo(cx + 9, cy + 13);
  // Normal traction arrow
  ctx.moveTo(cx + 9, cy + 8.5); ctx.lineTo(cx + 15, cy + 8.5);
  ctx.stroke();

  // =========================================================================
  // 2. HEAVY VICTORIAN LABORATORY WORKBENCH (Right Side)
  // =========================================================================
  const dx = ex + ew + 10; // 10px breathing space between easel and workbench
  const dy = y + 6;
  const dw = 126; // 126px wide workbench
  const dh = 54;

  // Table drop shadow on floor
  ctx.fillStyle = 'rgba(10, 8, 6, 0.45)';
  ctx.fillRect(dx + 4, dy + dh - 2, dw - 8, 6);

  // Tabletop Beveled Mahogany Surface (Plane: dy + 2 to dy + 22)
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

  // Scientific Blueprints & Drafting Tools (Centered between CRT and Skull with generous margin!)
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

    // Status Banner at bottom of CRT (crisp pixel text)
    drawPixelText(ctx, 'CONV ✓', scrX + 2, scrY + scrH - 6, '#10b981', 1);
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

    // Running status telemetry (crisp pixel text)
    drawPixelText(ctx, 'FEA SOLV..', scrX + 2, scrY + scrH - 6, '#38bdf8', 1);
  }

  // =========================================================================
  // 4. PHYSICAL STEGOCERAS SKULL & PEDESTAL (FIRM ON MAHOGANY TABLETOP)
  // =========================================================================
  const skX = dx + 88; // Right pedestal surface
  const baseY = dy + 15; // Centered securely inside the tabletop surface (dy + 2 to dy + 22)

  // 1. Dark contact shadow on mahogany wood (anchors pedestal to desk surface!)
  ctx.fillStyle = 'rgba(15, 8, 4, 0.6)';
  ctx.beginPath();
  ctx.ellipse(skX + 16, baseY + 2, 10, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Weighted Turned Brass Plinth Base (resting squarely on top of the desk!)
  pRect(ctx, skX + 8, baseY - 2, 16, 3, '#78350f'); // lower weighted rim
  pRect(ctx, skX + 10, baseY - 4, 12, 2, '#b45309'); // upper tier bevel
  pRect(ctx, skX + 10, baseY - 4, 12, 1, '#f59e0b'); // brass luster highlight
  pRect(ctx, skX + 13, baseY - 6, 6, 2, '#d97706'); // collar socket ring

  // 3. Brass Support Rod & Specimen Mounting Cradle
  pRect(ctx, skX + 14, baseY - 18, 4, 12, '#b45309'); // vertical rod
  pRect(ctx, skX + 15, baseY - 18, 1, 12, '#fde68a'); // specular rod reflection
  pRect(ctx, skX + 11, baseY - 20, 10, 2, '#78350f'); // mounting cup cradle

  // 4. Physical Fossil Bone Silhouette (mounted firmly atop the brass cradle)
  const skullY = baseY - 34; // Dome and snout situated above cradle
  ctx.fillStyle = '#d6cbaf'; // weathered bone ivory
  ctx.beginPath();
  ctx.moveTo(skX + 6, skullY + 14);
  ctx.quadraticCurveTo(skX + 16, skullY - 4, skX + 26, skullY + 8);
  ctx.lineTo(skX + 30, skullY + 14);
  ctx.lineTo(skX + 26, skullY + 18);
  ctx.lineTo(skX + 10, skullY + 18);
  ctx.lineTo(skX + 4, skullY + 15);
  ctx.closePath();
  ctx.fill();

  // Eye orbit & temporal opening
  ctx.fillStyle = '#262626';
  ctx.beginPath();
  ctx.ellipse(skX + 14, skullY + 12, 3, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(skX + 22, skullY + 11, 3, 2);

  // 5. Holographic Projection hovering over the physical skull
  const holoPulse = Math.sin(timeMs * 0.006) * 0.3 + 0.7;
  ctx.save();
  if (isComplete) {
    ctx.strokeStyle = `rgba(239, 68, 68, ${holoPulse * 0.8})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(skX + 16, skullY + 4, 9, Math.PI * 0.9, Math.PI * 2.1);
    ctx.stroke();

    ctx.strokeStyle = `rgba(245, 158, 11, ${holoPulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(skX + 16, skullY + 4, 13, Math.PI * 0.85, Math.PI * 2.15);
    ctx.stroke();
  } else {
    ctx.strokeStyle = `rgba(56, 189, 248, ${holoPulse * 0.85})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(skX + 10, skullY + 4);
    ctx.lineTo(skX + 16, skullY - 2);
    ctx.lineTo(skX + 22, skullY + 4);
    ctx.lineTo(skX + 16, skullY + 8);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(skX + 15, skullY - 3, 2, 2);
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

        // Pulsating Golden Curiosity Rune ("?" crisp pixel art)
        const pulse = Math.sin(timeMs * 0.007) * 0.35 + 0.65;
        drawPixelText(ctx, '?', px + 11, py, `rgba(253, 224, 71, ${pulse})`, 2);

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
// =============================================================================
// CHARACTERS & ACTORS (Stardew-Proportioned 42-44px Tall with Dark Outlines)
// =============================================================================

export function drawCompanionSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  activity: CompanionActivity,
  facing: Direction,
  timeMs: number
) {
  const breath = Math.sin(timeMs * 0.003) * 1.5;
  const OUTLINE = '#170c06';

  // 1. Heavy Contact Shadow
  ctx.fillStyle = 'rgba(12, 8, 5, 0.55)';
  ctx.beginPath();
  ctx.ellipse(x + 11, y + 36, 14, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const by = y - breath;

  // 2. Head & Hair (with dark outline)
  // Hair Silhouette
  pRect(ctx, x + 2, by - 1, 18, 14, OUTLINE);
  pRect(ctx, x + 3, by, 16, 12, '#38322e'); // dark scholar hair
  pRect(ctx, x + 4, by + 1, 14, 5, '#524b45'); // hair highlights

  // Face Silhouette
  pRect(ctx, x + 4, by + 5, 14, 11, OUTLINE);
  pRect(ctx, x + 5, by + 6, 12, 9, '#fed7aa'); // warm face tone
  pRect(ctx, x + 6, by + 10, 10, 5, '#fdba74'); // subtle cheek shading

  // Gold Spectacles & Expressive Eyes
  ctx.fillStyle = '#b45309';
  if (facing === 'down' || facing === 'left') {
    pRect(ctx, x + 5, by + 8, 4, 3, '#78350f'); // left rim
    pRect(ctx, x + 6, by + 9, 2, 2, '#ca8a04'); // gold lens
    pRect(ctx, x + 7, by + 9, 1, 1, '#0f172a'); // pupil
  }
  if (facing === 'down' || facing === 'right') {
    pRect(ctx, x + 13, by + 8, 4, 3, '#78350f'); // right rim
    pRect(ctx, x + 14, by + 9, 2, 2, '#ca8a04'); // gold lens
    pRect(ctx, x + 14, by + 9, 1, 1, '#0f172a'); // pupil
  }
  if (facing === 'down') {
    pRect(ctx, x + 9, by + 9, 4, 1, '#ca8a04'); // bridge
  }

  // 3. Tweed Waistcoat & Jacket (with dark outline)
  // Coat Silhouette
  pRect(ctx, x + 1, by + 16, 20, 15, OUTLINE);
  pRect(ctx, x + 2, by + 17, 18, 13, '#78350f'); // rich brown tweed
  pRect(ctx, x + 3, by + 18, 4, 11, '#92400e');  // left lapel
  pRect(ctx, x + 15, by + 18, 4, 11, '#92400e'); // right lapel

  // White Shirt & Cravat
  pRect(ctx, x + 8, by + 17, 6, 12, '#f8fafc');
  pRect(ctx, x + 9, by + 18, 4, 2, '#dc2626'); // red neck cravat
  pRect(ctx, x + 10, by + 20, 2, 6, '#b91c1c');

  // Brass Buttons
  pRect(ctx, x + 7, by + 22, 2, 2, '#fbbf24');
  pRect(ctx, x + 7, by + 26, 2, 2, '#fbbf24');

  // 4. Charcoal Trousers & Shoes (with dark outline)
  pRect(ctx, x + 3, by + 30, 7, 7, OUTLINE);
  pRect(ctx, x + 12, by + 30, 7, 7, OUTLINE);
  pRect(ctx, x + 4, by + 30, 5, 6, '#334155'); // left leg
  pRect(ctx, x + 13, by + 30, 5, 6, '#334155'); // right leg

  // Dark leather shoes
  pRect(ctx, x + 3, by + 36, 6, 3, '#1c1917');
  pRect(ctx, x + 13, by + 36, 6, 3, '#1c1917');

  // 5. Activity Props (Large distinct Crimson Book)
  if (activity === 'reading') {
    pRect(ctx, x - 2, by + 18, 9, 12, OUTLINE);
    pRect(ctx, x - 1, by + 19, 7, 10, '#991b1b'); // red leather binding
    pRect(ctx, x + 1, by + 20, 5, 8, '#fef3c7');  // parchment pages
    pRect(ctx, x + 2, by + 22, 3, 1, '#78350f');  // text lines
    pRect(ctx, x + 2, by + 24, 3, 1, '#78350f');
  } else if (activity === 'examining_fossil') {
    // Large Brass Magnifying Glass
    pRect(ctx, x + 16, by + 16, 8, 8, OUTLINE);
    pRect(ctx, x + 17, by + 17, 6, 6, '#d97706');
    pRect(ctx, x + 18, by + 18, 4, 4, 'rgba(186, 230, 253, 0.75)');
    pRect(ctx, x + 21, by + 23, 3, 6, '#78350f'); // wooden handle
  }
}

// Draw Player Character with high-visibility, 4-directional walk and Stardew proportions
export function drawPlayerSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: Direction,
  isMoving: boolean,
  walkFrame: number
) {
  const cx = x + 11;
  const cy = y + 36;
  const OUTLINE = '#090d16';

  // 1. Luminous Player Beacon Ring (enlarged for Stardew proportions)
  const pulse = Math.sin(walkFrame * 0.15) * 2.5;
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 20 + pulse, 8 + pulse * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Heavy Ground Shadow
  ctx.fillStyle = 'rgba(10, 6, 4, 0.65)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 14, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const step1 = isMoving ? Math.sin(walkFrame * 0.8) * 5 : 0;
  const step2 = isMoving ? -Math.sin(walkFrame * 0.8) * 5 : 0;
  const bodyBob = isMoving ? Math.abs(Math.sin(walkFrame * 0.8)) * 2 : 0;

  const bx = x;
  const by = y - bodyBob;

  // =========================================================================
  // 2. HEAD & STYLED HAIR (with dark outline)
  // =========================================================================
  // Hair Silhouette Outline
  pRect(ctx, bx + 3, by - 2, 16, 14, OUTLINE);
  pRect(ctx, bx + 4, by - 1, 14, 12, '#1c1917'); // dark styled hair
  pRect(ctx, bx + 5, by, 12, 5, '#292524');      // hair sheen

  // Face Silhouette Outline
  pRect(ctx, bx + 5, by + 5, 12, 11, OUTLINE);
  pRect(ctx, bx + 6, by + 6, 10, 9, '#ffedd5'); // face skin tone
  pRect(ctx, bx + 7, by + 10, 8, 4, '#fed7aa'); // chin & cheek shadow

  // Expressive Stardew Eyes
  ctx.fillStyle = '#0f172a';
  if (facing === 'down') {
    pRect(ctx, bx + 7, by + 8, 3, 3, '#0f172a');
    pRect(ctx, bx + 7, by + 8, 1, 1, '#ffffff'); // glint
    pRect(ctx, bx + 12, by + 8, 3, 3, '#0f172a');
    pRect(ctx, bx + 12, by + 8, 1, 1, '#ffffff');

    // Gold spectacles
    pRect(ctx, bx + 6, by + 7, 5, 1, '#d97706');
    pRect(ctx, bx + 11, by + 7, 5, 1, '#d97706');
    pRect(ctx, bx + 10, by + 8, 2, 1, '#d97706');
  } else if (facing === 'left') {
    pRect(ctx, bx + 6, by + 8, 3, 3, '#0f172a');
    pRect(ctx, bx + 6, by + 8, 1, 1, '#ffffff');
    pRect(ctx, bx + 5, by + 7, 5, 1, '#d97706');
  } else if (facing === 'right') {
    pRect(ctx, bx + 13, by + 8, 3, 3, '#0f172a');
    pRect(ctx, bx + 13, by + 8, 1, 1, '#ffffff');
    pRect(ctx, bx + 12, by + 7, 5, 1, '#d97706');
  } else {
    // Up: Full rear hair silhouette
    pRect(ctx, bx + 4, by + 2, 14, 13, '#1c1917');
    pRect(ctx, bx + 5, by + 4, 12, 10, '#292524');
  }

  // =========================================================================
  // 3. ROYAL BLUE SCHOLAR COAT (with gold trim and dark outline)
  // =========================================================================
  // Coat Silhouette Outline
  pRect(ctx, bx + 1, by + 15, 20, 16, OUTLINE);

  // Rich Royal Blue Base
  pRect(ctx, bx + 2, by + 16, 18, 14, '#2563eb');
  pRect(ctx, bx + 4, by + 17, 14, 12, '#3b82f6'); // bright front velvet

  // White Lapels & Shirt
  pRect(ctx, bx + 8, by + 16, 6, 13, '#f8fafc');
  // Crimson Cravat
  pRect(ctx, bx + 10, by + 17, 2, 6, '#dc2626');

  // Gold Coat Trim & Brass Buttons
  pRect(ctx, bx + 2, by + 16, 18, 1.5, '#fbbf24'); // gold collar trim
  pRect(ctx, bx + 2, by + 29, 18, 1.5, '#fbbf24'); // gold hem trim
  pRect(ctx, bx + 10, by + 24, 2, 2, '#fbbf24');   // button 1
  pRect(ctx, bx + 10, by + 27, 2, 2, '#fbbf24');   // button 2

  // Coat Sleeves & Arms (animated walking swing)
  if (isMoving) {
    pRect(ctx, bx - 1, by + 17 - step1 * 0.6, 4, 11, OUTLINE);
    pRect(ctx, bx, by + 18 - step1 * 0.6, 2, 9, '#1d4ed8');
    pRect(ctx, bx + 19, by + 17 - step2 * 0.6, 4, 11, OUTLINE);
    pRect(ctx, bx + 20, by + 18 - step2 * 0.6, 2, 9, '#1d4ed8');
  } else {
    pRect(ctx, bx - 1, by + 17, 4, 11, OUTLINE);
    pRect(ctx, bx, by + 18, 2, 9, '#1d4ed8');
    pRect(ctx, bx + 19, by + 17, 4, 11, OUTLINE);
    pRect(ctx, bx + 20, by + 18, 2, 9, '#1d4ed8');
  }

  // =========================================================================
  // 4. CHARCOAL LEGS & LEATHER STRIDE BOOTS (with dark outline)
  // =========================================================================
  // Left Leg Outline & Fill
  pRect(ctx, bx + 4, by + 30, 5, 8 + step1, OUTLINE);
  pRect(ctx, bx + 5, by + 30, 3, 7 + step1, '#1e293b');
  // Right Leg Outline & Fill
  pRect(ctx, bx + 13, by + 30, 5, 8 + step2, OUTLINE);
  pRect(ctx, bx + 14, by + 30, 3, 7 + step2, '#1e293b');

  // Heavy Stardew Walking Boots
  pRect(ctx, bx + 3, by + 37 + step1, 7, 4, OUTLINE);
  pRect(ctx, bx + 4, by + 38 + step1, 5, 2, '#0f172a');
  pRect(ctx, bx + 12, by + 37 + step2, 7, 4, OUTLINE);
  pRect(ctx, bx + 13, by + 38 + step2, 5, 2, '#0f172a');
}

// =============================================================================
// OBSERVATORY SPRITES & ASTRONOMICAL INSTRUMENTS
// =============================================================================

/**
 * Draw The Great Brass Refractor Telescope on an elevated granite equatorial dais
 */
export function drawTelescope(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  _w: number,
  _h: number,
  timeMs: number
) {
  // Center anchor
  const cx = x + 48;
  const cy = y + 54;

  // 1. Shadow of Dais & Telescope
  ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 18, 44, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Elevated Multi-Tiered Granite Dais
  // Lower tier
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14, 40, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b45309'; // brass ring rim
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Upper tier
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 8, 32, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 3. Cast-Iron Equatorial Pier Mount
  pRect(ctx, cx - 7, cy - 14, 14, 22, '#0f172a'); // central pier column
  pRect(ctx, cx - 8, cy + 5, 16, 4, '#1e293b'); // base plinth
  pRect(ctx, cx - 5, cy - 18, 10, 6, '#1e293b'); // polar axis housing
  // Brass setting circles
  pRect(ctx, cx - 9, cy - 12, 18, 2, '#d97706');
  pRect(ctx, cx - 7, cy - 8, 14, 1, '#b45309');

  // Counterweight shaft (extending down-left)
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 16);
  ctx.lineTo(cx - 24, cy - 4);
  ctx.stroke();
  // Cylindrical lead counterweight
  pRect(ctx, cx - 22, cy - 8, 8, 8, '#334155');
  pRect(ctx, cx - 21, cy - 7, 6, 6, '#1e293b');

  // 4. Stately 12-Foot Brass Refractor Tube (pointing up-right toward open dome)
  // Optical axis vector: angle ~ -45 degrees
  ctx.save();
  ctx.translate(cx, cy - 18);
  ctx.rotate(-Math.PI / 4); // 45-degree angle upward

  // Main brass barrel
  const tubeLen = 64;
  const tubeRadius = 6;
  const grad = ctx.createLinearGradient(0, -tubeRadius, 0, tubeRadius);
  grad.addColorStop(0, '#fde68a'); // specular highlight
  grad.addColorStop(0.3, '#f59e0b');
  grad.addColorStop(0.7, '#d97706');
  grad.addColorStop(1, '#78350f'); // shadow underside

  ctx.fillStyle = grad;
  ctx.fillRect(-18, -tubeRadius, tubeLen, tubeRadius * 2);

  // Decorative brass reinforcement bands & mounting collar
  ctx.fillStyle = '#b45309';
  ctx.fillRect(-2, -tubeRadius - 1.5, 6, (tubeRadius * 2) + 3);
  ctx.fillRect(18, -tubeRadius - 0.5, 3, (tubeRadius * 2) + 1);
  ctx.fillRect(36, -tubeRadius - 0.5, 3, (tubeRadius * 2) + 1);

  // Objective lens dew shield & cell (top-right aperture)
  ctx.fillStyle = '#92400e';
  ctx.fillRect(tubeLen - 18, -tubeRadius - 1.5, 8, (tubeRadius * 2) + 3);
  // Glass lens starlight reflection
  const lensPulse = Math.sin(timeMs * 0.005) * 0.2 + 0.8;
  ctx.fillStyle = `rgba(56, 189, 248, ${lensPulse})`;
  ctx.fillRect(tubeLen - 10, -tubeRadius + 0.5, 2, (tubeRadius * 2) - 1);

  // Eyepiece drawtube & diagonal (bottom-left)
  ctx.fillStyle = '#b45309';
  ctx.fillRect(-28, -3, 10, 6);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-32, -4, 4, 8); // 90-degree star diagonal
  // Knurled focus wheel
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-24, -6, 2, 12);

  // Finder scope mounted atop main tube
  ctx.fillStyle = '#451a03';
  ctx.fillRect(4, -tubeRadius - 7, 26, 4);
  ctx.fillStyle = '#78350f';
  ctx.fillRect(2, -tubeRadius - 5, 2, 2); // bracket
  ctx.fillRect(22, -tubeRadius - 5, 2, 2); // bracket

  ctx.restore();
}

/**
 * Draw Celestial Star Chart & Astrolabe Drafting Table
 */
export function drawStarChartDesk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  _w: number,
  _h: number,
  _timeMs: number
) {
  const dx = x + 4;
  const dy = y + 8;
  const dw = 100;
  const dh = 54;

  // 1. Table shadow on floor
  ctx.fillStyle = 'rgba(2, 6, 23, 0.5)';
  ctx.fillRect(dx + 4, dy + dh - 2, dw - 8, 6);

  // 2. Oak Drafting Table (Architectural slant surface)
  pRect(ctx, dx, dy + 2, dw, 22, '#452615'); // table top
  pRect(ctx, dx + 1, dy + 2, dw - 2, 2, '#6e3c20'); // polished bevel
  pRect(ctx, dx, dy + 22, dw, 3, '#2a160b'); // front lip shadow

  // Table Legs with brass brackets
  pRect(ctx, dx + 6, dy + 25, 6, dh - 27, '#331a0e');
  pRect(ctx, dx + dw - 12, dy + 25, 6, dh - 27, '#331a0e');
  pRect(ctx, dx + 16, dy + 25, dw - 32, dh - 32, '#1e110a'); // rear modesty board
  pRect(ctx, dx + 8, dy + 40, dw - 16, 3, '#4a2b1a'); // footrest stretcher

  // Brass feet
  pRect(ctx, dx + 5, dy + dh - 2, 8, 3, '#b45309');
  pRect(ctx, dx + dw - 13, dy + dh - 2, 8, 3, '#b45309');

  // 3. Glowing Cyan/Vellum Celestial Star Chart Pinned to Desk
  const mapX = dx + 12;
  const mapY = dy + 5;
  const mapW = 48;
  const mapH = 15;
  pRect(ctx, mapX, mapY, mapW, mapH, '#0c1a30'); // deep night indigo vellum
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(mapX + 1, mapY + 1, mapW - 2, mapH - 2);

  // Celestial equator & constellation lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.beginPath();
  ctx.moveTo(mapX + 4, mapY + 8);
  ctx.lineTo(mapX + mapW - 4, mapY + 8);
  // Mini Ursa Major / Orion points
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(mapX + 10, mapY + 4, 1.5, 1.5);
  ctx.fillRect(mapX + 16, mapY + 6, 1.5, 1.5);
  ctx.fillRect(mapX + 22, mapY + 5, 1.5, 1.5);
  ctx.fillRect(mapX + 27, mapY + 9, 1.5, 1.5);
  ctx.fillRect(mapX + 34, mapY + 4, 1.5, 1.5);
  ctx.fillRect(mapX + 38, mapY + 8, 1.5, 1.5);
  // Brass weights pinning map corners
  pRect(ctx, mapX + 1, mapY + 1, 3, 3, '#d97706');
  pRect(ctx, mapX + mapW - 4, mapY + 1, 3, 3, '#d97706');
  pRect(ctx, mapX + 1, mapY + mapH - 4, 3, 3, '#d97706');
  pRect(ctx, mapX + mapW - 4, mapY + mapH - 4, 3, 3, '#d97706');

  // 4. Brass Armillary Sphere (Right side of table)
  const armX = dx + dw - 28;
  const armY = dy - 4;
  // Wooden turned plinth
  pRect(ctx, armX + 4, armY + 18, 12, 4, '#78350f');
  pRect(ctx, armX + 8, armY + 12, 4, 6, '#b45309'); // vertical shaft
  // Nested Brass Meridian & Equator Rings
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(armX + 10, armY + 7, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(armX + 10, armY + 7, 9, 3.5, Math.PI / 4, 0, Math.PI * 2);
  ctx.stroke();
  // Central Earth sphere
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(armX + 10, armY + 7, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 5. Emerald Banker's Glass Desk Lamp
  const lampX = dx + 4;
  const lampY = dy - 2;
  pRect(ctx, lampX + 1, lampY + 12, 6, 3, '#b45309'); // brass lamp base
  pRect(ctx, lampX + 3, lampY + 4, 2, 8, '#d97706'); // brass curved neck
  // Green glass shade
  pRect(ctx, lampX, lampY + 2, 8, 4, '#047857');
  pRect(ctx, lampX + 1, lampY + 4, 6, 2, '#34d399'); // inner amber/green glow
  // Soft ambient desk light pool
  ctx.fillStyle = 'rgba(52, 211, 153, 0.08)';
  ctx.beginPath();
  ctx.ellipse(lampX + 16, dy + 14, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw Animated Mechanical Clockwork Orrery with Rotating Planets
 */
export function drawOrrery(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  _w: number,
  _h: number,
  timeMs: number
) {
  const ox = x + 4;
  const oy = y + 8;
  const ow = 100;
  const oh = 54;

  // 1. Shadow on floor
  ctx.fillStyle = 'rgba(2, 6, 23, 0.5)';
  ctx.fillRect(ox + 4, oy + oh - 2, ow - 8, 6);

  // 2. Octagonal Mahogany Pedestal Table
  pRect(ctx, ox, oy + 2, ow, 22, '#3b1d11'); // rich dark mahogany top
  pRect(ctx, ox + 1, oy + 2, ow - 2, 2, '#6e3c20'); // polished bevel
  pRect(ctx, ox, oy + 22, ow, 3, '#241209'); // lip shadow

  // Pedestal Panels & Brass Gear Cutouts
  pRect(ctx, ox + 8, oy + 25, ow - 16, oh - 27, '#241209');
  pRect(ctx, ox + 12, oy + 28, ow - 24, oh - 33, '#150a05'); // recessed chamber
  // Exposed interlocking brass drive gears visible in cabinet
  pRect(ctx, ox + 22, oy + 32, 10, 10, '#92400e');
  pRect(ctx, ox + 29, oy + 36, 12, 12, '#b45309');
  pRect(ctx, ox + 48, oy + 33, 14, 14, '#78350f');
  pRect(ctx, ox + 68, oy + 35, 12, 12, '#b45309');

  // Brass Corner Trim Feet
  pRect(ctx, ox + 4, oy + oh - 2, 8, 3, '#b45309');
  pRect(ctx, ox + ow - 12, oy + oh - 2, 8, 3, '#b45309');

  // 3. Central Clockwork Mechanical Orrery with Animated Planets
  const cx = ox + Math.floor(ow / 2);
  const cy = oy + 6;

  // Glass showcase dome silhouette
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 26, Math.PI, 0);
  ctx.stroke();

  // Brass Center Sun Sphere
  const sunPulse = Math.sin(timeMs * 0.008) * 0.5 + 1;
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(cx, cy, 5.5 + sunPulse * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 4. Rotating Planetary Gear Arms (Calculated in real time!)
  const planets = [
    { name: 'Mercury', r: 10, speed: 0.0035, color: '#94a3b8', size: 1.8 },
    { name: 'Venus',   r: 15, speed: 0.0022, color: '#fef08a', size: 2.4 },
    { name: 'Earth',   r: 21, speed: 0.0014, color: '#38bdf8', size: 2.6, moon: true },
    { name: 'Mars',    r: 28, speed: 0.0009, color: '#f87171', size: 2.2 },
    { name: 'Jupiter', r: 36, speed: 0.0004, color: '#fbbf24', size: 4.2 },
    { name: 'Saturn',  r: 44, speed: 0.0002, color: '#fde68a', size: 3.5, ring: true },
  ];

  planets.forEach((p) => {
    const angle = timeMs * p.speed + (p.r * 1.5);
    const px = cx + Math.cos(angle) * p.r;
    const py = cy + Math.sin(angle) * (p.r * 0.38); // isometric foreshortening

    // Brass orbital track wire
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.25)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(cx, cy, p.r, p.r * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Brass radial connecting arm
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.5)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Planet sphere
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(px, py, p.size, 0, Math.PI * 2);
    ctx.fill();

    // Earth's moon
    if (p.moon) {
      const moonAngle = timeMs * 0.009;
      const mx = px + Math.cos(moonAngle) * 4;
      const my = py + Math.sin(moonAngle) * 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(mx, my, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Saturn's ring
    if (p.ring) {
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(px, py, p.size * 2, p.size * 0.8, -Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

/**
 * Draw Arched Stone Doorway Threshold with Lantern
 */
export function drawObservatoryDoorway(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  titleText: string,
  isLitStudyGlow: boolean
) {
  // 1. Arched Door Frame
  pRect(ctx, x - 4, y - 6, w + 8, h + 6, '#1e293b'); // outer masonry
  pRect(ctx, x - 2, y - 4, w + 4, h + 4, '#0f172a'); // inner jamb

  // 2. Doorway Cavity / Threshold
  if (isLitStudyGlow) {
    // Warm firelight glow streaming from the Study
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.4, '#b45309');
    grad.addColorStop(1, '#1e110a');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  } else {
    // Deep starry void leading down into the Observatory
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#020617');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  }

  // 3. Classical Arch Stone Keystone
  pRect(ctx, x + Math.floor(w / 2) - 4, y - 8, 8, 5, '#475569');
  pRect(ctx, x + Math.floor(w / 2) - 3, y - 7, 6, 3, '#94a3b8');

  // 4. Carved Inscription Plaque above Doorway (crisp 1-bit pixel art plaque)
  const textW = titleText.length * 4 - 1;
  const plaqueW = textW + 8;
  const plaqueX = Math.round(x + w / 2 - plaqueW / 2);
  const plaqueY = y - 13;
  pRect(ctx, plaqueX, plaqueY, plaqueW, 9, '#090d16');
  pRect(ctx, plaqueX + 1, plaqueY + 1, plaqueW - 2, 7, '#1e293b');
  pRect(ctx, plaqueX + 2, plaqueY + 2, plaqueW - 4, 5, '#0f172a');
  drawPixelText(ctx, titleText, plaqueX + 4, plaqueY + 2, '#f8fafc', 1);
}

// =============================================================================
// BOTANICAL DECORATIVE PROPS (Study Plants)
// =============================================================================

/**
 * Grand Potted Monstera Deliciosa in Glazed Teal/Cobalt Ceramic Urn
 */
export function drawMonsteraPlant(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number) {
  const px = Math.floor(x);
  const py = Math.floor(y);

  // Soft floor contact shadow
  ctx.fillStyle = 'rgba(10, 5, 2, 0.45)';
  ctx.beginPath();
  ctx.ellipse(px + 10, py + 14, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const sway1 = Math.sin(timeMs * 0.002) * 0.8;
  const sway2 = Math.sin(timeMs * 0.0025 + 1.2) * 0.8;
  const sway3 = Math.sin(timeMs * 0.0018 + 2.5) * 0.8;

  const OUTLINE = '#052e16';
  const POT_OUT = '#090d16';

  // --- Monstera Stems & Broad Leaves ---
  // Leaf 1: High arching center leaf (topmost)
  const l1x = px + 8 + Math.floor(sway1);
  const l1y = py - 24;
  pRect(ctx, l1x - 7, l1y - 3, 14, 12, OUTLINE);
  pRect(ctx, l1x - 6, l1y - 2, 12, 10, '#15803d');
  pRect(ctx, l1x - 5, l1y - 1, 10, 8, '#16a34a');
  pRect(ctx, l1x - 3, l1y + 0, 6, 6, '#22c55e');
  pRect(ctx, l1x - 1, l1y + 1, 2, 4, '#86efac'); // midrib highlight
  // Leaf fenestration notches
  pRect(ctx, l1x - 4, l1y + 2, 2, 2, OUTLINE);
  pRect(ctx, l1x + 2, l1y + 1, 2, 2, OUTLINE);

  // Leaf 2: Left spreading broad leaf
  const l2x = px - 2 + Math.floor(sway2);
  const l2y = py - 16;
  pRect(ctx, l2x - 6, l2y - 2, 12, 11, OUTLINE);
  pRect(ctx, l2x - 5, l2y - 1, 10, 9, '#14532d');
  pRect(ctx, l2x - 4, l2y + 0, 8, 7, '#16a34a');
  pRect(ctx, l2x - 2, l2y + 1, 4, 5, '#4ade80');
  pRect(ctx, l2x - 3, l2y + 3, 2, 1, OUTLINE); // slit

  // Leaf 3: Right drooping mature leaf
  const l3x = px + 16 + Math.floor(sway3);
  const l3y = py - 14;
  pRect(ctx, l3x - 5, l3y - 2, 11, 10, OUTLINE);
  pRect(ctx, l3x - 4, l3y - 1, 9, 8, '#15803d');
  pRect(ctx, l3x - 3, l3y + 0, 7, 6, '#22c55e');
  pRect(ctx, l3x - 1, l3y + 1, 3, 4, '#86efac');
  pRect(ctx, l3x + 1, l3y + 2, 2, 1, OUTLINE); // slit

  // Leaf 4: Low front young sprout (baby leaf)
  pRect(ctx, px + 3, py - 6, 8, 7, OUTLINE);
  pRect(ctx, px + 4, py - 5, 6, 5, '#22c55e');
  pRect(ctx, px + 5, py - 4, 4, 3, '#86efac');

  // Stems connecting to soil
  pRect(ctx, px + 8, py - 14, 3, 16, '#14532d');
  pRect(ctx, px + 9, py - 12, 1, 14, '#16a34a');
  pRect(ctx, px + 5, py - 8, 2, 10, '#14532d');
  pRect(ctx, px + 12, py - 7, 2, 9, '#14532d');

  // --- Glazed Ceramic Urn Planter ---
  // Soil surface
  pRect(ctx, px + 1, py + 1, 18, 4, '#27170b');
  pRect(ctx, px + 4, py + 2, 12, 2, '#451a03');
  pRect(ctx, px + 7, py + 2, 2, 1, '#65a30d'); // moss speck

  // Urn Rim (glazed with gold band)
  pRect(ctx, px - 1, py + 2, 22, 4, POT_OUT);
  pRect(ctx, px + 0, py + 3, 20, 2, '#0e7490'); // glazed teal
  pRect(ctx, px + 2, py + 3, 16, 1, '#38bdf8'); // specular rim shine

  // Urn Body (tapered)
  pRect(ctx, px + 1, py + 6, 18, 9, POT_OUT);
  pRect(ctx, px + 2, py + 6, 16, 8, '#0f766e'); // deep teal ceramic
  pRect(ctx, px + 3, py + 7, 6, 6, '#14b8a6');  // light ceramic reflection
  pRect(ctx, px + 13, py + 7, 4, 6, '#042f2e'); // shadow edge
  // Gold inlay band
  pRect(ctx, px + 2, py + 10, 16, 2, '#ca8a04');
  pRect(ctx, px + 4, py + 10, 8, 1, '#fde047');

  // Urn Base Pedestal
  pRect(ctx, px + 3, py + 14, 14, 2, POT_OUT);
  pRect(ctx, px + 4, py + 14, 12, 1, '#0e7490');
}

/**
 * Trailing English Ivy / Cascading Pothos in Terracotta Clay Pot (Cabinet Ledge)
 */
export function drawCascadingIvy(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number) {
  const px = Math.floor(x);
  const py = Math.floor(y);

  const OUTLINE = '#052e16';
  const POT_OUT = '#2e1005';

  const swayA = Math.sin(timeMs * 0.0022) * 0.7;
  const swayB = Math.sin(timeMs * 0.0028 + 1.5) * 0.7;
  const swayC = Math.sin(timeMs * 0.0019 + 3.0) * 0.7;

  // --- Terracotta Pot on Ledge ---
  // Pot shadow on cabinet top
  pRect(ctx, px + 1, py + 9, 16, 2, 'rgba(10, 5, 2, 0.4)');

  // Pot rim
  pRect(ctx, px - 1, py + 1, 20, 3, POT_OUT);
  pRect(ctx, px, py + 2, 18, 1, '#ea580c');
  pRect(ctx, px + 2, py + 2, 12, 1, '#fb923c'); // terracotta highlight

  // Pot body
  pRect(ctx, px + 1, py + 4, 16, 6, POT_OUT);
  pRect(ctx, px + 2, py + 4, 14, 5, '#c2410c');
  pRect(ctx, px + 3, py + 5, 5, 3, '#f97316');
  pRect(ctx, px + 12, py + 5, 3, 4, '#7c2d12');

  // Rich soil
  pRect(ctx, px + 2, py + 0, 14, 2, '#27170b');

  // Crown Foliage mounding over the pot
  pRect(ctx, px - 2, py - 4, 22, 6, OUTLINE);
  pRect(ctx, px - 1, py - 3, 20, 4, '#15803d');
  pRect(ctx, px + 2, py - 2, 14, 3, '#22c55e');
  pRect(ctx, px + 4, py - 2, 8, 1, '#86efac');

  // --- Trailing Vine Tendril 1 (Left - medium ~14px) ---
  const v1x = px + 2 + Math.floor(swayA);
  pRect(ctx, v1x, py + 6, 2, 12, '#14532d');
  // Leaf clusters along vine 1
  pRect(ctx, v1x - 3, py + 8, 4, 4, OUTLINE);
  pRect(ctx, v1x - 2, py + 9, 2, 2, '#22c55e');
  pRect(ctx, v1x + 1, py + 12, 4, 4, OUTLINE);
  pRect(ctx, v1x + 2, py + 13, 2, 2, '#4ade80');
  pRect(ctx, v1x - 2, py + 16, 4, 4, OUTLINE);
  pRect(ctx, v1x - 1, py + 17, 2, 2, '#86efac');

  // --- Trailing Vine Tendril 2 (Center - long ~26px cascading down the side panel) ---
  const v2x = px + 9 + Math.floor(swayB);
  pRect(ctx, v2x, py + 6, 2, 24, '#14532d');
  // Leaf clusters along vine 2
  pRect(ctx, v2x - 3, py + 9, 4, 4, OUTLINE);
  pRect(ctx, v2x - 2, py + 10, 2, 2, '#16a34a');
  pRect(ctx, v2x + 1, py + 14, 4, 4, OUTLINE);
  pRect(ctx, v2x + 2, py + 15, 2, 2, '#22c55e');
  pRect(ctx, v2x - 4, py + 19, 5, 4, OUTLINE);
  pRect(ctx, v2x - 3, py + 20, 3, 2, '#4ade80');
  pRect(ctx, v2x + 1, py + 24, 4, 4, OUTLINE);
  pRect(ctx, v2x + 2, py + 25, 2, 2, '#86efac');
  // Vine tip tender bud
  pRect(ctx, v2x - 1, py + 28, 3, 3, OUTLINE);
  pRect(ctx, v2x, py + 29, 1, 1, '#bef264');

  // --- Trailing Vine Tendril 3 (Right - medium-long ~18px) ---
  const v3x = px + 15 + Math.floor(swayC);
  pRect(ctx, v3x, py + 5, 2, 18, '#14532d');
  pRect(ctx, v3x + 1, py + 7, 4, 4, OUTLINE);
  pRect(ctx, v3x + 2, py + 8, 2, 2, '#15803d');
  pRect(ctx, v3x - 3, py + 12, 4, 4, OUTLINE);
  pRect(ctx, v3x - 2, py + 13, 2, 2, '#22c55e');
  pRect(ctx, v3x + 1, py + 18, 4, 4, OUTLINE);
  pRect(ctx, v3x + 2, py + 19, 2, 2, '#86efac');
}

/**
 * Victorian Boston Fern in Neoclassical Fluted Brass Urn
 */
export function drawBostonFern(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number) {
  const px = Math.floor(x);
  const py = Math.floor(y);

  // Soft floor contact shadow
  ctx.fillStyle = 'rgba(10, 5, 2, 0.45)';
  ctx.beginPath();
  ctx.ellipse(px + 10, py + 13, 11, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const OUTLINE = '#052e16';
  const BRASS_OUT = '#27170b';

  const sway = Math.sin(timeMs * 0.003) * 0.7;

  // --- Feathery Arching Boston Fern Fronds ---
  // Center erect fronds
  const fcX = px + 9 + Math.floor(sway);
  pRect(ctx, fcX - 2, py - 20, 6, 18, OUTLINE);
  pRect(ctx, fcX - 1, py - 19, 4, 16, '#15803d');
  pRect(ctx, fcX, py - 18, 2, 14, '#4ade80');
  pRect(ctx, fcX, py - 21, 2, 2, '#a7f3d0'); // tip bud

  // High-left arching frond
  const flX = px + 2 + Math.floor(sway * 1.2);
  pRect(ctx, flX - 6, py - 16, 10, 8, OUTLINE);
  pRect(ctx, flX - 5, py - 15, 8, 6, '#16a34a');
  pRect(ctx, flX - 4, py - 14, 6, 4, '#22c55e');
  pRect(ctx, flX - 2, py - 13, 2, 2, '#86efac');

  // High-right arching frond
  const frX = px + 16 - Math.floor(sway * 1.1);
  pRect(ctx, frX - 4, py - 15, 10, 8, OUTLINE);
  pRect(ctx, frX - 3, py - 14, 8, 6, '#16a34a');
  pRect(ctx, frX - 2, py - 13, 6, 4, '#22c55e');
  pRect(ctx, frX + 1, py - 12, 2, 2, '#86efac');

  // Low-left drooping frond
  pRect(ctx, px - 6, py - 8, 9, 7, OUTLINE);
  pRect(ctx, px - 5, py - 7, 7, 5, '#14532d');
  pRect(ctx, px - 4, py - 6, 5, 3, '#16a34a');
  pRect(ctx, px - 2, py - 5, 2, 1, '#4ade80');

  // Low-right drooping frond
  pRect(ctx, px + 17, py - 7, 9, 7, OUTLINE);
  pRect(ctx, px + 18, py - 6, 7, 5, '#14532d');
  pRect(ctx, px + 19, py - 5, 5, 3, '#16a34a');
  pRect(ctx, px + 20, py - 4, 2, 1, '#4ade80');

  // Dense central rosette
  pRect(ctx, px + 3, py - 9, 14, 8, OUTLINE);
  pRect(ctx, px + 4, py - 8, 12, 6, '#15803d');
  pRect(ctx, px + 6, py - 7, 8, 4, '#22c55e');

  // --- Fluted Neoclassical Brass Urn ---
  // Urn Rim
  pRect(ctx, px + 1, py - 1, 18, 4, BRASS_OUT);
  pRect(ctx, px + 2, py + 0, 16, 2, '#ca8a04'); // antique brass
  pRect(ctx, px + 4, py + 0, 8, 1, '#fef08a');  // polished shine

  // Fluted Urn Body
  pRect(ctx, px + 3, py + 3, 14, 7, BRASS_OUT);
  pRect(ctx, px + 4, py + 3, 12, 6, '#d97706'); // warm golden brass
  pRect(ctx, px + 5, py + 4, 4, 4, '#fde047');  // highlight facet
  pRect(ctx, px + 12, py + 4, 3, 5, '#78350f'); // shadow flute

  // Urn Stem & Pedestal Base
  pRect(ctx, px + 7, py + 9, 6, 2, BRASS_OUT);
  pRect(ctx, px + 8, py + 9, 4, 1, '#ca8a04');
  pRect(ctx, px + 4, py + 11, 12, 3, BRASS_OUT);
  pRect(ctx, px + 5, py + 11, 10, 2, '#b45309');
  pRect(ctx, px + 6, py + 11, 6, 1, '#fde047'); // base gleam
}

