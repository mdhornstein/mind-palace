import { StateManager } from '../core/state';
import { ModalOverlay } from './overlay';
import { HearthAudio } from '../sound/audio';

// =============================================================================
// 1. THE PERPETUAL WATERFALL MODAL (Waterfall, 1961)
// =============================================================================
export function openWaterfallModal(_stateManager: StateManager) {
  const overlay = ModalOverlay.getInstance();
  const audio = HearthAudio.getInstance();

  let loopCount = 3;
  let pebbleType: 'copper' | 'lapis' | 'meteorite' = 'copper';
  let isDropping = false;
  let animTimer: number | null = null;
  let pebbleProgress = 0; // 0 to 1 along the impossible loop

  const getPebbleName = () => {
    switch (pebbleType) {
      case 'copper': return 'Polished Copper Pebble';
      case 'lapis': return 'Lapis Lazuli Bead';
      case 'meteorite': return 'Chondrite Meteorite Fragment';
    }
  };

  const getPebbleColor = () => {
    switch (pebbleType) {
      case 'copper': return '#f59e0b';
      case 'lapis': return '#38bdf8';
      case 'meteorite': return '#a855f7';
    }
  };

  const renderModal = () => {
    const pebbleColor = getPebbleColor();
    return `
      <div class="modal-dialog" style="max-width: 740px;">
        <div class="modal-header">
          <div>
            <h2>The Perpetual Waterfall (1961)</h2>
            <div class="subtitle">Perpetuum Mobile & Impossible Closed-Loop Hydrodynamics</div>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="margin-bottom: 14px; color: var(--text-muted); font-style: italic; font-size: 0.9rem;">
            Two stone towers crowned with stellated geometric polyhedra flank an impossible aqueduct.
            The flume zig-zags away while appearing to descend at a steady gradient, yet deposits water back at its own summit to power the overshot waterwheel.
          </p>

          <!-- Interactive Hydraulic Diagram & Paradox Tracker -->
          <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 16px; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid #1e293b; padding-bottom: 8px;">
              <div style="font-family: Georgia, serif; font-size: 0.95rem; color: #fef08a;">
                Closed-Circuit Hydraulic Telemetry
              </div>
              <div style="font-family: monospace; font-size: 0.8rem; color: #38bdf8;">
                Cycles Observed: <strong id="loop-counter" style="color: #fefce8; font-size: 0.95rem;">${loopCount}</strong>
              </div>
            </div>

            <!-- SVG Schematic of the Closed Impossible Loop -->
            <div style="display: flex; justify-content: center; align-items: center; padding: 10px 0; background: radial-gradient(circle at center, #0f172a 0%, #020617 80%); border-radius: 6px; border: 1px solid #0f172a;">
              <svg width="460" height="150" viewBox="0 0 460 150" style="overflow: visible;">
                <defs>
                  <linearGradient id="waterFlume" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#38bdf8" />
                    <stop offset="50%" stop-color="#818cf8" />
                    <stop offset="100%" stop-color="#38bdf8" />
                  </linearGradient>
                </defs>

                <!-- Canal Path (Isometric zigzag) -->
                <!-- Level 1: Summit -->
                <path d="M 60 40 L 220 40 L 160 70 L 320 70 L 260 105 L 390 105" fill="none" stroke="#334155" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M 60 40 L 220 40 L 160 70 L 320 70 L 260 105 L 390 105" fill="none" stroke="url(#waterFlume)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.8" />
                
                <!-- Waterfall Plunge from 390, 105 back to Summit 60, 40 (Optical Loop) -->
                <path d="M 390 105 Q 430 115 410 135 Q 360 145 200 135 Q 30 120 60 40" fill="none" stroke="#60a5fa" stroke-dasharray="4,4" stroke-width="2" opacity="0.5" />
                <text x="210" y="142" fill="#94a3b8" font-size="9" font-family="monospace" text-anchor="middle">Impossible Upward Gravity Loop (Penrose Projection)</text>

                <!-- Towers -->
                <!-- Left Tower (Compound of three cubes) -->
                <rect x="40" y="32" width="40" height="85" fill="#1e293b" stroke="#475569" stroke-width="1.5" rx="2" />
                <polygon points="60,10 48,26 72,26" fill="#f59e0b" opacity="0.9" />
                <text x="60" y="8" fill="#fef08a" font-size="8" font-family="monospace" text-anchor="middle">3-Cube</text>

                <!-- Right Tower (Stellated Rhombic Dodecahedron) -->
                <rect x="370" y="24" width="40" height="93" fill="#1e293b" stroke="#475569" stroke-width="1.5" rx="2" />
                <polygon points="390,2 376,18 404,18" fill="#38bdf8" opacity="0.9" />
                <text x="390" y="-1" fill="#bae6fd" font-size="8" font-family="monospace" text-anchor="middle">Stellated</text>

                <!-- Waterwheel at Base -->
                <circle cx="390" cy="105" r="16" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="4,4" />
                <circle cx="390" cy="105" r="3" fill="#fbbf24" />

                <!-- Moving Marker / Pebble in Flume -->
                <g id="pebble-marker" transform="translate(60, 40)">
                  <circle cx="0" cy="0" r="7" fill="${pebbleColor}" stroke="#ffffff" stroke-width="1.5" />
                  <circle cx="0" cy="0" r="12" fill="none" stroke="${pebbleColor}" stroke-width="1" opacity="0.5" />
                </g>
              </svg>
            </div>

            <!-- Current Telemetry Status -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 14px; font-size: 0.76rem; font-family: monospace;">
              <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 4px; border-left: 2px solid #38bdf8;">
                <div style="color: #94a3b8;">Waterwheel Output:</div>
                <div style="color: #f8fafc; font-weight: bold; margin-top: 2px;">24.6 RPM &bull; 180W</div>
              </div>
              <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 4px; border-left: 2px solid #f59e0b;">
                <div style="color: #94a3b8;">Active Pebble:</div>
                <div id="pebble-name-label" style="color: ${pebbleColor}; font-weight: bold; margin-top: 2px;">${getPebbleName()}</div>
              </div>
              <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 4px; border-left: 2px solid #10b981;">
                <div style="color: #94a3b8;">Entropy Violation:</div>
                <div style="color: #34d399; font-weight: bold; margin-top: 2px;">ΔS = 0 (Perpetual)</div>
              </div>
            </div>
          </div>

          <!-- Controls: Drop Pebble & Select Material -->
          <div style="display: flex; gap: 10px; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <span style="font-size: 0.8rem; color: var(--text-muted);">Pebble Mineral:</span>
              <button class="btn-secondary btn-mat ${pebbleType === 'copper' ? 'active' : ''}" data-mat="copper" style="padding: 4px 10px; font-size: 0.78rem;">Copper</button>
              <button class="btn-secondary btn-mat ${pebbleType === 'lapis' ? 'active' : ''}" data-mat="lapis" style="padding: 4px 10px; font-size: 0.78rem;">Lapis Lazuli</button>
              <button class="btn-secondary btn-mat ${pebbleType === 'meteorite' ? 'active' : ''}" data-mat="meteorite" style="padding: 4px 10px; font-size: 0.78rem;">Meteorite</button>
            </div>

            <button class="btn-primary" id="btn-drop-pebble" ${isDropping ? 'disabled' : ''} style="display: flex; align-items: center; gap: 6px;">
              <span>💧 Drop Pebble into Summit Flume</span>
            </button>
          </div>

          <!-- Scholarly Insights & Mathematical Backstory -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.82rem; line-height: 1.5;">
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 6px; padding: 12px;">
              <h4 style="color: #fef08a; margin-bottom: 6px; font-family: Georgia, serif; font-size: 0.9rem;">The Penrose Tribar Basis</h4>
              <p style="color: #cbd5e1;">
                Escher based <em>Waterfall</em> on the impossible triangle conceived by mathematician Roger Penrose and his father Lionel in 1958.
                By connecting three Penrose triangles end-to-end, Escher created an architectural flume where every individual corner is geometrically plausible, yet the global topology is impossible in Euclidean 3-space.
              </p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 6px; padding: 12px;">
              <h4 style="color: #bae6fd; margin-bottom: 6px; font-family: Georgia, serif; font-size: 0.9rem;">The Crown Polyhedra</h4>
              <p style="color: #cbd5e1;">
                The towers are crowned by two non-Euclidean polyhedra: on the left, a compound of three interpenetrating cubes; on the right, a stellated rhombic dodecahedron (also known as Escher's Solid).
                Escher studied crystallographic geometry under Dutch crystallographer Bruno Ernst.
              </p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary btn-close-modal">Step Away from Flume</button>
        </div>
      </div>
    `;
  };

  const updatePebblePos = (marker: SVGGElement, progress: number) => {
    let x = 60;
    let y = 40;

    if (progress < 0.25) {
      const t = progress / 0.25;
      x = 60 + t * (220 - 60);
      y = 40;
    } else if (progress < 0.5) {
      const t = (progress - 0.25) / 0.25;
      x = 220 + t * (160 - 220);
      y = 40 + t * (70 - 40);
    } else if (progress < 0.75) {
      const t = (progress - 0.5) / 0.25;
      x = 160 + t * (320 - 160);
      y = 70;
    } else if (progress < 0.9) {
      const t = (progress - 0.75) / 0.15;
      x = 320 + t * (390 - 320);
      y = 70 + t * (105 - 70);
    } else {
      // Plunge & splash back to summit
      const t = (progress - 0.9) / 0.1;
      x = 390 + t * (60 - 390);
      y = 105 + Math.sin(t * Math.PI) * 25 + t * (40 - 105);
    }

    marker.setAttribute('transform', `translate(${x.toFixed(1)}, ${y.toFixed(1)})`);
  };

  const startPebbleAnimation = () => {
    if (isDropping) return;
    isDropping = true;
    pebbleProgress = 0;
    audio.playWaterSplash();

    const marker = overlay.getElement().querySelector('#pebble-marker') as SVGGElement | null;
    const counterEl = overlay.getElement().querySelector('#loop-counter');
    const dropBtn = overlay.getElement().querySelector('#btn-drop-pebble') as HTMLButtonElement | null;
    if (dropBtn) dropBtn.disabled = true;

    const startTime = performance.now();
    const duration = 2800; // 2.8s per loop

    const tick = (now: number) => {
      const elapsed = now - startTime;
      pebbleProgress = Math.min(1, elapsed / duration);

      if (marker) {
        updatePebblePos(marker, pebbleProgress);
      }

      // Midway sound effect at waterwheel
      if (elapsed > 2200 && elapsed < 2250) {
        audio.playClockworkTick();
      }

      if (pebbleProgress < 1) {
        animTimer = requestAnimationFrame(tick);
      } else {
        // Complete cycle!
        loopCount++;
        if (counterEl) counterEl.textContent = loopCount.toString();
        audio.playWaterSplash();
        isDropping = false;
        if (dropBtn) dropBtn.disabled = false;
      }
    };

    animTimer = requestAnimationFrame(tick);
  };

  const bindEvents = () => {
    const el = overlay.getElement();

    el.querySelectorAll('.btn-mat').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const mat = (e.currentTarget as HTMLElement).getAttribute('data-mat') as 'copper' | 'lapis' | 'meteorite';
        if (mat) {
          pebbleType = mat;
          audio.playClockworkTick();
          overlay.open(renderModal(), () => {
            if (animTimer !== null) cancelAnimationFrame(animTimer);
          });
          bindEvents();
        }
      });
    });

    el.querySelector('#btn-drop-pebble')?.addEventListener('click', () => {
      startPebbleAnimation();
    });
  };

  overlay.open(renderModal(), () => {
    if (animTimer !== null) cancelAnimationFrame(animTimer);
  });
  bindEvents();
}

// =============================================================================
// 2. THE LITHOGRAPHER'S DRAFTING DESK (Drawing Hands, 1948)
// =============================================================================
export function openDrawingHandsModal(_stateManager: StateManager) {
  const overlay = ModalOverlay.getInstance();
  const audio = HearthAudio.getInstance();

  let recursionLevel = 2; // 1 to 4
  let isRightDominant = true;
  let activeHofstadterTopic = 0;
  let animFrameId: number | null = null;

  const topics = [
    {
      title: 'Tangled Hierarchies & Strange Loops',
      source: 'Gödel, Escher, Bach: An Eternal Golden Braid (1979)',
      quote:
        'The Strange Loop phenomenon occurs whenever, by moving upwards (or downwards) through the levels of some hierarchical system, we unexpectedly find ourselves right back where we started.',
      analysis:
        'In Drawing Hands, two levels of existence intertwine: Level 0 (the flat 2-D paper pinned with thumbtacks) and Level 1 (the 3-D hands with knuckles and shadows). Each hand draws the cuff of the other. Who is the author? Neither hand exists independently; they co-emerge from the mutual recursive loop.',
    },
    {
      title: "Gödel's Incompleteness Theorem as a Drawing Hand",
      source: 'Kurt Gödel, On Formally Undecidable Propositions (1931)',
      quote:
        'To any consistent formal system capable of doing arithmetic, there exist true arithmetic propositions that cannot be proved within the system.',
      analysis:
        'Gödel mapped mathematical statements to talk about themselves using prime factorizations (Gödel numbering), creating a sentence that asserts: "I cannot be proved in this system." Just as Hand A reaches outside 2D space to draw Hand B, Gödel numbers reach outside axiomatic confines to establish truth beyond provability.',
    },
    {
      title: 'Quines & Computational Self-Replication',
      source: 'Willard Van Orman Quine / John von Neumann',
      quote:
        'A quine is a computer program that takes no input and outputs a copy of its own exact source code.',
      analysis:
        'Writing a quine seems paradoxical because naïve attempts lead to infinite regress: to print yourself, you must describe the code that prints yourself. The solution is splitting the program into two parts: a data template (the passive cuff) and an execution engine (the active pencil hand) that interprets the template.',
    },
    {
      title: 'The Inviolate Substrate: Who Drew the Desk?',
      source: 'Douglas Hofstadter on Subsystems and Reality',
      quote:
        'Every strange loop is embedded inside an inviolate substrate: a higher reality from which the illusion is constructed.',
      analysis:
        'While the two hands draw each other in an infinite cycle, Escher himself stood outside the paper in 1948 holding a lithographic crayon. In our universe, the laws of physics form the inviolate substrate upon which our tangled consciousness and self-referential cognition run.',
    },
  ];

  const renderModal = () => {
    const topic = topics[activeHofstadterTopic];
    return `
      <div class="modal-dialog" style="max-width: 780px;">
        <div class="modal-header">
          <div>
            <h2>The Lithographer's Drafting Desk (1948)</h2>
            <div class="subtitle">Self-Reference, Tangled Hierarchies & Douglas Hofstadter's Strange Loops</div>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Interactive Sketching Canvas -->
          <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
            <!-- Live Canvas -->
            <div style="flex: 1; min-width: 280px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <canvas id="hands-canvas" width="300" height="200" style="background: #f1ede4; border-radius: 4px; box-shadow: 0 4px 16px rgba(0,0,0,0.6); border: 2px solid #b8a99a;"></canvas>
              
              <div style="display: flex; gap: 10px; margin-top: 12px; align-items: center; justify-content: space-between; width: 100%;">
                <div style="font-size: 0.75rem; color: #94a3b8; font-family: monospace;">
                  Hierarchy: <strong style="color: #fef08a;">${isRightDominant ? 'Right &rarr; Left' : 'Left &rarr; Right'}</strong>
                </div>
                <button class="btn-secondary" id="btn-invert-hands" style="padding: 3px 8px; font-size: 0.74rem;">
                  🔄 Invert Dominance
                </button>
              </div>
            </div>

            <!-- Recursion & Parameter Controls -->
            <div style="flex: 1; min-width: 280px; background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="font-family: Georgia, serif; font-size: 0.95rem; color: #fef08a; margin-bottom: 8px;">
                  Recursive Sketch Depth
                </div>
                <p style="font-size: 0.78rem; color: #94a3b8; margin-bottom: 12px; line-height: 1.4;">
                  Observe what occurs as self-referential recursion deepens: each sketched hand holds a smaller pencil sketching an even smaller counterpart.
                </p>

                <div style="display: flex; gap: 6px; margin-bottom: 14px;">
                  ${[1, 2, 3, 4]
                    .map(
                      (lvl) => `
                    <button class="btn-secondary btn-level ${lvl === recursionLevel ? 'active' : ''}" data-lvl="${lvl}" style="flex: 1; padding: 6px 0; font-family: monospace; font-size: 0.8rem;">
                      L${lvl}
                    </button>
                  `
                    )
                    .join('')}
                </div>
              </div>

              <div style="background: rgba(15, 23, 42, 0.7); border-left: 3px solid #f59e0b; padding: 8px 10px; border-radius: 4px; font-size: 0.75rem; color: #fde68a;">
                <strong>Loop Metric:</strong> Level ${recursionLevel} contains <strong>${Math.pow(2, recursionLevel)}</strong> co-drawing entities in reciprocal causal loops.
              </div>
            </div>
          </div>

          <!-- Hofstadter Philosophical Discourse Tabs -->
          <div style="border-top: 1px solid #1e293b; padding-top: 14px;">
            <div style="display: flex; gap: 6px; overflow-x: auto; margin-bottom: 12px; padding-bottom: 4px;">
              ${topics
                .map(
                  (t, idx) => `
                <button class="btn-secondary btn-topic ${idx === activeHofstadterTopic ? 'active' : ''}" data-idx="${idx}" style="padding: 5px 10px; font-size: 0.75rem; white-space: nowrap;">
                  ${idx + 1}. ${t.title.split('&')[0].trim()}
                </button>
              `
                )
                .join('')}
            </div>

            <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 6px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
                <h4 style="color: #fef08a; font-family: Georgia, serif; font-size: 0.95rem;">${topic.title}</h4>
                <span style="font-family: monospace; font-size: 0.72rem; color: #38bdf8;">${topic.source}</span>
              </div>
              <blockquote style="border-left: 2px solid #818cf8; padding-left: 10px; margin: 10px 0; color: #e2e8f0; font-style: italic; font-size: 0.82rem; line-height: 1.4;">
                &ldquo;${topic.quote}&rdquo;
              </blockquote>
              <p style="color: #94a3b8; font-size: 0.8rem; line-height: 1.5; margin-top: 8px;">
                ${topic.analysis}
              </p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary btn-close-modal">Leave Drafting Board</button>
        </div>
      </div>
    `;
  };

  const startCanvasLoop = () => {
    const canvas = overlay.getElement().querySelector('#hands-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const drawFrame = (now: number) => {
      const elapsed = (now - startTime) * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Paper texture / warm tone
      ctx.fillStyle = '#f1ede4';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 4 Brass Thumbtacks in corners
      const tacks = [
        [12, 12],
        [canvas.width - 12, 12],
        [12, canvas.height - 12],
        [canvas.width - 12, canvas.height - 12],
      ];
      ctx.fillStyle = '#d97706';
      tacks.forEach(([tx, ty]) => {
        ctx.beginPath();
        ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(tx - 1, ty - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d97706';
      });

      // Graphite grid lines (subtle drafting layout)
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 30; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 30; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Animated Pencil positions
      const penSwing1 = Math.sin(elapsed * 4) * 6;
      const penSwing2 = Math.cos(elapsed * 4) * 6;

      // Draw Right Hand (upper-left sketching lower-right)
      const h1x = 90 + penSwing1;
      const h1y = 65;
      const target2x = 210;
      const target2y = 135;

      // Draw Left Hand (lower-right sketching upper-left)
      const h2x = 210 + penSwing2;
      const h2y = 135;
      const target1x = 90;
      const target1y = 65;

      // 1. Sketched cuff outlines on 2D paper
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      // Cuff 1 (flat 2D drawing)
      ctx.strokeRect(30, 45, 45, 30);
      for (let h = 35; h < 70; h += 5) {
        ctx.beginPath();
        ctx.moveTo(h, 45);
        ctx.lineTo(h + 5, 75);
        ctx.stroke();
      }

      // Cuff 2 (flat 2D drawing)
      ctx.strokeRect(225, 120, 45, 30);
      for (let h = 230; h < 265; h += 5) {
        ctx.beginPath();
        ctx.moveTo(h, 120);
        ctx.lineTo(h + 5, 150);
        ctx.stroke();
      }

      // 2. 3D Hand Bodies emerging with shadows
      // Hand 1 Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.beginPath();
      ctx.ellipse(h1x + 4, h1y + 6, 28, 14, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Hand 1 Flesh Body
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(h1x, h1y, 24, 12, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hand 1 Pencil pointing toward target 2
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(h1x + 8, h1y + 4);
      ctx.lineTo(target2x - 25 + penSwing1, target2y - 20);
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(target2x - 25 + penSwing1, target2y - 20, 2, 0, Math.PI * 2);
      ctx.fill();

      // Hand 2 Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.beginPath();
      ctx.ellipse(h2x + 4, h2y + 6, 28, 14, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Hand 2 Flesh Body
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(h2x, h2y, 24, 12, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hand 2 Pencil pointing toward target 1
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(h2x - 8, h2y - 4);
      ctx.lineTo(target1x + 25 + penSwing2, target1y + 20);
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(target1x + 25 + penSwing2, target1y + 20, 2, 0, Math.PI * 2);
      ctx.fill();

      // 3. Dynamic Sketching Lines connecting pencils to cuffs
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(target2x - 25 + penSwing1, target2y - 20);
      ctx.lineTo(225, 135);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(target1x + 25 + penSwing2, target1y + 20);
      ctx.lineTo(75, 60);
      ctx.stroke();

      // Recursive sub-sketch miniature hands if level > 1
      if (recursionLevel >= 2) {
        for (let lvl = 2; lvl <= recursionLevel; lvl++) {
          const scale = 1 / Math.pow(1.8, lvl - 1);
          ctx.save();
          ctx.translate(h1x, h1y);
          ctx.scale(scale, scale);
          ctx.strokeStyle = '#64748b';
          ctx.strokeRect(-15, -10, 30, 20);
          ctx.restore();

          ctx.save();
          ctx.translate(h2x, h2y);
          ctx.scale(scale, scale);
          ctx.strokeStyle = '#64748b';
          ctx.strokeRect(-15, -10, 30, 20);
          ctx.restore();
        }
      }

      animFrameId = requestAnimationFrame(drawFrame);
    };

    animFrameId = requestAnimationFrame(drawFrame);
  };

  const bindEvents = () => {
    const el = overlay.getElement();

    el.querySelectorAll('.btn-level').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const lvl = parseInt((e.currentTarget as HTMLElement).getAttribute('data-lvl') || '2', 10);
        recursionLevel = lvl;
        audio.playPencilScratch();
        overlay.open(renderModal(), () => {
          if (animFrameId !== null) cancelAnimationFrame(animFrameId);
        });
        bindEvents();
        startCanvasLoop();
      });
    });

    el.querySelectorAll('.btn-topic').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt((e.currentTarget as HTMLElement).getAttribute('data-idx') || '0', 10);
        activeHofstadterTopic = idx;
        audio.playClockworkTick();
        overlay.open(renderModal(), () => {
          if (animFrameId !== null) cancelAnimationFrame(animFrameId);
        });
        bindEvents();
        startCanvasLoop();
      });
    });

    el.querySelector('#btn-invert-hands')?.addEventListener('click', () => {
      isRightDominant = !isRightDominant;
      audio.playPencilScratch();
      overlay.open(renderModal(), () => {
        if (animFrameId !== null) cancelAnimationFrame(animFrameId);
      });
      bindEvents();
      startCanvasLoop();
    });
  };

  overlay.open(renderModal(), () => {
    if (animFrameId !== null) cancelAnimationFrame(animFrameId);
  });
  bindEvents();
  startCanvasLoop();
}

// =============================================================================
// 3. THE MÖBIUS TERRARIUM (Möbius Strip II, 1963)
// =============================================================================
export function openMobiusModal(_stateManager: StateManager) {
  const overlay = ModalOverlay.getInstance();
  const audio = HearthAudio.getInstance();

  let antDistanceCm = 42.6;
  let currentSurfaceSide: 'Side Alpha (Top)' | 'Side Beta (Bottom)' = 'Side Alpha (Top)';
  let totalLoops = 3;
  let hasCutCenterline = false;
  let antCount = 4;
  let animId: number | null = null;

  const renderModal = () => {
    return `
      <div class="modal-dialog" style="max-width: 740px;">
        <div class="modal-header">
          <div>
            <h2>The Möbius Terrarium (1963)</h2>
            <div class="subtitle">Non-Orientable Topology & The Single-Sided Universe</div>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="margin-bottom: 14px; color: var(--text-muted); font-style: italic; font-size: 0.9rem;">
            Enclosed within a bell jar of blown crystal rests a twisted ribbon of beaten bronze.
            Nine clockwork brass ants march tirelessly along its length, traversing both &ldquo;inner&rdquo; and &ldquo;outer&rdquo; surfaces without ever crossing an edge.
          </p>

          <!-- 3D Topological Canvas -->
          <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-family: Georgia, serif; font-size: 0.95rem; color: #fef08a;">
                Rotational Ribbon Projection
              </span>
              <span style="font-family: monospace; font-size: 0.76rem; color: #38bdf8;">
                Topology: 1 Boundary &bull; Non-Orientable (&chi; = 0)
              </span>
            </div>

            <div style="display: flex; justify-content: center; align-items: center; background: radial-gradient(circle at center, #0f172a 0%, #020617 80%); border-radius: 6px; padding: 8px;">
              <canvas id="mobius-canvas" width="460" height="170"></canvas>
            </div>

            <!-- Ant Odometry Telemetry -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 12px; font-family: monospace; font-size: 0.76rem;">
              <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 4px; border-left: 2px solid #f59e0b;">
                <div style="color: #94a3b8;">Surface Normal:</div>
                <div id="ant-surface-side" style="color: #fefce8; font-weight: bold; margin-top: 2px;">${currentSurfaceSide}</div>
              </div>
              <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 4px; border-left: 2px solid #38bdf8;">
                <div style="color: #94a3b8;">Ant Distance Paced:</div>
                <div id="ant-distance" style="color: #bae6fd; font-weight: bold; margin-top: 2px;">${antDistanceCm.toFixed(1)} cm (${totalLoops} Full Circuits)</div>
              </div>
              <div style="background: rgba(15, 23, 42, 0.7); padding: 8px; border-radius: 4px; border-left: 2px solid #10b981;">
                <div style="color: #94a3b8;">Edges Encountered:</div>
                <div style="color: #34d399; font-weight: bold; margin-top: 2px;">0 (Single Continuous Edge)</div>
              </div>
            </div>
          </div>

          <!-- Interactive Topological Experiments -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; margin-bottom: 16px;">
            <div style="font-family: Georgia, serif; font-size: 0.95rem; color: #fef08a; margin-bottom: 8px;">
              Topological Thought Experiments
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn-primary" id="btn-cut-center" style="font-size: 0.8rem; padding: 6px 12px;">
                ✂️ Cut Ribbon Down Centerline
              </button>
              <button class="btn-secondary" id="btn-add-ant" style="font-size: 0.8rem; padding: 6px 12px;">
                🐜 Release Synchronized Ant (${antCount} Active)
              </button>
              <button class="btn-secondary" id="btn-reset-mobius" style="font-size: 0.8rem; padding: 6px 12px;">
                ↺ Reset Bronze Band
              </button>
            </div>

            <div id="cut-result-box" style="margin-top: 10px; font-size: 0.8rem; color: #cbd5e1; background: rgba(15, 23, 42, 0.8); padding: 10px; border-radius: 4px; border-left: 3px solid ${hasCutCenterline ? '#f87171' : '#64748b'}; line-height: 1.4;">
              ${
                hasCutCenterline
                  ? '<strong>Result of Centerline Cut:</strong> Counter-intuitively, cutting along the centerline does NOT produce two separate strips! It yields <em>one single continuous strip twice as long</em>, with four half-twists (Euler characteristic &chi; = 0, but two-sided/orientable!).'
                  : 'Click above to simulate Augustus Möbius’ famous discovery: cutting a single-twist band in half creates a surprising geometric metamorphosis.'
              }
            </div>
          </div>

          <!-- Historical & Mathematical Backstory -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.82rem; line-height: 1.5;">
            <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid #1e293b; border-radius: 6px; padding: 10px;">
              <h4 style="color: #fef08a; margin-bottom: 4px; font-family: Georgia, serif;">Möbius & Listing (1858)</h4>
              <p style="color: #94a3b8;">
                Discovered simultaneously in 1858 by German mathematicians August Ferdinand Möbius and Johann Benedict Listing. A strip of paper given a half-twist before gluing its ends loses both its second side and its second edge.
              </p>
            </div>
            <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid #1e293b; border-radius: 6px; padding: 10px;">
              <h4 style="color: #bae6fd; margin-bottom: 4px; font-family: Georgia, serif;">Ants on a 720° Circuit</h4>
              <p style="color: #94a3b8;">
                Because of the half-twist, an ant must walk 720° (two full 360° revolutions) around the loop before arriving back in its original position with its head pointing in the original direction.
              </p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary btn-close-modal">Step Away from Terrarium</button>
        </div>
      </div>
    `;
  };

  const startCanvasLoop = () => {
    const canvas = overlay.getElement().querySelector('#mobius-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const drawFrame = (now: number) => {
      const elapsed = (now - startTime) * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const R = 130; // major radius
      const w = 32;  // ribbon half-width
      const segments = 120;

      const tilt = 0.45; // camera tilt
      const rot = elapsed * 0.4; // slow ribbon spin

      ctx.lineWidth = 1.2;

      // Draw Ribbon Segments
      for (let i = 0; i < segments; i++) {
        const u1 = (i / segments) * Math.PI * 2;
        const u2 = ((i + 1) / segments) * Math.PI * 2;

        const project = (u: number, v: number) => {
          const uRot = u + rot;
          const px = (R + v * Math.cos(u / 2)) * Math.cos(uRot);
          const py3d = (R + v * Math.cos(u / 2)) * Math.sin(uRot);
          const pz3d = v * Math.sin(u / 2);

          const screenX = cx + px;
          const screenY = cy + py3d * Math.sin(tilt) - pz3d * Math.cos(tilt);
          return { x: screenX, y: screenY, z: py3d * Math.cos(tilt) + pz3d * Math.sin(tilt) };
        };

        const p1 = project(u1, -w);
        const p2 = project(u1, w);
        const p3 = project(u2, w);
        const p4 = project(u2, -w);

        const isBack = p1.z < 0 && p2.z < 0;
        const shade = Math.sin(u1 + rot) * 0.5 + 0.5;
        const baseBronze = isBack ? '#78350f' : '#b45309';
        const highlight = isBack ? '#451a03' : '#d97706';

        ctx.fillStyle = shade > 0.5 ? highlight : baseBronze;
        ctx.strokeStyle = hasCutCenterline ? '#ef4444' : '#f59e0b';

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fill();

        if (i % 6 === 0 || hasCutCenterline) {
          ctx.stroke();
        }

        if (hasCutCenterline && i % 2 === 0) {
          const mid1 = project(u1, 0);
          const mid2 = project(u2, 0);
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(mid1.x, mid1.y);
          ctx.lineTo(mid2.x, mid2.y);
          ctx.stroke();
          ctx.lineWidth = 1.2;
        }
      }

      // Draw Marching Clockwork Ants along the single continuous track
      for (let a = 0; a < antCount; a++) {
        const antSpeed = 0.6;
        const antU = (elapsed * antSpeed + (a * Math.PI * 4) / antCount) % (Math.PI * 4);
        const antSideV = 0;

        const uRot = antU + rot;
        const px = (R + antSideV * Math.cos(antU / 2)) * Math.cos(uRot);
        const py3d = (R + antSideV * Math.cos(antU / 2)) * Math.sin(uRot);
        const pz3d = antSideV * Math.sin(antU / 2);

        const ax = cx + px;
        const ay = cy + py3d * Math.sin(tilt) - pz3d * Math.cos(tilt);

        const isFlipped = antU > Math.PI * 2;
        ctx.fillStyle = isFlipped ? '#38bdf8' : '#fbbf24';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.arc(ax, ay, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(ax + 3, ay, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ax + 5.5, ay, 1.5, 0, Math.PI * 2);
        ctx.fill();

        const legWalk = Math.sin(elapsed * 12 + a) * 3;
        ctx.strokeStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 3, ay - 4 + legWalk);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + 3, ay - 4 - legWalk);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 3, ay + 4 - legWalk);
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + 3, ay + 4 + legWalk);
        ctx.stroke();

        if (a === 0) {
          currentSurfaceSide = isFlipped ? 'Side Beta (Bottom)' : 'Side Alpha (Top)';
          antDistanceCm += 0.015;
          totalLoops = Math.floor(antDistanceCm / 14);

          const sideEl = overlay.getElement().querySelector('#ant-surface-side');
          const distEl = overlay.getElement().querySelector('#ant-distance');
          if (sideEl) sideEl.textContent = currentSurfaceSide;
          if (distEl) distEl.textContent = `${antDistanceCm.toFixed(1)} cm (${totalLoops} Full Circuits)`;
        }
      }

      animId = requestAnimationFrame(drawFrame);
    };

    animId = requestAnimationFrame(drawFrame);
  };

  const bindEvents = () => {
    const el = overlay.getElement();

    el.querySelector('#btn-cut-center')?.addEventListener('click', () => {
      hasCutCenterline = true;
      audio.playClockworkTick();
      overlay.open(renderModal(), () => {
        if (animId !== null) cancelAnimationFrame(animId);
      });
      bindEvents();
      startCanvasLoop();
    });

    el.querySelector('#btn-add-ant')?.addEventListener('click', () => {
      if (antCount < 8) antCount++;
      audio.playClockworkTick();
      overlay.open(renderModal(), () => {
        if (animId !== null) cancelAnimationFrame(animId);
      });
      bindEvents();
      startCanvasLoop();
    });

    el.querySelector('#btn-reset-mobius')?.addEventListener('click', () => {
      hasCutCenterline = false;
      antCount = 4;
      antDistanceCm = 42.6;
      audio.playClockworkTick();
      overlay.open(renderModal(), () => {
        if (animId !== null) cancelAnimationFrame(animId);
      });
      bindEvents();
      startCanvasLoop();
    });
  };

  overlay.open(renderModal(), () => {
    if (animId !== null) cancelAnimationFrame(animId);
  });
  bindEvents();
  startCanvasLoop();
}

// =============================================================================
// 4. THE PENROSE ENDLESS STAIRCASE MODAL (Ascending and Descending, 1960)
// =============================================================================
export function openPenroseModal(_stateManager: StateManager) {
  const overlay = ModalOverlay.getInstance();
  const audio = HearthAudio.getInstance();

  let stepsClimbed = 1024;
  let isAscending = true;
  let cadenceBpm = 54;

  const renderModal = () => {
    return `
      <div class="modal-dialog" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <h2>Ascending and Descending (1960)</h2>
            <div class="subtitle">The Penrose Endless Staircase & Monk's Vigil</div>
          </div>
          <button class="modal-close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <p style="margin-bottom: 14px; color: var(--text-muted); font-style: italic; font-size: 0.9rem;">
            Upon the rooftop courtyard of an enigmatic monastery, robed pilgrims tread a four-sided endless staircase.
            Though every step climbs steadily higher, the courtyard returns to its origin in an unbroken circuit of devotion.
          </p>

          <!-- Elevation & Step Telemetry -->
          <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; font-family: monospace; font-size: 0.8rem;">
              <div style="background: rgba(15, 23, 42, 0.7); padding: 10px; border-radius: 4px; border-left: 3px solid #f59e0b;">
                <div style="color: #94a3b8;">Steps Paced:</div>
                <div id="steps-counter" style="color: #fefce8; font-size: 1.1rem; font-weight: bold; margin-top: 4px;">${stepsClimbed}</div>
              </div>
              <div style="background: rgba(15, 23, 42, 0.7); padding: 10px; border-radius: 4px; border-left: 3px solid #38bdf8;">
                <div style="color: #94a3b8;">Net Elevation:</div>
                <div style="color: #38bdf8; font-size: 1.1rem; font-weight: bold; margin-top: 4px;">0.00 meters</div>
              </div>
              <div style="background: rgba(15, 23, 42, 0.7); padding: 10px; border-radius: 4px; border-left: 3px solid #10b981;">
                <div style="color: #94a3b8;">Pilgrim State:</div>
                <div id="pilgrim-state-label" style="color: #34d399; font-size: 1.1rem; font-weight: bold; margin-top: 4px;">
                  ${isAscending ? 'Endless Ascent' : 'Endless Descent'}
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 14px; align-items: center; justify-content: space-between;">
              <div style="display: flex; gap: 8px;">
                <button class="btn-secondary" id="btn-toggle-direction" style="font-size: 0.78rem;">
                  🔄 Invert Direction (${isAscending ? 'Descend' : 'Ascend'})
                </button>
                <button class="btn-secondary" id="btn-step-pace" style="font-size: 0.78rem;">
                  ⏱️ Cadence: ${cadenceBpm} BPM
                </button>
              </div>

              <span style="font-family: monospace; font-size: 0.75rem; color: #f59e0b;">
                Shepard Tone Pitch: Invariant
              </span>
            </div>
          </div>

          <!-- Lionel & Roger Penrose Monograph Analysis -->
          <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 6px; padding: 14px; font-size: 0.84rem; line-height: 1.5;">
            <h4 style="color: #fef08a; font-family: Georgia, serif; margin-bottom: 6px;">The Psychology of Impossible Geometry</h4>
            <p style="color: #cbd5e1; margin-bottom: 8px;">
              In 1958, Lionel Penrose (psychiatrist) and his son Roger (mathematician) published a brief paper titled <em>&ldquo;Impossible Objects: A Special Type of Visual Illusion&rdquo;</em> in the <em>British Journal of Psychology</em>.
              They sent a reprint to Escher, who was so inspired that he drafted both <em>Ascending and Descending</em> and <em>Waterfall</em>.
            </p>
            <p style="color: #94a3b8;">
              Escher noted: &ldquo;A robed order of monks treads the steps round and round. Two individuals decline to take part; they sit in the courtyard, pondering the futility of the enterprise.&rdquo;
            </p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary btn-close-modal">Step Down from Courtyard</button>
        </div>
      </div>
    `;
  };

  const bindEvents = () => {
    const el = overlay.getElement();

    el.querySelector('#btn-toggle-direction')?.addEventListener('click', () => {
      isAscending = !isAscending;
      audio.playClockworkTick();
      overlay.open(renderModal());
      bindEvents();
    });

    el.querySelector('#btn-step-pace')?.addEventListener('click', () => {
      cadenceBpm = cadenceBpm === 54 ? 72 : cadenceBpm === 72 ? 40 : 54;
      audio.playClockworkTick();
      overlay.open(renderModal());
      bindEvents();
    });
  };

  overlay.open(renderModal());
  bindEvents();
}
