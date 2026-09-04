import { StateManager } from '../core/state';
import { ModalOverlay } from './overlay';

interface CelestialTarget {
  id: string;
  name: string;
  catalog: string;
  constellation: string;
  distance: string;
  type: string;
  description: string;
  notes: string;
}

const TARGETS: CelestialTarget[] = [
  {
    id: 'saturn',
    name: 'Saturn & The Ring System',
    catalog: 'Solar System — 6th Planet',
    constellation: 'Aquarius',
    distance: '1.43 Billion km (9.58 AU)',
    type: 'Gas Giant with Planetary Rings',
    description: 'The jewel of the solar system. The rings are composed of trillions of water-ice particles ranging from micrometers to meters across, held in delicate resonance by shepherd moons.',
    notes: 'The Cassini Division—a 4,800 km wide gravitational gap carved by the moon Mimas—is razor sharp tonight under steady atmospheric seeing.',
  },
  {
    id: 'orion',
    name: 'The Great Orion Nebula',
    catalog: 'Messier 42 (NGC 1976)',
    constellation: 'Orion (The Hunter)',
    distance: '1,344 Light-Years',
    type: 'Diffuse Emission & Reflection Nebula',
    description: 'A stellar nursery where hundreds of young stars and protoplanetary disks (proplyds) are condensing out of turbulent molecular hydrogen clouds.',
    notes: 'At the heart of the glowing green-violet veil, the four bright infant massive stars of the Trapezium cluster radiate intense ultraviolet light, ionizing the surrounding hydrogen gas.',
  },
  {
    id: 'pleiades',
    name: 'The Pleiades (Seven Sisters)',
    catalog: 'Messier 45 (Melotte 22)',
    constellation: 'Taurus (The Bull)',
    distance: '444 Light-Years',
    type: 'Open Star Cluster with Reflection Nebulosity',
    description: 'A gravitationally bound cluster of over 1,000 hot, blue B-type stars that formed together roughly 100 million years ago, drifting through interstellar space.',
    notes: 'The faint cyan filaments of the Maia and Merope nebulosity are not stellar ejecta, but an unrelated dust cloud through which the cluster happens to be passing.',
  },
  {
    id: 'andromeda',
    name: 'The Andromeda Galaxy',
    catalog: 'Messier 31 (NGC 224)',
    constellation: 'Andromeda',
    distance: '2.537 Million Light-Years',
    type: 'Barred Spiral Galaxy',
    description: 'The nearest major spiral galaxy to the Milky Way, spanning 220,000 light-years and containing an estimated one trillion stars.',
    notes: 'Light reaching the eyepiece tonight embarked during the early Pleistocene epoch, when early hominids first chipped stone tools in the East African Rift.',
  },
];

export function openTelescopeModal(_stateManager: StateManager) {
  const overlay = ModalOverlay.getInstance();
  let currentTarget = TARGETS[0];
  let currentMag = '120x';

  const renderOcularView = (target: CelestialTarget, mag: string) => {
    return `
      <div style="display: flex; justify-content: center; align-items: center; padding: 12px 0;">
        <div style="position: relative; width: 220px; height: 220px; border-radius: 50%; border: 4px solid #b45309; box-shadow: inset 0 0 24px rgba(0,0,0,0.9), 0 0 18px rgba(245, 158, 11, 0.25); background: #020617; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <!-- Reticle crosshairs -->
          <div style="position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: rgba(239, 68, 68, 0.28); pointer-events: none;"></div>
          <div style="position: absolute; top: 0; bottom: 0; left: 50%; width: 1px; background: rgba(239, 68, 68, 0.28); pointer-events: none;"></div>
          <div style="position: absolute; width: 60px; height: 60px; border: 1px dashed rgba(239, 68, 68, 0.35); border-radius: 50%; pointer-events: none;"></div>
          
          <!-- Stylized Target Pixel Visuals -->
          ${renderTargetGraphic(target.id, mag)}

          <!-- Eyepiece FOV indicator -->
          <div style="position: absolute; bottom: 8px; right: 12px; font-family: monospace; font-size: 9px; color: rgba(254, 240, 138, 0.65);">
            FOV: 0.82° &bull; ${mag}
          </div>
        </div>
      </div>
    `;
  };

  const renderTargetGraphic = (id: string, mag: string) => {
    const scale = mag === '40x' ? 0.7 : mag === '300x' ? 1.4 : 1.0;

    if (id === 'saturn') {
      return `
        <svg width="${160 * scale}" height="${100 * scale}" viewBox="0 0 160 100" style="overflow: visible;">
          <!-- Ring Back -->
          <ellipse cx="80" cy="50" rx="72" ry="18" fill="none" stroke="#ca8a04" stroke-width="8" opacity="0.6" />
          <ellipse cx="80" cy="50" rx="76" ry="19.5" fill="none" stroke="#78350f" stroke-width="1.5" />
          <!-- Planet Sphere -->
          <circle cx="80" cy="50" r="28" fill="#eab308" />
          <circle cx="78" cy="48" r="27" fill="#ca8a04" />
          <ellipse cx="80" cy="50" rx="27" ry="10" fill="rgba(161, 98, 7, 0.4)" />
          <ellipse cx="80" cy="42" rx="26" ry="6" fill="rgba(254, 240, 138, 0.25)" />
          <!-- Planet shadow on rear rings -->
          <path d="M 68 35 Q 80 40 92 35 L 92 32 Q 80 37 68 32 Z" fill="#020617" opacity="0.75" />
          <!-- Ring Front -->
          <path d="M 8 50 A 72 18 0 0 0 152 50 A 76 19.5 0 0 1 8 50 Z" fill="#eab308" opacity="0.7" />
          <!-- Cassini Division (Front) -->
          <path d="M 18 50.5 A 62 15 0 0 0 142 50.5" fill="none" stroke="#020617" stroke-width="2.5" />
          <!-- Moons Titan & Enceladus -->
          <circle cx="150" cy="28" r="2" fill="#fde68a" />
          <circle cx="24" cy="62" r="1.2" fill="#e2e8f0" />
        </svg>
      `;
    }

    if (id === 'orion') {
      return `
        <svg width="${170 * scale}" height="${170 * scale}" viewBox="0 0 170 170">
          <defs>
            <radialGradient id="nebulaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
              <stop offset="30%" stop-color="#818cf8" stop-opacity="0.7" />
              <stop offset="65%" stop-color="#c084fc" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#020617" stop-opacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="85" cy="85" rx="75" ry="55" fill="url(#nebulaGlow)" />
          <!-- Dark Dust Lane Cavity -->
          <path d="M 85 70 Q 110 85 85 105 Q 65 95 85 70 Z" fill="#020617" opacity="0.85" />
          <!-- Trapezium Cluster Stars -->
          <circle cx="82" cy="83" r="2.8" fill="#ffffff" />
          <circle cx="87" cy="81" r="2.4" fill="#ffffff" />
          <circle cx="88" cy="88" r="2.2" fill="#e0f2fe" />
          <circle cx="80" cy="88" r="1.8" fill="#ffffff" />
          <!-- Ambient Young Stars -->
          <circle cx="45" cy="60" r="1.5" fill="#bae6fd" />
          <circle cx="120" cy="110" r="1.8" fill="#bae6fd" />
          <circle cx="130" cy="65" r="1.2" fill="#ffffff" />
        </svg>
      `;
    }

    if (id === 'pleiades') {
      return `
        <svg width="${160 * scale}" height="${160 * scale}" viewBox="0 0 160 160">
          <!-- Wispy blue reflection dust -->
          <circle cx="80" cy="75" r="45" fill="#38bdf8" opacity="0.22" filter="blur(6px)" />
          <circle cx="95" cy="60" r="30" fill="#60a5fa" opacity="0.25" filter="blur(4px)" />
          <!-- Main Seven Stars (Alcyone, Electra, Maia, Merope, Taygeta, Celaeno, Asterope) -->
          <circle cx="75" cy="80" r="3.6" fill="#ffffff" />
          <circle cx="98" cy="58" r="3.2" fill="#ffffff" />
          <circle cx="60" cy="65" r="3.0" fill="#ffffff" />
          <circle cx="90" cy="98" r="3.0" fill="#ffffff" />
          <circle cx="112" cy="50" r="2.5" fill="#ffffff" />
          <circle cx="50" cy="85" r="2.4" fill="#ffffff" />
          <circle cx="125" cy="72" r="2.2" fill="#ffffff" />
          <!-- Subtle 4-point diffraction spikes -->
          <path d="M 75 72 L 75 88 M 67 80 L 83 80" stroke="#bae6fd" stroke-width="1" />
          <path d="M 98 51 L 98 65 M 91 58 L 105 58" stroke="#bae6fd" stroke-width="1" />
        </svg>
      `;
    }

    // Andromeda
    return `
      <svg width="${180 * scale}" height="${100 * scale}" viewBox="0 0 180 100">
        <defs>
          <radialGradient id="androGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="0.95" />
            <stop offset="25%" stop-color="#fed7aa" stop-opacity="0.75" />
            <stop offset="60%" stop-color="#93c5fd" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#020617" stop-opacity="0" />
          </radialGradient>
        </defs>
        <!-- Tilted Galactic Disk -->
        <g transform="rotate(-25 90 50)">
          <ellipse cx="90" cy="50" rx="80" ry="24" fill="url(#androGlow)" />
          <!-- Dust lanes -->
          <ellipse cx="90" cy="50" rx="70" ry="18" fill="none" stroke="#020617" stroke-width="2.5" opacity="0.65" />
          <ellipse cx="90" cy="50" rx="48" ry="11" fill="none" stroke="#020617" stroke-width="2" opacity="0.5" />
          <!-- Supermassive Black Hole & Stellar Core -->
          <circle cx="90" cy="50" r="6" fill="#ffffff" />
        </g>
        <!-- Satellite Galaxy M32 -->
        <circle cx="85" cy="18" r="3.2" fill="#fed7aa" opacity="0.8" />
      </svg>
    `;
  };

  const renderModal = () => {
    return `
      <div class="modal-dialog" style="max-width: 660px;">
        <div class="modal-header">
          <div>
            <h2>The Great Refractor Telescope</h2>
            <div class="subtitle">Equatorial Eyepiece & Celestial Sanctuary</div>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div style="display: flex; gap: 8px; margin-bottom: 12px; overflow-x: auto; padding-bottom: 4px;">
            ${TARGETS.map(
              (t) => `
              <button class="btn-target ${t.id === currentTarget.id ? 'active' : ''}" data-target-id="${t.id}" style="
                flex: 1;
                white-space: nowrap;
                padding: 6px 10px;
                font-size: 0.8rem;
                background: ${t.id === currentTarget.id ? 'var(--accent-gold)' : '#1e293b'};
                color: ${t.id === currentTarget.id ? '#0f172a' : '#cbd5e1'};
                font-weight: ${t.id === currentTarget.id ? 'bold' : 'normal'};
                border: 1px solid ${t.id === currentTarget.id ? '#f59e0b' : '#334155'};
                border-radius: 6px;
                cursor: pointer;
              ">
                ${t.name.split('&')[0].trim()}
              </button>
            `
            ).join('')}
          </div>

          <div style="display: grid; grid-template-columns: 240px 1fr; gap: 16px; align-items: center; background: #0b0f19; border: 1px solid #1e293b; border-radius: 8px; padding: 14px;">
            <div>
              ${renderOcularView(currentTarget, currentMag)}
              <div style="display: flex; justify-content: center; gap: 6px; margin-top: 4px;">
                ${['40x', '120x', '300x'].map(
                  (m) => `
                  <button class="btn-mag ${m === currentMag ? 'active' : ''}" data-mag="${m}" style="
                    font-size: 0.72rem;
                    padding: 2px 8px;
                    border-radius: 4px;
                    border: 1px solid ${m === currentMag ? '#38bdf8' : '#334155'};
                    background: ${m === currentMag ? '#0284c7' : '#1e293b'};
                    color: #fff;
                    cursor: pointer;
                  ">${m}</button>
                `
                ).join('')}
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h3 style="font-family: Georgia, serif; font-size: 1.25rem; color: #fef08a; margin: 0;">
                  ${currentTarget.name}
                </h3>
              </div>
              <div style="font-size: 0.78rem; color: #38bdf8; margin: 4px 0 10px 0;">
                ${currentTarget.catalog} &bull; Constellation ${currentTarget.constellation}
              </div>

              <div style="font-size: 0.8rem; line-height: 1.5; color: #cbd5e1; margin-bottom: 10px;">
                ${currentTarget.description}
              </div>

              <div style="background: rgba(15, 23, 42, 0.8); border-left: 3px solid #f59e0b; padding: 8px 10px; border-radius: 4px; font-size: 0.78rem; color: #fde68a; font-style: italic;">
                &ldquo;${currentTarget.notes}&rdquo;
              </div>

              <div style="display: flex; gap: 14px; margin-top: 12px; font-size: 0.72rem; color: #94a3b8; font-family: monospace;">
                <div><strong style="color: #cbd5e1;">Distance:</strong> ${currentTarget.distance}</div>
                <div><strong style="color: #cbd5e1;">Class:</strong> ${currentTarget.type}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary btn-close-modal">Step Back From Eyepiece</button>
        </div>
      </div>
    `;
  };

  const bindEvents = () => {
    overlay.getElement().querySelectorAll('.btn-target').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-target-id');
        const found = TARGETS.find((t) => t.id === id);
        if (found) {
          currentTarget = found;
          overlay.open(renderModal());
          bindEvents();
        }
      });
    });

    overlay.getElement().querySelectorAll('.btn-mag').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const mag = (e.currentTarget as HTMLElement).getAttribute('data-mag');
        if (mag) {
          currentMag = mag;
          overlay.open(renderModal());
          bindEvents();
        }
      });
    });

    overlay.getElement().querySelector('.btn-close-modal')?.addEventListener('click', () => {
      overlay.close();
    });
  };

  overlay.open(renderModal());
  bindEvents();
}
