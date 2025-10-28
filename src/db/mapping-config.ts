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
    studentAdvisors,
    studentAcademicInfo,
    studentCourses,
    studentPrograms,
    nations,
    partOfTerm,
    programs,
    terms,
} from "./schema";

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
    studentAdvisors,
    studentAcademicInfo,
    studentCourses,
    studentPrograms,
    nations,
    partOfTerm,
    programs,
    terms
},
    {
        terms: {
            patterns: [/^terms\.csv$/i],
            config: {
                code: { csvColumnName: "CODE" },
                description: { csvColumnName: "DESCRIPTION" },
            }
        },
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
                suffix: { csvColumnName: "COURSE", transform: (val) => parseCourseCode(val).suffix },
                title: { csvColumnName: "CRSETITLE" },
                hours: { csvColumnName: "CREDITHRS" },
            },
            missingRowResolver: (missingData) => {
                return {
                    subject: missingData[0],
                    number: missingData[1],
                    suffix: missingData[2] || '',
                    title: "Unknown Course",
                    hours: 0,
                };
            }
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
        programs: {
            patterns: [/^major_minor\.csv$/i],
            config: {
                code: { csvColumnName: "CODE" },
                description: { csvColumnName: "DESCRIPTION" },
                cip_code: { csvColumnName: "CIP_CODE" },
                is_major: { csvColumnName: "IS_MAJOR" },
                is_minor: { csvColumnName: "IS_MINOR" },
                has_concentration: { csvColumnName: "HAS_CONCENTRATION" },
                is_discontinued: { csvColumnName: "IS_DISCONTINUED" },
                is_aacsb: { csvColumnName: "IS_AACSB" },
                department_code: { csvColumnName: "DEPARTMENT", transform: (val) => val === 'NULL' ? null : val },
                college_code: { csvColumnName: "COLLEGE", transform: (val) => val === 'NULL' ? null : val },
            },
            missingRowResolver: (missingData) => ({ code: missingData[0], description: "Unknown Program" }),
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
                admit_term_code: { csvColumnName: "ADMITTERM", transform: (val) => val === '' ? null : parseTermCode(val).term },
                admit_year: { csvColumnName: "ADMITTERM", transform: (val) => val === '' ? null : parseTermCode(val).year },
                admit_code: { csvColumnName: "ADMITCODE", transform: (val) => val === '' ? null : val },
                academic_standing_code: { csvColumnName: "ACADSTANDING", transform: (val) => val === '' ? null : val },
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
                course_suffix: { csvColumnName: "_NOT_PROVIDED", transform: () => '' }, // Suffix not provided, default to ''
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
            rowExpander: (row) => {
                const results = [];
                const level = row.LEVL || 'UG'; // Default level if not provided

                // Add Major 1 if present
                if (row.MAJOR1) {
                    results.push({
                        mnumber: row.MNUMBER,
                        term_code: parseTermCode(row.TERM).term,
                        year: parseTermCode(row.TERM).year,
                        type: 'MAJOR',
                        level: level,
                        program_code: row.MAJOR1,
                    });
                }

                // Add Major 2 if present
                if (row.MAJOR2) {
                    results.push({
                        mnumber: row.MNUMBER,
                        term_code: parseTermCode(row.TERM).term,
                        year: parseTermCode(row.TERM).year,
                        type: 'MAJOR',
                        level: level,
                        program_code: row.MAJOR2,
                    });
                }

                // Add Minor 1 if present
                if (row.MINOR1) {
                    results.push({
                        mnumber: row.MNUMBER,
                        term_code: parseTermCode(row.TERM).term,
                        year: parseTermCode(row.TERM).year,
                        type: 'MINOR',
                        level: level,
                        program_code: row.MINOR1,
                    });
                }

                // Add Minor 2 if present
                if (row.MINOR2) {
                    results.push({
                        mnumber: row.MNUMBER,
                        term_code: parseTermCode(row.TERM).term,
                        year: parseTermCode(row.TERM).year,
                        type: 'MINOR',
                        level: level,
                        program_code: row.MINOR2,
                    });
                }

                return results;
            },
        }
    }
);