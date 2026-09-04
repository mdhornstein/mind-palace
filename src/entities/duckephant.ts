import { Direction } from '../core/types';
import { pRect } from '../render/sprites';
import { HearthAudio } from '../sound/audio';

export type DuckephantActivity = 'idle' | 'waddling' | 'napping' | 'happy';

export class Duckephant {
  public x: number;
  public y: number;
  public homeX: number;
  public homeY: number;
  public homeRadius: number;
  public facing: Direction = 'left';
  public activity: DuckephantActivity = 'idle';

  private targetX: number;
  private targetY: number;
  private stateTimer = 0;
  private walkStep = 0;
  private happyTimer = 0;
  private hearts: Array<{ x: number; y: number; alpha: number }> = [];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.homeX = x;
    this.homeY = y;
    this.targetX = x;
    this.targetY = y;
    this.homeRadius = 24; // Bounded within cozy ~1.5 tiles radius of home mat
    this.pickNextAction();
  }

  private pickNextAction() {
    this.stateTimer = 2500 + Math.random() * 4000;
    const roll = Math.random();

    if (roll < 0.45) {
      // Idle / sniffing around
      this.activity = 'idle';
    } else if (roll < 0.75) {
      // Gentle waddle to a new spot within home radius
      this.activity = 'waddling';
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * this.homeRadius;
      this.targetX = this.homeX + Math.cos(angle) * dist;
      this.targetY = this.homeY + Math.sin(angle) * (dist * 0.6); // slight vertical ellipse
      this.facing = this.targetX < this.x ? 'left' : 'right';
    } else {
      // Cozy nap near the fire
      this.activity = 'napping';
      this.stateTimer = 5000 + Math.random() * 5000;
    }
  }

  public update(dtMs: number, playerX: number, playerY: number) {
    // 1. Process Happiness Emotes
    if (this.happyTimer > 0) {
      this.happyTimer -= dtMs;
      if (this.happyTimer <= 0) {
        this.activity = 'idle';
      }
    }

    // Update floating hearts
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      const h = this.hearts[i];
      h.y -= 0.04 * dtMs;
      h.alpha -= 0.001 * dtMs;
      if (h.alpha <= 0) {
        this.hearts.splice(i, 1);
      }
    }

    // 2. React to Player Proximity
    const distToPlayer = Math.hypot(this.x - playerX, this.y - playerY);
    if (distToPlayer < 40 && this.activity !== 'happy') {
      // Turn curiously toward player
      this.facing = playerX < this.x ? 'left' : 'right';
    }

    // 3. Activity State Machine
    this.stateTimer -= dtMs;

    if (this.activity === 'waddling') {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 2 || this.stateTimer <= 0) {
        this.x = this.targetX;
        this.y = this.targetY;
        this.activity = 'idle';
        this.stateTimer = 2000 + Math.random() * 3000;
      } else {
        const speed = 0.022 * dtMs;
        this.x += (dx / dist) * Math.min(dist, speed);
        this.y += (dy / dist) * Math.min(dist, speed);
        this.walkStep += 0.015 * dtMs;
      }
    } else if (this.activity !== 'happy' && this.stateTimer <= 0) {
      this.pickNextAction();
    }
  }

  public pet() {
    this.activity = 'happy';
    this.happyTimer = 3500;
    this.stateTimer = 4000;
    HearthAudio.getInstance().playTrumpetQuack();

    // Spawn celebratory heart particles
    for (let i = 0; i < 3; i++) {
      this.hearts.push({
        x: this.x + (Math.random() - 0.5) * 16,
        y: this.y - 10 - i * 6,
        alpha: 1.0,
      });
    }
  }

  public feedPeanut() {
    this.activity = 'happy';
    this.happyTimer = 4000;
    this.stateTimer = 4500;
    HearthAudio.getInstance().playMunch();

    setTimeout(() => {
      HearthAudio.getInstance().playTrumpetQuack();
    }, 450);

    for (let i = 0; i < 4; i++) {
      this.hearts.push({
        x: this.x + (Math.random() - 0.5) * 18,
        y: this.y - 12 - i * 5,
        alpha: 1.0,
      });
    }
  }

  /**
   * Render the Duckephant's cozy hearthside mat (drawn behind actors)
   */
  public renderHomeMat(ctx: CanvasRenderingContext2D) {
    const mx = Math.floor(this.homeX);
    const my = Math.floor(this.homeY + 6);

    // Braided woven reed pet rug with warm firelight sheen
    ctx.save();
    ctx.fillStyle = 'rgba(15, 8, 4, 0.4)';
    ctx.beginPath();
    ctx.ellipse(mx, my + 2, 22, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Outer braided border
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(mx, my, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner patterned woven mat
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(mx, my, 17, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Center cozy rosette
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(mx - 1, my - 1, 3, 2);
    ctx.restore();
  }

  /**
   * Render the Duckephant sprite (with animated waddle, trunk, ears, tusks)
   */
  public render(ctx: CanvasRenderingContext2D, timeMs: number) {
    const bx = Math.floor(this.x);
    const by = Math.floor(this.y);
    const isLeft = this.facing === 'left';

    // Animations
    const isMoving = this.activity === 'waddling';
    const isHappy = this.activity === 'happy';
    const isNapping = this.activity === 'napping';

    const breath = Math.sin(timeMs * 0.004) * 0.8;
    const waddleBob = isMoving ? Math.abs(Math.sin(this.walkStep * 2)) * 1.5 : 0;
    const waddleTilt = isMoving ? Math.sin(this.walkStep * 2) * 0.08 : 0;

    // 1. Soft Contact Shadow
    ctx.fillStyle = 'rgba(12, 6, 3, 0.5)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 10, 10, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(bx, by);
    if (!isLeft) {
      ctx.scale(-1, 1);
    }
    ctx.rotate(waddleTilt);

    const py = Math.floor(-waddleBob - (isNapping ? 1 : breath));

    // 2. Orange Webbed Feet
    if (!isNapping) {
      const footL = isMoving ? Math.sin(this.walkStep * 2) * 2.5 : 0;
      const footR = isMoving ? -Math.sin(this.walkStep * 2) * 2.5 : 0;

      // Left foot
      pRect(ctx, -6 + footL, 8, 4, 2, '#ea580c');
      pRect(ctx, -7 + footL, 9, 6, 2, '#f97316');

      // Right foot
      pRect(ctx, 1 + footR, 8, 4, 2, '#c2410c');
      pRect(ctx, 0 + footR, 9, 6, 2, '#ea580c');
    }

    // 3. Plump Feathered Duck Body
    // Rear tail feathers
    pRect(ctx, 6, py - 4, 5, 4, '#854d0e');
    pRect(ctx, 8, py - 6, 4, 3, '#a16207');
    pRect(ctx, 9, py - 7, 2, 2, '#ca8a04');

    // Main torso
    pRect(ctx, -4, py - 5, 12, 12, '#ca8a04'); // base golden-brown
    pRect(ctx, -2, py - 4, 11, 10, '#eab308'); // warm feather highlight
    pRect(ctx, -4, py + 1, 8, 5, '#fef08a');   // soft light breast feathers
    pRect(ctx, 1, py - 2, 6, 5, '#a16207');    // wing covert plumage

    // 4. Slate-Gray Elephant Head
    const hx = -6;
    const hy = py - 8;

    pRect(ctx, hx - 5, hy - 1, 9, 10, '#475569'); // head base
    pRect(ctx, hx - 4, hy, 8, 8, '#64748b');     // forehead & cheek
    pRect(ctx, hx - 3, hy + 1, 6, 4, '#94a3b8'); // soft cranial brow

    // Floppy Ear
    const earWiggle = Math.sin(timeMs * 0.003) * 1.2;
    pRect(ctx, hx + 1, hy - 1 + earWiggle, 5, 8, '#475569');
    pRect(ctx, hx + 2, hy + 1 + earWiggle, 3, 5, '#fda4af'); // pink inner ear

    // Expressive Eye
    if (isNapping) {
      // Sleeping happy curve
      pRect(ctx, hx - 3, hy + 3, 3, 1, '#1e293b');
    } else {
      pRect(ctx, hx - 3, hy + 2, 2, 3, '#0f172a');
      pRect(ctx, hx - 3, hy + 2, 1, 1, '#ffffff'); // bright glint
    }

    // Twin Curved Ivory Tusks
    pRect(ctx, hx - 6, hy + 6, 3, 2, '#fefce8');
    pRect(ctx, hx - 7, hy + 5, 2, 2, '#fffbeb');
    pRect(ctx, hx - 8, hy + 4, 2, 2, '#fef08a');

    // 5. Articulated Artful Elephant Mini-Trunk!
    let trunkWave = Math.sin(timeMs * 0.005) * 2;
    if (isHappy) {
      // High ecstatic trunk curl!
      trunkWave = 5 + Math.sin(timeMs * 0.015) * 2;
    } else if (isNapping) {
      trunkWave = -1;
    }

    // Trunk base
    pRect(ctx, hx - 7, hy + 4, 3, 3, '#64748b');
    // Trunk mid-shaft
    pRect(ctx, hx - 9, hy + 5 - trunkWave * 0.4, 3, 3, '#475569');
    // Trunk curl tip
    pRect(ctx, hx - 11, hy + 4 - trunkWave * 0.8, 3, 2, '#64748b');
    pRect(ctx, hx - 10, hy + 3 - trunkWave * 1.0, 2, 2, '#94a3b8');

    ctx.restore();

    // 6. Floating Heart Emotes
    for (const heart of this.hearts) {
      const hx = Math.floor(heart.x);
      const hy = Math.floor(heart.y);
      pRect(ctx, hx - 2, hy - 1, 2, 2, `rgba(244, 63, 94, ${heart.alpha})`);
      pRect(ctx, hx + 1, hy - 1, 2, 2, `rgba(244, 63, 94, ${heart.alpha})`);
      pRect(ctx, hx - 3, hy, 7, 2, `rgba(244, 63, 94, ${heart.alpha})`);
      pRect(ctx, hx - 2, hy + 2, 5, 2, `rgba(244, 63, 94, ${heart.alpha})`);
      pRect(ctx, hx - 1, hy + 4, 3, 1, `rgba(244, 63, 94, ${heart.alpha})`);
      pRect(ctx, hx, hy + 5, 1, 1, `rgba(244, 63, 94, ${heart.alpha})`);
    }

    // 7. Sleeping 'Z's
    if (isNapping) {
      const zPhase = (timeMs * 0.002) % 3;
      const zAlpha = Math.max(0, Math.sin((zPhase / 3) * Math.PI));
      const zY = by - 12 - zPhase * 5;
      const zX = bx + (isLeft ? -8 : 8);
      pRect(ctx, zX - 2, zY, 5, 1, `rgba(186, 230, 253, ${zAlpha})`);
      pRect(ctx, zX + 1, zY + 1, 2, 1, `rgba(186, 230, 253, ${zAlpha})`);
      pRect(ctx, zX - 1, zY + 2, 2, 1, `rgba(186, 230, 253, ${zAlpha})`);
      pRect(ctx, zX - 2, zY + 3, 5, 1, `rgba(186, 230, 253, ${zAlpha})`);
    }
  }
}
