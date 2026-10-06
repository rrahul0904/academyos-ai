export const agentLearningTrack = {
  id: 'ai-agent-engineering',
  title: 'AI Agent Engineering',
  promise: 'Learn the loop first. Add frameworks only after you can explain, break, verify, and ship it.',
  stages: ['Concept', 'Build', 'Break', 'Diagnose', 'Verify', 'Ship'],
  lessons: [
    {
      id: 'model-api-structured-output',
      title: 'Call a model directly',
      prerequisite: null,
      prerequisites: [],
      capabilities: ['model-api', 'structured-output'],
      build: 'Call one model API without an agent framework and validate structured JSON output.',
      break: ['malformed-json', 'schema-mismatch', 'provider-error'],
      ship: 'A provider-neutral structured-output CLI with tests.'
    },
    {
      id: 'bare-agent-loop',
      title: 'Build the agent loop by hand',
      prerequisites: ['model-api-structured-output'],
      capabilities: ['tool-loop'],
      build: 'Give the model one safe tool, execute the requested tool, return the observation, and repeat until done.',
      break: ['unknown-tool', 'bad-tool-arguments', 'tool-timeout'],
      ship: 'A small useful agent built with plain code and one tool.'
    },
    {
      id: 'agent-guardrails',
      title: 'Make the loop dependable',
      prerequisites: ['bare-agent-loop'],
      capabilities: ['step-limit', 'tool-error-path', 'execution-log'],
      build: 'Add bounded steps, explicit error paths, and a readable execution trace.',
      break: ['infinite-loop', 'tool-throws', 'empty-result'],
      ship: 'A replayable run log that proves what the agent did.'
    },
    {
      id: 'state-and-memory',
      title: 'Add state before magic memory',
      prerequisites: ['agent-guardrails'],
      capabilities: ['state-memory'],
      build: 'Persist a compact notes/state object and reload it across runs.',
      break: ['stale-state', 'corrupt-state', 'missing-state'],
      ship: 'A resumable agent with inspectable state.'
    },
    {
      id: 'failure-injection',
      title: 'Break it on purpose',
      prerequisites: ['state-and-memory'],
      capabilities: ['failure-injection'],
      build: 'Inject unavailable tools, bad outputs, step exhaustion, and missing files.',
      break: ['tool-unavailable', 'hallucinated-success', 'step-limit-hit'],
      ship: 'A failure matrix that proves the agent reports uncertainty instead of inventing success.'
    },
    {
      id: 'agent-evals',
      title: 'Turn examples into evals',
      prerequisites: ['failure-injection'],
      capabilities: ['eval-suite'],
      build: 'Create a fixed suite of real tasks and regression checks that rerun after every change.',
      break: ['generic-output', 'missing-citation', 'regression'],
      ship: 'A repeatable eval suite with pass/fail evidence.'
    },
    {
      id: 'rag-when-needed',
      title: 'Add retrieval only for a retrieval problem',
      prerequisites: ['agent-evals'],
      capabilities: ['rag'],
      build: 'Ground answers in a small document collection with citations and retrieval diagnostics.',
      break: ['no-relevant-document', 'bad-chunk', 'citation-mismatch'],
      ship: 'A source-grounded notes or document agent.'
    },
    {
      id: 'mcp-tools',
      title: 'Understand MCP as a tool contract',
      prerequisites: ['bare-agent-loop'],
      capabilities: ['mcp'],
      build: 'Expose or consume one tool through MCP after the learner already understands tool calling.',
      break: ['schema-drift', 'permission-denied', 'tool-disconnected'],
      ship: 'A small MCP-enabled workflow with explicit permissions.'
    },
    {
      id: 'framework-comparison',
      title: 'Now compare frameworks',
      prerequisites: ['agent-evals'],
      requiresFrameworkGate: true,
      capabilities: ['framework-literacy'],
      build: 'Rebuild the same known agent in one framework and identify exactly what the framework abstracts.',
      break: ['framework-default-mismatch', 'hidden-retry', 'state-loss'],
      ship: 'A side-by-side architecture note and working implementation.'
    },
    {
      id: 'multi-agent-systems',
      title: 'Use multiple agents only when the task needs separation',
      prerequisites: ['framework-comparison'],
      requiresFrameworkGate: true,
      capabilities: ['multi-agent'],
      build: 'Split a task only when roles, context boundaries, or independent verification justify it.',
      break: ['handoff-loss', 'duplicate-work', 'agent-loop-deadlock'],
      ship: 'A bounded multi-agent workflow with handoff evidence.'
    }
  ]
};
