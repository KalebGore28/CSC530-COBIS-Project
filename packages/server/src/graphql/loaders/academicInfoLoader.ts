import DataLoader from 'dataloader';
import { inArray, and } from 'drizzle-orm';
import {
	type StudentAcademicInfo,
	studentAcademicInfo,
} from '../../db/schema';
import type { DbConnection } from '../../db/connection';

// —————————————————————————————————————————————————————————————————————————————
// 1) Generic loader: all academic info for a student
// —————————————————————————————————————————————————————————————————————————————
export function createAcademicInfoLoader(
	db: DbConnection['orm']
): DataLoader<string, StudentAcademicInfo[]> {
	return new DataLoader<string, StudentAcademicInfo[]>(async (mnumbers) => {
		const rows = await db
			.select()
			.from(studentAcademicInfo)
			.where(inArray(studentAcademicInfo.mnumber, mnumbers as string[]))
			.all();

		const map = rows.reduce<Record<string, StudentAcademicInfo[]>>((acc, row) => {
			(acc[row.mnumber] ||= []).push(row);
			return acc;
		}, {});

		return mnumbers.map((m) => map[m] ?? []);
	});
}

// —————————————————————————————————————————————————————————————————————————————
// 2) Loader by term: get all records for student + term
// —————————————————————————————————————————————————————————————————————————————
export function createAcademicInfoByTermLoader(
	db: DbConnection['orm']
): DataLoader<string, StudentAcademicInfo[]> {
	// Key is `${mnumber}|${term}`
	return new DataLoader<string, StudentAcademicInfo[]>(async (keys) => {
		// split composite keys
		const pairs = keys.map((k) => {
			const [mnumber, term] = k.split('|');
			return { mnumber, term };
		});

		// collect all mnumbers and terms we need to fetch
		const mnumbers = [...new Set(pairs.map((p) => p.mnumber))];
		const terms = [...new Set(pairs.map((p) => p.term))];

		// fetch all matching rows in one go
		const rows = await db
			.select()
			.from(studentAcademicInfo)
			.where(
				and(
					inArray(studentAcademicInfo.mnumber, mnumbers),
					inArray(studentAcademicInfo.term, terms)
				)
			)
			.all();

		// bucket by composite key
		const map: Record<string, StudentAcademicInfo[]> = {};
		for (const row of rows) {
			const key = `${row.mnumber}|${row.term}`;
			(map[key] ||= []).push(row);
		}

		return keys.map((key) => map[key] ?? []);
	});
}

// —————————————————————————————————————————————————————————————————————————————
// 3) Loader by year: get all records for student + year
// —————————————————————————————————————————————————————————————————————————————
export function createAcademicInfoByYearLoader(
	db: DbConnection['orm']
): DataLoader<string, StudentAcademicInfo[]> {
	// Key is `${mnumber}|${year}`
	return new DataLoader<string, StudentAcademicInfo[]>(async (keys) => {
		const pairs = keys.map((k) => {
			const [mnumber, yearStr] = k.split('|');
			return { mnumber, year: Number(yearStr) };
		});

		const mnumbers = [...new Set(pairs.map((p) => p.mnumber))];
		const years = [...new Set(pairs.map((p) => p.year))];

		const rows = await db
			.select()
			.from(studentAcademicInfo)
			.where(
				and(
					inArray(studentAcademicInfo.mnumber, mnumbers),
					inArray(studentAcademicInfo.year, years)
				)
			)
			.all();

		const map: Record<string, StudentAcademicInfo[]> = {};
		for (const row of rows) {
			const key = `${row.mnumber}|${row.year}`;
			(map[key] ||= []).push(row);
		}

		return keys.map((key) => map[key] ?? []);
	});
}

// —————————————————————————————————————————————————————————————————————————————
// 4) Loader by year + term: get records for student + specific year+term
// —————————————————————————————————————————————————————————————————————————————
export function createAcademicInfoByYearAndTermLoader(
	db: DbConnection['orm']
): DataLoader<string, StudentAcademicInfo[]> {
	// Key is `${mnumber}|${year}|${term}`
	return new DataLoader<string, StudentAcademicInfo[]>(async (keys) => {
		const triples = keys.map((k) => {
			const [mnumber, yearStr, term] = k.split('|');
			return { mnumber, year: Number(yearStr), term };
		});

		const mnumbers = [...new Set(triples.map((t) => t.mnumber))];
		const years = [...new Set(triples.map((t) => t.year))];
		const terms = [...new Set(triples.map((t) => t.term))];

		const rows = await db
			.select()
			.from(studentAcademicInfo)
			.where(
				and(
					inArray(studentAcademicInfo.mnumber, mnumbers),
					inArray(studentAcademicInfo.year, years),
					inArray(studentAcademicInfo.term, terms)
				)
			)
			.all();

		const map: Record<string, StudentAcademicInfo[]> = {};
		for (const row of rows) {
			const key = `${row.mnumber}|${row.year}|${row.term}`;
			(map[key] ||= []).push(row);
		}

		return keys.map((key) => map[key] ?? []);
	});
}
