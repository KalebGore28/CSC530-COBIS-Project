import type { Capability } from "@/types/access-checks";

/**
 * The pages a report can be saved from. Each one keeps its filters in the URL,
 * so a saved report is just the page and those filters.
 */
export const REPORT_PAGES = {
  "/student-lookup": { label: "Student Lookup", capability: "student.lookup" },
} as const satisfies Record<string, { label: string; capability: Capability }>;

export type ReportPage = keyof typeof REPORT_PAGES;

export const REPORT_NAME_MAX_LENGTH = 100;

export function isReportPage(page: string): page is ReportPage {
  return Object.hasOwn(REPORT_PAGES, page);
}

/**
 * The filters worth saving. Which page of results was showing isn't part of the report.
 */
export function reportSearch(search: Record<string, unknown>) {
  const { page: _page, ...filters } = search;
  return Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined));
}
