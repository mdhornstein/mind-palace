import { WorldState, InteractiveZone, RoomConfig } from '../core/types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TILE_SIZE,
} from '../core/constants';
import {
  drawFloorPlank,
  drawWallTile,
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
  private currentCachedRoomId: string | null = null;
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

  private renderStaticBackground(state: WorldState, room: RoomConfig) {
    const ctx = this.bgCtx;
    ctx.imageSmoothingEnabled = false;

    if (room.customDrawBackground) {
      room.customDrawBackground(ctx, state);
    } else {
      // Default procedural walls & herringbone floors
      ctx.fillStyle = '#0f0a07';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      for (let ty = 0; ty < room.heightTiles; ty++) {
        for (let tx = 0; tx < room.widthTiles; tx++) {
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
    }

    this.bgDirty = false;
    this.currentCachedRoomId = room.id;
    this.lastBookOnRug = state.environment.bookOpenOnRug;
    this.lastPedestalSpecimenId = state.environment.activePedestalSpecimenId;
  }

  public render(
    state: WorldState,
    player: { x: number; y: number; facing: WorldState['player']['facing']; isMoving: boolean; walkFrame: number },
    activeZone: InteractiveZone | null,
    timeMs: number,
    room: RoomConfig
  ) {
    const ctx = this.ctx;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Rebuild background cache if environment changed or room switched
    if (
      this.bgDirty ||
      this.currentCachedRoomId !== room.id ||
      this.lastBookOnRug !== state.environment.bookOpenOnRug ||
      this.lastPedestalSpecimenId !== state.environment.activePedestalSpecimenId
    ) {
      this.renderStaticBackground(state, room);
    }

    // 1. Blit pre-rendered background instantly
    ctx.drawImage(this.bgCanvas, 0, 0);

    // 2. Room-specific Dynamic Atmosphere (e.g. windows, fireplace, moonbeams)
    if (room.customDrawAtmosphere) {
      room.customDrawAtmosphere(ctx, timeMs);
    }

    // 3. Modular Interactive Stations (Each station renders itself!)
    for (const station of room.stations) {
      station.draw(ctx, timeMs, state);
    }

    // 4. Characters (Render sorted by Y for correct isometric depth)
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
        y: player.y,
        draw: () =>
          drawPlayerSprite(
            ctx,
            player.x,
            player.y,
            player.facing,
            player.isMoving,
            player.walkFrame
          ),
      },
    ];

    renderables.sort((a, b) => a.y - b.y);
    renderables.forEach((r) => r.draw());

    // 5. Companion Speech Bubble
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

    // 6. Floating Ambient Dust Motes
    this.renderDustMotes(ctx, timeMs);

    // 7. Interactive Zone / Station Proximity Cue
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
