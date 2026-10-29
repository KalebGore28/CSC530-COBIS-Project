import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type SelectedTerm = {
  year: number;
  term_id: string;
  term_description?: string;
  studentCount: number;
  creditHoursDelivered: number;
};

export type SelectedCourse = {
  course_id: string;
  course_section: string;
  course_hours: number;
  course_title?: string;
  year: number;
  term_id: string;
  term_description?: string;
  student_count: number;
  credit_hours_delivered: number;
};

type RequiredStudentCourseProps = {
  year: number;
  term_id: string;
  term_description?: string;
  course_hours: number;
  course_id: string;
  course_section: string;
  course_title?: string;
} & Record<string, unknown>;

type TermCourseSelectorProps = {
  studentCourses: Array<RequiredStudentCourseProps>;
  isLoading?: boolean;
  showStats?: boolean;
  className?: string;
  selectedTerm?: SelectedTerm;
  selectedCourse?: SelectedCourse;
  setSelectedTerm: (term: SelectedTerm | undefined) => void;
  setSelectedCourse: (course: SelectedCourse | undefined) => void;
};

export function TermCourseSelector({
  studentCourses,
  showStats,
  className,
  selectedTerm,
  selectedCourse,
  setSelectedTerm,
  setSelectedCourse,
}: TermCourseSelectorProps) {
  // Extract unique terms from studentCourses
  const terms = extractTerms(studentCourses);

  // Extract courses for the selected term
  const termCourses = extractTermCourses(studentCourses, selectedTerm);

  // Run once to select the first term and its first course by default
  useEffect(() => {
    if (!selectedTerm && terms.size > 0) {
      const firstTerm = Array.from(terms.values()).sort((a, b) => {
        // Sort by year DESC
        if (a.year !== b.year) {
          return b.year - a.year;
        }

        // Sort by term_id DESC (90, 80, 50, 10)
        return Number(b.term_id) - Number(a.term_id);
      })[0];
      setSelectedTerm(firstTerm);
      const newTermCourses = extractTermCourses(studentCourses, firstTerm);
      newTermCourses && setSelectedCourse(newTermCourses.values().next().value);
    }
  }, [terms, setSelectedCourse, setSelectedTerm, selectedTerm, studentCourses]);

  const uniqueStudents = new Set(
    studentCourses
      .filter((s) => {
        if (s.year === selectedCourse?.year && s.term_id === selectedCourse.term_id) return true;
        return false;
      })
      .map((s) => s.mnumber),
  ).size;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Term & Course Selector</CardTitle>
        <CardDescription>Select a term and course to view the class roster.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 pb-4 md:grid-cols-2">
        {/* Term Selector Component */}
        <Card>
          <CardContent>
            <Select
              value={selectedTerm ? `${selectedTerm.term_id}-${selectedTerm.year}` : "Select Term"}
              onValueChange={(value) => {
                const term = terms.get(value);

                const newTermCourses = extractTermCourses(studentCourses, term);
                term && setSelectedTerm(term);
                newTermCourses && setSelectedCourse(newTermCourses.values().next().value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(terms.values())
                  .sort((a, b) => {
                    // Sort by year DESC
                    if (a.year !== b.year) {
                      return b.year - a.year;
                    }

                    // Sort by term_id DESC (90, 80, 50, 10)
                    return Number(b.term_id) - Number(a.term_id);
                  })

                  .map((term, index) => (
                    <SelectItem key={index} value={`${term.term_id}-${term.year}`}>
                      {term.term_description} {term.year}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </CardContent>
          {showStats && selectedTerm && (
            <CardFooter className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1 bg-green-50 dark:bg-green-900">
                <span>
                  {selectedTerm.studentCount}{" "}
                  {selectedTerm.studentCount === 1 ? "Student" : "Students"}
                </span>
                <span>|</span>
                <span>{uniqueStudents} Unique</span>
              </Badge>
              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900">
                {selectedTerm.creditHoursDelivered} Total Credit Hours
              </Badge>
            </CardFooter>
          )}
        </Card>
        {/* Course Selector Component */}
        {selectedTerm && termCourses && (
          <Card>
            <CardContent>
              <Select
                value={
                  selectedCourse
                    ? `${selectedCourse.course_id}-${selectedCourse.course_section}`
                    : "Select Course"
                }
                onValueChange={(value) => {
                  const course = termCourses.get(value);
                  course && setSelectedCourse(course);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(termCourses.values()).map((course, index) => (
                    <SelectItem key={index} value={`${course.course_id}-${course.course_section}`}>
                      ({course.course_id}-{course.course_section}): {course.course_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
            {showStats && selectedCourse && (
              <CardFooter className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-50 dark:bg-green-900">
                  {selectedCourse.student_count}{" "}
                  {selectedCourse.student_count === 1 ? "Student" : "Students"}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900">
                  {selectedCourse.credit_hours_delivered} Total Credit Hours
                </Badge>
              </CardFooter>
            )}
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

function extractTerms(studentCourses: Array<RequiredStudentCourseProps>) {
  // Extract unique terms from studentCourses
  const terms = new Map<string, SelectedTerm>();

  for (const c of studentCourses) {
    const key = `${c.term_id}-${c.year}`;

    let term = terms.get(key);
    if (!term) {
      term = {
        year: c.year,
        term_id: c.term_id,
        term_description: c.term_description,
        studentCount: 0,
        creditHoursDelivered: 0,
      };

      terms.set(key, term);
    }

    // Update aggregates
    term.studentCount += 1;
    term.creditHoursDelivered += c.course_hours;
  }

  return terms;
}

function extractTermCourses(
  studentCourses: Array<RequiredStudentCourseProps>,
  selectedTerm: SelectedTerm | undefined,
) {
  if (!selectedTerm) return undefined;

  // Filter studentCourses for the selected term
  const filteredCourses = studentCourses.filter(
    (c) => c.year === selectedTerm.year && c.term_id === selectedTerm.term_id,
  );

  // Extract courses for the selected term
  const termCourses = new Map<string, SelectedCourse>();

  for (const c of filteredCourses) {
    const key = `${c.course_id}-${c.course_section}`;

    const course = termCourses.get(key);
    if (!course) {
      termCourses.set(key, {
        course_id: c.course_id,
        course_section: c.course_section,
        course_title: c.course_title,
        course_hours: c.course_hours,
        year: c.year,
        term_id: c.term_id,
        term_description: c.term_description,
        student_count: 0,
        credit_hours_delivered: 0,
      });
    }

    // Update aggregates
    const updatedCourse = termCourses.get(key);
    if (updatedCourse) {
      updatedCourse.student_count += 1;
      updatedCourse.credit_hours_delivered += c.course_hours;
      termCourses.set(key, updatedCourse);
    }
  }
  return termCourses;
}
