/**
 * Evidence validator placeholder (Phase 1 — signatures only).
 * TODO: implement verification rules in Phase 2.
 */
import type { Evidence } from "@/types/evidence";

export interface EvidenceValidation {
  valid: boolean;
  reasons: string[];
}

export function validateEvidence(evidence: Evidence): EvidenceValidation {
  // TODO: implement validation (temporary: unverified unless source verified).
  if (!evidence.source.verified) {
    return { valid: false, reasons: ["Source is not verified."] };
  }
  return { valid: true, reasons: [] };
}
