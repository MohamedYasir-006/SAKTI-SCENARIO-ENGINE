/**
 * AI client placeholder (Phase 1 — no live calls).
 * TODO: wire provider client in Phase 2.
 */

export interface AIClientOptions {
  apiKey?: string;
  model?: string;
}

export function createAIClient(options: AIClientOptions = {}): {
  options: AIClientOptions;
} {
  // TODO: implement provider client construction.
  return { options };
}
