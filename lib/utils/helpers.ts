/**
 * Generic helpers (Phase 1 placeholders).
 */

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function toNotImplementedResponse(feature: string): {
  status: "not_implemented";
  message: string;
} {
  return {
    status: "not_implemented",
    message: `${feature} will be implemented in Phase 2.`,
  };
}
