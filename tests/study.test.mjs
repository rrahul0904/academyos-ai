import test from 'node:test';
import assert from 'node:assert/strict';
import { createLocalStudyPack, gradeStudyQuiz, recordFlashcardReview, validateStudyInput } from '../src/study.mjs';
import { generateStudyPack } from '../src/study-ai.mjs';

const sourceText = [
  'Spaced repetition schedules reviews at increasing intervals to strengthen long-term recall.',
  'Active recall means trying to retrieve an answer before looking at the material.',
  'Interleaving mixes related topics instead of practicing only one type of problem at a time.',
  'A retrieval cue is a prompt that helps a learner bring a stored idea back to mind.',
  'Feedback after retrieval helps correct errors before they become durable.'
].join(' ');

test('local study generation is deterministic and structurally complete', () => {
  const first = createLocalStudyPack({ title: 'Learning science', sourceText });
  const second = createLocalStudyPack({ title: 'Learning science', sourceText });
  assert.deepEqual(first, second);
  assert.ok(first.summary.length >= 3);
  assert.ok(first.flashcards.length >= 4);
  assert.ok(first.quiz.length >= 4);
  for (const question of first.quiz) {
    assert.equal(question.options.length, 4);
    assert.ok(question.answer >= 0 && question.answer <= 3);
  }
});

test('local mode does not call the network', async () => {
  let called = false;
  const pack = await generateStudyPack(
    { title: 'Learning science', sourceText },
    { env: { STUDY_AI_PROVIDER: 'local' }, fetchImpl: async () => { called = true; throw new Error('network should not be called'); } }
  );
  assert.equal(called, false);
  assert.equal(pack.provider, 'local');
});

test('openai mode requires an explicit key', async () => {
  await assert.rejects(
    generateStudyPack({ title: 'Learning science', sourceText }, { env: { STUDY_AI_PROVIDER: 'openai' } }),
    /OPENAI_API_KEY/
  );
});

test('quiz grading is exact and review scheduling is rating-aware', () => {
  const pack = createLocalStudyPack({ title: 'Learning science', sourceText });
  const answers = Object.fromEntries(pack.quiz.map((q) => [q.id, q.answer]));
  assert.equal(gradeStudyQuiz(pack, answers).percent, 100);

  const now = new Date('2026-09-30T12:00:00Z');
  const progress = recordFlashcardReview({}, pack.flashcards[0].id, 'good', now);
  assert.equal(progress[pack.flashcards[0].id].reviews, 1);
  assert.equal(progress[pack.flashcards[0].id].dueAt, '2026-10-03T12:00:00.000Z');
});

test('input validation rejects tiny and oversized material', () => {
  assert.throws(() => validateStudyInput({ sourceText: 'too short' }), /at least 40/);
  assert.throws(() => validateStudyInput({ sourceText: 'x'.repeat(20001) }), /20,000/);
});
