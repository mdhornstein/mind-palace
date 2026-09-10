export type Direction = 'up' | 'down' | 'left' | 'right';

export type DeepReadonly<T> =
  T extends (...args: never[]) => unknown ? T :
  T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] :
  T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } :
  T;

export interface MemoryItem {
  id: string;
  targetObjectId: string;
  title: string;
  subtitle?: string;
  date: string;
  snippet: string;
  fullContent: string[];
  tags: string[];
  unlocked: boolean;
  lastRecalledAt?: number;
}

export interface ProjectItem {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  status: 'running' | 'paused' | 'completed';
  progress: number; // 0.0 to 1.0
  durationSeconds: number; // time in seconds to reach 100%
  completedAt?: number;
  visualState: 'wireframe_rough' | 'mesh_dense' | 'stress_contours' | 'optimized';
  trainingPrompt: {
    question: string;
    context: string;
    referenceKeywords: string[];
  };
  lastEvaluation?: {
    userAnswer: string;
    evaluationText: string;
    evaluatedAt: number;
  };
}

export interface ExplorationTopic {
  id: string;
  label: string;
  teaser: string;
  content: string;
}

export interface SpecimenItem {
  id: string;
  name: string;
  scientificName: string;
  classification: string;
  period: string;
  region: string;
  description: string;
  discovered: boolean;
  onPedestal: boolean;
  highlightNew?: boolean;
  topics: ExplorationTopic[];
}

export type CompanionLocation = 'reading_nook' | 'cabinet' | 'desk' | 'fireplace' | 'wandering';
export type CompanionActivity = 'reading' | 'writing' | 'examining_fossil' | 'contemplating' | 'observing_player';

export interface CompanionSpeech {
  text: string;
  timestamp: number;
  durationMs: number;
}

export interface PendingRemark {
  text: string;
  trigger: 'simulation_finished' | 'fossil_displayed' | 'returned_after_days' | 'book_left_open' | 'generic';
  presenceLevel: 1 | 2 | 3; // 1: recognition, 2: invitation, 3: rare approach
}

export interface CompanionState {
  name: string;
  role: string;
  x: number;
  y: number;
  facing: Direction;
  location: CompanionLocation;
  activity: CompanionActivity;
  presenceLevel: 0 | 1 | 2 | 3;
  speech: CompanionSpeech | null;
  pendingRemark: PendingRemark | null;
  discussedItems: string[];
  lastNoticedPlayerAt: number;
}

export interface RoomEnvironment {
  bookOpenOnRug: boolean;
  activePedestalSpecimenId: string | null;
  chalkboardEquation: string;
  fireplaceLit: boolean;
  ambientLight: 'day' | 'evening' | 'night';
}

export interface EncounterRecord {
  id: string;
  type: 'memory' | 'training' | 'discovery' | 'companion';
  targetId: string;
  timestamp: number;
  summary: string;
}

export interface WorldTime {
  createdAt: number;
  lastVisitedAt: number;
  currentVirtualTime: number;
  elapsedAwaySeconds: number;
  totalVisits: number;
}

export interface PlayerState {
  x: number;
  y: number;
  facing: Direction;
}

export interface WorldState {
  version: number;
  currentRoomId: string;
  time: WorldTime;
  player: PlayerState;
  companion: CompanionState;
  environment: RoomEnvironment;
  memories: MemoryItem[];
  projects: ProjectItem[];
  specimens: SpecimenItem[];
  encounters: {
    history: EncounterRecord[];
  };
}

export type InteractiveZoneId = string;

export interface InteractiveZone {
  id: InteractiveZoneId;
  name: string;
  prompt: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type ModalId =
  | 'library'
  | 'cabinet'
  | 'workshop'
  | 'duckephant'
  | 'telescope'
  | 'orrery'
  | 'star_chart'
  | 'escher_waterfall'
  | 'escher_drawing_hands'
  | 'escher_mobius'
  | 'escher_penrose_stairs'
  | 'escher_artwork'
  | 'coin_press'
  | 'plinko_game'
  | 'vault_wishing_well'
  | 'vault_scale';

export type InteractionIntent =
  | {
      type: 'modal';
      modalId: ModalId;
      params?: Record<string, string | number | boolean>;
    }
  | {
      type: 'door';
      targetRoomId: string;
      targetSpawnPoint?: { x: number; y: number; facing: Direction };
    }
  | {
      type: 'custom';
      actionId: string;
      params?: Record<string, string | number | boolean>;
    };

export interface StationPrimaryAction {
  label: string;
  intent: InteractionIntent;
}

export interface WorldStation {
  id: string;
  name: string;
  prompt: string;
  // Position and dimension in tiles
  tileX: number;
  tileY: number;
  tileWidth: number;
  tileHeight: number;
  // Solid collision box in pixels (optional; if omitted, can default to tile bounds)
  collisionBox?: BoundingBox;
  // Walkable approach destination coordinate in pixels for click-to-walk
  approachPoint: { x: number; y: number };
  // Visual render hook
  draw: (ctx: CanvasRenderingContext2D, timeMs: number, state: DeepReadonly<WorldState>) => void;
  // Declarative interaction intent (default/inspect intent)
  intent: InteractionIntent;
  // Optional declarative primary in-world action (e.g. F key / Direct in-world action)
  primaryAction?: StationPrimaryAction;
}

export interface Doorway {
  id: string;
  name: string;
  prompt: string;
  tileX: number;
  tileY: number;
  tileWidth: number;
  tileHeight: number;
  targetRoomId: string;
  targetSpawnPoint: { x: number; y: number; facing: Direction };
  transitionMode?: 'auto' | 'inspect';
}

export type InteractiveTarget =
  | { kind: 'station'; station: WorldStation }
  | { kind: 'door'; door: Doorway };

export interface DecorativeProp {
  id: string;
  name: string;
  y: number; // Isometric depth sorting Y coordinate
  collisionBox?: BoundingBox;
  draw: (ctx: CanvasRenderingContext2D, timeMs: number) => void;
}

export interface RenderPlayer {
  x: number;
  y: number;
  facing: Direction;
  isMoving: boolean;
  walkFrame: number;
}

export interface RenderableEntity {
  y: number;
  draw: (ctx: CanvasRenderingContext2D, timeMs: number) => void;
}

export interface RoomConfig {
  id: string;
  name: string;
  widthTiles: number;
  heightTiles: number;
  stations: WorldStation[];
  doors: Doorway[];
  decorativeProps?: DecorativeProp[];
  architecturalCollisions?: BoundingBox[];
  ambientLight: {
    type: 'day' | 'evening' | 'night';
    primaryGlowColor?: string;
  };
  hasCompanion?: boolean;
  getEntities?: (state: DeepReadonly<WorldState>, timeMs: number) => RenderableEntity[];
  onUpdate?: (dt: number, player: { x: number; y: number }) => void;
  customDrawBackground?: (ctx: CanvasRenderingContext2D, state: DeepReadonly<WorldState>) => void;
  customDrawAtmosphere?: (ctx: CanvasRenderingContext2D, timeMs: number) => void;
}

export type NavigationStatus = 'idle' | 'navigating' | 'arrived' | 'blocked';


