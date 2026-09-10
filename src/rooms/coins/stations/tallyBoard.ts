import { WorldStation, DeepReadonly, WorldState } from '../../../core/types';
import { TILE_SIZE } from '../../../core/constants';
import { getLastTallyPourTime } from '../tallyBoardActions';

export const TALLY_BOARD_TILE_X = 2.2;
export const TALLY_BOARD_TILE_Y = 8.2;

export const tallyBoardStation: WorldStation = {
  id: 'mint_tally_board',
  name: "The Moneyer's Tally Board",
  prompt: 'Inspect Tally Tray (Batch Audit)',
  tileX: TALLY_BOARD_TILE_X,
  tileY: TALLY_BOARD_TILE_Y,
  tileWidth: 2.8,
  tileHeight: 2.6,
  collisionBox: {
    x: TALLY_BOARD_TILE_X * TILE_SIZE,
    y: (TALLY_BOARD_TILE_Y + 0.4) * TILE_SIZE,
    w: 2.8 * TILE_SIZE,
    h: 2.2 * TILE_SIZE,
  },
  approachPoint: {
    x: 4.2 * TILE_SIZE,
    y: 8.6 * TILE_SIZE,
  },
  intent: {
    type: 'modal',
    modalId: 'tally_board',
  },
  primaryAction: {
    label: 'Pour & Sweep',
    intent: {
      type: 'custom',
      actionId: 'pour_tally_board',
      params: {
        stationId: 'mint_tally_board',
        chestX: (TALLY_BOARD_TILE_X + 1.4) * TILE_SIZE,
        chestY: (TALLY_BOARD_TILE_Y + 2.2) * TILE_SIZE,
      },
    },
  },
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, _state: DeepReadonly<WorldState>) => {
    const baseX = TALLY_BOARD_TILE_X * TILE_SIZE;
    const baseY = TALLY_BOARD_TILE_Y * TILE_SIZE;
    const w = 2.8 * TILE_SIZE;
    const h = 2.6 * TILE_SIZE;
    const cx = baseX + w / 2;

    const now = Date.now();
    const lastPour = getLastTallyPourTime('mint_tally_board');
    const elapsed = now - lastPour;
    const isPouring = elapsed < 650;
    const pourProgress = isPouring ? elapsed / 650 : 1;

    // 1. Under-Table Iron-Bound Oak Treasury Chest
    const chestX = baseX + 14;
    const chestY = baseY + 48;
    const chestW = w - 28;
    const chestH = 28;

    // Chest shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(chestX - 2, chestY + chestH - 4, chestW + 4, 8);

    // Dark oak chest body
    ctx.fillStyle = '#1e140d';
    ctx.fillRect(chestX, chestY, chestW, chestH);
    ctx.strokeStyle = '#381a10';
    ctx.lineWidth = 1;
    ctx.strokeRect(chestX, chestY, chestW, chestH);

    // Iron corner bracing bands
    ctx.fillStyle = '#475569';
    ctx.fillRect(chestX, chestY, 4, chestH);
    ctx.fillRect(chestX + chestW - 4, chestY, 4, chestH);
    ctx.fillRect(chestX + chestW / 2 - 3, chestY, 6, chestH);

    // Brass padlock & hasp
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(chestX + chestW / 2 - 2, chestY + 12, 4, 6);

    // Chest open collection chute aperture
    ctx.fillStyle = '#0a0604';
    ctx.fillRect(chestX + 6, chestY + 2, chestW - 12, 8);

    // Gold bullion glow from inside chest
    ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
    ctx.fillRect(chestX + 8, chestY + 4, chestW - 16, 5);

    // 2. Heavy Carved Oak Table Legs & Frame
    ctx.fillStyle = '#2a160a';
    // Left turned leg
    ctx.fillRect(baseX + 6, baseY + 24, 8, h - 24);
    ctx.strokeStyle = '#451a03';
    ctx.strokeRect(baseX + 6, baseY + 24, 8, h - 24);
    // Right turned leg
    ctx.fillRect(baseX + w - 14, baseY + 24, 8, h - 24);
    ctx.strokeRect(baseX + w - 14, baseY + 24, 8, h - 24);
    // Oak cross-rail
    ctx.fillRect(baseX + 10, baseY + 36, w - 20, 6);

    // 3. Slanted Tabletop Surface & Brass Telling Tray (Tally Board)
    const boardX = baseX + 8;
    const boardY = baseY + 10;
    const boardW = w - 16;
    const boardH = 34;

    // Beveled brass tray perimeter frame
    ctx.fillStyle = '#78350f';
    ctx.fillRect(boardX - 2, boardY - 2, boardW + 4, boardH + 4);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(boardX - 2, boardY - 2, boardW + 4, boardH + 4);

    // Polished brass plate bed
    const brassGrad = ctx.createLinearGradient(boardX, boardY, boardX, boardY + boardH);
    brassGrad.addColorStop(0, '#b45309');
    brassGrad.addColorStop(0.5, '#d97706');
    brassGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = brassGrad;
    ctx.fillRect(boardX, boardY, boardW, boardH);

    // 4. Machined Fluted Grooves with Inlaid Gold Coins
    const grooveCount = 6;
    const grooveSpacing = boardH / (grooveCount + 1);

    for (let g = 1; g <= grooveCount; g++) {
      const gy = boardY + g * grooveSpacing;

      // Dark machined groove trough line
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(boardX + 3, gy);
      ctx.lineTo(boardX + boardW - 3, gy);
      ctx.stroke();

      // Lower bevel highlight
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(boardX + 3, gy + 1);
      ctx.lineTo(boardX + boardW - 3, gy + 1);
      ctx.stroke();

      // Row of flat gold sovereigns in each groove
      const coinsInRow = 7;
      const coinSpacing = (boardW - 12) / coinsInRow;
      for (let c = 0; c < coinsInRow; c++) {
        const coinX = boardX + 6 + c * coinSpacing + (g % 2 === 0 ? 3 : 0);
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(coinX, gy - 0.5, 3.2, 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Idle glint
        if (!isPouring && (Math.sin(timeMs * 0.004 + c * 0.8 + g) > 0.8)) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(coinX - 0.8, gy - 1, 1.2, 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 5. Elevated Copper Feed Hopper (Back edge)
    const hopperW = 28;
    const hopperH = 14;
    const hopperY = baseY + 2;

    // Tilt angle if pouring
    const hopperTilt = isPouring && pourProgress < 0.45 ? Math.sin((pourProgress / 0.45) * Math.PI) * 0.35 : 0;

    ctx.save();
    ctx.translate(cx, hopperY + hopperH);
    ctx.rotate(-hopperTilt);

    // Copper hopper funnel
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(-hopperW / 2, -hopperH);
    ctx.lineTo(hopperW / 2, -hopperH);
    ctx.lineTo(hopperW / 4, 0);
    ctx.lineTo(-hopperW / 4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Hopper handle
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hopperW / 2 - 2, -hopperH + 4);
    ctx.lineTo(hopperW / 2 + 8, -hopperH - 2);
    ctx.stroke();

    ctx.restore();

    // 6. Pouring Coin Cascade Particle Stream (When active)
    if (isPouring && pourProgress < 0.6) {
      const streamProgress = pourProgress / 0.6;
      ctx.fillStyle = '#facc15';
      for (let p = 0; p < 8; p++) {
        const px = cx + (Math.sin(p * 3.7 + streamProgress * 12) * 16);
        const py = hopperY + 12 + ((streamProgress * 30 + p * 6) % 36);
        ctx.beginPath();
        ctx.ellipse(px, py, 2.5, 1.3, streamProgress * 5 + p, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 7. Reciprocating Mahogany Strike-Bar (Wooden Scraper Bat)
    let strikeBarOffset = 0;
    if (isPouring && pourProgress >= 0.15 && pourProgress <= 0.7) {
      const sweepPhase = (pourProgress - 0.15) / 0.55;
      strikeBarOffset = Math.sin(sweepPhase * Math.PI * 2) * 20;
    }

    const barX = cx - 18 + strikeBarOffset;
    const barY = boardY + 8;
    const barW = 36;
    const barH = 5;

    // Strike-bar shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(barX - 1, barY + 4, barW + 2, 3);

    // Mahogany strike-bar body
    ctx.fillStyle = '#451a03';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Brass center knob/handle on scraper
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(barX + barW / 2, barY - 1, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 8. Visual Badge when batch is verified and dumped
    if (isPouring && pourProgress > 0.5) {
      const badgeAlpha = Math.sin(((pourProgress - 0.5) / 0.5) * Math.PI);
      const badgeY = baseY - 8 - (pourProgress - 0.5) * 14;
      ctx.save();
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(254, 240, 138, ${badgeAlpha})`;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 4;
      ctx.fillText('£100 AUDITED', cx, badgeY);
      ctx.restore();
    }
  },
};
