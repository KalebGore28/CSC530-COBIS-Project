import { RosterInfoCard } from "@/components/roster/roster-info-card";
import { RosterGradeDistributions } from "@/components/roster/roster-grade-distributions";
import { RosterSummaryCard } from "@/components/roster/roster-summary-card";
import { RosterStudents } from "@/components/roster/roster-students";

import type { ExtendedTerm } from "@/components/selectors/term-selector";
import type { ExtendedCourse } from "@/components/selectors/course-selector";

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

const rosterQuery = graphql(`
    query rosterQuery(
    $mnumber: String!
    $term: String!
    $year: Int!
    $subject: String!
    $number: Int!
    $suffix: String
    $section: String
    ) {
        facultySingle(where: { mnumber: { eq: $mnumber } }) {
            courses_taught(
                startTerm: $term
                startYear: $year
                endTerm: $term
                endYear: $year
                subject: $subject
                number: $number
                suffix: $suffix
                section: $section
            ) {
                course {
                    title
                }
                course_subject
                course_number
                course_suffix
                course_section
                credit_hour
                total_students
                total_credit_hours
                class_gpa
                midterm_average
                final_average
            }
        }
    }
`);

type Course = {
    subject: string;
    number: number;
    suffix?: string | null;
    section: string;
}

type RosterProps = {
    mnumber: string;
    course: Course;
    term_code: string;
    year: number;
}

export function Roster({ mnumber, course, term_code, year }: RosterProps) {

    const { data, isLoading } = useQuery({
        queryKey: ['roster', course, term_code, year],
        queryFn: () => execute(rosterQuery, {
            mnumber: mnumber,
            term: term_code,
            year: year,
            subject: course.subject,
            number: course.number,
            suffix: course.suffix,
            section: course.section,
        }),
    });

    if (isLoading) {
        return <div>Loading Roster...</div>;
    }

    const rosterData = data?.facultySingle?.courses_taught?.[0] ?? null;

    const termInfo: ExtendedTerm = {
        code: term_code,
        year: year,
        courseCount: 0,
        studentCount: 0,
        creditHoursDelivered: 0,
        description: ""
    }

    const courseInfo: ExtendedCourse = {
        course_subject: rosterData?.course_subject || '',
        course_number: rosterData?.course_number || 0,
        course_suffix: rosterData?.course_suffix || '',
        title: rosterData?.course?.title || '',
        course_section: rosterData?.course_section || '',
        creditHours: rosterData?.credit_hour || 0,
        studentCount: rosterData?.total_students || 0,
        totalCreditHours: rosterData?.total_credit_hours || 0,
        classGPA: rosterData?.class_gpa || 0,
        midtermAverage: rosterData?.midterm_average || 0,
        finalAverage: rosterData?.final_average || 0,
    }

    if (!isLoading) {
        console.log('Roster Data:', data);
    }



    return (
        <div className="container mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-2">
                <RosterInfoCard
                    className={"col-span-2"}
                    course={courseInfo}
                    term={termInfo}
                />
                <RosterGradeDistributions
                    className={"col-span-1"}
                    mnumber={mnumber}
                    course={courseInfo}
                />
                <RosterSummaryCard
                    className={"col-span-1"}
                    totalStudents={courseInfo.studentCount}
                    classGPA={courseInfo.classGPA}
                    midtermAverage={courseInfo.midtermAverage}
                    finalAverage={courseInfo.finalAverage}
                />
                <RosterStudents
                    className={"col-span-2"}
                    mnumber={mnumber}
                    course={courseInfo}
                    term={termInfo}
                />
            </div>
        </div>
    );
}