/**
 * Analysis orchestrator placeholder (Phase 1 — signatures only).
 * TODO: fan out to IP/TK/ABS/regulatory analyzers in Phase 2.
 */
import type { AnalysisResult } from "@/types/analysis";
import type { Innovation } from "@/types/innovation";
import { analyzeABS } from "./abs-analyzer";
import { analyzeIP } from "./ip-analyzer";
import { analyzeRegulatory } from "./regulatory-analyzer";
import { analyzeTK } from "./tk-analyzer";

export async function runFullAnalysis(
  innovation: Innovation,
  jurisdictionCodes: string[]
): Promise<AnalysisResult[]> {
  // TODO: orchestrate analyzers with evidence grounding.
  void analyzeIP;
  void analyzeTK;
  void analyzeABS;
  void analyzeRegulatory;
  throw new Error("Not implemented: runFullAnalysis (Phase 2).");
}
