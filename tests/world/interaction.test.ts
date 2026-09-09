import { describe, it, expect } from 'vitest';
import { InteractionSystem } from '../../src/world/interactionSystem';
import { RoomRegistry } from '../../src/rooms/registry';
import { TILE_SIZE } from '../../src/core/constants';
import { BoundingBox } from '../../src/core/types';

function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

describe('InteractionSystem', () => {
  const study = RoomRegistry.getRoom('study');
  const observatory = RoomRegistry.getRoom('observatory');
  const escher = RoomRegistry.getRoom('escher');

  describe('findInteractiveAt (hit-testing)', () => {
    it('detects a station clicked at its center', () => {
      const bookshelf = study.stations.find((s) => s.id === 'library')!;
      const clickX = (bookshelf.tileX + bookshelf.tileWidth / 2) * TILE_SIZE;
      const clickY = (bookshelf.tileY + bookshelf.tileHeight / 2) * TILE_SIZE;

      const target = InteractionSystem.findInteractiveAt(study, clickX, clickY);
      expect(target).not.toBeNull();
      expect(target?.kind).toBe('station');
      if (target?.kind === 'station') {
        expect(target.station.id).toBe('library');
      }
    });

    it('detects a door clicked at its center', () => {
      const door = study.doors.find((d) => d.id === 'to_observatory')!;
      const clickX = (door.tileX + door.tileWidth / 2) * TILE_SIZE;
      const clickY = (door.tileY + door.tileHeight / 2) * TILE_SIZE;

      const target = InteractionSystem.findInteractiveAt(study, clickX, clickY);
      expect(target).not.toBeNull();
      expect(target?.kind).toBe('door');
      if (target?.kind === 'door') {
        expect(target.door.id).toBe('to_observatory');
      }
    });

    it('returns null when clicking empty floor', () => {
      // (10, 7) in tiles is open floor in the study rug center
      const target = InteractionSystem.findInteractiveAt(study, 10 * TILE_SIZE, 7 * TILE_SIZE);
      expect(target).toBeNull();
    });
  });

  describe('findNearbyInteractive (proximity detection)', () => {
    it('detects station when player foot is in proximity', () => {
      const bookshelf = study.stations.find((s) => s.id === 'library')!;
      const target = InteractionSystem.findNearbyInteractive(
        study,
        bookshelf.approachPoint.x,
        bookshelf.approachPoint.y
      );

      expect(target).not.toBeNull();
      expect(target?.kind).toBe('station');
      if (target?.kind === 'station') {
        expect(target.station.id).toBe('library');
      }
    });

    it('returns null when player is far away in the center of the room', () => {
      const target = InteractionSystem.findNearbyInteractive(study, 10 * TILE_SIZE, 7 * TILE_SIZE);
      expect(target).toBeNull();
    });
  });

  describe('getInteractionPoint', () => {
    it('returns station.approachPoint for stations', () => {
      const station = study.stations[0];
      const point = InteractionSystem.getInteractionPoint({ kind: 'station', station });
      expect(point).toEqual(station.approachPoint);
    });

    it('returns doorway center for doors', () => {
      const door = study.doors[0];
      const point = InteractionSystem.getInteractionPoint({ kind: 'door', door });
      expect(point.x).toBe((door.tileX + door.tileWidth / 2) * TILE_SIZE);
      expect(point.y).toBe((door.tileY + door.tileHeight / 2) * TILE_SIZE);
    });
  });

  describe('intersectsDoorwayThreshold', () => {
    it('returns true when player box overlaps door threshold', () => {
      const door = study.doors.find((d) => d.id === 'to_observatory')!;
      const playerBox: BoundingBox = {
        x: door.tileX * TILE_SIZE + 4,
        y: door.tileY * TILE_SIZE + 4,
        w: 16,
        h: 10,
      };
      expect(InteractionSystem.intersectsDoorwayThreshold(study, playerBox)).toBe(true);
    });

    it('returns false when player box is in the center of the room', () => {
      const playerBox: BoundingBox = {
        x: 10 * TILE_SIZE,
        y: 10 * TILE_SIZE,
        w: 16,
        h: 10,
      };
      expect(InteractionSystem.intersectsDoorwayThreshold(study, playerBox)).toBe(false);
    });
  });

  describe('getRoomObstacles (pure aggregation without room-id branching)', () => {
    it('includes architectural collisions (fireplace mantle in study)', () => {
      const obstacles = InteractionSystem.getRoomObstacles(study);
      const fireplace = obstacles.find(
        (obs) =>
          obs.x === 8.5 * TILE_SIZE &&
          obs.y === 1.2 * TILE_SIZE &&
          obs.w === 2.5 * TILE_SIZE
      );
      expect(fireplace).toBeDefined();
    });

    it('aggregates station collision boxes and prop collision boxes', () => {
      const obstacles = InteractionSystem.getRoomObstacles(study);
      const stationCollisions = study.stations.filter((s) => s.collisionBox).length;
      const propCollisions = (study.decorativeProps || []).filter((p) => p.collisionBox).length;
      const archCollisions = study.architecturalCollisions?.length || 0;

      expect(obstacles.length).toBe(stationCollisions + propCollisions + archCollisions);
    });
  });

  describe('getRoomPixelBounds', () => {
    it('returns pixel dimensions corresponding to widthTiles and heightTiles', () => {
      const bounds = InteractionSystem.getRoomPixelBounds(study);
      expect(bounds.width).toBe(study.widthTiles * TILE_SIZE);
      expect(bounds.height).toBe(study.heightTiles * TILE_SIZE);
    });
  });

  describe('Cross-Consistency Invariant: Click / Proximity / Approach geometry', () => {
    const allRooms = [study, observatory, escher];

    allRooms.forEach((room) => {
      describe(`Room: ${room.name} (${room.id})`, () => {
        const obstacles = InteractionSystem.getRoomObstacles(room);

        room.stations.forEach((station) => {
          it(`station "${station.name}" (${station.id}) satisfies cross-consistency geometry`, () => {
            // 1. Center of station visual bounding box matches findInteractiveAt
            const centerX = (station.tileX + station.tileWidth / 2) * TILE_SIZE;
            const centerY = (station.tileY + station.tileHeight / 2) * TILE_SIZE;
            const targetAtCenter = InteractionSystem.findInteractiveAt(room, centerX, centerY);

            expect(targetAtCenter).not.toBeNull();
            expect(targetAtCenter?.kind).toBe('station');
            if (targetAtCenter?.kind === 'station') {
              expect(targetAtCenter.station.id).toBe(station.id);
            }

            // 2. getInteractionPoint returns approachPoint
            const approachPoint = InteractionSystem.getInteractionPoint({
              kind: 'station',
              station,
            });
            expect(approachPoint).toEqual(station.approachPoint);

            // 3. Player standing at approachPoint does NOT intersect any solid obstacle
            const playerFeetBox: BoundingBox = {
              x: approachPoint.x + 4,
              y: approachPoint.y + 20,
              w: 16,
              h: 10,
            };

            for (const obstacle of obstacles) {
              const intersects = boxesIntersect(playerFeetBox, obstacle);
              expect(
                intersects,
                `Approach point for "${station.name}" at (${approachPoint.x}, ${approachPoint.y}) collides with obstacle at (${obstacle.x}, ${obstacle.y}, ${obstacle.w}, ${obstacle.h})`
              ).toBe(false);
            }

            // 4. Player standing at approachPoint is detected as nearby the station
            const nearby = InteractionSystem.findNearbyInteractive(
              room,
              approachPoint.x,
              approachPoint.y
            );
            expect(nearby).not.toBeNull();
            expect(nearby?.kind).toBe('station');
            if (nearby?.kind === 'station') {
              expect(nearby.station.id).toBe(station.id);
            }
          });
        });

        room.doors.forEach((door) => {
          it(`door "${door.name}" (${door.id}) satisfies click and threshold geometry`, () => {
            const centerX = (door.tileX + door.tileWidth / 2) * TILE_SIZE;
            const centerY = (door.tileY + door.tileHeight / 2) * TILE_SIZE;
            const targetAtCenter = InteractionSystem.findInteractiveAt(room, centerX, centerY);

            expect(targetAtCenter).not.toBeNull();
            expect(targetAtCenter?.kind).toBe('door');
            if (targetAtCenter?.kind === 'door') {
              expect(targetAtCenter.door.id).toBe(door.id);
            }

            // Interaction point is at threshold center
            const interactionPoint = InteractionSystem.getInteractionPoint({
              kind: 'door',
              door,
            });
            expect(interactionPoint.x).toBe(centerX);
            expect(interactionPoint.y).toBe(centerY);
          });
        });
      });
    });
  });
});
