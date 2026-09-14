# AcademyOS AI

AcademyOS AI is a provider-neutral certification and hands-on cloud learning platform inspired by the strongest product mechanics observed during the Clouding Academy reverse-engineering study.

This repository is the canonical implementation workspace.

## Current vertical slice

- Certification catalog and track selection
- Practice Hub with readiness, streak, XP and daily goals
- Timed/untimed exam engine with scoring and domain analytics
- Blitz rapid-recall mode
- Architecture Builder scenario evaluator
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
