# Awesome System Design Resources — REA donor intake

Snapshot: 2026-10-16 ET  
Upstream: `ashishps1/awesome-system-design-resources`  
Inspected upstream revision: `25724090f7dd7746129b7194b55504f9d06f86ed`  
License: GPL-3.0  
Coordination issue: `rrahul0904/agent-work-os#230`

## Decision

Treat this repository as a **capability/content-coverage donor** for the existing AcademyOS / RE-330 learning product. Do not create a standalone clone or import its GPL curriculum/code by default.

Canonical ownership:

- `academyos-ai`: product implementation, learner state, Architecture Builder, curriculum and scenario runtime.
- `agent-work-os`: REA evidence/provenance, donor coordination, verification and shipping truth.
- Interview Coach OS: optional consumer of system-design scenarios for mock interviews.
- Visual Intelligence / owned diagram primitives: optional renderer for editable architecture attempts.

## What was observed

The upstream is primarily a curated learning/interview-preparation corpus rather than a software application. Its README covers:

- scalability, availability, reliability, latency/throughput and fault tolerance;
- consistent hashing, CAP and failover;
- networking and APIs;
- databases, indexing, sharding and replication;
- caching/CDNs;
- pub/sub, queues and CDC;
- distributed coordination and microservices patterns;
- architecture styles and common trade-offs;
- easy/medium/hard system-design interview problems;
- external courses, books, engineering articles and classic papers.

The committed executable examples are much narrower than the README taxonomy. Java and Python trees contain examples for:

- consistent hashing;
- load balancing: IP hash, least connections, least response time, round robin and weighted round robin;
- rate limiting: fixed-window counter, leaky bucket, sliding-window counter/log and token bucket.

The diagram directory currently contains two image assets: an interview template and a system-design overview graphic.

## Upstream feedback / failure evidence

Open issues reveal useful requirements for our product:

1. External links can become stale, private or incorrectly mapped.
2. Learners explicitly ask for observability as a first-class topic: metrics, logging, monitoring, tracing/OpenTelemetry and alerting.
3. Learners ask for back-of-the-envelope estimation to be treated as a core building block.
4. At least one rate-limiter issue challenges semantic alignment between the explanatory article and implementation.

These are strong reasons not to reproduce a static link directory. AcademyOS should own freshness, provenance, semantic validation and executable evidence.

## Competitive conclusion

Open collections such as System Design Primer already provide broad free coverage. Current paid products add ordered learning paths, quizzes/assessments, repeatable interview frameworks, interactive diagrams and case-study walkthroughs.

AcademyOS should therefore compete on a stronger loop:

`Learn -> Build -> Defend -> Verify -> Remediate -> Replay`

The learner should demonstrate system-design reasoning through calculations, runnable components, architecture construction, failure-mode revisions and explicit trade-off defense.

## Clean-room / GPL boundary

Default posture is requirements-only reuse.

Do not copy into the owned AcademyOS product by default:

- upstream prose;
- diagrams/images;
- Java/Python implementations;
- exact solution walkthroughs;
- branding/trade dress.

Independently author lessons, diagrams, examples, labs and scenarios using primary technical sources and separately licensed references. Every external source receives explicit provenance and freshness state.

If GPL source is intentionally reused later, record exact upstream file and SHA, preserve applicable GPL obligations, isolate it from proprietary product material where appropriate, and make that distribution decision explicitly.

## Product thesis: System Design Academy

Add a first-class System Design domain to AcademyOS:

`placement -> foundations -> building blocks -> executable component labs -> trade-off drills -> Architecture Builder -> timed interview simulation -> evidence-linked feedback -> remediation -> mastery`

### MATCH

- broad concept taxonomy;
- networking/API/data/caching/distributed-systems foundations;
- architecture patterns and trade-offs;
- scenario difficulty bands;
- component implementation exercises;
- papers and engineering references as optional evidence sources.

### IMPROVE

- prerequisite graph instead of a flat resource list;
- back-of-envelope estimation as a required design phase;
- observability/operations as required rubric dimensions;
- content versioning, provenance and source-health checking;
- deterministic runnable labs;
- rubric-based Architecture Builder evaluation rather than one expected topology;
- persistent attempt/revision history;
- adaptive remediation from evidence, not page-completion state.

### NEW

- versioned `system-design-scenario` contract;
- capacity-estimation worksheet and deterministic checks;
- typed architecture-attempt object graph;
- trade-off defense artifact;
- follow-up constraint injection after an initial design;
- architecture diff/replay;
- evidence-backed rubric observations separated from AI coaching;
- source-freshness receipts;
- mastery graph across concept, calculation, lab, architecture and defense.

### OMIT / DEFER

- upstream content/code/images;
- a giant external-link directory as the primary UX;
- memorization-only answer keys;
- mastery from page completion;
- LLM-only scoring;
- real cloud lab provisioning in the first slice unless required by a specific exercise.

## Phase-A contracts

### `system-design-scenario/v1`

- stable scenario/version;
- learner level;
- functional and non-functional requirements;
- scale envelope;
- constraints and allowed assumptions;
- follow-up constraints;
- rubric version;
- source/provenance references.

### `capacity-estimate/v1`

- assumptions;
- QPS/read/write estimates;
- storage/bandwidth estimates;
- replication/headroom assumptions;
- formula steps and units;
- warnings/errors;
- deterministic digest.

### `architecture-attempt/v1`

- scenario/version and attempt revision;
- components/connections;
- API/data-model notes;
- consistency/caching/partitioning choices;
- availability/failure strategy;
- observability plan;
- assumptions/unknowns;
- deterministic object-graph digest.

### `tradeoff-defense/v1`

- decision;
- alternatives;
- chosen option;
- benefits/costs;
- requirement/evidence references;
- limitations/unknowns;
- learner defense;
- rubric-bound feedback.

### `design-evaluation/v1`

Versioned dimensions:

- requirements clarification;
- capacity estimation;
- APIs/data model;
- architecture coherence;
- scaling;
- reliability/failure handling;
- consistency/data trade-offs;
- security/privacy where relevant;
- observability/operations;
- communication/trade-off defense.

Reuse an existing RE-330 evidence-receipt contract rather than adding another receipt schema if it already carries the necessary identity/provenance fields.

## First vertical slice

Build an independently authored **Rate-Limited URL Shortener API** route:

1. Entry diagnostic.
2. Short lessons on scale estimation, key generation/hashing, storage, caching and rate limiting.
3. Back-of-envelope QPS/storage exercise.
4. Owned executable rate-limiter lab.
5. API/data-model exercise.
6. Architecture Builder attempt.
7. Trade-off defense for cache, consistency, partitioning and rate limiting.
8. Follow-up constraint: traffic spike plus hot-key/abuse condition.
9. Revised architecture attempt.
10. Deterministic rubric observations plus evidence-linked coaching.
11. Persist exact attempt revisions/evidence.
12. Remediation tasks for weak concepts.
13. Restart/replay and attempt diff.

## Required negative / recovery tests

- no single topology is globally treated as correct;
- missing requirements remain explicit;
- learner assumptions are recorded before evaluation;
- unit errors and contradictory capacity estimates fail visibly;
- required flow cannot pass with disconnected architecture components;
- declared consistency choice that conflicts with the design is surfaced;
- follow-up constraints create a new revision rather than overwriting history;
- lab failure does not erase design work;
- restart preserves exact attempts and evidence;
- materially changed scenario/content versions invalidate stale evaluation where required;
- stale/broken sources are not presented as current evidence;
- model feedback cannot fabricate citations;
- page completion cannot create mastery;
- keyboard/mobile/accessibility routes can submit an attempt;
- GPL upstream code/content is absent unless explicitly provenance-approved.

## REA investigation packet

REA remains a governed evidence provider, not implementation authority.

Capture/retain:

1. exact upstream repo, revision and license;
2. normalized README topic graph;
3. Java/Python implementation inventory;
4. diagram-asset manifest without copying assets;
5. external-link/domain inventory;
6. broken/stale/private link findings;
7. upstream issue feedback and semantic-correctness disputes;
8. coverage gaps;
9. `OBSERVED | DERIVED | HYPOTHESIS | UNKNOWN` classification;
10. clean-room donor-to-AcademyOS map;
11. later comparison receipts against independently authored AcademyOS artifacts.

Current truth: public-source evidence first pass is complete; no REA runtime/provider execution is claimed.

## Delivery phases

### P0 — evidence/routing
First pass complete: source resolution, revision pinning, GPL classification, taxonomy/code/diagram inspection, issue signal scan, competitor scan and canonical repo routing.

### P1 — contract reconciliation
- reconcile the contracts above with current AcademyOS domain models;
- define prerequisite/mastery graph;
- define source provenance/freshness model;
- freeze scenario/rubric fixture format;
- bind attempt/revision state to existing evidence receipts.

### P2 — first route
Implement only the Rate-Limited URL Shortener vertical slice and its deterministic tests.

### P3 — Architecture Builder hardening
Add graph invariants, requirement-to-component coverage, flow checks, failure-mode tests and deterministic-vs-AI evaluator separation.

### P4 — curriculum breadth
Networking/API, data stores, caching/CDN, messaging/streaming, distributed coordination, observability, security/resilience and advanced trade-offs.

### P5 — scenario library
Independently authored easy/medium/hard scenarios with follow-up constraints, versioning and reviewed rubrics.

### P6 — timed interview practice
Clarifying-question phase, 35–45 minute mode, defense, follow-ups and post-session remediation. Reuse Interview Coach OS only through a bounded adapter if that improves the learner experience.

### P7 — visual integration
Use owned editable diagram primitives; support attempt diff/replay and accessible non-visual representation. Do not import donor diagram assets.

### P8 — quality/provenance
Primary-source claim ledger, freshness checks, lab semantic tests, SME review, assessment-quality checks, browser/mobile/accessibility UAT.

### P9 — release certification
Exact-head CI -> browser acceptance -> restart/replay evidence -> hosted preview receipt -> explicit production gate.

## Current status

`SOURCE=done / PUBLIC_EVIDENCE=first-pass / ROUTING=done / RIGHTS=classified / RECONSTRUCTION=first-pass / SPECIFICATION=initial / REA_RUNTIME=not-run / IMPLEMENTATION=not-started-by-this-intake / UAT=none / DEPLOYMENT=none / SHIPPED=no`

No upstream parity, GPL-source import, runtime REA execution, hosted preview or production completion is claimed.