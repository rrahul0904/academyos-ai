import { applyArchitectureResult, applyBlitzAnswer, applyExamResult, evaluateArchitecture, initialProgress, readinessLabel, scoreExam } from '/src/domain.mjs';
import { gradeStudyQuiz, recordFlashcardReview } from '/src/study.mjs';
import { blitzCards, questions, scenarios, tracks } from '/public/data.mjs';

const root = document.querySelector('#app');
const STORAGE_KEY = 'academyos-state-v1';
const STUDY_STORAGE_KEY = 'academyos-study-v1';
const studySaved = JSON.parse(localStorage.getItem(STUDY_STORAGE_KEY) || 'null');
const studyState = {
  library: Array.isArray(studySaved?.library) ? studySaved.library : [],
  activePackId: studySaved?.activePackId || null,
  reviews: studySaved?.reviews || {}
};
const studyUi = { loading: false, error: '', answers: {}, revealed: {}, lastQuiz: null };

function persistStudy() {
  localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(studyState));
}
function activeStudyPack() {
  return studyState.library.find((pack) => pack.id === studyState.activePackId) || studyState.library[0] || null;
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
const state = {
  route: location.hash.slice(1) || 'dashboard',
  activeTrackId: saved?.activeTrackId || 'aws-saa',
  progress: { ...initialProgress(), ...(saved?.progress || {}) },
  exam: null,
  blitz: null,
  architecture: null
};

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeTrackId: state.activeTrackId, progress: state.progress }));
}
function activeTrack() { return tracks.find((track) => track.id === state.activeTrackId) || tracks[0]; }
function navigate(route) { state.route = route; location.hash = route; render(); }
window.addEventListener('hashchange', () => { state.route = location.hash.slice(1) || 'dashboard'; render(); });

function layout(content) {
  const nav = [['dashboard','Practice Hub'],['study','Study Lab'],['catalog','Certification Catalog'],['exam','Practice Exam'],['blitz','Blitz'],['architecture','Arch Builder']];
  const navButtons = nav.map(([route,label]) => `<button data-route="${route}" class="${state.route === route ? 'active' : ''}">${label}</button>`).join('');
  root.innerHTML = `<div class="shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">A</span> AcademyOS AI</div><nav class="nav">${navButtons}</nav><div class="side-card"><div class="eyebrow">Active track</div><strong>${activeTrack().provider} ${activeTrack().code}</strong><p class="muted" style="margin:8px 0 0">${activeTrack().title}</p></div></aside><main class="main"><div class="mobile-nav nav">${navButtons}</div>${content}</main></div>`;
  root.querySelectorAll('[data-route]').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.route)));
}

function dashboard() {
  const p = state.progress;
  const track = activeTrack();
  const history = p.history.length ? p.history.map((item) => `<div class="history-item"><span>${item.type === 'exam' ? 'Practice exam' : item.type}</span><strong>${item.score}%</strong></div>`).join('') : '<p class="muted">Your first completed exam will appear here.</p>';
  layout(`<div class="topbar"><div><div class="eyebrow">Practice Hub</div><h1>Build proof, not just confidence.</h1><p class="muted">${track.provider} ${track.code} · ${track.title}</p></div><button class="btn primary" id="start-exam">Start practice exam</button></div><section class="grid metrics"><div class="metric"><span class="muted">Readiness</span><strong>${p.readiness}%</strong><span class="pill">${readinessLabel(p.readiness)}</span></div><div class="metric"><span class="muted">Study streak</span><strong>${p.streak} day${p.streak === 1 ? '' : 's'}</strong><span class="muted">Keep the loop alive</span></div><div class="metric"><span class="muted">XP</span><strong>${p.xp.toLocaleString()}</strong><span class="muted">Cross-mode progression</span></div><div class="metric"><span class="muted">Exam attempts</span><strong>${p.examsCompleted}</strong><span class="muted">72% target score</span></div></section><section class="grid two-col"><div class="card"><div class="eyebrow">Today's adaptive loop</div><h2>Three moves that improve readiness</h2><div class="daily-list"><div class="daily-item"><div><strong>1. Exam questions</strong><div class="muted">8 mixed questions across the blueprint</div></div><button class="btn" data-action="exam">Practice</button></div><div class="daily-item"><div><strong>2. Blitz recall</strong><div class="muted">Fast concept retrieval under pressure</div></div><button class="btn" data-action="blitz">Launch</button></div><div class="daily-item"><div><strong>3. Architecture Builder</strong><div class="muted">Turn service knowledge into system design</div></div><button class="btn" data-action="architecture">Build</button></div></div></div><div class="card"><div class="eyebrow">Recent evidence</div><h2>Attempt history</h2><div class="history">${history}</div></div></section>`);
  root.querySelector('#start-exam').addEventListener('click', startExam);
  root.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => { const action = button.dataset.action; if (action === 'exam') startExam(); else navigate(action); }));
}

function catalog() {
  layout(`<div class="topbar"><div><div class="eyebrow">Certification catalog</div><h1>One learning engine, many ecosystems.</h1><p class="muted">Choose the track that drives your adaptive practice loop.</p></div></div><section class="grid track-grid">${tracks.map((track) => `<article class="card track-card"><span class="provider">${track.provider} · ${track.level}</span><h2>${track.title}</h2><span class="pill">${track.code}</span><p class="muted" style="margin-top:14px">${track.description}</p><div class="spacer"></div><button class="btn ${track.id === state.activeTrackId ? 'primary' : ''}" data-track="${track.id}">${track.id === state.activeTrackId ? 'Current track' : 'Make active'}</button></article>`).join('')}</section>`);
  root.querySelectorAll('[data-track]').forEach((button) => button.addEventListener('click', () => { state.activeTrackId = button.dataset.track; persist(); render(); }));
}

function startExam() { state.exam = { index: 0, answers: {}, result: null, deadline: Date.now() + 30 * 60 * 1000 }; navigate('exam'); }
function finishExam() { const result = scoreExam(questions, state.exam.answers); state.exam.result = result; state.progress = applyExamResult(state.progress, result); persist(); exam(); }

function exam() {
  if (!state.exam) {
    layout(`<div class="topbar"><div><div class="eyebrow">Practice exam</div><h1>Exam simulation</h1><p class="muted">Mixed-domain questions, explanations and blueprint analytics.</p></div></div><div class="card"><h2>Ready for a clean attempt?</h2><p class="muted">This slice uses 8 curated questions and a 30-minute timer. Your score updates readiness and XP.</p><button class="btn primary" id="begin">Begin exam</button></div>`);
    root.querySelector('#begin').addEventListener('click', startExam); return;
  }
  if (state.exam.result) {
    const result = state.exam.result;
    layout(`<div class="topbar"><div><div class="eyebrow">Attempt complete</div><h1>${result.passed ? 'Pass threshold cleared.' : 'Use the gaps as your roadmap.'}</h1></div></div><section class="grid two-col"><div class="card"><div class="result-score">${result.percent}%</div><p class="muted">${result.correct} of ${result.total} correct · target 72%</p><div class="actions"><button class="btn primary" id="retry">Try another attempt</button><button class="btn" id="home">Back to hub</button></div></div><div class="card"><h2>Domain performance</h2>${Object.entries(result.domains).map(([name,value]) => `<div class="domain-row"><div><strong>${name}</strong><div class="progress"><span style="width:${value.percent}%"></span></div></div><strong>${value.percent}%</strong></div>`).join('')}</div></section>`);
    root.querySelector('#retry').addEventListener('click', startExam); root.querySelector('#home').addEventListener('click', () => navigate('dashboard')); return;
  }
  const q = questions[state.exam.index];
  const selected = state.exam.answers[q.id];
  const remaining = Math.max(0, state.exam.deadline - Date.now());
  const minutes = Math.floor(remaining / 60000).toString().padStart(2, '0');
  const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
  layout(`<div class="topbar"><div><div class="eyebrow">Practice exam · ${q.domain}</div><h1>Question ${state.exam.index + 1} of ${questions.length}</h1></div><div class="timer">${minutes}:${seconds}</div></div><div class="card"><div class="progress"><span style="width:${((state.exam.index + 1) / questions.length) * 100}%"></span></div><div class="question">${q.prompt}</div><div class="options">${q.options.map((option,index) => `<button class="option ${selected === index ? 'selected' : ''}" data-answer="${index}"><span class="option-key">${String.fromCharCode(65+index)}</span><span>${option}</span></button>`).join('')}</div><div class="exam-footer"><button class="btn" id="prev" ${state.exam.index === 0 ? 'disabled' : ''}>Previous</button><button class="btn primary" id="next">${state.exam.index === questions.length - 1 ? 'Finish exam' : 'Next'}</button></div></div>`);
  root.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => { state.exam.answers[q.id] = Number(button.dataset.answer); exam(); }));
  root.querySelector('#prev').addEventListener('click', () => { state.exam.index -= 1; exam(); });
  root.querySelector('#next').addEventListener('click', () => { if (state.exam.index < questions.length - 1) { state.exam.index += 1; exam(); return; } finishExam(); });
}

let blitzInterval;
function startBlitz() {
  clearInterval(blitzInterval);
  state.blitz = { index: 0, time: 60, streak: 0, correct: 0, complete: false, feedback: '' };
  blitzInterval = setInterval(() => { if (!state.blitz || state.route !== 'blitz') return; state.blitz.time -= 1; if (state.blitz.time <= 0) { state.blitz.time = 0; state.blitz.complete = true; clearInterval(blitzInterval); } blitz(); }, 1000);
  blitz();
}
function blitz() {
  if (!state.blitz) { layout(`<div class="blitz"><div class="eyebrow">Blitz</div><h1>Recall speed is a skill.</h1><p class="muted">Answer rapid-fire cards. Correct streaks build XP; wrong answers cost 4 seconds.</p><button class="btn primary" id="start-blitz">Start 60-second Blitz</button></div>`); root.querySelector('#start-blitz').addEventListener('click', startBlitz); return; }
  if (state.blitz.complete || state.blitz.index >= blitzCards.length) { clearInterval(blitzInterval); layout(`<div class="blitz"><div class="eyebrow">Blitz complete</div><h1>${state.blitz.correct}/${blitzCards.length} recalled</h1><p class="muted">You earned fast-recall XP. Repeat until the answers become automatic.</p><div class="actions" style="justify-content:center"><button class="btn primary" id="again">Run it again</button><button class="btn" id="hub">Practice Hub</button></div></div>`); root.querySelector('#again').addEventListener('click', startBlitz); root.querySelector('#hub').addEventListener('click', () => navigate('dashboard')); return; }
  const card = blitzCards[state.blitz.index];
  layout(`<div class="blitz"><div class="eyebrow">Blitz · card ${state.blitz.index + 1}/${blitzCards.length}</div><div class="blitz-stats"><span>Time <strong>${state.blitz.time}s</strong></span><span>Streak <strong>${state.blitz.streak}</strong></span><span>Correct <strong>${state.blitz.correct}</strong></span></div><div class="blitz-prompt">${card.prompt}</div><div class="options">${card.options.map((option,index) => `<button class="option" data-blitz-answer="${index}"><span class="option-key">${String.fromCharCode(65+index)}</span>${option}</button>`).join('')}</div></div>`);
  root.querySelectorAll('[data-blitz-answer]').forEach((button) => button.addEventListener('click', () => { const isCorrect = Number(button.dataset.blitzAnswer) === card.answer; state.blitz.streak = isCorrect ? state.blitz.streak + 1 : 0; state.blitz.correct += isCorrect ? 1 : 0; state.blitz.time = Math.max(0, state.blitz.time + (isCorrect && state.blitz.streak >= 3 ? 2 : isCorrect ? 0 : -4)); state.progress = applyBlitzAnswer(state.progress, isCorrect, state.blitz.streak); state.blitz.index += 1; persist(); setTimeout(blitz, 160); }));
}

function architecture() {
  const scenario = scenarios[0];
  state.architecture ||= { services: [], edges: [], result: null };
  const a = state.architecture;
  layout(`<div class="topbar"><div><div class="eyebrow">Architecture Builder</div><h1>${scenario.title}</h1><p class="muted">${scenario.brief}</p></div></div><section class="grid two-col"><div class="card"><h2>1. Choose services</h2><div class="service-grid">${scenario.palette.map((service) => `<button class="service-chip ${a.services.includes(service) ? 'selected' : ''}" data-service="${service}">${service}</button>`).join('')}</div><h2 style="margin-top:26px">2. Connect the design</h2><div class="edge-builder"><select id="edge-from">${a.services.map((s) => `<option>${s}</option>`).join('')}</select><span>→</span><select id="edge-to">${a.services.map((s) => `<option>${s}</option>`).join('')}</select><button class="btn" id="add-edge">Add</button></div><div class="edge-list">${a.edges.map((edge,index) => `<button class="edge" data-remove-edge="${index}">${edge.from} → ${edge.to} ×</button>`).join('')}</div><div class="actions" style="margin-top:24px"><button class="btn primary" id="evaluate">Evaluate architecture</button><button class="btn" id="reset-arch">Reset</button></div></div><div class="card"><h2>Evaluation model</h2><p class="muted">The score is weighted 60% for required services and 40% for required connections.</p>${a.result ? `<div class="notice ${a.result.passed ? 'success' : 'error'}"><strong>${a.result.percent}% · ${a.result.passed ? 'Passed' : 'Needs revision'}</strong><br>${a.result.missingServices.length ? `Missing services: ${a.result.missingServices.join(', ')}.<br>` : ''}${a.result.missingEdges.length ? `Missing connections: ${a.result.missingEdges.map((e) => `${e.from}→${e.to}`).join(', ')}.` : 'All required connections present.'}</div>` : '<p class="muted">Build your architecture, then evaluate it.</p>'}</div></section>`);
  root.querySelectorAll('[data-service]').forEach((button) => button.addEventListener('click', () => { const service = button.dataset.service; a.services = a.services.includes(service) ? a.services.filter((item) => item !== service) : [...a.services, service]; a.edges = a.edges.filter((edge) => a.services.includes(edge.from) && a.services.includes(edge.to)); a.result = null; architecture(); }));
  root.querySelector('#add-edge').addEventListener('click', () => { const from = root.querySelector('#edge-from').value; const to = root.querySelector('#edge-to').value; if (!from || !to || from === to) return; if (!a.edges.some((edge) => edge.from === from && edge.to === to)) a.edges.push({ from, to }); architecture(); });
  root.querySelectorAll('[data-remove-edge]').forEach((button) => button.addEventListener('click', () => { a.edges.splice(Number(button.dataset.removeEdge), 1); architecture(); }));
  root.querySelector('#evaluate').addEventListener('click', () => { a.result = evaluateArchitecture(scenario, a.services, a.edges); state.progress = applyArchitectureResult(state.progress, a.result); persist(); architecture(); });
  root.querySelector('#reset-arch').addEventListener('click', () => { state.architecture = { services: [], edges: [], result: null }; architecture(); });
}


function study() {
  const pack = activeStudyPack();
  const library = studyState.library.length
    ? studyState.library.map((item) => `<button class="study-library-item ${item.id === pack?.id ? 'active' : ''}" data-study-pack="${escapeHtml(item.id)}"><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.provider || 'local')} · ${item.flashcards?.length || 0} cards</small></span><span>→</span></button>`).join('')
    : '<p class="muted">No saved study packs yet.</p>';

  const packView = !pack ? `
    <div class="card study-empty">
      <div class="eyebrow">Your study pack will appear here</div>
      <h2>Turn passive notes into active practice.</h2>
      <p class="muted">Generate a pack to get a summary, flashcards, and a quiz from the same source material.</p>
    </div>` : (() => {
      const summary = (pack.summary || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
      const cards = (pack.flashcards || []).map((card, index) => {
        const revealed = Boolean(studyUi.revealed[card.id]);
        const receipt = studyState.reviews[card.id];
        return `<article class="study-card">
          <div class="study-card-count">Card ${index + 1}</div>
          <h3>${escapeHtml(card.front)}</h3>
          <div class="study-card-answer ${revealed ? 'revealed' : ''}">${revealed ? escapeHtml(card.back) : 'Think first, then reveal the answer.'}</div>
          <div class="actions">
            <button class="btn" data-reveal-card="${escapeHtml(card.id)}">${revealed ? 'Hide answer' : 'Reveal answer'}</button>
            ${revealed ? `<button class="btn" data-rate-card="${escapeHtml(card.id)}" data-rating="hard">Hard</button><button class="btn" data-rate-card="${escapeHtml(card.id)}" data-rating="good">Good</button><button class="btn" data-rate-card="${escapeHtml(card.id)}" data-rating="easy">Easy</button>` : ''}
          </div>
          ${receipt ? `<small class="muted">Last: ${escapeHtml(receipt.rating)} · due ${escapeHtml(new Date(receipt.dueAt).toLocaleDateString())}</small>` : ''}
        </article>`;
      }).join('');

      const quizResult = studyUi.lastQuiz;
      const quiz = (pack.quiz || []).map((question, index) => {
        const selected = studyUi.answers[question.id];
        const resultItem = quizResult?.items?.find((item) => item.id === question.id);
        return `<article class="study-question">
          <div class="eyebrow">Question ${index + 1}</div>
          <h3>${escapeHtml(question.prompt)}</h3>
          <div class="options">
            ${question.options.map((option, optionIndex) => `<button class="option ${selected === optionIndex ? 'selected' : ''}" data-study-answer="${escapeHtml(question.id)}" data-option="${optionIndex}"><span class="option-key">${String.fromCharCode(65 + optionIndex)}</span><span>${escapeHtml(option)}</span></button>`).join('')}
          </div>
          ${resultItem ? `<div class="notice ${resultItem.isCorrect ? 'success' : 'error'}"><strong>${resultItem.isCorrect ? 'Correct' : 'Review this one'}</strong><br>${escapeHtml(question.explanation)}</div>` : ''}
        </article>`;
      }).join('');

      return `
        <section class="card study-pack-head">
          <div>
            <div class="eyebrow">Generated study pack</div>
            <h2>${escapeHtml(pack.title)}</h2>
            <p class="muted">Provider: <strong>${escapeHtml(pack.provider || 'local')}</strong>${pack.model ? ` · ${escapeHtml(pack.model)}` : ''} · source ${escapeHtml(pack.sourceDigest || 'n/a')}</p>
          </div>
          <span class="pill">${pack.flashcards?.length || 0} cards · ${pack.quiz?.length || 0} questions</span>
        </section>
        <section class="card">
          <div class="eyebrow">Fast review</div>
          <h2>Summary</h2>
          <ul class="study-summary">${summary}</ul>
        </section>
        <section>
          <div class="section-heading"><div><div class="eyebrow">Active recall</div><h2>Flashcards</h2></div></div>
          <div class="study-card-grid">${cards}</div>
        </section>
        <section class="card">
          <div class="section-heading"><div><div class="eyebrow">Retrieval check</div><h2>Quiz</h2></div>${quizResult ? `<span class="pill">${quizResult.percent}% · ${quizResult.correct}/${quizResult.total}</span>` : ''}</div>
          <div class="study-quiz">${quiz}</div>
          <div class="actions"><button class="btn primary" id="grade-study-quiz">Grade quiz</button><button class="btn" id="reset-study-quiz">Reset answers</button></div>
        </section>`;
    })();

  layout(`
    <div class="topbar">
      <div><div class="eyebrow">Study Lab</div><h1>Make your notes fight back.</h1><p class="muted">One source becomes a summary, flashcards, and retrieval practice.</p></div>
    </div>
    <section class="study-layout">
      <div class="card">
        <div class="eyebrow">Create a study pack</div>
        <h2>Paste what you actually need to learn.</h2>
        <form id="study-form" class="study-form">
          <label>Title<input id="study-title" maxlength="120" placeholder="e.g. Cell biology — Unit 3"></label>
          <label>Notes or source material<textarea id="study-source" minlength="40" maxlength="20000" rows="11" placeholder="Paste lecture notes, a chapter excerpt, or your own study notes…"></textarea></label>
          <button class="btn primary" type="submit" ${studyUi.loading ? 'disabled' : ''}>${studyUi.loading ? 'Generating…' : 'Generate study pack'}</button>
          <p class="muted study-privacy">Private-by-default: local deterministic generation is the default. A server deployment must explicitly enable a remote AI provider.</p>
          ${studyUi.error ? `<div class="notice error">${escapeHtml(studyUi.error)}</div>` : ''}
        </form>
      </div>
      <aside class="card study-library">
        <div class="eyebrow">Study library</div>
        <h2>Recent packs</h2>
        ${library}
      </aside>
    </section>
    <div class="study-output">${packView}</div>
  `);

  root.querySelector('#study-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = root.querySelector('#study-title').value;
    const sourceText = root.querySelector('#study-source').value;
    studyUi.loading = true;
    studyUi.error = '';
    study();
    try {
      const response = await fetch('/api/study-pack', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, sourceText })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Study-pack generation failed.');
      const nextPack = payload.pack;
      studyState.library = [nextPack, ...studyState.library.filter((item) => item.id !== nextPack.id)].slice(0, 10);
      studyState.activePackId = nextPack.id;
      studyUi.answers = {};
      studyUi.revealed = {};
      studyUi.lastQuiz = null;
      persistStudy();
    } catch (error) {
      studyUi.error = error instanceof Error ? error.message : 'Study-pack generation failed.';
    } finally {
      studyUi.loading = false;
      study();
    }
  });

  root.querySelectorAll('[data-study-pack]').forEach((button) => button.addEventListener('click', () => {
    studyState.activePackId = button.dataset.studyPack;
    studyUi.answers = {};
    studyUi.revealed = {};
    studyUi.lastQuiz = null;
    persistStudy();
    study();
  }));

  root.querySelectorAll('[data-reveal-card]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.revealCard;
    studyUi.revealed[id] = !studyUi.revealed[id];
    study();
  }));

  root.querySelectorAll('[data-rate-card]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.rateCard;
    studyState.reviews = recordFlashcardReview(studyState.reviews, id, button.dataset.rating);
    persistStudy();
    study();
  }));

  root.querySelectorAll('[data-study-answer]').forEach((button) => button.addEventListener('click', () => {
    studyUi.answers[button.dataset.studyAnswer] = Number(button.dataset.option);
    studyUi.lastQuiz = null;
    study();
  }));

  root.querySelector('#grade-study-quiz')?.addEventListener('click', () => {
    studyUi.lastQuiz = gradeStudyQuiz(pack, studyUi.answers);
    study();
  });

  root.querySelector('#reset-study-quiz')?.addEventListener('click', () => {
    studyUi.answers = {};
    studyUi.lastQuiz = null;
    study();
  });
}

function render() { if (state.route !== 'blitz') clearInterval(blitzInterval); ({ dashboard, study, catalog, exam, blitz, architecture }[state.route] || dashboard)(); }
render();
