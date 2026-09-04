import { ModalOverlay } from './overlay';
import { Duckephant } from '../entities/duckephant';

export function openDuckephantModal(duckephant: Duckephant) {
  const overlay = ModalOverlay.getInstance();

  const content = `
    <div class="modal-dialog" style="max-width: 580px;">
      <div class="modal-header">
        <div>
          <h2 style="display: flex; align-items: center; gap: 8px;">
            <span>The Duckephant</span>
            <span style="font-size: 0.72rem; background: #854d0e; color: #fef08a; padding: 2px 8px; border-radius: 12px; font-weight: normal; font-family: monospace;">CHIMERIC FAUNA</span>
          </h2>
          <div class="subtitle">Field Journal &bull; <i>Anas elephas chimaera</i></div>
        </div>
        <button class="modal-close-btn">&times;</button>
      </div>

      <div class="modal-body">
        <div style="display: grid; grid-template-columns: 140px 1fr; gap: 18px; margin-bottom: 16px;">
          <!-- Animated Pixel Art Vignette -->
          <div style="background: #0f172a; border: 1.5px solid #334155; border-radius: 8px; padding: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 2px 8px rgba(0,0,0,0.6);">
            <canvas id="duckephant-vignette-canvas" width="120" height="100" style="image-rendering: pixelated; width: 120px; height: 100px;"></canvas>
            <div style="font-size: 0.7rem; color: #94a3b8; font-family: monospace; margin-top: 6px;">Barnaby &bull; Age ~3</div>
          </div>

          <!-- Anatomical & Naturalist Description -->
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.88rem; line-height: 1.45;">
            <div style="color: #fde68a; font-family: Georgia, serif; font-size: 1.05rem;">
              "The impossible goose of the savannah."
            </div>
            <p style="color: var(--text-muted); margin: 0;">
              First recorded roosting in the marginalia of Renaissance mnemonic treatises. Possesses the buoyant plumage and webbed propulsion of a waterfowl, joined to the cranium, floppy ears, and prehensile trunk of a miniature proboscidean.
            </p>
            <div style="background: rgba(30, 41, 59, 0.6); border-left: 3px solid #f59e0b; padding: 6px 10px; border-radius: 0 4px 4px 0; font-size: 0.82rem; color: #cbd5e1;">
              <strong>Art of Memory Note:</strong> Bruno and Llull noted that the human mind easily forgets a duck or an elephant alone, but can never erase the image of an elephant that waddles and quacks.
            </div>
          </div>
        </div>

        <!-- Trait Stats Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; font-size: 0.8rem;">
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 8px 10px;">
            <div style="color: #94a3b8; font-size: 0.72rem; text-transform: uppercase;">Dietary Preference</div>
            <div style="color: #f8fafc; font-weight: 600; margin-top: 2px;">Roasted Peanuts & Pondweed</div>
          </div>
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 8px 10px;">
            <div style="color: #94a3b8; font-size: 0.72rem; text-transform: uppercase;">Acoustic Range</div>
            <div style="color: #f8fafc; font-weight: 600; margin-top: 2px;">Brass Trumpet-Quack</div>
          </div>
          <div style="background: #1e293b; border: 1px solid #334155; border-radius: 6px; padding: 8px 10px;">
            <div style="color: #94a3b8; font-size: 0.72rem; text-transform: uppercase;">Hearth Temperament</div>
            <div style="color: #f8fafc; font-weight: 600; margin-top: 2px;">Affectionate & Docile</div>
          </div>
        </div>

        <!-- Interactive Action Bar -->
        <div style="background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button id="btn-pet-duckephant" class="btn-primary" style="display: flex; align-items: center; gap: 6px;">
              <span>🐾</span> Pet Barnaby
            </button>
            <button id="btn-feed-duckephant" class="btn-secondary" style="display: flex; align-items: center; gap: 6px;">
              <span>🥜</span> Offer Roasted Peanut
            </button>
          </div>
          <div id="duckephant-interaction-feedback" style="font-size: 0.82rem; color: #38bdf8; font-style: italic; min-height: 18px;">
            Barnaby sits comfortably on his woven reed mat, gently curling his trunk toward the firelight.
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary btn-close-modal">Leave Hearthside</button>
      </div>
    </div>
  `;

  overlay.open(content);

  // Setup Animated Vignette Canvas Loop
  const vCanvas = document.getElementById('duckephant-vignette-canvas') as HTMLCanvasElement | null;
  let animId: number | null = null;

  if (vCanvas) {
    const vCtx = vCanvas.getContext('2d');
    if (vCtx) {
      vCtx.imageSmoothingEnabled = false;
      const startTime = performance.now();

      const renderVignette = (now: number) => {
        vCtx.clearRect(0, 0, vCanvas.width, vCanvas.height);
        
        // Cozy background gradient with subtle firelight
        const grad = vCtx.createRadialGradient(60, 50, 5, 60, 50, 55);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#090d16');
        vCtx.fillStyle = grad;
        vCtx.fillRect(0, 0, vCanvas.width, vCanvas.height);

        // Draw centered and magnified 2.5x
        vCtx.save();
        vCtx.translate(60, 50);
        vCtx.scale(2.4, 2.4);
        
        // Draw home mat
        duckephant.renderHomeMat(vCtx);
        // Draw duckephant sprite centered at origin
        const origX = duckephant.x;
        const origY = duckephant.y;
        duckephant.x = 0;
        duckephant.y = 0;
        duckephant.render(vCtx, now - startTime);
        duckephant.x = origX;
        duckephant.y = origY;

        vCtx.restore();

        animId = requestAnimationFrame(renderVignette);
      };

      animId = requestAnimationFrame(renderVignette);
    }
  }

  // Setup Interaction Buttons
  const feedbackEl = document.getElementById('duckephant-interaction-feedback');
  const btnPet = document.getElementById('btn-pet-duckephant');
  const btnFeed = document.getElementById('btn-feed-duckephant');

  if (btnPet) {
    btnPet.addEventListener('click', () => {
      duckephant.pet();
      if (feedbackEl) {
        feedbackEl.innerHTML = `Barnaby raises his trunk high in delight and sounds a cheerful trumpet-quack! <span style="color: #f43f5e;">♥ ♥</span>`;
      }
    });
  }

  if (btnFeed) {
    btnFeed.addEventListener('click', () => {
      duckephant.feedPeanut();
      if (feedbackEl) {
        feedbackEl.innerHTML = `Barnaby curls his prehensile trunk around the roasted peanut, crunches it greedily, and waddles in place!`;
      }
    });
  }

  const cleanup = () => {
    if (animId !== null) {
      cancelAnimationFrame(animId);
    }
  };

  const closeBtn = document.querySelector('.modal-close-btn');
  const footerCloseBtn = document.querySelector('.btn-close-modal');
  closeBtn?.addEventListener('click', cleanup);
  footerCloseBtn?.addEventListener('click', cleanup);
}
