import { CoinPhysicsEngine } from '../rooms/coins/coinPhysics';
import { HearthAudio } from '../sound/audio';
import { CANVAS_WIDTH } from '../core/constants';
import { ModalOverlay } from './overlay';

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
  const { body } = createModalContainer(
    '⚙️ The Grand Minting Engine',
    'Industrial Steam Coining Press — Sovereign Stamping Station'
  );

  body.innerHTML = `
    <div style="font-size: 0.88rem; line-height: 1.5; color: #e2e8f0; margin-bottom: 16px;">
      A massive Victorian flywheel rotates with polished bronze cams, driving an 80-ton stamping piston. 
      Raw metallurgical blanks enter the hopper and are struck with the sovereign seal, tumbling down the ejection chute.
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

    <div style="font-size: 0.8rem; font-weight: 600; color: #fef08a; margin-bottom: 8px; text-transform: uppercase;">Stamping Actions</div>
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
  let isPlinkoRunning = true;
  const { body } = createModalContainer(
    '🎰 The Gilded Chute',
    'Galton Pegboard & Sovereign Multiplier Drop',
    () => {
      isPlinkoRunning = false;
    }
  );

  const canvasWidth = 360;
  const canvasHeight = 240;

  body.innerHTML = `
    <div style="font-size: 0.84rem; color: #cbd5e1; margin-bottom: 12px; line-height: 1.4;">
      Insert a coin into the gilded glass chute. As it deflects through the staggered brass pins, 
      binomial probability determines its destination. Landing in high-value slots triggers celebratory payouts!
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
  }

  const balls: Ball[] = [];

  function drawPlinko() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

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
          audio.playPlinkoPegHit();
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
        // Celebrate! Spawn physical coins onto the real room floor!
        engine.spawnBurst(CANVAS_WIDTH / 2, 240, landedBin.mult * 2);
      }

      // Draw shiny gold ball
      ctx.fillStyle = '#eab308';
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
    // Toss 1 coin into fountain and spray back 2 lucky ones!
    engine.spawnBurst(CANVAS_WIDTH / 2, 280, 2, 'star');
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
