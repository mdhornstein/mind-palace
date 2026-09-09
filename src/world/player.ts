import { Direction, BoundingBox, RoomConfig, NavigationStatus } from '../core/types';
import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants';
import { InteractionSystem } from './interactionSystem';

export type { NavigationStatus };

export class PlayerController {
  public x: number;
  public y: number;
  public facing: Direction = 'up';
  public isMoving: boolean = false;
  public walkFrame: number = 0;

  // Speed in pixels per second (brisk and responsive)
  private speed = 210;
  private keys: Record<string, boolean> = {};
  private targetPos: { x: number; y: number } | null = null;
  private navigationStatus: NavigationStatus = 'idle';

  // Dynamic Room & Obstacle State
  private currentRoom: RoomConfig | null = null;
  private obstacles: BoundingBox[] = [];

  constructor(startX: number, startY: number, startFacing: Direction = 'up', initialRoom?: RoomConfig) {
    this.x = startX;
    this.y = startY;
    this.facing = startFacing;
    if (initialRoom) {
      this.setRoom(initialRoom);
    }
    this.setupListeners();
  }

  public setRoom(room: RoomConfig) {
    this.currentRoom = room;
    this.rebuildObstacles();
  }

  private rebuildObstacles() {
    if (!this.currentRoom) {
      this.obstacles = [];
      return;
    }
    this.obstacles = InteractionSystem.getRoomObstacles(this.currentRoom);
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      // Don't capture keys if user is typing in a modal textarea/input
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }
      this.keys[e.code] = true;
      if (e.key) {
        this.keys[e.key.toLowerCase()] = true;
      }
      const moveKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'KeyW', 'KeyS', 'KeyA', 'KeyD',
        'w', 's', 'a', 'd',
        'arrowup', 'arrowdown', 'arrowleft', 'arrowright'
      ];
      if (moveKeys.includes(e.code) || (e.key && moveKeys.includes(e.key.toLowerCase()))) {
        this.targetPos = null; // Keyboard cancels click-to-move
        this.navigationStatus = 'idle';
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.key) {
        this.keys[e.key.toLowerCase()] = false;
      }
    });

    window.addEventListener('blur', () => {
      this.keys = {};
    });
  }

  public teleportTo(x: number, y: number, facing?: Direction) {
    this.x = x;
    this.y = y;
    this.targetPos = null;
    this.navigationStatus = 'idle';
    this.isMoving = false;
    if (facing) {
      this.facing = facing;
    }
  }

  public setTargetPosition(worldX: number, worldY: number) {
    const bounds = this.currentRoom
      ? InteractionSystem.getRoomPixelBounds(this.currentRoom)
      : { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

    this.navigationStatus = 'navigating';
    this.targetPos = {
      x: Math.max(TILE_SIZE + 10, Math.min(bounds.width - TILE_SIZE - 20, worldX)),
      y: Math.max(2 * TILE_SIZE + 10, Math.min(bounds.height - TILE_SIZE - 20, worldY)),
    };
  }

  public clearTarget(): void {
    this.targetPos = null;
    this.navigationStatus = 'idle';
  }

  public stop(): void {
    this.targetPos = null;
    this.navigationStatus = 'idle';
    this.isMoving = false;
  }

  public getNavigationStatus(): NavigationStatus {
    return this.navigationStatus;
  }

  public hasReachedTarget(): boolean {
    return this.navigationStatus === 'arrived';
  }

  public isNavigating(): boolean {
    return this.navigationStatus === 'navigating';
  }

  public isAtTarget(): boolean {
    return this.navigationStatus === 'arrived' || this.targetPos === null;
  }

  public update(dt: number): { changed: boolean } {
    let dx = 0;
    let dy = 0;

    // 1. Keyboard Input (supports both code and key)
    if (this.keys['KeyW'] || this.keys['ArrowUp'] || this.keys['w'] || this.keys['arrowup']) {
      dy -= 1;
      this.facing = 'up';
    }
    if (this.keys['KeyS'] || this.keys['ArrowDown'] || this.keys['s'] || this.keys['arrowdown']) {
      dy += 1;
      this.facing = 'down';
    }
    if (this.keys['KeyA'] || this.keys['ArrowLeft'] || this.keys['a'] || this.keys['arrowleft']) {
      dx -= 1;
      this.facing = 'left';
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight'] || this.keys['d'] || this.keys['arrowright']) {
      dx += 1;
      this.facing = 'right';
    }

    // 2. Click-to-move navigation
    if (this.targetPos && dx === 0 && dy === 0) {
      const distX = this.targetPos.x - this.x;
      const distY = this.targetPos.y - this.y;
      const distance = Math.hypot(distX, distY);

      if (distance > 6) {
        dx = distX / distance;
        dy = distY / distance;

        // Determine dominant facing
        if (Math.abs(dx) > Math.abs(dy)) {
          this.facing = dx > 0 ? 'right' : 'left';
        } else {
          this.facing = dy > 0 ? 'down' : 'up';
        }
      } else {
        // Arrived at target
        this.targetPos = null;
        this.navigationStatus = 'arrived';
      }
    }

    // Normalize diagonal movement vector
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    const wasMoving = this.isMoving;
    this.isMoving = dx !== 0 || dy !== 0;

    if (this.isMoving) {
      this.walkFrame += dt * 10;
      const moveDist = this.speed * dt;
      const nextX = this.x + dx * moveDist;
      const nextY = this.y + dy * moveDist;

      let movedX = false;
      let movedY = false;

      // Try X axis
      if (!this.checkCollision(nextX, this.y)) {
        this.x = nextX;
        movedX = true;
      }
      // Try Y axis
      if (!this.checkCollision(this.x, nextY)) {
        this.y = nextY;
        movedY = true;
      }

      // If clicked into an obstacle and cannot move further, mark navigation as blocked
      if (this.targetPos && !movedX && !movedY) {
        this.targetPos = null;
        this.navigationStatus = 'blocked';
      }
    }

    return {
      changed: this.isMoving || wasMoving,
    };
  }

  private checkCollision(x: number, y: number): boolean {
    // Player collision bounding box (feet area)
    const pBox: BoundingBox = {
      x: x + 4,
      y: y + 20,
      w: 16,
      h: 10,
    };

    const inDoorway = this.currentRoom
      ? InteractionSystem.intersectsDoorwayThreshold(this.currentRoom, pBox)
      : false;

    if (!inDoorway) {
      const bounds = this.currentRoom
        ? InteractionSystem.getRoomPixelBounds(this.currentRoom)
        : { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };

      if (pBox.x < TILE_SIZE || pBox.x + pBox.w > bounds.width - TILE_SIZE) return true;
      if (pBox.y < 2 * TILE_SIZE || pBox.y + pBox.h > bounds.height - TILE_SIZE / 2) return true;
    }

    // Check obstacle bounding boxes
    for (const obs of this.obstacles) {
      if (
        pBox.x < obs.x + obs.w &&
        pBox.x + pBox.w > obs.x &&
        pBox.y < obs.y + obs.h &&
        pBox.y + pBox.h > obs.y
      ) {
        return true;
      }
    }

    return false;
  }
}
