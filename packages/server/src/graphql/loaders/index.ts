import type { DbConnection } from '../../db/connection';
import { createTermLoader } from './termLoader';
import { createAddressesLoader } from './addressLoader';
import { createAdvisorLoader } from './advisorLoader';
import { createStudentProgramLoader } from './studentProgramLoader';
import { createNationsLoader } from './nationLoader';
import { createProgramLoader } from './programLoader';
import { createCollegeLoader } from './collegeLoader';
import { createDepartmentLoader } from './departmentLoader';
import { createPartOfTermLoader } from './partOfTermLoader';
import { createRegistrationStatusLoader } from './registrationStatusLoader';
import { createInstructionalMethodLoader } from './instructionalMethodLoader';
import { createStudentLoader } from './studentLoader';
import { createCourseLoader } from './courseLoader';

export function createLoaders(db: DbConnection['orm']) {
	return {
		term: createTermLoader(db),
		address: createAddressesLoader(db),
		advisor: createAdvisorLoader(db),
		studentProgram: createStudentProgramLoader(db),
		program: createProgramLoader(db),
		nation: createNationsLoader(db),
		college: createCollegeLoader(db),
		department: createDepartmentLoader(db),
		partOfTerm: createPartOfTermLoader(db),
		registrationStatus: createRegistrationStatusLoader(db),
		instructionalMethod: createInstructionalMethodLoader(db),
		student: createStudentLoader(db),
		course: createCourseLoader(db),
	};
}

export type Loaders = ReturnType<typeof createLoaders>;