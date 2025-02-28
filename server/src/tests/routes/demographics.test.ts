// Set NODE_ENV to 'test' for the dbConnection to use an in-memory database for tests.
process.env.NODE_ENV = 'test';

import { describe, beforeEach, test, expect } from 'vitest';
import { dbConnection } from '../../db/connection';
import { importStudents, importAddresses, importAcademicInfo, importPrograms, importAdvisors, importStudentAdvisors } from '../../routes/imports/demographics';
import { students, studentAddresses, studentAcademicInfo, programs, advisors, studentAdvisors } from '../../db/schema';

describe('Demographics Import Tests', () => {
	let orm: any;

	beforeEach(async () => {
		// Create and prepare a new in-memory database for each test
		const db = await dbConnection;
		orm = db.orm;
	});

	test('should import students data', async () => {
		// Define the data to import
		const mappedData = [
			{
				mnumber: '1',
				firstname: 'John',
				lastname: 'Doe',
				middlename: 'Q',
				suffix: 'Jr.',
				gender: 'M',
				birthdate: '01012000',
				citizen: 'Y',
				race: 'White',
				racedesc: 'description',
				residcode: 'residcode',
				residdesc: 'residdesc',
				age: '21',
				cellphone: '1234567890',
				homestreet1: '123 Main St',
				homestreet2: '',
				homecity: 'Anytown',
				homestate: 'MI',
				homezip: '12345',
				homenation: 'USA',
				homephone: '1234567890',
				locstreet1: '123 Main St',
				locstreet2: '',
				loccity: 'Anytown',
				locstate: 'MI',
				loczip: '12345',
				locnation: 'USA',
				locphone: '1234567890',
				admitterm: '202101',
				admitcode: 'admitcode',
				acadstanding: 'string',
				msuatthours: 'string',
				msuearnhours: 'string',
				msuqp: 'string',
				msugpa: 'string',
				overallatthours: 'string',
				overallearnhours: 'string',
				overqp: 'string',
				overgpa: 'string',
				program: 'string',
				levl: 'string',
				major1: 'string',
				major1dept: 'string',
				major1coll: 'string',
				major2: 'string',
				major2dept: 'string',
				major2coll: 'string',
				minor1: 'string',
				minor1dept: 'string',
				minor1coll: 'string',
				minor2: 'string',
				minor2dept: 'string',
				minor2coll: 'string',
				advnumb: 'string',
				advfname: 'string',
				advlname: 'string',
				advmname: 'string',
				advsuffix: 'string',
			}
		];
	});

});