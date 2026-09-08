# Mind Palace — State Snapshot #1
**Date:** September 8, 2026  
**Milestone:** The Study, Stargazing Observatory, Chimeric Fauna, & Chiptune Audio Engine  
**Commit:** `ac94274`  
**Live Repository:** [github.com/mdhornstein/mind-palace](https://github.com/mdhornstein/mind-palace)

---

## 1. Executive Summary & Project Vision

The **Mind Palace** is an embodied, persistent digital spatial environment designed to serve as a home for ideas, memories, research simulations, and curiosity. It is built to answer the fundamental design hypothesis:

> *"Does it feel compelling to return to a small digital world that represents things I care about and quietly changes while I am away?"*

Unlike a traditional game with extrinsic quest loops, the Mind Palace is an ambient, aesthetic, and intellectual retreat. It blends retro 16-bit pixel-art aesthetics, procedural Web Audio, and physical space with authentic scientific inquiry (finite element analysis, paleontology, Keplerian celestial mechanics) and classical Renaissance mnemonic traditions (*Ars Memoriae* of Giordano Bruno and Ramon Llull).

---

## 2. World Layout & Architecture

The Mind Palace currently spans **two interconnected rooms** rendered on a 640×480 virtual canvas with pixel-perfect scaling, dynamic atmospheric lighting, and high-DPI vector DOM overlays:

```
                  ┌─────────────────────────────────────────┐
                  │         THE STUDY & WORKSHOP            │
                  │                                         │
                  │  [Library & Chair]     [Fireplace]      │
                  │  [Scholar Nook]    [Barnaby Duckephant] │
                  │  [FEA Workstation]     [Fossil Cabinet] │
                  └────────────────────┬────────────────────┘
                                       │ 
                              [Arched South Portal]
                                       │
                  ┌────────────────────┴────────────────────┐
                  │        THE STARGAZING OBSERVATORY       │
                  │                                         │
                  │       [Grand Stone Entrance Stairs]     │
                  │    [Great Refractor]    [Star Chart]    │
                  │             [Clockwork Orrery]          │
                  │             [Glass Planetarium]         │
                  └─────────────────────────────────────────┘
```

### Room 1: The Study & Curiosity Workshop
* **Flooring & Walls**: Herringbone hardwood floorboards with four wood plank variants, dark walnut wainscoting, and warm plaster masonry.
* **Atmospheric Lighting**:
  * Dual arched casement windows casting soft, cool lunar light beams onto the floorboards.
  * Central crackling stone fireplace with procedural flicker and warm radial firelight.
  * Floating ambient dust motes caught in the crossing light beams.
* **Botanical Dressing**:
  * *Monstera Deliciosa* in a glazed teal ceramic urn with gold rim trim under the left moonbeam.
  * *Victorian Boston Fern* in a neoclassical fluted brass pedestal urn beside the hearth.
  * *Cascading English Ivy* in a terracotta saucer perched atop the fossil cabinet.
* **Bidirectional Threshold**: Carved dark-slate beveled portal on the south wall with crisp pixel plaque reading `OBSERVATORY`, transporting the player down to the observatory.

### Room 2: The Stargazing Observatory
* **The Grand Glass Dome**: Transparent celestial cupola looking out into a procedural deep-space void with 65 animated twinkling stars (sine shimmering across spectral color temperatures).
* **Architecture**:
  * Circular midnight-blue flagstone arena with brass constellation quadrant rings embedded in the masonry.
  * Grand elevated stone entrance terrace (`y: 34` to `90`) with balustrades, glowing brass lanterns, and 4 wide descending stone steps.
  * North portal framed in midnight masonry inscribed with `THE STUDY ⮤`, allowing immediate return to the study.
* **Ambient Lighting**: Ethereal cosmic blue/indigo glow with soft lantern-light accents.

---

## 3. Inhabitants & Fauna

### 1. The Player (*You*)
* **Sprite**: 44px tall (~1.4 tiles, true *Stardew Valley* chibi proportions).
* **Details**: Indigo velvet coat with gold embroidery, white ascot, spectacles, styled dark hair with directional 4-way face turns, and animated leather boots.
* **Outline**: 1-pixel dark perimeter silhouette (`#090d16`) ensuring crisp separation from dark floorboards.
* **Ambient Beacon**: Subtle pulsating golden aura circle (`r = 20 + pulse`) illuminating the floor around the player's feet.
* **Movement**: Fluid delta-time 60 FPS movement supporting both Keyboard (`WASD` / `Arrows`) and Click-to-Move mouse pathing with collision avoidance.

### 2. The Scholar Companion
* **Sprite**: 42px tall, dressed in a tweed waistcoat, cravat, reading glasses, and holding an oversized crimson leather tome.
* **Stationed Nook**: Resides peacefully on the Persian rug in the reading nook next to the armchair and floor lamp.
* **Behavior**:
  * Gentle breathing squash/stretch (`Math.sin(timeMs * 0.003)`).
  * Automatically pauses reading and smoothly turns to greet the player with a contextual speech bubble upon approach (*"Checking the dome, or studying near the fire?"*).
  * Returns to scholarly reading when the player departs.

### 3. Barnaby the Duckephant (*Anas elephas chimaera*)
* **Lore**: A chimeric inhabitant inspired by Renaissance memory treatises (Bruno and Llull noted that the human mind easily forgets a duck or an elephant alone, but can never erase the mental image of an elephant that waddles and quacks).
* **Sprite**: 34×28px plump, horizontal golden duckling body with soft creamy underbelly fluff, scalloped covert wing feathers, orange webbed paddle feet, perky 3-feathered wagging tail fan, slate-gray elephant skull with floppy ears, ivory mini-tusks, blushing rosy cheeks, and an articulated curling trunk.
* **Mat**: Stationed on an enlarged woven reed hearthside pet mat (`30×15px`) with braided bronze/gold trim.
* **Autonomous Behavior**: Alternates between gentle idle breathing, cozy napping near the fire (with floating `z z Z` bubbles), and a bounded waddle with body tilt and foot strides.
* **Interactive Field Journal Modal**:
  * Live animated canvas vignette of Barnaby.
  * Victorian naturalist field notes and dietary preferences (Roasted Peanuts & Pondweed).
  * `🐾 Pet Barnaby` button: Triggers a high celebratory trunk curl, happy smiling anime eyes (`^ ^`), heart particles (`♥ ♥`), and an authentic brassy trumpet-quack.
  * `🥜 Offer Roasted Peanut` button: Triggers crunching chew sounds and an excited tail waggle.

---

## 4. Interactive Stations & Workstations

| Station | Location | Interactive Encounter | Artifacts / Mechanics |
| :--- | :--- | :--- | :--- |
| **The Library** | Study (Northwest) | **Memory Recall** (`remember`) | Floor-to-ceiling shelves. Inspecting Jerry Pallotta's *Dinosaurs* recalls authentic memories reading with children. Leaves the open book resting on the rug. |
| **Science Workstation & Blackboard** | Study (Southeast) | **Scientific Training** (`teach`) | Continuum mechanics blackboard (`∇ · σ + f = 0`). CRT monitor with phosphor scanlines. Interactive finite-element analysis (FEA) mesh convergence dialogue on a *Stegoceras validum* skull. |
| **Curio Cabinet & Pedestal** | Study (Northeast) | **Specimen Discovery** (`discover`) | Glass fossil cabinet displaying mineralized skulls (*Triceratops*, *Ankylosaurus*). Unlocks *Prenocephale brevis* with branching exploration lines and showcases it on the marble pedestal. |
| **The Duckephant Hearth** | Study (North Center) | **Chimeric Interaction** | Hearthside pet mat, petting/feeding reactions, live vignette, and Victorian field journal. |
| **The Great Refractor Telescope** | Observatory (West) | **Astronomical Observation** | Brass-and-steel astronomical refractor with counterweights and altitude gears. Inspecting opens skyward observation coordinates. |
| **Keplerian Clockwork Orrery** | Observatory (South) | **Cosmic Mechanics** | Interlocking geared brass armillary spheres with miniature orbital gemstones tracking planetary alignments. |
| **Star Chart Drafting Desk** | Observatory (East) | **Cartography** | Drafting table with celestial projection maps, compass calipers, and astrolabe notes. |

---

## 5. Technical Architecture & Subsystems

### 1. Multi-Room Procedural Web Audio Engine (`src/sound/audio.ts`)
Zero audio file dependencies. All soundscapes and music are synthesized in real-time via the browser's native `AudioContext`:
* **The Study — *Hearthside Chiptune***:
  * 68 BPM cozy major progression (`Cmaj7 - Am7 - Fmaj7 - G6`).
  * Warm pulse-wave lead with gentle 4.5Hz vibrato, walking triangle bass, music-box broken chord arpeggios, and a vintage 1750 Hz lowpass filter.
* **The Observatory — *Starlight Chiptune***:
  * 50 BPM celestial Lydian/Dorian progression (`Em9 - Cmaj7#11 - Dadd9 - Bm7`).
  * Soaring crystalline pulse lead with slow attack, deep resonant sub-bass triangle drones (E2, C2, D2, B1), and 5th/6th-octave rippling sine bell sparkles.
* **Smooth Room Crossfading**: Moving between rooms dynamically dips master gain, ramps filter cutoffs, switches melodic patterns, and restores volume over 500ms without clicks or pops.
* **Procedural Sound Effects**: Dual-oscillator trumpet-quack (sawtooth + formant chirp), peanut munching crunch, interaction clicks, and footstep audio.

### 2. Rendering Pipeline & Visual Quality (`src/render/`)
* **Dual-Layer Rendering**:
  1. *Canvas Layer (640×480)*: Scaled with `image-rendering: pixelated;` for crisp retro sprites, tile maps, and lighting effects.
  2. *DOM Layer (Native DPI)*: High-DPI obsidian glassmorphism vector overlays for interaction prompts (`#interaction-prompt`) and companion speech bubbles (`#companion-speech-bubble`), eliminating blurry text on Retina displays.
* **Solid Bitmap Font (`FONT_3X5`)**: Zero anti-aliasing pixel font for blackboard equations, CRT monitors, and carved stone doorway plaques.
* **Isometric 2.5D Depth Sorting**: Players, companions, the duckephant, and floor props (Monstera, Boston Fern) are sorted dynamically by Y-coordinate on every frame (`renderables.sort((a, b) => a.y - b.y)`).

### 3. Persistence & Time Evolution (`src/core/state.ts`)
* **State Schema**: `WorldState` stored in `localStorage` under `mind_palace_world_state_v1`.
* **Offline Catchup (`elapsedAwaySeconds`)**: Evaluates real elapsed time while the user is away:
  * FEA simulations advance and finish in the background.
  * Completed specimens automatically move to the display pedestal.
  * Companion positions and chalkboard notes update.
* **Dev Time-Machine Tray (`~` or `Shift + D`)**: Allows advancing time by `+1h`, `+12h`, `+1d`, `+1w`, instant simulation completion, and state reset.

---

## 6. Directory Structure at Snapshot

```
mind-palace/
├── index.html                   # Mount point, canvas, and high-DPI DOM UI overlays
├── package.json                 # Vite + TypeScript configuration
├── docs/
│   ├── design_notes.md          # Creative roadmap, ideas, philosophical foundations
│   └── snapshots/               # Periodic architectural state snapshots
│       └── 2026-09-08_snapshot_01_study_and_observatory.md
└── src/
    ├── main.ts                  # Engine loop, input handling, and initialization
    ├── core/
    │   ├── constants.ts         # Screen dimensions, tile sizes, speed constants
    │   ├── state.ts             # WorldState management and localStorage persistence
    │   └── types.ts             # TypeScript domain interfaces (RoomConfig, Stations, Props)
    ├── entities/
    │   └── duckephant.ts        # Barnaby entity, state machine, waddle, and sprite renderer
    ├── render/
    │   ├── roomRenderer.ts      # Double-buffered room rendering and Y-depth sorting
    │   └── sprites.ts           # Handcrafted pixel art routines (characters, furniture, plants)
    ├── rooms/
    │   ├── registry.ts          # Central room registry
    │   ├── study/               # The Study room definition & 6 interactive stations
    │   └── observatory/         # The Observatory room definition & 3 interactive stations
    ├── sound/
    │   └── audio.ts             # Procedural Web Audio chiptune synthesizer and sound effects
    └── ui/                      # Modals (Library, Workshop, Cabinet, Pedestal, Duckephant)
```

---

## 7. Future Horizons & Next Evolutions

Ideas slated in [`docs/design_notes.md`](file:///Users/michael/Library/CloudStorage/GoogleDrive-mdhornstein@gmail.com/My%20Drive/AA%20Projects/mind-palace/docs/design_notes.md):
1. **Bestiary & Genetic Engineering Bay**: Expanding from Barnaby to a full menagerie of chimeric fauna with breeding, habitations, and dietary requirements.
2. **Natural History & Skeleton Hall**: Full articulated skeletons (Ankylosaurus, Triceratops) assembled over time.
3. **M.C. Escher Room**: Non-Euclidean geometry, gravity-defying staircases, and nested looping architecture.
4. **Automatons**: Craftable steampunk desktop automatons (e.g. cleaning robots, clockwork scribes).
5. **Living Books**: Books in the library that unlock secret rooms or grant subtle abilities in the world.
