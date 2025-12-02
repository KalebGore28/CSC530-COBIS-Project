import { createFileRoute } from '@tanstack/react-router'

import { admitCodesCollection } from '@/collections/admit-codes'
import { collegesCollection } from '@/collections/colleges'
import { coursesCollection } from '@/collections/courses'
import { departmentsCollection } from '@/collections/departments'
import { instructionalMethodsCollection } from '@/collections/instructional-methods'
import { partOfTermCollection } from '@/collections/part-of-term'
import { programsCollection } from '@/collections/programs'
import { registrationStatusCollection } from '@/collections/registration-status'
import { useLiveQuery } from '@tanstack/react-db'

import { StatusCard } from '@/components/table-status-card'

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/_layout/manage-tables',
)({
    component: RouteComponent,
})

function RouteComponent() {

    const { data: admitCodes, isLoading: isAdmitCodesLoading } = useLiveQuery((q) => q.from({ admit_codes: admitCodesCollection }))
    const { data: colleges, isLoading: isCollegesLoading } = useLiveQuery((q) => q.from({ colleges: collegesCollection }))
    const { data: courses, isLoading: isCoursesLoading } = useLiveQuery((q) => q.from({ courses: coursesCollection }))
    const { data: departments, isLoading: isDepartmentsLoading } = useLiveQuery((q) => q.from({ departments: departmentsCollection }))
    const { data: instructionalMethods, isLoading: isInstructionalMethodsLoading } = useLiveQuery((q) => q.from({ instructional_methods: instructionalMethodsCollection }))
    const { data: partOfTerm, isLoading: isPartOfTermLoading } = useLiveQuery((q) => q.from({ part_of_term: partOfTermCollection }))
    const { data: programs, isLoading: isProgramsLoading } = useLiveQuery((q) => q.from({ programs: programsCollection }))
    const { data: registrationStatus, isLoading: isRegistrationStatusLoading } = useLiveQuery((q) => q.from({ registration_status: registrationStatusCollection }))

    const admitCodesWithUnknownDescription = admitCodes?.filter((a) => a.description.toLowerCase() === "unknown").length || 0

    const collegesWithUnknownDescription = colleges?.filter((c) => c.description.toLowerCase() === "unknown").length || 0

    const coursesWithUnknownTitle = courses?.filter((c) => c.title.toLowerCase() === "unknown" || c.title.toLowerCase() === "not known to cobis yet").length || 0
    const coursesWithMissingDepartment = courses?.filter((c) => !c.department_code).length || 0
    const coursesWithMissingCollege = courses?.filter((c) => !c.college_code).length || 0

    const departmentsMissingCollege = departments?.filter((d) => !d.college_code).length || 0

    const instructionalMethodsWithUnknownDescription = instructionalMethods?.filter((im) => im.description.toLowerCase() === "unknown").length || 0

    const partOfTermWithUnknownDescription = partOfTerm?.filter((p) => p.description.toLowerCase() === "unknown").length || 0

    const programsWithMissingDepartment = programs?.filter((p) => !p.department_code).length || 0
    const programsWithMissingCollege = programs?.filter((p) => !p.college_code).length || 0
    const programsWithMissingFlag = programs?.filter((p) => !p.is_major && !p.is_minor).length || 0

    const registrationStatusWithUnknownDescription = registrationStatus?.filter((r) => r.description.toLowerCase() === "unknown").length || 0

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatusCard
                title="Admit Codes"
                description="Overview of"
                isLoading={isAdmitCodesLoading}
                totalItems={admitCodes?.length}
                stats={[
                    { label: 'Missing description', count: admitCodesWithUnknownDescription },
                ]}
            />

            <StatusCard
                title="Colleges"
                description="Overview of"
                isLoading={isCollegesLoading}
                totalItems={colleges?.length}
                stats={[
                    { label: 'Missing description', count: collegesWithUnknownDescription },
                ]}
            />

            <StatusCard
                title="Courses"
                description="Overview of"
                isLoading={isCoursesLoading}
                totalItems={courses?.length}
                emptyMessage="No courses found."
                stats={[
                    { label: 'Missing title', count: coursesWithUnknownTitle },
                    { label: 'Missing department', count: coursesWithMissingDepartment },
                    { label: 'Missing college', count: coursesWithMissingCollege },
                ]}
            />


            <StatusCard
                title="Departments"
                description="Overview of"
                isLoading={isDepartmentsLoading}
                totalItems={departments?.length}
                stats={[
                    { label: 'Missing college', count: departmentsMissingCollege },
                ]}
            />


            <StatusCard
                title="Instructional Methods"
                description="Overview of"
                isLoading={isInstructionalMethodsLoading}
                totalItems={instructionalMethods?.length}
                stats={[
                    { label: 'Missing description', count: instructionalMethodsWithUnknownDescription },
                ]}
            />

            <StatusCard
                title="Part of Terms"
                description="Overview of"
                isLoading={isPartOfTermLoading}
                totalItems={partOfTerm?.length}
                stats={[
                    { label: 'Missing description', count: partOfTermWithUnknownDescription },
                ]}
            />

            <StatusCard
                title="Programs"
                description="Overview of"
                isLoading={isProgramsLoading}
                totalItems={programs?.length}
                stats={[
                    { label: 'Missing department', count: programsWithMissingDepartment },
                    { label: 'Missing college', count: programsWithMissingCollege },
                    { label: 'Missing both major/minor flag', count: programsWithMissingFlag },
                ]}
            />

            <StatusCard
                title="Registration Status"
                description="Overview of"
                isLoading={isRegistrationStatusLoading}
                totalItems={registrationStatus?.length}
                stats={[
                    { label: 'Missing description', count: registrationStatusWithUnknownDescription },
                ]}
            />
        </div>
    )

}
