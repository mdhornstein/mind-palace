import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { RoomRegistry } from '../../src/rooms/registry';
import { InteractionSystem } from '../../src/world/interactionSystem';
import { InteractionDispatcher } from '../../src/ui/interactionDispatcher';
import { StateManager } from '../../src/core/state';
import { MemoryStore } from '../../src/core/store';
import { BoundingBox, WorldStation } from '../../src/core/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function getAllTypeScriptFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllTypeScriptFiles(fullPath));
    } else if (file.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Room Graph, Registry, and Architectural Invariants', () => {
  const rooms = RoomRegistry.getAllRooms();

  describe('Room Graph Integrity & Walkable Spawn Points', () => {
    rooms.forEach((room) => {
      room.doors.forEach((door) => {
        it(`door "${door.name}" in ${room.id} connects to a valid room with a walkable spawn point`, () => {
          // 1. Target room exists
          const targetRoom = RoomRegistry.getRoom(door.targetRoomId);
          expect(targetRoom).toBeDefined();

          // 2. Door defines a valid target spawn point
          expect(door.targetSpawnPoint).toBeDefined();
          const spawn = door.targetSpawnPoint!;

          // 3. Spawn point is within target room pixel bounds
          const bounds = InteractionSystem.getRoomPixelBounds(targetRoom);
          expect(spawn.x).toBeGreaterThanOrEqual(0);
          expect(spawn.x).toBeLessThanOrEqual(bounds.width);
          expect(spawn.y).toBeGreaterThanOrEqual(0);
          expect(spawn.y).toBeLessThanOrEqual(bounds.height);

          // 4. Player bounding box at spawn point does not collide with obstacles
          const playerSpawnBox: BoundingBox = {
            x: spawn.x + 4,
            y: spawn.y + 20,
            w: 16,
            h: 10,
          };

          const targetObstacles = InteractionSystem.getRoomObstacles(targetRoom);
          for (const obstacle of targetObstacles) {
            const collides = boxesIntersect(playerSpawnBox, obstacle);
            expect(
              collides,
              `Spawn point (${spawn.x}, ${spawn.y}) in target room "${targetRoom.id}" collides with obstacle at (${obstacle.x}, ${obstacle.y}, ${obstacle.w}, ${obstacle.h})`
            ).toBe(false);
          }
        });
      });
    });
  });

  describe('Unique Identifiers', () => {
    it('has unique room IDs across RoomRegistry', () => {
      const roomIds = rooms.map((r) => r.id);
      const uniqueIds = new Set(roomIds);
      expect(uniqueIds.size).toBe(roomIds.length);
    });

    it('has globally unique station IDs across the palace', () => {
      const allStations: WorldStation[] = [];
      rooms.forEach((r) => allStations.push(...r.stations));
      const stationIds = allStations.map((s) => s.id);
      const uniqueStationIds = new Set(stationIds);
      expect(uniqueStationIds.size).toBe(stationIds.length);
    });

    it('has unique door IDs within each room', () => {
      rooms.forEach((room) => {
        const doorIds = room.doors.map((d) => d.id);
        const uniqueDoorIds = new Set(doorIds);
        expect(uniqueDoorIds.size).toBe(doorIds.length);
      });
    });
  });

  describe('Modal Registry Completeness & No Orphaned Handlers', () => {
    const registeredModalIds = InteractionDispatcher.getRegisteredModalIds();

    it('every station intent of type "modal" resolves to a registered modal handler', () => {
      rooms.forEach((room) => {
        room.stations.forEach((station) => {
          if (station.intent.type === 'modal') {
            expect(
              registeredModalIds,
              `Station "${station.id}" uses unregistered modalId "${station.intent.modalId}"`
            ).toContain(station.intent.modalId);
          }
        });
      });
    });

    it('every registered modal handler is referenced by at least one station in the palace', () => {
      const usedModalIds = new Set<string>();
      rooms.forEach((room) => {
        room.stations.forEach((station) => {
          if (station.intent.type === 'modal') {
            usedModalIds.add(station.intent.modalId);
          }
        });
      });

      registeredModalIds.forEach((modalId) => {
        expect(
          usedModalIds.has(modalId),
          `Modal handler "${modalId}" is registered in InteractionDispatcher but not referenced by any station`
        ).toBe(true);
      });
    });
  });

  describe('Parameter Contract Validation', () => {
    const dummyContext = {
      stateManager: new StateManager(new MemoryStore()),
      transitionToRoom: () => {},
    };

    it('fails loudly when unknown parameters are passed to modal intents', () => {
      expect(() => {
        InteractionDispatcher.dispatch(
          {
            type: 'modal',
            modalId: 'cabinet',
            params: {
              initialSpecimenIdSorce: 'activePedestal', // Typo!
            },
          },
          dummyContext
        );
      }).toThrow(/Unknown parameter "initialSpecimenIdSorce"/);
    });

    it('fails loudly when invalid parameter values are passed', () => {
      expect(() => {
        InteractionDispatcher.dispatch(
          {
            type: 'modal',
            modalId: 'cabinet',
            params: {
              initialSpecimenIdSource: 'nonExistentSource' as any,
            },
          },
          dummyContext
        );
      }).toThrow(/Invalid initialSpecimenIdSource/);
    });

    it('fails loudly when parameters are supplied to parameterless modals', () => {
      expect(() => {
        InteractionDispatcher.dispatch(
          {
            type: 'modal',
            modalId: 'library',
            params: {
              unexpected: true,
            },
          },
          dummyContext
        );
      }).toThrow(/Modal "library" does not accept parameters/);
    });
  });

  describe('Architectural Boundary Invariant: No UI imports in room definitions', () => {
    it('src/rooms/** contains zero imports from src/ui/**', () => {
      const roomsDir = path.resolve(__dirname, '../../src/rooms');
      const tsFiles = getAllTypeScriptFiles(roomsDir);

      expect(tsFiles.length).toBeGreaterThan(0);

      const violations: string[] = [];

      // Regex matching any import from UI directory
      const uiImportPattern = /from\s+['"][^'"]*\/ui(\/|['"])/;

      for (const file of tsFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line: string, idx: number) => {
          if (uiImportPattern.test(line)) {
            violations.push(`${file}:${idx + 1} -> ${line.trim()}`);
          }
        });
      }

      expect(
        violations,
        `Found forbidden UI imports in room definitions:\n${violations.join('\n')}`
      ).toEqual([]);
    });
  });
});
