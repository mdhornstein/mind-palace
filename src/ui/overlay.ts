export class ModalOverlay {
  private static instance: ModalOverlay;
  private overlayEl: HTMLElement;
  private currentOnClose: (() => void) | null = null;

  private constructor() {
    let el = document.getElementById('modal-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'modal-overlay';
      document.body.appendChild(el);
    }
    this.overlayEl = el;

    // Close on click outside modal dialog
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.close();
      }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  public static getInstance(): ModalOverlay {
    if (!ModalOverlay.instance) {
      ModalOverlay.instance = new ModalOverlay();
    }
    return ModalOverlay.instance;
  }

  public open(contentHtml: string, onClose?: () => void) {
    this.currentOnClose = onClose || null;
    this.overlayEl.innerHTML = contentHtml;
    this.overlayEl.classList.add('active');

    // Attach close button listener if present
    const closeBtn = this.overlayEl.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    const footerClose = this.overlayEl.querySelector('.btn-close-modal');
    if (footerClose) {
      footerClose.addEventListener('click', () => this.close());
    }
  }

  public close() {
    if (!this.isOpen()) return;
    this.overlayEl.classList.remove('active');
    this.overlayEl.innerHTML = '';
    if (this.currentOnClose) {
      const cb = this.currentOnClose;
      this.currentOnClose = null;
      cb();
    }
  }

  public isOpen(): boolean {
    return this.overlayEl.classList.contains('active');
  }

  public getElement(): HTMLElement {
    return this.overlayEl;
  }
}
