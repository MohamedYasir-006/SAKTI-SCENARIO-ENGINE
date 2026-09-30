/**
 * Traditional-knowledge analyzer placeholder (Phase 1 — signatures only).
 * TODO: implement TK / TKDL-adjacent analysis in Phase 2.
 */
import type { AnalysisResult } from "@/types/analysis";
import type { Innovation } from "@/types/innovation";

export async function analyzeTK(
  innovation: Innovation,
  jurisdictionCodes: string[]
): Promise<AnalysisResult> {
  // TODO: implement TK analysis.
  throw new Error("Not implemented: analyzeTK (Phase 2).");
}
