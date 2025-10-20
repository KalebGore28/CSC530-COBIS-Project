import { createCSVConfig } from "../utils/csv-importer";
import { parseTermCode, parseCourseCode } from "../utils/code-parsers";

import {
    admitCodes,
    academicStanding,
    colleges,
    courses,
    departments,
    faculty,
    instructionalMethods,
    instructorCourses,
    registrationStatus,
    roles,
    students,
    studentAddresses,
    studentAdvisors,
    studentAcademicInfo,
    studentCourses,
    studentPrograms,
    nations,
    partOfTerm,
    programs,
    terms,
} from "./schema";

// Function that expands a single demographic row into multiple student program rows
const expandStudentPrograms = (row: Record<string, any>): Record<string, any>[] => {
    const results: Record<string, any>[] = [];

    const level = row.LEVL || 'UG'; // Default level if not provided

    // Add Major 1 if present
    if (row.MAJOR1) {
        results.push({
            MNUMBER: row.MNUMBER,
            TERM: row.TERM,
            TYPE: 'MAJOR',
            LEVL: level,
            PROGRAM: row.MAJOR1,
        });
    }

    // Add Major 2 if present
    if (row.MAJOR2) {
        results.push({
            MNUMBER: row.MNUMBER,
            TERM: row.TERM,
            TYPE: 'MAJOR',
            LEVL: level,
            PROGRAM: row.MAJOR2,
        });
    }

    // Add Minor 1 if present
    if (row.MINOR1) {
        results.push({
            MNUMBER: row.MNUMBER,
            TERM: row.TERM,
            TYPE: 'MINOR',
            LEVL: level,
            PROGRAM: row.MINOR1,
        });
    }

    // Add Minor 2 if present
    if (row.MINOR2) {
        results.push({
            MNUMBER: row.MNUMBER,
            TERM: row.TERM,
            TYPE: 'MINOR',
            LEVL: level,
            PROGRAM: row.MINOR2,
        });
    }

    return results;
};

export const csvConfig = createCSVConfig({
    admitCodes,
    academicStanding,
    colleges,
    courses,
    departments,
    faculty,
    instructionalMethods,
    instructorCourses,
    registrationStatus,
    roles,
    students,
    studentAddresses,
    studentAdvisors,
    studentAcademicInfo,
    studentCourses,
    studentPrograms,
    nations,
    partOfTerm,
    programs,
    terms
});

csvConfig.tables = {
    admitCodes: {
        patterns: [/^admit_codes\.csv$/i],
        config: {
            code: { csvColumnName: "CODE" },
            description: { csvColumnName: "DESCRIPTION" },
        },
    },
    academicStanding: {
        patterns: [/^academic_standing\.csv$/i],
        config: {
            code: { csvColumnName: "CODE" },
            description: { csvColumnName: "DESCRIPTION" },
        },
    },
    colleges: {
        patterns: [/^colleges\.csv$/i],
        config: {
            code: { csvColumnName: "CODE" },
            description: { csvColumnName: "DESCRIPTION" },
        },
    },
    courses: {
        patterns: [/^reg_cuba_catalog_\d{6}_\d{8}\.csv$/i],
        config: {
            subject: { csvColumnName: "COURSE", transform: (val) => parseCourseCode(val).subject },
            number: { csvColumnName: "COURSE", transform: (val) => parseCourseCode(val).number },
            suffix: { csvColumnName: "COURSE", transform: (val) => parseCourseCode(val).suffix, forcedConform: true },
            title: { csvColumnName: "CRSETITLE" },
            hours: { csvColumnName: "CREDITHRS" },
        },
    },
    departments: {
        patterns: [/^departments\.csv$/i],
        config: {
            code: { csvColumnName: "CODE" },
            description: { csvColumnName: "DESCRIPTION" },
            college_code: { csvColumnName: "COLLEGE", transform: (val) => val === 'NULL' ? null : val },
        },
    },
    faculty: {
        patterns: [
            /reg_cuba_courses_during_term_\d+_\d+\.csv$/i,
            /\d+_REG_CUBA_Courses_Grade_Time_Extract_\d+\.csv$/i,
            /reg_cuba_demographic_\d+_\d+\.csv$/i,
            /\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i
        ],
        config: {
            mnumber: { csvColumnName: ["INSTMNUMBER", "ADVNUMB"] },
            first_name: { csvColumnName: ["INSTFIRSTNM", "ADVFNAME"] },
            last_name: { csvColumnName: ["INSTLASTNM", "ADVLNAME"] },
        }
    },
    instructionalMethods: {
        patterns: [/^instructional_methods\.csv$/i],
        config: {
            code: { csvColumnName: "CODE" },
            description: { csvColumnName: "DESCRIPTION" },
        },
    },
    instructorCourses: {
        patterns: [
            /reg_cuba_courses_during_term_\d+_\d+\.csv$/i,
            /\d+_REG_CUBA_Courses_Grade_Time_Extract_\d+\.csv$/i
        ],
        config: {
            mnumber: { csvColumnName: "INSTMNUMBER" },
            term_code: { csvColumnName: "TERM", transform: (val) => parseTermCode(val).term },
            year: { csvColumnName: "TERM", transform: (val) => parseTermCode(val).year },
            course_subject: { csvColumnName: "CRSESUBJ" },
            course_number: { csvColumnName: "CRSENUMB" },
            // course_suffix isn't provided in the CSV, so we force it to default to ''
            course_section: { csvColumnName: "SECTION" },
        }
    },
    registrationStatus: {
        patterns: [/^registration_status\.csv$/i],
        config: {
            code: { csvColumnName: "CODE" },
            description: { csvColumnName: "DESCRIPTION" },
        },
    },
    roles: {
        patterns: [/^roles\.csv$/i],
        config: {
            id: { csvColumnName: "ID" },
            name: { csvColumnName: "ROLE" },
        },
    },
    students: {
        patterns: [
            /reg_cuba_demographic_\d+_\d+\.csv$/i,
            /\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i
        ],
        config: {
            mnumber: { csvColumnName: "MNUMBER" },
            first_name: { csvColumnName: "FIRSTNAME" },
            middle_name: { csvColumnName: "MIDDLENAME" },
            last_name: { csvColumnName: "LASTNAME" },
            suffix: { csvColumnName: "SUFFIX" },
            gender: { csvColumnName: "GENDER" },
            birthdate: { csvColumnName: "BIRTH_DATE" },
            citizenship: { csvColumnName: "CITIZENSHIP" },
            race: { csvColumnName: "RACEDESC" },
            residency: { csvColumnName: "RESIDDESC" },
            cell_phone: { csvColumnName: "CELLPHONE" },
            email: { csvColumnName: "MSUEMAIL" },
        },
    },
    studentAddresses: {
        patterns: [
            /reg_cuba_demographic_\d+_\d+\.csv$/i,
            /\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i
        ],
        config: {
            mnumber: { csvColumnName: "MNUMBER" },
            street1: { csvColumnName: "HOMESTREET1" },
            street2: { csvColumnName: "HOMESTREET2" },
            city: { csvColumnName: "HOMECITY" },
            state: { csvColumnName: "HOMESTATE" },
            zip: { csvColumnName: "HOMEZIP" },
            nation_code: { csvColumnName: "HOMENATION" },
            phone: { csvColumnName: "HOMEPHONE" },
        },
    },
    studentAdvisors: {
        patterns: [
            /reg_cuba_demographic_\d+_\d+\.csv$/i,
            /\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i
        ],
        config: {
            student_mnumber: { csvColumnName: "MNUMBER" },
            term_code: { csvColumnName: "TERM", transform: (val) => parseTermCode(val).term },
            year: { csvColumnName: "TERM", transform: (val) => parseTermCode(val).year },
            advisor_mnumber: { csvColumnName: "ADVNUMB" },
        },
    },
    studentAcademicInfo: {
        patterns: [
            /reg_cuba_demographic_\d+_\d+\.csv$/i,
            /\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i
        ],
        config: {
            mnumber: { csvColumnName: "MNUMBER" },
            term_code: { csvColumnName: "TERM", transform: (val) => parseTermCode(val).term },
            year: { csvColumnName: "TERM", transform: (val) => parseTermCode(val).year },
            admit_term_code: { csvColumnName: "ADMITTERM", transform: (val) => parseTermCode(val).term },
            admit_year: { csvColumnName: "ADMITTERM", transform: (val) => parseTermCode(val).year },
            admit_code: { csvColumnName: "ADMITCODE" },
            academic_standing_code: { csvColumnName: "ACADSTANDING" },
            msu_attempted_hours: { csvColumnName: "MSUATTHOURS" },
            msu_earned_hours: { csvColumnName: "MSUEARNHOURS" },
            msu_quality_points: { csvColumnName: "MSUQP" },
            msu_gpa: { csvColumnName: "MSUGPA" },
            overall_attempted_hours: { csvColumnName: "OVERATTHOURS" },
            overall_earned_hours: { csvColumnName: "OVEREARNHOURS" },
            overall_quality_points: { csvColumnName: "OVERQP" },
            overall_gpa: { csvColumnName: "OVERGPA" },
        }
    },
    studentCourses: {
        patterns: [
            /reg_cuba_courses_during_term_\d+_\d+\.csv$/i,
            /\d+_REG_CUBA_Courses_Grade_Time_Extract_\d+\.csv$/i
        ],
        config: {
            mnumber: { csvColumnName: "MNUMBER" },
            term_code: { csvColumnName: "TERM", transform: (val) => parseTermCode(val).term },
            year: { csvColumnName: "TERM", transform: (val) => parseTermCode(val).year },
            course_subject: { csvColumnName: "CRSESUBJ" },
            course_number: { csvColumnName: "CRSENUMB" },
            // course_suffix isn't provided in the CSV, so we force it to default to ''
            course_hours: { csvColumnName: "CRHRS" },
            course_level: { csvColumnName: "LEVLCODE" },
            course_section: { csvColumnName: "SECTION" },
            registration_status_code: { csvColumnName: "RSTSCODE" },
            instructional_method_code: { csvColumnName: "INSMCODE" },
            part_of_term_code: { csvColumnName: "PARTOFTERM" },
            last_attendance: { csvColumnName: "LASTATTEND", transform: (val) => val === '' ? null : val },
            midterm_grade: { csvColumnName: "MIDGRADE", transform: (val) => val === '' ? null : val },
            final_grade: { csvColumnName: "FINGRADE", transform: (val) => val === '' ? null : val },
        },
    },
    studentPrograms: {
        patterns: [
            /reg_cuba_demographic_\d+_\d+\.csv$/i,
            /\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i
        ],
        config: {
            mnumber: { csvColumnName: "MNUMBER" },
            term_code: { csvColumnName: "TERM", transform: (val) => parseTermCode(val).term },
            year: { csvColumnName: "TERM", transform: (val) => parseTermCode(val).year },
            type: { csvColumnName: "TYPE" },
            level: { csvColumnName: "LEVL" },
            program_code: { csvColumnName: "PROGRAM" },
        },
        rowExpander: expandStudentPrograms,
    },
    nations: {
        patterns: [/^nations\.csv$/i],
        config: {
            code: { csvColumnName: "CODE" },
            description: { csvColumnName: "DESCRIPTION" },
        },
    },
    partOfTerm: {
        patterns: [/^part_of_term\.csv$/i],
        config: {
            code: { csvColumnName: "CODE" },
            description: { csvColumnName: "DESCRIPTION" },
        },
    },
    programs: {
        patterns: [/^major_minor\.csv$/i],
        config: {
            code: { csvColumnName: "CODE" },
            description: { csvColumnName: "DESCRIPTION" },
            cip_code: { csvColumnName: "CIP_CODE" },
            is_major: { csvColumnName: "IS_MAJOR", forcedConform: true },
            is_minor: { csvColumnName: "IS_MINOR", forcedConform: true },
            has_concentration: { csvColumnName: "HAS_CONCENTRATION", forcedConform: true },
            is_discontinued: { csvColumnName: "IS_DISCONTINUED", forcedConform: true },
            is_aacsb: { csvColumnName: "IS_AACSB", forcedConform: true },
            department_code: { csvColumnName: "DEPARTMENT", transform: (val) => val === 'NULL' ? null : val },
            college_code: { csvColumnName: "COLLEGE", transform: (val) => val === 'NULL' ? null : val },
        }
    },
    terms: {
        patterns: [/^terms\.csv$/i],
        config: {
            code: { csvColumnName: "CODE" },
            description: { csvColumnName: "DESCRIPTION" },
        }
    }
};