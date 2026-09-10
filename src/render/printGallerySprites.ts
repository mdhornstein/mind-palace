import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '../core/constants';
import { pRect } from './sprites';
import { drawSideWallPortal } from './escherSprites';

// =============================================================================
// M.C. ESCHER "PRINT GALLERY" (1956) ARCHITECTURAL SPRITES
// Living spatial recreation of the famous paradoxical lithograph
// =============================================================================



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
/**
 * Render an authentic museum-grade miniature for each specific Escher work
 * featuring archival passe-partout matting, woodcut lithographic tones, and iconic compositions.
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
  // 1. Archival museum passe-partout mount (warm ivory rag board)
  ctx.fillStyle = '#ece6d8';
  ctx.fillRect(x, y, w, h);
  // Beveled window shadow
  ctx.strokeStyle = '#c5bcab';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  // Artwork window inset coordinates
  const ax = x + 3;
  const ay = y + 3;
  const aw = w - 6;
  const ah = h - 6;
  const acx = ax + aw / 2;
  const acy = ay + ah / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(ax, ay, aw, ah);
  ctx.clip();

  if (artId === 'print_gallery') {
    // 1. PRINT GALLERY (1956): Living lithograph with observer, curving harbor & center void
    // Deep warm lithographic ground
    ctx.fillStyle = '#26201a';
    ctx.fillRect(ax, ay, aw, ah);

    // Lower-left: Mediterranean harbor & sunlit villas
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(ax, acy + 2, aw * 0.45, ah * 0.45); // harbor water
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ax + 2, acy + 8, 8, 1); // wave ripple

    // Terracotta roofs and cream stucco buildings curving
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(ax + 2, acy - 6, 12, 10);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(ax, acy - 8, 16, 3); // rooftop

    // Upper-right: Gallery vaulted ceiling and clerestory window
    ctx.fillStyle = '#451a03';
    ctx.fillRect(acx - 2, ay, aw * 0.55, ah * 0.35);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(acx + 4, ay + 2, 8, 6);

    // Lower-right: Young connoisseur in arcade observing print
    ctx.fillStyle = '#141210';
    ctx.fillRect(acx + 4, acy + 1, 10, 16); // frock coat
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(acx + 6, acy - 3, 5, 5); // face
    ctx.fillStyle = '#451a03';
    ctx.fillRect(acx + 5, acy - 5, 7, 3); // curly hair

    // Center: The iconic white circular void (singularity) with delicate spiral hatching
    ctx.fillStyle = '#faf9f6';
    ctx.beginPath();
    ctx.arc(acx, acy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Spiral curves radiating outward from singularity
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.45)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(acx - 2, acy + 1, 14, Math.PI * 0.3, Math.PI * 1.5);
    ctx.stroke();
  } else if (artId === 'relativity') {
    // 2. RELATIVITY (1953): Three orthogonal Cartesian gravities & stair-climbers
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(ax, ay, aw, ah);

    // Stone architectural lintels & archways
    ctx.fillStyle = '#44403c';
    ctx.fillRect(ax + 2, ay + 2, aw - 4, 4);
    ctx.fillRect(ax + 2, ay + ah - 6, aw - 4, 4);

    // Flight 1: Central vertical/diagonal staircase
    for (let s = 0; s < 6; s++) {
      const sx = acx - 10 + s * 3;
      const sy = ay + 4 + s * 4;
      pRect(ctx, sx, sy, 8, 3, '#78716c');
      pRect(ctx, sx + 1, sy, 6, 1, '#d6d3d1'); // step tread highlight
      pRect(ctx, sx, sy + 2, 8, 1, '#292524'); // riser shadow
    }

    // Flight 2: Transverse right staircase leading into archway
    for (let s = 0; s < 4; s++) {
      const sx = acx + 2 + s * 2;
      const sy = acy + 4 - s * 3;
      pRect(ctx, sx, sy, 6, 2, '#a8a29e');
    }

    // Flight 3: Left descending flight
    for (let s = 0; s < 4; s++) {
      const sx = ax + 2 + s * 2;
      const sy = acy + s * 3;
      pRect(ctx, sx, sy, 6, 2, '#57534e');
    }

    // Miniature faceless gravity walkers (at 90-degree orientations!)
    pRect(ctx, acx - 4, ay + 10, 3, 5, '#e2e8f0'); // upright walker
    pRect(ctx, acx - 3, ay + 8, 2, 2, '#f8fafc');
    pRect(ctx, ax + 5, acy - 4, 5, 3, '#e2e8f0'); // sideways walker on wall
    pRect(ctx, acx + 10, ay + 6, 3, 4, '#e2e8f0'); // walker under arch
  } else if (artId === 'drawing_hands') {
    // 3. DRAWING HANDS (1948): Self-drawing hands on wood drafting board
    ctx.fillStyle = '#3f2010';
    ctx.fillRect(ax, ay, aw, ah);

    // Tilted white drawing sheet pinned to board
    pRect(ctx, ax + 3, ay + 3, aw - 6, ah - 6, '#f8faf5');
    // Metal brass thumbtacks at corners
    pRect(ctx, ax + 4, ay + 4, 2, 2, '#d97706');
    pRect(ctx, ax + aw - 6, ay + 4, 2, 2, '#d97706');
    pRect(ctx, ax + 4, ay + ah - 6, 2, 2, '#d97706');
    pRect(ctx, ax + aw - 6, ay + ah - 6, 2, 2, '#d97706');

    // Left Hand (drawn from paper, holding pencil and drawing right cuff)
    pRect(ctx, ax + 5, acy - 5, 8, 10, '#334155'); // cuff
    pRect(ctx, ax + 7, acy - 4, 5, 8, '#475569');
    pRect(ctx, ax + 13, acy - 4, 7, 7, '#fed7aa'); // hand
    pRect(ctx, ax + 14, acy - 2, 5, 3, '#fca5a5');
    // Wooden pencil
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ax + 17, acy - 1);
    ctx.lineTo(acx + 4, acy + 3);
    ctx.stroke();
    pRect(ctx, acx + 3, acy + 3, 2, 2, '#0f172a'); // graphite lead

    // Right Hand (drawn from paper, holding pencil and drawing left cuff)
    pRect(ctx, ax + aw - 13, acy - 2, 8, 10, '#334155'); // cuff
    pRect(ctx, ax + aw - 12, acy - 1, 5, 8, '#475569');
    pRect(ctx, ax + aw - 20, acy - 1, 7, 7, '#fed7aa'); // hand
    // Pencil
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ax + aw - 18, acy + 2);
    ctx.lineTo(ax + 11, acy + 3);
    ctx.stroke();
    pRect(ctx, ax + 10, acy + 3, 2, 2, '#0f172a'); // lead tip
  } else if (artId === 'metamorphosis_ii') {
    // 4. METAMORPHOSIS II (1940): Checkers -> Reptiles -> Birds -> Atrani town
    ctx.fillStyle = '#f5f0e6';
    ctx.fillRect(ax, ay, aw, ah);

    const segW = Math.floor(aw / 5);

    // Section 1: Black and White Checkers
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        if ((r + c) % 2 === 0) {
          pRect(ctx, ax + c * 3, ay + 4 + r * 3, 3, 3, '#0f172a');
        }
      }
    }

    // Section 2: Hexagonal tessellation morphing into reptiles
    pRect(ctx, ax + segW + 2, acy - 5, 8, 8, '#059669');
    pRect(ctx, ax + segW + 4, acy - 3, 4, 4, '#10b981');
    pRect(ctx, ax + segW + 3, acy + 2, 2, 2, '#047857');

    // Section 3: Honeycomb transforming into interlocking birds
    pRect(ctx, ax + segW * 2 + 2, acy - 6, 8, 4, '#0f172a'); // black bird
    pRect(ctx, ax + segW * 2 + 6, acy - 2, 8, 4, '#ffffff'); // white bird
    ctx.strokeStyle = '#0f172a';
    ctx.strokeRect(ax + segW * 2 + 6, acy - 2, 8, 4);

    // Section 4: Chess pieces & geometric cubes
    pRect(ctx, ax + segW * 3 + 2, ay + ah - 12, 6, 8, '#d97706');
    pRect(ctx, ax + segW * 3 + 4, ay + ah - 14, 2, 4, '#b45309');

    // Section 5: The Italian clifftop town of Atrani
    pRect(ctx, ax + aw - 16, ay + 4, 14, 14, '#e2d9cc'); // town walls
    pRect(ctx, ax + aw - 16, ay + 2, 14, 3, '#b45309'); // terracotta roof
    pRect(ctx, ax + aw - 12, ay - 2, 5, 5, '#78350f'); // Atrani watchtower
    pRect(ctx, ax + aw - 16, ay + ah - 5, 14, 5, '#0284c7'); // Mediterranean sea
  } else if (artId === 'belvedere') {
    // 5. BELVEDERE (1958): Two-story Renaissance loggia with paradoxical columns
    const sky = ctx.createLinearGradient(ax, ay, ax, ay + ah);
    sky.addColorStop(0, '#7dd3fc');
    sky.addColorStop(0.6, '#bae6fd');
    sky.addColorStop(1, '#64748b'); // distant mountain ridge
    ctx.fillStyle = sky;
    ctx.fillRect(ax, ay, aw, ah);

    // Lower stone pavilion arcade (dungeon / vault)
    pRect(ctx, ax + 2, ay + ah - 14, aw - 4, 14, '#44403c');
    // Arched prison grate
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(acx, ay + ah - 4, 6, Math.PI, 0);
    ctx.fill();
    pRect(ctx, acx - 1, ay + ah - 10, 2, 6, '#78716c'); // iron bar

    // Upper open loggia roof & balustrade
    pRect(ctx, ax + 2, ay + 3, aw - 4, 4, '#57534e');
    pRect(ctx, ax + 4, ay + 1, aw - 8, 3, '#78716c');

    // The Impossible Intersecting Pillars
    // Pillar 1: Front-left to back-left
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ax + 8, ay + ah - 14);
    ctx.lineTo(ax + 12, ay + 7);
    ctx.stroke();

    // Pillar 2: Back-right to front-right (crossing in perspective!)
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(ax + aw - 8, ay + ah - 14);
    ctx.lineTo(ax + aw - 14, ay + 7);
    ctx.stroke();

    // Middle pillars
    pRect(ctx, acx - 5, ay + 7, 2, ah - 21, '#e2e8f0');
    pRect(ctx, acx + 3, ay + 7, 2, ah - 21, '#e2e8f0');

    // Seated figure on lower terrace holding the impossible cube
    pRect(ctx, ax + 6, ay + ah - 12, 5, 6, '#d97706'); // clothing
    pRect(ctx, ax + 11, ay + ah - 10, 3, 3, '#ffffff'); // impossible cube
  } else if (artId === 'day_and_night') {
    // 6. DAY AND NIGHT (1938): Split landscape with interlocking black & white birds
    const midX = Math.floor(ax + aw / 2);
    // Left: Sunlit Day Sky
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(ax, ay, midX - ax, ah);
    // Right: Moonlit Night Sky
    ctx.fillStyle = '#090d16';
    ctx.fillRect(midX, ay, ax + aw - midX, ah);

    // Miniature crescent moon in night sky
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(ax + aw - 6, ay + 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(ax + aw - 8, ay + 5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Lower Landscape: Dutch Polder Farmland Grid
    for (let r = 0; r < 4; r++) {
      const py = ay + ah - 12 + r * 3;
      for (let c = 0; c < 8; c++) {
        const px = ax + c * Math.floor(aw / 8);
        const isDay = px < midX;
        const isAlt = (r + c) % 2 === 0;
        if (isDay) {
          ctx.fillStyle = isAlt ? '#65a30d' : '#84cc16'; // day green fields
        } else {
          ctx.fillStyle = isAlt ? '#1e293b' : '#334155'; // night dark fields
        }
        ctx.fillRect(px, py, Math.floor(aw / 8), 3);
      }
    }

    // Interlocking Birds in the sky flying in opposite directions
    // Black birds flying left into the day
    const blackBirds = [
      { x: ax + 6, y: ay + 8 },
      { x: ax + 16, y: ay + 14 },
      { x: ax + 8, y: ay + 18 },
    ];
    ctx.fillStyle = '#0f172a';
    for (const b of blackBirds) {
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x + 5, b.y - 2);
      ctx.lineTo(b.x + 3, b.y);
      ctx.lineTo(b.x + 5, b.y + 2);
      ctx.closePath();
      ctx.fill();
    }

    // White birds flying right into the night
    const whiteBirds = [
      { x: ax + aw - 10, y: ay + 10 },
      { x: ax + aw - 18, y: ay + 15 },
      { x: ax + aw - 12, y: ay + 20 },
    ];
    ctx.fillStyle = '#f8fafc';
    for (const b of whiteBirds) {
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - 5, b.y - 2);
      ctx.lineTo(b.x - 3, b.y);
      ctx.lineTo(b.x - 5, b.y + 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * 1. Static Room Architecture: The Print Gallery living lithograph layout.
 * Lower-right: exhibition arcade with parquet flooring and stone colonnade.
 * Upper-left: Mediterranean cobblestone quay, Maltese stucco houses, sea wall, and water.
 * Center: Circular marble MCE singularity medallion.
 * Top: Rooftops curving into gallery ceiling beams.
 */
/**
 * 1. Static Room Architecture: The Living Paradoxical Architecture of PRENTENTENTOONSTELLING (1956).
 *
 * Paradoxical transition between two worlds:
 * - West / Outside: Sunlit Mediterranean coastal town & ocean harbor.
 *   Deep sapphire harbor water basin, stone bridge, submerged steps, mooring bollards,
 *   moored fishing boat, warm stucco coastal villas with terracotta roofs and green shutters.
 * - East / Inside: Classical European art museum gallery.
 *   Rich French oak parquet flooring, coffered ceiling beams, arched clerestory windows,
 *   classical fluted colonnade pillars, gallery wainscoting.
 * - Center Threshold: THE LIVING PAINTING PARADOX.
 *   The coastal villas and ocean outside the museum blend and warp into a colossal framed
 *   painting inside the museum. The villa roof twists directly into the gallery rafters,
 *   the gilded picture frame dissolves into stone quayside masonry, and the flagstone pavers
 *   seamlessly interweave with the museum oak parquet.
 */
export function drawPrintGalleryBackground(ctx: CanvasRenderingContext2D, timeMs: number) {
  // Base lithographic warm dark ground
  ctx.fillStyle = '#141210';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // ---------------------------------------------------------------------------
  // 1. HARBOR WATER BASIN (Northwest Quadrant: tx < 4, ty < 7, except bridge)
  // ---------------------------------------------------------------------------
  const waterW = 4 * TILE_SIZE; // 128px
  const waterH = 7 * TILE_SIZE; // 224px

  // Deep Mediterranean sapphire harbor water gradient
  const waterGrad = ctx.createLinearGradient(0, 0, waterW, waterH);
  waterGrad.addColorStop(0, '#09182b');
  waterGrad.addColorStop(0.35, '#0e2e4d');
  waterGrad.addColorStop(0.7, '#164e63');
  waterGrad.addColorStop(1, '#0284c7');
  ctx.fillStyle = waterGrad;
  ctx.fillRect(0, 0, waterW, waterH);

  // Animated gentle specular wave ripples
  for (let wy = 12; wy < waterH - 6; wy += 8) {
    const waveShift = Math.sin(timeMs * 0.0018 + wy * 0.4) * 5;
    for (let wx = 6; wx < waterW - 8; wx += 22) {
      const xPos = wx + waveShift;
      if (xPos > 0 && xPos < waterW - 14) {
        ctx.fillStyle = 'rgba(125, 211, 252, 0.35)';
        ctx.fillRect(Math.floor(xPos), wy, 13, 1.5);
        ctx.fillStyle = 'rgba(240, 249, 255, 0.65)';
        ctx.fillRect(Math.floor(xPos) + 3, wy, 4, 1);
      }
    }
  }

  // Quayside submerged stone steps leading into the water (tx = 3, ty = 5..6)
  for (let step = 0; step < 4; step++) {
    const sy = 160 + step * 14;
    pRect(ctx, 96, sy, 32, 6, '#334155');
    pRect(ctx, 96, sy, 32, 2, '#475569');
    pRect(ctx, 96, sy + 4, 32, 2, '#1e293b');
  }

  // Small wooden fishing dinghy moored by the quay steps
  const boatX = 46;
  const boatY = 176;
  const boatBob = Math.sin(timeMs * 0.002) * 1.5;
  // Hull
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.moveTo(boatX, boatY + 8 + boatBob);
  ctx.lineTo(boatX + 6, boatY + 18 + boatBob);
  ctx.lineTo(boatX + 38, boatY + 18 + boatBob);
  ctx.lineTo(boatX + 44, boatY + 8 + boatBob);
  ctx.closePath();
  ctx.fill();
  pRect(ctx, boatX + 2, boatY + 7 + boatBob, 40, 2, '#78350f'); // gunwale
  pRect(ctx, boatX + 16, boatY + 10 + boatBob, 12, 3, '#92400e'); // wooden seat bench
  // Oar resting across bench
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(boatX + 8, boatY + 6 + boatBob);
  ctx.lineTo(boatX + 32, boatY + 15 + boatBob);
  ctx.stroke();
  // Mooring rope tied to quay wall
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(boatX + 42, boatY + 9 + boatBob);
  ctx.quadraticCurveTo(boatX + 60, boatY + 4, 96, 172);
  ctx.stroke();

  // Arched Stone Sea Bridge (over water, y = 108..136)
  const bridgeY = 3.4 * TILE_SIZE;
  pRect(ctx, 0, bridgeY, waterW, 26, '#38332e');
  pRect(ctx, 0, bridgeY, waterW, 4, '#78716c'); // bridge balustrade top rail
  pRect(ctx, 0, bridgeY + 4, waterW, 2, '#1c1917'); // rail shadow

  // Bridge balusters
  for (let bx = 6; bx < waterW - 6; bx += 14) {
    pRect(ctx, bx, bridgeY + 6, 4, 6, '#a8a29e');
    pRect(ctx, bx + 1, bridgeY + 6, 2, 6, '#d6d3d1');
  }

  // Arch opening over the water
  ctx.save();
  // Distant sea horizon visible through the arch opening
  const archGrad = ctx.createLinearGradient(0, bridgeY + 4, 0, bridgeY + 26);
  archGrad.addColorStop(0, '#38bdf8'); // sunlit distant sky
  archGrad.addColorStop(0.6, '#0284c7'); // azure horizon
  archGrad.addColorStop(1, '#075985');
  ctx.fillStyle = archGrad;
  ctx.beginPath();
  ctx.arc(2 * TILE_SIZE, bridgeY + 26, 22, Math.PI, 0);
  ctx.fill();

  // Distant white sailboat silhouette visible through arch
  const sailX = 2 * TILE_SIZE + 4;
  const sailY = bridgeY + 17;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(sailX, sailY - 8);
  ctx.lineTo(sailX + 5, sailY);
  ctx.lineTo(sailX, sailY);
  ctx.closePath();
  ctx.fill();
  pRect(ctx, sailX - 3, sailY, 8, 2, '#0f172a'); // boat hull

  // Wedge-shaped arch voussoirs (radial keystones)
  ctx.strokeStyle = '#57534e';
  ctx.lineWidth = 2;
  for (let a = Math.PI; a <= Math.PI * 2; a += Math.PI / 8) {
    const kx1 = 2 * TILE_SIZE + Math.cos(a) * 22;
    const ky1 = bridgeY + 26 + Math.sin(a) * 22;
    const kx2 = 2 * TILE_SIZE + Math.cos(a) * 27;
    const ky2 = bridgeY + 26 + Math.sin(a) * 27;
    ctx.beginPath();
    ctx.moveTo(kx1, ky1);
    ctx.lineTo(kx2, ky2);
    ctx.stroke();
  }
  ctx.restore();

  // Harbor Quay Wall border (coping stones along column 4 and row 7)
  pRect(ctx, waterW, 0, 14, waterH + 14, '#26221f');
  pRect(ctx, waterW, 0, 6, waterH + 14, '#6b6357'); // quay capstone highlight
  pRect(ctx, waterW + 10, 0, 4, waterH + 14, '#141210'); // shadow seam
  pRect(ctx, 0, waterH, waterW + 14, 14, '#26221f');
  pRect(ctx, 0, waterH, waterW + 14, 6, '#6b6357');
  pRect(ctx, 0, waterH + 10, waterW + 14, 4, '#141210');

  // Wrought iron mooring bollards along quay
  const bollardPositions = [
    { x: waterW + 3, y: 50 },
    { x: waterW + 3, y: 160 },
    { x: 38, y: waterH + 3 },
    { x: 94, y: waterH + 3 },
  ];
  for (const bp of bollardPositions) {
    pRect(ctx, bp.x, bp.y, 8, 8, '#0c0a09');
    pRect(ctx, bp.x + 1, bp.y + 1, 6, 6, '#38332e');
    pRect(ctx, bp.x + 2, bp.y + 2, 4, 4, '#78716c');
    pRect(ctx, bp.x + 3, bp.y + 3, 2, 2, '#d6d3d1');
  }

  // ---------------------------------------------------------------------------
  // 2. THE FLOOR: OUTSIDE QUAYSIDE FLAGSTONES WARPING INTO MUSEUM PARQUET
  // (No spiral, no central medallion void - open, walkable, seamless transition)
  // ---------------------------------------------------------------------------
  const quayBorderX = waterW + 14;
  const quayBorderY = waterH + 14;
  const floorStartY = 48;

  // A. WEST ZONE: Sunlit Mediterranean Quayside Flagstones (x < 220)
  // Coursed sandstone pavers with weathered joints
  const stoneCourseH = 16;
  for (let fy = floorStartY; fy < CANVAS_HEIGHT; fy += stoneCourseH) {
    const rowIdx = Math.floor((fy - floorStartY) / stoneCourseH);
    const rowOffset = (rowIdx % 2) * 14;

    for (let fx = -14; fx < 224; fx += 28) {
      const px = fx + rowOffset;
      const pw = 28;
      const ph = stoneCourseH;

      // Skip the submerged water basin
      if (px < quayBorderX && fy < quayBorderY) continue;

      // Varied warm Mediterranean sandstone tones
      const hash = Math.abs(Math.sin(rowIdx * 12.9898 + px * 78.233) * 43758.5453);
      const toneChoice = Math.floor(hash * 4) % 4;
      const stoneColors = ['#5e574b', '#6b6355', '#797162', '#524c42'];
      ctx.fillStyle = stoneColors[toneChoice];
      ctx.fillRect(Math.max(0, px), fy, pw, ph);

      // Chiseled mortar joints
      ctx.strokeStyle = '#28241d';
      ctx.lineWidth = 1;
      ctx.strokeRect(Math.max(0, px), fy, pw, ph);

      // Sunlit top bevel highlight
      ctx.fillStyle = 'rgba(254, 243, 199, 0.14)';
      ctx.fillRect(Math.max(0, px) + 1, fy + 1, pw - 2, 1);

      // Natural stone speckle
      if (hash > 0.6) {
        pRect(ctx, Math.max(0, px) + 6, fy + 4, 2, 2, '#857c6d');
        pRect(ctx, Math.max(0, px) + 16, fy + 9, 2, 2, '#38332c');
      }
    }
  }

  // B. EAST ZONE: French Museum Hardwood Parquet (x > 330)
  // Alternating 24x24 basketweave oak parquet blocks
  const parquetBlockSize = 24;
  for (let fy = floorStartY; fy < CANVAS_HEIGHT; fy += parquetBlockSize) {
    const blockRow = Math.floor((fy - floorStartY) / parquetBlockSize);

    for (let fx = 330; fx < CANVAS_WIDTH; fx += parquetBlockSize) {
      const blockCol = Math.floor((fx - 330) / parquetBlockSize);
      const isHorizontal = (blockRow + blockCol) % 2 === 0;

      if (isHorizontal) {
        // 3 horizontal oak planks
        for (let p = 0; p < 3; p++) {
          const py = fy + p * 8;
          const plankTone = p % 2 === 0 ? '#4a250e' : '#572c12';
          ctx.fillStyle = plankTone;
          ctx.fillRect(fx, py, parquetBlockSize, 8);

          // Wood grain streaks
          ctx.fillStyle = 'rgba(255, 237, 213, 0.08)';
          ctx.fillRect(fx + 2, py + 2, parquetBlockSize - 4, 1);
          ctx.fillStyle = '#2a1408';
          ctx.fillRect(fx, py + 7, parquetBlockSize, 1); // dark plank groove
        }
      } else {
        // 3 vertical oak planks
        for (let p = 0; p < 3; p++) {
          const px = fx + p * 8;
          const plankTone = p % 2 === 0 ? '#43210d' : '#512911';
          ctx.fillStyle = plankTone;
          ctx.fillRect(px, fy, 8, parquetBlockSize);

          // Wood grain streaks
          ctx.fillStyle = 'rgba(255, 237, 213, 0.08)';
          ctx.fillRect(px + 2, fy + 2, 1, parquetBlockSize - 4);
          ctx.fillStyle = '#2a1408';
          ctx.fillRect(px + 7, fy, 1, parquetBlockSize); // dark plank groove
        }
      }

      // Parquet block border seam
      ctx.strokeStyle = '#1a0b03';
      ctx.lineWidth = 1;
      ctx.strokeRect(fx, fy, parquetBlockSize, parquetBlockSize);

      // Subtle ambient gallery varnish sheen highlight
      ctx.fillStyle = 'rgba(254, 240, 138, 0.05)';
      ctx.fillRect(fx + 1, fy + 1, parquetBlockSize - 2, 1);
    }
  }

  // C. THE BLEND & WARP THRESHOLD (x: 216..336): Flagstones Interweaving into Parquet
  // Flagstones smoothly curve and dovetail into the polished oak planks
  for (let fy = floorStartY; fy < CANVAS_HEIGHT; fy += 16) {
    const rowIdx = Math.floor((fy - floorStartY) / 16);
    const rowAlternate = rowIdx % 2 === 0;

    // Transition columns fanning across the boundary
    const tStart = rowAlternate ? 220 : 236;
    const tEnd = rowAlternate ? 316 : 332;
    const steps = 5;
    const stepW = (tEnd - tStart) / steps;

    for (let s = 0; s < steps; s++) {
      const sx = tStart + s * stepW;
      const progress = s / (steps - 1); // 0 (stone) to 1 (wood)

      // Color morph from sandstone (#6b6355) through warm timber (#73421e) to dark oak (#4a250e)
      const r = Math.round(107 + progress * (74 - 107));
      const g = Math.round(99 + progress * (37 - 99));
      const b = Math.round(85 + progress * (14 - 85));
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

      // Angled trapezoidal dovetail tile
      ctx.beginPath();
      const slant = (s % 2 === 0 ? 3 : -3);
      ctx.moveTo(sx, fy);
      ctx.lineTo(sx + stepW + slant, fy);
      ctx.lineTo(sx + stepW - slant, fy + 16);
      ctx.lineTo(sx, fy + 16);
      ctx.closePath();
      ctx.fill();

      // Interlocking mortar / grain seam
      ctx.strokeStyle = progress < 0.5 ? '#28241d' : '#1a0b03';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Alternating wood grain or stone speckle
      if (progress >= 0.5) {
        ctx.fillStyle = 'rgba(255, 237, 213, 0.09)';
        ctx.fillRect(sx + 3, fy + 3, stepW - 6, 1);
      } else {
        ctx.fillStyle = 'rgba(254, 243, 199, 0.12)';
        ctx.fillRect(sx + 2, fy + 1, stepW - 4, 1);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 3. NORTH WALL ARCHITECTURE: Mediterranean Villas Warping into Gallery Vault
  // ---------------------------------------------------------------------------
  // Stone cornice base beam
  pRect(ctx, 0, 48, CANVAS_WIDTH, 4, '#38332e');
  pRect(ctx, 0, 50, CANVAS_WIDTH, 2, '#1c1917');

  // Left Section (x: 0..220): Mediterranean Waterfront Coastal Villas
  const villaColors = [
    { stucco: '#ded8cc', trim: '#8c8477', shutter: '#15803d' }, // Villa 1: Cream Stucco
    { stucco: '#d4a373', trim: '#8a5a36', shutter: '#047857' }, // Villa 2: Warm Ochre
    { stucco: '#cbbfa8', trim: '#786e58', shutter: '#166534' }, // Villa 3: Sandstone
    { stucco: '#d98e72', trim: '#9a4e35', shutter: '#0f766e' }, // Villa 4: Terracotta Rose
    { stucco: '#e6dfd3', trim: '#948a7b', shutter: '#15803d' }, // Villa 5: Pale Lime
  ];

  for (let v = 0; v < 5; v++) {
    const vx = v * 44;
    const vw = 42;
    const theme = villaColors[v];

    // Stucco building facade
    pRect(ctx, vx, 14, vw, 34, theme.stucco);

    // Stone corner quoins (alternating blocks)
    for (let qy = 16; qy < 46; qy += 8) {
      pRect(ctx, vx, qy, 4, 4, theme.trim);
      pRect(ctx, vx + vw - 4, qy, 4, 4, theme.trim);
    }

    // Windows with arched stone lintel & wooden shutters
    pRect(ctx, vx + 7, 20, 10, 16, theme.shutter);
    pRect(ctx, vx + 10, 22, 4, 12, '#0c0a09'); // interior window pane
    pRect(ctx, vx + 25, 20, 10, 16, theme.shutter);
    pRect(ctx, vx + 28, 22, 4, 12, '#0c0a09');

    // Flower planter boxes with red geranium blossoms on windowsills
    pRect(ctx, vx + 7, 36, 10, 3, '#78350f');
    pRect(ctx, vx + 25, 36, 10, 3, '#78350f');
    pRect(ctx, vx + 9, 34, 2, 2, '#ef4444');
    pRect(ctx, vx + 13, 34, 2, 2, '#f87171');
    pRect(ctx, vx + 27, 34, 2, 2, '#ef4444');
    pRect(ctx, vx + 31, 34, 2, 2, '#f87171');

    // Terracotta roof slant with Mediterranean pitch
    ctx.fillStyle = '#9a3412';
    ctx.beginPath();
    ctx.moveTo(vx - 2, 14);
    ctx.lineTo(vx + vw / 2, 2);
    ctx.lineTo(vx + vw + 2, 14);
    ctx.closePath();
    ctx.fill();

    // Terracotta tile ridge grooves
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(vx + vw / 2, 2);
    ctx.lineTo(vx + 6, 14);
    ctx.moveTo(vx + vw / 2, 2);
    ctx.lineTo(vx + vw - 6, 14);
    ctx.stroke();

    // Brick chimney on alternate houses
    if (v % 2 === 1) {
      pRect(ctx, vx + vw - 10, 0, 6, 8, '#7c2d12');
      pRect(ctx, vx + vw - 11, 0, 8, 2, '#431407');
      pRect(ctx, vx + vw - 9, -2, 4, 2, '#b45309'); // clay chimney pot
    }
  }

  // ---------------------------------------------------------------------------
  // 4. THE LIVING PAINTING PARADOX & CEILING MORPH (x: 220..350)
  // The townhouses slant, swooping downward, and smoothly morph into the gallery's
  // oak rafters. An ornate gilded museum picture frame rises along the transition,
  // framing the ocean & villas as a painting when viewed from the gallery!
  // ---------------------------------------------------------------------------
  ctx.save();

  // A. Swooping terracotta tile contour morphing into heavy timber beams
  for (let s = 0; s < 7; s++) {
    const t = s / 6;
    const mx = 220 + t * 120;
    const roofY = 3 + t * 8;
    const archY = 14 + t * 24;

    // Gradual color transformation from terracotta (#9a3412) to oak timber (#3f1d0b)
    const morphColor = t < 0.4 ? '#9a3412' : t < 0.7 ? '#652b0f' : '#3f1d0b';
    ctx.fillStyle = morphColor;
    ctx.beginPath();
    ctx.moveTo(mx, roofY);
    ctx.bezierCurveTo(mx + 8, roofY + 6, mx + 12, archY - 4, mx + 14, archY);
    ctx.lineTo(mx + 6, archY + 4);
    ctx.bezierCurveTo(mx + 4, archY - 2, mx - 2, roofY + 8, mx, roofY);
    ctx.closePath();
    ctx.fill();

    // Woodcut/lithographic cross-hatch strokes along the curved twist
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(mx + 2, roofY + 3);
    ctx.lineTo(mx + 10, archY - 2);
    ctx.stroke();
  }

  // B. Grand classical limestone arch rib springing from the villa wall into the gallery
  ctx.strokeStyle = '#a8a29e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(340, 48, 38, Math.PI, Math.PI * 1.5);
  ctx.stroke();

  // C. The Ornate Classical Gilded Museum Frame Border (x ~ 256)
  // Framed along the transition, turning the Mediterranean town into a living painting
  const frameX = 256;

  // Frame outer drop shadow on the gallery side
  pRect(ctx, frameX + 6, 0, 4, 48, 'rgba(0, 0, 0, 0.45)');

  // Baroque carved gilded frame moldings (top to wall)
  pRect(ctx, frameX, 0, 6, 48, '#78350f'); // outer dark bronze shadow
  pRect(ctx, frameX + 1, 0, 4, 48, '#b45309'); // warm gold base
  pRect(ctx, frameX + 2, 0, 2, 48, '#fef08a'); // specular gold leaf highlight
  pRect(ctx, frameX + 4, 0, 2, 48, '#d97706'); // beveled gold inner rim

  // Small engraved brass museum label placard mounted to the frame:
  // "M.C. ESCHER • 1956 • PRENTENTENTOONSTELLING"
  const placardY = 32;
  pRect(ctx, frameX - 16, placardY, 32, 10, '#451a03'); // wooden mount
  pRect(ctx, frameX - 15, placardY + 1, 30, 8, '#d97706'); // brass plate
  pRect(ctx, frameX - 14, placardY + 2, 28, 6, '#fef08a'); // gold polish
  pRect(ctx, frameX - 12, placardY + 4, 24, 2, '#78350f'); // engraved text bar
  ctx.restore();

  // ---------------------------------------------------------------------------
  // 5. RIGHT SECTION (x: 340..640): Grand Exhibition Gallery Vault
  // ---------------------------------------------------------------------------
  for (let tx = 11; tx < 20; tx++) {
    const rx = tx * TILE_SIZE;

    // Heavy coffered oak ceiling beams
    pRect(ctx, rx, 0, 8, 48, '#2a1306');
    pRect(ctx, rx + 1, 0, 3, 48, '#52250d'); // wood grain highlight
    pRect(ctx, rx + 6, 0, 2, 48, '#140902'); // shadow seam

    // High Clerestory Arched Windows letting in diffuse skylight
    if (tx % 2 === 0 && rx < CANVAS_WIDTH - 30) {
      // Arched window frame
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(rx + 18, 18, 12, Math.PI, 0);
      ctx.rect(rx + 6, 18, 24, 24);
      ctx.fill();

      // Sky pane
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(rx + 18, 18, 10, Math.PI, 0);
      ctx.rect(rx + 8, 18, 20, 22);
      ctx.fill();

      // Window mullions (iron cross)
      pRect(ctx, rx + 17, 8, 2, 32, '#1c1917');
      pRect(ctx, rx + 8, 24, 20, 2, '#1c1917');

      // Soft sun wash pouring down from window
      const winGlow = ctx.createLinearGradient(rx + 18, 40, rx + 24, 110);
      winGlow.addColorStop(0, 'rgba(254, 243, 199, 0.18)');
      winGlow.addColorStop(1, 'rgba(254, 243, 199, 0)');
      ctx.fillStyle = winGlow;
      ctx.beginPath();
      ctx.moveTo(rx + 6, 42);
      ctx.lineTo(rx + 30, 42);
      ctx.lineTo(rx + 50, 110);
      ctx.lineTo(rx - 10, 110);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Classical North Wall Archway Pier (Wall-engaged architectural respond at x ~ 344)
  const pierX = 11 * TILE_SIZE - 8; // 344px

  // Wall-engaged limestone pier supporting the vault arch
  pRect(ctx, pierX - 3, 48, 24, 5, '#6e665b'); // capital cornice
  pRect(ctx, pierX - 2, 49, 22, 3, '#aba193'); // carved abacus highlight
  pRect(ctx, pierX, 53, 18, 16, '#8a8174'); // fluted limestone shaft
  pRect(ctx, pierX + 3, 53, 3, 16, '#c4baa9'); // shaft highlight
  pRect(ctx, pierX + 9, 53, 3, 16, '#c4baa9');
  pRect(ctx, pierX + 15, 53, 3, 16, '#5e574c'); // shade
  pRect(ctx, pierX - 2, 69, 22, 4, '#5e574c'); // molded plinth base
  pRect(ctx, pierX - 1, 69, 20, 2, '#8a8174');

  // Arch vault soffit cross-hatching springing from the pier
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let h = 0; h < 4; h++) {
    ctx.moveTo(pierX + 18, 52 + h * 5);
    ctx.lineTo(pierX + 26, 58 + h * 5);
  }
  ctx.stroke();

  // Gallery Wainscoting & Picture Rails along East Wall (x: 608..640)
  pRect(ctx, CANVAS_WIDTH - 32, 52, 32, CANVAS_HEIGHT - 52, '#211710');
  pRect(ctx, CANVAS_WIDTH - 32, 52, 3, CANVAS_HEIGHT - 52, '#52341f'); // molding rail
  pRect(ctx, CANVAS_WIDTH - 32, 52, 32, 4, '#784423'); // picture hanging rail

  // ---------------------------------------------------------------------------
  // 6. EAST DOORWAY PORTAL (Returning to The Study)
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
