/**
 * Report service placeholder (Phase 1 — signatures only).
 * TODO: implement persistence in Phase 2.
 */
import type { Report } from "@/types/report";

export async function getReportById(id: string): Promise<Report | null> {
  // TODO: implement lookup.
  void id;
  return null;
}

export async function listReports(): Promise<Report[]> {
  // TODO: implement listing (temporary: empty).
  return [];
}
