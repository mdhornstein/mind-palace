import { HearthAudio } from '../../sound/audio';
import { RenderableEntity } from '../../core/types';

export type CoinDenomination = 'copper' | 'silver' | 'gold' | 'star';

export interface CoinDefinition {
  id: CoinDenomination;
  name: string;
  value: number;
  radius: number;
  primaryColor: string;
  darkColor: string;
  highlightColor: string;
  rimColor: string;
  symbol: string;
}

export const COIN_DEFINITIONS: Record<CoinDenomination, CoinDefinition> = {
  copper: {
    id: 'copper',
    name: 'Copper Penny',
    value: 1,
    radius: 5.5,
    primaryColor: '#b45309',
    darkColor: '#78350f',
    highlightColor: '#f59e0b',
    rimColor: '#d97706',
    symbol: '1',
  },
  silver: {
    id: 'silver',
    name: 'Silver Shilling',
    value: 5,
    radius: 7.0,
    primaryColor: '#94a3b8',
    darkColor: '#475569',
    highlightColor: '#f8fafc',
    rimColor: '#cbd5e1',
    symbol: '5',
  },
  gold: {
    id: 'gold',
    name: 'Gold Sovereign',
    value: 10,
    radius: 8.5,
    primaryColor: '#eab308',
    darkColor: '#854d0e',
    highlightColor: '#fef08a',
    rimColor: '#facc15',
    symbol: '10',
  },
  star: {
    id: 'star',
    name: 'Royal Star Medal',
    value: 50,
    radius: 10.0,
    primaryColor: '#38bdf8',
    darkColor: '#0369a1',
    highlightColor: '#e0f2fe',
    rimColor: '#7dd3fc',
    symbol: '★',
  },
};

export interface BouncingCoin {
  id: string;
  denomination: CoinDenomination;
  x: number; // ground plane X
  y: number; // ground plane Y
  z: number; // elevation above ground (px)
  vx: number; // ground velocity X (px/s)
  vy: number; // ground velocity Y (px/s)
  vz: number; // vertical velocity (px/s, positive = upward)
  rotation: number; // 0 to 2*PI
  spinSpeed: number; // rad/s
  isSettled: boolean;
  ageMs: number;
  flashTimer: number;
}

export interface CoinPickupEffect {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface CoinSparkle {
  x: number;
  y: number;
  size: number;
  alpha: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
}

export class CoinPhysicsEngine {
  private static instance: CoinPhysicsEngine | null = null;
  private coins: BouncingCoin[] = [];
  private pickupEffects: CoinPickupEffect[] = [];
  private sparkles: CoinSparkle[] = [];
  private nextCoinId = 1;

  // Combo pickup tracking
  private lastPickupTime = 0;
  private comboStreak = 0;

  // Currency wallet counter
  private totalCollected = 0;
  private totalMinted = 0;
  private onCollectCallbacks: Array<(amount: number, total: number) => void> = [];

  private constructor() {
    // Load persisted wallet from localStorage if present
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('mind_palace_coins_wallet');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.totalCollected = parsed.totalCollected || 0;
          this.totalMinted = parsed.totalMinted || 0;
        } catch {
          // fallback to 0
        }
      }
    }
  }

  public static getInstance(): CoinPhysicsEngine {
    if (!CoinPhysicsEngine.instance) {
      CoinPhysicsEngine.instance = new CoinPhysicsEngine();
    }
    return CoinPhysicsEngine.instance;
  }

  public onCollect(callback: (amount: number, total: number) => void) {
    this.onCollectCallbacks.push(callback);
  }

  public getTotalCollected(): number {
    return this.totalCollected;
  }

  public getTotalMinted(): number {
    return this.totalMinted;
  }

  public getCoins(): readonly BouncingCoin[] {
    return this.coins;
  }

  public resetWallet() {
    this.totalCollected = 0;
    this.totalMinted = 0;
    this.saveWallet();
  }

  private saveWallet() {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        'mind_palace_coins_wallet',
        JSON.stringify({
          totalCollected: this.totalCollected,
          totalMinted: this.totalMinted,
        })
      );
    }
  }

  public clearCoins() {
    this.coins = [];
    this.pickupEffects = [];
    this.sparkles = [];
  }

  /**
   * Spawns a burst of physical coins spraying out from an origin point
   */
  public spawnBurst(
    originX: number,
    originY: number,
    count: number = 6,
    forcedDenomination?: CoinDenomination,
    originZ: number = 32
  ) {
    const audio = HearthAudio.getInstance();
    audio.playCoinEject();

    for (let i = 0; i < count; i++) {
      let denom: CoinDenomination = forcedDenomination || 'copper';
      if (!forcedDenomination) {
        const roll = Math.random();
        if (roll < 0.50) denom = 'copper';
        else if (roll < 0.85) denom = 'silver';
        else if (roll < 0.97) denom = 'gold';
        else denom = 'star';
      }

      // Fan-out velocity spraying downward and outward from hopper
      const angle = (Math.PI / 2) + (Math.random() - 0.5) * 1.8; // generally outward / downwards
      const speed = 40 + Math.random() * 85;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed * 0.7 + 35; // slightly pushed down toward floor
      const vz = 100 + Math.random() * 120; // launch upward in Z

      const coin: BouncingCoin = {
        id: `coin_${this.nextCoinId++}`,
        denomination: denom,
        x: originX + (Math.random() - 0.5) * 8,
        y: originY + (Math.random() - 0.5) * 4,
        z: originZ,
        vx,
        vy,
        vz,
        rotation: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 20),
        isSettled: false,
        ageMs: 0,
        flashTimer: 0.3,
      };

      this.coins.push(coin);
      this.totalMinted += COIN_DEFINITIONS[denom].value;

      // Add a couple of initial golden sparkles at spawn
      this.addSparkle(originX, originY - originZ, COIN_DEFINITIONS[denom].highlightColor);
    }

    this.saveWallet();
  }

  public addSparkle(x: number, y: number, color: string = '#fef08a') {
    this.sparkles.push({
      x,
      y,
      size: 1.5 + Math.random() * 2.5,
      alpha: 1.0,
      color,
      vx: (Math.random() - 0.5) * 40,
      vy: -15 - Math.random() * 35,
      life: 0.4 + Math.random() * 0.3,
    });
  }

  /**
   * Frame-rate normalized update loop for all physical coins and pickup effects
   */
  public update(
    dtSeconds: number,
    playerFeet: { x: number; y: number },
    roomBounds: { minX: number; maxX: number; minY: number; maxY: number }
  ) {
    const audio = HearthAudio.getInstance();
    const gravity = 360; // px/s^2
    const restitution = 0.62; // vertical ground bounce energy retention
    const groundFriction = 0.82; // horizontal friction on ground impact
    const airDrag = 0.985;
    const now = Date.now();

    // 1. Update Bouncing Coins
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.ageMs += dtSeconds * 1000;
      if (coin.flashTimer > 0) coin.flashTimer -= dtSeconds;

      if (!coin.isSettled) {
        // Apply 3D tumbling rotation
        coin.rotation += coin.spinSpeed * dtSeconds;

        // Apply air drag
        coin.vx *= airDrag;
        coin.vy *= airDrag;

        // Apply gravity to vertical elevation
        coin.vz -= gravity * dtSeconds;

        // Move position
        coin.x += coin.vx * dtSeconds;
        coin.y += coin.vy * dtSeconds;
        coin.z += coin.vz * dtSeconds;

        // Wall boundary collisions
        if (coin.x < roomBounds.minX) {
          coin.x = roomBounds.minX;
          coin.vx = -coin.vx * 0.7;
        } else if (coin.x > roomBounds.maxX) {
          coin.x = roomBounds.maxX;
          coin.vx = -coin.vx * 0.7;
        }
        if (coin.y < roomBounds.minY) {
          coin.y = roomBounds.minY;
          coin.vy = -coin.vy * 0.7;
        } else if (coin.y > roomBounds.maxY) {
          coin.y = roomBounds.maxY;
          coin.vy = -coin.vy * 0.7;
        }

        // Ground collision (z <= 0)
        if (coin.z <= 0) {
          coin.z = 0;
          const impactSpeed = Math.abs(coin.vz);

          if (impactSpeed > 22) {
            // Significant bounce
            coin.vz = impactSpeed * restitution;
            coin.vx *= groundFriction;
            coin.vy *= groundFriction;
            coin.spinSpeed *= 0.8;

            // Trigger synthesized metallic clink!
            audio.playCoinBounce(coin.denomination, impactSpeed);
            this.addSparkle(coin.x, coin.y, COIN_DEFINITIONS[coin.denomination].highlightColor);
          } else {
            // Low energy: settle down
            coin.vz = 0;
            coin.vx *= 0.7;
            coin.vy *= 0.7;

            if (Math.abs(coin.vx) < 2 && Math.abs(coin.vy) < 2) {
              coin.vx = 0;
              coin.vy = 0;
              coin.isSettled = true;
              coin.spinSpeed = 0;
              coin.rotation = Math.PI / 2; // settled flat
            }
          }
        }
      }

      // 2. Player Proximity Pickup Detection
      // Player feet are at (playerFeet.x, playerFeet.y)
      const dx = coin.x - playerFeet.x;
      const dy = coin.y - playerFeet.y;
      const distSq = dx * dx + dy * dy;
      const pickupRadius = 26; // 26px proximity

      if (distSq < pickupRadius * pickupRadius && coin.z < 20) {
        // Collect coin!
        const def = COIN_DEFINITIONS[coin.denomination];
        const val = def.value;

        // Combo streak multiplier
        if (now - this.lastPickupTime < 1300) {
          this.comboStreak++;
        } else {
          this.comboStreak = 0;
        }
        this.lastPickupTime = now;

        // Play glorious ascending chime
        audio.playCoinPickup(this.comboStreak);

        // Add to collected currency
        this.totalCollected += val;
        this.saveWallet();

        // Notify subscribers (HUD, state)
        for (const cb of this.onCollectCallbacks) {
          cb(val, this.totalCollected);
        }

        // Spawn floating score pill "+N"
        this.pickupEffects.push({
          x: coin.x,
          y: coin.y - coin.z,
          text: `+${val}`,
          color: def.highlightColor,
          alpha: 1.0,
          vy: -35,
        });

        // Spawn golden collection burst sparkles
        for (let s = 0; s < 5; s++) {
          this.addSparkle(coin.x, coin.y - coin.z, def.highlightColor);
        }

        // Remove coin from simulation
        this.coins.splice(i, 1);
      }
    }

    // 3. Update Floating Pickup Text Effects
    for (let i = this.pickupEffects.length - 1; i >= 0; i--) {
      const p = this.pickupEffects[i];
      p.y += p.vy * dtSeconds;
      p.alpha -= dtSeconds * 1.8;
      if (p.alpha <= 0) {
        this.pickupEffects.splice(i, 1);
      }
    }

    // 4. Update Sparkles
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const sp = this.sparkles[i];
      sp.x += sp.vx * dtSeconds;
      sp.y += sp.vy * dtSeconds;
      sp.life -= dtSeconds;
      sp.alpha = Math.max(0, sp.life / 0.6);
      if (sp.life <= 0) {
        this.sparkles.splice(i, 1);
      }
    }
  }

  /**
   * Returns renderable entities sorted by ground Y for natural isometric depth
   */
  public getRenderableEntities(): RenderableEntity[] {
    const entities: RenderableEntity[] = [];

    // Each coin renders at its ground Y coordinate for isometric sorting
    for (const coin of this.coins) {
      entities.push({
        y: coin.y,
        draw: (ctx) => this.drawCoin(ctx, coin),
      });
    }

    // Floating text and sparkles render on top (high Y priority)
    if (this.pickupEffects.length > 0 || this.sparkles.length > 0) {
      entities.push({
        y: 9999,
        draw: (ctx) => {
          this.drawSparkles(ctx);
          this.drawPickupEffects(ctx);
        },
      });
    }

    return entities;
  }

  /**
   * Draws a single physical coin with 2.5D elevation, ground drop shadow, and 3D spin
   */
  private drawCoin(ctx: CanvasRenderingContext2D, coin: BouncingCoin) {
    const def = COIN_DEFINITIONS[coin.denomination];
    const r = def.radius;

    // 1. Drop Shadow on the floor at (coin.x, coin.y)
    // Shadow size and opacity scale inversely with elevation z
    const zScale = Math.max(0.15, 1 - coin.z / 90);
    const shadowAlpha = Math.max(0.12, 0.45 * (1 - coin.z / 120));
    const shadowRx = r * 1.2 * zScale;
    const shadowRy = r * 0.45 * zScale;

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(coin.x, coin.y, shadowRx, shadowRy, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(15, 10, 5, ${shadowAlpha})`;
    ctx.fill();
    ctx.restore();

    // 2. Coin Body at (coin.x, coin.y - coin.z)
    const drawX = coin.x;
    const drawY = coin.y - coin.z;

    // 3D tumble: scale horizontal width by |cos(rotation)|
    const tumbleScale = Math.max(0.12, Math.abs(Math.cos(coin.rotation)));
    const rx = r * tumbleScale;
    const ry = r;

    ctx.save();
    ctx.translate(drawX, drawY);

    // Rim / Edge thickness for 3D coin cylinder effect
    const edgeOffset = (1 - tumbleScale) * 2.5;
    if (edgeOffset > 0.4) {
      ctx.beginPath();
      ctx.ellipse(edgeOffset, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = def.darkColor;
      ctx.fill();
    }

    // Outer Rim
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = def.rimColor;
    ctx.fill();

    // Inner Face
    if (rx > 1.8) {
      ctx.beginPath();
      ctx.ellipse(0, 0, rx - 1.2, ry - 1.2, 0, 0, Math.PI * 2);
      ctx.fillStyle = def.primaryColor;
      ctx.fill();

      // Specular highlight crescent
      ctx.beginPath();
      ctx.ellipse(-rx * 0.25, -ry * 0.25, rx * 0.45, ry * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.45 + (coin.flashTimer > 0 ? 0.35 : 0)})`;
      ctx.fill();

      // Embossed denomination symbol if coin face is sufficiently wide
      if (rx > 3.8) {
        ctx.fillStyle = def.darkColor;
        ctx.font = `bold ${Math.round(r * 0.9)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(def.symbol, 0, 0.5);
      }
    }

    ctx.restore();
  }

  private drawSparkles(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const sp of this.sparkles) {
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = sp.alpha;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawPickupEffects(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const ef of this.pickupEffects) {
      ctx.globalAlpha = Math.max(0, ef.alpha);

      // Dark drop shadow
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillText(ef.text, ef.x + 1, ef.y + 1);

      // Vivid glowing value
      ctx.fillStyle = ef.color;
      ctx.fillText(ef.text, ef.x, ef.y);
    }
    ctx.restore();
  }
}
