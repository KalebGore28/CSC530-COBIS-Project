import { faker } from "@faker-js/faker";
import { suggestNextFilename } from "./utils";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Format a JS Date as "YYYY-MM-DD HH:mm:ss" */
function formatDate(dt: Date): string {
	const pad = (n: number) => n.toString().padStart(2, "0");
	const Y = dt.getFullYear(), M = pad(dt.getMonth() + 1), D = pad(dt.getDate());
	const h = pad(dt.getHours()), m = pad(dt.getMinutes()), s = pad(dt.getSeconds());
	return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

async function run(count: number = 200): Promise<void> {
	const outDir = path.resolve(__dirname, "data");
	fs.mkdirSync(outDir, { recursive: true });

	// 1) Suggest the next filename (without extension)
	const existing = fs.readdirSync(outDir);
	const nextBase = suggestNextFilename("reg_cuba_catalog", existing);
	const outFilename = `${nextBase}.csv`;
	const outPath = path.join(outDir, outFilename);

	// 2) Build CSV lines
	const header = [
		"ID",
		"COURSE",
		"CRSETITLE",
		"CRHRS",
		"COURSE_FEE",
		"WEB_FEE",
		"LASTCHANGED",
	].join(",");
	const lines = [header];

	for (let i = 1; i <= count; i++) {
		const subject = faker.string.alpha({ length: faker.number.int({ min: 2, max: 4 }), casing: "upper" });
		const number = faker.number.int({ min: 100, max: 999 }).toString();
		const suffix = Math.random() < 0.2
			? faker.string.alpha({ length: faker.number.int({ min: 1, max: 2 }), casing: "upper" })
			: "";
		const courseCode = `${subject}${number}${suffix}`;

		const title = faker.lorem.words(faker.number.int({ min: 2, max: 6 })).replace(/,/g, "");
		const crhrs = faker.helpers.arrayElement([1, 2, 3, 4]).toString();
		const feeVal = Math.random() < 0.2
			? "NULL"
			: faker.number.int({ min: 50, max: 500 }).toString();
		const webVal = Math.random() < 0.2
			? "NULL"
			: faker.number.int({ min: 0, max: 300 }).toString();
		const lastChg = Math.random() < 0.2
			? "NULL"
			: formatDate(faker.date.between({ from: new Date(2020, 0, 1), to: new Date() }));

		lines.push([i, courseCode, title, crhrs, feeVal, webVal, lastChg].join(","));
	}

	// 3) Write file
	fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
	console.log(`→ Generated ${count} rows to ${outPath}`);
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
