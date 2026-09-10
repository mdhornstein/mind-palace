import { ESCHER_ARTWORKS, EscherArtItem } from '../rooms/escher/artworks';
import { RoomVariantManager } from '../rooms/variants/roomVariantManager';
import { ModalOverlay } from './overlay';

// =============================================================================
// CURATORIAL ARTWORK VIEWER MODAL
// =============================================================================

export function openEscherArtworkModal(artworkId: string): void {
  const overlay = ModalOverlay.getInstance();
  const art: EscherArtItem | undefined = ESCHER_ARTWORKS[artworkId];

  if (!art) {
    console.warn(`[escherArtModal] Artwork '${artworkId}' not found in catalog.`);
    return;
  }

  let loupeActive = false;

  const renderContent = () => `
    <div class="modal-dialog" style="max-width: 820px;">
      <div class="modal-header">
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.12em; color: ${art.visualTheme.accentColor}; font-weight: 700;">
              Gallery Curatorial Catalog
            </span>
            <span style="color: var(--text-muted); font-size: 0.8rem;">•</span>
            <span style="color: var(--text-muted); font-size: 0.8rem; font-family: monospace;">${art.catalogRef}</span>
          </div>
          <h2>${art.title} <span style="font-size: 1.1rem; color: var(--text-muted); font-weight: normal; font-style: italic;">(${art.dutchTitle}, ${art.year})</span></h2>
        </div>
        <button class="modal-close-btn" aria-label="Close modal">&times;</button>
      </div>

      <div class="modal-body" style="user-select: text;">
        <!-- Upper Grid: Framed Masterwork Presentation -->
        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 20px; margin-bottom: 20px;">
          <!-- Framed Artwork Canvas Preview -->
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">
            <div id="art-frame-container" style="
              position: relative;
              padding: 14px;
              background: #271a0c;
              border: 3px solid #b45309;
              border-radius: 6px;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(0,0,0,0.8);
              cursor: crosshair;
            ">
              <!-- Picture Lamp glow -->
              <div style="
                position: absolute;
                top: -12px;
                left: 50%;
                transform: translateX(-50%);
                width: 60px;
                height: 6px;
                background: #d97706;
                border-radius: 3px;
                box-shadow: 0 0 12px #f59e0b;
              "></div>

              <canvas id="artwork-canvas" width="240" height="240" style="
                display: block;
                background: #fbf7ee;
                border: 1px solid #78350f;
                border-radius: 2px;
                image-rendering: pixelated;
              "></canvas>

              <div id="loupe-lens" style="
                display: ${loupeActive ? 'block' : 'none'};
                position: absolute;
                width: 90px;
                height: 90px;
                border: 2px solid ${art.visualTheme.accentColor};
                border-radius: 50%;
                pointer-events: none;
                box-shadow: 0 0 16px rgba(0,0,0,0.6), inset 0 0 8px rgba(255,255,255,0.4);
                transform: translate(-50%, -50%);
                backdrop-filter: brightness(1.2);
              "></div>
            </div>

            <!-- Loupe Zoom Control -->
            <button id="btn-toggle-loupe" class="btn btn-secondary" style="
              margin-top: 10px;
              font-size: 0.78rem;
              padding: 4px 12px;
              border-color: ${loupeActive ? art.visualTheme.accentColor : 'var(--border-color)'};
              color: ${loupeActive ? art.visualTheme.accentColor : 'var(--text-color)'};
            ">
              🔍 Curator's Loupe: ${loupeActive ? 'ON' : 'OFF'}
            </button>

            <!-- Physical Specs Plaque -->
            <div style="
              margin-top: 12px;
              width: 100%;
              background: #0f172a;
              border: 1px solid #1e293b;
              border-radius: 6px;
              padding: 10px;
              font-size: 0.78rem;
              line-height: 1.4;
            ">
              <div style="color: var(--text-muted); margin-bottom: 4px;"><strong>Medium:</strong> ${art.medium}</div>
              <div style="color: var(--text-muted);"><strong>Dimensions:</strong> ${art.dimensions}</div>
            </div>
          </div>

          <!-- Curatorial Text & Mathematical Insight -->
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <!-- Curatorial Overview -->
            <div>
              <h4 style="color: #f8fafc; margin-bottom: 6px; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.06em;">
                Curatorial Analysis
              </h4>
              <p style="color: var(--text-color); font-size: 0.92rem; line-height: 1.6; margin: 0;">
                ${art.description}
              </p>
            </div>

            <!-- Mathematical & Conceptual Secret -->
            <div style="
              background: #090d16;
              border-left: 3px solid ${art.visualTheme.accentColor};
              border-radius: 0 6px 6px 0;
              padding: 12px 16px;
            ">
              <div style="font-weight: 600; font-size: 0.88rem; color: ${art.visualTheme.accentColor}; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <span>📐</span> Mathematical & Topological Structure
              </div>
              <p style="color: #cbd5e1; font-size: 0.88rem; line-height: 1.55; margin: 0;">
                ${art.mathematicalSecret}
              </p>
            </div>

            <!-- Escher's Own Words -->
            <div style="
              background: rgba(255, 255, 255, 0.02);
              border-radius: 6px;
              padding: 12px 14px;
              border: 1px dashed #334155;
            ">
              <div style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 4px;">
                M.C. Escher's Notes
              </div>
              <blockquote style="margin: 0; font-style: italic; color: #fef08a; font-size: 0.9rem; line-height: 1.5; font-family: Georgia, serif;">
                ${art.escherQuote}
              </blockquote>
            </div>

            <!-- Tags -->
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px;">
              ${art.tags
                .map(
                  (tag) => `
                <span style="
                  background: #1e293b;
                  color: #94a3b8;
                  border: 1px solid #334155;
                  border-radius: 12px;
                  padding: 2px 10px;
                  font-size: 0.75rem;
                ">${tag}</span>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          All curatorial text is selectable and copy-pasteable.
        </div>
        <button class="btn btn-primary btn-close-modal">Dismiss Plaque</button>
      </div>
    </div>
  `;

  overlay.open(renderContent());

  // Render the high-res canvas reproduction
  const canvas = document.getElementById('artwork-canvas') as HTMLCanvasElement | null;
  if (canvas) {
    drawArtworkDetail(canvas, artworkId);
  }

  // Attach loupe zoom toggle
  const toggleBtn = document.getElementById('btn-toggle-loupe');
  const frameContainer = document.getElementById('art-frame-container');
  const lens = document.getElementById('loupe-lens');

  if (toggleBtn && frameContainer && lens) {
    toggleBtn.addEventListener('click', () => {
      loupeActive = !loupeActive;
      lens.style.display = loupeActive ? 'block' : 'none';
      toggleBtn.textContent = `🔍 Curator's Loupe: ${loupeActive ? 'ON' : 'OFF'}`;
      toggleBtn.style.borderColor = loupeActive ? art.visualTheme.accentColor : 'var(--border-color)';
      toggleBtn.style.color = loupeActive ? art.visualTheme.accentColor : 'var(--text-color)';
    });

    frameContainer.addEventListener('mousemove', (e) => {
      if (!loupeActive || !canvas) return;
      const rect = frameContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      lens.style.left = `${mouseX}px`;
      lens.style.top = `${mouseY}px`;
    });
  }
}

/**
 * Draw a rich, authentic lithographic reproduction for the modal canvas.
 */
function drawArtworkDetail(canvas: HTMLCanvasElement, artworkId: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  // Cream handmade paper ground
  ctx.fillStyle = '#f8f4eb';
  ctx.fillRect(0, 0, w, h);

  // Deckle paper texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * w;
    const ry = Math.random() * h;
    ctx.fillRect(rx, ry, 1, 1);
  }

  if (artworkId === 'print_gallery') {
    // 1. PRINT GALLERY: Logarithmic spiral loop with Maltese rooftops and central blank spot
    ctx.strokeStyle = '#181411';
    ctx.lineWidth = 2.5;

    // Outer framing arch of the gallery window
    ctx.beginPath();
    ctx.arc(cx, cy, 105, 0, Math.PI * 2);
    ctx.stroke();

    // Logarithmic grid warp lines radiating clockwise
    ctx.lineWidth = 1.2;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 35, cy + Math.sin(angle) * 35);
      const endR = 95;
      const bend = angle + 0.8;
      ctx.quadraticCurveTo(
        cx + Math.cos(bend) * 65,
        cy + Math.sin(bend) * 65,
        cx + Math.cos(angle + 1.2) * endR,
        cy + Math.sin(angle + 1.2) * endR
      );
      ctx.stroke();
    }

    // Maltese townhouse facades (lower left)
    ctx.fillStyle = '#d97706';
    ctx.fillRect(24, cy + 10, 48, 40); // terracotta townhouse
    ctx.fillStyle = '#b45309';
    ctx.fillRect(20, cy + 8, 56, 8); // roof
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(34, cy + 24, 12, 18); // arch doorway

    // Quayside & harbor water
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(10, cy + 55, 75, 45);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(25, cy + 70, 20, 2); // wave crest

    // Upper Gallery Roof & Vaults (top right)
    ctx.fillStyle = '#451a03';
    ctx.fillRect(cx, 16, 95, 30);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cx + 20, 22, 28, 18); // clerestory window

    // The Curly-Haired Observer (lower right arcade)
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(cx + 35, cy + 20, 22, 45); // frock coat
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(cx + 42, cy + 8, 10, 10); // face
    ctx.fillStyle = '#451a03';
    ctx.fillRect(cx + 40, cy + 5, 14, 6); // curly hair

    // Central Singularity Circle (Escher's blank spot)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MCE', cx, cy - 2);

    ctx.font = '7px -apple-system, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('1956', cx, cy + 12);
  } else if (artworkId === 'relativity') {
    // 2. RELATIVITY: Three orthogonal staircases with anonymous figures
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2;

    // Center impossible triangular stair hub
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      // Horizontal staircase
      ctx.fillStyle = i % 2 === 0 ? '#44403c' : '#78716c';
      ctx.fillRect(40 + i * 16, cy - 20, 16, 6);
      // Descending staircase
      ctx.fillRect(cx + 10, 30 + i * 16, 12, 16);
      // Inverted staircase
      ctx.fillRect(160 - i * 14, cy + 20 + i * 8, 14, 8);
    }

    // Isometric gravity reference lines
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, 15);
    ctx.lineTo(cx, h - 15);
    ctx.moveTo(15, cy);
    ctx.lineTo(w - 15, cy);
    ctx.stroke();

    // Faceless mechanical figures
    ctx.fillStyle = '#0c0a09';
    // Figure 1 (gravity down)
    ctx.fillRect(cx - 30, cy - 35, 10, 16);
    ctx.beginPath();
    ctx.arc(cx - 25, cy - 40, 5, 0, Math.PI * 2);
    ctx.fill();

    // Figure 2 (gravity right)
    ctx.fillRect(cx + 25, 60, 16, 10);
    ctx.beginPath();
    ctx.arc(cx + 45, 65, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (artworkId === 'metamorphosis_ii') {
    // 3. METAMORPHOSIS II: Continuous morphing banner
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('METAMORPHOSE', 15, 45);

    // Checkerboard dissolution
    const cols = 8;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(20 + c * 14, 70 + r * 14, 14, 14);
        }
      }
    }

    // Hexagonal bees / reptiles morphing
    ctx.fillStyle = '#10b981';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(150 + i * 18, 100, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Clifftop town of Atrani silhouette
    ctx.fillStyle = '#b45309';
    ctx.fillRect(140, 150, 75, 40);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(165, 130, 25, 60); // church tower
    ctx.fillRect(195, 160, 20, 30);
  } else if (artworkId === 'drawing_hands') {
    // 4. DRAWING HANDS: Two hands drawing each other
    ctx.fillStyle = '#fed7aa';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;

    // Left hand holding pencil drawing right cuff
    ctx.beginPath();
    ctx.ellipse(cx - 35, cy, 32, 20, Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right hand holding pencil drawing left cuff
    ctx.beginPath();
    ctx.ellipse(cx + 35, cy, 32, 20, -Math.PI * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Drafting pencils
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    // Left pencil
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 10);
    ctx.lineTo(cx + 25, cy + 15);
    ctx.stroke();

    // Right pencil
    ctx.beginPath();
    ctx.moveTo(cx + 20, cy - 10);
    ctx.lineTo(cx - 25, cy + 15);
    ctx.stroke();

    // Paper thumbtacks
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(20, 20, 4, 0, Math.PI * 2);
    ctx.arc(w - 20, 20, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (artworkId === 'belvedere') {
    // 5. BELVEDERE: Impossible columned pavilion
    ctx.strokeStyle = '#1e1b18';
    ctx.lineWidth = 2;

    // Lower floor plinth
    ctx.fillStyle = '#a8a29e';
    ctx.fillRect(35, h - 60, w - 70, 25);

    // Upper terrace
    ctx.fillRect(35, 55, w - 70, 20);

    // Impossible crossing pillars
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#44403c';
    // Back pillar connecting to front terrace
    ctx.beginPath();
    ctx.moveTo(60, h - 60);
    ctx.lineTo(100, 75);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w - 60, h - 60);
    ctx.lineTo(w - 100, 75);
    ctx.stroke();

    // Seated youth holding impossible cube
    ctx.fillStyle = '#7c3aed';
    ctx.fillRect(cx - 15, h - 95, 30, 35);
    // Wireframe impossible cube in hands
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 8, h - 115, 16, 16);
  } else if (artworkId === 'day_and_night') {
    // 6. DAY AND NIGHT: Dutch polder bisected by river, interlocking birds
    // Daylight sky (left)
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(0, 0, cx, h);

    // Night sky (right)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx, 0, cx, h);

    // Winding river in center
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(cx - 10, h);
    ctx.quadraticCurveTo(cx - 25, cy + 40, cx, cy);
    ctx.quadraticCurveTo(cx + 25, cy - 40, cx + 5, 0);
    ctx.lineTo(cx + 20, 0);
    ctx.quadraticCurveTo(cx + 40, cy - 40, cx + 15, cy);
    ctx.quadraticCurveTo(cx - 10, cy + 40, cx + 5, h);
    ctx.closePath();
    ctx.fill();

    // Interlocking birds
    // White birds flying right into the night
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(cx + 20 + i * 16, 40 + i * 22, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    // Black birds flying left into the day
    ctx.fillStyle = '#090d16';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(cx - 20 - i * 16, 40 + i * 22, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (artworkId === 'printmaker_folio') {
    // 7. PRINTMAKER'S FOLIO: Deckle-edged proofs on oak rack
    ctx.fillStyle = '#451a03';
    ctx.fillRect(35, h - 50, w - 70, 20); // rack base
    ctx.fillRect(50, 45, 14, h - 90); // rack left post
    ctx.fillRect(w - 64, 45, 14, h - 90); // rack right post

    // Stack of tilted lithograph sheets
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#fef3c7' : '#f5e6d3';
      ctx.fillRect(65 + i * 14, 55 + i * 8, 90, 110);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.strokeRect(65 + i * 14, 55 + i * 8, 90, 110);
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = 'italic 10px Georgia, serif';
    ctx.fillText('Coxeter Hyperbolic Grid Pull #2', 75, 140);
  }
}

// =============================================================================
// IN-WORLD CHRONO-SPATIAL PARADOX DIAL MODAL
// =============================================================================

export function openRoomVariantModal(roomId: string = 'escher'): void {
  const overlay = ModalOverlay.getInstance();
  if (!RoomVariantManager.hasVariants(roomId)) return;

  const activeVariant = RoomVariantManager.getActiveVariantId(roomId);
  const variants = RoomVariantManager.getAllVariantsMeta(roomId);
  const roomTitle = roomId.charAt(0).toUpperCase() + roomId.slice(1);

  const renderContent = () => `
    <div class="modal-dialog" style="max-width: 620px;">
      <div class="modal-header">
        <div>
          <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.12em; color: #f59e0b; font-weight: 700; margin-bottom: 4px;">
            Chrono-Spatial Prototype Selector
          </div>
          <h2>Select ${roomTitle} Prototype Chamber</h2>
        </div>
        <button class="modal-close-btn" aria-label="Close modal">&times;</button>
      </div>

      <div class="modal-body">
        <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 16px;">
          Shift between distinct architectural prototypes for the ${roomTitle} chamber.
          All prototypes remain active in parallel, preserved without losing any code or geometry.
        </p>

        <!-- Variant Selection Cards -->
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
          ${variants
            .map((v) => {
              const isSelected = v.id === activeVariant;
              const accentCol = isSelected ? '#f59e0b' : '#38bdf8';

              return `
              <div class="escher-variant-card" data-variant-id="${v.id}" style="
                display: grid;
                grid-template-columns: 50px 1fr auto;
                gap: 14px;
                align-items: center;
                background: ${isSelected ? 'rgba(30, 41, 59, 0.7)' : '#090d16'};
                border: 2px solid ${isSelected ? accentCol : '#1e293b'};
                border-radius: 8px;
                padding: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
              ">
                <div style="
                  font-size: 1.8rem;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  ${v.icon ?? '🏛️'}
                </div>

                <div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px;">
                    <strong style="color: ${isSelected ? accentCol : '#f8fafc'}; font-size: 1rem;">
                      ${v.label}
                    </strong>
                    ${v.year ? `
                    <span style="
                      background: ${isSelected ? accentCol : '#334155'};
                      color: ${isSelected ? '#0f172a' : '#94a3b8'};
                      border-radius: 10px;
                      padding: 1px 7px;
                      font-size: 0.72rem;
                      font-weight: 700;
                    ">
                      ${v.year}
                    </span>` : ''}
                    ${isSelected ? `<span style="color: #22c55e; font-size: 0.75rem; font-weight: 600;">● Active</span>` : ''}
                  </div>
                  <div style="color: var(--text-muted); font-size: 0.82rem; line-height: 1.4;">
                    ${v.description}
                  </div>
                </div>

                <div>
                  <button class="btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-switch-variant" data-target-variant="${v.id}" style="
                    font-size: 0.82rem;
                    padding: 6px 14px;
                    border-color: ${isSelected ? accentCol : 'var(--border-color)'};
                  ">
                    ${isSelected ? 'Active' : 'Switch'}
                  </button>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>

      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          Your prototype choice is saved to local storage.
        </div>
        <button class="btn btn-secondary btn-close-modal">Leave Unchanged</button>
      </div>
    </div>
  `;

  overlay.open(renderContent());

  // Attach card click handlers
  const cards = overlay.getElement().querySelectorAll('.escher-variant-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const targetId = card.getAttribute('data-variant-id');
      if (targetId && targetId !== activeVariant) {
        RoomVariantManager.setActiveVariantId(roomId, targetId);
        overlay.close();
      }
    });
  });
}

export const openEscherVariantDialModal = () => openRoomVariantModal('escher');
