// test-column-mapping.ts
import { 
	findMappingsForFilename, 
	mapCsvRowToDbRow,
	getAllFileMappings
  } from './columnMappingService';
  
  // Sample test
  const filename = 'reg_cuba_test_scores_2023_04.csv';
  const mapping = findMappingsForFilename(filename);
  
  console.log('File mapping found:', mapping ? true : false);
  if (mapping) {
	console.log('Description:', mapping.description);
	console.log('Destinations:', mapping.destinations.map(d => d.tableName).join(', '));
	
	// Test row mapping
	const sampleRow = {
	  mnumber: 'M12345678',
	  testcode: 'ACT',
	  testdesc: 'ACT Test',
	  testscore: '28',
	  testdate: '03152023'
	};
	
	const mappedRow = mapCsvRowToDbRow(sampleRow, mapping.destinations[0]);
	console.log('Mapped row:', mappedRow);
  }