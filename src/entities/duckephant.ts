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

    // Dark contour outline colors (Stardew signature silhouette)
    const OUTLINE = '#170c06';
    const DUCK_WING_OUTLINE = '#78350f';
    const ELEPHANT_OUTLINE = '#0f172a';

    // Tail Waggle & Wing Flap Animations
    const tailWag = Math.sin(timeMs * (isHappy ? 0.02 : 0.007)) * (isHappy ? 3 : 1.2);
    const wingFlap = isHappy ? Math.sin(timeMs * 0.025) * 2.5 : (isMoving ? Math.sin(this.walkStep * 2) * 1.2 : 0);

    // =========================================================================
    // 2. ORANGE WEBBED PADDLE FEET (with waddle stride)
    // =========================================================================
    if (!isNapping) {
      const footStride = isMoving ? Math.sin(this.walkStep * 2) * 4 : 0;
      const footLiftL = isMoving && Math.sin(this.walkStep * 2) > 0.1 ? -2 : 0;
      const footLiftR = isMoving && Math.sin(this.walkStep * 2) < -0.1 ? -2 : 0;

      // Front Webbed Foot (Left)
      const fxL = -6 + footStride;
      const fyL = 9 + footLiftL;
      // Leg stem
      pRect(ctx, fxL + 2, fyL - 2, 2, 3, '#c2410c');
      // Foot outline (wide webbed duck paddle with 3 pointed toes)
      pRect(ctx, fxL - 4, fyL + 1, 9, 4, OUTLINE);
      pRect(ctx, fxL - 5, fyL + 3, 2, 2, OUTLINE); // outer toe tip
      pRect(ctx, fxL - 2, fyL + 4, 2, 2, OUTLINE); // middle toe tip
      pRect(ctx, fxL + 2, fyL + 4, 2, 2, OUTLINE); // inner toe tip
      // Web fill
      pRect(ctx, fxL - 3, fyL + 2, 7, 2, '#ea580c');
      pRect(ctx, fxL - 4, fyL + 3, 2, 1, '#f97316');
      pRect(ctx, fxL - 1, fyL + 3, 2, 2, '#f97316');
      pRect(ctx, fxL + 2, fyL + 3, 2, 2, '#fb923c');

      // Rear Webbed Foot (Right, slightly darker for depth)
      const fxR = 5 - footStride;
      const fyR = 9 + footLiftR;
      // Leg stem
      pRect(ctx, fxR + 1, fyR - 2, 2, 3, '#9a3412');
      // Foot outline
      pRect(ctx, fxR - 3, fyR + 1, 8, 4, OUTLINE);
      pRect(ctx, fxR - 4, fyR + 3, 2, 2, OUTLINE);
      pRect(ctx, fxR - 1, fyR + 4, 2, 2, OUTLINE);
      pRect(ctx, fxR + 3, fyR + 3, 2, 2, OUTLINE);
      // Web fill
      pRect(ctx, fxR - 2, fyR + 2, 6, 2, '#c2410c');
      pRect(ctx, fxR - 3, fyR + 3, 2, 1, '#ea580c');
      pRect(ctx, fxR + 0, fyR + 3, 2, 2, '#ea580c');
      pRect(ctx, fxR + 3, fyR + 3, 1, 1, '#f97316');
    }

    // =========================================================================
    // 3. PERKY UPTURNED FEATHERED DUCK TAIL (with excited waggle)
    // =========================================================================
    const tx = 9;
    const ty = py - 1 + Math.floor(tailWag);

    // Tail Feather Cluster Outlines (3 layered perky duck tail feathers)
    // Top feather (pointing 45° up and back)
    pRect(ctx, tx + 1, ty - 8, 5, 4, OUTLINE);
    pRect(ctx, tx + 4, ty - 10, 3, 3, OUTLINE);
    // Middle main tail feather (longest tip)
    pRect(ctx, tx + 2, ty - 5, 8, 5, OUTLINE);
    pRect(ctx, tx + 8, ty - 4, 3, 3, OUTLINE);
    // Lower tail covert feather
    pRect(ctx, tx + 1, ty - 1, 6, 4, OUTLINE);

    // Tail Feathers Color Fills
    pRect(ctx, tx + 2, ty - 7, 3, 2, '#ca8a04'); // top feather mid
    pRect(ctx, tx + 4, ty - 9, 2, 2, '#fde047'); // top feather bright tip
    pRect(ctx, tx + 3, ty - 4, 6, 3, '#eab308'); // middle feather body
    pRect(ctx, tx + 7, ty - 3, 3, 2, '#fef08a'); // middle feather cream tip
    pRect(ctx, tx + 2, ty + 0, 4, 2, '#a16207'); // bottom feather shadow

    // =========================================================================
    // 4. PLUMP, CHUBBY DUCK BODY (Organic Rounded Duckling Silhouette)
    // =========================================================================
    // Dark Outer Silhouette Contours for Rounded Chubby Duck Body
    pRect(ctx, -7, py - 6, 17, 2, OUTLINE); // upper back
    pRect(ctx, -10, py - 4, 22, 2, OUTLINE); // back slope & upper breast
    pRect(ctx, -12, py - 2, 25, 4, OUTLINE); // puffed breast & mid body
    pRect(ctx, -12, py + 2, 24, 4, OUTLINE); // widest tummy span
    pRect(ctx, -10, py + 6, 21, 3, OUTLINE); // lower chubby belly
    pRect(ctx, -7, py + 8, 16, 2, OUTLINE);  // bottom belly between legs

    // Soft Golden Duck Plumage Base
    pRect(ctx, -6, py - 5, 15, 2, '#eab308'); // spine highlight
    pRect(ctx, -9, py - 3, 20, 2, '#eab308');
    pRect(ctx, -11, py - 1, 23, 3, '#f59e0b'); // warm golden body
    pRect(ctx, -11, py + 2, 22, 4, '#d97706'); // lower body shading
    pRect(ctx, -9, py + 6, 19, 2, '#b45309');  // belly shadow depth
    pRect(ctx, -6, py + 7, 14, 1, '#92400e');  // under-fluff shadow

    // Soft Creamy Duckling Breast & Tummy Fluff
    // Puffed-out chest curving proudly under the elephant chin
    pRect(ctx, -11, py - 1, 6, 5, '#fef08a'); // cream breast puff
    pRect(ctx, -10, py + 0, 4, 3, '#fef9c3'); // highlight fluff
    pRect(ctx, -6, py + 4, 9, 3, '#fef08a');  // belly downy fluff
    pRect(ctx, -4, py + 5, 6, 2, '#fef9c3');  // light belly center

    // =========================================================================
    // 5. LAYERED FOLDED DUCK WING (with scalloped covert feathers & flap)
    // =========================================================================
    const wx = -1;
    const wy = py - 1 + Math.floor(wingFlap);

    // Wing Outline (Teardrop Folded Wing)
    pRect(ctx, wx - 2, wy - 1, 12, 6, DUCK_WING_OUTLINE);
    pRect(ctx, wx + 6, wy + 1, 4, 4, DUCK_WING_OUTLINE); // trailing wingtip
    pRect(ctx, wx + 8, wy + 2, 3, 2, DUCK_WING_OUTLINE);

    // Wing Feathers Layering
    pRect(ctx, wx - 1, wy + 0, 10, 4, '#ca8a04'); // scapular base
    pRect(ctx, wx + 1, wy + 1, 7, 3, '#b45309');  // covert shadow
    pRect(ctx, wx + 5, wy + 2, 4, 2, '#92400e');  // flight feather quill

    // Scalloped Feather Highlights (classic duck wing bars)
    pRect(ctx, wx + 0, wy + 0, 3, 2, '#fde047'); // front wing scallop
    pRect(ctx, wx + 3, wy + 1, 3, 2, '#fde047'); // middle wing scallop
    pRect(ctx, wx + 7, wy + 2, 3, 1, '#fef08a'); // bright wingtip accent

    // =========================================================================
    // 6. CHIBI ELEPHANT HEAD (Soft Rounded Skull with Rosy Blushing Cheeks)
    // =========================================================================
    const hx = -9;
    const hy = py - 13;

    // Rounded Elephant Skull Silhouette Outline (beveled soft corners)
    pRect(ctx, hx - 7, hy - 3, 13, 2, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 9, hy - 1, 17, 14, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 8, hy + 12, 14, 2, ELEPHANT_OUTLINE);

    // Head Base Slate-Gray Fills
    pRect(ctx, hx - 6, hy - 2, 11, 2, '#64748b'); // forehead curve
    pRect(ctx, hx - 8, hy + 0, 15, 12, '#475569'); // slate base
    pRect(ctx, hx - 7, hy + 1, 13, 9, '#64748b');  // cheek & brow
    pRect(ctx, hx - 5, hy + 0, 8, 4, '#94a3b8');   // light forehead highlight

    // Large Floppy Ear with Soft Pink Interior (animated gentle flutter)
    const earTwitch = Math.sin(timeMs * 0.004) * 2;
    // Ear Outline (rounded)
    pRect(ctx, hx + 4, hy - 2 + earTwitch, 8, 14, ELEPHANT_OUTLINE);
    pRect(ctx, hx + 5, hy + 11 + earTwitch, 6, 2, ELEPHANT_OUTLINE);
    // Ear Fill
    pRect(ctx, hx + 5, hy - 1 + earTwitch, 6, 12, '#475569');
    pRect(ctx, hx + 6, hy + 1 + earTwitch, 4, 9, '#fda4af'); // baby pink inner ear
    pRect(ctx, hx + 7, hy + 3 + earTwitch, 2, 5, '#f472b6'); // deep rosy inner shadow

    // ADORABLE ROSY BLUSHING CHEEK (under eye)
    pRect(ctx, hx - 4, hy + 7, 3, 2, '#fb7185');

    // EXPRESSIVE ULTRA-CUTE EYE
    if (isHappy) {
      // Adorable anime smiling eye (^ ^)
      pRect(ctx, hx - 6, hy + 4, 5, 2, '#090d16');
      pRect(ctx, hx - 7, hy + 5, 2, 2, '#090d16');
      pRect(ctx, hx - 3, hy + 5, 2, 2, '#090d16');
    } else if (isNapping) {
      // Peaceful sleeping curve
      pRect(ctx, hx - 6, hy + 5, 5, 2, '#090d16');
      pRect(ctx, hx - 7, hy + 4, 2, 2, '#090d16');
    } else {
      // Big sparkling anime/chibi eye with dual specular reflections
      pRect(ctx, hx - 6, hy + 3, 4, 4, '#090d16'); // dark pupil box
      pRect(ctx, hx - 6, hy + 3, 2, 2, '#ffffff'); // bright primary catchlight
      pRect(ctx, hx - 4, hy + 5, 1, 1, '#bae6fd'); // soft secondary blue glimmer
      pRect(ctx, hx - 5, hy + 2, 3, 1, '#1e293b'); // soft upper eyelid
    }

    // Curved Miniature Ivory Tusks (cute little upturned nubs)
    pRect(ctx, hx - 10, hy + 8, 4, 3, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 11, hy + 6, 3, 3, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 9, hy + 9, 2, 2, '#fefce8'); // tusk base
    pRect(ctx, hx - 11, hy + 7, 2, 2, '#fef08a'); // golden-cream tip

    // =========================================================================
    // 7. ARTICULATED PREHENSILE TRUNK (expressive breathing & trumpet curl)
    // =========================================================================
    let trunkWave = Math.sin(timeMs * 0.005) * 3;
    if (isHappy) {
      trunkWave = 9 + Math.sin(timeMs * 0.018) * 4; // celebratory high trumpet!
    } else if (isNapping) {
      trunkWave = -2; // relaxed downward curl
    }

    // Trunk Base (attached firmly to face)
    pRect(ctx, hx - 11, hy + 5, 4, 4, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 10, hy + 6, 2, 2, '#64748b');

    // Trunk Mid-Shaft
    const tMidY = hy + 7 - trunkWave * 0.4;
    pRect(ctx, hx - 14, tMidY, 5, 5, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 13, tMidY + 1, 3, 3, '#475569');

    // Trunk Prehensile Tip (smooth curl)
    const tTipY = hy + 6 - trunkWave * 0.9;
    pRect(ctx, hx - 17, tTipY, 5, 5, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 16, tTipY + 1, 3, 3, '#64748b');
    // Curled nostril tip
    const tEndLipY = hy + 5 - trunkWave * 1.25;
    pRect(ctx, hx - 16, tEndLipY, 4, 4, ELEPHANT_OUTLINE);
    pRect(ctx, hx - 15, tEndLipY + 1, 2, 2, '#94a3b8');

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
