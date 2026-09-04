import { StateManager } from '../core/state';
import { ModalOverlay } from './overlay';

export function openStarChartModal(_stateManager: StateManager) {
  const overlay = ModalOverlay.getInstance();

  const renderModal = () => {
    return `
      <div class="modal-dialog" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <h2>Celestial Cartography & Astrolabe</h2>
            <div class="subtitle">Equatorial Coordinates & Keplerian Orbital Mechanics</div>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="margin-bottom: 14px; color: var(--text-muted); font-style: italic;">
            Vellum star charts and engraved brass armillary rings map the celestial sphere onto human geometry.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
            <!-- Panel 1: Astrolabe Coordinate Projection -->
            <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
              <div style="font-family: Georgia, serif; font-size: 1.05rem; color: #fef08a; margin-bottom: 6px;">
                The Celestial Sphere
              </div>
              <div style="font-size: 0.8rem; line-height: 1.5; color: #cbd5e1;">
                By projecting Earth's equator and rotational poles onto the infinite sky, the celestial sphere establishes the <strong>Equatorial Coordinate System</strong>:
              </div>
              <ul style="font-size: 0.76rem; color: #94a3b8; line-height: 1.6; margin: 8px 0 0 16px; padding: 0;">
                <li><strong>Right Ascension (&alpha;):</strong> Angular distance measured eastward along celestial equator from the Vernal Equinox (0h to 24h).</li>
                <li><strong>Declination (&delta;):</strong> Angular distance north (+) or south (&minus;) from the celestial equator (&minus;90° to +90°).</li>
                <li><strong>Ecliptic Plane:</strong> The apparent path of the Sun, tilted at 23.44° to the celestial equator.</li>
              </ul>
            </div>

            <!-- Panel 2: Kepler's Laws of Planetary Motion -->
            <div style="background: #0b0f19; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
              <div style="font-family: Georgia, serif; font-size: 1.05rem; color: #fef08a; margin-bottom: 6px;">
                Kepler's Orbital Laws (1609–1619)
              </div>
              <div style="font-size: 0.8rem; line-height: 1.5; color: #cbd5e1;">
                Johannes Kepler shattered the circular dogma of the ancients with three empirical harmonic laws:
              </div>
              <div style="font-size: 0.76rem; color: #94a3b8; line-height: 1.6; margin-top: 8px;">
                <div style="margin-bottom: 6px;">
                  <span style="color: #f59e0b; font-weight: bold;">1. Ellipses:</span> The orbit of each planet is an ellipse with the Sun at one focus.
                </div>
                <div style="margin-bottom: 6px;">
                  <span style="color: #f59e0b; font-weight: bold;">2. Equal Areas:</span> A line connecting planet and Sun sweeps out equal areas in equal times (planets accelerate at perihelion).
                </div>
                <div>
                  <span style="color: #f59e0b; font-weight: bold;">3. Harmonic Ratio:</span> $P^2 = a^3$ &mdash; The square of the orbital period in years equals the cube of semi-major axis in Astronomical Units (AU).
                </div>
              </div>
            </div>
          </div>

          <!-- Interactive Constellation Reference -->
          <div style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 0.82rem; color: #f8fafc;">
              <strong>Zenith Alignment Tonight:</strong> Cygnus the Swan & Vega (Summer Triangle) high overhead.
            </div>
            <div style="font-family: monospace; font-size: 0.72rem; color: #38bdf8;">
              Sidereal Time: 19h 44m
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary btn-close-modal">Close Star Chart</button>
        </div>
      </div>
    `;
  };

  overlay.open(renderModal());
  overlay.getElement().querySelector('.btn-close-modal')?.addEventListener('click', () => {
    overlay.close();
  });
}
