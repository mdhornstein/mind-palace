import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { RoomRenderer } from '../../src/render/roomRenderer';
import { RoomRegistry } from '../../src/rooms/registry';
import { StateManager } from '../../src/core/state';
import { MemoryStore } from '../../src/core/store';
import { RenderPlayer, RoomConfig } from '../../src/core/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function createMockContext(): any {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    setLineDash: vi.fn(),
    imageSmoothingEnabled: false,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    globalAlpha: 1,
  };
}

describe('RoomRenderer & Presentation Layer', () => {
  beforeEach(() => {
    vi.stubGlobal('document', {
      createElement: (tag: string) => {
        if (tag === 'canvas') {
          const ctx = createMockContext();
          return {
            width: 0,
            height: 0,
            getContext: () => ctx,
            style: {},
          };
        }
        return {};
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Architectural Boundary Invariant: No room entity imports in renderer', () => {
    it('src/render/** contains zero imports from src/rooms/**', () => {
      const renderDir = path.resolve(__dirname, '../../src/render');
      const tsFiles = getAllTypeScriptFiles(renderDir);

      expect(tsFiles.length).toBeGreaterThan(0);

      const violations: string[] = [];
      const roomsImportPattern = /from\s+['"][^'"]*\/rooms(\/|['"])/;

      for (const file of tsFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        lines.forEach((line: string, idx: number) => {
          if (roomsImportPattern.test(line)) {
            violations.push(`${file}:${idx + 1} -> ${line.trim()}`);
          }
        });
      }

      expect(
        violations,
        `Found forbidden room imports in renderer modules:\n${violations.join('\n')}`
      ).toEqual([]);
    });
  });

  describe('Dynamic Renderables Sorting', () => {
    it('sorts dynamic entities from room.getEntities() by Y depth along with player and props', () => {
      const ctx = createMockContext();
      const renderer = new RoomRenderer(ctx);
      const stateManager = new StateManager(new MemoryStore());
      const state = stateManager.getState();

      const drawOrder: string[] = [];

      const mockRoom: RoomConfig = {
        id: 'test_sorting_room',
        name: 'Sorting Room',
        widthTiles: 10,
        heightTiles: 10,
        stations: [],
        doors: [],
        ambientLight: { type: 'day' },
        decorativeProps: [
          {
            id: 'prop_high',
            name: 'High Prop',
            y: 50,
            draw: () => drawOrder.push('prop_50'),
          },
          {
            id: 'prop_low',
            name: 'Low Prop',
            y: 400,
            draw: () => drawOrder.push('prop_400'),
          },
        ],
        getEntities: () => [
          {
            y: 300,
            draw: () => drawOrder.push('entity_300'),
          },
          {
            y: 100,
            draw: () => drawOrder.push('entity_100'),
          },
        ],
      };

      const player: RenderPlayer = {
        x: 100,
        y: 200,
        facing: 'down',
        isMoving: false,
        walkFrame: 0,
      };

      // When player sprite is drawn, ctx.ellipse is invoked to draw the player beacon ring and shadow
      let playerRecorded = false;
      ctx.ellipse = vi.fn(() => {
        if (!playerRecorded) {
          drawOrder.push('player');
          playerRecorded = true;
        }
      });

      renderer.render(state, player, 1000, mockRoom, 1 / 60);

      // Verify that entities are drawn in strictly ascending Y-order:
      // prop_50 (50) -> entity_100 (100) -> player (200) -> entity_300 (300) -> prop_400 (400)
      expect(drawOrder).toEqual([
        'prop_50',
        'entity_100',
        'player',
        'entity_300',
        'prop_400',
      ]);
    });
  });

  describe('Dust Mote Delta-Time Scaling', () => {
    it('scales dust mote movement linearly with dtSeconds', () => {
      const ctx = createMockContext();
      const renderer = new RoomRenderer(ctx);
      const motes = renderer.getDustMotes();
      expect(motes.length).toBeGreaterThan(0);

      const initialY = motes[0].y;
      const speedY = motes[0].speedY;

      // 60fps frame: dt = 1/60s -> delta = speedY * (1/60 * 60) = speedY * 1
      renderer.stepDustMotes(1 / 60);
      expect(motes[0].y).toBeCloseTo(initialY + speedY, 4);

      // 120fps frame: dt = 1/120s -> delta = speedY * (1/120 * 60) = speedY * 0.5
      const currentY = motes[0].y;
      renderer.stepDustMotes(1 / 120);
      expect(motes[0].y).toBeCloseTo(currentY + speedY * 0.5, 4);

      // 30fps frame: dt = 1/30s -> delta = speedY * (1/30 * 60) = speedY * 2
      const after120Y = motes[0].y;
      renderer.stepDustMotes(1 / 30);
      expect(motes[0].y).toBeCloseTo(after120Y + speedY * 2.0, 4);
    });
  });

  describe('Full Smoke Test: All Registered Rooms', () => {
    it('renders without throwing across all registered rooms in RoomRegistry', () => {
      const ctx = createMockContext();
      const renderer = new RoomRenderer(ctx);
      const stateManager = new StateManager(new MemoryStore());
      const state = stateManager.getState();

      const player: RenderPlayer = {
        x: 200,
        y: 200,
        facing: 'down',
        isMoving: false,
        walkFrame: 0,
      };

      const rooms = RoomRegistry.getAllRooms();
      expect(rooms.length).toBeGreaterThanOrEqual(3);

      for (const room of rooms) {
        expect(() => {
          renderer.render(state, player, 1000, room, 1 / 60);
        }).not.toThrow();
      }
    });
  });
});
