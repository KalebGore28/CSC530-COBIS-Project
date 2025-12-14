import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

type RequiredStudentCourseProps = {
    midterm_grade: string | null
    final_grade: string | null
    student_gpa: number | null
} & Record<string, unknown>

type RosterSummaryCardProps = {
    studentCourses: Array<RequiredStudentCourseProps>
    className?: string
    isLoading?: boolean
}

const gradeValues = new Map<string, number>([
    ['A', 4.0],
    ['B', 3.0],
    ['C', 2.0],
    ['D', 1.0],
    ['E', 0.0],
])

function RosterSummaryCardSkeleton({ className }: { className?: string }) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>
                    <Skeleton className="h-5 w-32" />
                </CardTitle>
                <CardDescription>
                    <Skeleton className="h-4 w-48" />
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="space-y-6">
                    {/* Core Metrics */}
                    <dl className="grid grid-cols-1 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">
                                <Skeleton className="h-4 w-28" />
                            </dt>
                            <dd>
                                <Skeleton className="h-4 w-10" />
                            </dd>
                        </div>

                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">
                                <Skeleton className="h-4 w-20" />
                            </dt>
                            <dd>
                                <Skeleton className="h-4 w-10" />
                            </dd>
                        </div>

                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">
                                <Skeleton className="h-4 w-28" />
                            </dt>
                            <dd>
                                <Skeleton className="h-4 w-12" />
                            </dd>
                        </div>

                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">
                                <Skeleton className="h-4 w-24" />
                            </dt>
                            <dd>
                                <Skeleton className="h-4 w-12" />
                            </dd>
                        </div>
                    </dl>

                    {/* Additional Statistics */}
                    <div>
                        <h3 className="text-sm font-semibold mb-2">
                            <Skeleton className="h-4 w-32" />
                        </h3>

                        <dl className="grid grid-cols-1 gap-4 text-sm">
                            <div className="flex items-center justify-between">
                                <dt className="text-muted-foreground">
                                    <Skeleton className="h-4 w-28" />
                                </dt>
                                <dd>
                                    <Skeleton className="h-4 w-40" />
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function RosterSummaryCard({
    studentCourses,
    className,
    isLoading,
}: RosterSummaryCardProps) {
    if (isLoading) return <RosterSummaryCardSkeleton className={className} />

    const totalStudents = studentCourses.length

    // Calculate Class GPA
    const classGPA =
        studentCourses.reduce((acc, sc) => acc + (sc.student_gpa || 0), 0) /
        (totalStudents || 1)

    // Calculate Midterm and Final Averages
    const midtermAverage =
        studentCourses.reduce((acc, sc) => {
            const grade = sc.midterm_grade
                ? gradeValues.get(sc.midterm_grade) || 0
                : 0
            return acc + grade
        }, 0) / (totalStudents || 1)

    const finalAverage =
        studentCourses.reduce((acc, sc) => {
            const grade = sc.final_grade
                ? gradeValues.get(sc.final_grade) || 0
                : 0
            return acc + grade
        }, 0) / (totalStudents || 1)

    const averageTrend = finalAverage - midtermAverage

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Class Summary</CardTitle>
                <CardDescription>
                    Performance metrics and statistics
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Core Metrics */}
                    <dl className="grid grid-cols-1 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">
                                Total Students
                            </dt>
                            <dd className="font-medium">{totalStudents}</dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">Class GPA</dt>
                            <dd className="font-medium">
                                {classGPA.toFixed(2)}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">
                                Midterm Average
                            </dt>
                            <dd className="font-medium">
                                {midtermAverage > 0
                                    ? midtermAverage.toFixed(2)
                                    : 'N/A'}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between">
                            <dt className="text-muted-foreground">
                                Final Average
                            </dt>
                            <dd className="font-medium">
                                {finalAverage > 0
                                    ? finalAverage.toFixed(2)
                                    : 'N/A'}
                            </dd>
                        </div>
                    </dl>

                    {/* Additional Statistics */}
                    <div>
                        <h3 className="text-sm font-semibold mb-2">
                            Additional Insights
                        </h3>
                        <dl className="grid grid-cols-1 gap-4 text-sm">
                            <div className="flex items-center justify-between">
                                <dt className="text-muted-foreground">
                                    Average Trend
                                </dt>
                                <dd
                                    className="font-medium"
                                    style={{
                                        color:
                                            finalAverage > midtermAverage
                                                ? 'green'
                                                : finalAverage < midtermAverage
                                                  ? 'red'
                                                  : 'inherit',
                                    }}
                                >
                                    {averageTrend > 0
                                        ? `Up by ${averageTrend.toFixed(2)} grade points`
                                        : averageTrend < 0
                                          ? `Down by ${Math.abs(averageTrend).toFixed(2)} grade points`
                                          : 'Stable'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
