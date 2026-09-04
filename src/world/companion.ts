import { Direction } from '../core/types';
import { TILE_SIZE } from '../core/constants';
import { StateManager } from '../core/state';

/**
 * Calm, dignified scholar companion controller.
 * Inhabits the Study sanctuary peacefully without erratic wandering or obstacle jitter.
 * Responds to player proximity, turns to face the player, and shares observations.
 */
export class CompanionController {
  private stateManager: StateManager;
  private defaultFacing: Direction = 'left';

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  public update(_timeMs?: number) {
    const state = this.stateManager.getState();
    if (state.currentRoomId !== 'study') {
      return;
    }

    const companion = state.companion;
    const player = state.player;

    // Ensure companion is peacefully at the reading nook (unless examining fossil at cabinet)
    if (companion.location !== 'cabinet') {
      if (companion.x !== 6.5 * TILE_SIZE || companion.y !== 4.5 * TILE_SIZE) {
        this.stateManager.updateCompanion((c) => {
          c.x = 6.5 * TILE_SIZE;
          c.y = 4.5 * TILE_SIZE;
          c.facing = 'left';
          c.location = 'reading_nook';
          c.activity = 'reading';
        });
        return;
      }
    }

    const distToPlayer = Math.hypot(companion.x - player.x, companion.y - player.y);

    // 1. Handling Pending Important Remarks (Simulation completion or special events)
    if (companion.pendingRemark) {
      this.speak(companion.pendingRemark.text, 6500);
      this.stateManager.updateCompanion((c) => {
        c.pendingRemark = null;
        c.presenceLevel = 3;
      });
    }

    // 2. Proximity Recognition & Interaction
    if (distToPlayer <= 2.8 * TILE_SIZE) {
      // Gracefully turn to face the player
      this.lookAt(player.x, player.y);

      // Greet player if not greeted recently
      const now = Date.now();
      if (now - companion.lastNoticedPlayerAt > 90000 && !companion.speech) {
        this.speak("Oh, hey.", 3500);
        this.stateManager.updateCompanion((c) => {
          c.lastNoticedPlayerAt = now;
          c.presenceLevel = 1;
        });
      }
    } else {
      // Return to comfortable reading / writing posture when player walks away
      if (companion.facing !== this.defaultFacing && !companion.speech) {
        this.stateManager.updateCompanion((c) => {
          c.facing = this.defaultFacing;
        });
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
}
