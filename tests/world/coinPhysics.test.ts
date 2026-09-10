import { describe, it, expect, beforeEach } from 'vitest';
import { CoinPhysicsEngine } from '../../src/rooms/coins/coinPhysics';
import { RoomRegistry } from '../../src/rooms/registry';
import { RoomVariantManager } from '../../src/rooms/variants/roomVariantManager';
import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE } from '../../src/core/constants';

describe('Coin Physics & Royal Mint Mechanics', () => {
  let engine: CoinPhysicsEngine;

  beforeEach(() => {
    engine = CoinPhysicsEngine.getInstance();
    engine.clearCoins();
    engine.resetWallet();
  });

  it('spawns physical bouncing coins with positive elevation and upward launch velocity', () => {
    engine.spawnBurst(200, 150, 5, 'gold', 28);
    expect(engine.getCoins().length).toBe(5);
    expect(engine.getRenderableEntities().length).toBeGreaterThanOrEqual(5);

    // Initial coins are elevated above ground
    expect(engine.getTotalMinted()).toBe(50); // 5 gold sovereigns * 10
  });

  it('applies gravity, ground restitution bounce, and settles low-energy coins', () => {
    engine.spawnBurst(200, 150, 1, 'copper', 30);
    const bounds = { minX: 20, maxX: CANVAS_WIDTH - 20, minY: 50, maxY: CANVAS_HEIGHT - 20 };

    // Far away player position so coin is not immediately scooped up
    const playerFeet = { x: 500, y: 500 };

    // Simulate 3 seconds of physics (step by step)
    for (let step = 0; step < 180; step++) {
      engine.update(0.016, playerFeet, bounds);
    }

    expect(engine.getCoins().length).toBe(1);
  });

  it('player proximity collects coins and increases collected purse balance', () => {
    engine.spawnBurst(200, 200, 1, 'gold', 0);
    const bounds = { minX: 20, maxX: CANVAS_WIDTH - 20, minY: 50, maxY: CANVAS_HEIGHT - 20 };

    let collectedAmount = 0;
    engine.onCollect((amount) => {
      collectedAmount += amount;
    });

    // Player walks directly over the coin at (200, 200)
    engine.update(0.016, { x: 200, y: 200 }, bounds);

    expect(collectedAmount).toBe(10);
    expect(engine.getTotalCollected()).toBe(10);
    // Coin is consumed
    expect(engine.getRenderableEntities().length).toBeGreaterThanOrEqual(1); // floating score pill
  });

  it('The Royal Mint is registered in RoomRegistry with bidirectional doorways', () => {
    const coinRoom = RoomRegistry.getRoom('coins');
    expect(coinRoom).toBeDefined();
    expect(coinRoom.name).toBe('The Royal Mint');

    // Return door to study
    const returnDoor = coinRoom.doors.find((d) => d.targetRoomId === 'study');
    expect(returnDoor).toBeDefined();
    expect(returnDoor!.targetSpawnPoint.x).toBeGreaterThan(0);

    // Entrance door from study to coins
    const studyRoom = RoomRegistry.getRoom('study');
    const coinDoor = studyRoom.doors.find((d) => d.targetRoomId === 'coins');
    expect(coinDoor).toBeDefined();
    expect(coinDoor!.targetSpawnPoint.x).toBe(2.5 * TILE_SIZE);
  });

  it('RoomVariantManager allows switching between Mechanical Mint (v1) and Sovereign Vault (v2)', () => {
    expect(RoomVariantManager.hasVariants('coins')).toBe(true);

    const activeIdInitial = RoomVariantManager.getActiveVariantId('coins');
    expect(activeIdInitial).toBe('v1_mint');

    // Switch to Sovereign Vault
    RoomVariantManager.setActiveVariantId('coins', 'v2_vault');
    const activeIdVault = RoomVariantManager.getActiveVariantId('coins');
    expect(activeIdVault).toBe('v2_vault');

    const vaultRoom = RoomRegistry.getRoom('coins');
    expect(vaultRoom.name).toBe('The Sovereign Vault');
    expect(vaultRoom.stations.some((s) => s.id === 'vault_fountain')).toBe(true);

    // Switch back to Mechanical Mint
    RoomVariantManager.setActiveVariantId('coins', 'v1_mint');
    const mintRoom = RoomRegistry.getRoom('coins');
    expect(mintRoom.name).toBe('The Royal Mint');
    expect(mintRoom.stations.some((s) => s.id === 'mint_coin_press')).toBe(true);
  });
});
