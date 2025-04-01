// test-demographics-mapping.ts
import { 
	findMappingsForFilename, 
	mapCsvRowToDbRow,
	mapCsvDataToDbData,
	expandStudentPrograms
  } from './columnMappingService';
  
  // Test file mapping detection
  const filename = 'reg_cuba_demographic_2023_04.csv';
  const mapping = findMappingsForFilename(filename);
  
  console.log('File mapping found:', mapping ? true : false);
  if (mapping) {
	console.log('Description:', mapping.description);
	console.log('Destinations:', mapping.destinations.map(d => d.tableName).join(', '));
	
	// Create a sample demographics row with major/minor data
	const sampleRow = {
	  mnumber: 'M12345678',
	  firstname: 'John',
	  lastname: 'Doe',
	  middlename: 'A',
	  suffix: '',
	  gender: 'M',
	  birthdate: '03152000',
	  term: '202304',
	  levl: 'UG',
	  major1: 'COMP',
	  major1dept: 'CS',
	  major1coll: 'ENG',
	  major2: 'MATH',
	  major2dept: 'MATH',
	  major2coll: 'SCI',
	  minor1: 'PHYS',
	  minor1dept: 'PHYS',
	  minor2: 'STAT',
	  minor2dept: 'MATH'
	};
	
	// 1. Test basic student info mapping
	const studentDestination = mapping.destinations.find(d => d.tableName === 'Students');
	if (studentDestination) {
	  const mappedStudentRow = mapCsvRowToDbRow(sampleRow, studentDestination);
	  console.log('\n=== Basic Student Info Mapping ===');
	  console.log(mappedStudentRow);
	}
	
	// 2. Test student programs mapping (the one-to-many case)
	const programsDestination = mapping.destinations.find(d => d.tableName === 'Student Programs');
	if (programsDestination) {
	  console.log('\n=== Student Programs Mapping (one-to-many) ===');
	  
	  // Test direct row expander function
	  console.log('Using expandStudentPrograms directly:');
	  const expandedRows = expandStudentPrograms(sampleRow);
	  console.log(`Generated ${expandedRows.length} program rows:`);
	  expandedRows.forEach((row, i) => {
		console.log(`Row ${i + 1}:`, row);
	  });
	  
	  // Test using the mapCsvDataToDbData function
	  console.log('\nUsing mapCsvDataToDbData:');
	  const mappedProgramRows = mapCsvDataToDbData([sampleRow], programsDestination);
	  console.log(`Generated ${mappedProgramRows.length} program rows via mapCsvDataToDbData`);
	  mappedProgramRows.forEach((row, i) => {
		console.log(`Row ${i + 1}:`, row);
	  });
	}
	
	// 3. Compare with a destination that doesn't use row expansion
	const advisorDestination = mapping.destinations.find(d => d.tableName === 'Student Advisors');
	if (advisorDestination) {
	  console.log('\n=== Standard Mapping (Student Advisors) ===');
	  const sampleRowWithAdvisor = {
		...sampleRow,
		advnumb: 'M87654321',
		advfname: 'Jane',
		advlname: 'Smith'
	  };
	  
	  const mappedAdvisorRow = mapCsvRowToDbRow(sampleRowWithAdvisor, advisorDestination);
	  console.log(mappedAdvisorRow);
	}
	
	// 4. Test with missing data
	console.log('\n=== Testing with Missing Data ===');
	const incompleteRow = {
	  mnumber: 'M98765432',
	  firstname: 'Alice',
	  lastname: 'Johnson',
	  term: '202304',
	  // Missing majors and minors
	};
	
	// This should not generate any program rows since there are no majors/minors
	if (programsDestination) {
	  const mappedIncompleteRows = mapCsvDataToDbData([incompleteRow], programsDestination);
	  console.log(`Generated ${mappedIncompleteRows.length} program rows from incomplete data`);
	  if (mappedIncompleteRows.length > 0) {
		console.log('First row:', mappedIncompleteRows[0]);
	  }
	}
  }