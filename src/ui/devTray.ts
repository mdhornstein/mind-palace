import { StateManager } from '../core/state';
import { HearthAudio } from '../sound/audio';

export class DevTray {
  private el: HTMLElement;
  private hudEl: HTMLElement;
  private isVisible = false;
  private stateManager: StateManager;
  private hearthAudio: HearthAudio;

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
    this.hearthAudio = HearthAudio.getInstance();

    // 1. Sleek Floating HUD Controls in top-right corner
    this.hudEl = document.createElement('div');
    this.hudEl.id = 'hud-bar';
    document.body.appendChild(this.hudEl);

    // 2. Dev Time-Machine Tray
    this.el = document.createElement('div');
    this.el.id = 'dev-tray';
    document.body.appendChild(this.el);

    this.renderHud();
    this.setupListeners();
    this.render();
  }

  private renderHud() {
    const isPlaying = this.hearthAudio.getIsPlaying();
    this.hudEl.innerHTML = `
      <button id="btn-audio-toggle" class="hud-pill ${isPlaying ? 'active' : ''}" title="Toggle cozy procedural 8-bit chiptune soundtrack (Press M to mute/unmute)">
        ${isPlaying ? '🎶 8-Bit Music: Playing' : '🔇 8-Bit Music: Muted'}
      </button>
      <button id="btn-time-warp" class="hud-pill highlight" title="Simulate closing the app and returning hours or days later (~ or Shift+D)">
        ⏱️ Time Warp
      </button>
    `;

    this.hudEl.querySelector('#btn-audio-toggle')?.addEventListener('click', () => {
      this.hearthAudio.toggle();
      this.renderHud();
    });

    this.hudEl.querySelector('#btn-time-warp')?.addEventListener('click', () => {
      this.toggle();
    });
  }

  private setupListeners() {
    window.addEventListener('keydown', (e) => {
      // Toggle music on 'm' or 'M'
      if (e.key === 'm' || e.key === 'M') {
        if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          return;
        }
        this.hearthAudio.toggle();
        this.renderHud();
        return;
      }

      // Toggle time-warp on backtick (~) or Shift+D
      if (e.key === '`' || (e.shiftKey && e.key === 'D')) {
        // Prevent toggle if currently typing in an input/textarea
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
    const feaPercent = Math.floor(state.projects[0].progress * 100);
    const feaStatus = state.projects[0].status;

    this.el.innerHTML = `
      <div class="dev-title">
        <span>⏱️ Time Machine — Simulate Being Away</span>
        <button id="btn-dev-close" style="padding: 1px 6px; background: transparent; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer;">&times;</button>
      </div>
      <div style="margin-bottom: 6px; font-size: 0.72rem; color: #94a3b8; line-height: 1.35;">
        Simulate closing the palace and returning after hours or days away to test physical world evolution.
      </div>
      <div style="margin-bottom: 10px; font-size: 0.73rem; color: #fef08a; background: rgba(0,0,0,0.35); padding: 4px 8px; border-radius: 4px;">
        Away: ${awayMins}m | Visits: ${state.time.totalVisits} | FEA Progress: ${feaPercent}% (${feaStatus})
      </div>
      <div style="font-size: 0.68rem; color: #38bdf8; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">Fast-Forward Time</div>
      <div class="dev-btn-row">
        <button id="dev-plus-1h" title="Simulates being away 1 hour. Advances FEA mesh simulation.">+1 Hour (Advance FEA)</button>
        <button id="dev-plus-12h" title="Simulates 12 hours. Moves newly discovered specimens to the display pedestal.">+12 Hours (Display Fossils)</button>
      </div>
      <div class="dev-btn-row">
        <button id="dev-plus-1d" title="Simulates 1 day. Evolves chalkboard equations and companion greeting.">+1 Day (Multi-Day Shift)</button>
        <button id="dev-plus-1w" title="Simulates 1 week absence.">+1 Week</button>
      </div>
      <div style="font-size: 0.68rem; color: #a78bfa; text-transform: uppercase; font-weight: bold; margin-bottom: 4px; margin-top: 6px;">Actions</div>
      <div class="dev-btn-row">
        <button id="dev-finish-fea" style="color: #6ee7b7; border-color: #059669;">⚡ Finish FEA Now (von Mises Heatmap)</button>
      </div>
      <div class="dev-btn-row">
        <button id="dev-reset-world" style="color: #fca5a5; border-color: #dc2626;">↺ Reset to Seed Defaults</button>
        <button id="dev-inspect-json">📋 Log JSON</button>
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
      if (confirm('Reset Mind Palace to fresh seed state? (Will restore all defaults)')) {
        this.stateManager.resetWorld();
        window.location.reload();
      }
    });

    this.el.querySelector('#dev-inspect-json')?.addEventListener('click', () => {
      console.log('Current WorldState:', this.stateManager.getState());
      alert('WorldState JSON logged to browser developer console (F12 / Cmd+Opt+I).');
    });
  }
}
