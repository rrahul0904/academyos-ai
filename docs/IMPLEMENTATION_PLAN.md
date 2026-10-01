# AcademyOS AI implementation plan

## Wave 1 — executable learning loop (current)

Status: implemented in this repository.

- Certification catalog and active-track selection
- Practice Hub metrics and daily loop
- Timed practice exam engine
- Overall and domain-level scoring
- XP/readiness progression
- Blitz rapid recall
- Architecture Builder with service + connection evaluation
- Local persistence
- Zero-dependency Node server
- Node test suite and CI

## Wave 1.5 — general AI Study Lab

Status: Phase A implemented; later phases remain planned.

- Paste notes and generate a source-grounded study pack
- Summary, flashcards and multiple-choice quiz from one source
- Hard/Good/Easy flashcard review receipts
- Local study library and progress persistence
- Deterministic local generation by default
- Explicit opt-in OpenAI provider adapter
- Next: file upload, source citations, grounded tutor, spaced repetition queue

See `docs/REVERSE_ENGINEERING_AI_STUDY_APP.md`.

## Wave 2 — server-backed product foundation

- Account model and authentication
- Durable user progress store
- Certification/content CRUD APIs
- Attempt persistence and analytics events
- Admin content studio
- Entitlement service
- Stripe checkout/webhook processing
- Audit log and moderation/report workflow

## Wave 3 — adaptive intelligence

- Weak-domain scheduling
- Spaced repetition
- Question difficulty calibration
- Readiness confidence intervals
- Explanation quality evaluation
- Content provenance and versioning
- AI-generated remediation plans with deterministic evidence links

## Wave 4 — cloud labs

- AWS Organizations sandbox account pool
- SCP guardrails and allowed-service policies
- Lab lease state machine
- CloudFormation/CDK provisioning
- Deterministic validators
- Cost ceilings, TTL cleanup and quarantine handling
- Evidence capture and completion scoring

## Wave 5 — multi-provider scale

- Azure/GCP lab adapters
- Provider-neutral lab specification
- Team plans and cohort analytics
- Instructor/enterprise controls
- Public shareable credentials

## Release gates

A wave is complete only when its code is checked in, its deterministic tests pass, and any external dependency that was not executed is explicitly labeled as an external release blocker rather than claimed complete.
