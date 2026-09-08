# Mind Palace

A persistent, embodied digital spatial environment designed as a personal retreat for memory, research, scientific curiosity, and ideas.

> *"Does it feel compelling to return to a small digital world that represents things I care about and quietly changes while I am away?"*

Built with pure TypeScript, HTML5 Canvas, and the native Web Audio API — featuring zero external runtime engine or binary font dependencies.

---

## The World & Architecture

The Mind Palace currently features two interconnected spatial environments connected by seamless bidirectional architectural portals:

### 1. The Study & Curiosity Workshop
* **Floors & Wainscoting**: Herringbone hardwood floorboards, walnut wainscoting, and warm plaster masonry.
* **Atmospheric Lighting**: Dual arched mullioned windows casting cool lunar light shafts, a crackling stone fireplace with animated flame glow, and floating ambient dust motes.
* **Victorian Botanicals**: Potted *Monstera Deliciosa* in glazed teal ceramic under the left moonbeam, feathery *Boston Fern* in a fluted brass pedestal urn beside the hearth, and cascading *English Ivy* draping over the curio cabinet.
* **The Library**: Floor-to-ceiling bookshelf with interactive memory recall (*"Jerry Pallotta's Dinosaurs"*, D'Arcy Thompson's *On Growth and Form*), wingback armchair, and tea table. Recalling memories leaves the open book resting on the Persian rug.
* **The Science Workstation**: Heavy oak desk, CRT terminal with phosphor scanlines, wall chalkboard with continuum mechanics equations (`∇ · σ + f = 0`), and an interactive *Stegoceras validum* skull running finite element analysis (FEA) mesh convergence simulations.
* **Curio Cabinet & Pedestal**: Glass shelves displaying mineralized dinosaur fossils, with an active display pedestal showcasing newly analyzed specimens upon return visits.

### 2. The Stargazing Observatory
* **The Grand Glass Dome**: Transparent celestial cupola looking out into a procedural deep-space void with 65 animated, twinkling stars shimmering across spectral color temperatures.
* **Classical Architecture**: Raised midnight stone terrace with balustrades, glowing brass lanterns, and 4 wide stone steps descending into a circular flagstone arena with brass constellation quadrant rings.
* **The Great Refractor Telescope**: Brass-and-steel astronomical refractor with counterweights and altitude gears for stargazing.
* **Keplerian Clockwork Orrery**: Interlocking geared brass armillary spheres with miniature orbital gemstones tracking celestial bodies.
* **Star Chart Drafting Desk**: Astronomy cartography table with celestial projection maps, calipers, and astrolabe notes.
* **North Portal Threshold**: Arched stone doorway inscribed with `THE STUDY ⮤`, allowing immediate return to the study.

---

## Inhabitants & Chimeric Fauna

* **The Player**: 44px tall chibi character (~1.4 tiles tall, *Stardew Valley* scale) in an indigo velvet coat with gold embroidery, spectacles, animated leather boots, a 1px dark silhouette outline, and an ambient golden beacon ring. Supports fluid 60 FPS keyboard (`WASD`/arrows) and click-to-move pathing.
* **The Scholar Companion**: 42px tall scholar stationed at the library rug in a tweed waistcoat, spectacles, and holding an oversized crimson leather tome. Gently breathes, pauses reading, and smoothly turns to greet the player with contextual speech bubbles upon approach.
* **Barnaby the Duckephant (*Anas elephas chimaera*)**: A chimeric companion pet inspired by the Renaissance *Ars Memoriae* (Giordano Bruno / Ramon Llull). Features a plump golden duck body with a creamy downy belly, webbed paddle feet, perky wagging tail fan, scalloped wings, gray elephant skull with floppy ears, ivory mini-tusks, blushing rosy cheeks, and an articulated curling trunk. Stationed on a woven reed hearth mat.
  * **Interactive Field Journal**: Walk up to Barnaby to open his Victorian field journal with a live animated vignette.
  * **Interactive Reactions**: Pet Barnaby to hear his custom brassy trumpet-quack, see his happy smiling anime eyes (`^ ^`), and watch floating pixel hearts; offer roasted peanuts to hear him crunch and waddle happily!

---

## Procedural Multi-Room Web Audio

Zero audio assets or audio files are downloaded. The entire soundscape is synthesized in real-time using the browser's native `AudioContext`:

* **Study Soundtrack (*Hearthside Chiptune*)**: 68 BPM cozy major progression (`Cmaj7 - Am7 - Fmaj7 - G6`), warm pulse lead with 4.5Hz vibrato, walking triangle bassline, broken-chord music box arpeggios, and a warm 1750 Hz lowpass filter.
* **Observatory Soundtrack (*Starlight Chiptune*)**: 50 BPM cosmic Lydian/Dorian progression (`Em9 - Cmaj7#11 - Dadd9 - Bm7`), soaring crystalline pulse lead, resonant sub-bass triangle drones (E2, C2, D2, B1), and rippling high-register sine bell sparkles.
* **Smooth Room Crossfading**: Crossing between the Study and the Observatory dynamically dips volume, shifts harmonic modes and tempo, ramps filter cutoffs, and fades in the new theme over 500ms without clicks or pops.
* **Procedural Sound FX**: Dual-oscillator trumpet-quack, peanut munching crunch, footstep taps, and interaction cues.
* **HUD Audio Toggle**: Dynamic top-right button displaying audio state (`🎶 8-Bit Music: Study` / `Observatory` / `Muted`).

---

## Visual Design & Legibility Standards

* **Stardew Valley-Scale Proportions**: Entities scaled to 1.4× tile height with 1-pixel dark perimeter outlines (`#090d16` / `#170c06`) to ensure razor-sharp legibility against dark floorboards.
* **High-DPI Vector DOM Overlays**: All interactive prompts (`#interaction-prompt`) and speech bubbles (`#companion-speech-bubble`) are rendered in native DOM space with obsidian glassmorphism, eliminating blurry text on Retina and high-resolution displays.
* **Solid Bitmap Font**: Blackboard math, CRT telemetry, and carved doorway plaques use a handcrafted 3×5 bitmap glyph engine with zero anti-aliasing.
* **Isometric 2.5D Depth Sorting**: Characters, companions, pets, and floor botanicals dynamically sort by Y-coordinate for natural occlusion.

---

## Persistence & The Time-Machine

* **First-Class WorldState**: Automatically serialized to `localStorage` (`mind_palace_world_state_v1`).
* **Offline Evolution**: Tracks real elapsed time while you are away (`elapsedAwaySeconds`):
  * Active FEA simulations advance and complete while offline.
  * Finished specimens move to the curio display pedestal.
  * Recalled books remain resting open on the reading rug.
* **Dev Time-Warp Toolbar**: Press **`~` (backtick)** or **`Shift + D`** (or click the top-right `⏱ Time Warp` button) to:
  * Advance time by `+1 Hour`, `+12 Hours`, `+1 Day`, or `+1 Week`.
  * Trigger immediate completion of running FEA simulations.
  * Reset world state back to seed defaults.
  * Inspect raw `WorldState` JSON in the developer console.

---

## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Installation & Local Run
```bash
# 1. Clone the repository
git clone https://github.com/mdhornstein/mind-palace.git
cd mind-palace

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open http://localhost:5173/ in your browser
```

### Build for Production
```bash
npm run build
```

---

## Controls

| Action | Control |
| :--- | :--- |
| **Move** | `W, A, S, D` or `Arrow Keys` (or **Click anywhere** on the floor to walk) |
| **Inspect / Interact** | Walk up to an object/station and press `Space`, `Enter`, or click the prompt badge |
| **Dev Time-Warp** | Press `~` (backtick) or `Shift + D` (or click `⏱ Time Warp` in the top-right HUD) |
| **Audio Toggle** | Click `🎶 8-Bit Music` in the top-right HUD |

---

## Architectural Snapshots & Evolution

To inspect how the Mind Palace has evolved over time, see the periodic written snapshots in [`docs/snapshots/`](./docs/snapshots/):

* **[Snapshot #1 (2026-09-08)](./docs/snapshots/2026-09-08_snapshot_01_study_and_observatory.md)** — Dual connected rooms, Scholar Companion, Barnaby the Duckephant, Stardew-scale sprite overhaul, procedural multi-room soundtrack, high-DPI UI, and Victorian botanicals.
* **[Creative Roadmap & Philosophy](./docs/design_notes.md)** — Architectural ideas, bestiaries, automatons, and mnemonic world design notes.
