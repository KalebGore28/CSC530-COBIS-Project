import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import sql from 'mssql';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Database Configuration
const dbConfig = {
	user: "sa",
	password: "YourStrongPassw0rd",
	server: "localhost",
	port: 1433,
	database: "tempdb",
	options: {
		encrypt: true, // Set to `true` if using Azure SQL Server
		trustServerCertificate: true, // Needed for self-signed certs in Docker
	},
};

// 🔹 Helper Function: Read CSV & Insert Data
async function importCSV(filePath, tableName, columns) {
	const pool = await sql.connect(dbConfig);
	const dataRows = [];

	return new Promise((resolve, reject) => {
		fs.createReadStream(filePath)
			.pipe(csv({
				separator: ",", // Force comma separation
				quote: '"', // Preserve quoted values correctly
				escape: '"', // Ensure escaping inside quotes works
				relax_column_count: true, // Allow rows with inconsistent column counts
				skipEmptyLines: true, // Prevent empty rows from being added
				mapHeaders: ({ header }) => header.trim().toLowerCase(), // Normalize headers
			}))
			.on("data", (row) => {
				// Ensure values are properly extracted and trimmed
				const values = columns.map((col) => {
					let value = row[col]?.trim();

					// Convert "NULL" and empty strings to actual default values
					if (value === "NULL" || value === "") {
						if (["is_major", "is_minor", "has_concentration", "is_discontinued", "is_aacsb"].includes(col)) {
							return 0; // Default to 0 for boolean-like integer fields
						}
						if (["college", "department"].includes(col)) {
							return "UNASSIGNED"; // Default to "UNASSIGNED" for these fields
						}
						return null; // Default null for everything else
					}

					// Ensure boolean-like values are stored as BIT (0 or 1)
					if (["is_major", "is_minor", "has_concentration", "is_discontinued", "is_aacsb"].includes(col)) {
						return parseInt(value, 10) || 0; // Convert to integer (ensuring 0 as default)
					}

					// check again if department is null then print out error
					if (col === "department" && value === null) {
						console.log(`❌ Error: Department is null`);
					}

					return value;

				});

				// Debugging: Log extracted values
				// console.log(`Parsed Row:`, values);

				if (values.some((val) => val !== null)) {
					dataRows.push(values);
				}
			})
			.on("end", async () => {
				if (dataRows.length > 0) {
					try {
						for (const values of dataRows) {
							const request = pool.request();

							// Dynamically bind parameters with correct SQL types
							columns.forEach((col, index) => {
								let paramValue = values[index];

								// Explicitly set NVARCHAR(10) for cip_code
								if (col === "cip_code") {
									request.input(`param${index}`, sql.NVarChar(10), paramValue ?? null);
								}
								// Ensure BIT fields remain integers (0 or 1)
								else if (["is_major", "is_minor", "has_concentration", "is_discontinued", "is_aacsb"].includes(col)) {
									request.input(`param${index}`, sql.Bit, paramValue);
								}
								// Ensure DATETIME fields are properly stored
								else if (col === "added_on") {
									request.input(`param${index}`, sql.DateTime, paramValue ?? new Date()); // Use current date if null
								}
								// Ensure NVARCHAR(10) for other short fields
								else if (["code", "department", "college"].includes(col)) {
									request.input(`param${index}`, sql.NVarChar(10), paramValue);
								}
								// Default NVARCHAR(255) for other text fields
								else {
									request.input(`param${index}`, sql.NVarChar(255), paramValue);
								}
							});

							// Construct dynamic SQL query with parameterized values
							const query = `
                                INSERT INTO ${tableName} (${columns.join(", ")})
                                VALUES (${columns.map((_, index) => `@param${index}`).join(", ")})
                            `;

							await request.query(query);
						}

						console.log(`✅ ${dataRows.length} rows inserted into ${tableName}`);
						resolve();
					} catch (err) {
						console.error(`❌ Error inserting into ${tableName}:`, err);
						reject(err);
					}
				} else {
					console.log(`⚠ No valid data found in ${filePath}`);
					resolve();
				}
			})
			.on("error", reject);
	});
}

// Importing course titles
async function importCourseTitles() {
    const filePath = path.join(__dirname, "course_titles.csv");
    const pool = await sql.connect(dbConfig);

    return new Promise((resolve, reject) => {
        const courses = [];

        fs.createReadStream(filePath)
            .pipe(csv({
                separator: ",",
                quote: '"',
                escape: '"',
                relax_column_count: true,
                skipEmptyLines: true,
                mapHeaders: ({ header }) => header.trim().toLowerCase(),
            }))
            .on("data", (row) => {
                try {
                    const subject = row["prefix"]?.trim();
                    const rawNumber = row["number"]?.trim();
                    const title = row["course_title"]?.trim();
                    const hours = parseInt(row["hours"]?.trim()) || 0;
                    const courseFee = parseFloat(row["course_fee"]) || 0;
                    const webFee = parseFloat(row["web_fee"]) || 0;

                    const lastChanged = row["last_updated"] && !isNaN(Date.parse(row["last_updated"]))
                        ? new Date(row["last_updated"])
                        : new Date();

                    // Extract course number and optional suffix
                    const match = rawNumber.match(/^(\d+)([A-Za-z]*)$/);
                    const courseNumber = match ? parseInt(match[1]) : null;
                    const courseSuffix = match && match[2] ? match[2] : ""; // Defaults to empty string

                    if (!subject || !courseNumber || !title) {
                        console.warn(`⚠️ Skipping invalid row:`, row);
                        return;
                    }

                    courses.push({
                        subject,
                        course_number: courseNumber,
                        course_suffix: courseSuffix,
                        title,
                        hours,
                        course_fee: courseFee,
                        web_fee: webFee,
                        last_changed: lastChanged,
                    });
                } catch (error) {
                    console.error("⚠️ Error parsing row:", row, error.message);
                }
            })
            .on("end", async () => {
                if (courses.length === 0) {
                    console.warn("⚠️ No valid data to insert.");
                    return resolve();
                }

                try {
                    await pool.query("DELETE FROM courses"); // Clear table before inserting

                    for (const course of courses) {
                        const request = pool.request(); // 🔹 Create a new request object for each iteration

                        request.input("subject", sql.NVarChar(10), course.subject);
                        request.input("course_number", sql.Int, course.course_number);
                        request.input("course_suffix", sql.NVarChar(5), course.course_suffix);
                        request.input("title", sql.NVarChar(255), course.title);
                        request.input("hours", sql.Int, course.hours);
                        request.input("course_fee", sql.Decimal(10, 2), course.course_fee);
                        request.input("web_fee", sql.Decimal(10, 2), course.web_fee);
                        request.input("last_changed", sql.DateTime, course.last_changed);

                        await request.query(`
                            INSERT INTO courses (subject, course_number, course_suffix, title, hours, course_fee, web_fee, last_changed)
                            VALUES (@subject, @course_number, @course_suffix, @title, @hours, @course_fee, @web_fee, @last_changed)
                        `);
                    }

                    console.log(`✅ Successfully inserted ${courses.length} courses.`);
                    resolve();
                } catch (error) {
                    console.error("❌ Error inserting courses:", error.message);
                    reject(error);
                }
            })
            .on("error", (error) => {
                console.error("❌ CSV Parsing Error:", error.message);
                reject(error);
            });
    });
}

// 🔹 Main Function: Import All CSV Files
async function populateDatabase() {
	try {
		console.log('📥 Connecting to database...');
		await sql.connect(dbConfig);

		console.log('🚀 Starting CSV imports...\n');

		// 🔹 Import `student_types.csv`
		await sql.query('DELETE FROM student_types');
		await importCSV(
			path.join(__dirname, 'student_types.csv'),
			'student_types',
			['code', 'description', 'next_student_type']
		);

		// 🔹 Import `college_codes.csv`
		await sql.query('DELETE FROM college_codes');
		await importCSV(
			path.join(__dirname, 'college_codes.csv'),
			'college_codes',
			['code', 'name']
		);

		// 🔹 Import `colleges.csv`
		await sql.query('DELETE FROM colleges');
		await importCSV(
			path.join(__dirname, 'colleges.csv'),
			'colleges',
			['code', 'description']
		);

		// 🔹 Import `nations.csv`
		await sql.query('DELETE FROM nations');
		await importCSV(
			path.join(__dirname, 'nations.csv'),
			'nations',
			['code', 'description']
		);

		// 🔹 Import `partofterm.csv`
		await sql.query('DELETE FROM part_of_term');
		await importCSV(
			path.join(__dirname, 'part_of_term.csv'),
			'part_of_term',
			['code', 'description']
		);

		// 🔹 Import `academic_standing.csv`
		await sql.query('DELETE FROM academic_standing');
		await importCSV(
			path.join(__dirname, 'academic_standing.csv'),
			'academic_standing',
			['code', 'description']
		);

		// 🔹 Import `admit_codes.csv`
		await sql.query('DELETE FROM admit_codes');
		await importCSV(
			path.join(__dirname, 'admit_codes.csv'),
			'admit_codes',
			['code', 'description']
		);

		// 🔹 Import `instructional_methods.csv`
		await sql.query('DELETE FROM instructional_methods');
		await importCSV(
			path.join(__dirname, 'instructional_methods.csv'),
			'instructional_methods',
			['code', 'description']
		);

		// 🔹 Import `departments.csv`
		await sql.query('DELETE FROM departments');
		await importCSV(
			path.join(__dirname, 'departments.csv'),
			'departments',
			['code', 'description', 'prefixes', 'canvas_id', 'college']
		);

		// 🔹 Import `registration_status.csv`
		await sql.query('DELETE FROM registration_status');
		await importCSV(
			path.join(__dirname, 'registration_status.csv'),
			'registration_status',
			['code', 'description']
		);

		// 🔹 Import `major_minor.csv`
		await sql.query('DELETE FROM programs');
		await importCSV(
			path.join(__dirname, 'major_minor.csv'),
			'programs',
			['code', 'description', 'cip_code', 'is_major', 'is_minor', 'has_concentration', 'is_discontinued', 'is_aacsb', 'department', 'college', 'added_on']
		);

		// 🔹 Import `course_titles.csv`
		await importCourseTitles();

		console.log('\n✅ All CSV imports completed successfully!');
	} catch (err) {
		console.error('❌ Error populating database:', err);
	} finally {
		sql.close();
	}
}

// Run the script
populateDatabase();