# AcademyOS AI

AcademyOS AI is a provider-neutral certification and hands-on cloud/AI learning platform inspired by the strongest product mechanics observed during reverse-engineering studies.

This repository is the canonical implementation workspace.

## Current vertical slice

- Certification catalog and track selection
- Practice Hub with readiness, streak, XP and daily goals
- Timed/untimed exam engine with scoring and domain analytics
- Blitz rapid-recall mode
- Architecture Builder scenario evaluator
- Local persistence so progress survives refreshes
- Zero-dependency local server and Node test suite

## AI Agent Engineering direction

The AI-agent track is built around a first-principles learning contract:

`Concept -> Build -> Break -> Diagnose -> Verify -> Ship`

Learners build the underlying agent loop before framework abstractions unlock. Completion requires evidence such as failure observations, deterministic checks and shipped artifact receipts rather than tutorial completion alone.

The current Phase-A learner workspace is available at `/public/agent-learning.html` when the local server is running. It includes the lesson map, prerequisite gates, evidence timeline and framework gate. It records evidence but does not yet execute provider APIs or untrusted learner code.

See `docs/AI_AGENT_LEARNING_LOOP.md` for the route and product requirements.

## Run locally

```bash
npm start
```

Then open http://localhost:4173. The main page includes an **AI Agent Engineering** entry point.

Run verification with:

```bash
npm test
```

## Product direction

The target platform expands beyond a single cloud vendor and is designed around provider-neutral learning tracks, adaptive practice, evidence-backed labs, certification preparation and portfolio-quality artifacts, with future server-backed auth, entitlements, billing, lab orchestration, analytics and isolated sandboxes.

See `docs/IMPLEMENTATION_PLAN.md` and `docs/REVERSE_ENGINEERING.md` for the phased plan and product findings.
