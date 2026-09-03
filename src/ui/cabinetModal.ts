import { StateManager } from '../core/state';
import { ModalOverlay } from './overlay';
import { aiService } from '../ai/mockAI';

export function openCabinetModal(stateManager: StateManager, initialSpecimenId?: string) {
  const overlay = ModalOverlay.getInstance();
  const state = stateManager.getState();
  const specimens = state.specimens;

  const renderSpecimenList = () => {
    return `
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <h2>The Fossil Cabinet</h2>
            <div class="subtitle">Curiosity Engine & Paleontology Collection</div>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 14px; color: var(--text-muted); font-style: italic;">
            Illuminated glass shelves hold mineralized bone, dental batteries, and cranial domes.
          </p>

          <div class="specimen-grid">
            ${specimens
              .map(
                (s) => `
              <div class="specimen-card ${!s.discovered ? 'highlight' : ''}" data-spec-id="${s.id}">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-family: Georgia, serif; font-size: 1.05rem; color: #fef08a; font-weight: 500;">
                      ${s.name}
                    </span>
                    ${
                      !s.discovered
                        ? `<span style="font-size: 0.7rem; background: #b45309; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold; letter-spacing: 0.5px;">✨ NEW DISCOVERY</span>`
                        : s.onPedestal
                        ? `<span style="font-size: 0.7rem; background: #1e3a8a; color: #93c5fd; padding: 2px 6px; border-radius: 4px;">ON PEDESTAL</span>`
                        : ''
                    }
                  </div>
                  <div style="font-size: 0.78rem; color: var(--accent-gold); margin-top: 3px;">
                    ${s.period} &bull; ${s.region}
                  </div>
                  <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">
                    ${s.classification}
                  </div>
                </div>
                <button class="btn-secondary" style="white-space: nowrap; margin-left: 10px;">
                  Explore &rarr;
                </button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary btn-close-modal">Leave Cabinet</button>
        </div>
      </div>
    `;
  };

  const openSpecimenDetail = async (specimenId: string, activeTopicId?: string) => {
    // Mark discovered in state manager
    stateManager.discoverSpecimen(specimenId);

    const spec = stateManager.getState().specimens.find((s) => s.id === specimenId)!;
    const topicId = activeTopicId || spec.topics[0]?.id || 'morph';

    const encounter = await aiService.discover(specimenId, topicId, stateManager.getState());

    const detailHtml = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <h2>${spec.scientificName}</h2>
            <div class="subtitle">${spec.classification} &bull; ${spec.period}</div>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 14px; font-size: 0.92rem; color: #e2e8f0; line-height: 1.6;">
            ${spec.description}
          </p>

          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-gold); font-weight: 600; margin-bottom: 8px;">
            Investigate Lines of Inquiry:
          </div>

          <div class="topic-pills">
            ${spec.topics
              .map(
                (t) => `
              <button class="topic-pill ${t.id === topicId ? 'active' : ''}" data-topic-id="${t.id}">
                ${t.label}
              </button>
            `
              )
              .join('')}
          </div>

          <!-- Active Topic Content -->
          <div style="background: #18120e; border: 1px solid #3d2719; border-radius: 6px; padding: 14px; margin-top: 12px;">
            <div style="font-family: Georgia, serif; font-size: 1.05rem; color: #fef08a; margin-bottom: 6px;">
              ${encounter.topic.label}
            </div>
            <div style="font-size: 0.9rem; color: #f1f5f9; line-height: 1.6;">
              ${encounter.topic.content}
            </div>

            <div class="memory-reflection" style="margin-top: 12px; border-left-color: #f59e0b;">
              <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #fbbf24; margin-bottom: 4px;">
                Companion's Reflection
              </div>
              "${encounter.companionReaction}"
            </div>
          </div>

          ${
            spec.id === 'spec_prenocephale' && !spec.onPedestal
              ? `
            <div style="margin-top: 14px; font-size: 0.82rem; color: #93c5fd; font-style: italic;">
              ✨ <em>You have examined this rare specimen. If you return on a future visit, it may find its way onto the display pedestal for closer study.</em>
            </div>
          `
              : ''
          }
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" id="btn-back-to-cabinet">&larr; Back to Cabinet</button>
          <button class="btn-primary btn-close-modal">Close</button>
        </div>
      </div>
    `;

    overlay.open(detailHtml);

    const backBtn = overlay.getElement().querySelector('#btn-back-to-cabinet');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        overlay.open(renderSpecimenList());
        attachCardListeners();
      });
    }

    const topicButtons = overlay.getElement().querySelectorAll('.topic-pill');
    topicButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextTopicId = btn.getAttribute('data-topic-id');
        if (nextTopicId) {
          openSpecimenDetail(specimenId, nextTopicId);
        }
      });
    });
  };

  const attachCardListeners = () => {
    const cards = overlay.getElement().querySelectorAll('.specimen-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const specId = card.getAttribute('data-spec-id');
        if (specId) {
          openSpecimenDetail(specId);
        }
      });
    });
  };

  if (initialSpecimenId) {
    openSpecimenDetail(initialSpecimenId);
  } else {
    overlay.open(renderSpecimenList());
    attachCardListeners();
  }
}
