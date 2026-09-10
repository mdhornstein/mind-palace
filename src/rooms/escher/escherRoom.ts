import { RoomConfig } from '../../core/types';
import { RoomVariantManager } from '../variants/roomVariantManager';
import './variants'; // Trigger registration

/**
 * Proxy for the active Escher room config.
 * Automatically delegates all property reads to the currently selected prototype variant.
 */
export const escherRoomConfig: RoomConfig = new Proxy({} as RoomConfig, {
  get(_target, prop) {
    const config = RoomVariantManager.getActiveRoomConfig('escher');
    return (config as any)[prop];
  },
});
