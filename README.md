# Mind Palace — Prototype 0.1

A persistent digital environment representing a personal study and curiosity workshop, built to test the hypothesis:
> *"Does it feel compelling to return to a small digital world that represents things I care about and quietly changes while I am away?"*

---

## What Was Implemented

### 1. The Room & Atmosphere
* **Cozy 2D Pixel-Art Study & Workshop**:
  * Herringbone hardwood floors, wainscoting, and warm plaster walls.
  * Arched mullioned window casting soft moonlight and stars.
  * Crackling stone fireplace with animated flame and warm radial glow.
  * Ornate Persian-style rug in the reading nook.
  * Floating ambient dust motes caught in the room's light beams.
* **The Library**:
  * Floor-to-ceiling bookshelf filled with varied book spines.
  * Jerry Pallotta's *Dinosaurs* book and D'Arcy Thompson's *On Growth and Form*.
  * Wingback reading chair and tea table with drifting pixel steam.
  * Recalling a memory causes the open book to rest on the rug.
* **The Science Workshop**:
  * Heavy oak desk with drawers, blueprints, and CRT monitor with phosphor scanlines.
  * Wall chalkboard with continuum mechanics equations (`∇ · σ + f = 0`).
  * *Stegoceras validum* skull with an animated, pulsating finite-element wireframe mesh (which shifts to a von Mises stress heatmap upon completion).
* **The Fossil Curio Cabinet & Display Pedestal**:
  * Illuminated glass shelves with mineralized specimens (*Stegoceras*, *Triceratops*, *Ankylosaurus*).
  * Unexplored mystery specimen (*Prenocephale brevis*) with a subtle starlight shimmer.
  * Marble display pedestal that showcases newly discovered fossils when returning on subsequent visits.
* **The Scholar Companion**:
  * Persistent inhabitant living in the room (reading in the chair, writing at the desk, examining fossils).
  * Presence hierarchy (0: presence, 1: recognition *"Oh, hey"*, 2: invitation *"I put this one out"*, 3: approach when simulations finish).

### 2. The Three Encounter Types (Mock-First AI)
* **Memory (`remember`)**: Jerry Pallotta's book surfaces the authentic memory of reading with the kids on August 14 (*"Why doesn't the dinosaur just move?"*).
* **Training (`teach`)**: The tutor asks about finite-element mesh convergence vs surface smoothing on CT skull scans. Users type a hypothesis in a text box and receive structured scientific feedback and biomechanical critiques.
* **Discovery (`discover`)**: The curiosity engine unlocks *Prenocephale brevis* with branching exploration lines (*Morphology & Dome*, *Evolutionary Context*, *Compare with Stegoceras*, *Surprise Me*).

### 3. Persistence & Time-Evolution
* **First-Class WorldState**: Stored in `localStorage` (`mind_palace_world_state_v1`).
* **Offline Evolution**: Tracks `elapsedAwaySeconds` and updates world state automatically:
  * Running simulations advance and complete over time.
  * Discovered specimens are placed on the display pedestal with companion standing beside them.
  * Recalled books remain resting open on the reading rug.
  * Companion activity and chalkboard notes evolve.

### 4. Hidden Dev Mode (Time-Machine)
* Press **`~` (backtick)** or **`Shift + D`** to toggle the dev toolbar:
  * Advance time by `+1 Hour`, `+12 Hours`, `+1 Day`, or `+1 Week`.
  * Trigger immediate completion of running FEA simulations.
  * Reset world state back to fresh seed defaults.
  * Log current `WorldState` JSON to developer console.

---

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# Open http://localhost:5173/ in your browser.
```

### Controls
* **Movement**: `W, A, S, D` or `Arrow Keys` (or Click anywhere on the floor to walk).
* **Inspect**: Walk up to an object and press `Space`, `Enter`, `E`, or click the prompt.
* **Dev Time-Machine**: Press `~` (backtick) or `Shift + D`.
