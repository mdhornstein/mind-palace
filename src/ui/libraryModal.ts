import { StateManager } from '../core/state';
import { ModalOverlay } from './overlay';
import { aiService } from '../ai/mockAI';

export function openLibraryModal(stateManager: StateManager) {
  const overlay = ModalOverlay.getInstance();
  const state = stateManager.getState();
  const memories = state.memories;

  const renderBookSelection = () => {
    return `
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <h2>The Library</h2>
            <div class="subtitle">Personal Bookshelf & Memory Archive</div>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 16px; color: var(--text-muted); font-style: italic;">
            Leather-bound spines and familiar dog-eared volumes rest along the walnut shelves.
          </p>

          <div class="specimen-grid">
            ${memories
              .map(
                (mem) => `
              <div class="specimen-card" data-mem-id="${mem.id}">
                <div>
                  <div style="font-family: Georgia, serif; font-size: 1.05rem; color: #fef08a; font-weight: 500;">
                    ${mem.subtitle || mem.title}
                  </div>
                  <div style="font-size: 0.8rem; color: var(--accent-gold); margin-top: 3px;">
                    ${mem.date} &bull; ${mem.title}
                  </div>
                  <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 5px;">
                    "${mem.snippet}"
                  </div>
                </div>
                <button class="btn-secondary" style="white-space: nowrap; margin-left: 12px;">
                  Open &rarr;
                </button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary btn-close-modal">Leave Bookshelf</button>
        </div>
      </div>
    `;
  };

  overlay.open(renderBookSelection());

  const attachBookClickListeners = () => {
    const cards = overlay.getElement().querySelectorAll('.specimen-card');
    cards.forEach((card) => {
      card.addEventListener('click', async () => {
        const memId = card.getAttribute('data-mem-id');
        if (memId) {
          await openMemoryDetail(memId);
        }
      });
    });
  };

  const openMemoryDetail = async (memoryId: string) => {
    // Call AI Service remember encounter
    const encounter = await aiService.remember(memoryId, stateManager.getState());
    // Mark memory recalled in world state
    stateManager.unlockMemory(memoryId);

    const memory = encounter.memory;

    const detailHtml = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <h2>${memory.subtitle || memory.title}</h2>
            <div class="subtitle">${memory.date} &bull; Personal Memory</div>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="memory-card">
            <div class="memory-date">${memory.date} &bull; Memory Encounter</div>
            <div class="memory-title">${memory.title}</div>
            
            ${memory.fullContent
              .map(
                (p) => `
              <p style="margin-bottom: 10px; line-height: 1.6;">${p}</p>
            `
              )
              .join('')}

            ${
              encounter.companionThought
                ? `
              <div class="memory-reflection">
                <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #93c5fd; margin-bottom: 4px;">
                  Companion's Observation
                </div>
                "${encounter.companionThought}"
              </div>
            `
                : ''
            }
          </div>

          <div style="margin-top: 12px; font-size: 0.82rem; color: var(--text-muted);">
            ✨ <em>This book now rests open on the rug near the reading chair.</em>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="btn-back-to-shelf">&larr; Back to Bookshelf</button>
          <button class="btn-primary btn-close-modal">Close</button>
        </div>
      </div>
    `;

    overlay.open(detailHtml);

    const backBtn = overlay.getElement().querySelector('#btn-back-to-shelf');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        overlay.open(renderBookSelection());
        attachBookClickListeners();
      });
    }
  };

  attachBookClickListeners();
}
