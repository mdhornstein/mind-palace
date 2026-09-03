export type Direction = 'up' | 'down' | 'left' | 'right';

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

export type InteractiveZoneId = 'library' | 'workshop' | 'cabinet' | 'pedestal' | 'companion';

export interface InteractiveZone {
  id: InteractiveZoneId;
  name: string;
  prompt: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
