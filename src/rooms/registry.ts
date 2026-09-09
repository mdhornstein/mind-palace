import { RoomConfig } from '../core/types';
import { studyRoomConfig } from './study/studyRoom';
import { observatoryRoomConfig } from './observatory/observatoryRoom';
import {
  getActiveEscherRoomConfig,
  getAllEscherRoomConfigs,
} from './escher/escherRoom';

class RoomRegistryManager {
  private rooms: Map<string, RoomConfig> = new Map();

  constructor() {
    this.register(studyRoomConfig);
    this.register(observatoryRoomConfig);
    // Register all concrete Escher prototype variants (v1 and v2)
    for (const variant of getAllEscherRoomConfigs()) {
      this.register(variant);
    }
  }

  public register(room: RoomConfig) {
    this.rooms.set(room.id, room);
  }

  public getRoom(id: string): RoomConfig {
    if (id === 'escher') {
      return getActiveEscherRoomConfig();
    }
    const room = this.rooms.get(id);
    if (!room) {
      console.warn(`Room '${id}' not found in registry, falling back to 'study'`);
      return studyRoomConfig;
    }
    return room;
  }

  public getAllRooms(): RoomConfig[] {
    return Array.from(this.rooms.values());
  }
}

export const RoomRegistry = new RoomRegistryManager();
