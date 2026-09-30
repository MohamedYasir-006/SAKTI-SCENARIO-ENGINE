/**
 * Regulatory analyzer placeholder (Phase 1 — signatures only).
 * TODO: implement jurisdiction-aware regulatory analysis in Phase 2.
 */
import type { AnalysisResult } from "@/types/analysis";
import type { Innovation } from "@/types/innovation";

export async function analyzeRegulatory(
  innovation: Innovation,
  jurisdictionCodes: string[]
): Promise<AnalysisResult> {
  // TODO: implement regulatory analysis.
  throw new Error("Not implemented: analyzeRegulatory (Phase 2).");
}
