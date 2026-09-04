# Mind Palace — Design Notes & Observations

A dedicated space to record hands-on observations, experiential impressions, design tenets, and ideas for the Mind Palace as the project evolves.

> **Core Working Hypothesis:**  
> *"Does it feel compelling to return to a small digital world that represents things I care about and quietly changes while I am away?"*

---

## 1. Core Design Tenets

* **A Place, Not a Dashboard**: Resist converting rooms into task lists, progress bars, streaks, or productivity meters. The metaphor itself is the interface.
* **Objects as Live Metaphors**: Items in the palace are living anchors of ideas, memories, and projects—not static database rows.
* **Companion as Inhabitant, Not Chatbot**: The scholar companion goes about its own business (reading, writing, studying fossils) and interacts with understated natural presence rather than pop-up interruptions.
* **Quiet Evolution**: Changes when returning should feel subtle, ambient, and discovered through wandering rather than announced through notification badges.
* **Sensory Atmosphere Matters**: Soundscapes, warm lighting, animated fireplace, and subtle idle motion make the first 30 seconds pleasant before doing anything functional.

---

## 2. Interactive Systems (Prototype 0.1 Overview)

| System / Station | Metaphor / Purpose | Current Implementation Status |
| :--- | :--- | :--- |
| **The Reading Nook** (Bookshelf & Rug) | Memory & personal anchors | Jerry Pallotta dinosaur book; open book rests on rug when recalled. |
| **The Science Desk** (Desk & Skull Wireframe) | Active projects & intellectual puzzles | *Stegoceras* skull FEA simulation; interactive tutor modal for mesh smoothing vs convergence. |
| **Fossil Cabinet & Pedestal** | Curiosity & cumulative discoveries | Curio cabinet with known fossils + *Prenocephale* mystery; discovered specimens move to display pedestal. |
| **Scholar Companion** | Autonomous inhabitant | Follows presence hierarchy (idle activities, acknowledging user, presenting new findings). |
| **Time & Persistence** | Offline state evolution | LocalStorage world state; dev time-machine (`~` or `Shift + D`) for +1h, +12h, +1d, +1w jumps. |

---

## 3. Observations Log

*Use this section to record dated gameplay/usage sessions, noting what felt authentic and where friction arose.*

### Template
```markdown
### [YYYY-MM-DD] — [Session Focus / Title]
* **Context**: (e.g. testing after a work session, morning return, checking overnight change)
* **First 30 Seconds**: (How did the atmosphere, sound, and visual mood feel upon opening?)
* **What Felt Right**: (Interactions, pacing, visuals, or moments of genuine delight)
* **Friction & Rough Edges**: (What felt clunky, game-like in a bad way, or intrusive?)
* **Surprise Insights**: (Unexpected realizations about what this space wants to become)
```

---

### 2026-09-03 — Prototype 0.1 Hands-On & Movement Tuning
* **Context**: First interactive walk-through of Prototype 0.1 implementation and movement debugging.
* **Observations**:
  * *Movement & Traversal*: Initial throttled state-saves caused the character to freeze for 1.5s intervals before jumping. Decoupling live rendering (60 FPS direct coordinate tracking) and allowing instant click-to-open on stations eliminated the choppy lag.
  * *Atmosphere*: The fireplace glow, dust particles, and scholar silhouette give immediate warmth to the room.
  * *Interactions*: Having discrete encounters (Memory, Tutoring, Discovery) feels clean, but making them less scripted and more generative in future iterations will be key.

---

## 4. Design Ideas & Potential Directions

### Atmosphere & Ambience
- [ ] **Dynamic Room Lighting & Time-of-Day**: Reflect actual local time (morning sunlight through the window, twilight dusk, deep night stars).
- [ ] **Ambient Soundscape**: Subtle crackle of the hearth, page turns, distant rain on the window glass, gentle clock tick.

### World & Spatial Mechanics
- [ ] **Expanding Rooms**: Adding doorways or stairs to connected spaces (e.g. an *Observatory* for abstract math/cosmology, a *Basement/Archive* for old projects, a *Greenhouse/Garden* for slow-growing habits).
- [ ] **Spatial Clutter & Living Traces**: Allowing cups of tea to cool, papers to accumulate on the desk during deep project work, and books to remain stacked where last read.

### Companion Intelligence & Behavior
- [ ] **Generative Dialogue & Observations**: Connecting the companion to LLM-driven commentary about actual project commits or notes rather than fixed mock strings.
- [ ] **Companion Notes**: Waking up to find a brief handwritten margin note or sticky on the chalkboard from the companion.

---

## 5. Open Design Questions

1. **How much agency should the user have vs. the world?**  
   *Does the user arrange furniture and place objects manually, or does the world organize itself based on what the user pays attention to?*
2. **How does real work connect to the palace?**  
   *Should git commits, reading lists, and notes automatically cast "shadows" into the room (like a new skull appearing on the desk when a new FEM run completes)?*
3. **What prevents the palace from feeling like another chore to maintain?**  
   *How do we ensure the palace never triggers guilt for being away, but always offers a peaceful, inviting sanctuary upon return?*







I’ve looked through the walkthrough. The implementation appears to have hit the major **Prototype 0.1 mechanical targets**: a persistent world state, three distinct encounter types, an autonomous companion, time-away evolution, and a clean Canvas/DOM architecture. The agent also caught and fixed a real rendering/input bug rather than merely reporting a green build.

A few things stand out that I’ll keep in mind when you give me your subjective experience:

**What this walkthrough demonstrates well**

* The “world for intuition / UI for precision” concept is actually represented in the implementation: the room is the world, while encounters happen in overlays. [The room looks quite good for a v0 initial prototype, much better than I was expecting, with ambient lighting and some kind of soothing particle effect. It's missing sound (of the crackling fireplace), but we can add that later).]
* Persistence is not merely database persistence; it changes the *physical representation* of things. For example, the read book moves onto the rug and the newly discovered specimen later appears on the pedestal. [This is true, but the artwork for the library is a little too small to be legibile (the table in front of the library), and the fossil cabinet is a little too rudimentary with sprites that are too simplified for me to get a good feel of what this will really be like. I think this needs one more improvement/iteration to serve as a valid test.]
* The companion has the beginnings of the attention hierarchy we discussed: ambient activity → recognition → invitation/approach. [The companion currently does not behave in a legible, consistent way. It did show a dialogue box once, and I liked the art style, but other than that it does not appear to have coherent behavior. Though from my point of view we can work on this as a slightly lower priority.]
* The prototype has enough authored atmosphere—fireplace, dust, steam, animated mesh, etc.—that a subjective reaction to the *place* should be meaningful, rather than just a reaction to a technical demo. [In general I agree with this.]
* The hidden time machine gives us a way to test the “what happened while I was gone?” hypothesis without waiting days. [I don't know what this time machine is, or how to experience/test this aspect of the prototype. I need the agent to explain this to me in a simpler way.]

**What the walkthrough does *not* tell us**
This is the important part. An implementation walkthrough can establish that the mechanics exist, but it can't establish whether they **work psychologically**.

In particular, I can't infer from this whether:

* you actually want to wander around the room; [It is pleasing to wander around now that the movement is fixed. Could potentially experiment with walking speed in future iterations.]
* the objects feel meaningful rather than like game props; [When you reach an area like the library, it pops up an oveerlay (which takes up the whole screen). My preliminary impression is that this works really well. The overlays feel meaningfully different, like the memories in the library, the interesting facts in the fossil cabinet, and the tutor in the workstation.]
* the companion feels like a person inhabiting the palace rather than an NPC; [Companion does not feel intrusive, but also does not feeel fleshed out yet to the point where I can really test/experiment with its behavior.]
* the encounters make you curious;
* the memory interaction feels emotionally resonant;
* the world feels like **your** world; [The world feels like it has the potential to really be my world.]
* you want to return after the novelty wears off;
* the transition from walking around → modal → AI interaction feels natural or jarring. [The transition from walking around to the modal feels good. When you approach an oboject, it gives you the option to click or press space to open the modal, and this appears to work well.]

These are my preliminary impressions, but I need to play around with it more to provide more detailed feedback. 

I think it would be worthwhile to move in two directions. One is to make some small iterative improvements to give more insight into the current iteration, and the other is to do more high-level design and brainstorm design ideas, experiemnts, and directions to investigate. What do you think? 