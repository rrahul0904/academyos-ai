# AI Agent Engineering learning loop

## Why this exists

The learner problem is not a shortage of frameworks. It is the opposite: LangChain, LangGraph, CrewAI, AutoGen, OpenAI Agents SDK, MCP, RAG, memory, orchestration and multi-agent patterns are often encountered before the learner understands the small execution loop underneath them.

AcademyOS treats that confusion as a product requirement. The platform teaches agent engineering from first principles and unlocks abstractions only after the learner can demonstrate the underlying behavior.

## Canonical learning contract

Every agent-engineering lesson uses:

`Concept -> Build -> Break -> Diagnose -> Verify -> Ship`

A lesson is not complete because a learner watched a video, copied a tutorial, or received a plausible answer from a model. Completion requires evidence.

### Concept
Explain the primitive without framework vocabulary where possible.

### Build
Implement the primitive directly in plain code.

### Break
Trigger at least one known failure mode deliberately. Examples: unavailable tool, malformed structured output, timeout, missing file, step exhaustion, stale state, irrelevant retrieval.

### Diagnose
Explain what failed, where it failed, and which deterministic guardrail should handle it.

### Verify
Run a fixed check or eval and capture a receipt. Verification can unlock capabilities; it does not by itself mark the lesson complete.

### Ship
Produce a reusable artifact with evidence such as command, exit code, artifact hash, test output, or replayable trace.

## Framework gate

Framework-heavy lessons stay locked until the learner has verified the core capabilities:

- direct model API use
- structured output validation
- a hand-written tool loop
- bounded step limits
- explicit tool-error handling
- execution logging
- inspectable state/memory
- deliberate failure injection
- a repeatable eval suite

The goal is not to discourage frameworks. It is to make them legible: once the learner understands the loop, a framework becomes an implementation choice instead of a curriculum.

## Initial route

1. Call a model directly and validate structured output.
2. Add one tool and implement the loop by hand.
3. Add step limits, errors and execution logs.
4. Add simple persistent state.
5. Break the agent deliberately and detect hallucinated success.
6. Turn real tasks into repeatable evals.
7. Add RAG only for a retrieval-shaped problem.
8. Learn MCP as a tool contract after tool calling is understood.
9. Rebuild a known agent with one framework and compare abstractions.
10. Add multiple agents only when role/context separation is justified.

## Product requirements derived from learner feedback

- Keep one concrete project across multiple lessons so each abstraction solves a pain the learner has already experienced.
- Prefer runnable labs over tutorial-only content.
- Require negative tests, not only happy-path demos.
- Treat "reports failure truthfully" as a skill.
- Preserve evidence receipts in learner progress.
- Generate remediation from observed failures rather than generic topic recommendations.
- Do not award mastery for framework trivia that has not been connected to an underlying primitive.
- Portfolio artifacts should be replayable and inspectable, not screenshots of a successful run.

## Phase A implemented in this branch

The current learner workspace provides:

- a discoverable AI Agent Engineering entry point from the main AcademyOS page;
- a 10-lesson prerequisite map;
- the six-stage lesson runner;
- deliberate failure selection during the Break stage;
- command/exit-code evidence fields for Build, Verify and Ship;
- immutable artifact receipt input for Ship;
- local learner-state persistence;
- per-lesson evidence timelines;
- capability tracking and an explicit framework gate;
- responsive single-column fallback for narrow screens.

This is intentionally an evidence-recording workspace, not a fake execution sandbox. Hosted provider calls, untrusted code execution, automatic artifact hashing, source-grounded diagnosis and browser/runtime certification remain separate release gates and must not be claimed until independently verified.

## Next engineering boundary

1. Add a real isolated execution sandbox for learner code.
2. Generate receipts from actual executions rather than typed evidence.
3. Add deterministic validators for each lab.
4. Add source-grounded remediation from observed failures.
5. Add browser/mobile acceptance tests and accessibility checks.
6. Add provider adapters only behind explicit cost, secret and network controls.
