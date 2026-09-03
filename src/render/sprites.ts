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

// Draw Armchair & side table with steaming tea
export function drawReadingNook(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number, bookOnRug: boolean) {
  // Wingback Armchair
  const ax = x;
  const ay = y;
  // Shadow
  ctx.fillStyle = 'rgba(15, 10, 5, 0.4)';
  ctx.beginPath();
  ctx.ellipse(ax + 16, ay + 28, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cushion & Back
  pRect(ctx, ax + 2, ay + 2, 28, 22, '#581c24');
  pRect(ctx, ax + 4, ay + 4, 24, 18, '#782330'); // rich velvet burgundy
  // Wing armrests
  pRect(ctx, ax, ay + 8, 5, 18, '#4c181f');
  pRect(ctx, ax + 27, ay + 8, 5, 18, '#4c181f');
  // Seat cushion
  pRect(ctx, ax + 5, ay + 14, 22, 14, '#8a2b38');
  pRect(ctx, ax + 6, ay + 15, 20, 2, '#a33645'); // highlight
  // Wood feet
  pRect(ctx, ax + 3, ay + 27, 3, 3, '#2a160c');
  pRect(ctx, ax + 26, ay + 27, 3, 3, '#2a160c');

  // Small round tea table
  const tx = ax + 30;
  const ty = ay + 8;
  pRect(ctx, tx + 6, ty + 12, 3, 10, '#351e12'); // table leg
  pRect(ctx, tx + 2, ty + 20, 11, 2, '#25140b'); // tripod base

  // Table top
  pRect(ctx, tx, ty + 4, 15, 9, '#4d2b1a');
  pRect(ctx, tx + 1, ty + 5, 13, 7, '#623822');

  // Teacup
  pRect(ctx, tx + 5, ty + 4, 5, 4, '#f8fafc');
  pRect(ctx, tx + 6, ty + 5, 3, 2, '#78350f'); // tea liquid

  // Steam particle
  const steamOffset = (timeMs * 0.02) % 16;
  const steamWave = Math.sin(timeMs * 0.005) * 2;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.fillRect(tx + 7 + steamWave, ty + 2 - steamOffset, 1, 2);

  // If memory was recalled on prior visit: open book lying on rug!
  if (bookOnRug) {
    const rbx = ax - 10;
    const rby = ay + 26;
    pRect(ctx, rbx, rby, 16, 11, '#7f1d1d'); // open red cover
    pRect(ctx, rbx + 1, rby + 1, 6, 9, '#fef3c7'); // left open page
    pRect(ctx, rbx + 9, rby + 1, 6, 9, '#fef3c7'); // right open page
    // Miniature lines of text
    ctx.fillStyle = '#475569';
    ctx.fillRect(rbx + 2, rby + 3, 4, 1);
    ctx.fillRect(rbx + 2, rby + 5, 4, 1);
    ctx.fillRect(rbx + 2, rby + 7, 3, 1);
    ctx.fillRect(rbx + 10, rby + 3, 4, 1);
    ctx.fillRect(rbx + 10, rby + 5, 4, 1);
  }
}

// Draw Workshop Desk with Dinosaur Skull and pulsing FEA Mesh
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
  const cbH = 24;
  pRect(ctx, x + 8, y - 22, cbW, cbH, '#374151'); // dark chalkboard frame
  pRect(ctx, x + 10, y - 20, cbW - 4, cbH - 4, '#1f2937'); // slate board
  ctx.fillStyle = '#e5e7eb';
  ctx.font = '7px monospace';
  ctx.fillText(equation.slice(0, 26), x + 14, y - 8);

  // Desk shadow
  ctx.fillStyle = 'rgba(10, 8, 6, 0.45)';
  ctx.fillRect(x + 4, y + h - 4, w - 8, 6);

  // Oak Desk
  pRect(ctx, x, y, w, h - 6, '#3a2012'); // main frame
  pRect(ctx, x + 2, y + 2, w - 4, 8, '#54301c'); // tabletop front bevel
  pRect(ctx, x + 2, y + 2, w - 4, 1, '#6d4026'); // highlight line

  // Desk drawers on left and right
  pRect(ctx, x + 4, y + 12, 22, h - 20, '#2b170c');
  pRect(ctx, x + 6, y + 14, 18, 7, '#3d2213');
  pRect(ctx, x + 13, y + 17, 4, 2, '#d97706'); // brass handle

  pRect(ctx, x + 6, y + 24, 18, 7, '#3d2213');
  pRect(ctx, x + 13, y + 27, 4, 2, '#d97706'); // brass handle

  // Blueprints & scientific papers in center
  pRect(ctx, x + 32, y + 4, 24, 15, '#1e3a8a');
  ctx.strokeStyle = '#60a5fa';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 34.5, y + 5.5, 19, 11);
  ctx.beginPath();
  ctx.arc(x + 44, y + 11, 4, 0, Math.PI);
  ctx.stroke();

  // CRT / Laptop Monitor
  const mx = x + 62;
  const my = y - 4;
  pRect(ctx, mx, my, 22, 18, '#1e293b'); // casing
  pRect(ctx, mx + 2, my + 2, 18, 14, '#0f172a'); // screen bezel
  // CRT phosphor screen
  const isComplete = project.status === 'completed';
  const phosphorColor = isComplete ? '#059669' : '#0284c7';
  pRect(ctx, mx + 3, my + 3, 16, 12, phosphorColor);
  // Scanlines
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let l = my + 4; l < my + 14; l += 2) {
    ctx.fillRect(mx + 3, l, 16, 1);
  }

  // --- STEGOCERAS SKULL & FEA MESH ---
  const skX = x + 92;
  const skY = y - 2;

  // Stand
  pRect(ctx, skX + 10, skY + 18, 6, 10, '#b45309'); // brass rod
  pRect(ctx, skX + 6, skY + 26, 14, 3, '#78350f'); // brass weighted base

  // Skull bone silhouette (Stegoceras frontoparietal dome + snout)
  ctx.fillStyle = '#e2d8c3'; // aged fossil bone
  ctx.beginPath();
  // Dome curve
  ctx.moveTo(skX + 4, skY + 12);
  ctx.quadraticCurveTo(skX + 12, skY - 6, skX + 22, skY + 6);
  // Posterior shelf tubercles
  ctx.lineTo(skX + 25, skY + 12);
  ctx.lineTo(skX + 22, skY + 16);
  // Snout
  ctx.lineTo(skX + 8, skY + 16);
  ctx.lineTo(skX + 2, skY + 14);
  ctx.closePath();
  ctx.fill();

  // Orbit / Eye socket
  ctx.fillStyle = '#262626';
  ctx.beginPath();
  ctx.ellipse(skX + 11, skY + 11, 2.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Animated FEA Mesh overlay!
  const meshPulse = Math.sin(timeMs * 0.005) * 0.3 + 0.7;
  ctx.lineWidth = 1;

  if (isComplete) {
    // Stress contour heatmap (red/yellow/cyan)
    ctx.strokeStyle = `rgba(239, 68, 68, ${meshPulse})`;
  } else {
    // Electric blue wireframe simulation
    ctx.strokeStyle = `rgba(56, 189, 248, ${meshPulse})`;
  }

  // Wireframe nodes across the dome
  ctx.beginPath();
  // Triangular element lines
  ctx.moveTo(skX + 6, skY + 10);
  ctx.lineTo(skX + 12, skY + 2);
  ctx.lineTo(skX + 18, skY + 4);
  ctx.lineTo(skX + 14, skY + 10);
  ctx.closePath();

  ctx.moveTo(skX + 12, skY + 2);
  ctx.lineTo(skX + 14, skY + 10);

  ctx.moveTo(skX + 18, skY + 4);
  ctx.lineTo(skX + 23, skY + 10);
  ctx.lineTo(skX + 14, skY + 10);

  ctx.stroke();

  // Glowing nodes
  ctx.fillStyle = isComplete ? '#ef4444' : '#38bdf8';
  ctx.fillRect(skX + 12, skY + 2, 1.5, 1.5);
  ctx.fillRect(skX + 18, skY + 4, 1.5, 1.5);
  ctx.fillRect(skX + 14, skY + 10, 1.5, 1.5);
}

// Draw Fossil Cabinet and Display Pedestal
export function drawFossilCabinet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  hasUndiscovered: boolean,
  timeMs: number
) {
  // Mahogany cabinet frame
  pRect(ctx, x, y, w, h, '#2a160d');
  pRect(ctx, x + 2, y + 2, w - 4, 4, '#482718'); // cornice

  // Lit glass panes
  const shelfCount = 3;
  const sh = (h - 10) / shelfCount;

  for (let s = 0; s < shelfCount; s++) {
    const sy = y + 7 + s * sh;
    // Illuminated interior background
    pRect(ctx, x + 3, sy, w - 6, sh - 3, '#1c1512');
    // Glass shelf highlight
    pRect(ctx, x + 3, sy + sh - 3, w - 6, 2, 'rgba(186, 230, 253, 0.4)');

    // Specimen fossils on shelf
    if (s === 0) {
      // Ammonite spiral & trilobite
      ctx.fillStyle = '#a8a29e';
      ctx.beginPath();
      ctx.arc(x + 12, sy + sh - 7, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78716c';
      pRect(ctx, x + 24, sy + sh - 8, 7, 5, '#78716c');
    } else if (s === 1) {
      // Triceratops horn core & osteoderm
      ctx.fillStyle = '#d6d3d1';
      ctx.beginPath();
      ctx.moveTo(x + 10, sy + sh - 4);
      ctx.lineTo(x + 16, sy + sh - 11);
      ctx.lineTo(x + 18, sy + sh - 4);
      ctx.closePath();
      ctx.fill();
    } else {
      // Prenocephale dome specimen (The mystery discovery!)
      ctx.fillStyle = '#e7e5e4';
      ctx.beginPath();
      ctx.arc(x + 20, sy + sh - 6, 5, Math.PI, 0);
      ctx.fill();
      pRect(ctx, x + 15, sy + sh - 6, 10, 3, '#d6d3d1');

      // Subtle sparkle twinkle if undiscovered!
      if (hasUndiscovered) {
        const sparklePhase = (timeMs * 0.003) % (Math.PI * 2);
        const alpha = Math.max(0, Math.sin(sparklePhase));
        if (alpha > 0.05) {
          ctx.fillStyle = `rgba(253, 224, 71, ${alpha})`;
          const sx = x + 26;
          const sySparkle = sy + sh - 12;
          ctx.fillRect(sx - 1, sySparkle, 3, 1);
          ctx.fillRect(sx, sySparkle - 1, 1, 3);
        }
      }
    }
  }

  // Brass handle on vertical frame
  pRect(ctx, x + Math.floor(w / 2) - 1, y + Math.floor(h / 2) - 3, 2, 6, '#d97706');
}

// Draw Display Pedestal
export function drawPedestal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  featuredName: string | null
) {
  // Marble/dark wood column
  pRect(ctx, x + 3, y + 2, 26, 6, '#475569'); // top cap
  pRect(ctx, x + 4, y + 3, 24, 1, '#94a3b8'); // highlight
  pRect(ctx, x + 6, y + 8, 20, 20, '#334155'); // shaft
  pRect(ctx, x + 7, y + 8, 2, 20, '#64748b'); // fluting line
  pRect(ctx, x + 12, y + 8, 2, 20, '#64748b');
  pRect(ctx, x + 17, y + 8, 2, 20, '#64748b');
  pRect(ctx, x + 2, y + 28, 28, 6, '#1e293b'); // base

  // If featured specimen is placed on pedestal:
  if (featuredName) {
    // Velvet display cushion
    pRect(ctx, x + 5, y - 2, 22, 5, '#7f1d1d');
    // Specimen dome on cushion
    ctx.fillStyle = '#f5f5f4';
    ctx.beginPath();
    ctx.arc(x + 16, y - 4, 7, Math.PI, 0);
    ctx.fill();
    // Tiny label placard
    pRect(ctx, x + 8, y + 14, 16, 6, '#d97706');
    pRect(ctx, x + 9, y + 15, 14, 4, '#fef3c7');
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

// Draw Player Character with 4-directional walk and idle animation
export function drawPlayerSprite(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  facing: Direction,
  isMoving: boolean,
  walkFrame: number
) {
  // Shadow
  ctx.fillStyle = 'rgba(12, 8, 5, 0.45)';
  ctx.beginPath();
  ctx.ellipse(x + 8, y + 24, 7, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  const stepOffset = isMoving ? Math.sin(walkFrame * 0.4) * 2 : 0;

  // Hair
  pRect(ctx, x + 4, y + 2, 8, 6, '#292524'); // dark hair
  // Face
  pRect(ctx, x + 5, y + 5, 6, 5, '#ffedd5');

  // Eyes according to facing
  ctx.fillStyle = '#1c1917';
  if (facing === 'down') {
    ctx.fillRect(x + 6, y + 7, 1, 1);
    ctx.fillRect(x + 9, y + 7, 1, 1);
  } else if (facing === 'left') {
    ctx.fillRect(x + 5, y + 7, 1, 1);
  } else if (facing === 'right') {
    ctx.fillRect(x + 10, y + 7, 1, 1);
  }

  // Coat / Jacket (Navy scholar coat)
  pRect(ctx, x + 3, y + 10, 10, 8, '#1e3a8a');
  pRect(ctx, x + 6, y + 10, 4, 8, '#e2e8f0'); // shirt
  pRect(ctx, x + 7, y + 11, 2, 4, '#b91c1c'); // scarf/cravat

  // Legs & Walk stride
  if (isMoving) {
    pRect(ctx, x + 4, y + 18, 3, 6 + stepOffset, '#1e293b');
    pRect(ctx, x + 9, y + 18, 3, 6 - stepOffset, '#1e293b');
    pRect(ctx, x + 4, y + 24 + stepOffset, 3, 2, '#0f172a');
    pRect(ctx, x + 9, y + 24 - stepOffset, 3, 2, '#0f172a');
  } else {
    pRect(ctx, x + 4, y + 18, 3, 6, '#1e293b');
    pRect(ctx, x + 9, y + 18, 3, 6, '#1e293b');
    pRect(ctx, x + 4, y + 24, 3, 2, '#0f172a');
    pRect(ctx, x + 9, y + 24, 3, 2, '#0f172a');
  }
}
