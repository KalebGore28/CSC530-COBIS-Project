import { suggestNextFilename } from "./utils";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Copy the existing "master" CSV into the generated folder with a new filename
 */
export const seedCourses = async (): Promise<void> => {
	const outDir = path.resolve(__dirname, "../generated");
	fs.mkdirSync(outDir, { recursive: true });

	// 1) Find the source "master" CSV file
	const masterFile = path.resolve(__dirname, "../csvs/course_catalog.csv");
	if (!fs.existsSync(masterFile)) {
		throw new Error(`Source CSV not found at: ${masterFile}`);
	}

	// 2) Suggest the next filename in generated/
	const existing = fs.readdirSync(outDir);
	const nextBase = suggestNextFilename("reg_cuba_catalog", existing);
	const outFilename = `${nextBase}.csv`;
	const outPath = path.join(outDir, outFilename);

	// 3) Copy the file
	fs.copyFileSync(masterFile, outPath);

	console.log(`→ Copied ${masterFile} to ${outPath}`);
}

// Check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
	seedCourses()
		.then(() => {
			console.log("Seed completed, exiting.");
			process.exit(0);
		})
		.catch((err) => {
			console.error("Error during seeding:", err);
			process.exit(1);
		});
}
