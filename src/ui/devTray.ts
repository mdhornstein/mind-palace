import { StateManager } from '../core/state';

export class DevTray {
  private el: HTMLElement;
  private isVisible = false;
  private stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.el = document.createElement('div');
    this.el.id = 'dev-tray';
    document.body.appendChild(this.el);

    this.setupListeners();
    this.render();
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      // Toggle on backtick (~) or Shift+D
      if (e.key === '`' || (e.shiftKey && e.key === 'D')) {
        // Prevent toggle if currently typing in an input
        if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          return;
        }
        e.preventDefault();
        this.toggle();
      }
    });

    this.stateManager.subscribe(() => {
      if (this.isVisible) {
        this.render();
      }
    });
  }

  public toggle() {
    this.isVisible = !this.isVisible;
    if (this.isVisible) {
      this.el.classList.add('visible');
      this.render();
    } else {
      this.el.classList.remove('visible');
    }
  }

  private render() {
    const state = this.stateManager.getState();
    const awayMins = Math.round(state.time.elapsedAwaySeconds / 60);

    this.el.innerHTML = `
      <div class="dev-title">
        <span>⏱️ Dev Time-Machine (~ to hide)</span>
        <button id="btn-dev-close" style="padding: 1px 6px; background: transparent; border: none; color: #94a3b8; font-size: 1rem; cursor: pointer;">&times;</button>
      </div>
      <div style="margin-bottom: 8px; font-size: 0.73rem; color: #cbd5e1;">
        Away: ${awayMins}m | Visits: ${state.time.totalVisits} | FEA: ${Math.floor(state.projects[0].progress * 100)}%
      </div>
      <div class="dev-btn-row">
        <button id="dev-plus-1h">+1 Hour</button>
        <button id="dev-plus-12h">+12 Hours</button>
        <button id="dev-plus-1d">+1 Day</button>
        <button id="dev-plus-1w">+1 Week</button>
      </div>
      <div class="dev-btn-row">
        <button id="dev-finish-fea" style="color: #6ee7b7;">Finish FEA</button>
        <button id="dev-reset-world" style="color: #fca5a5;">Reset World</button>
        <button id="dev-inspect-json">Log JSON</button>
      </div>
    `;

    this.el.querySelector('#btn-dev-close')?.addEventListener('click', () => this.toggle());

    this.el.querySelector('#dev-plus-1h')?.addEventListener('click', () => {
      this.stateManager.simulateTimeFastForward(3600);
    });

    this.el.querySelector('#dev-plus-12h')?.addEventListener('click', () => {
      this.stateManager.simulateTimeFastForward(43200);
    });

    this.el.querySelector('#dev-plus-1d')?.addEventListener('click', () => {
      this.stateManager.simulateTimeFastForward(86400);
    });

    this.el.querySelector('#dev-plus-1w')?.addEventListener('click', () => {
      this.stateManager.simulateTimeFastForward(604800);
    });

    this.el.querySelector('#dev-finish-fea')?.addEventListener('click', () => {
      this.stateManager.completeActiveSimulation();
    });

    this.el.querySelector('#dev-reset-world')?.addEventListener('click', () => {
      if (confirm('Reset Mind Palace to fresh seed state?')) {
        this.stateManager.resetWorld();
        window.location.reload();
      }
    });

    this.el.querySelector('#dev-inspect-json')?.addEventListener('click', () => {
      console.log('Current WorldState:', this.stateManager.getState());
      alert('WorldState logged to browser developer console (F12 / Cmd+Opt+I).');
    });
  }
}
