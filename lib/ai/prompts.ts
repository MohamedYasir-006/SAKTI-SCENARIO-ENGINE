/**
 * Prompt templates placeholder (Phase 1 — declarative stubs only).
 * TODO: author grounded prompts in Phase 2. No model calls here.
 */

export const PROMPTS = {
  decomposeInnovation: "TODO: innovation decomposition prompt (Phase 2).",
  analyzeScenario: "TODO: scenario analysis prompt (Phase 2).",
  redTeam: "TODO: red-team prompt (Phase 2).",
} as const;

export type PromptKey = keyof typeof PROMPTS;
