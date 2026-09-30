/**
 * Analysis domain types (Phase 1 shapes + Phase 2 grounded findings).
 */
import type { GroundedFindingFields } from "./uncertainty";

export type RiskLevel = "low" | "medium" | "high" | "critical" | "unknown";

export type AnalysisKind = "ip" | "tk" | "abs" | "regulatory";

export interface AnalysisFinding extends GroundedFindingFields {
  id: string;
  kind: AnalysisKind;
  title: string;
  description: string;
  risk: RiskLevel;
  evidenceIds: string[];
  jurisdictionCodes: string[];
}

export interface RegulatoryFinding extends AnalysisFinding {
  kind: "regulatory";
  regulationRef?: string;
  authority?: string;
}

export interface AnalysisResult {
  id: string;
  innovationId: string;
  kind: AnalysisKind;
  findings: AnalysisFinding[];
  overallRisk: RiskLevel;
  createdAt: string;
}
