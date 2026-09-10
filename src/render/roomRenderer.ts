import { WorldState, RoomConfig, DeepReadonly, RenderPlayer } from '../core/types';
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

  /**
   * Force the background cache to be rebuilt on the next render call.
   * Must be called when the room's visual identity changes but room.id stays the same
   * (e.g. Escher variant hot-swap where both variants share id 'escher').
   */
  public invalidateBackground(): void {
    this.bgDirty = true;
    this.currentCachedRoomId = null;
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

  private renderStaticBackground(state: DeepReadonly<WorldState>, room: RoomConfig) {
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
    state: DeepReadonly<WorldState>,
    player: RenderPlayer,
    timeMs: number,
    room: RoomConfig,
    dtSeconds: number = 1 / 60
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

    // 4. Dynamic Entities & Characters (Render sorted by Y for correct isometric depth)
    const renderables: Array<{ y: number; draw: () => void }> = [
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

    // Companion rendering is driven declaratively by room.hasCompanion
    if (room.hasCompanion) {
      renderables.push({
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
      });
    }

    // Dynamic entities provided by the room (e.g. Barnaby the Duckephant)
    if (room.getEntities) {
      const dynamicEntities = room.getEntities(state, timeMs);
      for (const entity of dynamicEntities) {
        renderables.push({
          y: entity.y,
          draw: () => entity.draw(ctx, timeMs),
        });
      }
    }

    // Decorative Props (Render sorted by Y with characters for natural isometric depth)
    if (room.decorativeProps) {
      for (const prop of room.decorativeProps) {
        renderables.push({
          y: prop.y,
          draw: () => prop.draw(ctx, timeMs),
        });
      }
    }

    renderables.sort((a, b) => a.y - b.y);
    renderables.forEach((r) => r.draw());

    // 5. Floating Ambient Dust Motes (frame-rate independent via dtSeconds)
    this.renderDustMotes(ctx, timeMs, dtSeconds);

    ctx.restore();
  }

  public stepDustMotes(dtSeconds: number) {
    for (const mote of this.dustMotes) {
      mote.y += mote.speedY * (dtSeconds * 60);
      if (mote.y > CANVAS_HEIGHT) {
        mote.y = 0;
        mote.x = Math.random() * CANVAS_WIDTH;
      }
    }
  }

  public getDustMotes(): readonly DustMote[] {
    return this.dustMotes;
  }

  private renderDustMotes(ctx: CanvasRenderingContext2D, timeMs: number, dtSeconds: number) {
    this.stepDustMotes(dtSeconds);
    ctx.save();
    for (const mote of this.dustMotes) {
      const wobble = Math.sin(timeMs * 0.002 + mote.phase) * 6;
      const alpha = Math.sin(timeMs * 0.0015 + mote.phase) * 0.3 + 0.45;

      ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
      ctx.fillRect(Math.floor(mote.x + wobble), Math.floor(mote.y), mote.size, mote.size);
    }
    ctx.restore();
  }
}

