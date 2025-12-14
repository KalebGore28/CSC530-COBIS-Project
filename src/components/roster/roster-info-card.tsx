import { useLiveQuery } from '@tanstack/react-db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { currentTermCollection } from '@/integrations/tanstack-db/current-term'

type RequiredStudentCourseProps = {
    year: number
    term_code: string
    course_hours: number
    term_description: string | undefined
    course_id: string
    course_section: string
    course_title: string | undefined
} & Record<string, unknown>

type RosterInfoCardProps = {
    studentCourses: Array<RequiredStudentCourseProps>
    className?: string
    isLoading?: boolean
}

function RosterInfoCardSkeleton({ className }: { className?: string }) {
    return (
        <Card className={className}>
            <CardContent>
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* Left column */}
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-7 w-40" />{' '}
                        {/* course_id-section */}
                        <Skeleton className="h-5 w-56" /> {/* course_title */}
                        <Skeleton className="h-4 w-72" />{' '}
                        {/* term/year/hours */}
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col justify-between items-end gap-4">
                        <Skeleton className="h-6 w-20 rounded-full" />{' '}
                        {/* Badge */}
                        <Skeleton className="h-7 w-24" /> {/* student count */}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function RosterInfoCard({
    studentCourses,
    className,
    isLoading,
}: RosterInfoCardProps) {
    const { data: currentTerm, isLoading: currentTermLoading } = useLiveQuery(
        (q) => q.from({ collection: currentTermCollection }).findOne(),
    )

    if (isLoading || currentTermLoading)
        return <RosterInfoCardSkeleton className={className} />

    const course = studentCourses[0]
    const totalStudents = studentCourses.length
    const totalCreditHours = studentCourses.reduce(
        (sum, sc) => sum + sc.course_hours,
        0,
    )

    // We need to get all unique credit hours from studentCourses to account for variable credit courses
    const uniqueCreditHours = Array.from(
        new Set(studentCourses.map((sc) => sc.course_hours)),
    ).sort((a, b) => a - b)

    const isActive = currentTerm
        ? course.year === currentTerm.year &&
          course.term_code === currentTerm.term_code
        : false

    return (
        <Card className={className}>
            <CardContent>
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            {course.course_id}-{course.course_section}
                        </h2>
                        <p className="text-xl text-foreground">
                            {course.course_title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {course.term_description} {course.year} •{' '}
                            {uniqueCreditHours.length > 1
                                ? 'Variable Credit Hours'
                                : 'Credit Hours'}
                            : ({uniqueCreditHours.join(', ')}) • Total Hours:{' '}
                            {totalCreditHours}
                        </p>
                    </div>
                    <div className="flex flex-col justify-between items-end h-full gap-4">
                        <Badge
                            variant={isActive ? 'default' : 'secondary'}
                            className="text-sm font-medium rounded-full bg-primary px-4 py-1 dark:bg-primary/20"
                        >
                            <span className="text-xs font-normal text-white">
                                {isActive ? 'Active' : 'Completed'}
                            </span>
                        </Badge>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">
                                {totalStudents}{' '}
                                <span className="text-lg font-normal text-muted-foreground">
                                    students
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
