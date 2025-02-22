import express from 'express';
import { importData, convertDateMMDDYYYY } from './helpers.ts';

const router = express.Router();

router.post('/demographics', async (req, res) => {
	try {
		const { mappedData, fileName, importedBy } = req.body;

		// Break up the date of fields to their respective tables and transform the data
		const studentData = mappedData.map(row => {
			return {
				mnumber: row.mnumber,
				first_name: row.firstname,
				last_name: row.lastname,
				middle_name: row.middlename,
				suffix: row.suffix,
				gender: row.gender,
				birth_date: convertDateMMDDYYYY(row.birthdate),
				citizenship: row.citizen,
				race_code: row.race,
				race_description: row.racedesc,
				residency_code: row.residcode,
				residency_description: row.residdesc,
				age: parseInt(row.age, 10),
				cell_phone: row.cellphone,
			};
		});

		const studentColumnTypes = {
			mnumber: 'nvarchar',
			first_name: 'nvarchar',
			last_name: 'nvarchar',
			middle_name: 'nvarchar',
			suffix: 'nvarchar',
			gender: 'nvarchar',
			birth_date: 'datetime',
			citizenship: 'nvarchar',
			race_code: 'nvarchar',
			race_description: 'nvarchar',
			residency_code: 'nvarchar',
			residency_description: 'nvarchar',
			age: 'int',
			cell_phone: 'nvarchar',
		};

		const result1 = await importData('students', 'mnumber', studentData, fileName, importedBy, studentColumnTypes);

		const studentAddressesData = mappedData.flatMap(row => {
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

		const addressColumnTypes = {
			mnumber: 'nvarchar',
			type: 'nvarchar',
			street1: 'nvarchar',
			street2: 'nvarchar',
			city: 'nvarchar',
			state: 'nvarchar',
			zip: 'nvarchar',
			nation_code: 'nvarchar',
			phone: 'nvarchar',
		};

		const result2 = await importData('student_addresses', ['mnumber', 'type'], studentAddressesData, fileName, importedBy, addressColumnTypes);

		const studentAcademicData = mappedData.map(row => {

			const admitTermMatch = row.admitterm.match(/^(\d{4})(\d{2})$/);

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

		const academicColumnTypes = {
			mnumber: 'nvarchar',
			admit_term: 'nvarchar',
			admit_year: 'int',
			admit_code: 'nvarchar',
			academic_standing: 'nvarchar',
			msu_attempted_hours: 'decimal',
			msu_earned_hours: 'decimal',
			msu_quality_points: 'decimal',
			msu_gpa: 'decimal',
			overall_attempted_hours: 'decimal',
			overall_earned_hours: 'decimal',
			overall_quality_points: 'decimal',
			overall_gpa: 'decimal',
		};

		const result3 = await importData('student_academic_info', ['mnumber', 'admit_term', 'admit_year'], studentAcademicData, fileName, importedBy, academicColumnTypes);

		const studentProgramsData = mappedData.flatMap(row => {
			const programs = [];

			const termMatch = row.admitterm.match(/^(\d{4})(\d{2})$/);

			// If MAJOR1 exists, create a 'MAJOR' program entry
			if (row.major1) {
				programs.push({
					mnumber: row.mnumber,
					term: termMatch[2],
					year: parseInt(termMatch[1], 10),
					study: row.program,
					type: 'MAJOR',
					level: row.levl,
					program_code: row.major1,
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
					program_code: row.major2,
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
					program_code: row.minor1,
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
					program_code: row.minor2,
					department: row.minor2dept,
					college: row.minor2coll,
				});
			}

			return programs;
		});

		const programColumnTypes = {
			mnumber: 'nvarchar',
			term: 'nvarchar',
			year: 'int',
			study: 'nvarchar',
			type: 'nvarchar',
			level: 'nvarchar',
			program_code: 'nvarchar',
			department: 'nvarchar',
			college: 'nvarchar',
		};

		const result4 = await importData('student_programs', ['mnumber', 'term', 'year', 'type', 'program_code'], studentProgramsData, fileName, importedBy, programColumnTypes);

		const advisorData = mappedData.map(row => {
			return {
				advisor_id: row.advnumb,
				first_name: row.advfname,
				last_name: row.advlname,
				middle_name: row.advmname,
				suffix: row.advsuffix,
			};
		});

		const advisorColumnTypes = {
			advisor_id: 'nvarchar',
			first_name: 'nvarchar',
			last_name: 'nvarchar',
			middle_name: 'nvarchar',
			suffix: 'nvarchar',
		};

		const result5 = await importData('advisors', 'advisor_id', advisorData, fileName, importedBy, advisorColumnTypes);

		const studentAdvisorData = mappedData.map(row => {

			const termMatch = row.admitterm.match(/^(\d{4})(\d{2})$/);
			return {
				mnumber: row.mnumber,
				term: termMatch[2],
				year: parseInt(termMatch[1], 10),
				advisor_id: row.advnumb,
			};
		});

		const studentAdvisorColumnTypes = {
			mnumber: 'nvarchar',
			term: 'nvarchar',
			year: 'int',
			advisor_id: 'nvarchar',
		};

		const result6 = await importData('student_advisors', ['mnumber', 'term', 'year', 'advisor_id'], studentAdvisorData, fileName, importedBy, studentAdvisorColumnTypes);

		res.json({
			message: 'Demographics imported successfully.',
			totalRecords: result1.totalRecords,
			errors: result1.errorDetails,
			totalAddresses: result2.totalRecords,
			totalAcademic: result3.totalRecords,
			totalPrograms: result4.totalRecords,
			totalAdvisors: result5.totalRecords,
			totalStudentAdvisors: result6.totalRecords,
		});

	} catch (error) {
		console.error(`Error importing terms data: ${error.message}`);
		res.status(500).json({ error: 'Error importing terms data.' });
	}
});

export default router;