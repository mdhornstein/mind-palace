import { RoomConfig } from '../../core/types';

export interface RoomVariantMeta {
  id: string; // Unique within the room, e.g. 'v1_courtyard', 'v2_print_gallery'
  roomId: string; // The canonical room id, e.g. 'escher', 'study'
  label: string; // e.g. 'Paradox Courtyard (v1)'
  shortName: string; // e.g. 'Courtyard'
  description: string;
  icon?: string;
  year?: number;
  config: RoomConfig;
}

interface RoomVariantGroup {
  roomId: string;
  defaultVariantId: string;
  variants: Map<string, RoomVariantMeta>;
}

export type RoomVariantChangeListener = (
  roomId: string,
  newVariantId: string,
  oldVariantId: string
) => void;

class RoomVariantRegistryManager {
  private groups: Map<string, RoomVariantGroup> = new Map();
  private activeVariantIds: Map<string, string> = new Map();
  private listeners: Set<RoomVariantChangeListener> = new Set();

  private getStorageKey(roomId: string): string {
    return `mind_palace_variant_${roomId}`;
  }

  private readStoredVariant(roomId: string, defaultId: string, validIds: string[]): string {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.getStorageKey(roomId));
        if (stored && validIds.includes(stored)) {
          return stored;
        }
      }
    } catch {
      // Ignore errors in headless or storage-restricted environments
    }
    return defaultId;
  }

  public registerVariants(
    roomId: string,
    variants: RoomVariantMeta[],
    defaultVariantId?: string
  ): void {
    if (variants.length === 0) return;

    const variantMap = new Map<string, RoomVariantMeta>();
    const validIds: string[] = [];

    for (const v of variants) {
      variantMap.set(v.id, v);
      validIds.push(v.id);
    }

    const defaultId = defaultVariantId ?? variants[0].id;
    this.groups.set(roomId, {
      roomId,
      defaultVariantId: defaultId,
      variants: variantMap,
    });

    const activeId = this.readStoredVariant(roomId, defaultId, validIds);
    this.activeVariantIds.set(roomId, activeId);
  }

  public hasVariants(roomId: string): boolean {
    return this.groups.has(roomId);
  }

  public getActiveVariantId(roomId: string): string {
    const group = this.groups.get(roomId);
    if (!group) {
      throw new Error(`Room '${roomId}' has no registered variants.`);
    }
    return this.activeVariantIds.get(roomId) ?? group.defaultVariantId;
  }

  public setActiveVariantId(roomId: string, variantId: string): void {
    const group = this.groups.get(roomId);
    if (!group) {
      console.warn(`Cannot set variant: room '${roomId}' has no registered variants.`);
      return;
    }
    if (!group.variants.has(variantId)) {
      console.warn(`Variant '${variantId}' does not exist for room '${roomId}'.`);
      return;
    }

    const oldVariantId = this.getActiveVariantId(roomId);
    if (oldVariantId === variantId) return;

    this.activeVariantIds.set(roomId, variantId);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.getStorageKey(roomId), variantId);
      }
    } catch {
      // Ignore
    }

    for (const listener of this.listeners) {
      try {
        listener(roomId, variantId, oldVariantId);
      } catch (err) {
        console.error('Error in RoomVariantManager change listener:', err);
      }
    }
  }

  public getActiveRoomConfig(roomId: string): RoomConfig {
    const group = this.groups.get(roomId);
    if (!group) {
      throw new Error(`Room '${roomId}' has no registered variants.`);
    }
    const activeId = this.getActiveVariantId(roomId);
    const variant = group.variants.get(activeId);
    if (!variant) {
      throw new Error(`Active variant '${activeId}' not found for room '${roomId}'.`);
    }

    // Map canonical room ID so door transitions, companion state, and navigation operate transparently
    return {
      ...variant.config,
      id: roomId,
    };
  }

  public getVariantMeta(roomId: string, variantId: string): RoomVariantMeta | undefined {
    return this.groups.get(roomId)?.variants.get(variantId);
  }

  public getAllVariantsMeta(roomId: string): RoomVariantMeta[] {
    const group = this.groups.get(roomId);
    if (!group) return [];
    return Array.from(group.variants.values());
  }

  public getAllConfigs(): RoomConfig[] {
    const configs: RoomConfig[] = [];
    for (const group of this.groups.values()) {
      for (const variant of group.variants.values()) {
        configs.push(variant.config);
      }
    }
    return configs;
  }

  public onVariantChange(listener: RoomVariantChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const RoomVariantManager = new RoomVariantRegistryManager();
