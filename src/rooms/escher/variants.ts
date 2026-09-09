import { RoomConfig } from '../../core/types';
import { escherV1CourtyardConfig } from './variants/v1_courtyard';
import { escherV2PrintGalleryConfig } from './variants/v2_print_gallery';

export type EscherVariantId = 'v1_courtyard' | 'v2_print_gallery';

export interface EscherVariantMeta {
  id: EscherVariantId;
  label: string;
  shortName: string;
  year: number;
  description: string;
  icon: string;
}

export const ESCHER_VARIANTS_META: Record<EscherVariantId, EscherVariantMeta> = {
  v1_courtyard: {
    id: 'v1_courtyard',
    label: 'Paradox Courtyard (v1)',
    shortName: 'Courtyard',
    year: 1961,
    description:
      'Ascending and descending stairs, perpetual waterfall flume, self-drawing desk, and mobius terrarium.',
    icon: '🏛️',
  },
  v2_print_gallery: {
    id: 'v2_print_gallery',
    label: 'Print Gallery (v2)',
    shortName: 'Print Gallery',
    year: 1956,
    description:
      'Living spatial recreation of Prentententoonstelling with framed masterworks, Maltese harbor, and young observer.',
    icon: '🖼️',
  },
};

const STORAGE_KEY = 'mind_palace_escher_variant';
const DEFAULT_VARIANT: EscherVariantId = 'v2_print_gallery';

export type VariantChangeListener = (
  newVariant: EscherVariantId,
  oldVariant: EscherVariantId
) => void;

const listeners = new Set<VariantChangeListener>();

function getInitialVariant(): EscherVariantId {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'v1_courtyard' || stored === 'v2_print_gallery') {
        return stored;
      }
    }
  } catch {
    // Ignore storage access errors in headless/test environments
  }
  return DEFAULT_VARIANT;
}

let activeVariantId: EscherVariantId = getInitialVariant();

export function getActiveEscherVariantId(): EscherVariantId {
  return activeVariantId;
}

export function setActiveEscherVariantId(newVariantId: EscherVariantId): void {
  if (newVariantId === activeVariantId) return;
  if (newVariantId !== 'v1_courtyard' && newVariantId !== 'v2_print_gallery') {
    console.warn(`Invalid Escher variant id: ${newVariantId}`);
    return;
  }
  const oldVariantId = activeVariantId;
  activeVariantId = newVariantId;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newVariantId);
    }
  } catch {
    // Ignore
  }

  for (const listener of listeners) {
    try {
      listener(newVariantId, oldVariantId);
    } catch (err) {
      console.error('Error in Escher variant change listener:', err);
    }
  }
}

export function onEscherVariantChange(listener: VariantChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Returns the currently active Escher room configuration mapped with the canonical id 'escher'
 * so that standard palace door routing, companion state, and navigation operate transparently.
 */
export function getActiveEscherRoomConfig(): RoomConfig {
  const baseConfig =
    activeVariantId === 'v1_courtyard'
      ? escherV1CourtyardConfig
      : escherV2PrintGalleryConfig;

  return {
    ...baseConfig,
    id: 'escher',
  };
}

/**
 * Returns all room configs (both v1 and v2) for static integrity, obstacle checking,
 * and complete modal registration coverage.
 */
export function getAllEscherRoomConfigs(): RoomConfig[] {
  return [escherV1CourtyardConfig, escherV2PrintGalleryConfig];
}

export function getEscherVariantMeta(id: EscherVariantId): EscherVariantMeta {
  return ESCHER_VARIANTS_META[id] || ESCHER_VARIANTS_META[DEFAULT_VARIANT];
}

export function getAllEscherVariantsMeta(): EscherVariantMeta[] {
  return Object.values(ESCHER_VARIANTS_META);
}
