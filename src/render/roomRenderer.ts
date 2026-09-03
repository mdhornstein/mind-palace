import { WorldState, InteractiveZone } from '../core/types';
import {
  ROOM_WIDTH_TILES,
  ROOM_HEIGHT_TILES,
  TILE_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../core/constants';
import {
  drawFloorPlank,
  drawWallTile,
  drawWindow,
  drawFireplace,
  drawOrnateRug,
  drawBookshelf,
  drawReadingNook,
  drawWorkshop,
  drawFossilCabinet,
  drawPedestal,
  drawCompanionSprite,
  drawPlayerSprite,
} from './sprites';

interface DustMote {
  x: number;
  y: number;
  speedY: number;
  phase: number;
  size: number;
}

export class RoomRenderer {
  private ctx: CanvasRenderingContext2D;
  private dustMotes: DustMote[] = [];
  private bgCanvas: HTMLCanvasElement;
  private bgCtx: CanvasRenderingContext2D;
  private bgDirty: boolean = true;
  private lastBookOnRug: boolean = false;
  private lastPedestalSpecimenId: string | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.initDustMotes();

    // Offscreen background canvas for high performance
    this.bgCanvas = document.createElement('canvas');
    this.bgCanvas.width = CANVAS_WIDTH;
    this.bgCanvas.height = CANVAS_HEIGHT;
    const bgContext = this.bgCanvas.getContext('2d');
    if (!bgContext) throw new Error('Could not create bg canvas context');
    this.bgCtx = bgContext;
    this.bgCtx.imageSmoothingEnabled = false;
  }

  private initDustMotes() {
    for (let i = 0; i < 28; i++) {
      this.dustMotes.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        speedY: 0.15 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        size: Math.random() > 0.6 ? 1.5 : 1,
      });
    }
  }

  private renderStaticBackground(state: WorldState) {
    const ctx = this.bgCtx;
    ctx.imageSmoothingEnabled = false;

    // 1. Clear background
    ctx.fillStyle = '#0f0a07';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Render Walls & Floors
    for (let ty = 0; ty < ROOM_HEIGHT_TILES; ty++) {
      for (let tx = 0; tx < ROOM_WIDTH_TILES; tx++) {
        const x = tx * TILE_SIZE;
        const y = ty * TILE_SIZE;

        if (ty === 0) {
          drawWallTile(ctx, x, y, false);
        } else if (ty === 1) {
          drawWallTile(ctx, x, y, true);
        } else {
          const variant = (tx * 3 + ty * 7) % 4;
          drawFloorPlank(ctx, x, y, variant);
        }
      }
    }

    // 3. Architectural Rug in reading nook
    drawOrnateRug(ctx, 2 * TILE_SIZE, 4 * TILE_SIZE, 5 * TILE_SIZE, 5 * TILE_SIZE);

    // 4. Fixed Bookshelf (base)
    drawBookshelf(ctx, 2 * TILE_SIZE, 1 * TILE_SIZE, 4 * TILE_SIZE, 2.5 * TILE_SIZE);

    // 5. Entrance Door Mat
    ctx.fillStyle = '#291b12';
    ctx.fillRect(9 * TILE_SIZE, 14 * TILE_SIZE + 10, 2 * TILE_SIZE, 20);
    ctx.fillStyle = '#452b1b';
    ctx.font = '7px monospace';
    ctx.fillText('HOME', 9.4 * TILE_SIZE, 14.5 * TILE_SIZE + 12);

    this.bgDirty = false;
    this.lastBookOnRug = state.environment.bookOpenOnRug;
    this.lastPedestalSpecimenId = state.environment.activePedestalSpecimenId;
  }

  public render(
    state: WorldState,
    isMoving: boolean,
    walkFrame: number,
    activeZone: InteractiveZone | null,
    timeMs: number
  ) {
    const ctx = this.ctx;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Rebuild background cache if environment changed
    if (
      this.bgDirty ||
      this.lastBookOnRug !== state.environment.bookOpenOnRug ||
      this.lastPedestalSpecimenId !== state.environment.activePedestalSpecimenId
    ) {
      this.renderStaticBackground(state);
    }

    // Blit pre-rendered background instantly (0ms)
    ctx.drawImage(this.bgCanvas, 0, 0);

    // Dynamic Architectural Fixtures
    // Arched window on north wall
    drawWindow(ctx, 4 * TILE_SIZE, 6, timeMs);

    // Crackling Stone Fireplace with animated flames
    drawFireplace(ctx, 8.5 * TILE_SIZE, 6, timeMs);

    // Reading Nook (Armchair + Tea Table + optional open book on rug)
    drawReadingNook(
      ctx,
      3.5 * TILE_SIZE,
      5.5 * TILE_SIZE,
      timeMs,
      state.environment.bookOpenOnRug
    );

    // Fossil Curio Cabinet (Top Right)
    const hasUndiscovered = state.specimens.some((s) => !s.discovered);
    drawFossilCabinet(
      ctx,
      14 * TILE_SIZE,
      1 * TILE_SIZE,
      4 * TILE_SIZE,
      2.5 * TILE_SIZE,
      hasUndiscovered,
      timeMs
    );

    // Display Pedestal
    const featuredSpecimen = state.specimens.find((s) => s.id === state.environment.activePedestalSpecimenId);
    drawPedestal(
      ctx,
      15 * TILE_SIZE,
      5 * TILE_SIZE,
      featuredSpecimen ? featuredSpecimen.name : null
    );

    // Science Workstation (Desk + Chalkboard + FEA Skull + CRT)
    const activeProject = state.projects[0];
    drawWorkshop(
      ctx,
      13 * TILE_SIZE,
      9.5 * TILE_SIZE,
      5.5 * TILE_SIZE,
      3.5 * TILE_SIZE,
      activeProject,
      state.environment.chalkboardEquation,
      timeMs
    );

    // 5. Entrance Door Mat (Bottom Center)
    ctx.fillStyle = '#291b12';
    ctx.fillRect(9 * TILE_SIZE, 14 * TILE_SIZE + 10, 2 * TILE_SIZE, 20);
    ctx.fillStyle = '#452b1b';
    ctx.font = '7px monospace';
    ctx.fillText('HOME', 9.4 * TILE_SIZE, 14.5 * TILE_SIZE + 12);

    // 6. Characters (Render sorted by Y for correct isometric depth)
    const renderables = [
      {
        y: state.companion.y,
        draw: () =>
          drawCompanionSprite(
            ctx,
            state.companion.x,
            state.companion.y,
            state.companion.activity,
            state.companion.facing,
            timeMs
          ),
      },
      {
        y: state.player.y,
        draw: () =>
          drawPlayerSprite(
            ctx,
            state.player.x,
            state.player.y,
            state.player.facing,
            isMoving,
            walkFrame
          ),
      },
    ];

    renderables.sort((a, b) => a.y - b.y);
    renderables.forEach((r) => r.draw());

    // 7. Companion Speech Bubble
    if (state.companion.speech) {
      const now = Date.now();
      const elapsed = now - state.companion.speech.timestamp;
      if (elapsed < state.companion.speech.durationMs) {
        const fade = elapsed > state.companion.speech.durationMs - 600
          ? (state.companion.speech.durationMs - elapsed) / 600
          : 1;

        this.drawSpeechBubble(
          ctx,
          state.companion.x + 8,
          state.companion.y - 10,
          state.companion.speech.text,
          fade
        );
      }
    }

    // 8. Ambient Lighting & Light Shafts
    this.renderAtmosphericLighting(ctx, timeMs);

    // 9. Floating Dust Motes
    this.renderDustMotes(ctx, timeMs);

    // 10. Interactive Zone Proximity Cue
    if (activeZone) {
      this.drawInteractionPrompt(ctx, activeZone, timeMs);
    }

    ctx.restore();
  }

  private drawSpeechBubble(
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    text: string,
    alpha: number
  ) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    ctx.font = '10px Georgia, serif';
    const metrics = ctx.measureText(text);
    const padding = 8;
    const bw = metrics.width + padding * 2;
    const bh = 22;
    const rx = Math.max(10, Math.min(CANVAS_WIDTH - bw - 10, bx - bw / 2));
    const ry = by - bh - 6;

    // Bubble shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(rx + 2, ry + 2, bw, bh);

    // Bubble body (warm ivory parchment)
    ctx.fillStyle = '#fefce8';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.fillRect(rx, ry, bw, bh);
    ctx.strokeRect(rx, ry, bw, bh);

    // Bubble tail
    ctx.fillStyle = '#fefce8';
    ctx.beginPath();
    ctx.moveTo(bx - 3, ry + bh);
    ctx.lineTo(bx + 3, ry + bh);
    ctx.lineTo(bx, ry + bh + 5);
    ctx.closePath();
    ctx.fill();

    // Text
    ctx.fillStyle = '#451a03';
    ctx.fillText(text, rx + padding, ry + 14);

    ctx.restore();
  }

  private drawInteractionPrompt(
    ctx: CanvasRenderingContext2D,
    zone: InteractiveZone,
    timeMs: number
  ) {
    const bob = Math.sin(timeMs * 0.006) * 3;
    const cx = zone.x + zone.width / 2;
    const cy = zone.y + zone.height + 6 + bob;

    ctx.save();
    // Soft glowing prompt capsule
    const text = `[Space / Click] ${zone.name}`;
    ctx.font = 'bold 9px monospace';
    const tw = ctx.measureText(text).width;
    const bw = tw + 14;
    const bh = 18;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.textAlign = 'center';
    ctx.fillText(text, cx, cy + 3);

    ctx.restore();
  }

  private renderAtmosphericLighting(ctx: CanvasRenderingContext2D, timeMs: number) {
    // Window moonbeam shaft
    const windowRay = ctx.createLinearGradient(4 * TILE_SIZE, 20, 3 * TILE_SIZE, 8 * TILE_SIZE);
    windowRay.addColorStop(0, 'rgba(186, 230, 253, 0.12)');
    windowRay.addColorStop(1, 'rgba(186, 230, 253, 0.0)');

    ctx.fillStyle = windowRay;
    ctx.beginPath();
    ctx.moveTo(4 * TILE_SIZE, 24);
    ctx.lineTo(5.5 * TILE_SIZE, 24);
    ctx.lineTo(6.5 * TILE_SIZE, 9 * TILE_SIZE);
    ctx.lineTo(1.5 * TILE_SIZE, 9 * TILE_SIZE);
    ctx.closePath();
    ctx.fill();

    // Fireplace warm radial glow (pulses with fire flicker)
    const firePulse = Math.sin(timeMs * 0.01) * 6;
    const fireGlow = ctx.createRadialGradient(
      9.5 * TILE_SIZE,
      2.5 * TILE_SIZE,
      10,
      9.5 * TILE_SIZE,
      2.5 * TILE_SIZE,
      110 + firePulse
    );
    fireGlow.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
    fireGlow.addColorStop(0.5, 'rgba(220, 38, 38, 0.08)');
    fireGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = fireGlow;
    ctx.beginPath();
    ctx.arc(9.5 * TILE_SIZE, 2.5 * TILE_SIZE, 120, 0, Math.PI * 2);
    ctx.fill();

    // Subtle dark room vignette around borders
    const vignette = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.35,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.72
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  private renderDustMotes(ctx: CanvasRenderingContext2D, timeMs: number) {
    ctx.save();
    for (const mote of this.dustMotes) {
      mote.y += mote.speedY;
      if (mote.y > CANVAS_HEIGHT) {
        mote.y = 0;
        mote.x = Math.random() * CANVAS_WIDTH;
      }
      const wobble = Math.sin(timeMs * 0.002 + mote.phase) * 6;
      const alpha = Math.sin(timeMs * 0.0015 + mote.phase) * 0.3 + 0.45;

      ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.fillRect(Math.floor(mote.x + wobble), Math.floor(mote.y), mote.size, mote.size);
    }
    ctx.restore();
  }
}
