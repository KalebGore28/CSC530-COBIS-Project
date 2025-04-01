// test-data-imports.ts
import {
	findMappingsForFilename,
	mapCsvRowToDbRow,
	mapCsvDataToDbData
} from './columnMappingService';

// Test various file imports
const testImports = () => {
	const testFiles = [
		'reg_cuba_test_scores_2023_04.csv',
		'reg_cuba_demographic_2023_04.csv',
		'reg_cuba_courses_during_term_2023_04.csv',
		'reg_cuba_previous_colleges_2023_04.csv',
		'reg_cuba_overrides_2023_04.csv',
		'reg_cuba_catalog_202304_20230417.csv'
	];

	// Test each file
	testFiles.forEach(fileName => {
		console.log(`\n=== Testing ${fileName} ===`);
		const mapping = findMappingsForFilename(fileName);

		if (!mapping) {
			console.log(`No mapping found for ${fileName}`);
			return;
		}

		console.log(`Found mapping: ${mapping.description}`);
		console.log(`Category: ${mapping.category}`);
		console.log(`Destinations: ${mapping.destinations.map(d => d.tableName).join(', ')}`);

		// Test with sample data for this file type
		const sampleData = getSampleDataForFile(fileName);

		// Test each destination
		mapping.destinations.forEach(destination => {
			console.log(`\n--- Testing ${destination.tableName} mapping ---`);

			if (destination.rowExpander) {
				console.log(`Using row expander for ${destination.tableName}`);
				const expandedRows = mapCsvDataToDbData(sampleData, destination);
				console.log(`Generated ${expandedRows.length} rows`);

				if (expandedRows.length > 0) {
					console.log('Sample output (first row):', expandedRows[0]);

					if (expandedRows.length > 1) {
						console.log('Sample output (second row):', expandedRows[1]);
					}
				}
			} else {
				const mappedRow = mapCsvRowToDbRow(sampleData[0], destination);
				console.log('Mapped row:', mappedRow);
			}
		});
	});
};

// Helper function to get sample data for testing
const getSampleDataForFile = (fileName: string): Record<string, any>[] => {
	if (fileName.includes('test_scores')) {
		return [{
			mnumber: 'M12345678',
			testcode: 'ACT',
			testdesc: 'ACT Test',
			testscore: '28',
			testdate: '04152023'
		}];
	}
	else if (fileName.includes('demographic')) {
		return [{
			mnumber: 'M12345678',
			firstname: 'John',
			middlename: 'A',
			lastname: 'Doe',
			suffix: '',
			gender: 'M',
			birthdate: '03152000',
			term: '202304',
			levl: 'UG',
			race: 'W',
			racedesc: 'White',
			residcode: 'IS',
			residdesc: 'In-State',
			age: '23',
			cellphone: '555-123-4567',
			// Home address
			homestreet1: '123 Main St',
			homestreet2: 'Apt 4B',
			homecity: 'Springfield',
			homestate: 'MS',
			homezip: '39759',
			homenation: 'USA',
			homephone: '555-987-6543',
			// Local address
			locstreet1: '456 Campus Dr',
			locstreet2: 'Room 202',
			loccity: 'University',
			locstate: 'MS',
			loczip: '39762',
			locnation: 'USA',
			locphone: '555-555-5555',
			// Academic info
			admitterm: '202108',
			admitcode: 'FR',
			acadstanding: 'GOOD',
			msuatthours: '60',
			msuearnhours: '57',
			msuqp: '171',
			msugpa: '3.0',
			overatthours: '60',
			overearnhours: '57',
			overqp: '171',
			overgpa: '3.0',
			// Program info
			program: 'BS',
			major1: 'COMP',
			major1dept: 'CS',
			major1coll: 'ENG',
			major2: 'MATH',
			major2dept: 'MATH',
			major2coll: 'SCI',
			minor1: 'PHYS',
			minor1dept: 'PHYS',
			minor2: 'STAT',
			minor2dept: 'MATH',
			// Advisor info
			advnumb: 'M87654321',
			advfname: 'Jane',
			advlname: 'Smith',
			advmname: 'B',
			advsuffix: 'PhD'
		}];
	}
	else if (fileName.includes('courses_during_term')) {
		return [{
			mnumber: 'M12345678',
			term: '202310',
			partofterm: 'FULL',
			crn: '12345',
			crsesubj: 'CSE',
			crsenumb: '4283',
			section: '01',
			crhrs: '3',
			levlcode: 'UG',
			rstscode: 'RE',
			insmcode: 'TRAD',
			lastattend: '05012023',
			midgrade: 'B',
			fingrade: 'A',
			instmnumber: 'M87654321'
		}];
	}
	else if (fileName.includes('previous_colleges')) {
		return [{
			mnumber: 'M12345678',
			collegecode: 'ABC123',
			collegedesc: 'Sample Community College',
			degree: 'AA',
			degreedate: '05152021'
		}];
	}
	else if (fileName.includes('overrides')) {
		return [{
			mnumber: 'M12345678',
			term: '202310',
			crn: '12345',
			subj: 'CSE',
			crsenumb: '4283',
			section: '01',
			override: 'PREREQ',
			userid: 'jsmith',
			activitydate: '03012023'
		}];
	}
	else if (fileName.includes('catalog')) {
		return [{
			course: 'CSE283T',
			crsetitle: 'Software Testing and Quality Assurance',
			crhrs: '3',
			course_fee: '50',
			web_fee: '25',
			lastChanged: '2022-08-10 04:46:00'
		}];
	}

	// Default empty sample
	return [{}];
};

// Run the tests
testImports();