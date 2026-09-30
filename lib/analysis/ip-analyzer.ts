/**
 * IP analyzer placeholder (Phase 1 — signatures only).
 * TODO: implement prior-art / novelty analysis in Phase 2.
 */
import type { AnalysisResult } from "@/types/analysis";
import type { Innovation } from "@/types/innovation";

export async function analyzeIP(
  innovation: Innovation,
  jurisdictionCodes: string[]
): Promise<AnalysisResult> {
  // TODO: implement IP analysis.
  throw new Error("Not implemented: analyzeIP (Phase 2).");
}
