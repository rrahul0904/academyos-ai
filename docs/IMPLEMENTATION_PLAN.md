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

## Wave 1B — AI Agent Engineering from first principles

Status: Phase-A implementation in progress on the RE-330 learning-system track.

The canonical lesson loop is:

`Concept -> Build -> Break -> Diagnose -> Verify -> Ship`

Implemented in the current branch:

- agent-learning state and evidence-receipt domain model
- prerequisite-aware lesson progression
- framework gate that stays locked until core primitives are verified
- deliberate failure-injection requirement
- portfolio artifact receipts
- initial 10-lesson route covering direct model calls, structured output, hand-written tool loops, guardrails, state/memory, evals, RAG, MCP, framework comparison and multi-agent systems
- learner-facing lesson workspace
- lesson prerequisite locks and six-stage progression
- failure selection, typed execution evidence and artifact receipts
- local learner-state persistence and evidence timeline
- discoverable entry point from the main AcademyOS page
- deterministic tests for stage order, prerequisites, failure evidence and framework gating

Next implementation slice:

- isolated learner-code execution sandbox
- receipts generated from real executions rather than typed evidence
- deterministic lab validators and replay
- source-grounded diagnosis/remediation
- browser/mobile/accessibility acceptance tests
- provider adapters with explicit secret, network and cost controls

Framework-specific lessons must not unlock merely because a learner completed videos or quizzes. The learner must first verify the underlying agent-loop capabilities with execution evidence.

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
