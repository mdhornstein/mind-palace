import { StateManager } from '../core/state';
import { ModalOverlay } from './overlay';

export function openOrreryModal(_stateManager: StateManager) {
  const overlay = ModalOverlay.getInstance();

  const renderModal = () => {
    return `
      <div class="modal-dialog" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <h2>Mechanical Clockwork Orrery</h2>
            <div class="subtitle">Heliocentric Planetary Clockwork & Orbital Mechanics</div>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="margin-bottom: 14px; color: var(--text-muted); font-style: italic;">
            Turned brass gears and interlocking differentials drive miniature ivory and lapis lazuli spheres around a polished brass Sun.
          </p>

          <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.78rem; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid #334155; color: #f59e0b; font-family: Georgia, serif;">
                  <th style="padding: 6px;">Planet</th>
                  <th style="padding: 6px;">Semi-Major Axis (a)</th>
                  <th style="padding: 6px;">Orbital Period (P)</th>
                  <th style="padding: 6px;">Eccentricity (e)</th>
                  <th style="padding: 6px;">Mechanical Ratio</th>
                </tr>
              </thead>
              <tbody style="color: #cbd5e1; font-family: monospace;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <td style="padding: 6px; color: #e2e8f0; font-weight: bold;">☿ Mercury</td>
                  <td style="padding: 6px;">0.387 AU</td>
                  <td style="padding: 6px;">87.97 days</td>
                  <td style="padding: 6px;">0.2056</td>
                  <td style="padding: 6px; color: #94a3b8;">83:345 gear train</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <td style="padding: 6px; color: #fef08a; font-weight: bold;">♀ Venus</td>
                  <td style="padding: 6px;">0.723 AU</td>
                  <td style="padding: 6px;">224.70 days</td>
                  <td style="padding: 6px;">0.0068</td>
                  <td style="padding: 6px; color: #94a3b8;">52:84 gear train</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(56, 189, 248, 0.05);">
                  <td style="padding: 6px; color: #38bdf8; font-weight: bold;">♁ Earth & Moon</td>
                  <td style="padding: 6px;">1.000 AU</td>
                  <td style="padding: 6px;">365.25 days</td>
                  <td style="padding: 6px;">0.0167</td>
                  <td style="padding: 6px; color: #94a3b8;">1:1 Master Drive</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <td style="padding: 6px; color: #f87171; font-weight: bold;">♂ Mars</td>
                  <td style="padding: 6px;">1.524 AU</td>
                  <td style="padding: 6px;">686.98 days</td>
                  <td style="padding: 6px;">0.0934</td>
                  <td style="padding: 6px; color: #94a3b8;">151:80 gear train</td>
                </tr>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <td style="padding: 6px; color: #fbbf24; font-weight: bold;">♃ Jupiter</td>
                  <td style="padding: 6px;">5.204 AU</td>
                  <td style="padding: 6px;">11.86 years</td>
                  <td style="padding: 6px;">0.0484</td>
                  <td style="padding: 6px; color: #94a3b8;">166:14 compound</td>
                </tr>
                <tr>
                  <td style="padding: 6px; color: #fde68a; font-weight: bold;">♄ Saturn</td>
                  <td style="padding: 6px;">9.582 AU</td>
                  <td style="padding: 6px;">29.46 years</td>
                  <td style="padding: 6px;">0.0541</td>
                  <td style="padding: 6px; color: #94a3b8;">206:7 compound</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="font-size: 0.8rem; line-height: 1.5; color: #cbd5e1; background: #0b0f19; border: 1px solid #1e293b; border-radius: 6px; padding: 10px 14px;">
            Named after Charles Boyle, 4th Earl of Orrery (1704), these mechanical planetaria demonstrated that the complex retrograde loops observed from Earth are simply geometric illusions created by observing outer planets from an inner moving platform.
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary btn-close-modal">Leave Orrery</button>
        </div>
      </div>
    `;
  };

  overlay.open(renderModal());
  overlay.getElement().querySelector('.btn-close-modal')?.addEventListener('click', () => {
    overlay.close();
  });
}
