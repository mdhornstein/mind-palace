import { RoomConfig } from '../../core/types';
import { RoomVariantManager } from '../variants/roomVariantManager';
import './variants';

export const coinRoomConfig: RoomConfig = {
  get id() {
    return RoomVariantManager.getActiveRoomConfig('coins').id;
  },
  get name() {
    return RoomVariantManager.getActiveRoomConfig('coins').name;
  },
  get widthTiles() {
    return RoomVariantManager.getActiveRoomConfig('coins').widthTiles;
  },
  get heightTiles() {
    return RoomVariantManager.getActiveRoomConfig('coins').heightTiles;
  },
  get stations() {
    return RoomVariantManager.getActiveRoomConfig('coins').stations;
  },
  get doors() {
    return RoomVariantManager.getActiveRoomConfig('coins').doors;
  },
  get architecturalCollisions() {
    return RoomVariantManager.getActiveRoomConfig('coins').architecturalCollisions;
  },
  get ambientLight() {
    return RoomVariantManager.getActiveRoomConfig('coins').ambientLight;
  },
  get hasCompanion() {
    return RoomVariantManager.getActiveRoomConfig('coins').hasCompanion;
  },
  get onUpdate() {
    return RoomVariantManager.getActiveRoomConfig('coins').onUpdate;
  },
  get getEntities() {
    return RoomVariantManager.getActiveRoomConfig('coins').getEntities;
  },
  get customDrawBackground() {
    return RoomVariantManager.getActiveRoomConfig('coins').customDrawBackground;
  },
  get customDrawAtmosphere() {
    return RoomVariantManager.getActiveRoomConfig('coins').customDrawAtmosphere;
  },
};
