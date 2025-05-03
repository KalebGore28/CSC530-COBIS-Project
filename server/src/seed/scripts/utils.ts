/**
 * Suggest the next filename based solely on the latest existing file.
 *
 * @param prefix             e.g. "reg_cuba_catalog"
 * @param existingFilenames  e.g. ["reg_cuba_catalog_202510_0000000", ...]
 * @returns                  e.g. "reg_cuba_catalog_202580_0000000"
 */
export function suggestNextFilename(
	prefix: string,
	existingFilenames: string[]
): string {
	const codeRegex = new RegExp(`^${prefix}_(\\d{6})_`);
	const termSeq = [10, 50, 80, 90];
	const suffix = "0000000";

	// 0) sanity check
	if (!prefix || !prefix.trim()) {
		throw new Error("Prefix cannot be empty");
	}

	// 1) pull out all the YYYYTT codes
	const codes = existingFilenames
		.map((f) => (f.match(codeRegex) || [])[1])
		.filter(Boolean)
		.sort();

	// if not existingFilenames, or codes.length === 0, return a fallback
	if (!existingFilenames || existingFilenames.length === 0 || codes.length === 0) {
		return `${prefix}_${'202510'}_${suffix}`;
	}

	if (codes.length === 0) {
		throw new Error(
			`No files found for prefix "${prefix}". Cannot suggest next filename.`
		);
	}

	// 2) take the last one and split year vs. term
	const last = codes[codes.length - 1];        // e.g. "202590"
	const year = parseInt(last.slice(0, 4), 10); // 2025
	const term = parseInt(last.slice(4, 6), 10); // 90

	const idx = termSeq.indexOf(term);
	if (idx === -1) {
		throw new Error(`Unrecognized term code "${term}" in "${last}"`);
	}

	// 3) compute next term/year
	let nextYear = year;
	let nextTerm: number;
	if (idx === termSeq.length - 1) {
		// if we were at Winter (90), roll to next Spring of the following year
		nextYear = year + 1;
		nextTerm = termSeq[0];
	} else {
		// otherwise just pick the next term in the same year
		nextTerm = termSeq[idx + 1];
	}

	const nextCode = `${nextYear}${String(nextTerm).padStart(2, "0")}`;
	return `${prefix}_${nextCode}_${suffix}`;
}
