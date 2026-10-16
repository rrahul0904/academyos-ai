import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RATE_LIMITED_URL_SHORTENER_SCENARIO,
  createSystemDesignReceipt,
  deriveUrlShortenerCapacity,
  evaluateCapacityEstimate,
  evaluateSystemDesignAttempt,
  evaluateTradeoffDefense
} from '../src/system-design.mjs';

function completeAttempt() {
  return {
    assumptions: ['Short links are immutable after creation for this exercise.'],
    components: [
      { id: 'api', capabilities: ['public-api-entry'] },
      { id: 'limiter', capabilities: ['request-rate-limiting'] },
      { id: 'key-service', capabilities: ['short-key-generation'] },
      { id: 'store', capabilities: ['durable-url-storage'] },
      { id: 'cache', capabilities: ['redirect-cache'] }
    ],
    edges: [
      { from: 'api', to: 'limiter' },
      { from: 'limiter', to: 'key-service' },
      { from: 'key-service', to: 'store' },
      { from: 'api', to: 'cache' }
    ],
    observability: ['metrics', 'logs', 'traces'],
    tradeoffs: [
      {
        topic: 'key-generation',
        selected: 'random-base62',
        alternatives: ['sequence-base62'],
        rationale: 'Random keys reduce coordination, while collision checks add a bounded storage lookup cost.'
      },
      {
        topic: 'consistency',
        selected: 'read-after-write-for-new-links',
        alternatives: ['eventual'],
        rationale: 'Newly created links should redirect immediately, while analytics can remain eventually consistent.'
      },
      {
        topic: 'caching',
        selected: 'cache-aside',
        alternatives: ['read-through'],
        rationale: 'Redirect traffic is read-heavy, so cache-aside protects storage while keeping cache failure recoverable.'
      },
      {
        topic: 'rate-limiting',
        selected: 'token-bucket',
        alternatives: ['fixed-window'],
        rationale: 'Token bucket allows short bursts but still enforces sustained request limits for abuse protection.'
      }
    ]
  };
}

test('URL shortener capacity derivation is deterministic from declared inputs', () => {
  const result = deriveUrlShortenerCapacity(RATE_LIMITED_URL_SHORTENER_SCENARIO.capacityInputs);
  assert.equal(result.averageWriteQps, 1157.41);
  assert.equal(result.peakWriteQps, 3472.22);
  assert.equal(result.averageReadQps, 115740.74);
  assert.equal(result.peakReadQps, 347222.22);
  assert.equal(result.retainedRecords, 182_500_000_000);
  assert.equal(result.rawStorageBytes, 91_250_000_000_000);
  assert.equal(result.replicatedStorageBytes, 273_750_000_000_000);
});

test('capacity grading reports each incorrect estimate instead of silently correcting it', () => {
  const reference = deriveUrlShortenerCapacity(RATE_LIMITED_URL_SHORTENER_SCENARIO.capacityInputs);
  const estimate = { ...reference, peakReadQps: reference.peakReadQps / 10 };
  const result = evaluateCapacityEstimate(reference, estimate, 0.1);
  assert.equal(result.passed, false);
  assert.equal(result.checks.peakReadQps.passed, false);
  assert.equal(result.checks.averageReadQps.passed, true);
});

test('tradeoff defense requires a selection, alternative and substantive rationale', () => {
  const result = evaluateTradeoffDefense(
    ['consistency', 'caching'],
    [
      { topic: 'consistency', selected: 'strong', alternatives: ['eventual'], rationale: 'This requirement needs immediate read visibility after link creation.' },
      { topic: 'caching', selected: 'cache-aside', alternatives: [], rationale: 'Too short.' }
    ]
  );
  assert.equal(result.percent, 50);
  assert.equal(result.passed, false);
  assert.equal(result.findings[1].hasAlternative, false);
});

test('system design scoring uses capabilities rather than vendor-specific component names', () => {
  const attempt = completeAttempt();
  attempt.components[0] = { id: 'my-ingress', capabilities: ['public-api-entry'] };
  attempt.edges[0] = { from: 'my-ingress', to: 'limiter' };
  attempt.edges[3] = { from: 'my-ingress', to: 'cache' };

  const result = evaluateSystemDesignAttempt(RATE_LIMITED_URL_SHORTENER_SCENARIO, attempt);
  assert.equal(result.percent, 100);
  assert.equal(result.passed, true);
  assert.deepEqual(result.missingCapabilities, []);
  assert.deepEqual(result.missingFlows, []);
});

test('a required capability can exist while a disconnected required flow still fails', () => {
  const attempt = completeAttempt();
  attempt.edges = attempt.edges.filter((edge) => !(edge.from === 'limiter' && edge.to === 'key-service'));

  const result = evaluateSystemDesignAttempt(RATE_LIMITED_URL_SHORTENER_SCENARIO, attempt);
  assert.equal(result.missingCapabilities.length, 0);
  assert.equal(result.missingFlows.length, 1);
  assert.equal(result.passed, false);
});

test('same canonical attempt and evaluation produce the same evidence receipt digest', () => {
  const attempt = completeAttempt();
  const evaluation = evaluateSystemDesignAttempt(RATE_LIMITED_URL_SHORTENER_SCENARIO, attempt);
  const capacityReference = deriveUrlShortenerCapacity(RATE_LIMITED_URL_SHORTENER_SCENARIO.capacityInputs);
  const capacityEvaluation = evaluateCapacityEstimate(capacityReference, capacityReference);

  const first = createSystemDesignReceipt({
    scenario: RATE_LIMITED_URL_SHORTENER_SCENARIO,
    attempt,
    evaluation,
    capacityEvaluation
  });
  const second = createSystemDesignReceipt({
    scenario: RATE_LIMITED_URL_SHORTENER_SCENARIO,
    attempt: { ...attempt, components: [...attempt.components] },
    evaluation,
    capacityEvaluation
  });

  assert.equal(first.digest, second.digest);
  assert.match(first.digest, /^sha256:[a-f0-9]{64}$/);
});
