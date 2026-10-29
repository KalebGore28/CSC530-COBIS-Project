import * as schema from "@/db/schema";
import { makeMySqlCSVConfig } from "../utils/csv-importer";
import {
  parseCourseCode,
  parseTermCode,
  safeParseDate,
  safeParseString,
} from "../utils/code-parsers";
import { getCoursePrefix } from "@/utils/course-prefix-map";

export const csvConfig = makeMySqlCSVConfig(schema, {
  coursePrefixes: {
    mappings: [
      {
        regex: [/^course_prefixes\.csv$/i],
        config: {
          id: { csvColumnName: "PREFIX" },
          department_id: { csvColumnName: "CRSEDEPT" },
          college_id: { csvColumnName: "CRSECOLL" },
        },
      },
    ],
  },
  courses: {
    mappings: [
      {
        regex: [/^reg_cuba_catalog_\d{6}_\d{8}\.csv$/i],
        config: {
          id: { csvColumnName: "COURSE" },
          subject: {
            csvColumnName: "COURSE",
            transform: (val) => parseCourseCode(val).subject,
          },
          number: {
            csvColumnName: "COURSE",
            transform: (val) => parseCourseCode(val).number,
          },
          suffix: {
            csvColumnName: "COURSE",
            transform: (val) => parseCourseCode(val).suffix,
          },
          title: { csvColumnName: "CRSETITLE" },
          hours: { csvColumnName: "CREDITHRS" },
          department_id: {
            csvColumnName: "COURSE",
            transform: async (val) =>
              (await getCoursePrefix(parseCourseCode(val).subject)).department_id || undefined,
          },
          college_id: {
            csvColumnName: "COURSE",
            transform: async (val) =>
              (await getCoursePrefix(parseCourseCode(val).subject)).college_id || undefined,
          },
        },
      },
    ],
    missingRowResolver: (missingData) => ({
      id: missingData.id,
      subject: parseCourseCode(missingData.id).subject,
      number: parseCourseCode(missingData.id).number,
      suffix: parseCourseCode(missingData.id).suffix,
      title: "unknown",
      hours: 0,
    }),
  },
  faculty: {
    mappings: [
      {
        regex: [/reg_cuba_courses_during_term_\d+_\d+\.csv$/i],
        config: {
          mnumber: {
            csvColumnName: "INSTMNUMBER",
          },
          first_name: {
            csvColumnName: "INSTFIRSTNM",
          },
          last_name: {
            csvColumnName: "INSTLASTNM",
          },
        },
      },
      {
        regex: [/\d+_REG_CUBA_Courses_Grade_Time_Extract_\d+\.csv$/i],
        config: {
          mnumber: {
            csvColumnName: "INSTMNUMBER",
          },
          first_name: {
            csvColumnName: "INSTFIRSTNM",
          },
          last_name: {
            csvColumnName: "INSTLASTNM",
          },
        },
      },
      {
        regex: [/reg_cuba_demographic_\d+_\d+\.csv$/i],
        config: {
          mnumber: {
            csvColumnName: "ADVNUMB",
          },
          first_name: {
            csvColumnName: "ADVFNAME",
          },
          last_name: {
            csvColumnName: "ADVLNAME",
          },
        },
      },
      {
        regex: [/\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i],
        config: {
          mnumber: {
            csvColumnName: "ADVNUMB",
          },
          first_name: {
            csvColumnName: "ADVFNAME",
          },
          last_name: {
            csvColumnName: "ADVLNAME",
          },
        },
      },
    ],
  },
  programs: {
    mappings: [
      {
        regex: [/^major_minor\.csv$/i],
        config: {
          id: {
            csvColumnName: "CODE",
            transform: undefined,
          },
          description: {
            csvColumnName: "DESCRIPTION",
            transform: undefined,
          },
          cip_code: { csvColumnName: "CIP_CODE" },
          is_major: { csvColumnName: "IS_MAJOR" },
          is_minor: { csvColumnName: "IS_MINOR" },
          has_concentration: {
            csvColumnName: "HAS_CONCENTRATION",
          },
          is_discontinued: { csvColumnName: "IS_DISCONTINUED" },
          is_aacsb: { csvColumnName: "IS_AACSB" },
          department_id: {
            csvColumnName: "DEPARTMENT",
            transform: (val) =>
              safeParseString(val, {
                emptyAsUndefined: true,
                nullStringAsUndefined: true,
              }),
          },
          college_id: {
            csvColumnName: "COLLEGE",
            transform: (val) =>
              safeParseString(val, {
                emptyAsUndefined: true,
                nullStringAsUndefined: true,
              }),
          },
        },
      },
    ],
    missingRowResolver: (missingData) => ({
      id: missingData.id,
      description: "unknown",
      is_major: false,
      is_minor: false,
      has_concentration: false,
      is_aacsb: false,
      is_discontinued: false,
    }),
  },
  students: {
    mappings: [
      {
        regex: [/reg_cuba_demographic_\d+_\d+\.csv$/i],
        config: {
          mnumber: { csvColumnName: "MNUMBER" },
          first_name: { csvColumnName: "FIRSTNAME" },
          middle_name: { csvColumnName: "MIDDLENAME" },
          last_name: { csvColumnName: "LASTNAME" },
          suffix: { csvColumnName: "SUFFIX" },
          gender: { csvColumnName: "GENDER" },
          email: { csvColumnName: "MSUEMAIL" },
        },
      },
      {
        regex: [/\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i],
        config: {
          mnumber: { csvColumnName: "MNUMBER" },
          first_name: { csvColumnName: "FIRSTNAME" },
          middle_name: { csvColumnName: "MIDDLENAME" },
          last_name: { csvColumnName: "LASTNAME" },
          suffix: { csvColumnName: "SUFFIX" },
          gender: { csvColumnName: "GENDER" },
          email: { csvColumnName: "MSUEMAIL" },
        },
      },
    ],
  },
  studentAcademicInfo: {
    mappings: [
      {
        regex: [/reg_cuba_demographic_\d+_\d+\.csv$/i],
        config: {
          mnumber: { csvColumnName: "MNUMBER" },
          term_id: {
            csvColumnName: "TERM",
            transform: (val) => parseTermCode(val).term,
          },
          year: {
            csvColumnName: "TERM",
            transform: (val) => parseTermCode(val).year,
          },
          admit_term_id: {
            csvColumnName: "ADMITTERM",
            transform: (val) =>
              safeParseString(
                val,
                {
                  emptyAsUndefined: true,
                  nullStringAsUndefined: true,
                },
                (val) => parseTermCode(val).term,
              ),
          },
          admit_year: {
            csvColumnName: "ADMITTERM",
            transform: (val) =>
              safeParseString(
                val,
                {
                  emptyAsUndefined: true,
                  nullStringAsUndefined: true,
                },
                (val) => parseTermCode(val).year,
              ),
          },
          admit_id: {
            csvColumnName: "ADMITCODE",
            transform: (val) =>
              safeParseString(val, {
                emptyAsUndefined: true,
                nullStringAsUndefined: true,
              }),
          },
          academic_standing_id: {
            csvColumnName: "ACADSTANDING",
            transform: (val) =>
              safeParseString(val, {
                emptyAsUndefined: true,
                nullStringAsUndefined: true,
              }),
          },
          msu_attempted_hours: { csvColumnName: "MSUATTHOURS" },
          msu_earned_hours: { csvColumnName: "MSUEARNHOURS" },
          msu_quality_points: { csvColumnName: "MSUQP" },
          msu_gpa: { csvColumnName: "MSUGPA" },
          overall_attempted_hours: {
            csvColumnName: "OVERATTHOURS",
          },
          overall_earned_hours: {
            csvColumnName: "OVEREARNHOURS",
          },
          overall_quality_points: { csvColumnName: "OVERQP" },
          overall_gpa: { csvColumnName: "OVERGPA" },
        },
      },
      {
        regex: [/\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i],
        config: {
          mnumber: { csvColumnName: "MNUMBER" },
          term_id: {
            csvColumnName: "TERM",
            transform: (val) => parseTermCode(val).term,
          },
          year: {
            csvColumnName: "TERM",
            transform: (val) => parseTermCode(val).year,
          },
          admit_term_id: {
            csvColumnName: "ADMITTERM",
            transform: (val) =>
              safeParseString(
                val,
                {
                  emptyAsUndefined: true,
                  nullStringAsUndefined: true,
                },
                (val) => parseTermCode(val).term,
              ),
          },
          admit_year: {
            csvColumnName: "ADMITTERM",
            transform: (val) =>
              safeParseString(
                val,
                {
                  emptyAsUndefined: true,
                  nullStringAsUndefined: true,
                },
                (val) => parseTermCode(val).year,
              ),
          },
          admit_id: {
            csvColumnName: "ADMITCODE",
            transform: (val) =>
              safeParseString(val, {
                emptyAsUndefined: true,
                nullStringAsUndefined: true,
              }),
          },
          academic_standing_id: {
            csvColumnName: "ACADSTANDING",
            transform: (val) =>
              safeParseString(val, {
                emptyAsUndefined: true,
                nullStringAsUndefined: true,
              }),
          },
          msu_attempted_hours: { csvColumnName: "MSUATTHOURS" },
          msu_earned_hours: { csvColumnName: "MSUEARNHOURS" },
          msu_quality_points: { csvColumnName: "MSUQP" },
          msu_gpa: { csvColumnName: "MSUGPA" },
          overall_attempted_hours: {
            csvColumnName: "OVERATTHOURS",
          },
          overall_earned_hours: {
            csvColumnName: "OVEREARNHOURS",
          },
          overall_quality_points: { csvColumnName: "OVERQP" },
          overall_gpa: { csvColumnName: "OVERGPA" },
        },
      },
    ],
  },
  studentAdvisors: {
    mappings: [
      {
        regex: [/reg_cuba_demographic_\d+_\d+\.csv$/i],
        config: {
          mnumber: { csvColumnName: "MNUMBER" },
          term_id: {
            csvColumnName: "TERM",
            transform: (val) => parseTermCode(val).term,
          },
          year: {
            csvColumnName: "TERM",
            transform: (val) => parseTermCode(val).year,
          },
          advisor_mnumber: { csvColumnName: "ADVNUMB" },
        },
      },
      {
        regex: [/\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i],
        config: {
          mnumber: { csvColumnName: "MNUMBER" },
          term_id: {
            csvColumnName: "TERM",
            transform: (val) => parseTermCode(val).term,
          },
          year: {
            csvColumnName: "TERM",
            transform: (val) => parseTermCode(val).year,
          },
          advisor_mnumber: { csvColumnName: "ADVNUMB" },
        },
      },
    ],
  },
  studentCourses: {
    mappings: [
      {
        regex: [/reg_cuba_courses_during_term_\d+_\d+\.csv$/i],
        rowExpander: (row) => {
          return [
            {
              mnumber: row.MNUMBER,
              term_id: parseTermCode(row.TERM).term,
              year: parseTermCode(row.TERM).year,
              course_id: `${row.CRSESUBJ}${row.CRSENUMB}`,
              course_hours: parseInt(row.CRHRS, 10) || 0,
              course_section: row.SECTION,
              registration_status_id: row.RSTSCODE,
              instructional_method_id: row.INSMCODE,
              part_of_term_id: row.PARTOFTERM,
              instructor_mnumber: row.INSTMNUMBER,
              last_attendance: safeParseDate(row.LASTATTEND),
              midterm_grade: safeParseString(row.MIDGRADE, {
                emptyAsUndefined: true,
              }),
              final_grade: safeParseString(row.FINGRADE, {
                emptyAsUndefined: true,
              }),
            },
          ];
        },
      },
      {
        regex: [/\d+_REG_CUBA_Courses_Grade_Time_Extract_\d+\.csv$/i],
        rowExpander: (row) => {
          return [
            {
              mnumber: row.MNUMBER,
              term_id: parseTermCode(row.TERM).term,
              year: parseTermCode(row.TERM).year,
              course_id: `${row.CRSESUBJ}${row.CRSENUMB}`,
              course_hours: parseInt(row.CRHRS, 10) || 0,
              course_section: row.SECTION,
              registration_status_id: row.RSTSCODE,
              instructional_method_id: row.INSMCODE,
              part_of_term_id: row.PARTOFTERM,
              instructor_mnumber: row.INSTMNUMBER,
              last_attendance: safeParseDate(row.LASTATTEND),
              midterm_grade: safeParseString(row.MIDGRADE, {
                emptyAsUndefined: true,
              }),
              final_grade: safeParseString(row.FINGRADE, {
                emptyAsUndefined: true,
              }),
            },
          ];
        },
      },
    ],
  },
  studentPrograms: {
    mappings: [
      {
        regex: [/reg_cuba_demographic_\d+_\d+\.csv$/i],
        rowExpander: (row) => {
          const results = [];
          const level = row.LEVL || "UG"; // Default level if not provided

          // Add Major 1 if present
          if (row.MAJOR1) {
            results.push({
              mnumber: row.MNUMBER,
              term_id: parseTermCode(row.TERM).term,
              year: parseTermCode(row.TERM).year,
              type: "MAJOR",
              level: level,
              program_id: row.MAJOR1,
            });
          }

          // Add Major 2 if present
          if (row.MAJOR2) {
            results.push({
              mnumber: row.MNUMBER,
              term_id: parseTermCode(row.TERM).term,
              year: parseTermCode(row.TERM).year,
              type: "MAJOR",
              level: level,
              program_id: row.MAJOR2,
            });
          }

          // Add Minor 1 if present
          if (row.MINOR1) {
            results.push({
              mnumber: row.MNUMBER,
              term_id: parseTermCode(row.TERM).term,
              year: parseTermCode(row.TERM).year,
              type: "MINOR",
              level: level,
              program_id: row.MINOR1,
            });
          }

          // Add Minor 2 if present
          if (row.MINOR2) {
            results.push({
              mnumber: row.MNUMBER,
              term_id: parseTermCode(row.TERM).term,
              year: parseTermCode(row.TERM).year,
              type: "MINOR",
              level: level,
              program_id: row.MINOR2,
            });
          }

          return results;
        },
      },
      {
        regex: [/\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i],
        rowExpander: (row) => {
          const results = [];
          const level = row.LEVL || "UG"; // Default level if not provided

          // Add Major 1 if present
          if (row.MAJOR1) {
            results.push({
              mnumber: row.MNUMBER,
              term_id: parseTermCode(row.TERM).term,
              year: parseTermCode(row.TERM).year,
              type: "MAJOR",
              level: level,
              program_id: row.MAJOR1,
            });
          }

          // Add Major 2 if present
          if (row.MAJOR2) {
            results.push({
              mnumber: row.MNUMBER,
              term_id: parseTermCode(row.TERM).term,
              year: parseTermCode(row.TERM).year,
              type: "MAJOR",
              level: level,
              program_id: row.MAJOR2,
            });
          }

          // Add Minor 1 if present
          if (row.MINOR1) {
            results.push({
              mnumber: row.MNUMBER,
              term_id: parseTermCode(row.TERM).term,
              year: parseTermCode(row.TERM).year,
              type: "MINOR",
              level: level,
              program_id: row.MINOR1,
            });
          }

          // Add Minor 2 if present
          if (row.MINOR2) {
            results.push({
              mnumber: row.MNUMBER,
              term_id: parseTermCode(row.TERM).term,
              year: parseTermCode(row.TERM).year,
              type: "MINOR",
              level: level,
              program_id: row.MINOR2,
            });
          }

          return results;
        },
      },
    ],
  },
  // Tables that will only have resolvers:
  academicStanding: {
    mappings: [],
    missingRowResolver: (missingData) => ({
      id: missingData.id,
      description: "unknown",
    }),
  },
  admitCodes: {
    mappings: [],
    missingRowResolver: (missingData) => ({
      id: missingData.id,
      description: "unknown",
    }),
  },
  colleges: {
    mappings: [],
    missingRowResolver: (missingData) => ({
      id: missingData.id,
      description: "unknown",
    }),
  },
  departments: {
    mappings: [],
    missingRowResolver: (missingData) => ({
      id: missingData.id,
      description: "unknown",
    }),
  },
  instructionalMethods: {
    mappings: [],
    missingRowResolver: (missingData) => ({
      id: missingData.id,
      description: "unknown",
    }),
  },
  partOfTerm: {
    mappings: [],
    missingRowResolver: (missingData) => ({
      id: missingData.id,
      description: "unknown",
    }),
  },
  registrationStatus: {
    mappings: [],
    missingRowResolver: (missingData) => ({
      id: missingData.id,
      description: "unknown",
    }),
  },
  // Tables that will have no mappings or resolvers:
  account: {
    mappings: [],
  },
  user: {
    mappings: [],
  },
  session: {
    mappings: [],
  },
  verification: {
    mappings: [],
  },
  terms: {
    mappings: [],
  },
  roles: {
    mappings: [],
  },
  userRoles: {
    mappings: [],
  },
  importJobs: {
    mappings: [],
  },
});
