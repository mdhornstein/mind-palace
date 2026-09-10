import { describe, it, expect, beforeEach, vi } from 'vitest';

// Setup lightweight DOM mocks for headless Node test environment
const keydownListeners: Array<(e: any) => void> = [];
const mockOverlayEl: any = {
  id: 'modal-overlay',
  classList: {
    classes: new Set<string>(),
    contains(c: string) {
      return this.classes.has(c);
    },
    add(c: string) {
      this.classes.add(c);
    },
    remove(c: string) {
      this.classes.delete(c);
    },
  },
  innerHTML: '',
  children: [] as any[],
  appendChild(child: any) {
    this.children.push(child);
  },
  querySelector(_sel: string) {
    return null;
  },
  addEventListener: vi.fn(),
};

const mockDocument: any = {
  getElementById(id: string) {
    if (id === 'modal-overlay') return mockOverlayEl;
    return null;
  },
  createElement(tag: string) {
    const classes = new Set<string>();
    return {
      tagName: tag.toUpperCase(),
      className: '',
      innerHTML: '',
      style: {},
      classList: {
        contains: (c: string) => classes.has(c),
        add: (c: string) => classes.add(c),
        remove: (c: string) => classes.delete(c),
      },
      appendChild: vi.fn(),
      querySelector: () => null,
      addEventListener: vi.fn(),
    };
  },
  body: {
    appendChild: vi.fn(),
  },
};

const mockWindow: any = {
  addEventListener(event: string, handler: (e: any) => void) {
    if (event === 'keydown') {
      keydownListeners.push(handler);
    }
  },
  removeEventListener(event: string, handler: (e: any) => void) {
    if (event === 'keydown') {
      const idx = keydownListeners.indexOf(handler);
      if (idx !== -1) keydownListeners.splice(idx, 1);
    }
  },
  dispatchEvent(event: any) {
    if (event.type === 'keydown') {
      for (const listener of keydownListeners) {
        listener(event);
      }
    }
  },
};

vi.stubGlobal('document', mockDocument);
vi.stubGlobal('window', mockWindow);

describe('ModalOverlay & Universal Escape Key Closing', () => {
  let ModalOverlay: any;
  let openCoinPressModal: any;

  beforeEach(async () => {
    keydownListeners.length = 0;
    mockOverlayEl.classList.classes.clear();
    mockOverlayEl.innerHTML = '';
    mockOverlayEl.children.length = 0;

    const overlayModule = await import('../../src/ui/overlay');
    ModalOverlay = overlayModule.ModalOverlay;

    // Reset singleton instance if existing
    (ModalOverlay as any).instance = undefined;

    const coinModalsModule = await import('../../src/ui/coinModals');
    openCoinPressModal = coinModalsModule.openCoinPressModal;
  });

  it('opens and closes via openElement() cleanly', () => {
    const overlay = ModalOverlay.getInstance();
    expect(overlay.isOpen()).toBe(false);

    const dialog = mockDocument.createElement('div');
    dialog.className = 'modal-dialog';
    dialog.innerHTML = '<h2>Test Dialog</h2>';

    overlay.openElement(dialog);
    expect(overlay.isOpen()).toBe(true);

    overlay.close();
    expect(overlay.isOpen()).toBe(false);
  });

  it('closes any open modal on Escape keydown', () => {
    const overlay = ModalOverlay.getInstance();
    overlay.open('<div>Universal Modal Content</div>');
    expect(overlay.isOpen()).toBe(true);

    // Trigger Escape keydown on window
    mockWindow.dispatchEvent({ type: 'keydown', key: 'Escape', preventDefault: vi.fn() });
    expect(overlay.isOpen()).toBe(false);
  });

  it('integrates CoinModals with ModalOverlay and closes on Escape key', () => {
    const overlay = ModalOverlay.getInstance();
    expect(overlay.isOpen()).toBe(false);

    openCoinPressModal();
    expect(overlay.isOpen()).toBe(true);

    // Pressing Escape closes the coin modal
    mockWindow.dispatchEvent({ type: 'keydown', key: 'Escape', preventDefault: vi.fn() });
    expect(overlay.isOpen()).toBe(false);
  });
});
