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

  private speed = 2.2;
  private keys: Record<string, boolean> = {};
  private targetPos: { x: number; y: number } | null = null;

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
    { x: 2 * TILE_SIZE, y: 1.5 * TILE_SIZE, w: 4 * TILE_SIZE, h: 2 * TILE_SIZE },
    // Fireplace Mantle
    { x: 8.5 * TILE_SIZE, y: 1.5 * TILE_SIZE, w: 2.5 * TILE_SIZE, h: 2 * TILE_SIZE },
    // Fossil Cabinet
    { x: 14 * TILE_SIZE, y: 1.5 * TILE_SIZE, w: 4 * TILE_SIZE, h: 2 * TILE_SIZE },
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
      // Also track WASD and arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        this.targetPos = null; // Keyboard cancels click-to-move
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  public setTargetPosition(worldX: number, worldY: number) {
    this.targetPos = {
      x: Math.max(TILE_SIZE + 10, Math.min(CANVAS_WIDTH - TILE_SIZE - 20, worldX)),
      y: Math.max(2 * TILE_SIZE + 10, Math.min(CANVAS_HEIGHT - TILE_SIZE - 20, worldY)),
    };
  }

  public update(): { changed: boolean; activeZone: InteractiveZone | null } {
    let dx = 0;
    let dy = 0;

    // 1. Keyboard Input
    if (this.keys['KeyW'] || this.keys['ArrowUp']) {
      dy -= 1;
      this.facing = 'up';
    }
    if (this.keys['KeyS'] || this.keys['ArrowDown']) {
      dy += 1;
      this.facing = 'down';
    }
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      dx -= 1;
      this.facing = 'left';
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      dx += 1;
      this.facing = 'right';
    }

    // 2. Click-to-move navigation
    if (this.targetPos && dx === 0 && dy === 0) {
      const distSq = (this.targetPos.x - this.x) ** 2 + (this.targetPos.y - this.y) ** 2;
      if (distSq > 16) {
        const angle = Math.atan2(this.targetPos.y - this.y, this.targetPos.x - this.x);
        dx = Math.cos(angle);
        dy = Math.sin(angle);

        // Determine dominant facing
        if (Math.abs(dx) > Math.abs(dy)) {
          this.facing = dx > 0 ? 'right' : 'left';
        } else {
          this.facing = dy > 0 ? 'down' : 'up';
        }
      } else {
        this.targetPos = null;
      }
    }

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    const wasMoving = this.isMoving;
    this.isMoving = dx !== 0 || dy !== 0;

    if (this.isMoving) {
      this.walkFrame += 1;
      const nextX = this.x + dx * this.speed;
      const nextY = this.y + dy * this.speed;

      // Check collision on X axis
      if (!this.checkCollision(nextX, this.y)) {
        this.x = nextX;
      }
      // Check collision on Y axis
      if (!this.checkCollision(this.x, nextY)) {
        this.y = nextY;
      }
    }

    const activeZone = this.detectActiveZone();
    return {
      changed: this.isMoving || wasMoving,
      activeZone,
    };
  }

  private checkCollision(x: number, y: number): boolean {
    // Player collision bounding box (feet area)
    const pBox: BoundingBox = {
      x: x + 2,
      y: y + 16,
      w: 12,
      h: 10,
    };

    // Check bounds
    if (pBox.x < TILE_SIZE || pBox.x + pBox.w > CANVAS_WIDTH - TILE_SIZE) return true;
    if (pBox.y < 2 * TILE_SIZE || pBox.y + pBox.h > CANVAS_HEIGHT - TILE_SIZE / 2) return true;

    // Check obstacles
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
    const px = this.x + 8;
    const py = this.y + 16;

    for (const zone of INTERACTIVE_ZONES) {
      // Expanded detection radius around interactive objects
      const expandedX = zone.x - 18;
      const expandedY = zone.y - 12;
      const expandedW = zone.width + 36;
      const expandedH = zone.height + 28;

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
