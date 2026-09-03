import { Direction, InteractiveZone } from '../core/types';
import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, INTERACTIVE_ZONES } from '../core/constants';

interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

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
  private pendingInteraction: { zone: InteractiveZone; onArrival: (zone: InteractiveZone) => void } | null = null;

  // Solid obstacles (in pixels)
  private obstacles: BoundingBox[] = [
    // North Wall & Top trim
    { x: 0, y: 0, w: CANVAS_WIDTH, h: 2 * TILE_SIZE },
    // South Wall (except door threshold in center)
    { x: 0, y: 14 * TILE_SIZE, w: 9 * TILE_SIZE, h: TILE_SIZE },
    { x: 11 * TILE_SIZE, y: 14 * TILE_SIZE, w: 9 * TILE_SIZE, h: TILE_SIZE },
    // West Wall
    { x: 0, y: 0, w: TILE_SIZE, h: CANVAS_HEIGHT },
    // East Wall
    { x: 19 * TILE_SIZE, y: 0, w: TILE_SIZE, h: CANVAS_HEIGHT },
    // Library Bookshelf
    { x: 2 * TILE_SIZE, y: 1.2 * TILE_SIZE, w: 4 * TILE_SIZE, h: 2.2 * TILE_SIZE },
    // Fireplace Mantle
    { x: 8.5 * TILE_SIZE, y: 1.2 * TILE_SIZE, w: 2.5 * TILE_SIZE, h: 2 * TILE_SIZE },
    // Fossil Cabinet
    { x: 14 * TILE_SIZE, y: 1.2 * TILE_SIZE, w: 4 * TILE_SIZE, h: 2.2 * TILE_SIZE },
    // Display Pedestal
    { x: 15 * TILE_SIZE, y: 5 * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE },
    // Science Workshop Desk
    { x: 13 * TILE_SIZE, y: 9.5 * TILE_SIZE, w: 5.5 * TILE_SIZE, h: 3.5 * TILE_SIZE },
    // Reading Nook Chair & Table
    { x: 3.5 * TILE_SIZE, y: 5.5 * TILE_SIZE, w: 1.8 * TILE_SIZE, h: 1.8 * TILE_SIZE },
  ];

  constructor(startX: number, startY: number, startFacing: Direction = 'up') {
    this.x = startX;
    this.y = startY;
    this.facing = startFacing;
    this.setupListeners();
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
      const moveKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'w', 's', 'a', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
      if (moveKeys.includes(e.code) || (e.key && moveKeys.includes(e.key.toLowerCase()))) {
        this.targetPos = null; // Keyboard cancels click-to-move
        this.pendingInteraction = null;
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

  public setTargetPosition(worldX: number, worldY: number) {
    this.pendingInteraction = null;
    this.targetPos = {
      x: Math.max(TILE_SIZE + 10, Math.min(CANVAS_WIDTH - TILE_SIZE - 20, worldX)),
      y: Math.max(2 * TILE_SIZE + 10, Math.min(CANVAS_HEIGHT - TILE_SIZE - 20, worldY)),
    };
  }

  public walkToAndInteract(
    destX: number,
    destY: number,
    zone: InteractiveZone,
    onArrival: (zone: InteractiveZone) => void
  ) {
    this.targetPos = { x: destX, y: destY };
    this.pendingInteraction = { zone, onArrival };
  }

  public update(dt: number): { changed: boolean; activeZone: InteractiveZone | null } {
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
        if (this.pendingInteraction) {
          const pi = this.pendingInteraction;
          this.pendingInteraction = null;
          pi.onArrival(pi.zone);
        }
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

      // If clicked into an obstacle and cannot move further, complete or cancel
      if (this.targetPos && !movedX && !movedY) {
        // We're stuck against an obstacle
        if (this.pendingInteraction) {
          const activeZone = this.detectActiveZone();
          if (activeZone && activeZone.id === this.pendingInteraction.zone.id) {
            const pi = this.pendingInteraction;
            this.pendingInteraction = null;
            this.targetPos = null;
            pi.onArrival(pi.zone);
          } else {
            this.targetPos = null;
            this.pendingInteraction = null;
          }
        } else {
          this.targetPos = null;
        }
      }
    }

    const activeZone = this.detectActiveZone();

    // If we're walking toward an interaction and we enter its zone, trigger arrival early!
    if (this.pendingInteraction && activeZone && activeZone.id === this.pendingInteraction.zone.id) {
      const pi = this.pendingInteraction;
      this.pendingInteraction = null;
      this.targetPos = null;
      this.isMoving = false;
      pi.onArrival(pi.zone);
    }

    return {
      changed: this.isMoving || wasMoving,
      activeZone,
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

    // Check world bounds
    if (pBox.x < TILE_SIZE || pBox.x + pBox.w > CANVAS_WIDTH - TILE_SIZE) return true;
    if (pBox.y < 2 * TILE_SIZE || pBox.y + pBox.h > CANVAS_HEIGHT - TILE_SIZE / 2) return true;

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

  public detectActiveZone(): InteractiveZone | null {
    const px = this.x + 12;
    const py = this.y + 20;

    for (const zone of INTERACTIVE_ZONES) {
      // Generous proximity detection around interactive stations
      const expandedX = zone.x - 24;
      const expandedY = zone.y - 18;
      const expandedW = zone.width + 48;
      const expandedH = zone.height + 40;

      if (
        px >= expandedX &&
        px <= expandedX + expandedW &&
        py >= expandedY &&
        py <= expandedY + expandedH
      ) {
        return zone;
      }
    }

    return null;
  }
}
