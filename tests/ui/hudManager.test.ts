import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HudManager, deriveHudState, CanvasViewportTransform, HudState } from '../../src/ui/hudManager';
import { InteractiveTarget, WorldStation, Doorway, CompanionState } from '../../src/core/types';
import { TILE_SIZE, CANVAS_WIDTH } from '../../src/core/constants';

function createMockElement(): HTMLElement {
  const element: any = {
    className: '',
    innerHTML: '',
    textContent: '',
    style: {
      left: '',
      top: '',
    },
  };
  return element as HTMLElement;
}

describe('HUD Presentation & HudManager', () => {
  const transform: CanvasViewportTransform = {
    left: 100,
    top: 50,
    scale: 2.0, // 2x display scaling
  };

  const sampleStation: WorldStation = {
    id: 'test_station',
    name: 'Antique Desk',
    prompt: 'Examine Manuscripts',
    tileX: 4,
    tileY: 5,
    tileWidth: 2,
    tileHeight: 2,
    approachPoint: { x: 4.5 * TILE_SIZE, y: 7 * TILE_SIZE },
    draw: () => {},
    intent: { type: 'modal', modalId: 'library' },
  };

  const sampleDoor: Doorway = {
    id: 'test_door',
    name: 'The Grand Arch',
    prompt: 'Step through portal',
    tileX: 8,
    tileY: 1, // High on the wall, will test ceiling flip
    tileWidth: 2,
    tileHeight: 2,
    targetRoomId: 'observatory',
    targetSpawnPoint: { x: 100, y: 100, facing: 'down' },
  };

  const sampleCompanion: CompanionState = {
    name: 'Scholar',
    role: 'Historian',
    x: 200,
    y: 300,
    facing: 'down',
    location: 'reading_nook',
    activity: 'reading',
    presenceLevel: 2,
    speech: {
      text: 'The stars whisper ancient theorems tonight.',
      timestamp: 10000,
      durationMs: 4000,
    },
    pendingRemark: null,
    discussedItems: [],
    lastNoticedPlayerAt: 10000,
  };

  describe('deriveHudState (pure presentation derivation)', () => {
    it('returns null prompt and speech when modal overlay is open', () => {
      const target: InteractiveTarget = { kind: 'station', station: sampleStation };
      const hudState = deriveHudState(
        target,
        sampleCompanion,
        true,
        true, // isOverlayOpen = true
        transform,
        11000
      );

      expect(hudState.prompt).toBeNull();
      expect(hudState.speech).toBeNull();
    });

    it('returns null prompt when there is no active target', () => {
      const hudState = deriveHudState(
        null,
        null,
        false,
        false,
        transform,
        1000
      );

      expect(hudState.prompt).toBeNull();
      expect(hudState.speech).toBeNull();
    });

    it('derives station prompt with non-portal styling and correct screen coordinates', () => {
      const target: InteractiveTarget = { kind: 'station', station: sampleStation };
      const hudState = deriveHudState(
        target,
        null,
        false,
        false,
        transform,
        1000
      );

      expect(hudState.prompt).not.toBeNull();
      expect(hudState.prompt!.name).toBe('Antique Desk');
      expect(hudState.prompt!.action).toBe('Examine Manuscripts');
      expect(hudState.prompt!.isPortal).toBe(false);

      // Math verification:
      // zoneX = 4 * 32 = 128, zoneW = 2 * 32 = 64. zoneCenterX = 128 + 32 = 160.
      // screenX = transform.left (100) + 160 * transform.scale (2) = 100 + 320 = 420.
      expect(hudState.prompt!.x).toBe(420);

      // zoneY = 5 * 32 = 160. targetCanvasY = 160 - 12 = 148 (>= 40).
      // screenY = transform.top (50) + 148 * transform.scale (2) = 50 + 296 = 346.
      expect(hudState.prompt!.y).toBe(346);
    });

    it('derives doorway prompt with isPortal: true and flips below zone near ceiling', () => {
      const target: InteractiveTarget = { kind: 'door', door: sampleDoor };
      const hudState = deriveHudState(
        target,
        null,
        false,
        false,
        transform,
        1000
      );

      expect(hudState.prompt).not.toBeNull();
      expect(hudState.prompt!.name).toBe('The Grand Arch');
      expect(hudState.prompt!.isPortal).toBe(true);

      // Math verification for ceiling flip:
      // zoneY = 1 * 32 = 32. targetCanvasY initially 32 - 12 = 20 (< 40).
      // Flips to: zoneY (32) + zoneH (64) + 22 = 118.
      // screenY = transform.top (50) + 118 * transform.scale (2) = 50 + 236 = 286.
      expect(hudState.prompt!.y).toBe(286);
    });

    it('derives companion speech when active, and hides speech once duration expires', () => {
      // Active speech at t = 12,000 (within 10,000 + 4,000)
      const activeState = deriveHudState(
        null,
        sampleCompanion,
        true,
        false,
        transform,
        12000
      );
      expect(activeState.speech).not.toBeNull();
      expect(activeState.speech!.text).toBe('The stars whisper ancient theorems tonight.');
      // screenX = 100 + (200 + 8) * 2 = 100 + 416 = 516
      expect(activeState.speech!.x).toBe(516);
      // screenY = 50 + (300 - 8) * 2 = 50 + 584 = 634
      expect(activeState.speech!.y).toBe(634);

      // Expired speech at t = 14,001 (past durationMs = 4000)
      const expiredState = deriveHudState(
        null,
        sampleCompanion,
        true,
        false,
        transform,
        14001
      );
      expect(expiredState.speech).toBeNull();
    });

    it('suppresses companion speech if room hasCompanion is false', () => {
      const state = deriveHudState(
        null,
        sampleCompanion,
        false, // hasCompanion = false
        false,
        transform,
        12000
      );
      expect(state.speech).toBeNull();
    });
  });

  describe('HudManager (State-Diffing & Layout Safety)', () => {
    let promptEl: HTMLElement;
    let speechEl: HTMLElement;
    let manager: HudManager;

    beforeEach(() => {
      promptEl = createMockElement();
      speechEl = createMockElement();
      manager = new HudManager(promptEl, speechEl);
    });

    it('caches viewport transform and never calls getBoundingClientRect inside update()', () => {
      const mockCanvas: any = {
        getBoundingClientRect: vi.fn(() => ({
          left: 40,
          top: 30,
          width: 1280,
          height: 720,
        })),
      };

      manager.handleViewportChange(mockCanvas);
      expect(mockCanvas.getBoundingClientRect).toHaveBeenCalledTimes(1);

      const cachedTransform = manager.getTransform();
      expect(cachedTransform.left).toBe(40);
      expect(cachedTransform.top).toBe(30);
      expect(cachedTransform.scale).toBe(1280 / CANVAS_WIDTH);

      // Running updates must NEVER call getBoundingClientRect
      const state: HudState = {
        prompt: {
          visible: true,
          name: 'Book',
          action: 'Read',
          isPortal: false,
          x: 200,
          y: 300,
        },
        speech: null,
      };

      manager.update(state);
      expect(mockCanvas.getBoundingClientRect).toHaveBeenCalledTimes(1);

      manager.update(state);
      expect(mockCanvas.getBoundingClientRect).toHaveBeenCalledTimes(1);
    });

    it('updates DOM on state change, and leaves DOM untouched when state is identical', () => {
      const state1: HudState = {
        prompt: {
          visible: true,
          name: 'Telescope',
          action: 'Observe',
          isPortal: false,
          x: 150,
          y: 250,
        },
        speech: {
          visible: true,
          text: 'Look at Jupiter!',
          x: 180,
          y: 220,
        },
      };

      manager.update(state1);

      expect(promptEl.className).toBe('visible');
      expect(promptEl.style.left).toBe('150px');
      expect(promptEl.style.top).toBe('250px');
      expect(promptEl.innerHTML).toContain('Telescope');
      expect(speechEl.className).toBe('visible');
      expect(speechEl.textContent).toBe('Look at Jupiter!');

      // Set property setters to spies to verify zero mutation on duplicate state
      let innerHtmlSetCount = 0;
      let textContentSetCount = 0;

      Object.defineProperty(promptEl, 'innerHTML', {
        get: () => '<div>cached</div>',
        set: () => {
          innerHtmlSetCount++;
        },
        configurable: true,
      });

      Object.defineProperty(speechEl, 'textContent', {
        get: () => 'cached',
        set: () => {
          textContentSetCount++;
        },
        configurable: true,
      });

      // Calling update with identical state: NO DOM property setter calls!
      manager.update(state1);
      expect(innerHtmlSetCount).toBe(0);
      expect(textContentSetCount).toBe(0);
    });

    it('clears and hides elements when transitioning or clearing', () => {
      const state: HudState = {
        prompt: {
          visible: true,
          name: 'Portal',
          action: 'Enter',
          isPortal: true,
          x: 100,
          y: 100,
        },
        speech: {
          visible: true,
          text: 'Farewell!',
          x: 120,
          y: 80,
        },
      };

      manager.update(state);
      expect(promptEl.className).toBe('visible portal-prompt');
      expect(speechEl.className).toBe('visible');

      manager.clear();
      expect(promptEl.className).toBe('');
      expect(speechEl.className).toBe('');
    });

    it('observes canvas layout changes via ResizeObserver and updates cached transform', () => {
      let observerCallback: (() => void) | null = null;
      const disconnectSpy = vi.fn();
      const observeSpy = vi.fn();

      class MockResizeObserver {
        constructor(cb: () => void) {
          observerCallback = cb;
        }
        observe = observeSpy;
        disconnect = disconnectSpy;
      }

      vi.stubGlobal('ResizeObserver', MockResizeObserver);

      let rectWidth = 1000;
      const mockCanvas: any = {
        getBoundingClientRect: vi.fn(() => ({
          left: 50,
          top: 25,
          width: rectWidth,
          height: 600,
        })),
      };

      manager.attachCanvas(mockCanvas);
      expect(observeSpy).toHaveBeenCalledWith(mockCanvas);
      expect(manager.getTransform().scale).toBe(1000 / CANVAS_WIDTH);

      // Simulate a layout/canvas resize occurring without window.resize
      rectWidth = 1400;
      observerCallback!();
      expect(manager.getTransform().scale).toBe(1400 / CANVAS_WIDTH);

      manager.disconnect();
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});

