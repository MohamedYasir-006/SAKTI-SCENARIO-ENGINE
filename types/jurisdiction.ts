/**
 * Jurisdiction domain types (Phase 1 — shapes only, no logic).
 */

export interface Jurisdiction {
  code: string;
  name: string;
  region?: string;
}

export interface JurisdictionRule {
  id: string;
  jurisdictionCode: string;
  category: "ip" | "tk" | "abs" | "regulatory";
  title: string;
  summary: string;
  reference?: string;
}
