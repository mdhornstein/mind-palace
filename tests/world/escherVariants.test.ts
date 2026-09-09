import { describe, it, expect, beforeEach } from 'vitest';
import {
  getActiveEscherVariantId,
  setActiveEscherVariantId,
  getActiveEscherRoomConfig,
  getAllEscherRoomConfigs,
  getEscherVariantMeta,
  getAllEscherVariantsMeta,
  onEscherVariantChange,
} from '../../src/rooms/escher/variants';
import { RoomRegistry } from '../../src/rooms/registry';
import { ESCHER_ARTWORKS } from '../../src/rooms/escher/artworks';

describe('Escher Prototype Variant System', () => {
  beforeEach(() => {
    // Reset to v2_print_gallery default
    setActiveEscherVariantId('v2_print_gallery');
  });

  it('defaults to v2_print_gallery or remembers active selection', () => {
    expect(getActiveEscherVariantId()).toBe('v2_print_gallery');
    const meta = getEscherVariantMeta('v2_print_gallery');
    expect(meta.shortName).toBe('Print Gallery');
    expect(meta.year).toBe(1956);
    expect(getAllEscherVariantsMeta().length).toBe(2);
  });

  it('switches between v1_courtyard and v2_print_gallery smoothly', () => {
    setActiveEscherVariantId('v1_courtyard');
    expect(getActiveEscherVariantId()).toBe('v1_courtyard');

    const configV1 = getActiveEscherRoomConfig();
    expect(configV1.id).toBe('escher');
    expect(configV1.stations.some((s) => s.id === 'escher_waterfall')).toBe(true);
    expect(configV1.stations.some((s) => s.id === 'escher_penrose_stairs')).toBe(true);

    setActiveEscherVariantId('v2_print_gallery');
    expect(getActiveEscherVariantId()).toBe('v2_print_gallery');

    const configV2 = getActiveEscherRoomConfig();
    expect(configV2.id).toBe('escher');
    expect(configV2.stations.some((s) => s.id === 'art_print_gallery')).toBe(true);
    expect(configV2.stations.some((s) => s.id === 'art_relativity')).toBe(true);
    expect(configV2.stations.some((s) => s.id === 'art_metamorphosis')).toBe(true);
  });

  it('RoomRegistry.getRoom("escher") dynamically reflects the active variant', () => {
    setActiveEscherVariantId('v1_courtyard');
    let room = RoomRegistry.getRoom('escher');
    expect(room.stations.some((s) => s.id === 'escher_waterfall')).toBe(true);

    setActiveEscherVariantId('v2_print_gallery');
    room = RoomRegistry.getRoom('escher');
    expect(room.stations.some((s) => s.id === 'art_print_gallery')).toBe(true);
  });

  it('triggers onEscherVariantChange listeners upon switching', () => {
    const history: Array<{ newV: string; oldV: string }> = [];
    const unsubscribe = onEscherVariantChange((newV, oldV) => {
      history.push({ newV, oldV });
    });

    setActiveEscherVariantId('v1_courtyard');
    expect(history.length).toBe(1);
    expect(history[0]).toEqual({ newV: 'v1_courtyard', oldV: 'v2_print_gallery' });

    // Calling again with the same variant should not trigger duplicate notifications
    setActiveEscherVariantId('v1_courtyard');
    expect(history.length).toBe(1);

    setActiveEscherVariantId('v2_print_gallery');
    expect(history.length).toBe(2);
    expect(history[1]).toEqual({ newV: 'v2_print_gallery', oldV: 'v1_courtyard' });

    unsubscribe();
    setActiveEscherVariantId('v1_courtyard');
    expect(history.length).toBe(2);
  });

  it('getAllEscherRoomConfigs provides both v1 and v2 with unique station and door IDs', () => {
    const all = getAllEscherRoomConfigs();
    expect(all.length).toBe(2);

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

  it('both variants define the in-world Paradox Dial station', () => {
    const all = getAllEscherRoomConfigs();
    for (const room of all) {
      const dial = room.stations.find(
        (s) => s.intent.type === 'modal' && s.intent.modalId === 'escher_variant_dial'
      );
      expect(dial, `Room ${room.id} must define an escher_variant_dial station`).toBeDefined();
    }
  });
});
