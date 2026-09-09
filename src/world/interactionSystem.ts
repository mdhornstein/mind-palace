import { RoomConfig, InteractiveTarget, BoundingBox, Doorway, NavigationStatus } from '../core/types';
import { TILE_SIZE } from '../core/constants';

/**
 * Unified Interaction System.
 * Authoritative source of truth for:
 * - Pointer click & hover hit-testing over interactive targets
 * - Player foot proximity detection
 * - Approach/interaction destination coordinates
 * - Doorway threshold overlap for wall penetration
 * - Obstacle inventory aggregation
 * - Authoritative room pixel bounds
 */
export class InteractionSystem {
  /**
   * Hit-tests whether a given (x, y) canvas coordinate points to a station or door in the room.
   */
  public static findInteractiveAt(
    room: RoomConfig,
    clickX: number,
    clickY: number
  ): InteractiveTarget | null {
    // 1. Check doorways first
    for (const door of room.doors) {
      const dx = door.tileX * TILE_SIZE;
      const dy = door.tileY * TILE_SIZE;
      const dw = door.tileWidth * TILE_SIZE;
      const dh = door.tileHeight * TILE_SIZE;

      // Generous clickable boundary for doorways
      if (
        clickX >= dx - 10 &&
        clickX <= dx + dw + 10 &&
        clickY >= dy - 10 &&
        clickY <= dy + dh + 18
      ) {
        return { kind: 'door', door };
      }
    }

    // 2. Check interactive stations
    for (const station of room.stations) {
      const sx = station.tileX * TILE_SIZE;
      const sy = station.tileY * TILE_SIZE;
      const sw = station.tileWidth * TILE_SIZE;
      const sh = station.tileHeight * TILE_SIZE;

      // Generous clickable boundary for stations
      if (
        clickX >= sx - 10 &&
        clickX <= sx + sw + 10 &&
        clickY >= sy - 10 &&
        clickY <= sy + sh + 25
      ) {
        return { kind: 'station', station };
      }
    }

    return null;
  }

  /**
   * Detects if the player is within interaction proximity of a station or door.
   * Player foot center is at (playerX + 12, playerY + 20).
   */
  public static findNearbyInteractive(
    room: RoomConfig,
    playerX: number,
    playerY: number
  ): InteractiveTarget | null {
    const px = playerX + 12;
    const py = playerY + 20;

    // Check stations
    for (const station of room.stations) {
      const sx = station.tileX * TILE_SIZE;
      const sy = station.tileY * TILE_SIZE;
      const sw = station.tileWidth * TILE_SIZE;
      const sh = station.tileHeight * TILE_SIZE;

      // Proximity detection around station perimeter:
      // 28px left/right, 24px top, 36px bottom (accounting for foot positioning)
      const expandedX = sx - 28;
      const expandedY = sy - 24;
      const expandedW = sw + 56;
      const expandedH = sh + 60;

      const inBoundingBox =
        px >= expandedX &&
        px <= expandedX + expandedW &&
        py >= expandedY &&
        py <= expandedY + expandedH;

      // Proximity to designated approach point
      const appDist = Math.hypot(
        px - (station.approachPoint.x + 12),
        py - (station.approachPoint.y + 20)
      );
      const nearApproachPoint = appDist <= 32;

      if (inBoundingBox || nearApproachPoint) {
        return { kind: 'station', station };
      }
    }

    // Check doorways
    for (const door of room.doors) {
      const dx = door.tileX * TILE_SIZE;
      const dy = door.tileY * TILE_SIZE;
      const dw = door.tileWidth * TILE_SIZE;
      const dh = door.tileHeight * TILE_SIZE;

      if (
        px >= dx - 24 &&
        px <= dx + dw + 24 &&
        py >= dy - 20 &&
        py <= dy + dh + 20
      ) {
        return { kind: 'door', door };
      }
    }

    return null;
  }

  /**
   * Resolves the walk destination coordinate for an interactive target.
   * - Stations: returns station.approachPoint
   * - Doors: returns doorway threshold center
   */
  public static getInteractionPoint(target: InteractiveTarget): { x: number; y: number } {
    if (target.kind === 'station') {
      return target.station.approachPoint;
    }
    const door = target.door;
    return {
      x: (door.tileX + door.tileWidth / 2) * TILE_SIZE,
      y: (door.tileY + door.tileHeight / 2) * TILE_SIZE,
    };
  }

  /**
   * Checks whether the player collision box overlaps a doorway threshold,
   * permitting passage through outer room boundaries for transitions.
   */
  public static intersectsDoorwayThreshold(room: RoomConfig, playerBox: BoundingBox): boolean {
    return room.doors.some((door) => {
      const dx = door.tileX * TILE_SIZE;
      const dy = door.tileY * TILE_SIZE;
      const dw = door.tileWidth * TILE_SIZE;
      const dh = door.tileHeight * TILE_SIZE;
      return (
        playerBox.x + playerBox.w >= dx - 12 &&
        playerBox.x <= dx + dw + 12 &&
        playerBox.y + playerBox.h >= dy - 12 &&
        playerBox.y <= dy + dh + 12
      );
    });
  }

  /**
   * Returns all solid obstacles in the room (architectural collisions, station collision boxes,
   * and decorative prop collision boxes). Zero room-id branching.
   */
  public static getRoomObstacles(room: RoomConfig): BoundingBox[] {
    const obstacles: BoundingBox[] = [];

    if (room.architecturalCollisions) {
      for (const box of room.architecturalCollisions) {
        obstacles.push(box);
      }
    }

    for (const station of room.stations) {
      if (station.collisionBox) {
        obstacles.push(station.collisionBox);
      }
    }

    if (room.decorativeProps) {
      for (const prop of room.decorativeProps) {
        if (prop.collisionBox) {
          obstacles.push(prop.collisionBox);
        }
      }
    }

    return obstacles;
  }

  /**
   * Computes the authoritative room pixel boundaries from room tile dimensions.
   */
  public static getRoomPixelBounds(room: RoomConfig): { width: number; height: number } {
    return {
      width: room.widthTiles * TILE_SIZE,
      height: room.heightTiles * TILE_SIZE,
    };
  }

  /**
   * Checks if the player has stepped into an automatic doorway threshold.
   * Player feet area: (playerX + 4, playerY + 20, 16, 10).
   */
  public static findSteppedDoorway(
    room: RoomConfig,
    playerX: number,
    playerY: number
  ): Doorway | null {
    const pBox: BoundingBox = {
      x: playerX + 4,
      y: playerY + 20,
      w: 16,
      h: 10,
    };

    for (const door of room.doors) {
      if (door.transitionMode !== 'auto') {
        continue;
      }

      const dx = door.tileX * TILE_SIZE;
      const dy = door.tileY * TILE_SIZE;
      const dw = door.tileWidth * TILE_SIZE;
      const dh = door.tileHeight * TILE_SIZE;

      // Check if player's foot bounding box has stepped into the doorway portal
      const stepped =
        pBox.x + pBox.w >= dx - 8 &&
        pBox.x <= dx + dw + 8 &&
        pBox.y + pBox.h >= dy - 8 &&
        pBox.y <= dy + dh + 8;

      if (stepped) {
        return door;
      }
    }

    return null;
  }

  /**
   * Pure decision helper for pending station interaction dispatch.
   * Ensures that blocked or cancelled navigation NEVER triggers an interaction.
   * Dispatch occurs ONLY when the player is in foot proximity of the targeted station.
   */
  public static shouldDispatchPendingInteraction(
    pendingTarget: InteractiveTarget | null,
    activeTarget: InteractiveTarget | null,
    navStatus: NavigationStatus
  ): boolean {
    if (!pendingTarget || pendingTarget.kind !== 'station') {
      return false;
    }

    // A blocked path must NEVER be interpreted as arrival
    if (navStatus === 'blocked') {
      return false;
    }

    // Authoritative interaction condition: player has reached proximity of the pending station
    const inStationProximity =
      activeTarget?.kind === 'station' &&
      activeTarget.station.id === pendingTarget.station.id;

    return inStationProximity;
  }
}

export const shouldDispatchPendingInteraction = InteractionSystem.shouldDispatchPendingInteraction;

