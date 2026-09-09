import { WorldState } from './types';

export interface StateStore {
  load(): unknown | null;
  save(state: WorldState): void;
  clear(): void;
}

export class LocalStorageStore implements StateStore {
  constructor(private storageKey: string) {}

  load(): unknown | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[LocalStorageStore] Failed to load key "${this.storageKey}":`, err);
      return null;
    }
  }

  save(state: WorldState): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (err) {
      console.error(`[LocalStorageStore] Failed to save key "${this.storageKey}":`, err);
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (err) {
      console.warn(`[LocalStorageStore] Failed to clear key "${this.storageKey}":`, err);
    }
  }
}

export class MemoryStore implements StateStore {
  private value: WorldState | null = null;

  load(): unknown | null {
    return this.value ? structuredClone(this.value) : null;
  }

  save(state: WorldState): void {
    this.value = structuredClone(state);
  }

  clear(): void {
    this.value = null;
  }
}
