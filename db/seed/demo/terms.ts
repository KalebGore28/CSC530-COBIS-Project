/**
 * Terms run Spring (10), Summer (50), Fall (80), Winter (90) within a year, matching terms.csv.
 */
export type TermKind = "spring" | "summer" | "fall" | "winter";
export type Term = { year: number; term_id: string; kind: TermKind };

const TERM_KINDS: Array<[string, TermKind]> = [
  ["10", "spring"],
  ["50", "summer"],
  ["80", "fall"],
  ["90", "winter"],
];

/** Every term from the first one through the last one, in order */
export function termsBetween(
  first: { year: number; term_id: string },
  last: { year: number; term_id: string },
) {
  const terms: Array<Term> = [];
  for (let year = first.year; year <= last.year; year++) {
    for (const [term_id, kind] of TERM_KINDS) {
      if (year === first.year && term_id < first.term_id) continue;
      if (year === last.year && term_id > last.term_id) continue;
      terms.push({ year, term_id, kind });
    }
  }
  return terms;
}

export function isMainTerm(term: Term) {
  return term.kind === "spring" || term.kind === "fall";
}

export function termKey(term: { year: number; term_id: string }) {
  return `${term.year}-${term.term_id}`;
}

/** When classes start and end, roughly */
export function termDates(term: Term) {
  switch (term.kind) {
    case "spring":
      return { start: new Date(term.year, 0, 15), end: new Date(term.year, 4, 8) };
    case "summer":
      return { start: new Date(term.year, 5, 1), end: new Date(term.year, 6, 31) };
    case "fall":
      return { start: new Date(term.year, 7, 21), end: new Date(term.year, 11, 11) };
    case "winter":
      return { start: new Date(term.year, 11, 14), end: new Date(term.year + 1, 0, 9) };
  }
}
