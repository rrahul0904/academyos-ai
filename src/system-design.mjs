import { createHash } from 'node:crypto';

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function asFiniteNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new TypeError(`${field} must be a non-negative finite number`);
  }
  return number;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])])
    );
  }
  return value;
}

function edgeKey(from, to) {
  return `${from}->${to}`;
}

function componentMap(attempt) {
  return new Map((attempt.components || []).map((component) => [component.id, component]));
}

function capabilityProviders(attempt) {
  const providers = new Map();
  for (const component of attempt.components || []) {
    for (const capability of component.capabilities || []) {
      const current = providers.get(capability) || [];
      current.push(component.id);
      providers.set(capability, current);
    }
  }
  return providers;
}

export function deriveUrlShortenerCapacity(input) {
  const writesPerDay = asFiniteNumber(input.writesPerDay, 'writesPerDay');
  const readWriteRatio = asFiniteNumber(input.readWriteRatio, 'readWriteRatio');
  const retentionDays = asFiniteNumber(input.retentionDays, 'retentionDays');
  const bytesPerRecord = asFiniteNumber(input.bytesPerRecord, 'bytesPerRecord');
  const replicationFactor = asFiniteNumber(input.replicationFactor ?? 1, 'replicationFactor');
  const peakMultiplier = asFiniteNumber(input.peakMultiplier ?? 1, 'peakMultiplier');
  const secondsPerDay = 86_400;

  const averageWriteQps = writesPerDay / secondsPerDay;
  const averageReadQps = averageWriteQps * readWriteRatio;
  const retainedRecords = writesPerDay * retentionDays;
  const rawStorageBytes = retainedRecords * bytesPerRecord;

  return {
    averageWriteQps: round(averageWriteQps),
    peakWriteQps: round(averageWriteQps * peakMultiplier),
    averageReadQps: round(averageReadQps),
    peakReadQps: round(averageReadQps * peakMultiplier),
    retainedRecords: Math.round(retainedRecords),
    rawStorageBytes: Math.round(rawStorageBytes),
    replicatedStorageBytes: Math.round(rawStorageBytes * replicationFactor)
  };
}

export function evaluateCapacityEstimate(reference, estimate, tolerance = 0.2) {
  const normalizedTolerance = asFiniteNumber(tolerance, 'tolerance');
  const checks = {};
  let passed = 0;
  let total = 0;

  for (const [field, expectedValue] of Object.entries(reference)) {
    if (!Number.isFinite(expectedValue)) continue;
    total += 1;
    const actualValue = Number(estimate[field]);
    const denominator = Math.max(Math.abs(expectedValue), 1);
    const relativeError = Number.isFinite(actualValue)
      ? Math.abs(actualValue - expectedValue) / denominator
      : Number.POSITIVE_INFINITY;
    const ok = relativeError <= normalizedTolerance;
    if (ok) passed += 1;
    checks[field] = {
      expected: expectedValue,
      actual: Number.isFinite(actualValue) ? actualValue : null,
      relativeError: Number.isFinite(relativeError) ? round(relativeError, 4) : null,
      passed: ok
    };
  }

  const percent = total ? Math.round((passed / total) * 100) : 100;
  return { percent, passed: percent === 100, checks };
}

export function evaluateTradeoffDefense(requiredTopics, defenses = []) {
  const byTopic = new Map(defenses.map((item) => [item.topic, item]));
  const findings = requiredTopics.map((topic) => {
    const defense = byTopic.get(topic);
    const hasSelection = Boolean(defense?.selected);
    const hasAlternative = Array.isArray(defense?.alternatives) && defense.alternatives.length > 0;
    const hasRationale = typeof defense?.rationale === 'string' && defense.rationale.trim().length >= 20;
    return {
      topic,
      passed: hasSelection && hasAlternative && hasRationale,
      hasSelection,
      hasAlternative,
      hasRationale
    };
  });

  const passedCount = findings.filter((item) => item.passed).length;
  const percent = findings.length ? Math.round((passedCount / findings.length) * 100) : 100;
  return { percent, passed: percent === 100, findings };
}

export function evaluateSystemDesignAttempt(scenario, attempt) {
  const components = componentMap(attempt);
  const providers = capabilityProviders(attempt);
  const selectedEdges = new Set(
    (attempt.edges || [])
      .filter((edge) => components.has(edge.from) && components.has(edge.to))
      .map((edge) => edgeKey(edge.from, edge.to))
  );

  const requiredCapabilities = scenario.requiredCapabilities || [];
  const missingCapabilities = requiredCapabilities.filter((capability) => !providers.has(capability));
  const capabilityPercent = requiredCapabilities.length
    ? Math.round(((requiredCapabilities.length - missingCapabilities.length) / requiredCapabilities.length) * 100)
    : 100;

  const requiredFlows = scenario.requiredFlows || [];
  const missingFlows = [];
  for (const flow of requiredFlows) {
    const fromProviders = providers.get(flow.fromCapability) || [];
    const toProviders = providers.get(flow.toCapability) || [];
    const satisfied = fromProviders.some((from) =>
      toProviders.some((to) => selectedEdges.has(edgeKey(from, to)))
    );
    if (!satisfied) missingFlows.push(flow);
  }
  const flowPercent = requiredFlows.length
    ? Math.round(((requiredFlows.length - missingFlows.length) / requiredFlows.length) * 100)
    : 100;

  const tradeoffs = evaluateTradeoffDefense(scenario.requiredTradeoffTopics || [], attempt.tradeoffs || []);

  const requiredObservationTypes = scenario.requiredObservationTypes || [];
  const observationTypes = new Set(attempt.observability || []);
  const missingObservationTypes = requiredObservationTypes.filter((item) => !observationTypes.has(item));
  const observabilityPercent = requiredObservationTypes.length
    ? Math.round(((requiredObservationTypes.length - missingObservationTypes.length) / requiredObservationTypes.length) * 100)
    : 100;

  const assumptionsRecorded = Array.isArray(attempt.assumptions) && attempt.assumptions.length > 0;
  const weights = {
    capabilities: 0.35,
    flows: 0.25,
    tradeoffs: 0.2,
    observability: 0.1,
    assumptions: 0.1,
    ...(scenario.weights || {})
  };
  const weightTotal = Object.values(weights).reduce((sum, value) => sum + value, 0);
  const weightedScore = (
    capabilityPercent * weights.capabilities +
    flowPercent * weights.flows +
    tradeoffs.percent * weights.tradeoffs +
    observabilityPercent * weights.observability +
    (assumptionsRecorded ? 100 : 0) * weights.assumptions
  ) / weightTotal;
  const percent = Math.round(weightedScore);
  const passingScore = scenario.passingScore ?? 80;

  return {
    percent,
    passed: percent >= passingScore && missingCapabilities.length === 0,
    dimensions: {
      capabilities: capabilityPercent,
      flows: flowPercent,
      tradeoffs: tradeoffs.percent,
      observability: observabilityPercent,
      assumptions: assumptionsRecorded ? 100 : 0
    },
    missingCapabilities,
    missingFlows,
    missingObservationTypes,
    tradeoffFindings: tradeoffs.findings,
    assumptionsRecorded
  };
}

export function createSystemDesignReceipt({ scenario, attempt, evaluation, capacityEvaluation = null }) {
  const payload = canonicalize({
    schema: 'system-design-evidence-receipt/v1',
    scenario: { id: scenario.id, version: scenario.version },
    attempt,
    evaluation,
    capacityEvaluation
  });
  const digest = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  return { ...payload, digest: `sha256:${digest}` };
}

export const RATE_LIMITED_URL_SHORTENER_SCENARIO = {
  id: 'rate-limited-url-shortener',
  version: '1.0.0',
  title: 'Design a rate-limited URL shortener API',
  passingScore: 80,
  requiredCapabilities: [
    'public-api-entry',
    'request-rate-limiting',
    'short-key-generation',
    'durable-url-storage',
    'redirect-cache'
  ],
  requiredFlows: [
    { fromCapability: 'public-api-entry', toCapability: 'request-rate-limiting' },
    { fromCapability: 'request-rate-limiting', toCapability: 'short-key-generation' },
    { fromCapability: 'short-key-generation', toCapability: 'durable-url-storage' }
  ],
  requiredTradeoffTopics: ['key-generation', 'consistency', 'caching', 'rate-limiting'],
  requiredObservationTypes: ['metrics', 'logs', 'traces'],
  capacityInputs: {
    writesPerDay: 100_000_000,
    readWriteRatio: 100,
    retentionDays: 365 * 5,
    bytesPerRecord: 500,
    replicationFactor: 3,
    peakMultiplier: 3
  }
};
