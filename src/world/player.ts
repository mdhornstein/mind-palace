import { Direction, InteractiveZone, BoundingBox, RoomConfig } from '../core/types';
import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../core/constants';

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
    if (!this.currentRoom) return;
    const room = this.currentRoom;
    const rW = room.widthTiles * TILE_SIZE;
    const rH = room.heightTiles * TILE_SIZE;

    // Outer Room Bounds & Architectural Perimeter
    this.obstacles = [
      // North Wall
      { x: 0, y: 0, w: rW, h: 2 * TILE_SIZE },
      // South Wall (leaving doorway gap at center)
      { x: 0, y: (room.heightTiles - 1) * TILE_SIZE, w: 9 * TILE_SIZE, h: TILE_SIZE },
      { x: 11 * TILE_SIZE, y: (room.heightTiles - 1) * TILE_SIZE, w: 9 * TILE_SIZE, h: TILE_SIZE },
      // West Wall
      { x: 0, y: 0, w: TILE_SIZE, h: rH },
      // East Wall
      { x: (room.widthTiles - 1) * TILE_SIZE, y: 0, w: TILE_SIZE, h: rH },
      // Fireplace Mantle (north center)
      { x: 8.5 * TILE_SIZE, y: 1.2 * TILE_SIZE, w: 2.5 * TILE_SIZE, h: 2 * TILE_SIZE },
    ];

    // Collect solid collision boxes dynamically from all stations in this room!
    for (const station of room.stations) {
      if (station.collisionBox) {
        this.obstacles.push(station.collisionBox);
      }
    }

    // Collect solid collision boxes from decorative props
    if (room.decorativeProps) {
      for (const prop of room.decorativeProps) {
        if (prop.collisionBox) {
          this.obstacles.push(prop.collisionBox);
        }
      }
    }
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

  public teleportTo(x: number, y: number, facing?: Direction) {
    this.x = x;
    this.y = y;
    this.targetPos = null;
    this.pendingInteraction = null;
    this.isMoving = false;
    if (facing) {
      this.facing = facing;
    }
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
    if (!this.currentRoom) return null;
    const px = this.x + 12;
    const py = this.y + 20;

    // Check all interactive stations in the active room
    for (const station of this.currentRoom.stations) {
      const sx = station.tileX * TILE_SIZE;
      const sy = station.tileY * TILE_SIZE;
      const sw = station.tileWidth * TILE_SIZE;
      const sh = station.tileHeight * TILE_SIZE;

      // Generous proximity detection around interactive stations
      const expandedX = sx - 24;
      const expandedY = sy - 18;
      const expandedW = sw + 48;
      const expandedH = sh + 40;

      if (
        px >= expandedX &&
        px <= expandedX + expandedW &&
        py >= expandedY &&
        py <= expandedY + expandedH
      ) {
        return {
          id: station.id,
          name: station.name,
          prompt: station.prompt,
          x: sx,
          y: sy,
          width: sw,
          height: sh,
        };
      }
    }

    // Check doorways for room transitions
    for (const door of this.currentRoom.doors) {
      const dx = door.tileX * TILE_SIZE;
      const dy = door.tileY * TILE_SIZE;
      const dw = door.tileWidth * TILE_SIZE;
      const dh = door.tileHeight * TILE_SIZE;

      if (
        px >= dx - 20 && px <= dx + dw + 20 &&
        py >= dy - 16 && py <= dy + dh + 16
      ) {
        return {
          id: `door_${door.id}`,
          name: door.name,
          prompt: door.prompt,
          x: dx,
          y: dy,
          width: dw,
          height: dh,
        };
      }
    }

    return null;
  }
}
