import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { coalesce, concat, ilike, or, useLiveQuery } from '@tanstack/react-db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import { coursesCollection } from '@/integrations/tanstack-db/courses'

export const Route = createFileRoute(
    '/_authenticated/_layout/enrollment/_layout/courses',
)({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const [search, setSearch] = useState('')

    const { data: courses, isLoading } = useLiveQuery(
        (q) =>
            q
                .from({ courses: coursesCollection })
                .where(({ courses }) =>
                    or(
                        ilike(
                            concat(
                                courses.subject,
                                coalesce(courses.number, ''),
                                courses.suffix,
                            ),
                            `%${search}%`,
                        ),
                        ilike(courses.title, `%${search}%`),
                    ),
                )
                .limit(100)
                .orderBy(({ courses }) => courses.subject, 'asc'),
        [search], // Re-run when search changes
    )

    return (
        <Card className="max-w-4xl mx-auto mt-6">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    Search Courses
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Input
                        placeholder="Search by subject, number, or title..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                        No courses found.
                    </p>
                ) : (
                    <>
                        <p className="text-xs text-muted-foreground mb-2">
                            Limited to 100 results. Refine your search for more
                            specific results.
                        </p>

                        <div className="space-y-3">
                            {courses.map((course) => (
                                <div
                                    key={`${course.subject}-${course.number}-${course.suffix || ''}`}
                                    onClick={() =>
                                        navigate({
                                            to: '/enrollment/courses/$courseId',
                                            params: {
                                                courseId: `${course.subject}${course.number}${course.suffix || ''}`,
                                            },
                                        })
                                    }
                                    className="border rounded-md p-3 hover:bg-accent cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">
                                                {course.subject} {course.number}
                                                {course.suffix && (
                                                    <span className="ml-1">
                                                        {course.suffix}
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {course.title}
                                            </p>
                                        </div>

                                        <div className="flex gap-2 flex-wrap justify-end text-right">
                                            {course.hours && (
                                                <Badge variant="outline">
                                                    {course.hours} hr
                                                    {course.hours > 1
                                                        ? 's'
                                                        : ''}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {course.last_updated && (
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            Last updated:{' '}
                                            {new Date(
                                                course.last_updated,
                                            ).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
