import { faker } from "@faker-js/faker";
import { suggestNextFilename } from "./utils";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { getDbConnection } from "../../db/connection";
import {
	students,
	partOfTerm,
	courses,
	registrationStatus,
	instructionalMethods,
	faculty,
	departments,
	colleges,
} from "../../db/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** --- helpers ------------------------------------------------------------- */

/** Random 8-digit MMDDYYYY date or empty string (~30%). */
function randomMMDDYYYY(): string {
	if (Math.random() < 0.3) return "";
	const d = faker.date.between({ from: new Date(2020, 0, 1), to: new Date() });
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	const yyyy = d.getFullYear();
	return `${mm}${dd}${yyyy}`;
}

/** Choose next SECTION code like "01", "H2", "L1"… */
function randomSection(): string {
	if (Math.random() < 0.7) {
		return String(faker.number.int({ min: 1, max: 99 })).padStart(2, "0");
	}
	const prefix = faker.string.alpha({ length: 1, casing: "upper" });
	const num = faker.number.int({ min: 1, max: 9 });
	return `${prefix}${num}`;
}

/** ------------------------------------------------------------------------ */

async function run(count: number = 200): Promise<void> {
	const outDir = path.resolve(__dirname, "data");
	fs.mkdirSync(outDir, { recursive: true });

	// 1) Load reference data from DB
	const db = (await getDbConnection()).orm;

	const studentRows = await db.select().from(students);
	const studentMnumbers = studentRows.map((r) => r.mnumber);

	const partRows = await db.select().from(partOfTerm);
	const partCodes = partRows.map((r) => r.code);

	const courseRows = await db.select().from(courses);

	const regRows = await db.select().from(registrationStatus);
	const regCodes = regRows.map((r) => r.code);

	const insmRows = await db.select().from(instructionalMethods);
	const insmCodes = insmRows.map((r) => r.code);

	// Load departments and colleges for new faculty
	const deptRows = await db.select().from(departments);
	const deptCodes = deptRows.map((r) => r.code);
	const collegeRows = await db.select().from(colleges);
	const collegeCodes = collegeRows.map((r) => r.code);

	// Fetch existing faculty for lookup
	const facultyRows = await db.select().from(faculty);

	// 2) Suggest filename and derive TERM code
	const existing = fs.readdirSync(outDir);
	const nextBase = suggestNextFilename(
		"reg_cuba_courses_during_term",
		existing
	);
	const termCode = nextBase.match(/_(\d{6})_/)![1];
	const outPath = path.join(outDir, `${nextBase}.csv`);

	// 3) Build CSV lines
	const header = [
		"MNUMBER",
		"TERM",
		"PARTOFTERM",
		"CRN",
		"CRSESUBJ",
		"CRSENUMB",
		"SECTION",
		"CRHRS",
		"LEVLCODE",
		"RSTSCODE",
		"INSMCODE",
		"LASTATTEND",
		"MIDGRADE",
		"FINGRADE",
		"REPEAT",
		"COURSETYPE",
		"INSTMNUMBER",
		"INSTLASTNM",
		"INSTFIRSTNM",
	].join(",");

	const levlCodes = ["UG", "GR", "PB"];
	const gradeOptions = ["A", "B", "C", "D", "F", ""];

	const lines = [header];
	const usedCrns = new Set<number>();

	for (let i = 0; i < count; i++) {
		const mnumber = faker.helpers.arrayElement(studentMnumbers);

		// Choose or occasionally create an instructor
		type FacultyEntry = { mnumber: string; first_name: string; last_name: string; department: string; college: string };
		let instEntry: FacultyEntry;
		if (Math.random() < 0.0001) {
			// 0.01% chance: brand-new faculty
			instEntry = {
				mnumber: `M${faker.number.int({ min: 200000000, max: 299999999 })}`,
				first_name: faker.person.firstName(),
				last_name: faker.person.lastName(),
				department: faker.helpers.arrayElement(deptCodes),
				college: faker.helpers.arrayElement(collegeCodes),
			};
			facultyRows.push(instEntry);
		} else {
			const existingFac = faker.helpers.arrayElement(facultyRows) as any;
			instEntry = {
				mnumber: existingFac.mnumber,
				first_name: existingFac.first_name,
				last_name: existingFac.last_name,
				department: existingFac.department || faker.helpers.arrayElement(deptCodes),
				college: existingFac.college || faker.helpers.arrayElement(collegeCodes),
			};
		}
		const instMnumber = instEntry.mnumber;
		const instLast = instEntry.last_name;
		const instFirst = instEntry.first_name;

		let crn = faker.number.int({ min: 10000, max: 89999 });
		while (usedCrns.has(crn)) {
			crn = faker.number.int({ min: 10000, max: 89999 });
		}
		usedCrns.add(crn);

		const part = faker.helpers.arrayElement(partCodes);

		const course = faker.helpers.arrayElement(courseRows);
		const subject = course.subject;
		const number = course.number;
		const crhrs = course.hours;

		const section = randomSection();
		const levl = faker.helpers.arrayElement(levlCodes);
		const rst = faker.helpers.arrayElement(regCodes);
		const insm = faker.helpers.arrayElement(insmCodes);
		const lastAttend = randomMMDDYYYY();
		const mid = faker.helpers.arrayElement(gradeOptions);
		const fin = faker.helpers.arrayElement(gradeOptions);
		const repeatFlag = Math.random() < 0.1 ? "Y" : "N";
		const courseType = faker.helpers.arrayElement(["L", "P", "S"]);

		lines.push([
			mnumber,
			termCode,
			part,
			crn,
			subject,
			number,
			section,
			crhrs,
			levl,
			rst,
			insm,
			lastAttend,
			mid,
			fin,
			repeatFlag,
			courseType,
			instMnumber,
			instLast,
			instFirst,
		].join(","));
	}

	// 4) Write file
	fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
	console.log(`→ Generated ${count} rows to ${outPath}`);

	// 5) Next suggestion
	const nextSuggestion = suggestNextFilename(
		"reg_cuba_courses_during_term",
		fs.readdirSync(outDir)
	);
	console.log("Next filename suggestion:", `${nextSuggestion}.csv`);
}

// allow ts-node invocation: `ts-node generateCoursesDuringTerm.ts [count]`
const [, , countArg] = process.argv;
run(countArg ? Number(countArg) : 200).catch((e) => {
	console.error(e);
	process.exit(1);
});
