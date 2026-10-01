const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeStudyText(value) {
  return String(value || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

export function validateStudyInput({ title = '', sourceText = '' } = {}) {
  const cleanTitle = normalizeStudyText(title).slice(0, 120);
  const cleanSource = normalizeStudyText(sourceText);
  if (cleanSource.length < 40) throw new Error('Add at least 40 characters of study material.');
  if (cleanSource.length > 20000) throw new Error('Study material is limited to 20,000 characters in this phase.');
  return { title: cleanTitle || 'Untitled study pack', sourceText: cleanSource };
}

function hashText(value) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function sentencesFrom(sourceText) {
  return sourceText
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 18);
}

function compact(sentence, max = 180) {
  return sentence.length <= max ? sentence : sentence.slice(0, max - 1).trimEnd() + '…';
}

function cardFromSentence(sentence, index) {
  const definition = sentence.match(/^(.{2,60}?)\s+(?:is|are|means|refers to|describes)\s+(.{8,})$/i);
  if (definition) {
    return { id: `card-${index + 1}`, front: `What is ${definition[1].trim()}?`, back: compact(definition[2].trim(), 220) };
  }

  const colon = sentence.match(/^(.{2,60}?):\s+(.{8,})$/);
  if (colon) {
    return { id: `card-${index + 1}`, front: colon[1].trim(), back: compact(colon[2].trim(), 220) };
  }

  const words = sentence.split(/\s+/);
  const cue = words.slice(0, Math.min(7, words.length)).join(' ');
  return {
    id: `card-${index + 1}`,
    front: `Complete the idea: “${cue}…”`,
    back: compact(sentence, 220)
  };
}

function rotate(values, offset) {
  if (!values.length) return values;
  const n = ((offset % values.length) + values.length) % values.length;
  return [...values.slice(n), ...values.slice(0, n)];
}

export function createLocalStudyPack(input) {
  const { title, sourceText } = validateStudyInput(input);
  const sentences = sentencesFrom(sourceText);
  const fallback = sourceText.split(/[,;]\s+/).map((item) => item.trim()).filter((item) => item.length >= 18);
  const ideas = (sentences.length ? sentences : fallback).slice(0, 8);
  if (ideas.length < 2) throw new Error('Add material with at least two distinct ideas or sentences.');

  const summary = ideas.slice(0, 5).map((item) => compact(item, 200));
  const flashcards = ideas.slice(0, 6).map(cardFromSentence);
  const backs = flashcards.map((card) => card.back);

  const quiz = flashcards.slice(0, Math.min(5, flashcards.length)).map((card, index) => {
    const distractors = backs.filter((item) => item !== card.back);
    while (distractors.length < 3) {
      distractors.push('This idea is not stated in the supplied study material.');
    }
    const raw = [card.back, ...distractors.slice(0, 3)];
    const options = rotate(raw, index % raw.length);
    const answer = options.indexOf(card.back);
    return {
      id: `quiz-${index + 1}`,
      prompt: card.front,
      options,
      answer,
      explanation: `The supported answer is: ${card.back}`
    };
  });

  return {
    id: `local-${hashText(title + '\n' + sourceText)}`,
    title,
    summary,
    flashcards,
    quiz,
    sourceDigest: hashText(sourceText),
    provider: 'local',
    generatedAt: new Date(0).toISOString()
  };
}

export function gradeStudyQuiz(pack, answers = {}) {
  const questions = Array.isArray(pack?.quiz) ? pack.quiz : [];
  let correct = 0;
  const items = questions.map((question) => {
    const selected = answers[question.id];
    const isCorrect = Number.isInteger(selected) && selected === question.answer;
    if (isCorrect) correct += 1;
    return { id: question.id, selected, correct: question.answer, isCorrect };
  });
  return {
    correct,
    total: questions.length,
    percent: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    items
  };
}

export function recordFlashcardReview(progress = {}, cardId, rating, now = new Date()) {
  if (!['hard', 'good', 'easy'].includes(rating)) throw new Error('Unknown flashcard rating.');
  const intervals = { hard: 1, good: 3, easy: 7 };
  const previous = progress[cardId] || { reviews: 0, lapses: 0 };
  return {
    ...progress,
    [cardId]: {
      reviews: previous.reviews + 1,
      lapses: previous.lapses + (rating === 'hard' ? 1 : 0),
      rating,
      reviewedAt: now.toISOString(),
      dueAt: new Date(now.getTime() + intervals[rating] * DAY_MS).toISOString()
    }
  };
}
