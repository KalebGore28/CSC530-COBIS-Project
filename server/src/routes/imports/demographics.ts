import express from 'express';
import { importData } from '../../utils/importData';
import { convertDateMMDDYYYY } from '../../utils/convertDates';
import 'zod-openapi/extend';
import { z } from 'zod';

import { students, studentAddresses, studentAcademicInfo, studentPrograms, advisors, studentAdvisors } from '../../db/schema';

interface DemographicsRow {
	mnumber: string;
	firstname: string;
	lastname: string;
	middlename: string;
	suffix: string;
	gender: string;
	birthdate: string;
	citizen: string;
	race: string;
	racedesc: string;
	residcode: string;
	residdesc: string;
	age: string;
	cellphone: string;
	homestreet1: string;
	homestreet2: string;
	homecity: string;
	homestate: string;
	homezip: string;
	homenation: string;
	homephone: string;
	locstreet1: string;
	locstreet2: string;
	loccity: string;
	locstate: string;
	loczip: string;
	locnation: string;
	locphone: string;
	admitterm: string;
	admitcode: string;
	acadstanding: string;
	msuatthours: string;
	msuearnhours: string;
	msuqp: string;
	msugpa: string;
	overallatthours: string;
	overallearnhours: string;
	overqp: string;
	overgpa: string;
	program: string;
	levl: string;
	major1: string;
	major1dept: string;
	major1coll: string;
	major2: string;
	major2dept: string;
	major2coll: string;
	minor1: string;
	minor1dept: string;
	minor1coll: string;
	minor2: string;
	minor2dept: string;
	minor2coll: string;
	advnumb: string;
	advfname: string;
	advlname: string;
	advmname: string;
	advsuffix: string;
}

async function importStudents(
	mappedData: DemographicsRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		students,
		'mnumber',
		mappedData,
		fileName,
		importedBy
	);
}

async function importAddresses(
	mappedData: DemographicsRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		studentAddresses,
		['mnumber', 'type'],
		mappedData,
		fileName,
		importedBy
	);
}

async function importAcademicInfo(
	mappedData: DemographicsRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		studentAcademicInfo,
		['mnumber', 'admit_term', 'admit_year'],
		mappedData,
		fileName,
		importedBy
	);
}

async function importPrograms(
	mappedData: DemographicsRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		studentPrograms,
		['mnumber', 'term', 'year', 'type', 'program'],
		mappedData,
		fileName,
		importedBy
	);
}

async function importAdvisors(
	mappedData: DemographicsRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		advisors,
		'id',
		mappedData,
		fileName,
		importedBy
	);
}

async function importStudentAdvisors(
	mappedData: DemographicsRow[],
	fileName: string,
	importedBy: string
) {
	return importData(
		studentAdvisors,
		['mnumber', 'term', 'year', 'advisor_id'],
		mappedData,
		fileName,
		importedBy
	);
}

export const demographicsRouter = express.Router()

	/**
	 * @openapi
	 * /api/import/demographics:
	 *   post:
	 *     tags:
	 *       - Imports
	 *     summary: Import demographics data.
	 *     description: >
	 *       Imports demographics data from a CSV file. The payload should include:
	 *         - mappedData: an array of demographics records, each containing properties such as mnumber, firstname, lastname, middlename, suffix, gender, birthdate, citizen, race, racedesc, residcode, residdesc, age, cellphone, homestreet1, homestreet2, homecity, homestate, homezip, homenation, homephone, locstreet1, locstreet2, loccity, locstate, loczip, locnation, locphone, admitterm, admitcode, acadstanding, msuatthours, msuearnhours, msuqp, msugpa, overallatthours, overallearnhours, overqp, overgpa, program, levl, major1, major1dept, major1coll, major2, major2dept, major2coll, minor1, minor1dept, minor1coll, minor2, minor2dept, minor2coll, advnumb, advfname, advlname, advmname, and advsuffix.
	 *         - fileName: the name of the CSV file.
	 *         - importedBy: the identifier of the user performing the import.
	 *       The endpoint aggregates multiple import operations and returns total counts for different data segments.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               mappedData:
	 *                 type: array
	 *                 items:
	 *                   type: object
	 *                   properties:
	 *                     mnumber:
	 *                       type: string
	 *                     firstname:
	 *                       type: string
	 *                     lastname:
	 *                       type: string
	 *                     middlename:
	 *                       type: string
	 *                     suffix:
	 *                       type: string
	 *                     gender:
	 *                       type: string
	 *                     birthdate:
	 *                       type: string
	 *                     citizen:
	 *                       type: string
	 *                     race:
	 *                       type: string
	 *                     racedesc:
	 *                       type: string
	 *                     residcode:
	 *                       type: string
	 *                     residdesc:
	 *                       type: string
	 *                     age:
	 *                       type: string
	 *                     cellphone:
	 *                       type: string
	 *                     homestreet1:
	 *                       type: string
	 *                     homestreet2:
	 *                       type: string
	 *                     homecity:
	 *                       type: string
	 *                     homestate:
	 *                       type: string
	 *                     homezip:
	 *                       type: string
	 *                     homenation:
	 *                       type: string
	 *                     homephone:
	 *                       type: string
	 *                     locstreet1:
	 *                       type: string
	 *                     locstreet2:
	 *                       type: string
	 *                     loccity:
	 *                       type: string
	 *                     locstate:
	 *                       type: string
	 *                     loczip:
	 *                       type: string
	 *                     locnation:
	 *                       type: string
	 *                     locphone:
	 *                       type: string
	 *                     admitterm:
	 *                       type: string
	 *                     admitcode:
	 *                       type: string
	 *                     acadstanding:
	 *                       type: string
	 *                     msuatthours:
	 *                       type: string
	 *                     msuearnhours:
	 *                       type: string
	 *                     msuqp:
	 *                       type: string
	 *                     msugpa:
	 *                       type: string
	 *                     overallatthours:
	 *                       type: string
	 *                     overallearnhours:
	 *                       type: string
	 *                     overqp:
	 *                       type: string
	 *                     overgpa:
	 *                       type: string
	 *                     program:
	 *                       type: string
	 *                     levl:
	 *                       type: string
	 *                     major1:
	 *                       type: string
	 *                     major1dept:
	 *                       type: string
	 *                     major1coll:
	 *                       type: string
	 *                     major2:
	 *                       type: string
	 *                     major2dept:
	 *                       type: string
	 *                     major2coll:
	 *                       type: string
	 *                     minor1:
	 *                       type: string
	 *                     minor1dept:
	 *                       type: string
	 *                     minor1coll:
	 *                       type: string
	 *                     minor2:
	 *                       type: string
	 *                     minor2dept:
	 *                       type: string
	 *                     minor2coll:
	 *                       type: string
	 *                     advnumb:
	 *                       type: string
	 *                     advfname:
	 *                       type: string
	 *                     advlname:
	 *                       type: string
	 *                     advmname:
	 *                       type: string
	 *                     advsuffix:
	 *                       type: string
	 *               fileName:
	 *                 type: string
	 *               importedBy:
	 *                 type: string
	 *     responses:
	 *       200:
	 *         description: Demographics imported successfully.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 message:
	 *                   type: string
	 *                 totalRecords:
	 *                   type: integer
	 *                 errors:
	 *                   type: array
	 *                   items:
	 *                     type: object
	 *                     properties:
	 *                       row:
	 *                         type: object
	 *                       error:
	 *                         type: string
	 *                 totalStudents:
	 *                   type: integer
	 *                 totalAddresses:
	 *                   type: integer
	 *                 totalAcademic:
	 *                   type: integer
	 *                 totalPrograms:
	 *                   type: integer
	 *                 totalAdvisors:
	 *                   type: integer
	 *                 totalStudentAdvisors:
	 *                   type: integer
	 *       500:
	 *         description: Error importing demographics data.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 error:
	 *                   type: string
	 */
	.post('/demographics', async (req, res) => {
		try {
			const { mappedData, fileName, importedBy } = req.body;

			// Break up the date of fields to their respective tables and transform the data
			const studentData = mappedData.map((row: { mnumber: string; firstname: string; lastname: string; middlename: string; suffix: string; gender: string; birthdate: string; citizen: string; race: string; racedesc: string; residcode: string; residdesc: string; age: string; cellphone: string; }) => {
				return {
					mnumber: row.mnumber,
					first_name: row.firstname,
					last_name: row.lastname,
					middle_name: row.middlename,
					suffix: row.suffix,
					gender: row.gender,
					birthdate: convertDateMMDDYYYY(row.birthdate),
					citizenship: row.citizen,
					race_code: row.race,
					race_description: row.racedesc,
					residency_code: row.residcode,
					residency_description: row.residdesc,
					age: parseInt(row.age, 10),
					cell_phone: row.cellphone,
				};
			});

			const result1 = await importStudents(studentData, fileName, importedBy);

			const studentAddressesData = mappedData.flatMap((row: { homestreet1: string; mnumber: string; homestreet2: string; homecity: string; homestate: string; homezip: string; homenation: string; homephone: string; locstreet1: string; locstreet2: string; loccity: string; locstate: string; loczip: string; locnation: string; locphone: string; }) => {
				const addresses = [];

				// If HOMESTREET1 exists, create a 'HOME' address entry
				if (row.homestreet1) {
					addresses.push({
						mnumber: row.mnumber,
						type: 'HOME',
						street1: row.homestreet1,
						street2: row.homestreet2 || null,
						city: row.homecity || null,
						state: row.homestate || null,
						zip: row.homezip || null,
						nation_code: row.homenation || null,
						phone: row.homephone || null
					});
				}

				// If LOCSTREET1 exists, create a 'LOCAL' address entry
				if (row.locstreet1) {
					addresses.push({
						mnumber: row.mnumber,
						type: 'LOCAL',
						street1: row.locstreet1,
						street2: row.locstreet2 || null,
						city: row.loccity || null,
						state: row.locstate || null,
						zip: row.loczip || null,
						nation_code: row.locnation || null,
						phone: row.locphone || null
					});
				}

				return addresses; // This will return either one or two objects per student
			});

			const result2 = await importAddresses(studentAddressesData, fileName, importedBy);

			const studentAcademicData = mappedData.map((row: { admitterm: string; mnumber: string; admitcode: string; acadstanding: string; msuatthours: string; msuearnhours: string; msuqp: string; msugpa: string; overallatthours: string; overallearnhours: string; overqp: string; overgpa: string; }) => {

				const admitTermMatch = row.admitterm.match(/^(\d{4})(\d{2})$/);

				if (!admitTermMatch) {
					console.warn(`⚠ Invalid ADMIT TERM format: ${row.admitterm}`);
					return null; // Skip invalid
				}

				return {
					mnumber: row.mnumber,
					admit_term: admitTermMatch[2],
					admit_year: parseInt(admitTermMatch[1], 10),
					admit_code: row.admitcode,
					academic_standing: row.acadstanding,
					msu_attempted_hours: parseFloat(row.msuatthours) || 0,
					msu_earned_hours: parseFloat(row.msuearnhours) || 0,
					msu_quality_points: parseFloat(row.msuqp) || 0,
					msu_gpa: parseFloat(row.msugpa) || 0,
					overall_attempted_hours: parseFloat(row.overallatthours) || 0,
					overall_earned_hours: parseFloat(row.overallearnhours) || 0,
					overall_quality_points: parseFloat(row.overqp) || 0,
					overall_gpa: parseFloat(row.overgpa) || 0,
				};
			});

			const result3 = await importAcademicInfo(studentAcademicData, fileName, importedBy);

			const studentProgramsData = mappedData.flatMap((row: { admitterm: string; major1: string; mnumber: string; program: string; levl: string; major1dept: string; major1coll: string; major2: string; major2dept: string; major2coll: string; minor1: string; minor1dept: string; minor1coll: string; minor2: string; minor2dept: string; minor2coll: string; }) => {
				const programs = [];

				const termMatch = row.admitterm.match(/^(\d{4})(\d{2})$/);

				if (!termMatch) {
					console.warn(`⚠ Invalid ADMIT TERM format: ${row.admitterm}`);
					return null; // Skip invalid rows
				}

				// If MAJOR1 exists, create a 'MAJOR' program entry
				if (row.major1) {
					programs.push({
						mnumber: row.mnumber,
						term: termMatch[2],
						year: parseInt(termMatch[1], 10),
						study: row.program,
						type: 'MAJOR',
						level: row.levl,
						program: row.major1,
						department: row.major1dept,
						college: row.major1coll,
					});
				}

				// If MAJOR2 exists, create a 'MAJOR' program entry
				if (row.major2) {
					programs.push({
						mnumber: row.mnumber,
						term: termMatch[2],
						year: parseInt(termMatch[1], 10),
						study: row.program,
						type: 'MAJOR',
						level: row.levl,
						program: row.major2,
						department: row.major2dept,
						college: row.major2coll,
					});
				}

				// If MINOR1 exists, create a 'MINOR' program entry
				if (row.minor1) {
					programs.push({
						mnumber: row.mnumber,
						term: termMatch[2],
						year: parseInt(termMatch[1], 10),
						study: row.program,
						type: 'MINOR',
						level: row.levl,
						program: row.minor1,
						department: row.minor1dept,
						college: row.minor1coll,
					});
				}

				// If MINOR2 exists, create a 'MINOR' program entry
				if (row.minor2) {
					programs.push({
						mnumber: row.mnumber,
						term: termMatch[2],
						year: parseInt(termMatch[1], 10),
						study: row.program,
						type: 'MINOR',
						level: row.levl,
						program: row.minor2,
						department: row.minor2dept,
						college: row.minor2coll,
					});
				}

				return programs;
			});

			const result4 = await importPrograms(studentProgramsData, fileName, importedBy);

			const advisorData = mappedData.map((row: { advnumb: string; advfname: string; advlname: string; advmname: string; advsuffix: string; }) => {
				return {
					id: row.advnumb,
					first_name: row.advfname,
					last_name: row.advlname,
					middle_name: row.advmname,
					suffix: row.advsuffix,
				};
			});

			const result5 = await importAdvisors(advisorData, fileName, importedBy);

			const studentAdvisorData = mappedData.map((row: { admitterm: string; mnumber: string; advnumb: string; }) => {

				const termMatch = row.admitterm.match(/^(\d{4})(\d{2})$/);

				if (!termMatch) {
					console.warn(`⚠ Invalid TERM format: ${row.admitterm}`);
					return null; // Skip invalid rows
				}

				return {
					mnumber: row.mnumber,
					term: termMatch[2],
					year: parseInt(termMatch[1], 10),
					advisor_id: row.advnumb,
				};
			});

			const result6 = await importStudentAdvisors(studentAdvisorData, fileName, importedBy);

			res.json({
				message: 'Demographics imported successfully.',
				totalRecords: result1.totalRecords,
				errors: result1.errorDetails,
				totalStudents: result1.totalRecords,
				totalAddresses: result2.totalRecords,
				totalAcademic: result3.totalRecords,
				totalPrograms: result4.totalRecords,
				totalAdvisors: result5.totalRecords,
				totalStudentAdvisors: result6.totalRecords,
			});

		} catch (error: any) {
			console.error(`Error importing terms data: ${error.message}`);
			res.status(500).json({ error: 'Error importing terms data.' });
		}
	});