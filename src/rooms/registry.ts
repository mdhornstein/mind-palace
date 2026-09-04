import { RoomConfig } from '../core/types';
import { studyRoomConfig } from './study/studyRoom';

class RoomRegistryManager {
  private rooms: Map<string, RoomConfig> = new Map();

  constructor() {
    this.register(studyRoomConfig);
  }

  public register(room: RoomConfig) {
    this.rooms.set(room.id, room);
  }

  public getRoom(id: string): RoomConfig {
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
