import { FEMALE_FIRST_NAMES, LAST_NAMES, MALE_FIRST_NAMES, SUFFIXES } from "./names";
import { chance, clamp, normal, pick, pickWeighted, random, randomInt, shuffled } from "./random";
import { isMainTerm, termDates, termKey } from "./terms";
import { BUSINESS_FACULTY_COUNTS, GEN_ED_FACULTY_COUNTS } from "./faculty";
import type { Course, Program } from "./catalog";
import type { Faculty } from "./faculty";
import type { Term } from "./terms";
import type {
  studentAcademicInfo,
  studentAdvisors,
  studentCourses,
  studentPrograms,
  students,
} from "@/db/schema";

/**
 * Simulates College of Business students term by term. Each student is admitted, takes courses
 * that fit their class level and major, gets grades that follow their ability, and either
 * graduates or leaves. Everything else is worked out from that history, so the numbers agree
 * with each other: GPA and hours come from the grades, standing from the GPA, class level from
 * the hours, and advisors from the major's department.
 *
 * The simulation starts a few years before the first term it writes out, so the first visible
 * term already has sophomores, juniors and seniors with a history behind them.
 */

// The programs table doesn't say which programs are graduate ones, so these are a best guess
// (the MBA, accountancy, cybersecurity management and organizational communication masters).
const GRADUATE_PROGRAMS = ["B051", "A005", "C170", "O141"];
const UNDECLARED_PROGRAM = "U086";

// How big a section gets before another one opens
const BUSINESS_SECTION_SIZE = 35;
const GRADUATE_SECTION_SIZE = 25;
// General education sections only show the Business students in them, so they look small
const GEN_ED_SECTION_SIZE = 20;

const HOURS_TO_GRADUATE = 120;
const GRADUATE_HOURS_TO_GRADUATE = 30;

const GRADE_POINTS: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, E: 0 };
const GOOD_STANDINGS = ["0", "GS", "DL"];

export type StudentRow = typeof students.$inferInsert;
export type StudentCourseRow = typeof studentCourses.$inferInsert;
export type AcademicInfoRow = typeof studentAcademicInfo.$inferInsert;
export type StudentProgramRow = typeof studentPrograms.$inferInsert;
export type AdvisorRow = typeof studentAdvisors.$inferInsert;

type Level = "UG" | "GR";

type CourseOption = {
  id: string;
  hours: number;
  // 1 for 100-level up to 4 for 400-level, 6 for graduate courses
  level: number;
  department: string;
  popularity: number;
  // How much easier (positive) or harder (negative) the course grades than average
  difficulty: number;
  // Core courses run every fall and spring
  core: boolean;
};

type Totals = { attempted: number; earned: number; points: number };

type Student = {
  row: StudentRow;
  level: Level;
  ability: number;
  admitTerm: Term;
  admitCode: string;
  majors: Array<string>;
  minor: string | null;
  advisor: string;
  transfer: Totals;
  msu: Totals;
  passed: Set<string>;
  standing: string;
  mainTermsAttended: number;
  // Main terms left to sit out after a suspension
  sitOut: number;
  // Undeclared students pick a major after this many main terms
  declareAfter: number | null;
  partTime: boolean;
  gone: boolean;
  // Set once a student who's gone has been taken off their advisor's list
  finished: boolean;
  visible: boolean;
};

type Section = {
  section: string;
  method: string;
  partOfTerm: string;
  instructor: string;
  seats: number;
  size: number;
};

export type Simulation = {
  students: Array<StudentRow>;
  studentCourses: Array<StudentCourseRow>;
  academicInfo: Array<AcademicInfoRow>;
  studentPrograms: Array<StudentProgramRow>;
  advisors: Array<AdvisorRow>;
};

export function simulateStudents(input: {
  terms: Array<Term>;
  firstVisibleTerm: { year: number; term_id: string };
  courses: Array<Course>;
  programs: Array<Program>;
  faculty: Array<Faculty>;
}): Simulation {
  const businessDepartments = Object.keys(BUSINESS_FACULTY_COUNTS);
  const genEdDepartments = Object.keys(GEN_ED_FACULTY_COUNTS);
  const currentTerm = input.terms[input.terms.length - 1];
  const firstVisibleKey = termKey(input.firstVisibleTerm);

  // ----- Courses each department offers -----

  const undergraduateCourses = new Map<string, Array<CourseOption>>();
  const graduateCourses = new Map<string, Array<CourseOption>>();
  for (const department of [...businessDepartments, ...genEdDepartments]) {
    const isGenEd = genEdDepartments.includes(department);
    const inDepartment = input.courses.filter((course) => course.department_id === department);

    const undergraduate = inDepartment.filter((course) =>
      isGenEd
        ? course.number >= 100 && course.number < 300 && course.hours === 3
        : course.number >= 100 && course.number < 500 && course.hours >= 1 && course.hours <= 4,
    );
    undergraduateCourses.set(department, toCourseOptions(undergraduate, department));

    if (!isGenEd) {
      const graduate = inDepartment.filter((course) => course.number >= 600 && course.hours === 3);
      graduateCourses.set(department, toCourseOptions(graduate, department));
    }
  }

  // Which courses run in a term, decided once per term
  const offeredByTerm = new Map<string, Map<string, Array<CourseOption>>>();
  function offeredCourses(term: Term, department: string, level: Level) {
    const key = `${termKey(term)}|${level}`;
    let offered = offeredByTerm.get(key);
    if (!offered) {
      offered = new Map();
      const catalog = level === "UG" ? undergraduateCourses : graduateCourses;
      for (const [dept, options] of catalog) {
        offered.set(
          dept,
          // Business students mostly take the same few general education courses
          genEdDepartments.includes(dept)
            ? options.filter((option) => option.core && isOffered(option, term, level))
            : options.filter((option) => isOffered(option, term, level)),
        );
      }
      offeredByTerm.set(key, offered);
    }
    return offered.get(department) ?? [];
  }

  // ----- Programs -----

  const programById = new Map(input.programs.map((program) => [program.id, program]));
  const graduatePrograms = GRADUATE_PROGRAMS.filter((id) => programById.has(id));
  const businessPrograms = input.programs.filter(
    (program) =>
      program.college_id === "BP" && !program.is_discontinued && programDepartment(program),
  );
  const majorOptions = businessPrograms.filter(
    (program) =>
      program.is_major &&
      !graduatePrograms.includes(program.id) &&
      program.id !== UNDECLARED_PROGRAM &&
      !program.description.startsWith("Certificate"),
  );
  // Some majors are much more popular than others
  const majorWeights = majorOptions.map(() => Math.exp(normal(0, 0.9)));
  const minorOptions = businessPrograms.filter((program) => program.is_minor);

  function programDepartment(program: Program | undefined) {
    // BPA is the college's general Business department, which has no faculty of its own
    const department = program?.department_id === "BPA" ? "MMB" : program?.department_id;
    return department && businessDepartments.includes(department) ? department : null;
  }

  function majorDepartment(student: Student) {
    return programDepartment(programById.get(student.majors[0])) ?? "MMB";
  }

  function pickMajor(except: Array<string> = []) {
    const options = majorOptions.filter((program) => !except.includes(program.id));
    const weights = majorOptions
      .map((program, i) => (except.includes(program.id) ? -1 : majorWeights[i]))
      .filter((weight) => weight >= 0);
    return pickWeighted(options, weights).id;
  }

  // ----- Faculty -----

  const facultyByDepartment = new Map<string, Array<string>>();
  for (const member of input.faculty) {
    const list = facultyByDepartment.get(member.department_id ?? "") ?? [];
    list.push(member.mnumber);
    facultyByDepartment.set(member.department_id ?? "", list);
  }

  const adviseeCounts = new Map<string, number>();
  function assignAdvisor(department: string) {
    // One of the three advisors in the department with the fewest advisees
    const members = shuffled(facultyByDepartment.get(department) ?? []);
    members.sort((a, b) => (adviseeCounts.get(a) ?? 0) - (adviseeCounts.get(b) ?? 0));
    const advisor = pick(members.slice(0, 3));
    adviseeCounts.set(advisor, (adviseeCounts.get(advisor) ?? 0) + 1);
    return advisor;
  }
  function releaseAdvisor(advisor: string) {
    adviseeCounts.set(advisor, (adviseeCounts.get(advisor) ?? 1) - 1);
  }

  const teachingLoads = new Map<string, number>();
  function assignInstructor(term: Term, department: string) {
    const members = shuffled(facultyByDepartment.get(department) ?? []);
    const load = (mnumber: string) => teachingLoads.get(`${termKey(term)}|${mnumber}`) ?? 0;
    members.sort((a, b) => load(a) - load(b));
    const instructor = members[0];
    teachingLoads.set(`${termKey(term)}|${instructor}`, load(instructor) + 1);
    return instructor;
  }

  // ----- Sections -----

  const sectionsByCourse = new Map<string, Array<Section>>();
  function takeSeat(term: Term, option: CourseOption, level: Level) {
    const key = `${termKey(term)}|${option.id}`;
    const sections = sectionsByCourse.get(key) ?? [];
    sectionsByCourse.set(key, sections);

    const open = sections.filter((section) => section.seats < section.size);
    if (open.length > 0) {
      const section = pick(open);
      section.seats++;
      return section;
    }

    const size =
      level === "GR"
        ? GRADUATE_SECTION_SIZE
        : genEdDepartments.includes(option.department)
          ? GEN_ED_SECTION_SIZE
          : BUSINESS_SECTION_SIZE;
    const section: Section = {
      section: String(sections.length + 1).padStart(2, "0"),
      method: sectionMethod(term, level),
      partOfTerm: sectionPartOfTerm(term),
      instructor: assignInstructor(term, option.department),
      seats: 1,
      size,
    };
    sections.push(section);
    return section;
  }

  // ----- Admissions -----

  const usedMnumbers = new Set<string>();
  const roster: Array<Student> = [];

  function admit(term: Term, kind: "freshman" | "transfer" | "graduate") {
    let mnumber: string;
    do {
      mnumber = `M${randomInt(30_000_000, 39_999_999)}`;
    } while (usedMnumbers.has(mnumber));
    usedMnumbers.add(mnumber);

    const level: Level = kind === "graduate" ? "GR" : "UG";
    const admitCode =
      kind === "freshman"
        ? pickWeighted(["UC", "CD", "PV", "IU", "RT"], [78, 9, 5, 6, 2])
        : kind === "transfer"
          ? pickWeighted(["UC", "IU", "CD"], [90, 5, 5])
          : pickWeighted(["G1", "IG", "GU", "GM"], [70, 12, 10, 8]);
    const conditional = ["CD", "PV", "RT"].includes(admitCode);

    const ability =
      level === "GR"
        ? clamp(normal(3.35, 0.4), 1.8, 4.2)
        : clamp(normal(conditional ? 2.7 : 3.05, 0.62), 0.6, 4.3);

    // Transfers bring a few semesters of hours, and some freshmen bring dual credit
    const transfer: Totals = { attempted: 0, earned: 0, points: 0 };
    const transferHours =
      kind === "transfer"
        ? randomInt(5, 21) * 3
        : kind === "freshman" && chance(0.2)
          ? randomInt(2, 5) * 3
          : 0;
    if (transferHours > 0) {
      const transferGpa = clamp(normal(3.0, 0.45), 2.0, 4.0);
      transfer.attempted = transferHours;
      transfer.earned = transferHours - (chance(0.3) ? 3 : 0);
      transfer.points = round2(transferGpa * transferHours);
    }

    let majors: Array<string>;
    let declareAfter: number | null = null;
    if (level === "GR") {
      majors = [pick(graduatePrograms)];
    } else if (kind === "freshman" && chance(0.15)) {
      majors = [UNDECLARED_PROGRAM];
      declareAfter = randomInt(2, 3);
    } else {
      majors = [pickMajor()];
      if (chance(0.04)) majors.push(pickMajor(majors));
    }

    const student: Student = {
      row: makeIdentity(mnumber),
      level,
      ability,
      admitTerm: term,
      admitCode,
      majors,
      minor: null,
      advisor: "",
      transfer,
      msu: { attempted: 0, earned: 0, points: 0 },
      passed: new Set(),
      standing: "GS",
      mainTermsAttended: 0,
      sitOut: 0,
      declareAfter,
      partTime: level === "UG" ? chance(0.07) : chance(0.35),
      gone: false,
      finished: false,
      visible: false,
    };
    student.advisor = assignAdvisor(majorDepartment(student));
    roster.push(student);
  }

  function admitCohort(term: Term) {
    const counts =
      term.kind === "fall"
        ? {
            freshman: randomInt(340, 400),
            transfer: randomInt(55, 80),
            graduate: randomInt(45, 60),
          }
        : term.kind === "spring"
          ? {
              freshman: randomInt(30, 45),
              transfer: randomInt(35, 50),
              graduate: randomInt(20, 30),
            }
          : term.kind === "summer"
            ? { freshman: 0, transfer: 0, graduate: randomInt(8, 14) }
            : { freshman: 0, transfer: 0, graduate: 0 };
    for (let i = 0; i < counts.freshman; i++) admit(term, "freshman");
    for (let i = 0; i < counts.transfer; i++) admit(term, "transfer");
    for (let i = 0; i < counts.graduate; i++) admit(term, "graduate");
  }

  // ----- Picking courses -----

  function overallEarned(student: Student) {
    return student.msu.earned + student.transfer.earned;
  }

  function targetHours(student: Student, term: Term) {
    if (student.level === "GR") {
      if (term.kind === "summer") return pick([3, 6]);
      return student.partTime ? pick([3, 6]) : pick([6, 9, 9, 12]);
    }
    if (term.kind === "summer") return pick([3, 3, 6]);
    if (term.kind === "winter") return 3;
    const hours = student.partTime
      ? pick([6, 9])
      : pickWeighted([12, 13, 15, 16, 18], [15, 10, 45, 20, 10]);
    // Seniors only take what they still need
    const remaining = HOURS_TO_GRADUATE - overallEarned(student);
    return remaining > 0 && remaining < hours ? Math.max(3, remaining) : hours;
  }

  function pickCourses(student: Student, term: Term) {
    const target = targetHours(student, term);
    const chosen: Array<CourseOption> = [];
    const chosenIds = new Set<string>();
    let hours = 0;
    const home = majorDepartment(student);
    const earned = overallEarned(student);
    const desiredLevel = clamp(1 + Math.floor(earned / 30), 1, 4);

    for (let attempt = 0; attempt < 80 && hours < target; attempt++) {
      let department: string;
      if (student.level === "GR") {
        department = chance(0.65) ? home : pick(businessDepartments.filter((d) => d !== home));
      } else {
        const weights = earned < 30 ? [30, 20, 50] : earned < 60 ? [40, 30, 30] : [60, 30, 10];
        const pool = pickWeighted(["home", "business", "genEd"], weights);
        department =
          pool === "home"
            ? home
            : pool === "business"
              ? pick(businessDepartments.filter((d) => d !== home))
              : pick(genEdDepartments);
      }

      const options = offeredCourses(term, department, student.level).filter(
        (option) =>
          !student.passed.has(option.id) &&
          !chosenIds.has(option.id) &&
          hours + option.hours <= target + 1,
      );
      if (options.length === 0) continue;

      const isGenEd = genEdDepartments.includes(department);
      const level = isGenEd ? Math.min(desiredLevel, 2) : desiredLevel;
      const weights = options.map(
        (option) =>
          option.popularity * (student.level === "GR" ? 1 : levelFit(option.level, level)),
      );
      const option = pickWeighted(options, weights);
      chosen.push(option);
      chosenIds.add(option.id);
      hours += option.hours;
    }
    return chosen;
  }

  // ----- Output -----

  const output: Simulation = {
    students: [],
    studentCourses: [],
    academicInfo: [],
    studentPrograms: [],
    advisors: [],
  };

  function writeTermRecords(student: Student, term: Term) {
    student.visible = true;
    const msuGpa = gpa(student.msu);
    const overall = {
      attempted: student.msu.attempted + student.transfer.attempted,
      earned: student.msu.earned + student.transfer.earned,
      points: student.msu.points + student.transfer.points,
    };
    output.academicInfo.push({
      mnumber: student.row.mnumber,
      year: term.year,
      term_id: term.term_id,
      admit_year: student.admitTerm.year,
      admit_term_id: student.admitTerm.term_id,
      admit_id: student.admitCode,
      academic_standing_id: student.standing,
      msu_attempted_hours: student.msu.attempted,
      msu_earned_hours: student.msu.earned,
      msu_quality_points: round2(student.msu.points),
      msu_gpa: msuGpa,
      overall_attempted_hours: overall.attempted,
      overall_earned_hours: overall.earned,
      overall_quality_points: round2(overall.points),
      overall_gpa: gpa(overall),
    });

    for (const major of student.majors) {
      output.studentPrograms.push({
        mnumber: student.row.mnumber,
        year: term.year,
        term_id: term.term_id,
        program_id: major,
        type: "MAJOR",
        level: student.level,
      });
    }
    if (student.minor) {
      output.studentPrograms.push({
        mnumber: student.row.mnumber,
        year: term.year,
        term_id: term.term_id,
        program_id: student.minor,
        type: "MINOR",
        level: student.level,
      });
    }

    output.advisors.push({
      mnumber: student.row.mnumber,
      year: term.year,
      term_id: term.term_id,
      advisor_mnumber: student.advisor,
    });
  }

  // ----- One term for one student -----

  function attendsTerm(student: Student, term: Term) {
    // Everyone takes classes in the term they start
    if (termKey(student.admitTerm) === termKey(term)) return true;
    if (isMainTerm(term)) {
      if (student.sitOut > 0) {
        student.sitOut--;
        return false;
      }
      // Now and then a student skips a semester and comes back
      return student.mainTermsAttended === 0 || !chance(0.02);
    }
    if (term.kind === "summer") {
      if (student.level === "GR") return chance(0.45);
      return chance(overallEarned(student) >= 90 ? 0.35 : 0.25);
    }
    return student.level === "UG" && chance(0.05);
  }

  function takeTerm(student: Student, term: Term, isCurrent: boolean, visible: boolean) {
    const dates = termDates(term);
    const termShock = normal(0, 0.25);
    const withdrawsFromSchool = chance(
      isMainTerm(term) ? 0.012 + (student.ability < 2 ? 0.02 : 0) : 0.005,
    );
    const termTotals: Totals = { attempted: 0, earned: 0, points: 0 };

    for (const option of pickCourses(student, term)) {
      let status: string;
      let midterm: string | null = null;
      let final: string | null = null;
      let lastAttendance: Date | null = null;
      const score = student.ability + option.difficulty + termShock + normal(0, 0.65);
      const midtermLetter =
        student.level === "UG" || chance(0.3)
          ? letterGrade(score + normal(0, 0.4), student.level)
          : null;

      if (withdrawsFromSchool) {
        status = "WD";
        final = "W";
        lastAttendance = dateWithin(dates, 0.15, 0.75);
        if (chance(0.5)) midterm = midtermLetter;
      } else if (chance(0.04)) {
        // Dropped in the first week or so, before anything was graded
        status = pick(["DR", "DC"]);
      } else if (chance(0.025 + Math.max(0, 2.2 - student.ability) * 0.04)) {
        status = pickWeighted(["WW", "WC"], [70, 30]);
        final = "W";
        lastAttendance = dateWithin(dates, 0.2, 0.75);
        if (chance(0.5)) midterm = midtermLetter;
      } else {
        status = pickWeighted(["RW", "RE", "RC"], [72, 26, 2]);
        midterm = midtermLetter;
        // The current term is still going, so its final grades aren't in yet
        if (!isCurrent) {
          final = letterGrade(score, student.level);
          if (final === "E" && chance(0.5)) lastAttendance = dateWithin(dates, 0.3, 0.8);
        }
      }

      // Dropped and withdrawn rows still show which section they were in
      takeSeatFor(term, option, student, status, midterm, final, lastAttendance, visible);

      if (final && final in GRADE_POINTS) {
        termTotals.attempted += option.hours;
        termTotals.points += GRADE_POINTS[final] * option.hours;
        if (final !== "E") {
          termTotals.earned += option.hours;
          student.passed.add(option.id);
        }
      }
    }

    if (isMainTerm(term)) student.mainTermsAttended++;
    if (isCurrent) return;

    student.msu.attempted += termTotals.attempted;
    student.msu.earned += termTotals.earned;
    student.msu.points += termTotals.points;
    updateStanding(student, termTotals);
    if (withdrawsFromSchool && chance(0.6)) student.gone = true;
  }

  function takeSeatFor(
    term: Term,
    option: CourseOption,
    student: Student,
    status: string,
    midterm: string | null,
    final: string | null,
    lastAttendance: Date | null,
    visible: boolean,
  ) {
    const section = takeSeat(term, option, student.level);
    if (!visible) return;
    output.studentCourses.push({
      mnumber: student.row.mnumber,
      year: term.year,
      term_id: term.term_id,
      part_of_term_id: section.partOfTerm,
      course_id: option.id,
      course_section: section.section,
      course_hours: option.hours,
      course_level: student.level,
      registration_status_id: status,
      instructional_method_id: section.method,
      instructor_mnumber: section.instructor,
      last_attendance: lastAttendance,
      midterm_grade: midterm,
      final_grade: final,
    });
  }

  function updateStanding(student: Student, termTotals: Totals) {
    if (termTotals.attempted === 0) return;
    const cumulative = gpa(student.msu) ?? 0;
    const termGpa = termTotals.points / termTotals.attempted;

    if (student.level === "GR") {
      if (cumulative >= 3) student.standing = "GS";
      else if (student.standing === "GP" && termGpa < 3) {
        student.standing = "GD";
        student.gone = true;
      } else student.standing = "GP";
      return;
    }

    if (cumulative >= 2) {
      student.standing = termGpa >= 3.5 && termTotals.attempted >= 12 ? "DL" : "GS";
      return;
    }
    if (GOOD_STANDINGS.includes(student.standing)) {
      student.standing = student.msu.attempted <= 30 ? "AW" : "AP";
    } else if (student.standing === "AW") {
      student.standing = "AP";
    } else if (termGpa >= 2) {
      // Still under 2.0 overall, but doing better this term
      student.standing = "PC";
    } else {
      // Suspended: sits out a semester, then half come back on probation
      student.standing = "AS";
      if (chance(0.5)) student.gone = true;
      else student.sitOut = 1;
    }
  }

  // After a fall or spring: graduating, leaving, and changes to programs and advisors
  function endOfMainTerm(student: Student) {
    if (student.finished) return;
    if (student.gone) {
      finish(student);
      return;
    }
    if (student.standing === "AS" && student.sitOut === 0) student.standing = "AP";

    const gpaNow = gpa(student.msu) ?? 3;
    if (student.level === "GR") {
      if (student.msu.earned >= GRADUATE_HOURS_TO_GRADUATE || chance(0.02)) student.gone = true;
    } else if (overallEarned(student) >= HOURS_TO_GRADUATE) {
      if (chance(0.9)) student.gone = true;
    } else {
      const base =
        student.mainTermsAttended <= 2 ? 0.06 : student.mainTermsAttended <= 4 ? 0.035 : 0.02;
      if (chance(base * (1 + 2 * Math.max(0, 2 - gpaNow)))) student.gone = true;
    }
    if (student.gone) {
      finish(student);
      return;
    }

    if (student.level !== "UG") return;
    const departmentBefore = majorDepartment(student);

    if (student.declareAfter !== null && student.mainTermsAttended >= student.declareAfter) {
      student.majors = [pickMajor()];
      student.declareAfter = null;
    } else if (student.declareAfter === null && overallEarned(student) < 75 && chance(0.04)) {
      student.majors = [pickMajor(student.majors), ...student.majors.slice(1)];
    }
    if (!student.minor && student.mainTermsAttended >= 2 && chance(0.05)) {
      const options = minorOptions.filter((program) => !student.majors.includes(program.id));
      if (options.length > 0) student.minor = pick(options).id;
    }

    if (majorDepartment(student) !== departmentBefore || chance(0.015)) {
      releaseAdvisor(student.advisor);
      student.advisor = assignAdvisor(majorDepartment(student));
    }
  }

  // Graduated or left: frees up their advisor for someone new
  function finish(student: Student) {
    releaseAdvisor(student.advisor);
    student.finished = true;
  }

  // ----- The simulation -----

  for (const term of input.terms) {
    const isCurrent = term === currentTerm;
    const visible = termKey(term) >= firstVisibleKey;

    admitCohort(term);

    for (const student of roster) {
      if (student.gone || termKey(student.admitTerm) > termKey(term)) continue;

      if (attendsTerm(student, term)) {
        takeTerm(student, term, isCurrent, visible);
        if (visible) writeTermRecords(student, term);
      } else if (isCurrent && student.sitOut === 0 && isMainTerm(term)) {
        // Still a student, just not registered yet, which the advisees page flags
        writeTermRecords(student, term);
      }
    }

    if (isMainTerm(term) && !isCurrent) {
      for (const student of roster) endOfMainTerm(student);
    }
  }

  output.students = roster.filter((student) => student.visible).map((student) => student.row);
  return output;
}

// ----- Helpers -----

function toCourseOptions(courses: Array<Course>, department: string): Array<CourseOption> {
  const options = courses.map((course) => ({
    id: course.id,
    hours: course.hours,
    level: course.number >= 600 ? 6 : clamp(Math.floor(course.number / 100), 1, 4),
    department,
    popularity: Math.exp(normal(0, 1)),
    difficulty: normal(course.number < 200 ? -0.1 : 0.05, 0.25),
    core: false,
  }));
  // The most popular fifth of the 100 to 300 level courses are core and always offered
  const lower = options
    .filter((option) => option.level <= 3)
    .sort((a, b) => b.popularity - a.popularity);
  for (const option of lower.slice(0, Math.ceil(lower.length / 5))) option.core = true;
  return options;
}

function isOffered(option: CourseOption, term: Term, level: Level) {
  if (term.kind === "fall" || term.kind === "spring") {
    if (option.core) return true;
    return chance(level === "GR" ? 0.5 : clamp(0.15 + option.popularity * 0.2, 0, 0.85));
  }
  if (term.kind === "summer") return chance(option.core ? 0.35 : 0.06);
  return option.core && chance(0.1);
}

function sectionMethod(term: Term, level: Level) {
  if (term.kind === "summer" || term.kind === "winter") {
    return pickWeighted(["WEB", "CLAS"], [80, 20]);
  }
  if (level === "GR") return pickWeighted(["WEB", "CLAS", "WBEN"], [50, 40, 10]);
  return pickWeighted(["CLAS", "WEB", "WBEN"], [75, 20, 5]);
}

function sectionPartOfTerm(term: Term) {
  if (term.kind === "summer") return pick(["4", "5"]);
  if (term.kind === "winter") return "6";
  return pickWeighted(["1", "2", "3"], [92, 4, 4]);
}

/** How likely a student is to take a course this far from their class level */
function levelFit(courseLevel: number, studentLevel: number) {
  return [1, 0.35, 0.08, 0.02][Math.min(3, Math.abs(courseLevel - studentLevel))];
}

function letterGrade(score: number, level: Level) {
  if (level === "GR") {
    const adjusted = score + 0.35;
    if (adjusted >= 3.4) return "A";
    if (adjusted >= 2.5) return "B";
    if (adjusted >= 1.4) return "C";
    return "E";
  }
  if (score >= 3.3) return "A";
  if (score >= 2.45) return "B";
  if (score >= 1.65) return "C";
  if (score >= 1.15) return "D";
  return "E";
}

function gpa(totals: Totals) {
  return totals.attempted > 0 ? round2(totals.points / totals.attempted) : null;
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/** A date between two points of the term, like 0.2 to 0.75 of the way through */
function dateWithin(dates: { start: Date; end: Date }, from: number, to: number) {
  const span = dates.end.getTime() - dates.start.getTime();
  const at = dates.start.getTime() + span * (from + (to - from) * random());
  const date = new Date(at);
  date.setHours(0, 0, 0, 0);
  return date;
}

function makeIdentity(mnumber: string): StudentRow {
  const female = chance(0.47);
  const names = female ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES;
  const first_name = pick(names);
  const last_name = pick(LAST_NAMES);
  let middle_name: string | null = null;
  if (chance(0.75)) {
    do middle_name = pick(names);
    while (middle_name === first_name);
  }
  const suffix = !female && chance(0.03) ? pick(SUFFIXES) : null;
  const email = `${first_name[0]}${last_name}${randomInt(1, 99)}@example.edu`
    .toLowerCase()
    .replace(/[^a-z0-9@.]/g, "");

  return {
    mnumber,
    first_name,
    middle_name,
    last_name,
    suffix,
    gender: female ? "F" : "M",
    email,
  };
}
