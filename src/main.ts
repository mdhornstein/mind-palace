import './ui/styles.css';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './core/constants';
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
import { GameLoop } from './core/gameLoop';
import { HudManager } from './ui/hudManager';
import { RoomVariantManager } from './rooms/variants/roomVariantManager';

class MindPalaceApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private stateManager: StateManager;
  private player: PlayerController;
  private companion: CompanionController;
  private renderer: RoomRenderer;
  private overlay: ModalOverlay;
  private hudManager: HudManager;
  private gameLoop: GameLoop;
  private activeTarget: InteractiveTarget | null = null;
  private pendingTarget: InteractiveTarget | null = null;
  private currentRoom: RoomConfig;
  private lastSaveTime = Date.now();
  private lastTransitionTime = 0;
  private lastDtSeconds: number = 1 / 60;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not acquire 2D canvas context');
    }
    this.ctx = context;

    const promptEl = document.getElementById('interaction-prompt') as HTMLDivElement;
    const speechEl = document.getElementById('companion-speech-bubble') as HTMLDivElement;
    this.hudManager = new HudManager(promptEl, speechEl, this.canvas);

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

    RoomVariantManager.onVariantChange((roomId) => {
      const currentRoomId = this.stateManager.getState().currentRoomId;
      if (currentRoomId === roomId || currentRoomId.startsWith(`${roomId}_v`)) {
        this.currentRoom = RoomRegistry.getRoom(roomId);
        this.player.setRoom(this.currentRoom);
        this.player.ensureWalkablePosition();
        this.stateManager.syncPlayerPosition(this.player.x, this.player.y, this.player.facing);
        this.renderer.invalidateBackground();
        this.activeTarget = null;
        this.pendingTarget = null;
        this.hudManager.clear();
      }
    });

    this.setupViewportScaling();
    this.setupInteractions(promptEl);

    this.gameLoop = new GameLoop({
      onUpdate: (dtSeconds, nowMs) => this.update(dtSeconds, nowMs),
      onRender: (nowMs) => this.render(nowMs),
    });
    this.gameLoop.start();
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

      this.hudManager.handleViewportChange(this.canvas);
    };

    window.addEventListener('resize', resize);
    resize();
  }

  private setupInteractions(promptEl: HTMLElement) {
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

      const isPrimaryActionKey =
        e.code === 'KeyF' || ['f', 'F'].includes(e.key);

      if (isPrimaryActionKey && this.activeTarget) {
        e.preventDefault();
        this.triggerPrimaryAction();
        return;
      }

      const isInteractKey =
        ['Space', 'Enter', 'KeyE'].includes(e.code) ||
        [' ', 'Spacebar', 'Enter', 'e', 'E'].includes(e.key);

      if (isInteractKey && this.activeTarget) {
        e.preventDefault();
        this.triggerActiveInteraction();
      }
    });

    // Clicking the prompt pill triggers either primaryAction or the default interaction
    promptEl.addEventListener('click', (e) => {
      if (this.overlay.isOpen()) return;
      if (!this.activeTarget) return;

      const target = e.target as HTMLElement | null;
      const actionBtn = target?.closest('[data-action]');
      const actionType = actionBtn?.getAttribute('data-action');

      if (actionType === 'primary') {
        this.triggerPrimaryAction();
      } else {
        this.triggerActiveInteraction();
      }
    });

    // Hover cursor: pointer when hovering over interactive objects or doorways
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.overlay.isOpen()) {
        this.canvas.style.cursor = 'default';
        return;
      }

      const transform = this.hudManager.getTransform();
      const mouseX = (e.clientX - transform.left) / transform.scale;
      const mouseY = (e.clientY - transform.top) / transform.scale;

      const hoveredTarget = InteractionSystem.findInteractiveAt(this.currentRoom, mouseX, mouseY);
      this.canvas.style.cursor = hoveredTarget ? 'pointer' : 'default';
    });

    // Canvas click to move or click to interact
    this.canvas.addEventListener('click', (e) => {
      if (this.overlay.isOpen()) return;

      const transform = this.hudManager.getTransform();
      const clickX = (e.clientX - transform.left) / transform.scale;
      const clickY = (e.clientY - transform.top) / transform.scale;

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

  private triggerPrimaryAction() {
    if (!this.activeTarget) return;

    if (this.activeTarget.kind === 'station') {
      if (this.activeTarget.station.primaryAction) {
        // Dispatch declarative primary in-world action without interrupting walking
        InteractionDispatcher.dispatch(this.activeTarget.station.primaryAction.intent, {
          stateManager: this.stateManager,
          transitionToRoom: (roomId, spawn) => this.transitionToRoom(roomId, spawn),
        });
        return;
      }
      // If station does not define a custom primaryAction, fall back to inspect intent
      this.triggerActiveInteraction();
      return;
    }

    if (this.activeTarget.kind === 'door') {
      this.triggerActiveInteraction();
    }
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
    this.hudManager.clear();
    HearthAudio.getInstance().setRoom(roomId);
    this.lastTransitionTime = Date.now();
  }

  private update(dtSeconds: number, nowMs: number) {
    this.lastDtSeconds = dtSeconds;

    // If modal dialog is open, pause player walking updates
    if (!this.overlay.isOpen()) {
      const { changed } = this.player.update(dtSeconds);

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

      // Synchronize live player position to in-memory state every single frame
      this.stateManager.syncPlayerPosition(this.player.x, this.player.y, this.player.facing);

      if (changed) {
        if (nowMs - this.lastSaveTime > 2000) {
          this.stateManager.persist();
          this.lastSaveTime = nowMs;
        }
      }

      this.companion.update(dtSeconds);
      if (this.currentRoom.onUpdate) {
        this.currentRoom.onUpdate(dtSeconds, { x: this.player.x, y: this.player.y });
      }
    }
  }

  private render(nowMs: number) {
    const state = this.stateManager.getState();

    // 1. Derive and update HUD presentation with zero layout queries
    const hudState = this.hudManager.derive(
      this.activeTarget,
      state.companion,
      Boolean(this.currentRoom.hasCompanion),
      this.overlay.isOpen(),
      Date.now()
    );
    this.hudManager.update(hudState);

    // 2. Render room, entities, and player with typed RenderPlayer and frame-rate normalized dtSeconds
    this.renderer.render(
      state,
      this.player.getRenderPlayer(),
      nowMs,
      this.currentRoom,
      this.lastDtSeconds
    );
  }
}

// Bootstrap once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new MindPalaceApp();
});
