import test from 'node:test';
import assert from 'node:assert/strict';
import { applyExamResult, evaluateArchitecture, initialProgress, readinessLabel, scoreExam } from '../src/domain.mjs';

const sampleQuestions = [
  { id: 'a', domain: 'D1', answer: 0 },
  { id: 'b', domain: 'D1', answer: 1 },
  { id: 'c', domain: 'D2', answer: 2 },
  { id: 'd', domain: 'D2', answer: 0 }
];

test('scoreExam calculates overall and domain performance', () => {
  const result = scoreExam(sampleQuestions, { a: 0, b: 1, c: 1, d: 0 });
  assert.equal(result.correct, 3);
  assert.equal(result.percent, 75);
  assert.equal(result.passed, true);
  assert.equal(result.domains.D1.percent, 100);
  assert.equal(result.domains.D2.percent, 50);
});

test('applyExamResult adds progression without exceeding readiness bounds', () => {
  const progress = { ...initialProgress(), readiness: 99 };
  const result = scoreExam(sampleQuestions, { a: 0, b: 1, c: 2, d: 0 });
  const next = applyExamResult(progress, result, new Date('2026-09-14T12:00:00Z'));
  assert.equal(next.readiness, 100);
  assert.equal(next.examsCompleted, 1);
  assert.equal(next.history[0].score, 100);
  assert.ok(next.xp > 0);
});

test('architecture evaluator requires both services and intended connections', () => {
  const scenario = {
    requiredServices: ['API Gateway', 'Lambda', 'DynamoDB'],
    requiredEdges: [{ from: 'API Gateway', to: 'Lambda' }, { from: 'Lambda', to: 'DynamoDB' }]
  };
  const strong = evaluateArchitecture(scenario, ['API Gateway', 'Lambda', 'DynamoDB'], scenario.requiredEdges);
  assert.equal(strong.percent, 100);
  assert.equal(strong.passed, true);

  const weak = evaluateArchitecture(scenario, ['API Gateway', 'Lambda'], []);
  assert.equal(weak.passed, false);
  assert.ok(weak.missingServices.includes('DynamoDB'));
});

test('readiness labels are stable at thresholds', () => {
  assert.equal(readinessLabel(20), 'Foundation stage');
  assert.equal(readinessLabel(40), 'Building confidence');
  assert.equal(readinessLabel(65), 'Nearly ready');
  assert.equal(readinessLabel(85), 'Exam ready');
});
