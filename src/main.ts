import './ui/styles.css';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './core/constants';
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
      const scale = Math.max(1, Math.min(Math.floor(winW / CANVAS_WIDTH), Math.floor(winH / CANVAS_HEIGHT)));

      this.canvas.style.width = `${CANVAS_WIDTH * scale}px`;
      this.canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
    };

    window.addEventListener('resize', resize);
    resize();
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

    // Canvas click to move or click to interact
    this.canvas.addEventListener('click', (e) => {
      if (this.overlay.isOpen()) return;

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;

      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // If clicked near an active zone and already near it, open it directly
      if (this.activeZone) {
        const az = this.activeZone;
        if (
          clickX >= az.x - 20 &&
          clickX <= az.x + az.width + 20 &&
          clickY >= az.y - 20 &&
          clickY <= az.y + az.height + 20
        ) {
          this.triggerZoneInteraction(this.activeZone);
          return;
        }
      }

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
    const loop = (timeMs: number) => {
      // If modal dialog is open, pause player walking updates
      if (!this.overlay.isOpen()) {
        const { changed, activeZone } = this.player.update();
        this.activeZone = activeZone;

        if (changed) {
          const now = Date.now();
          if (now - this.lastSaveTime > 1500) {
            this.stateManager.updatePlayer(this.player.x, this.player.y, this.player.facing);
            this.lastSaveTime = now;
          }
        }

        this.companion.update(timeMs);
      }

      const state = this.stateManager.getState();
      this.renderer.render(
        state,
        this.player.isMoving,
        this.player.walkFrame,
        this.activeZone,
        timeMs
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
