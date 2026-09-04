import { WorldState, Direction, CompanionActivity } from '../core/types';
import { TILE_SIZE } from '../core/constants';
import { StateManager } from '../core/state';

export class CompanionController {
  private stateManager: StateManager;
  private walkSpeed = 1.0;
  private isMoving = false;
  private targetX: number | null = null;
  private targetY: number | null = null;
  private lastActivityShift = Date.now();

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  public update(_timeMs?: number) {
    const state = this.stateManager.getState();
    // The scholar companion resides in the Study
    if (state.currentRoomId !== 'study') {
      return;
    }

    const companion = state.companion;
    const player = state.player;

    const distToPlayer = Math.hypot(companion.x - player.x, companion.y - player.y);

    // 1. Handling Pending Important Remarks (Presence Level 3 Approach or Level 2 Invitation)
    if (companion.pendingRemark) {
      if (companion.pendingRemark.presenceLevel === 3) {
        // Approach player when simulation finishes!
        if (distToPlayer > 2.5 * TILE_SIZE && !this.isMoving) {
          // Walk toward player's general vicinity
          const approachX = player.x + (player.x > companion.x ? -TILE_SIZE * 1.5 : TILE_SIZE * 1.5);
          const approachY = player.y;
          this.setTarget(approachX, approachY);
        } else if (distToPlayer <= 3 * TILE_SIZE) {
          // Deliver approach remark
          this.speak(companion.pendingRemark.text, 7000);
          this.stateManager.updateCompanion((c) => {
            c.pendingRemark = null;
            c.presenceLevel = 3;
            c.activity = 'observing_player';
          });
        }
      } else if (companion.pendingRemark.presenceLevel === 2) {
        // Invitation level: waits until player walks near the cabinet/pedestal area
        if (distToPlayer <= 3 * TILE_SIZE) {
          this.speak(companion.pendingRemark.text, 6000);
          this.stateManager.updateCompanion((c) => {
            c.pendingRemark = null;
            c.presenceLevel = 2;
          });
        }
      }
    }

    // 2. Proximity Recognition (Presence Level 1: "Oh, hey.")
    if (distToPlayer <= 2.2 * TILE_SIZE) {
      // Look toward player
      this.lookAt(player.x, player.y);

      // If we haven't greeted recently and no pending remark is active
      const now = Date.now();
      if (now - companion.lastNoticedPlayerAt > 120000 && !companion.speech) {
        this.speak("Oh, hey.", 3500);
        this.stateManager.updateCompanion((c) => {
          c.lastNoticedPlayerAt = now;
          c.presenceLevel = 1;
        });
      }
    }

    // Auto-correct if trapped inside workstation bounding box from old save states
    if (
      companion.x >= 10.0 * TILE_SIZE &&
      companion.x <= 18.5 * TILE_SIZE &&
      companion.y >= 8.5 * TILE_SIZE &&
      companion.y <= 11.2 * TILE_SIZE
    ) {
      this.stateManager.updateCompanion((c) => {
        c.x = 14.8 * TILE_SIZE;
        c.y = 12.2 * TILE_SIZE;
        c.facing = 'up';
        c.activity = 'writing';
      });
    }

    // 3. Autonomous Idle Shifts (every ~45-90 seconds, changes subtle behavior if stationary)
    const now = Date.now();
    if (!this.isMoving && !companion.pendingRemark && now - this.lastActivityShift > 50000) {
      this.lastActivityShift = now;
      this.wanderToRoutineSpot();
    }

    // 4. Movement execution if walking
    if (this.isMoving && this.targetX !== null && this.targetY !== null) {
      const dx = this.targetX - companion.x;
      const dy = this.targetY - companion.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 4) {
        const stepX = (dx / dist) * this.walkSpeed;
        const stepY = (dy / dist) * this.walkSpeed;
        this.lookAt(this.targetX, this.targetY);

        this.stateManager.updateCompanion((c) => {
          c.x += stepX;
          c.y += stepY;
        });
      } else {
        this.isMoving = false;
        this.targetX = null;
        this.targetY = null;
      }
    }
  }

  private lookAt(targetX: number, targetY: number) {
    const companion = this.stateManager.getState().companion;
    const dx = targetX - companion.x;
    const dy = targetY - companion.y;
    let facing: Direction = 'down';

    if (Math.abs(dx) > Math.abs(dy)) {
      facing = dx > 0 ? 'right' : 'left';
    } else {
      facing = dy > 0 ? 'down' : 'up';
    }

    if (companion.facing !== facing) {
      this.stateManager.updateCompanion((c) => {
        c.facing = facing;
      });
    }
  }

  public speak(text: string, durationMs = 4500) {
    this.stateManager.updateCompanion((c) => {
      c.speech = {
        text,
        timestamp: Date.now(),
        durationMs,
      };
    });
  }

  private setTarget(x: number, y: number) {
    this.targetX = x;
    this.targetY = y;
    this.isMoving = true;
  }

  private wanderToRoutineSpot() {
    const spots: Array<{
      x: number;
      y: number;
      facing: Direction;
      location: WorldState['companion']['location'];
      activity: CompanionActivity;
    }> = [
      {
        x: 6.5 * TILE_SIZE,
        y: 4.5 * TILE_SIZE,
        facing: 'left',
        location: 'reading_nook',
        activity: 'reading',
      },
      {
        x: 14.5 * TILE_SIZE,
        y: 4 * TILE_SIZE,
        facing: 'up',
        location: 'cabinet',
        activity: 'examining_fossil',
      },
      {
        x: 10 * TILE_SIZE,
        y: 3.5 * TILE_SIZE,
        facing: 'up',
        location: 'fireplace',
        activity: 'contemplating',
      },
      {
        x: 14.8 * TILE_SIZE,
        y: 12.2 * TILE_SIZE,
        facing: 'up',
        location: 'desk',
        activity: 'writing',
      },
      {
        x: 9.8 * TILE_SIZE,
        y: 11.8 * TILE_SIZE,
        facing: 'right',
        location: 'desk',
        activity: 'contemplating',
      },
    ];

    const pick = spots[Math.floor(Math.random() * spots.length)];
    this.setTarget(pick.x, pick.y);
    this.stateManager.updateCompanion((c) => {
      c.location = pick.location;
      c.activity = pick.activity;
    });
  }
}
