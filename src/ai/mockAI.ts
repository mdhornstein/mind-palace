import { IAIService, MemoryEncounterResponse, TrainingEvaluationResponse, DiscoveryEncounterResponse } from './aiService';
import { WorldState, DeepReadonly, MemoryItem, SpecimenItem } from '../core/types';

export class MockAIService implements IAIService {
  public async remember(memoryId: string, context: DeepReadonly<WorldState>): Promise<MemoryEncounterResponse> {
    // Simulate brief asynchronous processing
    await new Promise((r) => setTimeout(r, 80));

    const foundMemory = context.memories.find((m) => m.id === memoryId) || context.memories[0];
    const memory = structuredClone(foundMemory) as unknown as MemoryItem;

    const reflectionMap: Record<string, { notes: string[]; companion: string }> = {
      mem_pallotta_dinosaurs: {
        notes: [
          'A reminder that children often intuitively grasp optimization tradeoffs: why endure collision stress if locomotion offers avoidance?',
          'This simple observation later reframed how you approached flank-butting vs display hypotheses.',
        ],
        companion: 'I remember you smiling about that conversation when you placed this book on the lower shelf.',
      },
      mem_thompson_form: {
        notes: [
          'D\'Arcy Thompson viewed bone remodeling through the lens of continuous stress tensors long before computers existed.',
          'Underpinned the entire premise of your cranial dome mesh analysis.',
        ],
        companion: 'That passage is heavily dog-eared. It seems to bridge your interest in geometry and biology.',
      },
    };

    const details = reflectionMap[memory.id] || {
      notes: ['Stored within your personal library.', 'Preserved for reflection.'],
      companion: 'A quiet thought kept in this room.',
    };

    return {
      memory,
      reflectionNotes: details.notes,
      companionThought: details.companion,
    };
  }

  public async teach(projectId: string, userAnswer: string, context: DeepReadonly<WorldState>): Promise<TrainingEvaluationResponse> {
    await new Promise((r) => setTimeout(r, 120));

    const project = context.projects.find((p) => p.id === projectId) || context.projects[0];
    const cleaned = userAnswer.toLowerCase();

    // Semantic evaluation heuristics based on biomechanics & FEA theory
    const mentionsBoundary = cleaned.includes('boundary') || cleaned.includes('geometry') || cleaned.includes('shape') || cleaned.includes('surface');
    const mentionsDiscretization = cleaned.includes('discretization') || cleaned.includes('mesh') || cleaned.includes('element') || cleaned.includes('convergence') || cleaned.includes('grid');
    const mentionsConfounding = cleaned.includes('confound') || cleaned.includes('both') || cleaned.includes('decouple') || cleaned.includes('distort') || cleaned.includes('artifact') || cleaned.includes('error');

    let assessment: TrainingEvaluationResponse['assessment'] = 'exploratory';
    let feedbackTitle = 'A Thoughtful Beginning';
    let critique = '';
    let biomechanicalInsight = '';
    let followUpQuestion = '';

    if (mentionsBoundary && (mentionsDiscretization || mentionsConfounding)) {
      assessment = 'deep_insight';
      feedbackTitle = 'Outstanding Technical Distinction';
      critique = `Exactly right. You've identified the core methodological confound: **mesh refinement** addresses numerical discretization error (approximating the PDE solution on a given geometry), whereas **surface smoothing** changes the actual boundary value geometry of the anatomical dome itself.`;
      biomechanicalInsight = `In pachycephalosaur skulls, peak compressive stresses often localize right at cortical tubercles and surface rugosities. If smoothing truncates those local peaks while mesh refinement simultaneously increases resolution to capture them, your strain convergence curve becomes completely uninterpretable.`;
      followUpQuestion = `How would you isolate the convergence rate: by freezing the smoothed geometry first, or by using a convergence metric independent of point-wise stress singularities?`;
    } else if (mentionsBoundary || mentionsDiscretization) {
      assessment = 'good_intuition';
      feedbackTitle = 'Solid Physical Intuition';
      critique = `You are touching on the key dilemma. When you alter both the mesh density and the surface filter simultaneously, you cannot distinguish whether the change in von Mises stress stems from higher numerical accuracy or from altering the physical specimen's shape.`;
      biomechanicalInsight = `Biological CT scans have segmentation noise. Smoothing removes partial-volume voxels, but in cranial domes, small rugosities act as micro-flaws that redistribute impact shock.`;
      followUpQuestion = `What protocol would ensure your mesh convergence test actually tests numerical convergence rather than anatomical variation?`;
    } else {
      assessment = 'exploratory';
      feedbackTitle = 'Interesting Angle to Unpack';
      critique = `Consider what FEA fundamentally does: it solves partial differential equations over a discretized geometry. If the geometry itself is shifting (via smoothing) while the mesh resolution is refined, you are running simulations on different physical models rather than converging on one.`;
      biomechanicalInsight = `In cranial impact analysis, surface curvature governs whether load distributes as pure compression or introduces destructive bending moments into the endocranial cavity.`;
      followUpQuestion = `Could you keep the surface fixed at high resolution and only refine the tetrahedral elements internally to measure true discretization error?`;
    }

    return {
      projectId: project.id,
      userAnswer,
      assessment,
      feedbackTitle,
      critique,
      biomechanicalInsight,
      followUpQuestion,
    };
  }

  public async discover(specimenId: string, topicId: string, context: DeepReadonly<WorldState>): Promise<DiscoveryEncounterResponse> {
    await new Promise((r) => setTimeout(r, 100));

    const foundSpecimen = context.specimens.find((s) => s.id === specimenId) || context.specimens[0];
    const specimen = structuredClone(foundSpecimen) as unknown as SpecimenItem;
    let topic = specimen.topics.find((t) => t.id === topicId);
    if (!topic) {
      topic = specimen.topics[0];
    }

    const companionReactions: Record<string, string> = {
      morphology: `Notice how the lateral walls steepen abruptly. That indicates high resistance to twisting moments.`,
      evolution: `The Gobi Desert fauna consistently shows this extreme specialization compared to North American forms.`,
      compare: `Stegoceras relies more on rear shelf muscles, while Prenocephale turned the whole skull into a compact vault.`,
      surprise: `The ontogeny question occupied paleontologists for decades. It's fascinating how histology finally resolved it.`,
    };

    return {
      specimen,
      topic,
      companionReaction: companionReactions[topic.id] || 'An intriguing specimen to explore in detail.',
      connectedQuestions: [
        'How does bone vascularization correlate with impact shock absorption?',
        'Could cranial ornamentation have functioned purely as display rather than agonistic combat?',
      ],
    };
  }
}

export const aiService = new MockAIService();
