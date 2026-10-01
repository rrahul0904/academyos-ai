# AI Study Lab reverse-engineering notes

## Source reviewed

- Reddit post: https://www.reddit.com/r/sideprojects/comments/1wum5ld/i_built_an_ai_study_app_because_normal_studying/
- Snapshot date: 2026-09-30.
- The source is a prerelease hosted-video demo titled **“I built an AI study app because normal studying is painfully boring. Here’s the demo.”**
- The post has no written body. Reddit metadata reports a ~118-second hosted video and no comments at the time of research, so there was no source-thread feedback to incorporate.

This is a clean-room product study. AcademyOS AI does not copy source code, assets, hidden implementation details, or distinctive UI text from the reference.

## Market mechanics corroborated during research

Current study products consistently converge on a few useful loops:

1. Source material becomes a structured study artifact rather than remaining passive notes.
2. The same source can produce multiple modes: summary/lesson, flashcards, quizzes, tutor, and concept map.
3. Active recall is more useful when progress and weak items feed the next session.
4. Students benefit from exam- or room-scoped organization instead of one undifferentiated chat history.
5. Social rooms and audio are useful extensions, but they should not block the core single-user study loop.

## AcademyOS AI product interpretation

The strongest independent extension is a **Study Lab** inside the existing learning shell:

`paste notes -> generate pack -> read summary -> retrieve with flashcards -> take quiz -> review weak material -> repeat`

Phase A intentionally supports two generation paths:

- **local** (default): deterministic, offline, credential-free generation for reliable demos/tests;
- **openai** (opt-in): server-side Responses API generation when `STUDY_AI_PROVIDER=openai` and an API key are configured.

The UI always labels which provider produced a pack. A local pack must never be presented as a remote-AI result.

## Phase roadmap

### Phase A — executable vertical slice

- Paste notes and optional title.
- Source-grounded summary, flashcards, and multiple-choice quiz.
- Flashcard Hard/Good/Easy review receipts.
- Quiz grading and explanations.
- Local study-pack library and progress persistence.
- Responsive Study Lab integrated into AcademyOS AI.
- Deterministic tests for validation, generation, quiz integrity, review scheduling, and no-network local mode.

### Phase B — source fidelity and retrieval

- PDF/TXT upload.
- Chunking and evidence spans/citations.
- Grounded tutor scoped to selected study packs.
- Spaced-repetition scheduler and weak-topic queue.
- Source-version invalidation when notes change.

### Phase C — richer learning modes

- Feynman/explain-back.
- Concept maps.
- Exam-plan workspace.
- Audio overview.
- Adaptive session planner.

### Phase D — product foundation

- Accounts and durable sync.
- Private/shared study rooms.
- Collaboration.
- Entitlements/billing.
- Analytics and content-quality evaluation.

## Non-claims

This repository does not claim source-product parity, copied implementation, improved grades, production readiness, or live-provider verification unless those items are separately evidenced.
