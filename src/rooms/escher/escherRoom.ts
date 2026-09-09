import { RoomConfig } from '../../core/types';
import {
  getActiveEscherRoomConfig,
  getActiveEscherVariantId,
  setActiveEscherVariantId,
  onEscherVariantChange,
  getAllEscherRoomConfigs,
  EscherVariantId,
  EscherVariantMeta,
  getEscherVariantMeta,
  getAllEscherVariantsMeta,
} from './variants';

export {
  getActiveEscherRoomConfig,
  getActiveEscherVariantId,
  setActiveEscherVariantId,
  onEscherVariantChange,
  getAllEscherRoomConfigs,
  getEscherVariantMeta,
  getAllEscherVariantsMeta,
};
export type { EscherVariantId, EscherVariantMeta };

/**
 * Proxy for the active Escher room config.
 * Automatically delegates all property reads to the currently selected prototype variant.
 */
export const escherRoomConfig: RoomConfig = new Proxy({} as RoomConfig, {
  get(_target, prop) {
    const config = getActiveEscherRoomConfig();
    return (config as any)[prop];
  },
});
