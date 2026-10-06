import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AGENT_STAGES,
  CORE_AGENT_CAPABILITIES,
  canUseFrameworks,
  createAgentLearningState,
  failureDrillPassed,
  nextLesson,
  prerequisitesMet,
  recordStageEvidence
} from '../src/agent-learning.mjs';

const bareLoop = {
  id: 'bare-agent-loop',
  prerequisites: [],
  capabilities: ['model-api', 'structured-output', 'tool-loop']
};

test('agent learning uses Concept -> Build -> Break -> Diagnose -> Verify -> Ship', () => {
  assert.deepEqual(AGENT_STAGES, ['concept', 'build', 'break', 'diagnose', 'verify', 'ship']);
});

test('framework gate stays locked until core capabilities are verified', () => {
  const state = createAgentLearningState();
  assert.equal(canUseFrameworks(state), false);
  const ready = { ...state, verifiedCapabilities: [...CORE_AGENT_CAPABILITIES] };
  assert.equal(canUseFrameworks(ready), true);
});

test('stage evidence cannot jump ahead', () => {
  const state = createAgentLearningState();
  assert.throws(() => recordStageEvidence(state, bareLoop, { stage: 'verify', status: 'passed' }), /cannot skip/);
});

test('failure drill requires an observed failure instead of a happy-path claim', () => {
  assert.equal(failureDrillPassed({ stage: 'break', status: 'passed' }), false);
  assert.equal(failureDrillPassed({ stage: 'break', status: 'passed', observedFailure: 'tool-unavailable' }), true);
});

test('verify receipt records capabilities but completion requires ship evidence', () => {
  let state = createAgentLearningState();
  state = recordStageEvidence(state, bareLoop, { stage: 'concept', status: 'passed' });
  state = recordStageEvidence(state, bareLoop, { stage: 'build', status: 'passed', command: 'node agent.mjs', exitCode: 0 });
  state = recordStageEvidence(state, bareLoop, { stage: 'break', status: 'passed', observedFailure: 'tool-unavailable' });
  state = recordStageEvidence(state, bareLoop, { stage: 'diagnose', status: 'passed' });
  state = recordStageEvidence(state, bareLoop, { stage: 'verify', status: 'passed' });
  assert.deepEqual(state.verifiedCapabilities.sort(), bareLoop.capabilities.sort());
  assert.equal(state.completedLessons.includes(bareLoop.id), false);

  state = recordStageEvidence(state, bareLoop, { stage: 'ship', status: 'passed', artifactHash: 'sha256:demo' });
  assert.equal(state.completedLessons.includes(bareLoop.id), true);
  assert.deepEqual(state.portfolioArtifacts, [{ lessonId: bareLoop.id, artifactHash: 'sha256:demo' }]);
});

test('nextLesson respects prerequisites', () => {
  const lessons = [
    bareLoop,
    { id: 'rag', prerequisites: ['bare-agent-loop'], capabilities: [] }
  ];
  const state = createAgentLearningState();
  assert.equal(prerequisitesMet(state, lessons[1]), false);
  assert.equal(nextLesson(lessons, state).id, 'bare-agent-loop');
  const complete = { ...state, completedLessons: ['bare-agent-loop'] };
  assert.equal(nextLesson(lessons, complete).id, 'rag');
});
