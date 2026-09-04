import { WorldState, InteractiveZone } from './types';

export const TILE_SIZE = 32;
export const ROOM_WIDTH_TILES = 20;
export const ROOM_HEIGHT_TILES = 15;
export const CANVAS_WIDTH = ROOM_WIDTH_TILES * TILE_SIZE; // 640
export const CANVAS_HEIGHT = ROOM_HEIGHT_TILES * TILE_SIZE; // 480

export const STORAGE_KEY = 'mind_palace_world_state_v1';

export const INITIAL_SEED_STATE: WorldState = {
  version: 1,
  time: {
    createdAt: Date.now(),
    lastVisitedAt: Date.now(),
    currentVirtualTime: Date.now(),
    elapsedAwaySeconds: 0,
    totalVisits: 1,
  },
  player: {
    x: 9.5 * TILE_SIZE,
    y: 12.5 * TILE_SIZE,
    facing: 'up',
  },
  companion: {
    name: 'The Scholar',
    role: 'Naturalist & Inhabitant',
    x: 6.5 * TILE_SIZE,
    y: 4.5 * TILE_SIZE,
    facing: 'left',
    location: 'reading_nook',
    activity: 'reading',
    presenceLevel: 1, // Recognition ("Oh, hey.")
    speech: {
      text: "Oh, hey.",
      timestamp: Date.now(),
      durationMs: 4000,
    },
    pendingRemark: null,
    discussedItems: [],
    lastNoticedPlayerAt: Date.now(),
  },
  environment: {
    bookOpenOnRug: false,
    activePedestalSpecimenId: null,
    chalkboardEquation: '∇ · σ + f = 0   [Linear Elasticity]',
    fireplaceLit: true,
    ambientLight: 'evening',
  },
  memories: [
    {
      id: 'mem_pallotta_dinosaurs',
      targetObjectId: 'book_pallotta',
      title: 'Reading Dinosaurs with the Kids',
      subtitle: 'Jerry Pallotta — The Dinosaur Alphabet Book',
      date: 'August 14',
      snippet: 'One of the kids asked: "Why doesn\'t the dinosaur just move?" You laughed together.',
      fullContent: [
        'Curled up on the rug under the warm afternoon light.',
        'We were going through Jerry Pallotta\'s dinosaur book page by page.',
        'At Stegoceras, pointing to the thick skull dome, one of them looked up with absolute sincerity and asked:',
        '"If it has legs, why doesn\'t the dinosaur just move away instead of head-butting things?"',
        'We laughed for five minutes straight. Then we tried to imagine a Stegoceras diplomatically talking its way out of a confrontation with a predator.'
      ],
      tags: ['family', 'kids', 'laughter', 'dinosaurs'],
      unlocked: true,
    },
    {
      id: 'mem_thompson_form',
      targetObjectId: 'book_darcy_thompson',
      title: 'On Growth and Form',
      subtitle: 'D\'Arcy Wentworth Thompson (1917)',
      date: 'September 28',
      snippet: 'Morphology as the mathematical diagram of forces.',
      fullContent: [
        `"The form of an object is a 'diagram of forces'; in this sense, at least, that from it we can judge of or deduce the forces that are acting or have acted upon it."`,
        'Underlining this passage late at night before drafting the first finite-element simulation mesh for cranial domes.',
        'Reminds you why mechanics and paleontology are fundamentally the same inquiry.'
      ],
      tags: ['science', 'morphology', 'mathematics'],
      unlocked: true,
    },
  ],
  projects: [
    {
      id: 'proj_stegoceras_fea',
      name: 'Stegoceras validum',
      subtitle: 'Surface-derived linear-elastic FEA',
      category: 'Biomechanics / Paleontology',
      description: 'Mesh convergence study analyzing stress distribution across the frontoparietal dome under simulated frontal impacts.',
      status: 'running',
      progress: 0.74,
      durationSeconds: 1800, // 30 minutes to complete from start, or accelerated via dev time
      visualState: 'mesh_dense',
      trainingPrompt: {
        question: 'If you refine the finite element mesh around the frontoparietal dome but simultaneously smooth the surface geometry derived from the micro-CT scan, what are you actually measuring?',
        context: 'Consider the distinction between geometric discretization error and structural model distortion in biological FEA.',
        referenceKeywords: ['discretization', 'geometry', 'artifact', 'smoothing', 'fidelity', 'convergence', 'ct scan', 'bone density', 'model'],
      },
    },
  ],
  specimens: [
    {
      id: 'spec_stegoceras',
      name: 'Stegoceras validum',
      scientificName: 'Stegoceras validum (Lambe, 1902)',
      classification: 'Pachycephalosauria — Pachycephalosauridae',
      period: 'Late Cretaceous (Campanian, ~76 Ma)',
      region: 'Dinosaur Park Formation, Alberta, Canada',
      description: 'The classic dome-headed dinosaur. Characterized by a thick frontoparietal dome surrounded by a shelf of decorative tubercles.',
      discovered: true,
      onPedestal: false,
      topics: [
        {
          id: 'morph',
          label: 'Dome Architecture',
          teaser: 'Vascular channels and radial fibrolamellar bone.',
          content: 'The dome is not hollow horn; it is dense, highly vascularized bone with columnar trabeculae oriented along the lines of principal compressive stress during head-to-head contact.',
        },
        {
          id: 'behavior',
          label: 'Combat Hypothesis',
          teaser: 'Head-butting vs flank-butting debate.',
          content: 'Biomechanical FEA shows the dome could easily withstand high-energy impacts without intracranial trauma, though flank-shoving and lateral displays were equally probable behavioral functions.',
        },
      ],
    },
    {
      id: 'spec_triceratops',
      name: 'Triceratops prorsus',
      scientificName: 'Triceratops prorsus (Marsh, 1890)',
      classification: 'Ceratopsia — Ceratopsidae',
      period: 'Late Cretaceous (Maastrichtian, ~66 Ma)',
      region: 'Hell Creek Formation, Montana, USA',
      description: 'A massive three-horned herbivore with an expansive solid bone frill. Epoccipital bones ring the margin.',
      discovered: true,
      onPedestal: false,
      topics: [
        {
          id: 'horn_mechanics',
          label: 'Horn Fracture Mechanics',
          teaser: 'Keratin sheath load dissipation.',
          content: 'While the bony core reveals extensive remodeling, finite element simulations demonstrate that the outer keratin sheath dissipated up to 40% of peak impact strain during intra-specific locking of horns.',
        },
      ],
    },
    {
      id: 'spec_ankylosaurus',
      name: 'Ankylosaurus magniventris',
      scientificName: 'Ankylosaurus magniventris (Brown, 1908)',
      classification: 'Thyreophora — Ankylosauridae',
      period: 'Late Cretaceous (Maastrichtian, ~66 Ma)',
      region: 'Hell Creek Formation, Wyoming, USA',
      description: 'Heavily armored quadruped with fused dermal scutes, osteoderms, and a distal caudal club modified into a heavy biological bludgeon.',
      discovered: true,
      onPedestal: false,
      topics: [
        {
          id: 'armor',
          label: 'Composite Osteoderm Armor',
          teaser: 'Bio-inspired sandwich composite structures.',
          content: 'The osteoderms have a dense cortical outer shell and a spongy cancellous core arranged in interwoven collagen bundles, an architecture human materials scientists now copy for blast shields.',
        },
      ],
    },
    {
      id: 'spec_prenocephale',
      name: 'Prenocephale brevis',
      scientificName: 'Prenocephale brevis (Maryańska & Osmólska, 1974)',
      classification: 'Pachycephalosauria — Pachycephalosauridae',
      period: 'Late Cretaceous (Campanian/Maastrichtian, ~70 Ma)',
      region: 'Nemegt Basin, Gobi Desert, Mongolia',
      description: 'An unfamiliar Asian pachycephalosaur with a uniquely steep, rounded dome lacking the flat supratemporal fenestrae found in North American taxa.',
      discovered: false, // Starts undiscovered!
      onPedestal: false,
      highlightNew: true,
      topics: [
        {
          id: 'morphology',
          label: 'Morphology & Dome',
          teaser: 'Distinct steep-sided globular dome.',
          content: 'Unlike Stegoceras, Prenocephale\'s dome rises steeply and is enclosed laterally, obliterating the supratemporal openings entirely. A ring of small bony tubercles wraps around the rear of the skull like a beaded crown.',
        },
        {
          id: 'evolution',
          label: 'Evolutionary Context',
          teaser: 'The Mongolian-North American faunal interchange.',
          content: 'Prenocephale proves that pachycephalosaur diversification was pan-Laurasian. The morphology points to a distinct lineage from North American forms, diverging before the closure of the Beringian land corridor.',
        },
        {
          id: 'compare',
          label: 'Compare with Stegoceras',
          teaser: 'How does this dome handle shear stress?',
          content: 'Stegoceras has a broader parietal shelf with open fenestrae allowing temporal muscle anchorage. Prenocephale sacrifices muscle attachment volume in favor of a rigid, enclosed dome that distributes off-axis rotational shear far more effectively.',
        },
        {
          id: 'surprise',
          label: 'Surprise Me',
          teaser: 'The juvenile ontogeny mystery.',
          content: 'For years, paleontologists suspected flat-headed Homalocephale might simply be the juvenile form of Prenocephale. Histological thin-sections of Prenocephale domes revealed mature lines of arrested growth, confirming both exist as genuine morphological stages.',
        },
      ],
    },
  ],
  encounters: {
    history: [],
  },
};

export const INTERACTIVE_ZONES: InteractiveZone[] = [
  {
    id: 'library',
    name: 'The Library',
    prompt: 'Inspect Bookshelf & Memories',
    x: 1.5 * TILE_SIZE,
    y: 1 * TILE_SIZE,
    width: 4 * TILE_SIZE,
    height: 3 * TILE_SIZE,
  },
  {
    id: 'cabinet',
    name: 'The Fossil Cabinet',
    prompt: 'Examine Specimens',
    x: 14 * TILE_SIZE,
    y: 1 * TILE_SIZE,
    width: 4 * TILE_SIZE,
    height: 3 * TILE_SIZE,
  },
  {
    id: 'pedestal',
    name: 'Display Pedestal',
    prompt: 'Inspect Featured Specimen',
    x: 15 * TILE_SIZE,
    y: 5 * TILE_SIZE,
    width: 2 * TILE_SIZE,
    height: 2 * TILE_SIZE,
  },
  {
    id: 'workshop',
    name: 'Science Workstation',
    prompt: 'Inspect FEA Project & Skull',
    x: 13 * TILE_SIZE,
    y: 9 * TILE_SIZE,
    width: 5 * TILE_SIZE,
    height: 3.5 * TILE_SIZE,
  },
];
