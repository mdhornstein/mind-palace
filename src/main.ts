import './ui/styles.css';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from './core/constants';
import { StateManager } from './core/state';
import { PlayerController } from './world/player';
import { CompanionController } from './world/companion';
import { RoomRenderer } from './render/roomRenderer';
import { ModalOverlay } from './ui/overlay';
import { DevTray } from './ui/devTray';
import { InteractiveZone, RoomConfig, WorldStation, Direction, Doorway } from './core/types';
import { RoomRegistry } from './rooms/registry';
import { HearthAudio } from './sound/audio';
import { duckephantEntity } from './rooms/study/stations/duckephant';

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
  private activeZone: InteractiveZone | null = null;
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

  private getClickedStation(clickX: number, clickY: number): WorldStation | null {
    for (const station of this.currentRoom.stations) {
      const sx = station.tileX * TILE_SIZE;
      const sy = station.tileY * TILE_SIZE;
      const sw = station.tileWidth * TILE_SIZE;
      const sh = station.tileHeight * TILE_SIZE;

      // Generous clickable boundary for furniture
      const expandedX = sx - 10;
      const expandedY = sy - 10;
      const expandedW = sw + 20;
      const expandedH = sh + 25;

      if (
        clickX >= expandedX &&
        clickX <= expandedX + expandedW &&
        clickY >= expandedY &&
        clickY <= expandedY + expandedH
      ) {
        return station;
      }
    }
    return null;
  }

  private getClickedDoor(clickX: number, clickY: number): Doorway | null {
    for (const door of this.currentRoom.doors) {
      const dx = door.tileX * TILE_SIZE;
      const dy = door.tileY * TILE_SIZE;
      const dw = door.tileWidth * TILE_SIZE;
      const dh = door.tileHeight * TILE_SIZE;

      if (
        clickX >= dx - 10 &&
        clickX <= dx + dw + 10 &&
        clickY >= dy - 10 &&
        clickY <= dy + dh + 18
      ) {
        return door;
      }
    }
    return null;
  }

  private setupInteractions() {
    // Keyboard inspection trigger (Space, Enter, E)
    window.addEventListener('keydown', (e) => {
      if (this.overlay.isOpen()) return;
      const isInteractKey =
        ['Space', 'Enter', 'KeyE'].includes(e.code) ||
        [' ', 'Spacebar', 'Enter', 'e', 'E'].includes(e.key);
      if (isInteractKey && this.activeZone) {
        e.preventDefault();
        this.triggerInteraction(this.activeZone.id);
      }
    });

    // Clicking the prompt pill directly triggers the interaction
    this.promptEl.addEventListener('click', () => {
      if (this.overlay.isOpen()) return;
      if (this.activeZone) {
        this.triggerInteraction(this.activeZone.id);
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

      const hoveredStation = this.getClickedStation(mouseX, mouseY);
      const hoveredDoor = this.getClickedDoor(mouseX, mouseY);
      this.canvas.style.cursor = (hoveredStation || hoveredDoor) ? 'pointer' : 'default';
    });

    // Canvas click to move or click to interact
    this.canvas.addEventListener('click', (e) => {
      if (this.overlay.isOpen()) return;

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;

      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // 1. Check if doorway was clicked directly
      const clickedDoor = this.getClickedDoor(clickX, clickY);
      if (clickedDoor) {
        this.transitionToRoom(clickedDoor.targetRoomId, clickedDoor.targetSpawnPoint);
        return;
      }

      // 2. Check if an interactive station was clicked
      const clickedStation = this.getClickedStation(clickX, clickY);

      if (clickedStation) {
        // Instantly face and trigger the interaction at the station's approach spot!
        this.player.teleportTo(clickedStation.approachPoint.x, clickedStation.approachPoint.y);
        this.stateManager.syncPlayerPosition(this.player.x, this.player.y, this.player.facing);
        clickedStation.onInteract(this.stateManager, this.overlay);
        return;
      }

      // 3. Click on open floor: walk smoothly to location
      this.player.setTargetPosition(clickX, clickY);
    });
  }

  private triggerInteraction(zoneId: string) {
    // 1. Check if it matches an interactive station in the current room
    const station = this.currentRoom.stations.find((s) => s.id === zoneId);
    if (station) {
      station.onInteract(this.stateManager, this.overlay);
      return;
    }

    // 2. Check if it matches a doorway transition
    if (zoneId.startsWith('door_')) {
      const doorId = zoneId.replace('door_', '');
      const door = this.currentRoom.doors.find((d) => d.id === doorId);
      if (door) {
        this.transitionToRoom(door.targetRoomId, door.targetSpawnPoint);
      }
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
    this.activeZone = null;
    this.updatePromptUI();
    this.updateSpeechUI(this.stateManager.getState());
    HearthAudio.getInstance().setRoom(roomId);
    this.lastTransitionTime = Date.now();
  }

  private updatePromptUI() {
    if (this.overlay.isOpen() || !this.activeZone) {
      this.promptEl.className = '';
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const scale = rect.width / CANVAS_WIDTH;
    const zoneCenterX = this.activeZone.x + this.activeZone.width / 2;
    // Anchor prompt dynamically above the zone
    let targetCanvasY = this.activeZone.y - 12;
    if (targetCanvasY < 40) {
      targetCanvasY = this.activeZone.y + this.activeZone.height + 22;
    }

    const screenX = rect.left + zoneCenterX * scale;
    const screenY = rect.top + targetCanvasY * scale;

    this.promptEl.style.left = `${screenX}px`;
    this.promptEl.style.top = `${screenY}px`;

    const isPortal = this.activeZone.id.startsWith('door_');
    this.promptEl.className = isPortal ? 'visible portal-prompt' : 'visible';
    this.promptEl.innerHTML = `
      <div class="prompt-keys">
        <kbd>Space</kbd>
        <kbd>Click</kbd>
      </div>
      <span class="prompt-name">${this.activeZone.name}</span>
      <span class="prompt-action">${this.activeZone.prompt}</span>
    `;
  }

  private updateSpeechUI(state: ReturnType<StateManager['getState']>) {
    if (this.currentRoom.id === 'study' && state.companion.speech) {
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
        const { changed, activeZone } = this.player.update(dt);
        this.activeZone = activeZone;

        // Check seamless automatic doorway walking threshold (cooldown prevents instant bounceback)
        if (
          this.activeZone &&
          this.activeZone.id.startsWith('door_') &&
          Date.now() - this.lastTransitionTime > 1000
        ) {
          // In Observatory walking up onto the North terrace threshold
          if (this.currentRoom.id === 'observatory' && this.player.y <= 4.0 * TILE_SIZE) {
            this.triggerInteraction(this.activeZone.id);
          }
          // In Study walking down into the South doorway threshold
          else if (this.currentRoom.id === 'study' && this.player.y >= 13.0 * TILE_SIZE) {
            this.triggerInteraction(this.activeZone.id);
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
        if (this.currentRoom.id === 'study') {
          duckephantEntity.update(dt * 1000, this.player.x, this.player.y);
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
        this.activeZone,
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
