/**
 * Generic formatting helpers (Phase 1 placeholders).
 * Full implementations arrive in later phases.
 */

export function truncate(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

export function formatDateISO(date: Date): string {
  return date.toISOString();
}
