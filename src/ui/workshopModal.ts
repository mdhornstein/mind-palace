import { StateManager } from '../core/state';
import { ModalOverlay } from './overlay';
import { aiService } from '../ai/mockAI';

export function openWorkshopModal(stateManager: StateManager) {
  const overlay = ModalOverlay.getInstance();
  const state = stateManager.getState();
  const project = state.projects[0];

  const pct = Math.floor(project.progress * 100);
  const isDone = project.status === 'completed';

  const modalHtml = `
    <div class="modal-dialog">
      <div class="modal-header">
        <div>
          <h2>${project.name}</h2>
          <div class="subtitle">${project.subtitle}</div>
        </div>
        <button class="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
          <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: ${isDone ? '#34d399' : '#38bdf8'}; font-weight: 600;">
            Status: ${isDone ? 'Simulation Complete' : 'Mesh Convergence Study Running'}
          </span>
          <span style="font-family: monospace; font-size: 0.88rem; color: var(--text-primary); font-weight: bold;">
            ${pct}%
          </span>
        </div>

        <div class="fea-metric-bar">
          <div class="fea-metric-fill ${isDone ? 'completed' : ''}" style="width: ${pct}%;"></div>
        </div>

        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
          ${project.description}
        </p>

        <!-- Tutor Interactive Training Prompt -->
        <div class="tutor-prompt-box">
          <div class="tutor-label">Interactive Scientific Training &bull; Tutor Inquiry</div>
          <div class="tutor-question">
            "${project.trainingPrompt.question}"
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 6px;">
            ${project.trainingPrompt.context}
          </div>

          <textarea
            class="tutor-input"
            id="tutor-answer-input"
            placeholder="Type your hypothesis or technical reasoning here..."
          >${project.lastEvaluation ? project.lastEvaluation.userAnswer : ''}</textarea>

          <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            <button class="btn-primary" id="btn-submit-hypothesis">
              Submit Hypothesis to Tutor &rarr;
            </button>
          </div>

          <div id="evaluation-container">
            ${
              project.lastEvaluation
                ? `
              <div class="evaluation-result">
                <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #6ee7b7; font-weight: 600; margin-bottom: 4px;">
                  Previous Assessment
                </div>
                <div style="font-size: 0.9rem; color: #f0fdf4; line-height: 1.5;">
                  ${project.lastEvaluation.evaluationText}
                </div>
              </div>
            `
                : ''
            }
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary btn-close-modal">Leave Workstation</button>
      </div>
    </div>
  `;

  overlay.open(modalHtml);

  const submitBtn = overlay.getElement().querySelector('#btn-submit-hypothesis');
  const answerInput = overlay.getElement().querySelector('#tutor-answer-input') as HTMLTextAreaElement;
  const evalContainer = overlay.getElement().querySelector('#evaluation-container');

  if (submitBtn && answerInput && evalContainer) {
    submitBtn.addEventListener('click', async () => {
      const answer = answerInput.value.trim();
      if (!answer) {
        answerInput.focus();
        return;
      }

      submitBtn.textContent = 'Evaluating...';
      (submitBtn as HTMLButtonElement).disabled = true;

      const evalResponse = await aiService.teach(project.id, answer, stateManager.getState());

      stateManager.updateProjectEvaluation(
        project.id,
        answer,
        `${evalResponse.feedbackTitle}: ${evalResponse.critique}`
      );

      evalContainer.innerHTML = `
        <div class="evaluation-result ${evalResponse.assessment}">
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: #6ee7b7; font-weight: 600; margin-bottom: 4px;">
            ${evalResponse.feedbackTitle}
          </div>
          <div style="font-size: 0.9rem; color: #f0fdf4; line-height: 1.5; margin-bottom: 8px;">
            ${evalResponse.critique}
          </div>
          <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.5; background: rgba(0,0,0,0.25); padding: 8px; border-radius: 4px; margin-bottom: 8px;">
            <strong>Biomechanical Insight:</strong> ${evalResponse.biomechanicalInsight}
          </div>
          <div style="font-size: 0.82rem; color: #93c5fd; font-style: italic;">
            <strong>Follow-up:</strong> ${evalResponse.followUpQuestion}
          </div>
        </div>
      `;

      submitBtn.textContent = 'Re-submit Hypothesis';
      (submitBtn as HTMLButtonElement).disabled = false;
    });
  }
}
