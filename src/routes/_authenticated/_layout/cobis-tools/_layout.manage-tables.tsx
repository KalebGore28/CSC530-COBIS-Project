import { createFileRoute } from '@tanstack/react-router'

import { useLiveQuery } from '@tanstack/react-db'
import { admitCodesCollection } from '@/integrations/tanstack-db/admit-codes'
import { collegesCollection } from '@/integrations/tanstack-db/colleges'
import { coursesCollection } from '@/integrations/tanstack-db/courses'
import { departmentsCollection } from '@/integrations/tanstack-db/departments'
import { instructionalMethodsCollection } from '@/integrations/tanstack-db/instructional-methods'
import { partOfTermCollection } from '@/integrations/tanstack-db/part-of-term'
import { programsCollection } from '@/integrations/tanstack-db/programs'
import { registrationStatusCollection } from '@/integrations/tanstack-db/registration-status'

import { StatusCard } from '@/components/table-status-card'

export const Route = createFileRoute(
    '/_authenticated/_layout/cobis-tools/_layout/manage-tables',
)({
    beforeLoad: () => {
        admitCodesCollection.preload()
        collegesCollection.preload()
        coursesCollection.preload()
        departmentsCollection.preload()
        instructionalMethodsCollection.preload()
        partOfTermCollection.preload()
        programsCollection.preload()
        registrationStatusCollection.preload()
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { data: admitCodes, isLoading: isAdmitCodesLoading } = useLiveQuery(
        (q) => q.from({ admit_codes: admitCodesCollection }),
    )
    const { data: colleges, isLoading: isCollegesLoading } = useLiveQuery((q) =>
        q.from({ colleges: collegesCollection }),
    )
    const { data: courses, isLoading: isCoursesLoading } = useLiveQuery((q) =>
        q.from({ courses: coursesCollection }),
    )
    const { data: departments, isLoading: isDepartmentsLoading } = useLiveQuery(
        (q) => q.from({ departments: departmentsCollection }),
    )
    const {
        data: instructionalMethods,
        isLoading: isInstructionalMethodsLoading,
    } = useLiveQuery((q) =>
        q.from({ instructional_methods: instructionalMethodsCollection }),
    )
    const { data: partOfTerm, isLoading: isPartOfTermLoading } = useLiveQuery(
        (q) => q.from({ part_of_term: partOfTermCollection }),
    )
    const { data: programs, isLoading: isProgramsLoading } = useLiveQuery((q) =>
        q.from({ programs: programsCollection }),
    )
    const { data: registrationStatus, isLoading: isRegistrationStatusLoading } =
        useLiveQuery((q) =>
            q.from({ registration_status: registrationStatusCollection }),
        )

    const admitCodesWithUnknownDescription =
        admitCodes.filter((a) => a.description.toLowerCase() === 'unknown')
            .length || 0

    const collegesWithUnknownDescription =
        colleges.filter((c) => c.description.toLowerCase() === 'unknown')
            .length || 0

    console.log()

    const coursesWithUnknownTitle =
        courses.filter(
            (c) =>
                c.title.toLowerCase() === 'unknown' ||
                c.title.toLowerCase() === 'not known to cobis yet',
        ).length || 0
    const coursesWithMissingDepartment =
        courses.filter((c) => !c.department_id).length || 0
    const coursesWithMissingCollege =
        courses.filter((c) => !c.college_id).length || 0

    const departmentsMissingCollege =
        departments.filter((d) => !d.college_id).length || 0

    const instructionalMethodsWithUnknownDescription =
        instructionalMethods?.filter(
            (im) => im.description.toLowerCase() === 'unknown',
        ).length || 0

    const partOfTermWithUnknownDescription =
        partOfTerm.filter((p) => p.description.toLowerCase() === 'unknown')
            .length || 0

    const programsWithMissingDepartment =
        programs.filter((p) => !p.department_id).length || 0
    const programsWithMissingCollege =
        programs.filter((p) => !p.college_id).length || 0
    const programsWithMissingFlag =
        programs.filter((p) => !p.is_major && !p.is_minor).length || 0
    const registrationStatusWithUnknownDescription =
        registrationStatus.filter(
            (r) => r.description.toLowerCase() === 'unknown',
        ).length || 0

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatusCard
                title="Admit Codes"
                isLoading={isAdmitCodesLoading}
                totalItems={admitCodes?.length}
                navigateTo="/cobis-tools/manage-tables/admit-codes"
                stats={[
                    {
                        label: 'Description',
                        count: admitCodesWithUnknownDescription,
                        variant: 'secondary',
                        filterColumn: 'description',
                        filterValue: 'unknown',
                    },
                ]}
            />

            <StatusCard
                title="Colleges"
                isLoading={isCollegesLoading}
                totalItems={colleges?.length}
                navigateTo="/cobis-tools/manage-tables/colleges"
                stats={[
                    {
                        label: 'Description',
                        count: collegesWithUnknownDescription,
                        variant: 'secondary',
                        filterColumn: 'description',
                        filterValue: 'unknown',
                    },
                ]}
            />

            <StatusCard
                title="Courses"
                isLoading={isCoursesLoading}
                totalItems={courses?.length}
                navigateTo="/cobis-tools/manage-tables/courses"
                stats={[
                    {
                        label: 'Title',
                        count: coursesWithUnknownTitle,
                        variant: 'secondary',
                        filterColumn: 'title',
                        filterValue: 'Not known to COBIS yet',
                    },
                    {
                        label: 'Department',
                        count: coursesWithMissingDepartment,
                        variant: 'secondary',
                        filterColumn: 'department_id',
                        filterValue: '"null"',
                    },
                    {
                        label: 'College',
                        count: coursesWithMissingCollege,
                        variant: 'secondary',
                        filterColumn: 'college_id',
                        filterValue: '"null"',
                    },
                ]}
            />

            <StatusCard
                title="Departments"
                isLoading={isDepartmentsLoading}
                totalItems={departments?.length}
                navigateTo="/cobis-tools/manage-tables/departments"
                stats={[
                    {
                        label: 'College',
                        count: departmentsMissingCollege,
                        variant: 'secondary',
                        filterColumn: 'college_id',
                        filterValue: '"null"',
                    },
                ]}
            />

            <StatusCard
                title="Instructional Methods"
                isLoading={isInstructionalMethodsLoading}
                totalItems={instructionalMethods?.length}
                navigateTo="/cobis-tools/manage-tables/instructional-methods"
                stats={[
                    {
                        label: 'Description',
                        count: instructionalMethodsWithUnknownDescription,
                        variant: 'secondary',
                        filterColumn: 'description',
                        filterValue: 'unknown',
                    },
                ]}
            />

            <StatusCard
                title="Part of Terms"
                isLoading={isPartOfTermLoading}
                totalItems={partOfTerm?.length}
                navigateTo="/cobis-tools/manage-tables/part-of-term"
                stats={[
                    {
                        label: 'Description',
                        count: partOfTermWithUnknownDescription,
                        variant: 'secondary',
                        filterColumn: 'description',
                        filterValue: 'unknown',
                    },
                ]}
            />

            <StatusCard
                title="Programs"
                isLoading={isProgramsLoading}
                totalItems={programs?.length}
                navigateTo="/cobis-tools/manage-tables/programs"
                stats={[
                    {
                        label: 'Department',
                        count: programsWithMissingDepartment,
                        variant: 'secondary',
                        filterColumn: 'department_id',
                        filterValue: '"null"',
                    },
                    {
                        label: 'College',
                        count: programsWithMissingCollege,
                        variant: 'secondary',
                        filterColumn: 'college_id',
                        filterValue: '"null"',
                    },
                    // {
                    //     label: 'Major/Minor',
                    //     count: programsWithMissingFlag,
                    //     variant: 'secondary',
                    //     navigateFilter: "flag"
                    // },
                ]}
            />

            <StatusCard
                title="Registration Status"
                isLoading={isRegistrationStatusLoading}
                totalItems={registrationStatus?.length}
                navigateTo="/cobis-tools/manage-tables/registration-status"
                stats={[
                    {
                        label: 'Description',
                        count: registrationStatusWithUnknownDescription,
                        variant: 'secondary',
                        filterColumn: 'description',
                        filterValue: 'unknown',
                    },
                ]}
            />
        </div>
    )
}
