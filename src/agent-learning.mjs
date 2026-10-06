export const AGENT_STAGES = Object.freeze([
  'concept',
  'build',
  'break',
  'diagnose',
  'verify',
  'ship'
]);

export const CORE_AGENT_CAPABILITIES = Object.freeze([
  'model-api',
  'structured-output',
  'tool-loop',
  'step-limit',
  'tool-error-path',
  'execution-log',
  'state-memory',
  'failure-injection',
  'eval-suite'
]);

export function createAgentLearningState() {
  return {
    completedLessons: [],
    verifiedCapabilities: [],
    lessonState: {},
    receipts: [],
    frameworkGateUnlocked: false,
    portfolioArtifacts: []
  };
}

export function lessonStatus(state, lessonId) {
  return state.lessonState[lessonId] || {
    stage: 'concept',
    attempts: 0,
    failuresObserved: [],
    evidence: []
  };
}

export function prerequisitesMet(state, lesson) {
  const requiredLessons = lesson.prerequisites || [];
  return requiredLessons.every((id) => state.completedLessons.includes(id));
}

export function canUseFrameworks(state) {
  return CORE_AGENT_CAPABILITIES.every((capability) =>
    state.verifiedCapabilities.includes(capability)
  );
}

export function recordStageEvidence(state, lesson, receipt) {
  if (!lesson?.id) throw new Error('lesson.id is required');
  if (!receipt?.stage || !AGENT_STAGES.includes(receipt.stage)) {
    throw new Error('receipt.stage must be a valid agent-learning stage');
  }
  if (!receipt?.status || !['passed', 'failed'].includes(receipt.status)) {
    throw new Error('receipt.status must be passed or failed');
  }

  const current = lessonStatus(state, lesson.id);
  const stageIndex = AGENT_STAGES.indexOf(receipt.stage);
  const currentIndex = AGENT_STAGES.indexOf(current.stage);
  if (stageIndex > currentIndex + 1) {
    throw new Error(`cannot skip from ${current.stage} to ${receipt.stage}`);
  }

  const normalizedReceipt = {
    lessonId: lesson.id,
    stage: receipt.stage,
    status: receipt.status,
    command: receipt.command || null,
    exitCode: Number.isInteger(receipt.exitCode) ? receipt.exitCode : null,
    artifactHash: receipt.artifactHash || null,
    observedFailure: receipt.observedFailure || null,
    at: receipt.at || new Date().toISOString()
  };

  const evidence = [...current.evidence, normalizedReceipt];
  const failuresObserved = receipt.observedFailure
    ? [...new Set([...current.failuresObserved, receipt.observedFailure])]
    : current.failuresObserved;

  const passedCurrentStage = normalizedReceipt.status === 'passed' && receipt.stage === current.stage;
  const nextStage = passedCurrentStage && current.stage !== 'ship'
    ? AGENT_STAGES[currentIndex + 1]
    : current.stage;

  let nextState = {
    ...state,
    lessonState: {
      ...state.lessonState,
      [lesson.id]: {
        stage: nextStage,
        attempts: current.attempts + 1,
        failuresObserved,
        evidence
      }
    },
    receipts: [...state.receipts, normalizedReceipt]
  };

  if (receipt.stage === 'verify' && receipt.status === 'passed') {
    const capabilities = lesson.capabilities || [];
    nextState = {
      ...nextState,
      verifiedCapabilities: [...new Set([...nextState.verifiedCapabilities, ...capabilities])]
    };
  }

  if (receipt.stage === 'ship' && receipt.status === 'passed') {
    const completedLessons = [...new Set([...nextState.completedLessons, lesson.id])];
    const portfolioArtifacts = receipt.artifactHash
      ? [...nextState.portfolioArtifacts, { lessonId: lesson.id, artifactHash: receipt.artifactHash }]
      : nextState.portfolioArtifacts;
    nextState = { ...nextState, completedLessons, portfolioArtifacts };
  }

  return { ...nextState, frameworkGateUnlocked: canUseFrameworks(nextState) };
}

export function failureDrillPassed(receipt) {
  if (!receipt || receipt.stage !== 'break') return false;
  if (!receipt.observedFailure) return false;
  return receipt.status === 'passed';
}

export function nextLesson(lessons, state) {
  return lessons.find((lesson) =>
    !state.completedLessons.includes(lesson.id) && prerequisitesMet(state, lesson)
  ) || null;
}
