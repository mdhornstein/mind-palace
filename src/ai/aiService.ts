import { WorldState, MemoryItem, SpecimenItem, ExplorationTopic, DeepReadonly } from '../core/types';

export interface MemoryEncounterResponse {
  memory: MemoryItem;
  reflectionNotes: string[];
  companionThought?: string;
}

export interface TrainingEvaluationResponse {
  projectId: string;
  userAnswer: string;
  assessment: 'deep_insight' | 'good_intuition' | 'exploratory';
  feedbackTitle: string;
  critique: string;
  biomechanicalInsight: string;
  followUpQuestion: string;
}

export interface DiscoveryEncounterResponse {
  specimen: SpecimenItem;
  topic: ExplorationTopic;
  companionReaction: string;
  connectedQuestions: string[];
}

export interface IAIService {
  remember(memoryId: string, context: DeepReadonly<WorldState>): Promise<MemoryEncounterResponse>;
  teach(projectId: string, userAnswer: string, context: DeepReadonly<WorldState>): Promise<TrainingEvaluationResponse>;
  discover(specimenId: string, topicId: string, context: DeepReadonly<WorldState>): Promise<DiscoveryEncounterResponse>;
}
