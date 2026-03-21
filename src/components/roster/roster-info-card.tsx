import { useLiveQuery } from '@tanstack/react-db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import { currentTermCollection } from '@/integrations/tanstack-db/current-term'

type RequiredStudentCourseProps = {
    year: number
    term_id: string
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
                <div className="flex flex-col justify-between gap-6 md:flex-row">
                    {/* Left column */}
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-7 w-40" />{' '}
                        {/* course_id-section */}
                        <Skeleton className="h-5 w-56" /> {/* course_title */}
                        <Skeleton className="h-4 w-72" />{' '}
                        {/* term/year/hours */}
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col items-end justify-between gap-4">
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
          course.term_id === currentTerm.term_id
        : false

    return (
        <Card className={className}>
            <CardContent>
                <div className="flex flex-col justify-between gap-6 md:flex-row">
                    <div>
                        <h2 className="text-foreground text-2xl font-bold tracking-tight">
                            {course.course_id}-{course.course_section}
                        </h2>
                        <p className="text-foreground text-xl">
                            {course.course_title}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            {course.term_description} {course.year} •{' '}
                            {uniqueCreditHours.length > 1
                                ? 'Variable Credit Hours'
                                : 'Credit Hours'}
                            : ({uniqueCreditHours.join(', ')}) • Total Hours:{' '}
                            {totalCreditHours}
                        </p>
                    </div>
                    <div className="flex h-full flex-col items-end justify-between gap-4">
                        <Badge
                            variant={isActive ? 'default' : 'secondary'}
                            className="bg-primary dark:bg-primary/20 rounded-full px-4 py-1 text-sm font-medium"
                        >
                            <span className="text-xs font-normal text-white">
                                {isActive ? 'Active' : 'Completed'}
                            </span>
                        </Badge>
                        <div className="text-right">
                            <p className="text-foreground text-2xl font-bold">
                                {totalStudents}{' '}
                                <span className="text-muted-foreground text-lg font-normal">
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
