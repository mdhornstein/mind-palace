import { CoinPhysicsEngine } from '../rooms/coins/coinPhysics';
import { HearthAudio } from '../sound/audio';
import { CANVAS_WIDTH } from '../core/constants';
import { ModalOverlay } from './overlay';
import { executeRingingStoneStrike, getStoneNoteIndex } from '../rooms/coins/ringingStoneActions';
import { executeTallyBoardPour } from '../rooms/coins/tallyBoardActions';
import { MintConductor } from '../rooms/coins/mintConductor';

function closeActiveModal() {
  ModalOverlay.getInstance().close();
}

function createModalContainer(
  title: string,
  subtitle?: string,
  onClose?: () => void
): { overlay: HTMLElement; body: HTMLElement } {
  const overlayInstance = ModalOverlay.getInstance();
  overlayInstance.close();

  const container = document.createElement('div');
  container.className = 'modal-dialog';
  container.style.background = 'linear-gradient(175deg, #1f1610 0%, #120e0a 100%)';
  container.style.border = '1.5px solid #78350f';
  container.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.85), 0 0 45px rgba(217, 119, 6, 0.15)';
  container.style.borderRadius = '10px';
  container.style.maxWidth = '520px';
  container.style.width = '90%';
  container.style.color = '#fefce8';
  container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  container.style.overflow = 'hidden';

  const header = document.createElement('div');
  header.style.padding = '16px 20px';
  header.style.borderBottom = '1px solid #451a03';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.background = 'rgba(0, 0, 0, 0.25)';

  const titleWrap = document.createElement('div');
  const h2 = document.createElement('h2');
  h2.innerText = title;
  h2.style.fontSize = '1.15rem';
  h2.style.fontWeight = '700';
  h2.style.color = '#fef08a';
  h2.style.margin = '0';
  titleWrap.appendChild(h2);

  if (subtitle) {
    const sub = document.createElement('div');
    sub.innerText = subtitle;
    sub.style.fontSize = '0.78rem';
    sub.style.color = '#cbd5e1';
    sub.style.marginTop = '2px';
    titleWrap.appendChild(sub);
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.color = '#94a3b8';
  closeBtn.style.fontSize = '1.6rem';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.lineHeight = '1';
  closeBtn.onclick = () => overlayInstance.close();

  header.appendChild(titleWrap);
  header.appendChild(closeBtn);
  container.appendChild(header);

  const body = document.createElement('div');
  body.className = 'modal-body';
  body.style.padding = '20px';
  body.style.userSelect = 'text';
  body.style.webkitUserSelect = 'text';
  container.appendChild(body);

  overlayInstance.openElement(container, onClose);

  return { overlay: overlayInstance.getElement(), body };
}

/**
 * The Grand Minting Engine Modal
 */
export function openCoinPressModal() {
  const engine = CoinPhysicsEngine.getInstance();
  const conductor = MintConductor.getInstance();
  const { body } = createModalContainer(
    '⚙️ The Grand Minting Engine',
    'Industrial Steam Coining Press — Sovereign Stamping Station'
  );

  body.innerHTML = `
    <div style="font-size: 0.88rem; line-height: 1.5; color: #e2e8f0; margin-bottom: 16px;">
      A massive Victorian flywheel rotates with polished bronze cams, driving an 80-ton stamping piston. 
      Raw metallurgical blanks enter the hopper and are struck with the sovereign seal, tumbling down the ejection chute.
    </div>

    <!-- Steam Line-Shaft Drive (Automated Rhythm) -->
    <div style="background: rgba(0,0,0,0.4); border: 1.5px solid #78350f; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: #fef08a; text-transform: uppercase; letter-spacing: 0.04em;">
          ⚙️ Steam Line-Shaft Drive
        </div>
        <div id="press-cadence-badge" style="font-size: 0.68rem; font-family: monospace; padding: 2px 8px; border-radius: 4px; font-weight: bold;">
        </div>
      </div>
      <div style="font-size: 0.78rem; line-height: 1.4; color: #cbd5e1; margin-bottom: 10px;">
        Engage the overhead leather line-shaft to drive the 80-ton stamping piston in an automated rhythmic cadence.
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <button id="btn-press-cadence-off" style="padding: 8px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease;">
          ⏹ Disengaged (Manual)
        </button>
        <button id="btn-press-cadence-four" style="padding: 8px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease;">
          🥁 Four-on-the-Floor (105 BPM)
        </button>
      </div>
    </div>

    <div style="background: rgba(0,0,0,0.35); border: 1px solid #451a03; border-radius: 6px; padding: 12px; margin-bottom: 18px; display: flex; justify-content: space-around; text-align: center;">
      <div>
        <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Total Minted</div>
        <div style="font-size: 1.25rem; font-weight: bold; color: #facc15;">🪙 ${engine.getTotalMinted()}</div>
      </div>
      <div style="width: 1px; background: #451a03;"></div>
      <div>
        <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Collected in Purse</div>
        <div style="font-size: 1.25rem; font-weight: bold; color: #4ade80;">🪙 ${engine.getTotalCollected()}</div>
      </div>
    </div>

    <div style="font-size: 0.8rem; font-weight: 600; color: #fef08a; margin-bottom: 8px; text-transform: uppercase;">Manual Stamping Actions</div>
    <div style="display: flex; flex-direction: column; gap: 10px;">
      <button id="btn-stamp-batch" style="background: #b45309; border: 1px solid #f59e0b; color: #fff; padding: 10px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
        <span>🔨 Crank Batch Stamp (6 Coins)</span>
        <span style="font-size: 0.75rem; background: rgba(0,0,0,0.25); padding: 2px 6px; border-radius: 4px;">Burst to Floor</span>
      </button>

      <button id="btn-stamp-gold" style="background: #854d0e; border: 1px solid #eab308; color: #fff; padding: 10px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
        <span>✨ Mint Royal Gold Sovereign</span>
        <span style="font-size: 0.75rem; background: rgba(0,0,0,0.25); padding: 2px 6px; border-radius: 4px;">10 Value</span>
      </button>

      <button id="btn-stamp-jackpot" style="background: #0369a1; border: 1px solid #38bdf8; color: #fff; padding: 10px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
        <span>⚡ High-Pressure Steam Burst (15 Coins!)</span>
        <span style="font-size: 0.75rem; background: rgba(0,0,0,0.25); padding: 2px 6px; border-radius: 4px;">Coin Shower</span>
      </button>
    </div>

    <div style="margin-top: 16px; font-size: 0.75rem; color: #94a3b8; text-align: center;">
      Tip: Coins bounce with real 2.5D physical trajectories. Walk across the room to collect them!
    </div>
  `;

  // Update line-shaft drive UI state
  const badgeEl = body.querySelector('#press-cadence-badge') as HTMLElement;
  const btnOff = body.querySelector('#btn-press-cadence-off') as HTMLButtonElement;
  const btnFour = body.querySelector('#btn-press-cadence-four') as HTMLButtonElement;

  function updateCadenceUI() {
    const cadence = conductor.getPressCadence();
    if (cadence === 'four_on_the_floor') {
      if (badgeEl) {
        badgeEl.innerText = 'DRIVE: 105 BPM ♩ FOUR-ON-FLOOR';
        badgeEl.style.background = 'rgba(22, 101, 52, 0.45)';
        badgeEl.style.color = '#4ade80';
        badgeEl.style.border = '1px solid #16a34a';
      }
      if (btnOff) {
        btnOff.style.background = 'rgba(0, 0, 0, 0.3)';
        btnOff.style.border = '1px solid #44403c';
        btnOff.style.color = '#94a3b8';
      }
      if (btnFour) {
        btnFour.style.background = 'linear-gradient(180deg, #b45309 0%, #78350f 100%)';
        btnFour.style.border = '1px solid #f59e0b';
        btnFour.style.color = '#ffffff';
        btnFour.style.boxShadow = '0 0 12px rgba(245, 158, 11, 0.35)';
      }
    } else {
      if (badgeEl) {
        badgeEl.innerText = 'DRIVE: DISENGAGED (IDLE)';
        badgeEl.style.background = '#292524';
        badgeEl.style.color = '#a8a29e';
        badgeEl.style.border = '1px solid #44403c';
      }
      if (btnOff) {
        btnOff.style.background = '#44403c';
        btnOff.style.border = '1.5px solid #a8a29e';
        btnOff.style.color = '#f8fafc';
      }
      if (btnFour) {
        btnFour.style.background = 'rgba(0, 0, 0, 0.3)';
        btnFour.style.border = '1px solid #451a03';
        btnFour.style.color = '#94a3b8';
        btnFour.style.boxShadow = 'none';
      }
    }
  }

  updateCadenceUI();

  btnOff?.addEventListener('click', () => {
    conductor.setPressCadence('off');
    updateCadenceUI();
  });

  btnFour?.addEventListener('click', () => {
    conductor.setPressCadence('four_on_the_floor');
    updateCadenceUI();
  });

  // Stamping origin: in front of the press at tile (7, 4.5) -> (224px, 144px)
  const spawnX = 224;
  const spawnY = 144;

  body.querySelector('#btn-stamp-batch')?.addEventListener('click', () => {
    engine.spawnBurst(spawnX, spawnY, 6);
    closeActiveModal();
  });

  body.querySelector('#btn-stamp-gold')?.addEventListener('click', () => {
    engine.spawnBurst(spawnX, spawnY, 2, 'gold');
    closeActiveModal();
  });

  body.querySelector('#btn-stamp-jackpot')?.addEventListener('click', () => {
    engine.spawnBurst(spawnX, spawnY, 15);
    closeActiveModal();
  });
}

/**
 * The Gilded Chute (Plinko / Pachinko Drop Mini-Game)
 */
export function openPlinkoModal() {
  const engine = CoinPhysicsEngine.getInstance();
  const audio = HearthAudio.getInstance();
  const conductor = MintConductor.getInstance();
  let isPlinkoRunning = true;
  const { body } = createModalContainer(
    '🎰 The Gilded Chute',
    'Galton Pegboard & Continuous Hopper Groove',
    () => {
      isPlinkoRunning = false;
    }
  );

  const canvasWidth = 360;
  const canvasHeight = 240;

  body.innerHTML = `
    <div style="font-size: 0.84rem; color: #cbd5e1; margin-bottom: 10px; line-height: 1.4;">
      Insert sovereigns into the gilded glass chute. As they deflect through staggered brass pins,
      binomial probability governs their path. Synchronize the continuous hopper escapement to lay down a driving 16th-note shaker groove.
    </div>

    <!-- Kinetic DAW Hopper Cadence Controller -->
    <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid #451a03; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; color: #f59e0b; text-transform: uppercase;">
          ⚙️ Kinetic DAW • Continuous Hopper Feed
        </span>
        <span id="plinko-cadence-badge" style="font-family: monospace; font-size: 0.66rem; font-weight: bold; padding: 2px 8px; border-radius: 4px; border: 1px solid #44403c; background: #292524; color: #a8a29e;">
          HOPPER: DISENGAGED (MANUAL ONLY)
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px;">
        <button id="btn-plinko-cadence-off" style="padding: 6px 8px; border-radius: 5px; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; text-align: center;">
          ⏹ Disengaged<br/><span style="font-size: 0.65rem; opacity: 0.8; font-weight: normal;">Manual Only</span>
        </button>
        <button id="btn-plinko-cadence-shaker" style="padding: 6px 8px; border-radius: 5px; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; text-align: center;">
          ✨ 16th Shaker<br/><span style="font-size: 0.65rem; opacity: 0.8; font-weight: normal;">Hi-Hat Cascade</span>
        </button>
        <button id="btn-plinko-cadence-offbeat" style="padding: 6px 8px; border-radius: 5px; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; text-align: center;">
          🎲 Offbeat Pings<br/><span style="font-size: 0.65rem; opacity: 0.8; font-weight: normal;">Syncopated Ticks</span>
        </button>
      </div>
    </div>

    <div style="display: flex; justify-content: center; margin-bottom: 12px;">
      <canvas id="plinkoCanvas" width="${canvasWidth}" height="${canvasHeight}" style="background: #0d0a07; border: 1.5px solid #78350f; border-radius: 6px; box-shadow: inset 0 0 15px rgba(0,0,0,0.8);"></canvas>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 0.8rem; color: #fef08a;">
        Purse: <b>🪙 ${engine.getTotalCollected()}</b>
      </div>
      <button id="btn-plinko-drop" style="background: #d97706; border: 1px solid #fbbf24; color: #fff; padding: 8px 18px; border-radius: 5px; font-weight: bold; cursor: pointer;">
        Drop Coin (Free Play)
      </button>
    </div>
  `;

  // Cadence buttons and badge wiring
  const plinkoBadgeEl = body.querySelector('#plinko-cadence-badge') as HTMLElement;
  const btnPlinkoOff = body.querySelector('#btn-plinko-cadence-off') as HTMLButtonElement;
  const btnPlinkoShaker = body.querySelector('#btn-plinko-cadence-shaker') as HTMLButtonElement;
  const btnPlinkoOffbeat = body.querySelector('#btn-plinko-cadence-offbeat') as HTMLButtonElement;

  const cadenceButtons: Record<string, HTMLButtonElement | null> = {
    off: btnPlinkoOff,
    sixteenth_shaker: btnPlinkoShaker,
    offbeat_pings: btnPlinkoOffbeat,
  };

  function updatePlinkoCadenceUI() {
    const cadence = conductor.getPlinkoCadence();
    const badgeConfigs: Record<string, { text: string; bg: string; color: string; border: string }> = {
      off: { text: 'HOPPER: DISENGAGED (MANUAL ONLY)', bg: '#292524', color: '#a8a29e', border: '#44403c' },
      sixteenth_shaker: { text: 'HOPPER: 105 BPM 16TH SHAKER (HI-HAT)', bg: 'rgba(217, 119, 6, 0.4)', color: '#fef08a', border: '#d97706' },
      offbeat_pings: { text: 'HOPPER: 105 BPM OFFBEAT BINOMIAL PINGS', bg: 'rgba(16, 185, 129, 0.35)', color: '#6ee7b7', border: '#10b981' },
    };

    const cfg = badgeConfigs[cadence] || badgeConfigs.off;
    if (plinkoBadgeEl) {
      plinkoBadgeEl.innerText = cfg.text;
      plinkoBadgeEl.style.background = cfg.bg;
      plinkoBadgeEl.style.color = cfg.color;
      plinkoBadgeEl.style.border = `1px solid ${cfg.border}`;
    }

    Object.entries(cadenceButtons).forEach(([key, btn]) => {
      if (!btn) return;
      if (key === cadence) {
        if (key === 'off') {
          btn.style.background = '#44403c';
          btn.style.border = '1.5px solid #a8a29e';
          btn.style.color = '#f8fafc';
          btn.style.boxShadow = 'none';
        } else if (key === 'sixteenth_shaker') {
          btn.style.background = 'linear-gradient(180deg, #b45309 0%, #78350f 100%)';
          btn.style.border = '1.5px solid #f59e0b';
          btn.style.color = '#ffffff';
          btn.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.35)';
        } else {
          btn.style.background = 'linear-gradient(180deg, #059669 0%, #065f46 100%)';
          btn.style.border = '1.5px solid #34d399';
          btn.style.color = '#ffffff';
          btn.style.boxShadow = '0 0 10px rgba(52, 211, 153, 0.35)';
        }
      } else {
        btn.style.background = 'rgba(0, 0, 0, 0.3)';
        btn.style.border = '1px solid #44403c';
        btn.style.color = '#94a3b8';
        btn.style.boxShadow = 'none';
      }
    });
  }

  updatePlinkoCadenceUI();

  btnPlinkoOff?.addEventListener('click', () => {
    conductor.setPlinkoCadence('off');
    updatePlinkoCadenceUI();
  });

  btnPlinkoShaker?.addEventListener('click', () => {
    conductor.setPlinkoCadence('sixteenth_shaker');
    updatePlinkoCadenceUI();
  });

  btnPlinkoOffbeat?.addEventListener('click', () => {
    conductor.setPlinkoCadence('offbeat_pings');
    updatePlinkoCadenceUI();
  });

  const canvas = body.querySelector('#plinkoCanvas') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Pegboard geometry: 6 rows of staggered pins
  const rows = 6;
  const pins: Array<{ x: number; y: number }> = [];
  const startY = 35;
  const rowSpacing = 28;

  for (let r = 0; r < rows; r++) {
    const count = r + 3;
    const spacing = 38;
    const rowWidth = (count - 1) * spacing;
    const startX = (canvasWidth - rowWidth) / 2;
    for (let c = 0; c < count; c++) {
      pins.push({
        x: startX + c * spacing,
        y: startY + r * rowSpacing,
      });
    }
  }

  // Multiplier bins at bottom
  const bins = [
    { label: '2x', mult: 2, color: '#f59e0b', x: 20, w: 60 },
    { label: '1x', mult: 1, color: '#94a3b8', x: 86, w: 56 },
    { label: '★ 5x ★', mult: 5, color: '#38bdf8', x: 148, w: 64 },
    { label: '1x', mult: 1, color: '#94a3b8', x: 218, w: 56 },
    { label: '2x', mult: 2, color: '#f59e0b', x: 280, w: 60 },
  ];

  interface Ball {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    active: boolean;
    isAutomated?: boolean;
  }

  const balls: Ball[] = [];
  let lastAutoDropTime = 0;

  function drawPlinko() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const now = Date.now();

    // Spawn rhythmic visualization balls if automated cadence is active
    const cadence = conductor.getPlinkoCadence();
    if (cadence !== 'off') {
      const intervalMs = cadence === 'sixteenth_shaker' ? (60000 / 105 / 2) : (60000 / 105);
      if (now - lastAutoDropTime >= intervalMs && balls.length < 8) {
        lastAutoDropTime = now;
        balls.push({
          x: canvasWidth / 2 + (Math.random() - 0.5) * 16,
          y: 6,
          vx: (Math.random() - 0.5) * 1.2,
          vy: 1.1,
          radius: 4.2,
          active: true,
          isAutomated: true,
        });
      }
    }

    // 1. Draw Multiplier Buckets
    bins.forEach((b) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(b.x, canvasHeight - 34, b.w, 32);
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(b.x, canvasHeight - 34, b.w, 32);

      ctx.fillStyle = b.color;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, b.x + b.w / 2, canvasHeight - 18);
    });

    // 2. Draw Brass Pins
    for (const p of pins) {
      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(p.x, p.y + 1.5, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Brass pin head
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.0, 0, Math.PI * 2);
      ctx.fill();

      // Highlight glint
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(p.x - 0.8, p.y - 0.8, 1.0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw and Update Active Dropping Balls
    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      if (!b.active) continue;

      b.vy += 0.25; // gravity
      b.x += b.vx;
      b.y += b.vy;

      // Pin collisions
      for (const p of pins) {
        const dx = b.x - p.x;
        const dy = b.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < b.radius + 3.0) {
          // Only manual drops sound the individual peg hit here to prevent doubling automated lookahead audio
          if (!b.isAutomated) {
            audio.playPlinkoPegHit();
          }
          // Bounce off peg
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          const dot = b.vx * nx + b.vy * ny;
          b.vx = (b.vx - 1.6 * dot * nx) + (Math.random() - 0.5) * 0.8;
          b.vy = (b.vy - 1.6 * dot * ny) * 0.7;
          b.x = p.x + nx * (b.radius + 3.2);
          b.y = p.y + ny * (b.radius + 3.2);
        }
      }

      // Wall boundaries
      if (b.x < b.radius + 10) {
        b.x = b.radius + 10;
        b.vx = Math.abs(b.vx) * 0.7;
      } else if (b.x > canvasWidth - b.radius - 10) {
        b.x = canvasWidth - b.radius - 10;
        b.vx = -Math.abs(b.vx) * 0.7;
      }

      // Check bucket landing
      if (b.y > canvasHeight - 24) {
        b.active = false;
        // Check which bin it landed in
        const landedBin = bins.find((bin) => b.x >= bin.x && b.x <= bin.x + bin.w) || bins[1];
        // Celebrate for manual drops! Spawn physical coins onto the real room floor!
        if (!b.isAutomated) {
          engine.spawnBurst(CANVAS_WIDTH / 2, 240, landedBin.mult * 2);
        }
      }

      // Draw shiny gold ball
      ctx.fillStyle = b.isAutomated ? '#fde047' : '#eab308';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (isPlinkoRunning) {
      requestAnimationFrame(drawPlinko);
    }
  }

  requestAnimationFrame(drawPlinko);

  body.querySelector('#btn-plinko-drop')?.addEventListener('click', () => {
    balls.push({
      x: canvasWidth / 2 + (Math.random() - 0.5) * 24,
      y: 8,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 1.2,
      radius: 5.5,
      active: true,
      isAutomated: false,
    });
  });
}

/**
 * The Treasury Wishing Well Modal
 */
export function openWishingWellModal() {
  const engine = CoinPhysicsEngine.getInstance();
  const audio = HearthAudio.getInstance();
  const { body } = createModalContainer(
    '⛲ The Treasury Wishing Well',
    'Sunken Basin of the Royal Reservoir'
  );

  const aphorisms = [
    '“A coin in motion carries potential; a coin hoarded is merely stone.”',
    '“The geometry of the palace expands in proportion to what you create within it.”',
    '“Every masterwork begins as a blank disc waiting for the die.”',
    '“A single thought, dropped into quiet waters, sends ripples across all chambers.”',
  ];
  const selectedQuote = aphorisms[Math.floor(Math.random() * aphorisms.length)];

  body.innerHTML = `
    <div style="font-size: 0.88rem; line-height: 1.5; color: #cbd5e1; margin-bottom: 14px;">
      Clear spring water circulates through a marble fountain carved with acanthus leaves. 
      The quiet bottom gleams with coins tossed by previous visitors.
    </div>

    <div style="background: rgba(14, 165, 233, 0.08); border-left: 3px solid #38bdf8; padding: 12px 16px; font-style: italic; color: #e0f2fe; margin-bottom: 18px; font-size: 0.88rem;">
      ${selectedQuote}
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-size: 0.82rem; color: #94a3b8;">
        Floor Coins: <b>🪙 ${engine.getTotalCollected()}</b>
      </div>
      <button id="btn-toss-coin" style="background: #0284c7; border: 1px solid #38bdf8; color: #fff; padding: 8px 18px; border-radius: 5px; font-weight: bold; cursor: pointer;">
        Toss 1 Coin for Good Fortune
      </button>
    </div>
  `;

  body.querySelector('#btn-toss-coin')?.addEventListener('click', () => {
    audio.playFountainSplash();
    // Toss 1 coin into fountain and spray back 2 lucky ones (suppress coin press audio)
    engine.spawnBurst(CANVAS_WIDTH / 2, 280, 2, 'star', 32, false);
    closeActiveModal();
  });
}

/**
 * The Sovereign Balance Scale Modal
 */
export function openVaultScaleModal() {
  const engine = CoinPhysicsEngine.getInstance();
  const { body } = createModalContainer(
    '⚖️ The Sovereign Balance',
    'Numismatic Weights & Treasury Record'
  );

  const collected = engine.getTotalCollected();
  const minted = engine.getTotalMinted();
  const goldOunces = (collected * 0.25).toFixed(1);

  body.innerHTML = `
    <div style="font-size: 0.86rem; line-height: 1.5; color: #cbd5e1; margin-bottom: 16px;">
      Twin brass balance pans suspended by braided silken cords measure the exact standard weight of sovereign coinage against calibrated basalt weights.
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px;">
      <div style="background: rgba(0,0,0,0.3); border: 1px solid #451a03; border-radius: 6px; padding: 12px;">
        <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Total Minted</div>
        <div style="font-size: 1.3rem; font-weight: bold; color: #facc15; margin-top: 4px;">🪙 ${minted}</div>
        <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">Cumulative Stamped</div>
      </div>
      <div style="background: rgba(0,0,0,0.3); border: 1px solid #451a03; border-radius: 6px; padding: 12px;">
        <div style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">Total Collected</div>
        <div style="font-size: 1.3rem; font-weight: bold; color: #4ade80; margin-top: 4px;">🪙 ${collected}</div>
        <div style="font-size: 0.72rem; color: #64748b; margin-top: 2px;">In Sovereign Vault</div>
      </div>
    </div>

    <div style="font-size: 0.78rem; color: #94a3b8; line-height: 1.4; border-top: 1px solid #332014; padding-top: 12px;">
      Equivalent Mass: <b>${goldOunces} troy ounces</b> of 22-karat sovereign bullion.
    </div>
  `;
}

/**
 * The Assayer's Ringing Stone Modal
 */
export function openRingingStoneModal() {
  const audio = HearthAudio.getInstance();

  let animFrameId: number | null = null;

  const { body } = createModalContainer(
    '🔔 The Assayer\'s Ringing Stone',
    'Horological Acoustic Anvil — Carillon Escapement Calibrated to the Master Clock',
    () => {
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    }
  );

  const conductor = MintConductor.getInstance();

  body.innerHTML = `
    <div style="font-size: 0.86rem; line-height: 1.5; color: #cbd5e1; margin-bottom: 14px;">
      In the Royal Mint, assayers tested struck coins by sounding them against a polished basalt anvil.
      Genuine 22-karat crown gold and sterling silver ring with a sustained, piercing harmonic bell tone,
      while debased pewter or lead counterfeits produce a dull, deadened thud.
    </div>

    <!-- Clockwork Carillon Escapement (Automated Rhythm & Music) -->
    <div style="background: rgba(0,0,0,0.4); border: 1.5px solid #78350f; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="font-size: 0.8rem; font-weight: 700; color: #fef08a; text-transform: uppercase; letter-spacing: 0.04em;">
          🕰️ Clockwork Carillon Escapement
        </div>
        <div id="stone-cadence-badge" style="font-size: 0.68rem; font-family: monospace; padding: 2px 8px; border-radius: 4px; font-weight: bold;">
        </div>
      </div>
      <div style="font-size: 0.78rem; line-height: 1.4; color: #cbd5e1; margin-bottom: 10px;">
        Engage the pinned barrel escapement to sound the basalt acoustic anvil in an automated musical pattern.
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <button id="btn-stone-cadence-off" style="width: 100%; padding: 8px 12px; border-radius: 6px; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; text-align: left; display: flex; justify-content: space-between; align-items: center;">
          <span>⏹ Disengaged (Manual Strikes Only)</span>
          <span style="font-size: 0.68rem; opacity: 0.75;">Idle</span>
        </button>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <button id="btn-stone-cadence-quarter" style="padding: 8px 10px; border-radius: 6px; font-size: 0.76rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; text-align: left;">
            🔔 Quarter Bell<br/><span style="font-size: 0.68rem; opacity: 0.8; font-weight: normal;">Relaxed 1/4 note (571ms)</span>
          </button>
          <button id="btn-stone-cadence-offbeat" style="padding: 8px 10px; border-radius: 6px; font-size: 0.76rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; text-align: left;">
            ✨ Syncopated Ping<br/><span style="font-size: 0.68rem; opacity: 0.8; font-weight: normal;">Upbeats (Locks with kick)</span>
          </button>
          <button id="btn-stone-cadence-drone" style="padding: 8px 10px; border-radius: 6px; font-size: 0.76rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; text-align: left;">
            🧘 Sovereign Drone<br/><span style="font-size: 0.68rem; opacity: 0.8; font-weight: normal;">Whole note (Deep gong)</span>
          </button>
          <button id="btn-stone-cadence-arp" style="padding: 8px 10px; border-radius: 6px; font-size: 0.76rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; text-align: left;">
            🎶 Music Box Arp<br/><span style="font-size: 0.68rem; opacity: 0.8; font-weight: normal;">Crisp 1/8 note cascade</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Acoustic Waveform Visualizer -->
    <div style="margin-bottom: 14px; position: relative;">
      <canvas id="acoustic-oscilloscope" width="460" height="84" style="width: 100%; height: 84px; background: #080604; border: 1px solid #451a03; border-radius: 6px; display: block;"></canvas>
      <div id="oscilloscope-label" style="position: absolute; top: 6px; right: 10px; font-size: 0.68rem; font-family: monospace; color: #94a3b8; letter-spacing: 0.05em;">RESONANCE: IDLE</div>
    </div>

    <!-- Sounding Buttons Grid -->
    <div style="font-size: 0.8rem; font-weight: 600; color: #fef08a; margin-bottom: 8px; text-transform: uppercase;">Manual Diagnostic Strikes</div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
      <button id="btn-sound-gold" style="background: linear-gradient(180deg, #854d0e 0%, #451a03 100%); border: 1px solid #d97706; color: #fef08a; padding: 9px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span>👑</span> Crown Sovereign (Gold)
      </button>
      <button id="btn-sound-silver" style="background: linear-gradient(180deg, #334155 0%, #1e293b 100%); border: 1px solid #94a3b8; color: #f1f5f9; padding: 9px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span>🪙</span> Sterling Shilling (Silver)
      </button>
      <button id="btn-sound-counterfeit" style="background: linear-gradient(180deg, #292524 0%, #1c1917 100%); border: 1px solid #78716c; color: #a8a29e; padding: 9px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span>☠️</span> Debased Pewter (Fake)
      </button>
      <button id="btn-sound-strike" style="background: linear-gradient(180deg, #ca8a04 0%, #713f12 100%); border: 1px solid #facc15; color: #ffffff; padding: 9px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span>🔨</span> Sound Stone (Scale)
      </button>
    </div>

    <div style="font-size: 0.76rem; color: #94a3b8; line-height: 1.45; border-top: 1px solid #332014; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
      <span>💡 Tip: Tap <b>F</b> near the stone in-room to strike live notes over active loops!</span>
      <span id="stone-note-indicator" style="font-family: monospace; color: #facc15; font-weight: bold;">Note: C6</span>
    </div>
  `;

  // Carillon escapement controls
  const stoneBadgeEl = body.querySelector('#stone-cadence-badge') as HTMLElement;
  const btnStoneOff = body.querySelector('#btn-stone-cadence-off') as HTMLButtonElement;
  const btnStoneQuarter = body.querySelector('#btn-stone-cadence-quarter') as HTMLButtonElement;
  const btnStoneOffbeat = body.querySelector('#btn-stone-cadence-offbeat') as HTMLButtonElement;
  const btnStoneDrone = body.querySelector('#btn-stone-cadence-drone') as HTMLButtonElement;
  const btnStoneArp = body.querySelector('#btn-stone-cadence-arp') as HTMLButtonElement;

  const cadenceButtons: Record<string, HTMLButtonElement | null> = {
    off: btnStoneOff,
    quarter_chime: btnStoneQuarter,
    offbeat: btnStoneOffbeat,
    root_drone: btnStoneDrone,
    pentatonic_arp: btnStoneArp,
  };

  function updateStoneCadenceUI() {
    const cadence = conductor.getStoneCadence();

    const badgeConfigs: Record<string, { text: string; bg: string; color: string; border: string }> = {
      off: { text: 'ESCAPEMENT: DISENGAGED (IDLE)', bg: '#292524', color: '#a8a29e', border: '#44403c' },
      quarter_chime: { text: 'ESCAPEMENT: 105 BPM ♩ QUARTER BELL', bg: 'rgba(217, 119, 6, 0.4)', color: '#fef08a', border: '#d97706' },
      offbeat: { text: 'ESCAPEMENT: 105 BPM ♪ SYNCOPATED UPBEAT', bg: 'rgba(16, 185, 129, 0.35)', color: '#6ee7b7', border: '#10b981' },
      root_drone: { text: 'ESCAPEMENT: 105 BPM 𝄝 SOVEREIGN DRONE', bg: 'rgba(139, 92, 246, 0.35)', color: '#c4b5fd', border: '#8b5cf6' },
      pentatonic_arp: { text: 'ESCAPEMENT: 105 BPM ♫ MUSIC BOX ARP', bg: 'rgba(2, 132, 199, 0.45)', color: '#38bdf8', border: '#0284c7' },
    };

    const cfg = badgeConfigs[cadence] || badgeConfigs.off;
    if (stoneBadgeEl) {
      stoneBadgeEl.innerText = cfg.text;
      stoneBadgeEl.style.background = cfg.bg;
      stoneBadgeEl.style.color = cfg.color;
      stoneBadgeEl.style.border = `1px solid ${cfg.border}`;
    }

    Object.entries(cadenceButtons).forEach(([key, btn]) => {
      if (!btn) return;
      if (key === cadence) {
        if (key === 'off') {
          btn.style.background = '#44403c';
          btn.style.border = '1.5px solid #a8a29e';
          btn.style.color = '#f8fafc';
          btn.style.boxShadow = 'none';
        } else if (key === 'quarter_chime') {
          btn.style.background = 'linear-gradient(180deg, #b45309 0%, #78350f 100%)';
          btn.style.border = '1.5px solid #f59e0b';
          btn.style.color = '#ffffff';
          btn.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.35)';
        } else if (key === 'offbeat') {
          btn.style.background = 'linear-gradient(180deg, #059669 0%, #065f46 100%)';
          btn.style.border = '1.5px solid #34d399';
          btn.style.color = '#ffffff';
          btn.style.boxShadow = '0 0 10px rgba(52, 211, 153, 0.35)';
        } else if (key === 'root_drone') {
          btn.style.background = 'linear-gradient(180deg, #7c3aed 0%, #5b21b6 100%)';
          btn.style.border = '1.5px solid #a78bfa';
          btn.style.color = '#ffffff';
          btn.style.boxShadow = '0 0 10px rgba(167, 139, 250, 0.35)';
        } else {
          btn.style.background = 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)';
          btn.style.border = '1.5px solid #38bdf8';
          btn.style.color = '#ffffff';
          btn.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.35)';
        }
      } else {
        btn.style.background = 'rgba(0, 0, 0, 0.3)';
        btn.style.border = '1px solid #44403c';
        btn.style.color = '#94a3b8';
        btn.style.boxShadow = 'none';
      }
    });
  }

  updateStoneCadenceUI();

  btnStoneOff?.addEventListener('click', () => {
    conductor.setStoneCadence('off');
    updateStoneCadenceUI();
  });

  btnStoneQuarter?.addEventListener('click', () => {
    conductor.setStoneCadence('quarter_chime');
    updateStoneCadenceUI();
  });

  btnStoneOffbeat?.addEventListener('click', () => {
    conductor.setStoneCadence('offbeat');
    updateStoneCadenceUI();
  });

  btnStoneDrone?.addEventListener('click', () => {
    conductor.setStoneCadence('root_drone');
    updateStoneCadenceUI();
  });

  btnStoneArp?.addEventListener('click', () => {
    conductor.setStoneCadence('pentatonic_arp');
    updateStoneCadenceUI();
  });

  const canvas = body.querySelector('#acoustic-oscilloscope') as HTMLCanvasElement;
  const ctx = canvas?.getContext('2d');
  const labelEl = body.querySelector('#oscilloscope-label') as HTMLElement;
  const noteEl = body.querySelector('#stone-note-indicator') as HTMLElement;

  let waveType: 'idle' | 'gold' | 'silver' | 'counterfeit' | 'strike' = 'idle';
  let waveStartTime = 0;
  let waveDuration = 1400;
  let waveNoteIndex = 0;
  let lastObservedStoneTrigger = 0;

  function triggerWave(type: 'gold' | 'silver' | 'counterfeit' | 'strike', noteIdx = 0) {
    waveType = type;
    waveStartTime = performance.now();
    waveNoteIndex = noteIdx;
    waveDuration = type === 'counterfeit' ? 240 : 1500;

    if (labelEl) {
      if (type === 'counterfeit') {
        labelEl.innerText = 'RESONANCE: DAMPED / COUNTERFEIT (110 Hz)';
        labelEl.style.color = '#ef4444';
      } else if (type === 'gold') {
        labelEl.innerText = 'RESONANCE: PURE GOLD (1046 Hz C6)';
        labelEl.style.color = '#facc15';
      } else if (type === 'silver') {
        labelEl.innerText = 'RESONANCE: STERLING SILVER (1318 Hz E6)';
        labelEl.style.color = '#38bdf8';
      } else {
        const noteNames = ['C6', 'D6', 'E6', 'G6', 'A6', 'C7', 'D7'];
        const name = noteNames[noteIdx % noteNames.length];
        labelEl.innerText = `RESONANCE: CHIME HARMONIC (${name})`;
        labelEl.style.color = '#4ade80';
      }
    }

    if (noteEl) {
      const noteNames = ['C6', 'D6', 'E6', 'G6', 'A6', 'C7', 'D7'];
      noteEl.innerText = `Note: ${noteNames[noteIdx % noteNames.length]}`;
    }
  }

  // Animation render loop
  function renderOscilloscope(now: number) {
    if (!canvas || !ctx) return;

    // React to automated carillon strikes if active
    if (conductor.isStationLooping('mint_ringing_stone')) {
      const stoneTrigger = conductor.getLastStoneVisualTrigger();
      if (stoneTrigger !== lastObservedStoneTrigger && stoneTrigger > 0) {
        lastObservedStoneTrigger = stoneTrigger;
        triggerWave('strike', conductor.getVisualNoteIndex());
      }
    }

    const w = canvas.width;
    const h = canvas.height;
    const midY = h / 2;

    ctx.fillStyle = '#080604';
    ctx.fillRect(0, 0, w, h);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    for (let gx = 0; gx < w; gx += 46) {
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
    }
    ctx.stroke();

    const elapsed = now - waveStartTime;
    const active = waveType !== 'idle' && elapsed < waveDuration;
    const progress = active ? elapsed / waveDuration : 1;
    const decay = active ? Math.exp(-progress * (waveType === 'counterfeit' ? 9 : 3.5)) : 0;

    ctx.beginPath();
    ctx.lineWidth = 2;

    if (waveType === 'counterfeit') {
      ctx.strokeStyle = `rgba(239, 68, 68, ${Math.max(0.2, decay)})`;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 6;
      for (let x = 0; x < w; x++) {
        const t = (x / w) * 12 + elapsed * 0.02;
        const noise = (Math.sin(t * 3.7) + Math.cos(t * 7.1)) * 0.5;
        const y = midY + Math.sin(t * 1.5) * 18 * decay + noise * 8 * decay;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if (active) {
      const color = waveType === 'silver' ? '#38bdf8' : waveType === 'gold' ? '#facc15' : '#4ade80';
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      const freq = 18 + waveNoteIndex * 4;
      for (let x = 0; x < w; x++) {
        const phase = (x / w) * freq + elapsed * 0.015;
        // Fundamental + plate inharmonic 2.76x
        const wave = Math.sin(phase) + 0.35 * Math.sin(phase * 2.76);
        const y = midY + wave * 22 * decay;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else {
      // Idle resting line
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
      ctx.shadowBlur = 0;
      for (let x = 0; x < w; x++) {
        const idleNoise = Math.sin((x / w) * 8 + now * 0.003) * 2;
        const y = midY + idleNoise;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    animFrameId = requestAnimationFrame(renderOscilloscope);
  }

  animFrameId = requestAnimationFrame(renderOscilloscope);

  // Hook up button events
  body.querySelector('#btn-sound-gold')?.addEventListener('click', () => {
    audio.playRingingStoneChime(0);
    triggerWave('gold', 0);
  });

  body.querySelector('#btn-sound-silver')?.addEventListener('click', () => {
    audio.playRingingStoneChime(2);
    triggerWave('silver', 2);
  });

  body.querySelector('#btn-sound-counterfeit')?.addEventListener('click', () => {
    audio.playCounterfeitThud();
    triggerWave('counterfeit', 0);
  });

  body.querySelector('#btn-sound-strike')?.addEventListener('click', () => {
    const ok = executeRingingStoneStrike({ stationId: 'mint_ringing_stone' });
    if (ok) {
      const noteIdx = getStoneNoteIndex('mint_ringing_stone');
      triggerWave('strike', noteIdx);
    }
  });
}

/**
 * The Moneyer's Tally Board Modal
 */
export function openTallyBoardModal() {
  const audio = HearthAudio.getInstance();
  const engine = CoinPhysicsEngine.getInstance();
  const conductor = MintConductor.getInstance();

  const { body } = createModalContainer(
    "📋 The Moneyer's Tally Board",
    'Mechanical Sovereign Telling Tray & Automated Strike-Bar Backbeat'
  );

  let filledCoins = 50;

  body.innerHTML = `
    <div style="font-size: 0.84rem; line-height: 1.45; color: #cbd5e1; margin-bottom: 10px;">
      In the Royal Mint, tellers verified sovereign quantities with 100-groove brass tally trays.
      Synchronize the reciprocating mahogany strike-bar to deliver the punchy acoustic backbeat / snare of the Kinetic DAW.
    </div>

    <!-- Kinetic DAW Strike-Bar Cadence Controller -->
    <div style="background: rgba(0, 0, 0, 0.4); border: 1px solid #451a03; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em; color: #f59e0b; text-transform: uppercase;">
          ⚙️ Kinetic DAW • Continuous Strike-Bar Feed
        </span>
        <span id="tally-cadence-badge" style="font-family: monospace; font-size: 0.66rem; font-weight: bold; padding: 2px 8px; border-radius: 4px; border: 1px solid #44403c; background: #292524; color: #a8a29e;">
          TALLY: DISENGAGED (MANUAL ONLY)
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px;">
        <button id="btn-tally-cadence-off" style="padding: 6px 6px; border-radius: 5px; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; text-align: center;">
          ⏹ Disengaged<br/><span style="font-size: 0.65rem; opacity: 0.8; font-weight: normal;">Manual Only</span>
        </button>
        <button id="btn-tally-cadence-snare" style="padding: 6px 6px; border-radius: 5px; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; text-align: center;">
          🥁 Backbeat Slap<br/><span style="font-size: 0.65rem; opacity: 0.8; font-weight: normal;">Beats 2 & 4 Snare</span>
        </button>
        <button id="btn-tally-cadence-fill" style="padding: 6px 6px; border-radius: 5px; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; text-align: center;">
          🌊 Cascade Fill<br/><span style="font-size: 0.65rem; opacity: 0.8; font-weight: normal;">Bar Turnaround</span>
        </button>
        <button id="btn-tally-cadence-sync" style="padding: 6px 6px; border-radius: 5px; font-size: 0.72rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease; text-align: center;">
          🎩 Moneyer Groove<br/><span style="font-size: 0.65rem; opacity: 0.8; font-weight: normal;">Syncopated Clack</span>
        </button>
      </div>
    </div>

    <!-- Telling Tray 10x10 Visualizer -->
    <div style="background: #140d08; border: 1.5px solid #78350f; border-radius: 6px; padding: 12px; margin-bottom: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 0.76rem; font-family: monospace; color: #f59e0b; text-transform: uppercase;">
          FLUTED BRASS TELLING TRAY (100 GROOVES)
        </span>
        <span id="tally-count-badge" style="font-size: 0.82rem; font-family: monospace; font-weight: bold; color: #facc15;">
          ${filledCoins} / 100 Sovereigns (£${filledCoins})
        </span>
      </div>

      <!-- 10x10 Grooves Grid -->
      <div id="tally-grooves-grid" style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; padding: 6px; background: #080503; border-radius: 4px; border: 1px solid #451a03;">
      </div>
    </div>

    <!-- Interactive Batch Controls -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
      <button id="btn-tally-pour" style="background: linear-gradient(180deg, #b45309 0%, #78350f 100%); border: 1px solid #f59e0b; color: #fef08a; padding: 9px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span>🪙</span> Pour Canvas Bag (+25)
      </button>
      <button id="btn-tally-sweep" style="background: linear-gradient(180deg, #451a03 0%, #260f04 100%); border: 1px solid #92400e; color: #fed7aa; padding: 9px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span>🪵</span> Sweep Strike-Bar
      </button>
      <button id="btn-tally-dump" style="background: linear-gradient(180deg, #15803d 0%, #14532d 100%); border: 1px solid #4ade80; color: #ffffff; padding: 9px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span>📦</span> Dump to Vault Chest
      </button>
      <button id="btn-tally-strike" style="background: linear-gradient(180deg, #ca8a04 0%, #713f12 100%); border: 1px solid #facc15; color: #ffffff; padding: 9px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
        <span>🔨</span> Full Batch Cycle (In-Room)
      </button>
    </div>

    <div style="font-size: 0.76rem; color: #94a3b8; line-height: 1.45; border-top: 1px solid #332014; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
      <span>💡 Tip: Tap <b>F</b> near the counting table in-room for an instant pour, sweep, and chest dump!</span>
      <span id="tally-status-label" style="font-family: monospace; color: #4ade80;">STATUS: READY</span>
    </div>
  `;

  // Cadence buttons and badge wiring
  const tallyBadgeEl = body.querySelector('#tally-cadence-badge') as HTMLElement;
  const btnTallyOff = body.querySelector('#btn-tally-cadence-off') as HTMLButtonElement;
  const btnTallySnare = body.querySelector('#btn-tally-cadence-snare') as HTMLButtonElement;
  const btnTallyFill = body.querySelector('#btn-tally-cadence-fill') as HTMLButtonElement;
  const btnTallySync = body.querySelector('#btn-tally-cadence-sync') as HTMLButtonElement;

  const cadenceButtons: Record<string, HTMLButtonElement | null> = {
    off: btnTallyOff,
    backbeat_snare: btnTallySnare,
    cascade_fill: btnTallyFill,
    syncopated_groove: btnTallySync,
  };

  function updateTallyCadenceUI() {
    const cadence = conductor.getTallyCadence();
    const badgeConfigs: Record<string, { text: string; bg: string; color: string; border: string }> = {
      off: { text: 'TALLY: DISENGAGED (MANUAL ONLY)', bg: '#292524', color: '#a8a29e', border: '#44403c' },
      backbeat_snare: { text: 'TALLY: 105 BPM 🥁 BACKBEAT SLAP (BEATS 2 & 4)', bg: 'rgba(217, 119, 6, 0.4)', color: '#fef08a', border: '#d97706' },
      cascade_fill: { text: 'TALLY: 105 BPM 🌊 CASCADE TURNAROUND (BAR FILL)', bg: 'rgba(2, 132, 199, 0.45)', color: '#38bdf8', border: '#0284c7' },
      syncopated_groove: { text: 'TALLY: 105 BPM 🎩 SYNCOPATED MONEYER GROOVE', bg: 'rgba(16, 185, 129, 0.35)', color: '#6ee7b7', border: '#10b981' },
    };

    const cfg = badgeConfigs[cadence] || badgeConfigs.off;
    if (tallyBadgeEl) {
      tallyBadgeEl.innerText = cfg.text;
      tallyBadgeEl.style.background = cfg.bg;
      tallyBadgeEl.style.color = cfg.color;
      tallyBadgeEl.style.border = `1px solid ${cfg.border}`;
    }

    Object.entries(cadenceButtons).forEach(([key, btn]) => {
      if (!btn) return;
      if (key === cadence) {
        if (key === 'off') {
          btn.style.background = '#44403c';
          btn.style.border = '1.5px solid #a8a29e';
          btn.style.color = '#f8fafc';
          btn.style.boxShadow = 'none';
        } else if (key === 'backbeat_snare') {
          btn.style.background = 'linear-gradient(180deg, #b45309 0%, #78350f 100%)';
          btn.style.border = '1.5px solid #f59e0b';
          btn.style.color = '#ffffff';
          btn.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.35)';
        } else if (key === 'cascade_fill') {
          btn.style.background = 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)';
          btn.style.border = '1.5px solid #38bdf8';
          btn.style.color = '#ffffff';
          btn.style.boxShadow = '0 0 10px rgba(56, 189, 248, 0.35)';
        } else {
          btn.style.background = 'linear-gradient(180deg, #059669 0%, #065f46 100%)';
          btn.style.border = '1.5px solid #34d399';
          btn.style.color = '#ffffff';
          btn.style.boxShadow = '0 0 10px rgba(52, 211, 153, 0.35)';
        }
      } else {
        btn.style.background = 'rgba(0, 0, 0, 0.3)';
        btn.style.border = '1px solid #44403c';
        btn.style.color = '#94a3b8';
        btn.style.boxShadow = 'none';
      }
    });
  }

  updateTallyCadenceUI();

  btnTallyOff?.addEventListener('click', () => {
    conductor.setTallyCadence('off');
    updateTallyCadenceUI();
  });

  btnTallySnare?.addEventListener('click', () => {
    conductor.setTallyCadence('backbeat_snare');
    updateTallyCadenceUI();
  });

  btnTallyFill?.addEventListener('click', () => {
    conductor.setTallyCadence('cascade_fill');
    updateTallyCadenceUI();
  });

  btnTallySync?.addEventListener('click', () => {
    conductor.setTallyCadence('syncopated_groove');
    updateTallyCadenceUI();
  });

  const gridEl = body.querySelector('#tally-grooves-grid') as HTMLElement;
  const countBadge = body.querySelector('#tally-count-badge') as HTMLElement;
  const statusLabel = body.querySelector('#tally-status-label') as HTMLElement;

  function renderGrooves() {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    for (let i = 0; i < 100; i++) {
      const slot = document.createElement('div');
      slot.style.height = '14px';
      slot.style.borderRadius = '3px';
      slot.style.border = '1px solid #331e11';
      slot.style.display = 'flex';
      slot.style.alignItems = 'center';
      slot.style.justifyContent = 'center';
      slot.style.transition = 'all 0.15s ease';

      if (i < filledCoins) {
        slot.style.background = 'radial-gradient(circle at 35% 35%, #fef08a 0%, #eab308 60%, #ca8a04 100%)';
        slot.style.borderColor = '#facc15';
        slot.style.boxShadow = '0 0 3px rgba(250, 204, 21, 0.4)';
      } else {
        slot.style.background = '#1a100a';
      }
      gridEl.appendChild(slot);
    }
    if (countBadge) {
      countBadge.innerText = `${filledCoins} / 100 Sovereigns (£${filledCoins})`;
    }
  }

  renderGrooves();

  body.querySelector('#btn-tally-pour')?.addEventListener('click', () => {
    audio.playCoinCascade(25);
    filledCoins = Math.min(100, filledCoins + 25);
    renderGrooves();
    if (statusLabel) {
      statusLabel.innerText = 'STATUS: CASCADE POURED';
      statusLabel.style.color = '#facc15';
    }
  });

  body.querySelector('#btn-tally-sweep')?.addEventListener('click', () => {
    audio.playWoodenStrikeSweep();
    if (statusLabel) {
      statusLabel.innerText = 'STATUS: GROOVES LEVELLED';
      statusLabel.style.color = '#fed7aa';
    }
  });

  body.querySelector('#btn-tally-dump')?.addEventListener('click', () => {
    if (filledCoins === 0) return;
    audio.playChestDump();
    const payout = Math.max(2, Math.min(6, Math.ceil(filledCoins / 20)));
    engine.spawnBurst(CANVAS_WIDTH / 2, 280, payout);
    filledCoins = 0;
    renderGrooves();
    if (statusLabel) {
      statusLabel.innerText = 'STATUS: BATCH DEPOSITED IN VAULT';
      statusLabel.style.color = '#4ade80';
    }
  });

  body.querySelector('#btn-tally-strike')?.addEventListener('click', () => {
    executeTallyBoardPour({ stationId: 'mint_tally_board' });
    filledCoins = 100;
    renderGrooves();
    setTimeout(() => {
      filledCoins = 0;
      renderGrooves();
    }, 450);
    if (statusLabel) {
      statusLabel.innerText = 'STATUS: FULL AUDIT EXECUTED';
      statusLabel.style.color = '#38bdf8';
    }
  });
}

/**
 * Opens The Conductor's Horological Vitrine Master Console Modal.
 * Central Victorian Kinetic DAW workstation:
 * - Master Tempo Governor (60..180 BPM) with steppers and presets
 * - Master Clutch Lever button
 * - 4-Track Channel Strip Mixer (Coin Press, Tally Board, Gilded Chute, Ringing Stone)
 * - 1-Click Curated Orchestral Presets
 */
export function openConductorVitrineModal(): void {
  const { overlay, body } = createModalContainer(
    "THE CONDUCTOR'S HOROLOGICAL VITRINE",
    'Victorian Kinetic DAW • Central Escapement & Mechanical Orchestra Mixer'
  );

  const container = body.parentElement;
  if (container) {
    container.style.maxWidth = '720px';
  }

  const conductor = MintConductor.getInstance();
  const audio = HearthAudio.getInstance();

  body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; max-height: 80vh; overflow-y: auto; padding-right: 4px;">
      <!-- 1. Master Transport & Tempo Governor Card -->
      <div style="background: rgba(10, 7, 5, 0.7); border: 1.5px solid #ca8a04; border-radius: 8px; padding: 14px 16px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.6);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div id="master-status-lamp" style="width: 14px; height: 14px; border-radius: 50%; background: #7f1d1d; box-shadow: 0 0 10px rgba(127, 29, 29, 0.6); transition: all 0.2s;"></div>
            <div>
              <div id="master-status-title" style="font-size: 0.95rem; font-weight: 700; color: #fef08a; letter-spacing: 0.5px;">MASTER CLOCKWORK: IDLE</div>
              <div style="font-size: 0.75rem; color: #94a3b8;">Central Web Audio lookahead engine driving in-room mechanical links</div>
            </div>
          </div>
          <button id="btn-master-clutch" style="background: linear-gradient(180deg, #ca8a04 0%, #854d0e 100%); color: #000; border: 1px solid #fef08a; border-radius: 6px; padding: 8px 16px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 3px 8px rgba(0,0,0,0.5); transition: transform 0.1s;">
            ⚡ ENGAGE ALL ENGINES
          </button>
        </div>

        <!-- Tempo Governor Slider & Controls -->
        <div style="background: rgba(0,0,0,0.35); border-radius: 6px; padding: 10px 12px; border: 1px solid #451a03;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 0.8rem; font-weight: 700; color: #facc15; text-transform: uppercase; letter-spacing: 0.5px;">Tempo Governor</span>
            <span id="bpm-display-badge" style="font-family: monospace; font-size: 0.95rem; font-weight: 700; color: #4ade80; background: #052e16; padding: 2px 8px; border-radius: 4px; border: 1px solid #22c55e;">105 BPM</span>
          </div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <button id="btn-bpm-minus" style="background: #27120a; color: #fde047; border: 1px solid #78350f; border-radius: 4px; width: 32px; height: 28px; cursor: pointer; font-weight: 700;">-5</button>
            <input type="range" id="bpm-slider" min="60" max="180" step="1" value="${conductor.getBpm()}" style="flex: 1; accent-color: #eab308; cursor: pointer;" />
            <button id="btn-bpm-plus" style="background: #27120a; color: #fde047; border: 1px solid #78350f; border-radius: 4px; width: 32px; height: 28px; cursor: pointer; font-weight: 700;">+5</button>
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn-tempo-preset" data-bpm="75" style="flex: 1; min-width: 80px; background: #1a0e08; color: #cbd5e1; border: 1px solid #78350f; border-radius: 4px; padding: 4px 6px; font-size: 0.72rem; cursor: pointer;">Adagio 75</button>
            <button class="btn-tempo-preset" data-bpm="105" style="flex: 1; min-width: 80px; background: #1a0e08; color: #cbd5e1; border: 1px solid #78350f; border-radius: 4px; padding: 4px 6px; font-size: 0.72rem; cursor: pointer;">Standard 105</button>
            <button class="btn-tempo-preset" data-bpm="135" style="flex: 1; min-width: 80px; background: #1a0e08; color: #cbd5e1; border: 1px solid #78350f; border-radius: 4px; padding: 4px 6px; font-size: 0.72rem; cursor: pointer;">Allegro 135</button>
            <button class="btn-tempo-preset" data-bpm="160" style="flex: 1; min-width: 80px; background: #1a0e08; color: #cbd5e1; border: 1px solid #78350f; border-radius: 4px; padding: 4px 6px; font-size: 0.72rem; cursor: pointer;">Furioso 160</button>
          </div>
        </div>
      </div>

      <!-- 2. 4-Track Instrument Mixer Console -->
      <div>
        <div style="font-size: 0.8rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
          Mechanical Multi-Track Mixer
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
          <!-- Track 1: Steam Coin Press -->
          <div class="channel-card" id="card-ch-press" style="background: rgba(18, 12, 8, 0.85); border: 1px solid #78350f; border-radius: 6px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 0.82rem; font-weight: 700; color: #fef08a;">🪙 Coin Press</span>
                <span id="lamp-ch-press" style="width: 8px; height: 8px; border-radius: 50%; background: #7f1d1d;"></span>
              </div>
              <div style="font-size: 0.68rem; color: #94a3b8; margin-bottom: 8px;">Sub Kick (Beats 1-4)</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <select id="sel-ch-press" style="background: #27120a; color: #fefce8; border: 1px solid #78350f; border-radius: 4px; padding: 4px; font-size: 0.75rem; cursor: pointer;">
                <option value="off">Off (Manual)</option>
                <option value="four_on_the_floor">4-on-the-Floor</option>
              </select>
              <button id="mute-ch-press" style="background: #1c1917; color: #94a3b8; border: 1px solid #44403c; border-radius: 4px; padding: 3px; font-size: 0.7rem; cursor: pointer; font-weight: 700;">MUTE</button>
            </div>
          </div>

          <!-- Track 2: Moneyer's Tally Board -->
          <div class="channel-card" id="card-ch-tally" style="background: rgba(18, 12, 8, 0.85); border: 1px solid #78350f; border-radius: 6px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 0.82rem; font-weight: 700; color: #fef08a;">🪵 Tally Board</span>
                <span id="lamp-ch-tally" style="width: 8px; height: 8px; border-radius: 50%; background: #7f1d1d;"></span>
              </div>
              <div style="font-size: 0.68rem; color: #94a3b8; margin-bottom: 8px;">Acoustic Snare & Clack</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <select id="sel-ch-tally" style="background: #27120a; color: #fefce8; border: 1px solid #78350f; border-radius: 4px; padding: 4px; font-size: 0.75rem; cursor: pointer;">
                <option value="off">Off (Manual)</option>
                <option value="backbeat_snare">Backbeat Slap</option>
                <option value="cascade_fill">Cascade Fill</option>
                <option value="syncopated_groove">Moneyer Groove</option>
              </select>
              <button id="mute-ch-tally" style="background: #1c1917; color: #94a3b8; border: 1px solid #44403c; border-radius: 4px; padding: 3px; font-size: 0.7rem; cursor: pointer; font-weight: 700;">MUTE</button>
            </div>
          </div>

          <!-- Track 3: Gilded Chute -->
          <div class="channel-card" id="card-ch-plinko" style="background: rgba(18, 12, 8, 0.85); border: 1px solid #78350f; border-radius: 6px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 0.82rem; font-weight: 700; color: #fef08a;">📐 Gilded Chute</span>
                <span id="lamp-ch-plinko" style="width: 8px; height: 8px; border-radius: 50%; background: #7f1d1d;"></span>
              </div>
              <div style="font-size: 0.68rem; color: #94a3b8; margin-bottom: 8px;">16th Shaker / Hi-Hat</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <select id="sel-ch-plinko" style="background: #27120a; color: #fefce8; border: 1px solid #78350f; border-radius: 4px; padding: 4px; font-size: 0.75rem; cursor: pointer;">
                <option value="off">Off (Manual)</option>
                <option value="sixteenth_shaker">16th Shaker</option>
                <option value="offbeat_pings">Offbeat Pings</option>
              </select>
              <button id="mute-ch-plinko" style="background: #1c1917; color: #94a3b8; border: 1px solid #44403c; border-radius: 4px; padding: 3px; font-size: 0.7rem; cursor: pointer; font-weight: 700;">MUTE</button>
            </div>
          </div>

          <!-- Track 4: Ringing Stone -->
          <div class="channel-card" id="card-ch-stone" style="background: rgba(18, 12, 8, 0.85); border: 1px solid #78350f; border-radius: 6px; padding: 10px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 0.82rem; font-weight: 700; color: #fef08a;">🔔 Ringing Stone</span>
                <span id="lamp-ch-stone" style="width: 8px; height: 8px; border-radius: 50%; background: #7f1d1d;"></span>
              </div>
              <div style="font-size: 0.68rem; color: #94a3b8; margin-bottom: 8px;">Lead Bells & Arpeggio</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <select id="sel-ch-stone" style="background: #27120a; color: #fefce8; border: 1px solid #78350f; border-radius: 4px; padding: 4px; font-size: 0.75rem; cursor: pointer;">
                <option value="off">Off (Manual)</option>
                <option value="quarter_chime">Quarter Chime</option>
                <option value="offbeat">Offbeats</option>
                <option value="root_drone">Root Drone</option>
                <option value="pentatonic_arp">Pentatonic Arp</option>
              </select>
              <button id="mute-ch-stone" style="background: #1c1917; color: #94a3b8; border: 1px solid #44403c; border-radius: 4px; padding: 3px; font-size: 0.7rem; cursor: pointer; font-weight: 700;">MUTE</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Curated Orchestral Presets (1-Click Score Chambers) -->
      <div style="background: rgba(0,0,0,0.4); border: 1px solid #451a03; border-radius: 6px; padding: 10px 12px;">
        <div style="font-size: 0.78rem; font-weight: 700; color: #ca8a04; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;">
          Conductor's Repertoire Presets
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 6px;">
          <button class="btn-orchestra-preset" data-preset="full_orchestrion" style="background: #1f140e; color: #fef08a; border: 1px solid #78350f; border-radius: 4px; padding: 6px 8px; font-size: 0.75rem; cursor: pointer; text-align: left;">
            🏛️ <b>Royal Orchestrion</b><br><span style="font-size: 0.65rem; color: #94a3b8;">Full 4-piece groove</span>
          </button>
          <button class="btn-orchestra-preset" data-preset="rhythm_section" style="background: #1f140e; color: #fed7aa; border: 1px solid #78350f; border-radius: 4px; padding: 6px 8px; font-size: 0.75rem; cursor: pointer; text-align: left;">
            🥁 <b>Pure Rhythm</b><br><span style="font-size: 0.65rem; color: #94a3b8;">Kick, Snare & Shaker</span>
          </button>
          <button class="btn-orchestra-preset" data-preset="midnight_carillon" style="background: #1f140e; color: #bae6fd; border: 1px solid #78350f; border-radius: 4px; padding: 6px 8px; font-size: 0.75rem; cursor: pointer; text-align: left;">
            🔔 <b>Midnight Carillon</b><br><span style="font-size: 0.65rem; color: #94a3b8;">Chimes & Offbeat Pings</span>
          </button>
          <button class="btn-orchestra-preset" data-preset="silent_workshop" style="background: #1c1917; color: #cbd5e1; border: 1px solid #44403c; border-radius: 4px; padding: 6px 8px; font-size: 0.75rem; cursor: pointer; text-align: left;">
            ⏹️ <b>Silent Workshop</b><br><span style="font-size: 0.65rem; color: #94a3b8;">All engines idle</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // UI Element References
  const masterLamp = body.querySelector('#master-status-lamp') as HTMLElement;
  const masterTitle = body.querySelector('#master-status-title') as HTMLElement;
  const btnMasterClutch = body.querySelector('#btn-master-clutch') as HTMLButtonElement;
  const bpmBadge = body.querySelector('#bpm-display-badge') as HTMLElement;
  const bpmSlider = body.querySelector('#bpm-slider') as HTMLInputElement;

  const selPress = body.querySelector('#sel-ch-press') as HTMLSelectElement;
  const selTally = body.querySelector('#sel-ch-tally') as HTMLSelectElement;
  const selPlinko = body.querySelector('#sel-ch-plinko') as HTMLSelectElement;
  const selStone = body.querySelector('#sel-ch-stone') as HTMLSelectElement;

  const mutePress = body.querySelector('#mute-ch-press') as HTMLButtonElement;
  const muteTally = body.querySelector('#mute-ch-tally') as HTMLButtonElement;
  const mutePlinko = body.querySelector('#mute-ch-plinko') as HTMLButtonElement;
  const muteStone = body.querySelector('#mute-ch-stone') as HTMLButtonElement;

  const lampPress = body.querySelector('#lamp-ch-press') as HTMLElement;
  const lampTally = body.querySelector('#lamp-ch-tally') as HTMLElement;
  const lampPlinko = body.querySelector('#lamp-ch-plinko') as HTMLElement;
  const lampStone = body.querySelector('#lamp-ch-stone') as HTMLElement;

  function updateMixerUI(): void {
    const isRunning = conductor.isRunning();

    // Master Transport Badge & Button
    if (isRunning) {
      masterLamp.style.background = '#22c55e';
      masterLamp.style.boxShadow = '0 0 12px rgba(34, 197, 94, 0.8)';
      masterTitle.innerText = 'MASTER CLOCKWORK: ENGAGED & TICKING';
      masterTitle.style.color = '#4ade80';
      btnMasterClutch.innerText = '⏹ DISENGAGE ALL';
      btnMasterClutch.style.background = 'linear-gradient(180deg, #b91c1c 0%, #7f1d1d 100%)';
      btnMasterClutch.style.color = '#fff';
      btnMasterClutch.style.borderColor = '#f87171';
    } else {
      masterLamp.style.background = '#7f1d1d';
      masterLamp.style.boxShadow = '0 0 8px rgba(127, 29, 29, 0.6)';
      masterTitle.innerText = 'MASTER CLOCKWORK: IDLE (DISENGAGED)';
      masterTitle.style.color = '#fef08a';
      btnMasterClutch.innerText = '⚡ ENGAGE MASTER TRANSPORT';
      btnMasterClutch.style.background = 'linear-gradient(180deg, #ca8a04 0%, #854d0e 100%)';
      btnMasterClutch.style.color = '#000';
      btnMasterClutch.style.borderColor = '#fef08a';
    }

    // BPM Readout
    bpmBadge.innerText = `${conductor.getBpm()} BPM`;
    if (bpmSlider.value !== String(conductor.getBpm())) {
      bpmSlider.value = String(conductor.getBpm());
    }

    // Cadence Dropdowns
    selPress.value = conductor.getPressCadence();
    selTally.value = conductor.getTallyCadence();
    selPlinko.value = conductor.getPlinkoCadence();
    selStone.value = conductor.getStoneCadence();

    // Mute Buttons & Status Lamps
    const updateChannel = (
      ch: 'press' | 'tally' | 'plinko' | 'stone',
      isLoop: boolean,
      muteBtn: HTMLButtonElement,
      lampEl: HTMLElement
    ) => {
      const isMuted = conductor.isChannelMuted(ch);
      if (isMuted) {
        muteBtn.innerText = 'MUTED';
        muteBtn.style.background = '#991b1b';
        muteBtn.style.color = '#fecaca';
        muteBtn.style.borderColor = '#ef4444';
      } else {
        muteBtn.innerText = 'MUTE';
        muteBtn.style.background = '#1c1917';
        muteBtn.style.color = '#94a3b8';
        muteBtn.style.borderColor = '#44403c';
      }

      if (isLoop && isRunning && !isMuted) {
        lampEl.style.background = '#22c55e';
        lampEl.style.boxShadow = '0 0 6px rgba(34, 197, 94, 0.8)';
      } else if (isLoop && isRunning && isMuted) {
        lampEl.style.background = '#f59e0b';
        lampEl.style.boxShadow = '0 0 6px rgba(245, 158, 11, 0.8)';
      } else {
        lampEl.style.background = '#7f1d1d';
        lampEl.style.boxShadow = 'none';
      }
    };

    updateChannel('press', conductor.getPressCadence() !== 'off', mutePress, lampPress);
    updateChannel('tally', conductor.getTallyCadence() !== 'off', muteTally, lampTally);
    updateChannel('plinko', conductor.getPlinkoCadence() !== 'off', mutePlinko, lampPlinko);
    updateChannel('stone', conductor.getStoneCadence() !== 'off', muteStone, lampStone);
  }

  // Initial render
  updateMixerUI();

  // Listen to conductor state broadcasts to stay perfectly synchronized
  const onStateChange = () => updateMixerUI();
  window.addEventListener('mint-conductor-state-change', onStateChange);

  // Clean up listener when modal closes
  const originalClose = overlay.querySelector('.modal-close-btn');
  originalClose?.addEventListener('click', () => {
    window.removeEventListener('mint-conductor-state-change', onStateChange);
  });

  // Master Clutch Button
  btnMasterClutch.addEventListener('click', () => {
    const isNowRunning = conductor.toggleMasterTransport();
    audio.playClutchLeverThrow(isNowRunning);
    updateMixerUI();
  });

  // BPM Slider & Steppers
  bpmSlider.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    conductor.setBpm(val);
    audio.playTempoGovernorClick();
    updateMixerUI();
  });

  body.querySelector('#btn-bpm-minus')?.addEventListener('click', () => {
    conductor.setBpm(conductor.getBpm() - 5);
    audio.playTempoGovernorClick();
    updateMixerUI();
  });

  body.querySelector('#btn-bpm-plus')?.addEventListener('click', () => {
    conductor.setBpm(conductor.getBpm() + 5);
    audio.playTempoGovernorClick();
    updateMixerUI();
  });

  body.querySelectorAll('.btn-tempo-preset').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const targetBpm = parseInt((e.currentTarget as HTMLElement).dataset.bpm || '105', 10);
      conductor.setBpm(targetBpm);
      audio.playTempoGovernorClick();
      updateMixerUI();
    });
  });

  // Channel Dropdown Selectors
  selPress.addEventListener('change', (e) => {
    conductor.setPressCadence((e.target as HTMLSelectElement).value as any);
    updateMixerUI();
  });

  selTally.addEventListener('change', (e) => {
    conductor.setTallyCadence((e.target as HTMLSelectElement).value as any);
    updateMixerUI();
  });

  selPlinko.addEventListener('change', (e) => {
    conductor.setPlinkoCadence((e.target as HTMLSelectElement).value as any);
    updateMixerUI();
  });

  selStone.addEventListener('change', (e) => {
    conductor.setStoneCadence((e.target as HTMLSelectElement).value as any);
    updateMixerUI();
  });

  // Channel Mute Buttons
  mutePress.addEventListener('click', () => {
    conductor.toggleChannelMute('press');
    audio.playTempoGovernorClick();
    updateMixerUI();
  });

  muteTally.addEventListener('click', () => {
    conductor.toggleChannelMute('tally');
    audio.playTempoGovernorClick();
    updateMixerUI();
  });

  mutePlinko.addEventListener('click', () => {
    conductor.toggleChannelMute('plinko');
    audio.playTempoGovernorClick();
    updateMixerUI();
  });

  muteStone.addEventListener('click', () => {
    conductor.toggleChannelMute('stone');
    audio.playTempoGovernorClick();
    updateMixerUI();
  });

  // Curated Preset Buttons
  body.querySelectorAll('.btn-orchestra-preset').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const preset = (e.currentTarget as HTMLElement).dataset.preset as any;
      conductor.applyOrchestraPreset(preset);
      audio.playClutchLeverThrow(conductor.isRunning());
      updateMixerUI();
    });
  });
}



