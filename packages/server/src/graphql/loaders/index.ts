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
import {
	createAcademicInfoLoader,
	createAcademicInfoByTermLoader,
	createAcademicInfoByYearLoader,
	createAcademicInfoByYearAndTermLoader
} from './academicInfoLoader';
import { createAdmitCodeLoader } from './admitCodeLoader';
import { createAcademicStandingLoader } from './academicStandingLoader';
import { createFacultyLoader } from './facultyLoader';
import { createStudentsByCourseLoader } from './studentsByCourseLoader';
import { createTotalStudentsByCourseLoader } from './totalStudentsByCourseLoader';
import { createTotalCreditHoursByCourseLoader } from './totalCreditHoursByCourseLoader';
import { createCreditHourByCourseLoader } from './creditHourByCourseLoader';
import { createClassGpaByCourseLoader } from './classGpaByCourseLoader';
import { createMidtermAverageByCourseLoader } from './midtermAverageByCourseLoader';
import { createFinalAverageByCourseLoader } from './finalAverageByCourseLoader';

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
		admitCode: createAdmitCodeLoader(db),
		academicStanding: createAcademicStandingLoader(db),
		faculty: createFacultyLoader(db),
		
		// Loaders for academic info
		academicInfo: createAcademicInfoLoader(db),
		academicInfoByTerm: createAcademicInfoByTermLoader(db),
		academicInfoByYear: createAcademicInfoByYearLoader(db),
		academicInfoByYearAndTerm: createAcademicInfoByYearAndTermLoader(db),
		
		// Loaders for course-related data
		studentsByCourse: createStudentsByCourseLoader(db),
		totalStudentsByCourse: createTotalStudentsByCourseLoader(db),
		totalCreditHoursByCourse: createTotalCreditHoursByCourseLoader(db),
		creditHourByCourse: createCreditHourByCourseLoader(db),
		classGpaByCourse: createClassGpaByCourseLoader(db),
		midtermAverageByCourse: createMidtermAverageByCourseLoader(db),
		finalAverageByCourse: createFinalAverageByCourseLoader(db),
	};
}

export type Loaders = ReturnType<typeof createLoaders>;