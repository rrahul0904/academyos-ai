# AcademyOS AI

AcademyOS AI is a provider-neutral certification and hands-on cloud learning platform inspired by the strongest product mechanics observed during the Clouding Academy reverse-engineering study.

This repository is the canonical implementation workspace.

## Current vertical slice

- Certification catalog and track selection
- Practice Hub with readiness, streak, XP and daily goals
- Timed/untimed exam engine with scoring and domain analytics
- Blitz rapid-recall mode
- Architecture Builder scenario evaluator
- AI Study Lab: notes -> summary, flashcards, quiz, review scheduling
- Local persistence so progress survives refreshes
- Zero-dependency local server and Node test suite

## Run locally

```bash
npm start
```

Then open http://localhost:4173.

Run verification with:

```bash
npm test
```

## Product direction

The target platform expands beyond a single cloud vendor and is designed around `Provider -> Certification -> Domain -> Learning Path`, with future server-backed auth, entitlements, Stripe billing, lab orchestration, analytics, and isolated cloud sandboxes.

See `docs/IMPLEMENTATION_PLAN.md` and `docs/REVERSE_ENGINEERING.md` for the phased plan and product findings.


## Study Lab generation modes

Study Lab defaults to deterministic local generation, so it runs without credentials and never silently sends pasted notes to a remote provider.

To explicitly enable OpenAI-backed study-pack generation:

```bash
STUDY_AI_PROVIDER=openai OPENAI_API_KEY=... npm start
```

Optionally set `OPENAI_MODEL`; the current default is `gpt-5.6-luna`. Live-provider behavior requires your own API access and is not exercised by the repository's deterministic test suite.
