/**
 * Evidence domain types (Phase 1 — shapes only, no logic).
 */

export type EvidenceSourceKind =
  | "patent"
  | "traditional_knowledge"
  | "abs_register"
  | "regulatory"
  | "literature";

export type EvidenceStrength =
  | "strong"
  | "moderate"
  | "weak"
  | "unverified";

export interface EvidenceSource {
  id: string;
  kind: EvidenceSourceKind;
  name: string;
  jurisdictionCode?: string;
  url?: string;
  accessedAt?: string;
  /** Must be true before evidence is treated as verified. */
  verified: boolean;
}

export interface Evidence {
  id: string;
  title: string;
  summary: string;
  source: EvidenceSource;
  strength: EvidenceStrength;
  jurisdictionCodes: string[];
  publishedAt?: string;
  /** Prototype flag — unverified items must carry this label in UI/demo data. */
  prototypeLabel?: "Prototype / illustrative evidence";
}

export interface Claim {
  id: string;
  innovationId: string;
  text: string;
}

export interface ClaimElement {
  claimId: string;
  elementId: string;
  relation: "supports" | "contradicts" | "mentions";
}

export interface ClaimEvidenceLink {
  claimId: string;
  evidenceId: string;
  relation: "supports" | "contradicts" | "context";
  confidence: number;
  rationale?: string;
}
