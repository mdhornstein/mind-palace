import './ui/styles.css';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, INTERACTIVE_ZONES } from './core/constants';
import { StateManager } from './core/state';
import { PlayerController } from './world/player';
import { CompanionController } from './world/companion';
import { RoomRenderer } from './render/roomRenderer';
import { ModalOverlay } from './ui/overlay';
import { openLibraryModal } from './ui/libraryModal';
import { openWorkshopModal } from './ui/workshopModal';
import { openCabinetModal } from './ui/cabinetModal';
import { DevTray } from './ui/devTray';
import { InteractiveZone } from './core/types';

// Walkable approach spots right in front of each station
const APPROACH_POINTS: Record<string, { x: number; y: number }> = {
  library: { x: 3.5 * TILE_SIZE, y: 3.5 * TILE_SIZE },
  workshop: { x: 14.5 * TILE_SIZE, y: 8.5 * TILE_SIZE },
  cabinet: { x: 15.5 * TILE_SIZE, y: 3.5 * TILE_SIZE },
  pedestal: { x: 14.0 * TILE_SIZE, y: 5.5 * TILE_SIZE },
};

class MindPalaceApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stateManager: StateManager;
  private player: PlayerController;
  private companion: CompanionController;
  private renderer: RoomRenderer;
  private overlay: ModalOverlay;
  private activeZone: InteractiveZone | null = null;
  private lastSaveTime = Date.now();
  private lastLoopTime = performance.now();

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not acquire 2D canvas context');
    }
    this.ctx = context;

    this.stateManager = StateManager.getInstance();
    const savedState = this.stateManager.getState();

    this.player = new PlayerController(
      savedState.player.x,
      savedState.player.y,
      savedState.player.facing
    );

    this.companion = new CompanionController(this.stateManager);
    this.renderer = new RoomRenderer(this.ctx);
    this.overlay = ModalOverlay.getInstance();
    new DevTray(this.stateManager);

    this.setupViewportScaling();
    this.setupInteractions();
    this.startLoop();
  }

  private setupViewportScaling() {
    const resize = () => {
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const padding = 16;
      const availW = Math.max(320, winW - padding * 2);
      const availH = Math.max(240, winH - padding * 2);

      // Smooth proportional scaling without clamping to 1x on 800px displays
      const scale = Math.min(availW / CANVAS_WIDTH, availH / CANVAS_HEIGHT);
      const displayW = Math.round(CANVAS_WIDTH * scale);
      const displayH = Math.round(CANVAS_HEIGHT * scale);

      this.canvas.style.width = `${displayW}px`;
      this.canvas.style.height = `${displayH}px`;
    };

    window.addEventListener('resize', resize);
    resize();
  }

  private getClickedZone(clickX: number, clickY: number): InteractiveZone | null {
    for (const zone of INTERACTIVE_ZONES) {
      // Generous clickable boundary for furniture
      const expandedX = zone.x - 10;
      const expandedY = zone.y - 10;
      const expandedW = zone.width + 20;
      const expandedH = zone.height + 25;

      if (
        clickX >= expandedX &&
        clickX <= expandedX + expandedW &&
        clickY >= expandedY &&
        clickY <= expandedY + expandedH
      ) {
        return zone;
      }
    }
    return null;
  }

  private setupInteractions() {
    // Keyboard inspection trigger (Space, Enter, E)
    window.addEventListener('keydown', (e) => {
      if (this.overlay.isOpen()) return;
      if (['Space', 'Enter', 'KeyE'].includes(e.code)) {
        if (this.activeZone) {
          e.preventDefault();
          this.triggerZoneInteraction(this.activeZone);
        }
      }
    });

    // Hover cursor: pointer when hovering over interactive objects
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.overlay.isOpen()) {
        this.canvas.style.cursor = 'default';
        return;
      }

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      const hoveredZone = this.getClickedZone(mouseX, mouseY);
      this.canvas.style.cursor = hoveredZone ? 'pointer' : 'default';
    });

    // Canvas click to move or click to interact
    this.canvas.addEventListener('click', (e) => {
      if (this.overlay.isOpen()) return;

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;

      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const clickedZone = this.getClickedZone(clickX, clickY);

      if (clickedZone) {
        // Instantly face and trigger the interaction at the station's approach spot!
        const approach = APPROACH_POINTS[clickedZone.id] || { x: clickedZone.x, y: clickedZone.y };
        this.player.x = approach.x;
        this.player.y = approach.y;
        this.stateManager.syncPlayerPosition(this.player.x, this.player.y, this.player.facing);
        this.triggerZoneInteraction(clickedZone);
        return;
      }

      // Click on open floor: walk smoothly to location
      this.player.setTargetPosition(clickX, clickY);
    });
  }

  private triggerZoneInteraction(zone: InteractiveZone) {
    switch (zone.id) {
      case 'library':
        openLibraryModal(this.stateManager);
        break;
      case 'workshop':
        openWorkshopModal(this.stateManager);
        break;
      case 'cabinet':
        openCabinetModal(this.stateManager);
        break;
      case 'pedestal': {
        const state = this.stateManager.getState();
        openCabinetModal(this.stateManager, state.environment.activePedestalSpecimenId || undefined);
        break;
      }
    }
  }

  private startLoop() {
    this.lastLoopTime = performance.now();

    const loop = (now: number) => {
      // Calculate delta time in seconds, capped at 100ms
      const dt = Math.min(0.1, (now - this.lastLoopTime) / 1000);
      this.lastLoopTime = now;

      // If modal dialog is open, pause player walking updates
      if (!this.overlay.isOpen()) {
        const { changed, activeZone } = this.player.update(dt);
        this.activeZone = activeZone;

        // Synchronize live player position to in-memory state every single frame!
        this.stateManager.syncPlayerPosition(this.player.x, this.player.y, this.player.facing);

        if (changed) {
          const nowMs = Date.now();
          if (nowMs - this.lastSaveTime > 2000) {
            this.stateManager.persist();
            this.lastSaveTime = nowMs;
          }
        }

        this.companion.update(dt);
      }

      const state = this.stateManager.getState();
      // Render player with LIVE coordinates every frame (60fps)
      this.renderer.render(
        state,
        this.player,
        this.activeZone,
        now
      );

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Bootstrap once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new MindPalaceApp();
});
