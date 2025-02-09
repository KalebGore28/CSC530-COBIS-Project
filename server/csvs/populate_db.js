import axios from "axios";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiBaseUrl = "http://localhost:4000/import"; // Ensure this matches your server's API route

/**
 * Reads a CSV file and sends data to the appropriate API endpoint.
 * @param {string} csvName - Name of the CSV file.
 * @param {string} endpoint - API endpoint to send data.
 */
async function importCSV(csvName, endpoint, importedBy = "System") {
	const filePath = path.join(__dirname, "..", "csvs", csvName);

	if (!fs.existsSync(filePath)) {
		console.error(`❌ CSV file ${csvName} not found.`);
		return;
	}

	const records = [];

	return new Promise((resolve, reject) => {
		fs.createReadStream(filePath)
			.pipe(csvParser({ mapHeaders: ({ header }) => header.trim() })) // Trim column headers
			.on("data", (row) => {
				const cleanedRow = Object.fromEntries(
					Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value?.trim()])
				);
				records.push(cleanedRow);
			})
			.on("end", async () => {

				if (records.length === 0) {
					console.warn(`⚠ No data found in ${csvName}. Skipping import.`);
					return resolve();
				}

				try {
					const payload = {
						mappedData: records,
						fileName: csvName,
						importedBy: importedBy,
					};

					const response = await axios.post(`${apiBaseUrl}/${endpoint}`, payload, {
						headers: { "Content-Type": "application/json" },
					});

					console.log(`✅ ${response.data.message}`);
					resolve();
				} catch (error) {
					console.error(`❌ Error importing ${csvName}:`, error.response?.data || error.message);
					reject(error);
				}
			})
			.on("error", (error) => {
				console.error(`❌ CSV Parsing Error in ${csvName}:`, error.message);
				reject(error);
			});
	});
}

// 🔹 List of CSV imports with corresponding API endpoints
const csvImports = [
	{ file: "terms.csv", endpoint: "terms" },
	{ file: "academic_standing.csv", endpoint: "academic_standing" },
	{ file: "admit_codes.csv", endpoint: "admit_codes" },
	{ file: "college_codes.csv", endpoint: "college_codes" },
	{ file: "colleges.csv", endpoint: "colleges" },
	{ file: "course_titles.csv", endpoint: "courses" },
	{ file: "departments.csv", endpoint: "departments" },
	{ file: "instructional_methods.csv", endpoint: "instructional_methods" },
	{ file: "major_minor.csv", endpoint: "programs" },
	{ file: "nations.csv", endpoint: "nations" },
	{ file: "part_of_term.csv", endpoint: "part_of_term" },
	{ file: "registration_status.csv", endpoint: "registration_status" },
	{ file: "student_types.csv", endpoint: "student_types" },
	{ file: "subject_prefixes.csv", endpoint: "subject_prefixes" },
	{ file: "courses_sample.csv", endpoint: "student_courses" },
	{ file: "test_scores_sample.csv", endpoint: "test_scores" },
	{ file: "demographics_sample.csv", endpoint: "demographics" },
	{ file: "overrides_sample.csv", endpoint: "overrides" },
	{ file: "previous_colleges_sample.csv", endpoint: "previous_colleges" },
];

/**
 * Runs all CSV imports sequentially.
 */
async function runImports() {
	console.log("🚀 Starting database population using API imports...");

	for (const { file, endpoint } of csvImports) {
		console.log(`📤 Importing ${file} to /import/${endpoint}...`);
		await importCSV(file, endpoint);
	}

	console.log("🎉 All CSV imports completed successfully!");
}

// Execute the script
runImports().catch((err) => console.error("❌ Import process failed:", err));