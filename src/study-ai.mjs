import { createLocalStudyPack, validateStudyInput } from './study.mjs';

export const STUDY_PACK_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: { type: 'string' },
    summary: { type: 'array', minItems: 3, maxItems: 6, items: { type: 'string' } },
    flashcards: {
      type: 'array', minItems: 4, maxItems: 10,
      items: {
        type: 'object', additionalProperties: false,
        properties: { id: { type: 'string' }, front: { type: 'string' }, back: { type: 'string' } },
        required: ['id', 'front', 'back']
      }
    },
    quiz: {
      type: 'array', minItems: 4, maxItems: 8,
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          id: { type: 'string' },
          prompt: { type: 'string' },
          options: { type: 'array', minItems: 4, maxItems: 4, items: { type: 'string' } },
          answer: { type: 'integer', minimum: 0, maximum: 3 },
          explanation: { type: 'string' }
        },
        required: ['id', 'prompt', 'options', 'answer', 'explanation']
      }
    }
  },
  required: ['title', 'summary', 'flashcards', 'quiz']
};

function extractResponseText(payload) {
  if (typeof payload?.output_text === 'string') return payload.output_text;
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') return content.text;
    }
  }
  return null;
}

function assertPackShape(pack) {
  if (!pack || !Array.isArray(pack.summary) || !Array.isArray(pack.flashcards) || !Array.isArray(pack.quiz)) {
    throw new Error('AI provider returned an invalid study-pack shape.');
  }
  for (const question of pack.quiz) {
    if (!Array.isArray(question.options) || question.options.length !== 4 || !Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) {
      throw new Error('AI provider returned an invalid quiz question.');
    }
  }
  return pack;
}

function sourceDigest(sourceText) {
  let hash = 2166136261;
  for (const char of sourceText) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export async function generateStudyPack(input, { env = process.env, fetchImpl = globalThis.fetch } = {}) {
  const clean = validateStudyInput(input);
  const provider = String(env.STUDY_AI_PROVIDER || 'local').toLowerCase();

  if (provider === 'local') return createLocalStudyPack(clean);
  if (provider !== 'openai') throw new Error(`Unsupported STUDY_AI_PROVIDER: ${provider}`);
  if (!env.OPENAI_API_KEY) throw new Error('STUDY_AI_PROVIDER=openai requires OPENAI_API_KEY.');
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required for the OpenAI provider.');

  const model = env.OPENAI_MODEL || 'gpt-5.6-luna';
  const response = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: 'Create a compact study pack grounded only in the user-provided material. Do not add facts that are absent from the source. Make flashcards retrieval-focused and quiz distractors plausible but clearly unsupported by the source.'
        },
        {
          role: 'user',
          content: `TITLE: ${clean.title}\n\nSOURCE MATERIAL:\n${clean.sourceText}`
        }
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'study_pack',
          strict: true,
          schema: STUDY_PACK_SCHEMA
        }
      }
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenAI study generation failed (${response.status}): ${detail.slice(0, 240)}`);
  }

  const payload = await response.json();
  const output = extractResponseText(payload);
  if (!output) throw new Error('OpenAI study generation returned no text output.');
  const parsed = assertPackShape(JSON.parse(output));

  return {
    ...parsed,
    id: `openai-${sourceDigest(clean.sourceText)}-${Date.now()}`,
    sourceDigest: sourceDigest(clean.sourceText),
    provider: 'openai',
    model,
    generatedAt: new Date().toISOString()
  };
}
