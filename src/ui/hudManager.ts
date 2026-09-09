import { InteractiveTarget, CompanionState, DeepReadonly } from '../core/types';
import { TILE_SIZE, CANVAS_WIDTH } from '../core/constants';

export interface CanvasViewportTransform {
  left: number;
  top: number;
  scale: number;
}

export interface HudPromptPresentation {
  visible: boolean;
  name: string;
  action: string;
  isPortal: boolean;
  x: number;
  y: number;
}

export interface HudSpeechPresentation {
  visible: boolean;
  text: string;
  x: number;
  y: number;
}

export interface HudState {
  prompt: HudPromptPresentation | null;
  speech: HudSpeechPresentation | null;
}

/**
 * Pure derivation of HUD presentation state from game state and cached viewport transform.
 * Free of DOM side effects; directly testable without layout engines.
 */
export function deriveHudState(
  activeTarget: InteractiveTarget | null,
  companionState: DeepReadonly<CompanionState> | null,
  hasCompanion: boolean,
  isOverlayOpen: boolean,
  transform: CanvasViewportTransform,
  nowMs: number = Date.now()
): HudState {
  let prompt: HudPromptPresentation | null = null;
  let speech: HudSpeechPresentation | null = null;

  if (!isOverlayOpen && activeTarget) {
    let zoneX: number;
    let zoneY: number;
    let zoneW: number;
    let zoneH: number;
    let name: string;
    let action: string;
    let isPortal: boolean;

    if (activeTarget.kind === 'door') {
      const door = activeTarget.door;
      zoneX = door.tileX * TILE_SIZE;
      zoneY = door.tileY * TILE_SIZE;
      zoneW = door.tileWidth * TILE_SIZE;
      zoneH = door.tileHeight * TILE_SIZE;
      name = door.name;
      action = door.prompt;
      isPortal = true;
    } else {
      const station = activeTarget.station;
      zoneX = station.tileX * TILE_SIZE;
      zoneY = station.tileY * TILE_SIZE;
      zoneW = station.tileWidth * TILE_SIZE;
      zoneH = station.tileHeight * TILE_SIZE;
      name = station.name;
      action = station.prompt;
      isPortal = false;
    }

    const zoneCenterX = zoneX + zoneW / 2;
    let targetCanvasY = zoneY - 12;
    if (targetCanvasY < 40) {
      targetCanvasY = zoneY + zoneH + 22;
    }

    const screenX = transform.left + zoneCenterX * transform.scale;
    const screenY = transform.top + targetCanvasY * transform.scale;

    prompt = {
      visible: true,
      name,
      action,
      isPortal,
      x: screenX,
      y: screenY,
    };
  }

  if (!isOverlayOpen && hasCompanion && companionState && companionState.speech) {
    const elapsed = nowMs - companionState.speech.timestamp;
    if (elapsed >= 0 && elapsed < companionState.speech.durationMs) {
      const screenX = transform.left + (companionState.x + 8) * transform.scale;
      const screenY = transform.top + (companionState.y - 8) * transform.scale;
      speech = {
        visible: true,
        text: companionState.speech.text,
        x: screenX,
        y: screenY,
      };
    }
  }

  return { prompt, speech };
}

/**
 * State-diffed HUD presentation manager.
 *
 * Architectural Invariants:
 * 1. Zero layout thrashing: never calls getBoundingClientRect() inside the per-frame loop.
 *    The viewport coordinate transform is cached and updated only on resize/layout events via handleViewportChange().
 * 2. State-diffed DOM updates: operates on derived HudState. DOM styles, class names,
 *    and HTML are mutated ONLY when values have changed from the previous frame.
 */
export class HudManager {
  private promptEl: HTMLElement;
  private speechEl: HTMLElement;
  private transform: CanvasViewportTransform = { left: 0, top: 0, scale: 1 };
  private lastState: HudState = { prompt: null, speech: null };
  private resizeObserver: ResizeObserver | null = null;
  private observedCanvas: HTMLCanvasElement | null = null;

  constructor(promptEl: HTMLElement, speechEl: HTMLElement, canvas?: HTMLCanvasElement) {
    this.promptEl = promptEl;
    this.speechEl = speechEl;
    if (canvas) {
      this.attachCanvas(canvas);
    }
  }

  public attachCanvas(canvas: HTMLCanvasElement): void {
    this.observedCanvas = canvas;
    this.handleViewportChange(canvas);

    if (typeof ResizeObserver !== 'undefined') {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      this.resizeObserver = new ResizeObserver(() => {
        if (this.observedCanvas) {
          this.handleViewportChange(this.observedCanvas);
        }
      });
      this.resizeObserver.observe(canvas);
    }
  }

  public disconnect(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.observedCanvas = null;
  }

  public handleViewportChange(canvas: HTMLCanvasElement): void {
    const rect = canvas.getBoundingClientRect();
    this.transform = {
      left: rect.left,
      top: rect.top,
      scale: rect.width / CANVAS_WIDTH,
    };
  }

  public getTransform(): CanvasViewportTransform {
    return { ...this.transform };
  }

  public derive(
    activeTarget: InteractiveTarget | null,
    companionState: DeepReadonly<CompanionState> | null,
    hasCompanion: boolean,
    isOverlayOpen: boolean,
    nowMs: number = Date.now()
  ): HudState {
    return deriveHudState(activeTarget, companionState, hasCompanion, isOverlayOpen, this.transform, nowMs);
  }

  public update(nextState: HudState): void {
    // 1. Diff Prompt
    const prevPrompt = this.lastState.prompt;
    const nextPrompt = nextState.prompt;

    if (!nextPrompt) {
      if (prevPrompt) {
        this.promptEl.className = '';
      }
    } else {
      const targetClass = nextPrompt.isPortal ? 'visible portal-prompt' : 'visible';
      if (!prevPrompt || this.promptEl.className !== targetClass) {
        this.promptEl.className = targetClass;
      }

      if (!prevPrompt || prevPrompt.x !== nextPrompt.x || prevPrompt.y !== nextPrompt.y) {
        this.promptEl.style.left = `${nextPrompt.x}px`;
        this.promptEl.style.top = `${nextPrompt.y}px`;
      }

      if (
        !prevPrompt ||
        prevPrompt.name !== nextPrompt.name ||
        prevPrompt.action !== nextPrompt.action ||
        prevPrompt.isPortal !== nextPrompt.isPortal
      ) {
        this.promptEl.innerHTML = `
      <div class="prompt-keys">
        <kbd>Space</kbd>
        <kbd>Click</kbd>
      </div>
      <span class="prompt-name">${nextPrompt.name}</span>
      <span class="prompt-action">${nextPrompt.action}</span>
    `;
      }
    }

    // 2. Diff Speech
    const prevSpeech = this.lastState.speech;
    const nextSpeech = nextState.speech;

    if (!nextSpeech) {
      if (prevSpeech) {
        this.speechEl.className = '';
      }
    } else {
      if (!prevSpeech || this.speechEl.className !== 'visible') {
        this.speechEl.className = 'visible';
      }

      if (!prevSpeech || prevSpeech.x !== nextSpeech.x || prevSpeech.y !== nextSpeech.y) {
        this.speechEl.style.left = `${nextSpeech.x}px`;
        this.speechEl.style.top = `${nextSpeech.y}px`;
      }

      if (!prevSpeech || prevSpeech.text !== nextSpeech.text) {
        this.speechEl.textContent = nextSpeech.text;
      }
    }

    this.lastState = nextState;
  }

  public clear(): void {
    if (this.lastState.prompt) {
      this.promptEl.className = '';
    }
    if (this.lastState.speech) {
      this.speechEl.className = '';
    }
    this.lastState = { prompt: null, speech: null };
  }
}
