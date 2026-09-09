import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '../core/constants';
import { pRect } from './sprites';
import { drawSideWallPortal } from './escherSprites';

// =============================================================================
// M.C. ESCHER "PRINT GALLERY" (1956) ARCHITECTURAL SPRITES
// Living spatial recreation of the famous paradoxical lithograph
// =============================================================================

/**
 * Draw the in-world Chrono-Spatial Paradox Dial pedestal.
 * Allows players to turn the dial and hot-swap Escher variants right in the world.
 */
export function drawVariantDialStation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  timeMs: number,
  activeVariant: 'v1_courtyard' | 'v2_print_gallery'
) {
  const px = Math.floor(x);
  const py = Math.floor(y);

  ctx.save();

  // 1. Turned Walnut & Brass Pedestal Base
  pRect(ctx, px + 4, py + 38, 40, 10, '#0c0a09'); // shadow
  pRect(ctx, px + 6, py + 36, 36, 6, '#451a03'); // bottom plinth
  pRect(ctx, px + 8, py + 34, 32, 3, '#78350f');
  pRect(ctx, px + 10, py + 32, 28, 3, '#b45309'); // brass ring
  pRect(ctx, px + 16, py + 18, 16, 14, '#451a03'); // fluted column
  pRect(ctx, px + 18, py + 18, 4, 14, '#78350f'); // highlight
  pRect(ctx, px + 12, py + 14, 24, 4, '#b45309'); // brass capital

  // 2. Tilted Astrolabe Dial Plate
  pRect(ctx, px + 4, py + 2, 40, 14, '#1c1917'); // dial backplate
  pRect(ctx, px + 6, py + 4, 36, 10, '#d97706'); // brass rim
  pRect(ctx, px + 8, py + 5, 32, 8, '#fef3c7'); // etched dial face

  // 3. Dual Mode Indicators: Courtyard (Cyan) vs Print Gallery (Amber)
  const isV2 = activeVariant === 'v2_print_gallery';
  const pulse = Math.sin(timeMs * 0.005) * 0.2 + 0.8;

  // Mode I mark (left): Courtyard
  pRect(ctx, px + 11, py + 8, 4, 3, isV2 ? '#64748b' : `rgba(56, 189, 248, ${pulse})`);
  // Mode II mark (right): Print Gallery
  pRect(ctx, px + 33, py + 8, 4, 3, isV2 ? `rgba(245, 158, 11, ${pulse})` : '#64748b');

  // Mechanical needle pointing to active mode
  const needleX = isV2 ? px + 32 : px + 13;
  pRect(ctx, px + 23, py + 8, 2, 2, '#0c0a09'); // central pivot
  pRect(ctx, needleX, py + 7, 3, 2, '#0c0a09'); // needle tip

  // Floating gear sparks / paradox aura
  const sparkY = py + Math.sin(timeMs * 0.004) * 3;
  ctx.fillStyle = isV2 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(56, 189, 248, 0.6)';
  ctx.fillRect(px + 23, sparkY - 4, 2, 2);

  ctx.restore();
}

/**
 * Draw the young observer standing in the gallery arcade with his hands behind his back.
 * Directly based on the young man in Escher's 1956 print.
 */
export function drawYoungObserver(ctx: CanvasRenderingContext2D, x: number, y: number, timeMs: number) {
  const px = Math.floor(x);
  const py = Math.floor(y);
  const breathe = Math.sin(timeMs * 0.0025) * 1.0;

  ctx.save();

  // Shadow
  ctx.fillStyle = 'rgba(12, 10, 9, 0.5)';
  ctx.beginPath();
  ctx.ellipse(px + 10, py + 38, 12, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Trousers & Leather shoes
  pRect(ctx, px + 5, py + 34, 4, 5, '#1e1b18');
  pRect(ctx, px + 11, py + 34, 4, 5, '#1e1b18');
  pRect(ctx, px + 4, py + 37, 5, 3, '#0c0a09'); // left boot
  pRect(ctx, px + 11, py + 37, 5, 3, '#0c0a09'); // right boot
  pRect(ctx, px + 5, py + 24, 10, 11, '#292524'); // trousers

  // Long Charcoal Tweed Frock Coat (gentle breathing)
  pRect(ctx, px + 3, py + 12 + breathe, 14, 15, '#1c1917');
  pRect(ctx, px + 5, py + 13 + breathe, 10, 13, '#262626');
  // Folded hands clasped behind back
  pRect(ctx, px + 8, py + 18 + breathe, 4, 4, '#fed7aa');

  // White collar
  pRect(ctx, px + 8, py + 10 + breathe, 4, 2, '#f5f5f4');

  // Curly brown hair & head turned slightly up towards the print
  pRect(ctx, px + 6, py + 3 + breathe, 8, 8, '#442211');
  pRect(ctx, px + 5, py + 2 + breathe, 10, 4, '#2d1508');
  pRect(ctx, px + 7, py + 4 + breathe, 6, 6, '#3a1a0a');
  pRect(ctx, px + 9, py + 6 + breathe, 2, 2, '#fed7aa'); // ear hint

  ctx.restore();
}

/**
 * Draw the wooden printmaker's folio browser rack with unframed prints.
 */
export function drawFolioStand(ctx: CanvasRenderingContext2D, x: number, y: number, _timeMs: number) {
  const px = Math.floor(x);
  const py = Math.floor(y);

  ctx.save();

  // Shadow
  pRect(ctx, px + 2, py + 30, 44, 8, 'rgba(12, 10, 9, 0.45)');

  // Turned Oak Stand Legs & Spindles
  pRect(ctx, px + 4, py + 12, 4, 20, '#451a03');
  pRect(ctx, px + 40, py + 12, 4, 20, '#451a03');
  pRect(ctx, px + 2, py + 30, 8, 3, '#78350f');
  pRect(ctx, px + 38, py + 30, 8, 3, '#78350f');
  pRect(ctx, px + 6, py + 22, 36, 3, '#78350f'); // crossbar

  // Angled Folio Trough holding prints
  pRect(ctx, px + 2, py + 4, 44, 12, '#29180c');
  pRect(ctx, px + 4, py + 6, 40, 8, '#78350f');

  // Loose Lithographs with Deckle Edges
  pRect(ctx, px + 6, py + 1, 36, 12, '#e7e5e4'); // background paper
  pRect(ctx, px + 8, py + 3, 32, 10, '#f5f5f4'); // front paper sheet

  // Miniature sketched lines on sheet
  pRect(ctx, px + 10, py + 5, 12, 1, '#78716c');
  pRect(ctx, px + 10, py + 7, 20, 1, '#a8a29e');
  pRect(ctx, px + 10, py + 9, 16, 1, '#78716c');

  // Brass binding knobs
  pRect(ctx, px + 4, py + 10, 2, 3, '#d97706');
  pRect(ctx, px + 42, py + 10, 2, 3, '#d97706');

  ctx.restore();
}

/**
 * Draw a framed artwork on the gallery wall or display easel.
 */
export function drawFramedArtworkStation(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  artId: string,
  timeMs: number
) {
  const px = Math.floor(x);
  const py = Math.floor(y);

  ctx.save();

  // 1. Picture Lamp (Brass light mounted above frame casting a warm cone)
  pRect(ctx, px + Math.floor(w / 2) - 10, py - 8, 20, 3, '#b45309');
  pRect(ctx, px + Math.floor(w / 2) - 1, py - 5, 2, 5, '#78350f');
  // Downward warm light cone
  const lightCone = ctx.createLinearGradient(px + w / 2, py - 5, px + w / 2, py + h + 8);
  lightCone.addColorStop(0, 'rgba(254, 243, 199, 0.25)');
  lightCone.addColorStop(0.4, 'rgba(245, 158, 11, 0.08)');
  lightCone.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = lightCone;
  ctx.beginPath();
  ctx.moveTo(px + w / 2 - 12, py - 4);
  ctx.lineTo(px + w / 2 + 12, py - 4);
  ctx.lineTo(px + w + 12, py + h + 10);
  ctx.lineTo(px - 12, py + h + 10);
  ctx.closePath();
  ctx.fill();

  // 2. Heavy Gilded Baroque or Dark Walnut Frame
  pRect(ctx, px - 3, py - 3, w + 6, h + 6, '#0c0a09'); // outer shadow
  pRect(ctx, px - 2, py - 2, w + 4, h + 4, '#78350f'); // frame base
  pRect(ctx, px - 1, py - 1, w + 2, h + 2, '#d97706'); // gold leaf trim
  pRect(ctx, px, py, w, h, '#1c1917'); // canvas recess

  // 3. Stylized Miniature Artwork Rendering
  renderMiniatureArt(ctx, px + 2, py + 2, w - 4, h - 4, artId, timeMs);

  // 4. Brass Title Plaque underneath
  pRect(ctx, px + Math.floor(w / 2) - 14, py + h + 3, 28, 5, '#0c0a09');
  pRect(ctx, px + Math.floor(w / 2) - 13, py + h + 4, 26, 3, '#d97706');
  pRect(ctx, px + Math.floor(w / 2) - 10, py + h + 5, 20, 1, '#1c1917'); // engraved text line

  ctx.restore();
}

/**
 * Render an authentic high-contrast stylized miniature for each specific Escher work.
 */
function renderMiniatureArt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  artId: string,
  _timeMs: number
) {
  // Off-white rag paper base
  ctx.fillStyle = '#f5f0e6';
  ctx.fillRect(x, y, w, h);

  const cx = x + w / 2;
  const cy = y + h / 2;

  if (artId === 'print_gallery') {
    // Miniature Print Gallery: Logarithmic spiral loop with Maltese rooftops and center void
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * 0.38, 0, Math.PI * 2);
    ctx.stroke();

    // Central blank singularity hole (Escher's blank spot)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Logarithmic curve lines curving out to rooftops
    ctx.beginPath();
    ctx.arc(cx - 3, cy + 2, 14, Math.PI * 0.2, Math.PI * 1.4);
    ctx.stroke();
    // Miniature Maltese rooftops & harbor
    pRect(ctx, x + 3, y + h - 8, 12, 6, '#b45309'); // terracotta roof
    pRect(ctx, x + 4, y + h - 12, 10, 5, '#e2e8f0'); // stucco wall
  } else if (artId === 'relativity') {
    // Miniature Relativity: Three intersecting staircases at 90 degrees
    ctx.fillStyle = '#292524';
    // Horizontal stairs
    for (let i = 0; i < 4; i++) {
      pRect(ctx, x + 4 + i * 3, cy - 6 + i * 2, 5, 2, '#44403c');
    }
    // Vertical ascending stairs
    for (let i = 0; i < 4; i++) {
      pRect(ctx, cx + 2, y + 4 + i * 4, 8, 2, '#1c1917');
    }
    // Angled stairs
    for (let i = 0; i < 4; i++) {
      pRect(ctx, x + w - 12 - i * 3, cy + i * 2, 5, 2, '#78716c');
    }
  } else if (artId === 'drawing_hands') {
    // Miniature Drawing Hands: Two hands emerging from paper holding pencils
    pRect(ctx, x + 3, cy - 4, 10, 6, '#fed7aa'); // left hand
    pRect(ctx, x + 11, cy - 6, 6, 2, '#1c1917'); // pencil
    pRect(ctx, x + w - 13, cy - 2, 10, 6, '#fed7aa'); // right hand
    pRect(ctx, x + w - 17, cy, 6, 2, '#1c1917'); // pencil
    ctx.strokeStyle = '#a8a29e';
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4); // paper outline
  } else if (artId === 'metamorphosis_ii') {
    // Miniature Metamorphosis: Continuous transition from checks to triangles to town
    const stripeW = Math.floor(w / 4);
    // 1. Checkerboard
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if ((row + col) % 2 === 0) {
          pRect(ctx, x + col * 3, y + 3 + row * 3, 3, 3, '#1c1917');
        }
      }
    }
    // 2. Hexagonal honeycombs / reptiles
    pRect(ctx, x + stripeW + 2, cy - 4, 6, 6, '#047857');
    // 3. Flight of birds
    pRect(ctx, x + stripeW * 2 + 2, cy - 5, 8, 4, '#1e293b');
    // 4. Clifftop Italian town (Atrani)
    pRect(ctx, x + w - 10, y + 4, 8, 10, '#b45309');
  } else if (artId === 'belvedere') {
    // Miniature Belvedere: Impossible two-story pavilion
    pRect(ctx, cx - 10, y + 4, 20, 3, '#78716c'); // roof
    pRect(ctx, cx - 10, y + h - 5, 20, 3, '#78716c'); // floor
    // Paradoxical crossed pillars
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 8, y + 7);
    ctx.lineTo(cx + 8, y + h - 5);
    ctx.moveTo(cx + 8, y + 7);
    ctx.lineTo(cx - 8, y + h - 5);
    ctx.stroke();
  } else if (artId === 'day_and_night') {
    // Miniature Day and Night: Black birds vs white birds over polders
    pRect(ctx, x, y, Math.floor(w / 2), h, '#f8fafc'); // day sky
    pRect(ctx, x + Math.floor(w / 2), y, Math.ceil(w / 2), h, '#0f172a'); // night sky
    // Flying birds silhouettes
    pRect(ctx, x + 4, cy - 4, 5, 3, '#0f172a'); // black bird in day
    pRect(ctx, x + w - 9, cy - 4, 5, 3, '#f8fafc'); // white bird in night
  }
}

/**
 * 1. Static Room Architecture: The Print Gallery living lithograph layout.
 * Lower-right: exhibition arcade with parquet flooring and stone colonnade.
 * Upper-left: Mediterranean cobblestone quay, Maltese stucco houses, sea wall, and water.
 * Center: Circular marble MCE singularity medallion.
 * Top: Rooftops curving into gallery ceiling beams.
 */
export function drawPrintGalleryBackground(ctx: CanvasRenderingContext2D, timeMs: number) {
  // Fill deep warm stone void
  ctx.fillStyle = '#181411';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // ---------------------------------------------------------------------------
  // 1. FLOORING: Mediterranean Harbor Cobblestones (Left) -> Parquet (Right)
  // ---------------------------------------------------------------------------
  for (let ty = 0; ty < 15; ty++) {
    for (let tx = 0; tx < 20; tx++) {
      const fx = tx * TILE_SIZE;
      const fy = ty * TILE_SIZE;

      // Top-left quadrant: Harbor water (columns 0..3, rows 0..6)
      if (tx < 4 && ty < 7) {
        // Harbor sea water
        const wave = Math.sin(timeMs * 0.002 + tx * 0.8 + ty * 0.5) * 0.1;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(fx, fy, TILE_SIZE, TILE_SIZE);
        // Water highlights
        ctx.fillStyle = `rgba(148, 163, 184, ${0.15 + wave})`;
        ctx.fillRect(fx + 4, fy + 8, 14, 2);
        ctx.fillRect(fx + 14, fy + 20, 10, 2);
        continue;
      }

      // Harbor Quay Wall border (column 4 or row 6 on left)
      if ((tx === 4 && ty <= 6) || (ty === 7 && tx <= 4)) {
        ctx.fillStyle = '#44403c';
        ctx.fillRect(fx, fy, TILE_SIZE, TILE_SIZE);
        // Heavy granite capstone
        pRect(ctx, fx, fy, TILE_SIZE, 4, '#78716c');
        pRect(ctx, fx, fy + TILE_SIZE - 2, TILE_SIZE, 2, '#1c1917');
        continue;
      }

      // Left-to-Center area (tx < 11): Mediterranean Cobblestone paving
      if (tx < 11) {
        const isWarm = (tx * 7 + ty * 13) % 5 === 0;
        ctx.fillStyle = isWarm ? '#78716c' : '#57534e';
        ctx.fillRect(fx, fy, TILE_SIZE, TILE_SIZE);
        // Cobblestone mortar grooves
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 1;
        ctx.strokeRect(fx + 1, fy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        // Stone texture specks
        pRect(ctx, fx + 6, fy + 6, 2, 2, '#a8a29e');
        pRect(ctx, fx + 18, fy + 18, 2, 2, '#44403c');
      } else {
        // Right area (tx >= 11): Warm Oak Parquet Floor (Exhibition Gallery)
        const variant = (tx * 3 + ty * 7) % 4;
        const parquetCol = variant === 0 ? '#451a03' : variant === 1 ? '#542004' : '#3f1702';
        ctx.fillStyle = parquetCol;
        ctx.fillRect(fx, fy, TILE_SIZE, TILE_SIZE);
        // Parquet plank seams
        pRect(ctx, fx, fy, TILE_SIZE, 1, '#78350f');
        pRect(ctx, fx, fy, 1, TILE_SIZE, '#78350f');
        pRect(ctx, fx, fy + TILE_SIZE - 1, TILE_SIZE, 1, '#1c1917');
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 2. THE SINGULARITY MEDALLION (Center, tile 9..11, rows 6..8)
  // The iconic circular blank void with Escher's MCE seal
  // ---------------------------------------------------------------------------
  const centerX = 10 * TILE_SIZE;
  const centerY = 7.5 * TILE_SIZE;

  ctx.save();
  // Outer bronze inlay ring
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 52, 0, Math.PI * 2);
  ctx.stroke();

  // Polished White Carrara Marble Medallion
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 49, 0, Math.PI * 2);
  ctx.fill();

  // Concentric Logarithmic Spiral Grooves
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  for (let r = 16; r <= 42; r += 12) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Engraved "MCE" Monogram in center
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MCE', centerX, centerY - 1);

  // Latin ring inscription: "PRENTENTENTOONSTELLING • 1956"
  ctx.fillStyle = '#64748b';
  ctx.font = '7px -apple-system, sans-serif';
  ctx.fillText('• PRENTENTENTOONSTELLING •', centerX, centerY + 26);
  ctx.restore();

  // ---------------------------------------------------------------------------
  // 3. NORTH ARCHITECTURE: Town Roofs Morphing into Gallery Vaults
  // ---------------------------------------------------------------------------
  // North wall base
  pRect(ctx, 0, 0, CANVAS_WIDTH, 48, '#1c1917');
  pRect(ctx, 0, 48, CANVAS_WIDTH, 4, '#44403c'); // stone cornice

  // Left-side rooftops (Senglea Maltese port): Terracotta tile rows
  for (let tx = 4; tx < 11; tx++) {
    const rx = tx * TILE_SIZE;
    // Stucco building facade
    pRect(ctx, rx, 16, TILE_SIZE, 32, '#d6d3d1');
    pRect(ctx, rx + 4, 22, 12, 16, '#15803d'); // green shutters
    pRect(ctx, rx + 7, 25, 6, 12, '#0c0a09'); // window opening
    // Terracotta roof slant
    pRect(ctx, rx, 4, TILE_SIZE, 12, '#b45309');
    pRect(ctx, rx, 8, TILE_SIZE, 2, '#d97706');
    pRect(ctx, rx, 12, TILE_SIZE, 2, '#78350f');
  }

  // Right-side Gallery Arcade Roof: Vaulted timber rafters & gallery clerestory windows
  for (let tx = 11; tx < 20; tx++) {
    const rx = tx * TILE_SIZE;
    // Dark timber beam
    pRect(ctx, rx, 0, 6, 48, '#451a03');
    pRect(ctx, rx + 1, 0, 2, 48, '#78350f'); // highlight
    // Gallery clerestory arched window
    if (tx % 3 === 0) {
      pRect(ctx, rx + 8, 10, 18, 26, '#38bdf8'); // sky pane
      pRect(ctx, rx + 16, 10, 2, 26, '#451a03'); // mullion
      pRect(ctx, rx + 8, 22, 18, 2, '#451a03'); // transom
    }
  }

  // ---------------------------------------------------------------------------
  // 4. CLASSICAL ARCADED COLONNADE (Dividing Gallery from Harbor)
  // Column 11: Two majestic limestone pillars with Corinthian capitals
  // ---------------------------------------------------------------------------
  const pillarX = 11 * TILE_SIZE - 8;
  // Pillar 1 (Upper)
  pRect(ctx, pillarX, 52, 16, 68, '#e7e5e4'); // limestone shaft
  pRect(ctx, pillarX + 2, 52, 3, 68, '#ffffff'); // fluting highlight
  pRect(ctx, pillarX - 2, 48, 20, 6, '#d6d3d1'); // capital
  pRect(ctx, pillarX - 2, 116, 20, 6, '#78716c'); // plinth base

  // Pillar 2 (Lower)
  pRect(ctx, pillarX, 9 * TILE_SIZE + 10, 16, 68, '#e7e5e4');
  pRect(ctx, pillarX + 2, 9 * TILE_SIZE + 10, 3, 68, '#ffffff');
  pRect(ctx, pillarX - 2, 9 * TILE_SIZE + 6, 20, 6, '#d6d3d1');
  pRect(ctx, pillarX - 2, 9 * TILE_SIZE + 74, 20, 6, '#78716c');

  // Arched Stone Bridge over water (Far left, row 4)
  pRect(ctx, 0, 3.5 * TILE_SIZE, 4 * TILE_SIZE, 24, '#57534e');
  pRect(ctx, 0, 3.5 * TILE_SIZE, 4 * TILE_SIZE, 4, '#a8a29e'); // bridge parapet
  // Arch opening over water
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(2 * TILE_SIZE, 4.2 * TILE_SIZE, 18, Math.PI, 0);
  ctx.fill();

  // ---------------------------------------------------------------------------
  // 5. EAST DOORWAY PORTAL (Returning to The Study)
  // ---------------------------------------------------------------------------
  drawSideWallPortal(
    ctx,
    CANVAS_WIDTH - 28,
    5.5 * TILE_SIZE,
    26,
    80,
    'east',
    'THE STUDY'
  );
}

/**
 * 2. Dynamic Atmosphere: Sunlit harbor sea-breeze contrasting with warm amber picture lamps.
 */
export function drawPrintGalleryAtmosphere(ctx: CanvasRenderingContext2D, timeMs: number) {
  // 1. Broad Mediterranean Sunlight pouring over the harbor town from top-left
  const sunWash = ctx.createRadialGradient(
    0,
    0,
    20,
    CANVAS_WIDTH * 0.45,
    CANVAS_HEIGHT * 0.45,
    380
  );
  sunWash.addColorStop(0, 'rgba(254, 240, 138, 0.18)');
  sunWash.addColorStop(0.5, 'rgba(245, 158, 11, 0.05)');
  sunWash.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = sunWash;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 2. Ambient Floating Paper Motes / Lithographic Dust
  ctx.fillStyle = 'rgba(254, 243, 199, 0.35)';
  for (let i = 0; i < 20; i++) {
    const px = (Math.sin(timeMs * 0.0005 + i * 2.1) * 0.5 + 0.5) * (CANVAS_WIDTH - 40) + 20;
    const py = (Math.cos(timeMs * 0.0004 + i * 3.4) * 0.5 + 0.5) * (CANVAS_HEIGHT - 80) + 60;
    const size = i % 4 === 0 ? 2 : 1;
    ctx.fillRect(px, py, size, size);
  }

  // 3. Subtle Vignette framing the gallery
  const vignette = ctx.createRadialGradient(
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_WIDTH * 0.32,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2,
    CANVAS_WIDTH * 0.72
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(12, 10, 9, 0.5)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}
