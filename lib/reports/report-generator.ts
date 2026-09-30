/**
 * Report generator placeholder (Phase 1 — signatures only).
 * TODO: implement evidence-grounded report generation in Phase 2.
 */
import type { Report } from "@/types/report";

export interface GenerateReportInput {
  innovationId: string;
  scenarioId?: string;
  jurisdictionCodes: string[];
  language?: string;
}

export async function generateReport(
  input: GenerateReportInput
): Promise<Report> {
  // TODO: implement report generation.
  throw new Error("Not implemented: generateReport (Phase 2).");
}
