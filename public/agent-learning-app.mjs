import {
  AGENT_STAGES,
  canUseFrameworks,
  createAgentLearningState,
  lessonStatus,
  nextLesson,
  prerequisitesMet,
  recordStageEvidence
} from '/src/agent-learning.mjs';
import { agentLearningTrack } from '/public/agent-learning-data.mjs';

const STORAGE_KEY = 'academyos-agent-learning-v1';
const root = document.querySelector('#agent-app');
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
let state = saved?.state || createAgentLearningState();
let activeLessonId = saved?.activeLessonId || null;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, activeLessonId }));
}

function lessonUnlocked(lesson) {
  return prerequisitesMet(state, lesson) && (!lesson.requiresFrameworkGate || canUseFrameworks(state));
}

function activeLesson() {
  const available = agentLearningTrack.lessons.find((lesson) => lesson.id === activeLessonId && lessonUnlocked(lesson));
  if (available) return available;
  const recommended = nextLesson(agentLearningTrack.lessons.filter((lesson) => !lesson.requiresFrameworkGate || canUseFrameworks(state)), state);
  return recommended || agentLearningTrack.lessons.find(lessonUnlocked) || agentLearningTrack.lessons[0];
}

function renderLessonList() {
  return agentLearningTrack.lessons.map((lesson, index) => {
    const unlocked = lessonUnlocked(lesson);
    const completed = state.completedLessons.includes(lesson.id);
    const status = lessonStatus(state, lesson.id);
    return `<button class="lesson-button ${lesson.id === activeLesson().id ? 'active' : ''} ${unlocked ? '' : 'locked'}" data-lesson="${lesson.id}" ${unlocked ? '' : 'disabled'}>
      <strong>${index + 1}. ${escapeHtml(lesson.title)}</strong>
      <div class="lesson-meta">
        <span>${completed ? 'Completed' : unlocked ? `Current: ${status.stage}` : 'Locked'}</span>
        ${lesson.requiresFrameworkGate ? '<span>Framework gate</span>' : ''}
      </div>
    </button>`;
  }).join('');
}

function renderStages(lesson) {
  const status = lessonStatus(state, lesson.id);
  const completed = state.completedLessons.includes(lesson.id);
  const currentIndex = AGENT_STAGES.indexOf(status.stage);
  return AGENT_STAGES.map((stage, index) => {
    const done = completed || index < currentIndex;
    const current = !completed && index === currentIndex;
    return `<div class="stage ${done ? 'done' : ''} ${current ? 'current' : ''}">${done ? '✓ ' : ''}${stage}</div>`;
  }).join('');
}

function stagePrompt(lesson, stage) {
  const prompts = {
    concept: 'Explain the primitive in your own words before using framework vocabulary.',
    build: lesson.build,
    break: `Trigger one known failure deliberately: ${(lesson.break || []).join(', ')}.`,
    diagnose: 'State what failed, where it failed, and which deterministic guardrail should handle it.',
    verify: 'Run a repeatable check or eval. Record enough evidence that the result can be inspected later.',
    ship: lesson.ship
  };
  return prompts[stage] || '';
}

function renderEvidenceForm(lesson) {
  const status = lessonStatus(state, lesson.id);
  const stage = status.stage;
  if (state.completedLessons.includes(lesson.id)) {
    return `<div class="unlock-banner"><strong>Lesson shipped.</strong><br><span class="small">The artifact is part of your evidence history. Continue to the next unlocked lesson.</span></div>`;
  }

  const failureField = stage === 'break'
    ? `<div class="field"><label>Observed failure</label><select id="observed-failure"><option value="">Choose a failure you actually triggered</option>${(lesson.break || []).map((failure) => `<option value="${escapeHtml(failure)}">${escapeHtml(failure)}</option>`).join('')}</select></div>`
    : '';
  const artifactField = stage === 'ship'
    ? `<div class="field"><label>Artifact hash / immutable receipt ID</label><input id="artifact-hash" placeholder="sha256:…" /></div>`
    : '';
  const commandField = ['build', 'verify', 'ship'].includes(stage)
    ? `<div class="field"><label>Command or verification action</label><input id="evidence-command" placeholder="e.g. node agent.mjs or npm test" /></div><div class="field"><label>Exit code</label><input id="evidence-exit" inputmode="numeric" placeholder="0" /></div>`
    : '';

  return `<div class="agent-panel">
    <div class="eyebrow">Current stage · ${stage}</div>
    <h2>${escapeHtml(stagePrompt(lesson, stage))}</h2>
    <div class="proof-grid">${failureField}${artifactField}${commandField}</div>
    <div class="stage-action">
      <button class="btn primary" id="record-stage">Record ${stage} evidence</button>
      <button class="btn" id="record-failed">Record failed attempt</button>
    </div>
    <p class="small">This Phase-A workspace records learner evidence. It does not yet execute provider APIs or untrusted code.</p>
  </div>`;
}

function renderReceipts(lesson) {
  const receipts = state.receipts.filter((receipt) => receipt.lessonId === lesson.id).slice().reverse();
  if (!receipts.length) return '<div class="empty">No evidence receipts yet.</div>';
  return receipts.map((receipt) => `<div class="receipt">
    <strong>${escapeHtml(receipt.stage)} · ${escapeHtml(receipt.status)}</strong>
    <div class="small">${escapeHtml(receipt.at)}</div>
    ${receipt.observedFailure ? `<div>Observed: ${escapeHtml(receipt.observedFailure)}</div>` : ''}
    ${receipt.command ? `<div>Action: <code>${escapeHtml(receipt.command)}</code>${receipt.exitCode !== null ? ` · exit ${receipt.exitCode}` : ''}</div>` : ''}
    ${receipt.artifactHash ? `<div>Artifact: <code>${escapeHtml(receipt.artifactHash)}</code></div>` : ''}
  </div>`).join('');
}

function render() {
  const lesson = activeLesson();
  activeLessonId = lesson.id;
  const frameworkUnlocked = canUseFrameworks(state);
  const completedCount = state.completedLessons.length;
  const verifiedCount = state.verifiedCapabilities.length;
  const lessonState = lessonStatus(state, lesson.id);

  root.innerHTML = `<main class="agent-shell">
    <header class="agent-header">
      <div>
        <div class="eyebrow">AcademyOS AI · ${escapeHtml(agentLearningTrack.title)}</div>
        <h1>${escapeHtml(agentLearningTrack.promise)}</h1>
        <div class="pill-row"><span class="pill">${completedCount}/${agentLearningTrack.lessons.length} lessons shipped</span><span class="pill">${verifiedCount} capabilities verified</span></div>
      </div>
      <div><a class="btn" href="/">Practice Hub</a></div>
    </header>

    ${frameworkUnlocked
      ? '<div class="unlock-banner"><strong>Framework gate unlocked.</strong> You have verified the core agent primitives; framework lessons can now be treated as abstraction comparisons.</div>'
      : '<div class="lock-banner"><strong>Frameworks intentionally locked.</strong> Verify the raw agent loop, guardrails, inspectable state, failure handling and evals first.</div>'}

    <section class="agent-grid">
      <aside class="agent-panel">
        <div class="eyebrow">Learning route</div>
        <h2>One project, increasing capability</h2>
        <p class="small">New concepts unlock only when prerequisite lessons have shipped evidence.</p>
        <div class="lesson-list">${renderLessonList()}</div>
        <div class="stage-action"><button class="btn" id="reset-learning">Reset local learning state</button></div>
      </aside>

      <section>
        <div class="agent-panel">
          <div class="eyebrow">Lesson ${agentLearningTrack.lessons.findIndex((item) => item.id === lesson.id) + 1}</div>
          <h1>${escapeHtml(lesson.title)}</h1>
          <p class="muted">${escapeHtml(lesson.build)}</p>
          <div class="stage-strip">${renderStages(lesson)}</div>
          <div class="pill-row">${(lesson.capabilities || []).map((capability) => `<span class="pill">${escapeHtml(capability)}</span>`).join('')}</div>
          <p class="small">Attempts: ${lessonState.attempts} · observed failures: ${lessonState.failuresObserved.length}</p>
        </div>

        <div style="height:14px"></div>
        ${renderEvidenceForm(lesson)}
        <div style="height:14px"></div>
        <div class="agent-panel">
          <div class="eyebrow">Evidence timeline</div>
          <h2>What actually happened?</h2>
          ${renderReceipts(lesson)}
        </div>
      </section>
    </section>
  </main>`;

  root.querySelectorAll('[data-lesson]').forEach((button) => button.addEventListener('click', () => {
    activeLessonId = button.dataset.lesson;
    persist();
    render();
  }));

  root.querySelector('#reset-learning')?.addEventListener('click', () => {
    state = createAgentLearningState();
    activeLessonId = agentLearningTrack.lessons[0].id;
    persist();
    render();
  });

  root.querySelector('#record-stage')?.addEventListener('click', () => recordCurrentStage(lesson, 'passed'));
  root.querySelector('#record-failed')?.addEventListener('click', () => recordCurrentStage(lesson, 'failed'));
}

function recordCurrentStage(lesson, outcome) {
  const status = lessonStatus(state, lesson.id);
  const stage = status.stage;
  const observedFailure = root.querySelector('#observed-failure')?.value || null;
  const artifactHash = root.querySelector('#artifact-hash')?.value.trim() || null;
  const command = root.querySelector('#evidence-command')?.value.trim() || null;
  const exitRaw = root.querySelector('#evidence-exit')?.value.trim();
  const exitCode = exitRaw === '' || exitRaw === undefined ? null : Number(exitRaw);

  if (outcome === 'passed' && stage === 'break' && !observedFailure) {
    window.alert('Choose a failure you deliberately triggered before passing the Break stage.');
    return;
  }
  if (outcome === 'passed' && stage === 'ship' && !artifactHash) {
    window.alert('Shipping requires an artifact hash or immutable receipt ID.');
    return;
  }

  state = recordStageEvidence(state, lesson, {
    stage,
    status: outcome,
    observedFailure,
    artifactHash,
    command,
    exitCode: Number.isInteger(exitCode) ? exitCode : null
  });
  persist();
  render();
}

render();
