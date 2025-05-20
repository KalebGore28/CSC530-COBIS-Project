/*
 * This file is to share types between the server and client.
 * It contains the types used in the database.
 * Not sure if this is the best way to do it, but it works for what i need.
 * Sure, i could just import the types within the app package, but i liked
 * the idea of having a separate package for types. Also when you use
 * Go to Definition on the type, it takes you to the database table
 * model definition, which is nice.
*/
import type {
	AcademicStanding,
	AdmitCode,
	User,
	Account,
	Session,
	Verification,
	College,
	Department,
	Faculty,
	InstructionalMethod,
	InstructorCourse,
	Nation,
	PartOfTerm,
	Program,
	RegistrationStatus,
	Role,
	StudentAcademicInfo,
	StudentAddress,
	StudentAdvisor,
	StudentCourse,
	StudentProgram,
	Student,
	Term,
	UserRole
} from "../../server/src/db/schema";

export type {
	AcademicStanding,
	AdmitCode,
	User,
	Account,
	Session,
	Verification,
	College,
	Department,
	Faculty,
	InstructionalMethod,
	InstructorCourse,
	Nation,
	PartOfTerm,
	Program,
	RegistrationStatus,
	Role,
	StudentAcademicInfo,
	StudentAddress,
	StudentAdvisor,
	StudentCourse,
	StudentProgram,
	Student,
	Term,
	UserRole
};