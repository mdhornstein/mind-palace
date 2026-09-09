# Handover Document: M.C. Escher Chamber & Multi-Variant System

**Date:** September 9, 2026  
**Scope:** M.C. Escher Chamber (Room 3), Multi-Variant Prototype Architecture, and Variant 2 (*Print Gallery*)  
**Status:** Complete, fully tested (102/102 tests passing), and deployed to `main` ([commit 1243f5c](https://github.com/mdhornstein/mind-palace/commit/1243f5c)).

---

## 1. Executive Summary

This milestone achieved two primary goals requested by the user:

1. **Copy-Pasteable Modal Text:** Enabled text selection across modal windows (`user-select: text` for dialog bodies, headers, paragraphs, lists, blockquotes, and code), while retaining crisp `user-select: none; cursor: pointer;` click interactions for all buttons and interactive tabs.
2. **Multi-Variant Prototype System & *Print Gallery* (v2):** Created an extensible architectural system to build and test multiple prototype variants of the Escher chamber side-by-side without needing to revert or branch code. The original **Paradox Courtyard** is preserved as `v1_courtyard`, while a living, spatial recreation of M.C. Escher’s ***Print Gallery*** (*Prentententoonstelling*, 1956) was implemented alongside it as `v2_print_gallery`.
3. **Dual Switching Controls:** Players can switch between variants in real-time either via a sleek floating HUD pill (`🌀 Escher: Print Gallery ▾` / `Courtyard ▾`) or via an in-world walnut & brass **Chrono-Spatial Dial** pedestal station located near the Study portal.
4. **Persistent Preference:** Selected variant choice is saved to `localStorage` (`mind_palace_escher_variant`), so refreshing the page automatically loads the user's chosen prototype.

---

## 2. File Architecture & Key Changes

```
mind-palace/
├── src/
│   ├── core/
│   │   └── types.ts                    # Added 'escher_artwork' and 'escher_variant_dial' to ModalId union
│   ├── rooms/
│   │   ├── registry.ts                 # Registers concrete variants (escher_v1, escher_v2); maps 'escher' dynamically
│   │   └── escher/
│   │       ├── artworks.ts             # [NEW] Curatorial metadata catalog for 7 masterworks
│   │       ├── variants.ts             # [NEW] Variant Manager (state, storage, event dispatcher)
│   │       ├── escherRoom.ts           # Proxy for active room config, re-exports variant helpers
│   │       └── variants/
│   │           ├── v1_courtyard.ts     # [NEW] Preserved original Paradox Courtyard
│   │           └── v2_print_gallery.ts # [NEW] Living Print Gallery room configuration
│   ├── render/
│   │   └── printGallerySprites.ts      # [NEW] Pure rendering: living lithograph, observer, framed art, dial
│   ├── ui/
│   │   ├── devTray.ts                  # Added floating top-right HUD prototype switcher pill
│   │   ├── escherArtModal.ts           # [NEW] Curatorial artwork viewer modal & dial switcher dialog
│   │   ├── interactionDispatcher.ts    # Registered modal handlers with parameter validation
│   │   └── styles.css                  # Enabled modal text copy-pasteability
│   └── main.ts                         # Subscribed to onEscherVariantChange for live in-game hot-swapping
├── tests/
│   └── world/
│       └── escherVariants.test.ts      # [NEW] 7 unit tests for variant manager & artwork catalog
└── docs/
    └── escher_room_handover.md         # [NEW] This handover document
```

---

## 3. Prototype 1: The Paradox Courtyard (`v1_courtyard`)

* **Theme:** An abstract, open courtyard showcasing Escher’s famous geometric and hydrodynamic paradoxes.
* **Floor & Lighting:** Continuous animated periodic tessellation dividing the plane into interlocking black and white lizard tiles, lit by cool night starlight.
* **Stations:**
  1. `escher_waterfall`: *The Perpetual Waterfall (1961)* — Closed-circuit hydraulic flume and overshot waterwheel.
  2. `escher_drawing_hands`: *The Lithographer's Drafting Desk (1948)* — Self-drawing hands exploring strange loops.
  3. `escher_mobius`: *The Möbius Terrarium (1963)* — Clockwork bronze ants walking continuously on a single-sided surface.
  4. `escher_penrose_stairs`: *The Penrose Endless Staircase* — Central stepped monument with ascending/descending pilgrims.
  5. `escher_v1_variant_dial`: In-world Chrono-Spatial Dial station near the Study doorway.

---

## 4. Prototype 2: The Print Gallery (`v2_print_gallery`)

### 4.1 Spatial Environment & Architecture
Inspired by Escher's 1956 lithograph *Prentententoonstelling*, the entire room is rendered as the living paradoxical architecture of the artwork:

* **The Lower-Right & East Perimeter (The Exhibition Arcade):**
  * Warm oak parquet floorboards with timber grain seams.
  * Classical limestone colonnade pillars with Corinthian capitals.
  * Clerestory windows letting in diffuse Mediterranean skylight.
  * Freestanding oak printmaker's folio browser rack.
* **The West & North Perimeter (The Mediterranean Harbor Town):**
  * Smooth floor transition from parquet into sun-washed Mediterranean cobblestone paving.
  * Massive granite quay wall bordering the deep harbor water basin.
  * Arched stone bridge spanning over the harbor sea.
  * Townhouse facades with terracotta tile rooftops and green wooden shutters.
* **The Top Perimeter (Roof Morphs into Gallery):**
  * Townhouse rooftops slant upwards and continuously curve into the vaulted timber rafters and clerestory arches of the gallery hall itself.
* **The Center (The Singularity Medallion):**
  * A circular white Carrara marble medallion with concentric logarithmic spiral grooves and the engraved `MCE` monogram seal, representing the central void where inside and outside fold together.

### 4.2 Dynamic Inhabitants
* **The Young Connoisseur (`drawYoungObserver`):**
  * A curly-haired observer in a long charcoal tweed frock coat standing in the exhibition arcade with hands clasped behind his back, gazing at *Print Gallery* on the wall.
  * Registered via `getEntities()` for automatic Y-sorted depth compositing with the player.

### 4.3 Interactive Curatorial Stations
The room features 7 interactive masterworks hanging on the gallery walls and on studio display stands:

| Station ID | Title | Year | Medium / Focus | Location |
| :--- | :--- | :--- | :--- | :--- |
| `art_print_gallery` | *Print Gallery* | 1956 | Conformal logarithmic spiral Riemann surface | East arcade wall (observed by young man) |
| `art_relativity` | *Relativity* | 1953 | Three orthogonal Cartesian gravitational fields | North gallery wall |
| `art_metamorphosis` | *Metamorphosis II* | 1940 | Continuous topological deformations & Atrani | North waterfront facade (panoramic) |
| `art_drawing_hands` | *Drawing Hands* | 1948 | Mutual causation and tangled hierarchy | Southwest quayside wall |
| `art_belvedere` | *Belvedere* | 1958 | The impossible Necker cube & open pavilion | Northwest harbor promontory |
| `art_day_and_night` | *Day and Night* | 1938 | Gestalt figure-ground reversal & antisymmetry | South arcade wall |
| `printmaker_folio` | *The Printmaker's Folio Rack* | 1956 | Studio proof pulls & Coxeter grid studies | Southeast arcade floor |
| `escher_v2_variant_dial`| *The Chrono-Spatial Dial* | — | Pedestal mechanism to shift room prototypes | East wall beside Study doorway |

### 4.4 Museum-Grade Art Viewer Modal (`src/ui/escherArtModal.ts`)
Interacting with any painting opens a museum curatorial plaque:
* **Framed Masterwork Preview:** High-contrast stylized miniature rendering with brass picture lamp casting a warm downward illumination cone.
* **Interactive "Curator's Loupe":** Toggle button enabling a circular magnifying loupe with coordinate crosshair.
* **Physical Plaque:** Full title, Dutch title, year, medium, dimensions, and Locher/Bool catalog numbers.
* **Curatorial Analysis:** Art historical critique and contextual narrative.
* **Mathematical & Topological Structure:** Technical analysis of the mathematics (e.g. the 2003 Hendrik Lenstra & Bart de Smit Leiden University proof decoding the central singularity).
* **Escher's Own Words:** Verbatim historical quotes from Escher’s letters and journals.
* **Copy-Pasteable Text:** All curatorial text is fully selectable with standard mouse selection and clipboard copy.

---

## 5. How Variant Switching Works

### 5.1 Storage & Event Flow
1. **User Action:** Player clicks the top-right HUD pill (`🌀 Escher: Print Gallery ▾`) or interacts with the in-world dial station.
2. **Modal Opens:** `openEscherVariantDialModal()` presents cards for all registered variants.
3. **Switch Triggered:** Clicking a card calls `setActiveEscherVariantId(id)`.
4. **Persistence:** `localStorage.setItem('mind_palace_escher_variant', id)`.
5. **Event Published:** `onEscherVariantChange` broadcasts `(newVariantId, oldVariantId)` to all listeners.
6. **HUD Updates:** `DevTray` re-renders its pill label immediately.
7. **Runtime Room Hot-Swap:** If the player is currently inside the Escher room, `MindPalaceApp` in `src/main.ts` intercepts the event and executes:
   ```typescript
   this.currentRoom = RoomRegistry.getRoom('escher');
   this.player.setRoom(this.currentRoom);
   this.activeTarget = null;
   this.pendingTarget = null;
   this.hudManager.clear();
   ```
   The room updates instantly on screen without a reload, keeping the player at their current world coordinates.

### 5.2 How to Add Future Variants (v3, v4, etc.)
The system is built to scale cleanly as new prototypes are designed:
1. Create `src/rooms/escher/variants/v3_my_variant.ts` conforming to `RoomConfig` with `id: 'escher_v3'`.
2. Add `'v3_my_variant'` to the `EscherVariantId` union in `src/rooms/escher/variants.ts`.
3. Add metadata to `ESCHER_VARIANTS_META` in `src/rooms/escher/variants.ts`.
4. Add the config to `getAllEscherRoomConfigs()` in `src/rooms/escher/variants.ts`.
5. Both the HUD pill and the in-world Chrono-Spatial Dial will automatically display the new option!

---

## 6. Architectural Invariants Upheld

During implementation, all clean architectural boundaries established in Phases 1–3 were strictly maintained:

1. **No UI Imports in Room Definitions:**
   `src/rooms/**` contains zero imports from `src/ui/**`. Stations express user interaction purely via declarative `intent: { type: 'modal', modalId: 'escher_artwork', params: { artworkId: '...' } }`. Tested and enforced by `tests/world/rooms.test.ts`.
2. **No Room Imports in Renderer:**
   `src/render/printGallerySprites.ts` contains zero imports from `src/rooms/**`. It receives only primitive coordinates, contexts, and canvas timestamps. Tested and enforced by `tests/render/renderer.test.ts`.
3. **Modal Registry Completeness & Zero Orphaned Handlers:**
   Every modal ID referenced by any station across all registered rooms in `RoomRegistry.getAllRooms()` has a registered handler in `InteractionDispatcher`. Conversely, every registered handler is referenced by at least one station in the palace.
4. **Parameter Contract Validation:**
   `InteractionDispatcher` enforces strict parameter schemas (`allowedKeys = ['artworkId']`) and throws descriptive errors if invalid keys or values are passed.

---

## 7. Verification & Test Summary

* **Automated Vitest Suite:**
  ```bash
  npm test
  ```
  **102 tests passed across 8 test suites:**
  - `tests/core/gameLoop.test.ts` (8 tests)
  - `tests/core/simulation.test.ts` (6 tests)
  - `tests/ui/hudManager.test.ts` (10 tests)
  - `tests/core/state.test.ts` (13 tests)
  - `tests/world/interaction.test.ts` (40 tests)
  - `tests/world/escherVariants.test.ts` (7 tests)
  - `tests/render/renderer.test.ts` (4 tests)
  - `tests/world/rooms.test.ts` (14 tests)

* **Production TypeScript & Vite Build:**
  ```bash
  npm run build
  ```
  Completed with 0 errors and 0 warnings.
