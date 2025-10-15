import { createFileRoute } from '@tanstack/react-router'
import { CourseSearchBox } from '@/components/search/course-search'
import { DepartmentSearchBox } from '@/components/search/department-search'
import { ProgramSearchBox } from '@/components/search/program-search'

export const Route = createFileRoute('/_authenticated/_layout/instructors/')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>
        <CourseSearchBox />
        <DepartmentSearchBox />
        <ProgramSearchBox />
    </div>
}
