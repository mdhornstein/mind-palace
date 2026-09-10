import { describe, it, expect } from 'vitest';
import { InteractionSystem, resolveInteractionIntent } from '../../src/world/interactionSystem';
import { RoomRegistry } from '../../src/rooms/registry';
import { TILE_SIZE } from '../../src/core/constants';
import { BoundingBox, InteractiveTarget, WorldStation } from '../../src/core/types';

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

  describe('findSteppedDoorway (data-driven automatic doorway transition)', () => {
    it('detects automatic doorway transition when player steps into doorway threshold', () => {
      const door = study.doors.find((d) => d.id === 'to_observatory')!;
      expect(door.transitionMode).toBe('auto');

      // Player feet stepped inside threshold
      const playerX = door.tileX * TILE_SIZE + 8;
      const playerY = door.tileY * TILE_SIZE;

      const stepped = InteractionSystem.findSteppedDoorway(study, playerX, playerY);
      expect(stepped).not.toBeNull();
      expect(stepped?.id).toBe('to_observatory');
    });

    it('returns null when player is outside doorway threshold', () => {
      const stepped = InteractionSystem.findSteppedDoorway(study, 10 * TILE_SIZE, 7 * TILE_SIZE);
      expect(stepped).toBeNull();
    });
  });

  describe('shouldDispatchPendingInteraction (click-to-walk interaction lifecycle)', () => {
    const libraryStation = study.stations.find((s) => s.id === 'library')!;
    const cabinetStation = study.stations.find((s) => s.id === 'cabinet')!;

    const pendingLibrary = { kind: 'station' as const, station: libraryStation };
    const activeLibrary = { kind: 'station' as const, station: libraryStation };
    const activeCabinet = { kind: 'station' as const, station: cabinetStation };

    it('dispatches when player enters proximity of targeted station', () => {
      expect(
        InteractionSystem.shouldDispatchPendingInteraction(
          pendingLibrary,
          activeLibrary,
          'navigating'
        )
      ).toBe(true);

      expect(
        InteractionSystem.shouldDispatchPendingInteraction(
          pendingLibrary,
          activeLibrary,
          'arrived'
        )
      ).toBe(true);
    });

    it('NEVER dispatches when navigation was blocked by an obstacle', () => {
      expect(
        InteractionSystem.shouldDispatchPendingInteraction(
          pendingLibrary,
          activeLibrary,
          'blocked'
        )
      ).toBe(false);

      expect(
        InteractionSystem.shouldDispatchPendingInteraction(
          pendingLibrary,
          null,
          'blocked'
        )
      ).toBe(false);
    });

    it('does NOT dispatch when player is not in proximity of targeted station', () => {
      expect(
        InteractionSystem.shouldDispatchPendingInteraction(
          pendingLibrary,
          null,
          'navigating'
        )
      ).toBe(false);

      expect(
        InteractionSystem.shouldDispatchPendingInteraction(
          pendingLibrary,
          null,
          'arrived'
        )
      ).toBe(false);
    });

    it('does NOT dispatch if active proximity target is a different station', () => {
      expect(
        InteractionSystem.shouldDispatchPendingInteraction(
          pendingLibrary,
          activeCabinet,
          'navigating'
        )
      ).toBe(false);
    });

    it('does NOT dispatch if pendingTarget is null', () => {
      expect(
        InteractionSystem.shouldDispatchPendingInteraction(
          null,
          activeLibrary,
          'arrived'
        )
      ).toBe(false);
    });
  });

  describe('Emerging Interaction Grammar', () => {
    const stationWithPrimary: WorldStation = {
      id: 'test_engine_press',
      name: 'Engine Press',
      prompt: 'Inspect Press',
      tileX: 7,
      tileY: 2,
      tileWidth: 3,
      tileHeight: 3,
      approachPoint: { x: 280, y: 160 },
      draw: () => {},
      intent: {
        type: 'modal',
        modalId: 'coin_press',
      },
      primaryAction: {
        label: 'Crank Press',
        intent: {
          type: 'custom',
          actionId: 'mint_crank_press',
          params: { stationId: 'test_engine_press', originX: 281, originY: 142 },
        },
      },
    };

    const stationWithoutPrimary: WorldStation = {
      id: 'test_reading_desk',
      name: 'Reading Desk',
      prompt: 'Browse Manuscripts',
      tileX: 3,
      tileY: 3,
      tileWidth: 2,
      tileHeight: 2,
      approachPoint: { x: 100, y: 100 },
      draw: () => {},
      intent: {
        type: 'modal',
        modalId: 'library',
      },
    };

    it('station with primaryAction: F dispatches the primary action', async () => {
      const { InteractionDispatcher } = await import('../../src/ui/interactionDispatcher');
      const target: InteractiveTarget = { kind: 'station', station: stationWithPrimary };

      // F key triggers 'primary' action resolution
      const resolvedIntent = resolveInteractionIntent(target, 'primary');
      expect(resolvedIntent).toEqual(stationWithPrimary.primaryAction!.intent);

      // Verify routing via InteractionDispatcher
      let dispatchedCustomAction: string | null = null;
      InteractionDispatcher.registerAction('mint_crank_press', (intent) => {
        dispatchedCustomAction = intent.actionId;
      });

      const dummyContext: any = { stateManager: {}, transitionToRoom: () => {} };
      InteractionDispatcher.dispatch(resolvedIntent, dummyContext);

      expect(dispatchedCustomAction).toBe('mint_crank_press');
    });

    it('station with primaryAction: Space dispatches the normal/inspect intent', async () => {
      const target: InteractiveTarget = { kind: 'station', station: stationWithPrimary };

      // Space key triggers 'inspect' action resolution
      const resolvedIntent = resolveInteractionIntent(target, 'inspect');
      expect(resolvedIntent).toEqual(stationWithPrimary.intent);
      expect(resolvedIntent.type).toBe('modal');
      if (resolvedIntent.type === 'modal') {
        expect(resolvedIntent.modalId).toBe('coin_press');
      }
    });

    it('station without primaryAction: F falls back to its normal intent', () => {
      const target: InteractiveTarget = { kind: 'station', station: stationWithoutPrimary };

      // F key triggers 'primary' resolution, falling back to station.intent when no primaryAction exists
      const resolvedIntent = resolveInteractionIntent(target, 'primary');
      expect(resolvedIntent).toEqual(stationWithoutPrimary.intent);
      expect(resolvedIntent.type).toBe('modal');
      if (resolvedIntent.type === 'modal') {
        expect(resolvedIntent.modalId).toBe('library');
      }
    });

    it('clicking the [F] prompt button follows the same primary-action path as pressing F', () => {
      const target: InteractiveTarget = { kind: 'station', station: stationWithPrimary };

      // Simulated DOM click event on prompt button [data-action="primary"]
      const mockPrimaryButton = {
        getAttribute: (attr: string) => (attr === 'data-action' ? 'primary' : null),
      };
      const mockInspectButton = {
        getAttribute: (attr: string) => (attr === 'data-action' ? 'inspect' : null),
      };

      const primaryTriggerType = mockPrimaryButton.getAttribute('data-action') as 'primary';
      const inspectTriggerType = mockInspectButton.getAttribute('data-action') as 'inspect';

      // Both pressing 'F' and clicking the [F] primary prompt button resolve identical intent
      const fromFKeyPress = resolveInteractionIntent(target, 'primary');
      const fromButtonPill = resolveInteractionIntent(target, primaryTriggerType);

      expect(fromButtonPill).toEqual(fromFKeyPress);
      expect(fromButtonPill).toEqual(stationWithPrimary.primaryAction!.intent);

      // Contrast with inspect button, which maps to normal/inspect intent
      const fromInspectPill = resolveInteractionIntent(target, inspectTriggerType);
      expect(fromInspectPill).toEqual(stationWithPrimary.intent);
    });
  });

  describe('executeMintCrankPress() Gameplay & Physics', () => {
    it('first press succeeds', async () => {
      const { executeMintCrankPress, resetMintCrankCooldown } = await import(
        '../../src/rooms/coins/coinMachineActions'
      );
      resetMintCrankCooldown();

      const success = executeMintCrankPress(undefined, 1000);
      expect(success).toBe(true);
    });

    it('first press succeeds even at initial timestamp now === 0 (sentinel verification)', async () => {
      const { executeMintCrankPress, resetMintCrankCooldown } = await import(
        '../../src/rooms/coins/coinMachineActions'
      );
      resetMintCrankCooldown();
      const success = executeMintCrankPress(undefined, 0);
      expect(success).toBe(true);
    });

    it('presses within the cooldown are ignored', async () => {
      const { executeMintCrankPress, resetMintCrankCooldown } = await import(
        '../../src/rooms/coins/coinMachineActions'
      );
      resetMintCrankCooldown();

      // First press at t=1000 succeeds
      expect(executeMintCrankPress(undefined, 1000)).toBe(true);

      // Press at t=1050 (50ms elapsed < 140ms cooldown) is ignored
      expect(executeMintCrankPress(undefined, 1050)).toBe(false);

      // Press at t=1139 (139ms elapsed < 140ms cooldown) is ignored
      expect(executeMintCrankPress(undefined, 1139)).toBe(false);
    });

    it('a press after the cooldown succeeds', async () => {
      const { executeMintCrankPress, resetMintCrankCooldown } = await import(
        '../../src/rooms/coins/coinMachineActions'
      );
      resetMintCrankCooldown();

      expect(executeMintCrankPress(undefined, 1000)).toBe(true);
      expect(executeMintCrankPress(undefined, 1050)).toBe(false);

      // Press at t=1140 (140ms elapsed >= 140ms cooldown) succeeds
      expect(executeMintCrankPress(undefined, 1140)).toBe(true);

      // Subsequent press after another 140ms interval succeeds
      expect(executeMintCrankPress(undefined, 1280)).toBe(true);
    });

    it('each successful press produces the expected small randomized coin burst', async () => {
      const { executeMintCrankPress, resetMintCrankCooldown } = await import(
        '../../src/rooms/coins/coinMachineActions'
      );
      const { CoinPhysicsEngine } = await import('../../src/rooms/coins/coinPhysics');

      const engine = CoinPhysicsEngine.getInstance();

      // Test invariants across 20 iterations (testing ranges/invariants, not exact random numbers)
      for (let i = 0; i < 20; i++) {
        resetMintCrankCooldown();
        engine.clearCoins();
        expect(engine.getCoins().length).toBe(0);

        const time = 1000 + i * 200;
        const success = executeMintCrankPress(undefined, time);
        expect(success).toBe(true);

        const coins = engine.getCoins();
        // Invariant 1: small burst always contains between 2 and 4 coins inclusive
        expect(coins.length).toBeGreaterThanOrEqual(2);
        expect(coins.length).toBeLessThanOrEqual(4);

        // Invariant 2: every coin has physical velocity and non-zero mass/coordinates
        for (const coin of coins) {
          expect(Number.isFinite(coin.x)).toBe(true);
          expect(Number.isFinite(coin.y)).toBe(true);
          expect(Number.isFinite(coin.z)).toBe(true);
          expect(Number.isFinite(coin.vx)).toBe(true);
          expect(Number.isFinite(coin.vy)).toBe(true);
          expect(Number.isFinite(coin.vz)).toBe(true);
          expect(coin.z).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('ejects coins from machine-specific origin coordinates without hardcoded global positions', async () => {
      const { executeMintCrankPress, resetMintCrankCooldown } = await import(
        '../../src/rooms/coins/coinMachineActions'
      );
      const { CoinPhysicsEngine } = await import('../../src/rooms/coins/coinPhysics');

      const engine = CoinPhysicsEngine.getInstance();

      // Test Machine 1: mint_coin_press with chute at (281, 142)
      resetMintCrankCooldown();
      engine.clearCoins();
      executeMintCrankPress({ stationId: 'mint_coin_press', originX: 281, originY: 142 }, 1000);
      const mintCoins = engine.getCoins();
      expect(mintCoins.length).toBeGreaterThanOrEqual(2);
      for (const coin of mintCoins) {
        // Lateral scatter within ±8px of originX and ±4px of originY
        expect(coin.x).toBeGreaterThanOrEqual(281 - 8);
        expect(coin.x).toBeLessThanOrEqual(281 + 8);
        expect(coin.y).toBeGreaterThanOrEqual(142 - 4);
        expect(coin.y).toBeLessThanOrEqual(142 + 4);
      }

      // Test Machine 2: vault_coin_press with distinct custom coordinates (450, 210)
      resetMintCrankCooldown();
      engine.clearCoins();
      executeMintCrankPress({ stationId: 'vault_coin_press', originX: 450, originY: 210 }, 1000);
      const vaultCoins = engine.getCoins();
      expect(vaultCoins.length).toBeGreaterThanOrEqual(2);
      for (const coin of vaultCoins) {
        expect(coin.x).toBeGreaterThanOrEqual(450 - 8);
        expect(coin.x).toBeLessThanOrEqual(450 + 8);
        expect(coin.y).toBeGreaterThanOrEqual(210 - 4);
        expect(coin.y).toBeLessThanOrEqual(210 + 4);
      }
    });
  });

  describe('Declarative Primary Actions & Custom Action Dispatcher Router', () => {
    it('verifies that coinPressStation declares primaryAction without imperative callbacks', () => {
      const coinRoom = RoomRegistry.getRoom('coins');
      const pressStation = coinRoom.stations.find((s) => s.id === 'mint_coin_press')!;
      expect(pressStation).toBeDefined();
      expect(pressStation.primaryAction).toBeDefined();
      expect(pressStation.primaryAction?.label).toBe('Crank Press');
      expect(pressStation.primaryAction?.intent.type).toBe('custom');
      if (pressStation.primaryAction?.intent.type === 'custom') {
        expect(pressStation.primaryAction.intent.actionId).toBe('mint_crank_press');
      }
    });

    it('validates and parses parameters for mint_crank_press safely', async () => {
      const { parseMintCrankParams } = await import('../../src/ui/appActions');

      // Valid parameters
      const valid = parseMintCrankParams({
        stationId: 'mint_coin_press',
        originX: 280,
        originY: 140,
        originZ: 28,
      });
      expect(valid).toEqual({
        stationId: 'mint_coin_press',
        originX: 280,
        originY: 140,
        originZ: 28,
      });

      // Rejects non-numeric coordinates
      expect(() => parseMintCrankParams({ originX: 'invalid' as any })).toThrow();
      // Rejects unknown keys
      expect(() => parseMintCrankParams({ bogusKey: 123 } as any)).toThrow();
      // Accepts undefined/empty
      expect(parseMintCrankParams(undefined)).toBeUndefined();
    });

    it('dispatches custom actions via InteractionDispatcher router', async () => {
      const { InteractionDispatcher } = await import('../../src/ui/interactionDispatcher');
      const { CoinPhysicsEngine } = await import('../../src/rooms/coins/coinPhysics');
      const { resetMintCrankCooldown } = await import('../../src/rooms/coins/coinMachineActions');
      const { registerApplicationActions } = await import('../../src/ui/appActions');

      registerApplicationActions();
      resetMintCrankCooldown();
      const engine = CoinPhysicsEngine.getInstance();
      engine.clearCoins();
      expect(engine.getCoins().length).toBe(0);

      const dummyContext: any = {
        stateManager: { getState: () => ({ environment: {} }) },
        transitionToRoom: () => {},
      };

      InteractionDispatcher.dispatch(
        { type: 'custom', actionId: 'mint_crank_press' },
        dummyContext
      );

      // Between 2 and 4 coins should have been stamped and spawned
      expect(engine.getCoins().length).toBeGreaterThanOrEqual(2);
      expect(engine.getCoins().length).toBeLessThanOrEqual(4);
    });

    it('supports registering new custom actions in InteractionDispatcher', async () => {
      const { InteractionDispatcher } = await import('../../src/ui/interactionDispatcher');
      let customTriggered = false;

      InteractionDispatcher.registerAction('test_pulse_action', () => {
        customTriggered = true;
      });

      const dummyContext: any = {
        stateManager: {},
        transitionToRoom: () => {},
      };

      InteractionDispatcher.dispatch(
        { type: 'custom', actionId: 'test_pulse_action' },
        dummyContext
      );

      expect(customTriggered).toBe(true);
      expect(InteractionDispatcher.getRegisteredActionIds()).toContain('test_pulse_action');
    });

    it('verifies real station declarations (coinPressStation and vaultCoinPressStation) wire machine-specific origins to the coin action', async () => {
      const { InteractionDispatcher } = await import('../../src/ui/interactionDispatcher');
      const { CoinPhysicsEngine } = await import('../../src/rooms/coins/coinPhysics');
      const { resetMintCrankCooldown } = await import('../../src/rooms/coins/coinMachineActions');
      const { registerApplicationActions } = await import('../../src/ui/appActions');
      const { COIN_PRESS_CHUTE_X, COIN_PRESS_CHUTE_Y } = await import(
        '../../src/rooms/coins/stations/coinPress'
      );

      registerApplicationActions();
      const engine = CoinPhysicsEngine.getInstance();

      // 1. Verify The Mechanical Mint station
      const mintRoom = RoomRegistry.getRoom('coins');
      const mintStation = mintRoom.stations.find((s) => s.id === 'mint_coin_press')!;
      expect(mintStation).toBeDefined();
      expect(mintStation.primaryAction).toBeDefined();
      expect(mintStation.primaryAction?.intent.type).toBe('custom');
      if (mintStation.primaryAction?.intent.type === 'custom') {
        expect(mintStation.primaryAction.intent.params?.originX).toBe(COIN_PRESS_CHUTE_X);
        expect(mintStation.primaryAction.intent.params?.originY).toBe(COIN_PRESS_CHUTE_Y);
        expect(mintStation.primaryAction.intent.params?.stationId).toBe('mint_coin_press');
      }

      // 2. Verify The Sovereign Vault station
      const { RoomVariantManager } = await import(
        '../../src/rooms/variants/roomVariantManager'
      );
      const vaultConfig = RoomVariantManager.getVariantMeta('coins', 'v2_vault')!.config;
      const vaultStation = vaultConfig.stations.find((s) => s.id === 'vault_coin_press')!;
      expect(vaultStation).toBeDefined();
      expect(vaultStation.primaryAction).toBeDefined();
      expect(vaultStation.primaryAction?.intent.type).toBe('custom');
      if (vaultStation.primaryAction?.intent.type === 'custom') {
        expect(vaultStation.primaryAction.intent.params?.originX).toBe(COIN_PRESS_CHUTE_X);
        expect(vaultStation.primaryAction.intent.params?.originY).toBe(COIN_PRESS_CHUTE_Y);
        expect(vaultStation.primaryAction.intent.params?.stationId).toBe('vault_coin_press');
      }

      // 3. Dispatch Vault primary action and assert coins spawn from its real chute
      resetMintCrankCooldown();
      engine.clearCoins();
      const dummyContext: any = { stateManager: {}, transitionToRoom: () => {} };

      InteractionDispatcher.dispatch(vaultStation.primaryAction!.intent, dummyContext);

      const vaultCoins = engine.getCoins();
      expect(vaultCoins.length).toBeGreaterThanOrEqual(2);
      for (const coin of vaultCoins) {
        expect(coin.x).toBeGreaterThanOrEqual(COIN_PRESS_CHUTE_X - 8);
        expect(coin.x).toBeLessThanOrEqual(COIN_PRESS_CHUTE_X + 8);
        expect(coin.y).toBeGreaterThanOrEqual(COIN_PRESS_CHUTE_Y - 4);
        expect(coin.y).toBeLessThanOrEqual(COIN_PRESS_CHUTE_Y + 4);
      }
    });

    it('verifies The Ringing Stone station declaration, dual F/Space intent resolution, and action wiring', async () => {
      const { v1MintConfig } = await import('../../src/rooms/coins/variants/v1_mint');
      const stoneStation = v1MintConfig.stations.find((s) => s.id === 'mint_ringing_stone')!;
      expect(stoneStation).toBeDefined();
      expect(stoneStation.intent).toEqual({
        type: 'modal',
        modalId: 'ringing_stone',
      });
      expect(stoneStation.primaryAction).toBeDefined();
      expect(stoneStation.primaryAction?.label).toBe('Sound the Stone');
      expect(stoneStation.primaryAction?.intent).toEqual({
        type: 'custom',
        actionId: 'strike_ringing_stone',
        params: {
          stationId: 'mint_ringing_stone',
        },
      });

      // Dual intent grammar resolution
      const target: InteractiveTarget = { kind: 'station', station: stoneStation };
      const fIntent = resolveInteractionIntent(target, 'primary');
      expect(fIntent).toEqual(stoneStation.primaryAction?.intent);

      const spaceIntent = resolveInteractionIntent(target, 'inspect');
      expect(spaceIntent).toEqual(stoneStation.intent);
    });

    it('validates and parses parameters for strike_ringing_stone safely', async () => {
      const { parseRingingStoneParams } = await import('../../src/ui/appActions');

      // Valid parameters
      const valid = parseRingingStoneParams({
        stationId: 'mint_ringing_stone',
      });
      expect(valid).toEqual({
        stationId: 'mint_ringing_stone',
      });

      // Accepts undefined
      expect(parseRingingStoneParams(undefined)).toBeUndefined();

      // Rejects non-string stationId
      expect(() => parseRingingStoneParams({ stationId: 123 as any })).toThrow();
      expect(() => parseRingingStoneParams({ stationId: '' })).toThrow();

      // Rejects unexpected keys
      expect(() => parseRingingStoneParams({ unknownProp: 'xyz' } as any)).toThrow();
    });

    it('manages strike cooldown, musical scale progression, and resets in ringingStoneActions', async () => {
      const {
        executeRingingStoneStrike,
        getStoneNoteIndex,
        getLastStoneStrikeTime,
        resetRingingStoneState,
      } = await import('../../src/rooms/coins/ringingStoneActions');

      resetRingingStoneState('mint_ringing_stone');

      // First strike at t=1000
      const s1 = executeRingingStoneStrike({ stationId: 'mint_ringing_stone' }, 1000);
      expect(s1).toBe(true);
      expect(getStoneNoteIndex('mint_ringing_stone')).toBe(0);
      expect(getLastStoneStrikeTime('mint_ringing_stone')).toBe(1000);

      // Throttled strike within 90ms (t=1050)
      const s2 = executeRingingStoneStrike({ stationId: 'mint_ringing_stone' }, 1050);
      expect(s2).toBe(false);
      expect(getStoneNoteIndex('mint_ringing_stone')).toBe(0);

      // Consecutive strike at t=1150 (advances scale note)
      const s3 = executeRingingStoneStrike({ stationId: 'mint_ringing_stone' }, 1150);
      expect(s3).toBe(true);
      expect(getStoneNoteIndex('mint_ringing_stone')).toBe(1);

      // Strike after 2500ms reset interval (t=4000) resets scale back to root
      const s4 = executeRingingStoneStrike({ stationId: 'mint_ringing_stone' }, 4000);
      expect(s4).toBe(true);
      expect(getStoneNoteIndex('mint_ringing_stone')).toBe(0);

      resetRingingStoneState('mint_ringing_stone');
    });

    it('dispatches strike_ringing_stone via InteractionDispatcher', async () => {
      const { InteractionDispatcher } = await import('../../src/ui/interactionDispatcher');
      const { registerApplicationActions } = await import('../../src/ui/appActions');
      const { resetRingingStoneState, getLastStoneStrikeTime } = await import(
        '../../src/rooms/coins/ringingStoneActions'
      );

      registerApplicationActions();
      resetRingingStoneState('mint_ringing_stone');

      const dummyContext: any = { stateManager: {}, transitionToRoom: () => {} };

      InteractionDispatcher.dispatch(
        {
          type: 'custom',
          actionId: 'strike_ringing_stone',
          params: { stationId: 'mint_ringing_stone' },
        },
        dummyContext
      );

      expect(getLastStoneStrikeTime('mint_ringing_stone')).toBeGreaterThan(0);
    });

    it('verifies The Gilded Chute (Galton Chute) station declaration and dual F/Space intent resolution', async () => {
      const { v1MintConfig } = await import('../../src/rooms/coins/variants/v1_mint');
      const plinkoStation = v1MintConfig.stations.find((s) => s.id === 'plinko_drop')!;
      expect(plinkoStation).toBeDefined();
      expect(plinkoStation.intent).toEqual({
        type: 'modal',
        modalId: 'plinko_game',
      });
      expect(plinkoStation.primaryAction).toBeDefined();
      expect(plinkoStation.primaryAction?.label).toBe('Drop Sovereign');
      expect(plinkoStation.primaryAction?.intent.type).toBe('custom');
      if (plinkoStation.primaryAction?.intent.type === 'custom') {
        expect(plinkoStation.primaryAction.intent.actionId).toBe('plinko_quick_drop');
        expect(plinkoStation.primaryAction.intent.params?.stationId).toBe('plinko_drop');
        expect(typeof plinkoStation.primaryAction.intent.params?.chuteX).toBe('number');
        expect(typeof plinkoStation.primaryAction.intent.params?.chuteY).toBe('number');
      }

      // Dual intent grammar resolution
      const target: InteractiveTarget = { kind: 'station', station: plinkoStation };
      const fIntent = resolveInteractionIntent(target, 'primary');
      expect(fIntent).toEqual(plinkoStation.primaryAction?.intent);

      const spaceIntent = resolveInteractionIntent(target, 'inspect');
      expect(spaceIntent).toEqual(plinkoStation.intent);
    });

    it('validates and parses parameters for plinko_quick_drop safely', async () => {
      const { parsePlinkoQuickDropParams } = await import('../../src/ui/appActions');

      // Valid parameters
      const valid = parsePlinkoQuickDropParams({
        stationId: 'plinko_drop',
        chuteX: 250,
        chuteY: 85,
      });
      expect(valid).toEqual({
        stationId: 'plinko_drop',
        chuteX: 250,
        chuteY: 85,
      });

      // Accepts undefined
      expect(parsePlinkoQuickDropParams(undefined)).toBeUndefined();

      // Rejects non-string stationId
      expect(() => parsePlinkoQuickDropParams({ stationId: 123 as any })).toThrow();
      expect(() => parsePlinkoQuickDropParams({ stationId: '' })).toThrow();

      // Rejects non-numeric coordinates
      expect(() => parsePlinkoQuickDropParams({ chuteX: 'abc' as any })).toThrow();
      expect(() => parsePlinkoQuickDropParams({ chuteY: 'def' as any })).toThrow();

      // Rejects unexpected keys
      expect(() => parsePlinkoQuickDropParams({ unknownProp: 'xyz' } as any)).toThrow();
    });

    it('manages quick drop cooldown and active visual tokens in galtonChuteActions', async () => {
      const {
        executeGaltonQuickDrop,
        getActiveGaltonTokens,
        resetGaltonChuteState,
      } = await import('../../src/rooms/coins/galtonChuteActions');

      resetGaltonChuteState('plinko_drop');

      // First drop at t=1000
      const d1 = executeGaltonQuickDrop({ stationId: 'plinko_drop' }, 1000);
      expect(d1).toBe(true);

      const tokens = getActiveGaltonTokens(1050);
      expect(tokens.length).toBeGreaterThanOrEqual(1);
      expect(tokens[0].path.length).toBeGreaterThan(1);

      // Throttled drop within 120ms (t=1080)
      const d2 = executeGaltonQuickDrop({ stationId: 'plinko_drop' }, 1080);
      expect(d2).toBe(false);

      // Subsequent drop after cooldown (t=1200)
      const d3 = executeGaltonQuickDrop({ stationId: 'plinko_drop' }, 1200);
      expect(d3).toBe(true);

      resetGaltonChuteState('plinko_drop');
    });

    it('dispatches plinko_quick_drop via InteractionDispatcher', async () => {
      const { InteractionDispatcher } = await import('../../src/ui/interactionDispatcher');
      const { registerApplicationActions } = await import('../../src/ui/appActions');
      const { resetGaltonChuteState, getLastGaltonDropTime } = await import(
        '../../src/rooms/coins/galtonChuteActions'
      );

      registerApplicationActions();
      resetGaltonChuteState('plinko_drop');

      const dummyContext: any = { stateManager: {}, transitionToRoom: () => {} };

      InteractionDispatcher.dispatch(
        {
          type: 'custom',
          actionId: 'plinko_quick_drop',
          params: { stationId: 'plinko_drop', chuteX: 250, chuteY: 85 },
        },
        dummyContext
      );

      expect(getLastGaltonDropTime('plinko_drop')).toBeGreaterThan(0);
    });
  });
});



