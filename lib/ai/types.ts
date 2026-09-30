/**
 * AI layer types (Phase 1 — shapes only).
 */

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  model: string;
}
