import './ui/styles.css';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from './core/constants';
import { StateManager } from './core/state';
import { PlayerController } from './world/player';
import { CompanionController } from './world/companion';
import { RoomRenderer } from './render/roomRenderer';
import { ModalOverlay } from './ui/overlay';
import { DevTray } from './ui/devTray';
import { RoomConfig, Direction, InteractiveTarget } from './core/types';
import { RoomRegistry } from './rooms/registry';
import { HearthAudio } from './sound/audio';
import { InteractionSystem, shouldDispatchPendingInteraction } from './world/interactionSystem';
import { InteractionDispatcher } from './ui/interactionDispatcher';

class MindPalaceApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stateManager: StateManager;
  private player: PlayerController;
  private companion: CompanionController;
  private renderer: RoomRenderer;
  private overlay: ModalOverlay;
  private promptEl: HTMLDivElement;
  private speechEl: HTMLDivElement;
  private activeTarget: InteractiveTarget | null = null;
  private pendingTarget: InteractiveTarget | null = null;
  private currentRoom: RoomConfig;
  private lastSaveTime = Date.now();
  private lastLoopTime = performance.now();
  private lastTransitionTime = 0;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not acquire 2D canvas context');
    }
    this.ctx = context;

    this.promptEl = document.getElementById('interaction-prompt') as HTMLDivElement;
    this.speechEl = document.getElementById('companion-speech-bubble') as HTMLDivElement;

    this.stateManager = StateManager.getInstance();
    const savedState = this.stateManager.getState();
    this.currentRoom = RoomRegistry.getRoom(savedState.currentRoomId || 'study');

    this.player = new PlayerController(
      savedState.player.x,
      savedState.player.y,
      savedState.player.facing,
      this.currentRoom
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

  private setupInteractions() {
    // Keyboard inspection trigger (Space, Enter, E) and movement key handling
    window.addEventListener('keydown', (e) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      // Manual movement cancels click-to-walk interaction
      const moveKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'KeyW', 'KeyS', 'KeyA', 'KeyD',
        'w', 's', 'a', 'd',
        'arrowup', 'arrowdown', 'arrowleft', 'arrowright'
      ];
      if (moveKeys.includes(e.code) || (e.key && moveKeys.includes(e.key.toLowerCase()))) {
        this.pendingTarget = null;
      }

      if (this.overlay.isOpen()) return;

      const isInteractKey =
        ['Space', 'Enter', 'KeyE'].includes(e.code) ||
        [' ', 'Spacebar', 'Enter', 'e', 'E'].includes(e.key);

      if (isInteractKey && this.activeTarget) {
        e.preventDefault();
        this.triggerActiveInteraction();
      }
    });

    // Clicking the prompt pill directly triggers the interaction
    this.promptEl.addEventListener('click', () => {
      if (this.overlay.isOpen()) return;
      if (this.activeTarget) {
        this.triggerActiveInteraction();
      }
    });

    // Hover cursor: pointer when hovering over interactive objects or doorways
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

      const hoveredTarget = InteractionSystem.findInteractiveAt(this.currentRoom, mouseX, mouseY);
      this.canvas.style.cursor = hoveredTarget ? 'pointer' : 'default';
    });

    // Canvas click to move or click to interact
    this.canvas.addEventListener('click', (e) => {
      if (this.overlay.isOpen()) return;

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;

      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const clickedTarget = InteractionSystem.findInteractiveAt(this.currentRoom, clickX, clickY);

      if (clickedTarget) {
        if (clickedTarget.kind === 'door') {
          // Explicit UX Invariant: Door click -> immediate room transition
          this.pendingTarget = null;
          this.player.clearTarget();
          this.transitionToRoom(clickedTarget.door.targetRoomId, clickedTarget.door.targetSpawnPoint);
          return;
        }

        if (clickedTarget.kind === 'station') {
          // Explicit UX Invariant: Station click -> walk to interaction point -> interact upon arrival
          const targetPoint = InteractionSystem.getInteractionPoint(clickedTarget);
          this.player.setTargetPosition(targetPoint.x, targetPoint.y);
          this.pendingTarget = clickedTarget;
          return;
        }
      }

      // Open floor click: walk directly to clicked coordinate, cancelling pending station interaction
      this.player.setTargetPosition(clickX, clickY);
      this.pendingTarget = null;
    });
  }

  private triggerActiveInteraction() {
    if (!this.activeTarget) return;

    if (this.activeTarget.kind === 'door') {
      this.pendingTarget = null;
      this.player.clearTarget();
      this.transitionToRoom(
        this.activeTarget.door.targetRoomId,
        this.activeTarget.door.targetSpawnPoint
      );
      return;
    }

    if (this.activeTarget.kind === 'station') {
      this.pendingTarget = null;
      this.player.stop();
      InteractionDispatcher.dispatch(this.activeTarget.station.intent, {
        stateManager: this.stateManager,
        transitionToRoom: (roomId, spawn) => this.transitionToRoom(roomId, spawn),
      });
    }
  }

  public transitionToRoom(roomId: string, spawnPoint?: { x: number; y: number; facing: Direction }) {
    const newRoom = RoomRegistry.getRoom(roomId);
    this.currentRoom = newRoom;
    this.stateManager.setRoomId(roomId);
    this.player.setRoom(newRoom);
    if (spawnPoint) {
      this.player.teleportTo(spawnPoint.x, spawnPoint.y, spawnPoint.facing);
      this.stateManager.syncPlayerPosition(this.player.x, this.player.y, this.player.facing);
    }
    this.activeTarget = null;
    this.pendingTarget = null;
    this.updatePromptUI();
    this.updateSpeechUI(this.stateManager.getState());
    HearthAudio.getInstance().setRoom(roomId);
    this.lastTransitionTime = Date.now();
  }

  private updatePromptUI() {
    if (this.overlay.isOpen() || !this.activeTarget) {
      this.promptEl.className = '';
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const scale = rect.width / CANVAS_WIDTH;

    let zoneX: number;
    let zoneY: number;
    let zoneW: number;
    let zoneH: number;
    let name: string;
    let prompt: string;
    const isPortal = this.activeTarget.kind === 'door';

    if (this.activeTarget.kind === 'door') {
      const door = this.activeTarget.door;
      zoneX = door.tileX * TILE_SIZE;
      zoneY = door.tileY * TILE_SIZE;
      zoneW = door.tileWidth * TILE_SIZE;
      zoneH = door.tileHeight * TILE_SIZE;
      name = door.name;
      prompt = door.prompt;
    } else {
      const station = this.activeTarget.station;
      zoneX = station.tileX * TILE_SIZE;
      zoneY = station.tileY * TILE_SIZE;
      zoneW = station.tileWidth * TILE_SIZE;
      zoneH = station.tileHeight * TILE_SIZE;
      name = station.name;
      prompt = station.prompt;
    }

    const zoneCenterX = zoneX + zoneW / 2;
    // Anchor prompt dynamically above the zone
    let targetCanvasY = zoneY - 12;
    if (targetCanvasY < 40) {
      targetCanvasY = zoneY + zoneH + 22;
    }

    const screenX = rect.left + zoneCenterX * scale;
    const screenY = rect.top + targetCanvasY * scale;

    this.promptEl.style.left = `${screenX}px`;
    this.promptEl.style.top = `${screenY}px`;
    this.promptEl.className = isPortal ? 'visible portal-prompt' : 'visible';
    this.promptEl.innerHTML = `
      <div class="prompt-keys">
        <kbd>Space</kbd>
        <kbd>Click</kbd>
      </div>
      <span class="prompt-name">${name}</span>
      <span class="prompt-action">${prompt}</span>
    `;
  }

  private updateSpeechUI(state: ReturnType<StateManager['getState']>) {
    if (this.currentRoom.hasCompanion && state.companion.speech) {
      const now = Date.now();
      const elapsed = now - state.companion.speech.timestamp;
      if (elapsed < state.companion.speech.durationMs) {
        const rect = this.canvas.getBoundingClientRect();
        const scale = rect.width / CANVAS_WIDTH;
        const screenX = rect.left + (state.companion.x + 8) * scale;
        const screenY = rect.top + (state.companion.y - 8) * scale;
        this.speechEl.style.left = `${screenX}px`;
        this.speechEl.style.top = `${screenY}px`;
        this.speechEl.textContent = state.companion.speech.text;
        this.speechEl.className = 'visible';
        return;
      }
    }
    this.speechEl.className = '';
  }

  private startLoop() {
    this.lastLoopTime = performance.now();

    const loop = (now: number) => {
      // Calculate delta time in seconds, capped at 100ms
      const dt = Math.min(0.1, (now - this.lastLoopTime) / 1000);
      this.lastLoopTime = now;

      // If modal dialog is open, pause player walking updates
      if (!this.overlay.isOpen()) {
        const { changed } = this.player.update(dt);

        // Update active target via unified foot proximity detection
        this.activeTarget = InteractionSystem.findNearbyInteractive(
          this.currentRoom,
          this.player.x,
          this.player.y
        );

        // Check if player arrived at pending click-to-walk interaction target
        if (this.pendingTarget && this.pendingTarget.kind === 'station') {
          const navStatus = this.player.getNavigationStatus();

          if (
            shouldDispatchPendingInteraction(
              this.pendingTarget,
              this.activeTarget,
              navStatus
            )
          ) {
            const station = this.pendingTarget.station;
            this.pendingTarget = null;
            this.player.stop();
            InteractionDispatcher.dispatch(station.intent, {
              stateManager: this.stateManager,
              transitionToRoom: (roomId, spawn) => this.transitionToRoom(roomId, spawn),
            });
          } else if (navStatus === 'blocked') {
            // Path was blocked by an obstacle; cancel pending interaction
            this.pendingTarget = null;
          }
        }

        // Check seamless automatic doorway walking threshold (cooldown prevents instant bounceback)
        if (Date.now() - this.lastTransitionTime > 1000) {
          const steppedDoor = InteractionSystem.findSteppedDoorway(
            this.currentRoom,
            this.player.x,
            this.player.y
          );
          if (steppedDoor) {
            this.transitionToRoom(
              steppedDoor.targetRoomId,
              steppedDoor.targetSpawnPoint
            );
          }
        }

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
        if (this.currentRoom.onUpdate) {
          this.currentRoom.onUpdate(dt, { x: this.player.x, y: this.player.y });
        }
      }

      const state = this.stateManager.getState();
      // Update DOM Overlays for 100% crisp native-DPI text
      this.updatePromptUI();
      this.updateSpeechUI(state);

      // Render room and player with LIVE coordinates every frame (60fps)
      this.renderer.render(
        state,
        this.player,
        this.activeTarget,
        now,
        this.currentRoom
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
