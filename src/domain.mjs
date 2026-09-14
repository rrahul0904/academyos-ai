export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function scoreExam(questions, answers) {
  const totals = new Map();
  let correct = 0;

  for (const question of questions) {
    const selected = answers[question.id];
    const isCorrect = selected === question.answer;
    if (isCorrect) correct += 1;

    const current = totals.get(question.domain) || { correct: 0, total: 0 };
    current.total += 1;
    if (isCorrect) current.correct += 1;
    totals.set(question.domain, current);
  }

  const percent = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  const domains = Object.fromEntries(
    [...totals.entries()].map(([domain, values]) => [
      domain,
      { ...values, percent: Math.round((values.correct / values.total) * 100) }
    ])
  );

  return {
    correct,
    total: questions.length,
    percent,
    passed: percent >= 72,
    domains
  };
}

export function initialProgress() {
  return {
    xp: 0,
    streak: 1,
    readiness: 12,
    examsCompleted: 0,
    blitzCorrect: 0,
    architectureWins: 0,
    lastStudyDate: null,
    history: []
  };
}

export function applyExamResult(progress, result, now = new Date()) {
  const xpGain = 80 + result.correct * 15 + (result.passed ? 120 : 0);
  const readinessGain = Math.round((result.percent - 50) / 8);
  const entry = {
    type: 'exam',
    score: result.percent,
    passed: result.passed,
    at: now.toISOString()
  };

  return {
    ...progress,
    xp: progress.xp + xpGain,
    readiness: clamp(progress.readiness + readinessGain, 0, 100),
    examsCompleted: progress.examsCompleted + 1,
    lastStudyDate: now.toISOString(),
    history: [entry, ...progress.history].slice(0, 12)
  };
}

export function applyBlitzAnswer(progress, isCorrect, streak) {
  return {
    ...progress,
    xp: progress.xp + (isCorrect ? 10 + streak * 2 : 2),
    blitzCorrect: progress.blitzCorrect + (isCorrect ? 1 : 0),
    lastStudyDate: new Date().toISOString()
  };
}

function edgeKey(from, to) {
  return `${from}->${to}`;
}

export function evaluateArchitecture(scenario, selectedServices, selectedEdges) {
  const services = new Set(selectedServices);
  const edges = new Set(selectedEdges.map((edge) => edgeKey(edge.from, edge.to)));
  const requiredServices = scenario.requiredServices || [];
  const requiredEdges = scenario.requiredEdges || [];

  const serviceHits = requiredServices.filter((item) => services.has(item)).length;
  const edgeHits = requiredEdges.filter((edge) => edges.has(edgeKey(edge.from, edge.to))).length;
  const serviceScore = requiredServices.length ? serviceHits / requiredServices.length : 1;
  const edgeScore = requiredEdges.length ? edgeHits / requiredEdges.length : 1;
  const percent = Math.round((serviceScore * 0.6 + edgeScore * 0.4) * 100);

  return {
    percent,
    passed: percent >= 80,
    missingServices: requiredServices.filter((item) => !services.has(item)),
    missingEdges: requiredEdges.filter((edge) => !edges.has(edgeKey(edge.from, edge.to)))
  };
}

export function applyArchitectureResult(progress, result) {
  return {
    ...progress,
    xp: progress.xp + Math.max(25, result.percent) + (result.passed ? 100 : 0),
    readiness: clamp(progress.readiness + (result.passed ? 4 : 1), 0, 100),
    architectureWins: progress.architectureWins + (result.passed ? 1 : 0),
    lastStudyDate: new Date().toISOString()
  };
}

export function readinessLabel(value) {
  if (value >= 85) return 'Exam ready';
  if (value >= 65) return 'Nearly ready';
  if (value >= 40) return 'Building confidence';
  return 'Foundation stage';
}
