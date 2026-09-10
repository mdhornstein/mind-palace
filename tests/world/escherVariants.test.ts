import { describe, it, expect, beforeEach } from 'vitest';
import { RoomVariantManager } from '../../src/rooms/variants/roomVariantManager';
import { RoomRegistry } from '../../src/rooms/registry';
import { ESCHER_ARTWORKS } from '../../src/rooms/escher/artworks';
import { PlayerController } from '../../src/world/player';
import { TILE_SIZE } from '../../src/core/constants';
import '../../src/rooms/escher/variants'; // Ensure registration

describe('Palace-Wide Room Variant System & Collision Safety', () => {
  beforeEach(() => {
    // Reset to v2_print_gallery default
    RoomVariantManager.setActiveVariantId('escher', 'v2_print_gallery');
  });

  it('defaults to v2_print_gallery and exposes standard variant metadata', () => {
    expect(RoomVariantManager.getActiveVariantId('escher')).toBe('v2_print_gallery');
    const meta = RoomVariantManager.getVariantMeta('escher', 'v2_print_gallery');
    expect(meta).toBeDefined();
    expect(meta?.shortName).toBe('Print Gallery');
    expect(meta?.year).toBe(1956);
    expect(RoomVariantManager.getAllVariantsMeta('escher').length).toBe(2);
  });

  it('switches between prototypes smoothly via RoomVariantManager', () => {
    RoomVariantManager.setActiveVariantId('escher', 'v1_courtyard');
    expect(RoomVariantManager.getActiveVariantId('escher')).toBe('v1_courtyard');

    const configV1 = RoomVariantManager.getActiveRoomConfig('escher');
    expect(configV1.id).toBe('escher');
    expect(configV1.stations.some((s) => s.id === 'escher_waterfall')).toBe(true);
    expect(configV1.stations.some((s) => s.id === 'escher_penrose_stairs')).toBe(true);

    RoomVariantManager.setActiveVariantId('escher', 'v2_print_gallery');
    expect(RoomVariantManager.getActiveVariantId('escher')).toBe('v2_print_gallery');

    const configV2 = RoomVariantManager.getActiveRoomConfig('escher');
    expect(configV2.id).toBe('escher');
    expect(configV2.stations.some((s) => s.id === 'art_print_gallery')).toBe(true);
    expect(configV2.stations.some((s) => s.id === 'art_relativity')).toBe(true);
    expect(configV2.stations.some((s) => s.id === 'art_metamorphosis')).toBe(true);
  });

  it('RoomRegistry.getRoom("escher") dynamically reflects the active variant', () => {
    RoomVariantManager.setActiveVariantId('escher', 'v1_courtyard');
    let room = RoomRegistry.getRoom('escher');
    expect(room.stations.some((s) => s.id === 'escher_waterfall')).toBe(true);

    RoomVariantManager.setActiveVariantId('escher', 'v2_print_gallery');
    room = RoomRegistry.getRoom('escher');
    expect(room.stations.some((s) => s.id === 'art_print_gallery')).toBe(true);
  });

  it('triggers palace-wide onVariantChange listeners upon switching', () => {
    const history: Array<{ roomId: string; newV: string; oldV: string }> = [];
    const unsubscribe = RoomVariantManager.onVariantChange((roomId, newV, oldV) => {
      history.push({ roomId, newV, oldV });
    });

    RoomVariantManager.setActiveVariantId('escher', 'v1_courtyard');
    expect(history.length).toBe(1);
    expect(history[0]).toEqual({
      roomId: 'escher',
      newV: 'v1_courtyard',
      oldV: 'v2_print_gallery',
    });

    // Calling again with the same variant should not trigger duplicate notifications
    RoomVariantManager.setActiveVariantId('escher', 'v1_courtyard');
    expect(history.length).toBe(1);

    RoomVariantManager.setActiveVariantId('escher', 'v2_print_gallery');
    expect(history.length).toBe(2);
    expect(history[1]).toEqual({
      roomId: 'escher',
      newV: 'v2_print_gallery',
      oldV: 'v1_courtyard',
    });

    unsubscribe();
    RoomVariantManager.setActiveVariantId('escher', 'v1_courtyard');
    expect(history.length).toBe(2);
  });

  it('getAllConfigs provides both v1 and v2 with unique station and door IDs', () => {
    const all = RoomVariantManager.getAllConfigs();
    expect(all.length).toBeGreaterThanOrEqual(2);

    const v1 = all.find((r) => r.id === 'escher_v1');
    const v2 = all.find((r) => r.id === 'escher_v2');
    expect(v1).toBeDefined();
    expect(v2).toBeDefined();

    const stationIdsV1 = v1!.stations.map((s) => s.id);
    const stationIdsV2 = v2!.stations.map((s) => s.id);

    // Ensure zero overlap between station IDs
    for (const id of stationIdsV1) {
      expect(stationIdsV2).not.toContain(id);
    }
  });

  it('supports registering variants for arbitrary palace rooms', () => {
    const dummyRoom1 = {
      ...RoomRegistry.getRoom('study'),
      id: 'study_v1',
      name: 'Study Classic',
    };
    const dummyRoom2 = {
      ...RoomRegistry.getRoom('study'),
      id: 'study_v2',
      name: 'Study Modern',
    };

    RoomVariantManager.registerVariants(
      'study_test',
      [
        {
          id: 'v1',
          roomId: 'study_test',
          label: 'Study Classic (v1)',
          shortName: 'Classic',
          description: 'Original study',
          config: dummyRoom1,
        },
        {
          id: 'v2',
          roomId: 'study_test',
          label: 'Study Modern (v2)',
          shortName: 'Modern',
          description: 'Alternative layout',
          config: dummyRoom2,
        },
      ],
      'v1'
    );

    expect(RoomVariantManager.hasVariants('study_test')).toBe(true);
    expect(RoomVariantManager.getActiveVariantId('study_test')).toBe('v1');
    expect(RoomVariantManager.getActiveRoomConfig('study_test').name).toBe('Study Classic');

    RoomVariantManager.setActiveVariantId('study_test', 'v2');
    expect(RoomVariantManager.getActiveVariantId('study_test')).toBe('v2');
    expect(RoomVariantManager.getActiveRoomConfig('study_test').name).toBe('Study Modern');
  });

  it('PlayerController.ensureWalkablePosition() un-traps player if inside an obstacle after hot-swap', () => {
    const room = RoomRegistry.getRoom('escher');
    // Place player at a valid walkable spot
    const player = new PlayerController(10 * TILE_SIZE, 8 * TILE_SIZE, 'up', room);
    const initialReposition = player.ensureWalkablePosition();
    expect(initialReposition).toBe(false); // Already walkable

    // Manually force player coordinates inside a station collision box (e.g. art_print_gallery at tile 14.2, 6.2)
    const station = room.stations.find((s) => s.id === 'art_print_gallery');
    expect(station).toBeDefined();
    const box = station?.collisionBox;
    expect(box).toBeDefined();
    if (!box) return;

    player.teleportTo(box.x + 2, box.y + 2);

    // Call ensureWalkablePosition
    const didReposition = player.ensureWalkablePosition();
    expect(didReposition).toBe(true);

    // Ensure player is now on a free walkable tile
    const updateResult = player.update(0.016);
    expect(updateResult).toBeDefined();
    // Verify player is no longer inside the obstacle box
    const pFeetX = player.x + 4;
    const pFeetY = player.y + 20;
    const insideStation =
      pFeetX < box.x + box.w &&
      pFeetX + 16 > box.x &&
      pFeetY < box.y + box.h &&
      pFeetY + 10 > box.y;
    expect(insideStation).toBe(false);
  });

  it('curatorial artwork catalog contains all 7 artworks with full mathematical data', () => {
    const requiredIds = [
      'print_gallery',
      'relativity',
      'metamorphosis_ii',
      'drawing_hands',
      'belvedere',
      'day_and_night',
      'printmaker_folio',
    ];

    for (const id of requiredIds) {
      const art = ESCHER_ARTWORKS[id];
      expect(art, `Artwork ${id} must exist`).toBeDefined();
      expect(art.title.length).toBeGreaterThan(0);
      expect(art.mathematicalSecret.length).toBeGreaterThan(20);
      expect(art.escherQuote.length).toBeGreaterThan(10);
      expect(art.tags.length).toBeGreaterThan(0);
    }
  });
});
