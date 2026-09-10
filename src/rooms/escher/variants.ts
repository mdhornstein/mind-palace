import { RoomVariantManager, RoomVariantMeta } from '../variants/roomVariantManager';
import { escherV1CourtyardConfig } from './variants/v1_courtyard';
import { escherV2PrintGalleryConfig } from './variants/v2_print_gallery';

export const ESCHER_ROOM_VARIANTS: RoomVariantMeta[] = [
  {
    id: 'v1_courtyard',
    roomId: 'escher',
    label: 'Paradox Courtyard (v1)',
    shortName: 'Courtyard',
    year: 1961,
    description:
      'Ascending and descending stairs, perpetual waterfall flume, self-drawing desk, and mobius terrarium.',
    icon: '🏛️',
    config: escherV1CourtyardConfig,
  },
  {
    id: 'v2_print_gallery',
    roomId: 'escher',
    label: 'Print Gallery (v2)',
    shortName: 'Print Gallery',
    year: 1956,
    description:
      'Living spatial recreation of Prentententoonstelling with framed masterworks, Mediterranean harbor, and young observer.',
    icon: '🖼️',
    config: escherV2PrintGalleryConfig,
  },
];

export function registerEscherVariants(): void {
  RoomVariantManager.registerVariants('escher', ESCHER_ROOM_VARIANTS, 'v2_print_gallery');
}

// Auto-register on module load
registerEscherVariants();
