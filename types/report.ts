/**
 * Report domain types (Phase 1 — shapes only, no logic).
 */

export interface ReportSection {
  id: string;
  heading: string;
  body: string;
  evidenceIds: string[];
  order: number;
}

export interface Report {
  id: string;
  title: string;
  innovationId: string;
  scenarioId?: string;
  jurisdictionCodes: string[];
  sections: ReportSection[];
  createdAt: string;
  language: string;
}
