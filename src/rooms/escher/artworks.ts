export interface EscherArtItem {
  id: string;
  title: string;
  dutchTitle: string;
  year: number;
  medium: string;
  dimensions: string;
  catalogRef: string;
  description: string;
  mathematicalSecret: string;
  escherQuote: string;
  tags: string[];
  visualTheme: {
    accentColor: string;
    frameStyle: 'gilded_baroque' | 'dark_walnut' | 'ebony_minimal';
    aspectRatio: 'landscape' | 'portrait' | 'panoramic' | 'square';
  };
}

export const ESCHER_ARTWORKS: Record<string, EscherArtItem> = {
  print_gallery: {
    id: 'print_gallery',
    title: 'Print Gallery',
    dutchTitle: 'Prentententoonstelling',
    year: 1956,
    medium: 'Lithograph on Dutch handmade rag paper',
    dimensions: '31.7 cm × 31.9 cm (12.5 in × 12.6 in)',
    catalogRef: 'Bool #410 / Locher #206',
    description:
      'A young art connoisseur stands with his hands behind his back in a quiet exhibition gallery, gazing intently at a framed lithograph depicting a Mediterranean harbor town. As the viewer’s eye journeys clockwise around the composition, the town’s quayside, warehouses, and tiled roofs expand logarithmically, curving upward to form the roof of the very exhibition hall the young man is standing within. The observer is inside the observed world.',
    mathematicalSecret:
      'Escher intuitively discovered the conformal mapping of a Riemann surface onto itself using a logarithmic spiral grid with a twist factor of 256/63. In 2003, mathematicians Hendrik Lenstra and Bart de Smit at Leiden University analyzed Escher’s preparatory grid drawings. They proved that the image is a continuous conformal transformation with a scale factor of 22.58 and a rotation of 157.63 degrees. They successfully decoded the mathematical equation that fills in Escher’s mysterious blank circular center, revealing that it contains an infinitely recursive copy of the entire print rotated upside-down.',
    escherQuote:
      '“A circular progression of expansion and contraction... the viewer looks into a print that expands until it contains the room from which he is viewing it. It is a strange loop of the mind, where the inside and the outside become one.”',
    tags: ['Strange Loop', 'Conformal Mapping', 'Droste Effect', 'Riemann Surface', 'Malta'],
    visualTheme: {
      accentColor: '#f59e0b',
      frameStyle: 'gilded_baroque',
      aspectRatio: 'square',
    },
  },

  relativity: {
    id: 'relativity',
    title: 'Relativity',
    dutchTitle: 'Relativiteit',
    year: 1953,
    medium: 'Woodcut printed from three blocks',
    dimensions: '27.7 cm × 29.2 cm (10.9 in × 11.5 in)',
    catalogRef: 'Bool #389 / Locher #187',
    description:
      'Sixteen anonymous, faceless mechanical figures inhabit an architectural atrium governed simultaneously by three independent gravitational fields intersecting at 90-degree right angles. Figures ascend and descend identical staircases side-by-side yet perceive entirely different directions as “down”. One figure sits reading peacefully on what another figure experiences as a vertical wall.',
    mathematicalSecret:
      'The composition is an orthogonal triple-gravity manifold based on the Cartesian coordinate axes (X, Y, Z). Each of the three gravitational worlds has its own horizon, floor, and ceiling, yet all three seamlessly intersect in shared open space without colliding. The work explores the Einsteinian equivalence principle—that gravity is indistinguishable from acceleration and depends entirely on the reference frame of the observer.',
    escherQuote:
      '“Three gravitational worlds operate at right angles to one another. Two inhabitants of different worlds walk along the same staircase in the same direction; yet one walks upwards and the other downwards, for they inhabit different realities.”',
    tags: ['Orthogonal Gravity', 'General Relativity', 'Reference Frames', 'Isometric Architecture'],
    visualTheme: {
      accentColor: '#38bdf8',
      frameStyle: 'dark_walnut',
      aspectRatio: 'square',
    },
  },

  metamorphosis_ii: {
    id: 'metamorphosis_ii',
    title: 'Metamorphosis II',
    dutchTitle: 'Metamorphose II',
    year: 1940,
    medium: 'Woodcut in red, green, and brown, printed from 20 blocks on 3 combined sheets',
    dimensions: '19.2 cm × 389.5 cm (7.5 in × 153.3 in)',
    catalogRef: 'Bool #327 / Locher #111',
    description:
      'A breathtaking four-meter continuous panoramic strip that begins with the printed typography of the word "METAMORPHOSE". The letters gradually dissolve into a regular black-and-white checkerboard, which morphs into reptilian hexagrams, creeping salamanders, honeycombs with working bees, fish, birds, three-dimensional isometric cubes, and finally into the medieval clifftop fortress town of Atrani on Italy’s Amalfi Coast, where a chess piece on a tower brings the sequence full-circle back to the checkerboard.',
    mathematicalSecret:
      'Escher utilizes periodic continuous topological deformations (homotopies) to transition between Euclidean symmetry groups. The wallpaper groups p1, p3, and p6 are bridged seamlessly: hexagonal close-packing yields bees and honeycomb cells, which split into dual interpenetrating flocks of birds flying in opposite directions (glide reflection symmetry).',
    escherQuote:
      '“Metamorphosis is the dynamic depiction of time in space. A bridge across the static boundary between two states of being, demonstrating that all distinct forms are merely temporary variations of a single continuous fabric.”',
    tags: ['Topological Deformation', 'Wallpaper Groups', 'Symmetry', 'Atrani', 'Glide Reflection'],
    visualTheme: {
      accentColor: '#10b981',
      frameStyle: 'dark_walnut',
      aspectRatio: 'panoramic',
    },
  },

  drawing_hands: {
    id: 'drawing_hands',
    title: 'Drawing Hands',
    dutchTitle: 'Tekenen',
    year: 1948,
    medium: 'Lithograph on dark wove paper',
    dimensions: '28.2 cm × 33.2 cm (11.1 in × 13.1 in)',
    catalogRef: 'Bool #355 / Locher #148',
    description:
      'A piece of drawing paper is pinned to a wooden board with brass thumbtacks. From flat, two-dimensional graphite outlines on the paper, two three-dimensional right and left hands rise into corporeal reality. Each hand holds a drafting pencil and is actively engaged in drawing the cuff and sleeve of the other hand into existence.',
    mathematicalSecret:
      'The definitive visual metaphor for a "Strange Loop" or tangled hierarchy, as analyzed by Douglas Hofstadter. In formal logic, two levels cannot be mutual causes of one another without generating paradox (Tarski’s truth theorem / Gödelian self-reference). Escher resolves the paradox by being the unseen external creator who draws the paper upon which the two hands draw each other.',
    escherQuote:
      '“A two-dimensional sheet of paper... on which two hands emerge into three dimensions, each drawing the other into being. It is an act of creation that exists only through the mutual creation of its parts.”',
    tags: ['Mutual Causation', 'Gödelian Incompleteness', 'Strange Loop', 'Tangled Hierarchy'],
    visualTheme: {
      accentColor: '#f43f5e',
      frameStyle: 'ebony_minimal',
      aspectRatio: 'landscape',
    },
  },

  belvedere: {
    id: 'belvedere',
    title: 'Belvedere',
    dutchTitle: 'Belvedère',
    year: 1958,
    medium: 'Lithograph on tinted paper',
    dimensions: '46.2 cm × 29.5 cm (18.2 in × 11.6 in)',
    catalogRef: 'Bool #426 / Locher #221',
    description:
      'A classical two-story open observation pavilion set against an Italian mountain landscape. In the foreground, a seated youth in medieval dress holds an impossible Necker cube. Looking up at the pavilion reveals that the pillars supporting the upper floor originate from the back side of the lower terrace but attach to the front side of the upper terrace.',
    mathematicalSecret:
      'Based on the mathematical discovery of the "impossible cube" (a 3D extension of the 1832 Swiss crystallographer Louis Albert Necker’s ambiguous wireframe cube). Escher manipulates orthographic projection to connect vertices that should be separated along the depth axis Z, creating a rigid structure that can be drawn on flat paper but can never exist in Euclidean 3D space.',
    escherQuote:
      '“In the foreground sits a young man holding an impossible cube in his hands. He gazes pensively at this incomprehensible object, unaware that the building behind him has been constructed upon precisely the same impossible principles.”',
    tags: ['Impossible Cube', 'Necker Cube', 'Orthographic Projection', 'Spatial Paradox'],
    visualTheme: {
      accentColor: '#a855f7',
      frameStyle: 'gilded_baroque',
      aspectRatio: 'portrait',
    },
  },

  day_and_night: {
    id: 'day_and_night',
    title: 'Day and Night',
    dutchTitle: 'Dag en Nacht',
    year: 1938,
    medium: 'Woodcut in black and grey, printed from two blocks',
    dimensions: '39.1 cm × 67.7 cm (15.4 in × 26.7 in)',
    catalogRef: 'Bool #303 / Locher #102',
    description:
      'A wide aerial view of Dutch polder country with an agricultural landscape bisected by a winding river. On the left, it is broad daylight over a sunny town; on the right, the identical landscape is blanketed in nighttime shadows with glowing windows. In the sky, interlocking flocks of black and white birds fly in opposite directions: black birds merge into the night, white birds merge into the day.',
    mathematicalSecret:
      'A masterclass in figure-ground reversal (Gestalt psychology) and translational antisymmetry. The negative space between the white geese defines the contours of the black geese flying in the opposite direction. Neither flock can exist without the other, demonstrating that light and dark, day and night, are complementary aspects of one topological manifold.',
    escherQuote:
      '“The silhouettes of birds arise out of the triangular shapes of the fields below. Towards the left the white birds merge into daylight; towards the right the black birds merge into night. Two opposite states of nature united in a single moment.”',
    tags: ['Figure-Ground Reversal', 'Antisymmetry', 'Gestalt', 'Tessellation', 'Polder'],
    visualTheme: {
      accentColor: '#eab308',
      frameStyle: 'dark_walnut',
      aspectRatio: 'landscape',
    },
  },

  printmaker_folio: {
    id: 'printmaker_folio',
    title: "The Printmaker's Folio Rack",
    dutchTitle: 'Het Prentenrek',
    year: 1956,
    medium: 'Oak drying rack with deckle-edged lithographs and copperplate etchings',
    dimensions: 'Free-standing studio furniture',
    catalogRef: 'Studio Artifact #01',
    description:
      'A craftsman’s turned-oak print browser stand holding loose, unframed lithographic proofs, state variations, and trial pulls on heavy rag paper. Visitors to the printmaker’s shop were encouraged to browse through these folios with white cotton gloves to examine early trial impressions and preliminary pencil studies.',
    mathematicalSecret:
      'The folio contains preparatory studies showing Escher’s grid calculations: conformal circle packings, logarithmic coordinate transformations, hyperbolic geometries inspired by British geometer H.S.M. Coxeter, and color-symmetry permutations on periodic planes.',
    escherQuote:
      '“To have peace with this—to keep on dreaming and creating—one must feel the texture of the stone and paper, the smell of printer’s ink, and the quiet satisfaction of the press turning.”',
    tags: ['Atelier', 'Lithographic Proofs', 'Preparatory Studies', 'H.S.M. Coxeter'],
    visualTheme: {
      accentColor: '#d97706',
      frameStyle: 'dark_walnut',
      aspectRatio: 'square',
    },
  },
};
