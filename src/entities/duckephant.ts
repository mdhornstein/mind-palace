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
    const my = Math.floor(this.homeY + 8);

    ctx.save();
    // Soft contact shadow of the large mat
    ctx.fillStyle = 'rgba(10, 5, 2, 0.45)';
    ctx.beginPath();
    ctx.ellipse(mx, my + 3, 30, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark woven outer border (outline)
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.ellipse(mx, my, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Braided golden-bronze border
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.ellipse(mx, my, 26, 12.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner patterned woven reed mat
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(mx, my, 23, 10.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hearth firelight center medallion
    ctx.fillStyle = '#fde047';
    ctx.fillRect(mx - 2, my - 1, 5, 3);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(mx - 1, my, 3, 1);
    ctx.restore();
  }

  /**
   * Render the Duckephant sprite (with animated waddle, trunk, ears, tusks, and Stardew dark outline)
   */
  public render(ctx: CanvasRenderingContext2D, timeMs: number) {
    const bx = Math.floor(this.x);
    const by = Math.floor(this.y);
    const isLeft = this.facing === 'left';

    // Animations
    const isMoving = this.activity === 'waddling';
    const isHappy = this.activity === 'happy';
    const isNapping = this.activity === 'napping';

    const breath = Math.sin(timeMs * 0.0035) * 1.2;
    const waddleBob = isMoving ? Math.abs(Math.sin(this.walkStep * 2)) * 2.2 : 0;
    const waddleTilt = isMoving ? Math.sin(this.walkStep * 2) * 0.1 : 0;

    // 1. Heavy Stardew Ground Shadow
    ctx.fillStyle = 'rgba(10, 5, 2, 0.6)';
    ctx.beginPath();
    ctx.ellipse(bx, by + 14, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(bx, by);
    if (!isLeft) {
      ctx.scale(-1, 1);
    }
    ctx.rotate(waddleTilt);

    const py = Math.floor(-waddleBob - (isNapping ? 2 : breath));

    // Dark contour outline color (Stardew signature silhouette)
    const OUTLINE = '#170c06';
    const ELEPHANT_OUTLINE = '#0f172a';

    // =========================================================================
    // 2. ORANGE WEBBED FEET (with dark outline)
    // =========================================================================
    if (!isNapping) {
      const footL = isMoving ? Math.sin(this.walkStep * 2) * 3.5 : 0;
      const footR = isMoving ? -Math.sin(this.walkStep * 2) * 3.5 : 0;

      // Left Foot (Front)
      pRect(ctx, -10 + footL, 10, 8, 5, OUTLINE);
      pRect(ctx, -9 + footL, 11, 6, 3, '#ea580c');
      pRect(ctx, -10 + footL, 13, 7, 2, '#f97316'); // webbed toe tips

      // Right Foot (Rear)
      pRect(ctx, 3 + footR, 10, 8, 5, OUTLINE);
      pRect(ctx, 4 + footR, 11, 6, 3, '#c2410c');
      pRect(ctx, 3 + footR, 13, 7, 2, '#ea580c');
    }

    // =========================================================================
    // 3. PLUMP FEATHERED DUCK BODY (with dark outline)
    // =========================================================================
    // Tail Feathers Silhouette Outline
    pRect(ctx, 9, py - 9, 8, 7, OUTLINE);
    pRect(ctx, 13, py - 12, 6, 6, OUTLINE);
    // Tail Feathers Fill
    pRect(ctx, 10, py - 8, 6, 5, '#854d0e');
    pRect(ctx, 14, py - 11, 4, 4, '#ca8a04');
    pRect(ctx, 11, py - 6, 4, 3, '#eab308');

    // Main Torso Silhouette Outline
    pRect(ctx, -7, py - 9, 19, 19, OUTLINE);

    // Torso Fill & Feathers
    pRect(ctx, -6, py - 8, 17, 17, '#ca8a04'); // base golden-buff
    pRect(ctx, -4, py - 6, 14, 14, '#eab308'); // warm golden body
    pRect(ctx, -6, py + 1, 10, 8, '#fef08a');  // cream breast plumage

    // Wing Covert Wing Flap
    pRect(ctx, 0, py - 3, 9, 8, '#854d0e');   // wing shadow
    pRect(ctx, 1, py - 2, 7, 6, '#b45309');   // wing plumage
    pRect(ctx, 3, py - 1, 4, 4, '#fde047');   // wing tip highlight

    // =========================================================================
    // 4. SLATE-GRAY ELEPHANT HEAD (with dark outline)
    // =========================================================================
    const hx = -9;
    const hy = py - 13;

    // Head Silhouette Outline
    pRect(ctx, hx - 8, hy - 2, 15, 16, ELEPHANT_OUTLINE);

    // Head Base Fill
    pRect(ctx, hx - 7, hy - 1, 13, 14, '#475569'); // slate shadow
    pRect(ctx, hx - 6, hy, 11, 12, '#64748b');     // forehead & cheek
    pRect(ctx, hx - 5, hy + 1, 8, 6, '#94a3b8');   // light brow highlight

    // Large Floppy Ear (animated ear twitch)
    const earTwitch = Math.sin(timeMs * 0.004) * 2;
    // Ear Outline
    pRect(ctx, hx + 3, hy - 2 + earTwitch, 8, 13, ELEPHANT_OUTLINE);
    // Ear Fill
    pRect(ctx, hx + 4, hy - 1 + earTwitch, 6, 11, '#475569');
    pRect(ctx, hx + 5, hy + 2 + earTwitch, 4, 7, '#fda4af'); // pink inner ear

    // Expressive Large Eye
    if (isNapping) {
      // Happy sleeping curve
      pRect(ctx, hx - 4, hy + 4, 4, 2, '#0f172a');
    } else {
      // Big expressive Stardew eye
      pRect(ctx, hx - 5, hy + 3, 4, 4, '#0f172a');
      pRect(ctx, hx - 5, hy + 3, 2, 2, '#ffffff'); // bright glint
      pRect(ctx, hx - 4, hy + 2, 2, 1, '#1e293b'); // eyebrow
    }

    // Twin Curved Ivory Tusks
    pRect(ctx, hx - 9, hy + 8, 5, 4, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 8, hy + 9, 3, 2, '#fefce8');
    pRect(ctx, hx - 10, hy + 7, 3, 2, '#fffbeb');
    pRect(ctx, hx - 11, hy + 6, 2, 2, '#fde047'); // gold tip

    // =========================================================================
    // 5. ARTICULATED PROBOSCIS TRUNK (curling with dark outline)
    // =========================================================================
    let trunkWave = Math.sin(timeMs * 0.005) * 3;
    if (isHappy) {
      trunkWave = 8 + Math.sin(timeMs * 0.015) * 3;
    } else if (isNapping) {
      trunkWave = -2;
    }

    // Trunk Base Outline & Fill
    pRect(ctx, hx - 11, hy + 5, 5, 5, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 10, hy + 6, 3, 3, '#64748b');

    // Trunk Mid-Shaft
    pRect(ctx, hx - 14, hy + 7 - trunkWave * 0.4, 5, 5, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 13, hy + 8 - trunkWave * 0.4, 3, 3, '#475569');

    // Trunk Curled Tip
    pRect(ctx, hx - 17, hy + 6 - trunkWave * 0.9, 5, 5, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 16, hy + 7 - trunkWave * 0.9, 3, 3, '#64748b');
    pRect(ctx, hx - 15, hy + 5 - trunkWave * 1.2, 4, 4, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 14, hy + 6 - trunkWave * 1.2, 2, 2, '#94a3b8');

    ctx.restore();

    // =========================================================================
    // 6. FLOATING HEART EMOTES & SLEEP PARTICLES
    // =========================================================================
    for (const heart of this.hearts) {
      const hx = Math.floor(heart.x);
      const hy = Math.floor(heart.y);
      pRect(ctx, hx - 3, hy - 2, 3, 3, `rgba(244, 63, 94, ${heart.alpha})`);
      pRect(ctx, hx + 1, hy - 2, 3, 3, `rgba(244, 63, 94, ${heart.alpha})`);
      pRect(ctx, hx - 4, hy, 9, 3, `rgba(244, 63, 94, ${heart.alpha})`);
      pRect(ctx, hx - 3, hy + 3, 7, 3, `rgba(244, 63, 94, ${heart.alpha})`);
      pRect(ctx, hx - 2, hy + 6, 5, 2, `rgba(244, 63, 94, ${heart.alpha})`);
      pRect(ctx, hx - 1, hy + 8, 3, 2, `rgba(244, 63, 94, ${heart.alpha})`);
    }

    if (isNapping) {
      const zPhase = (timeMs * 0.002) % 3;
      const zAlpha = Math.max(0, Math.sin((zPhase / 3) * Math.PI));
      const zY = by - 16 - zPhase * 7;
      const zX = bx + (isLeft ? -12 : 12);
      ctx.fillStyle = `rgba(186, 230, 253, ${zAlpha})`;
      pRect(ctx, zX - 3, zY, 7, 2, `rgba(186, 230, 253, ${zAlpha})`);
      pRect(ctx, zX + 2, zY + 2, 2, 2, `rgba(186, 230, 253, ${zAlpha})`);
      pRect(ctx, zX - 1, zY + 4, 3, 2, `rgba(186, 230, 253, ${zAlpha})`);
      pRect(ctx, zX - 3, zY + 6, 7, 2, `rgba(186, 230, 253, ${zAlpha})`);
    }
  }
}
