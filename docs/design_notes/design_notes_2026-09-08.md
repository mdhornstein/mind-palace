
-------

* Want to make it possible to copy-paste text from the modals. (Is that difficult?)

-------


1) Let's make the modal text copy-pastable. [COMPLETED]
   - Enabled `user-select: text` on `.modal-dialog`, `.modal-body`, `.modal-header`, and text containers while maintaining `user-select: none; cursor: pointer;` on buttons.

2) Multi-Variant Prototype System & Print Gallery [COMPLETED]
   - Implemented `EscherVariantManager` with real-time switching between prototypes:
     * `v1_courtyard`: The original Paradox Courtyard (Waterfall, Penrose stairs, Drafting desk, Mobius terrarium).
     * `v2_print_gallery`: Living architectural recreation of M.C. Escher's *Print Gallery* (1956, *Prentententoonstelling*).
   - Switching mechanism:
     * Top-right floating HUD pill: `🌀 Escher: Print Gallery ▾` (or `Courtyard ▾`).
     * In-world Chrono-Spatial Paradox Dial pedestal station with brass dial and dual mode indicators.
     * Saved to `localStorage` ('mind_palace_escher_variant') to persist selection across page refreshes.
   - *Print Gallery* room features:
     * Continuous circular spatial warp (Mediterranean Maltese harbor on the left, exhibition arcade on the right).
     * The curly-haired young observer in frock coat gazing at the gallery wall art.
     * Polished Carrara marble center medallion with logarithmic spiral grooves and engraved `MCE` seal.
     * 7 interactive curatorial masterwork stations: *Print Gallery*, *Relativity*, *Metamorphosis II*, *Drawing Hands*, *Belvedere*, *Day and Night*, and *The Printmaker's Folio Rack*.
     * Museum-grade art modals featuring high-res canvas reproductions, curatorial analysis, Leiden University mathematical proofs (Lenstra & de Smit conformal mapping), Escher quotes, and interactive "Curator's Loupe" zoom toggle.

3) Coin room [NEXT UP]
   - Ready for design and prototyping! 