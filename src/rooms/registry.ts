import { RoomConfig } from '../core/types';
import { studyRoomConfig } from './study/studyRoom';
import { observatoryRoomConfig } from './observatory/observatoryRoom';
import { RoomVariantManager } from './variants/roomVariantManager';
import './escher/variants';
import './coins/variants';

class RoomRegistryManager {
  private rooms: Map<string, RoomConfig> = new Map();

  constructor() {
    this.register(studyRoomConfig);
    this.register(observatoryRoomConfig);
  }

  public register(room: RoomConfig) {
    this.rooms.set(room.id, room);
  }

  public getRoom(id: string): RoomConfig {
    if (RoomVariantManager.hasVariants(id)) {
      return RoomVariantManager.getActiveRoomConfig(id);
    }
    const room = this.rooms.get(id);
    if (!room) {
      console.warn(`Room '${id}' not found in registry, falling back to 'study'`);
      return studyRoomConfig;
    }
    return room;
  }

  public getAllRooms(): RoomConfig[] {
    const staticRooms = Array.from(this.rooms.values());
    const variantRooms = RoomVariantManager.getAllConfigs();
    return [...staticRooms, ...variantRooms];
  }
}

export const RoomRegistry = new RoomRegistryManager();
