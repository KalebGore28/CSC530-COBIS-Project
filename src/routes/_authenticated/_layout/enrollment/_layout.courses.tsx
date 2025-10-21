import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import fuzzysort from 'fuzzysort'

import { courses } from '@/db/schema'

type Course = typeof courses.$inferSelect

// GraphQL imports
import { useQuery } from '@tanstack/react-query'
import { execute } from '@/graphql/execute'
import { graphql } from '@/graphql'

const coursesPageQuery = graphql(`
  query coursesPageQuery {
    courses {
      subject
      suffix
      number
      title
      hours
      last_updated
      department_code
      college_code
    }
  }
`);

function fuzzySearchCourses(courses: Course[], searchTerm: string) {
  if (!searchTerm) return courses
  const results = fuzzysort.go(searchTerm, courses, {
    keys: ['subject', 'suffix', 'number', 'title'],
    threshold: -10000,
  })
  // @ts-ignore
  return results.map((r) => r.obj)
}

export const Route = createFileRoute(
  '/_authenticated/_layout/enrollment/_layout/courses',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['coursesPageQuery'],
    queryFn: () => execute(coursesPageQuery),
  })

  const courses = data?.courses ?? []
  // Convert last_updated from string to Date for each course
  const normalizedCourses = courses.map((c) => ({
    subject: c.subject,
    suffix: c.suffix,
    number: c.number,
    title: c.title,
    hours: c.hours,
    department_code: c.department_code ?? null,
    college_code: c.college_code ?? null,
    last_updated: c.last_updated ? new Date(c.last_updated) : new Date(0),
  }))

  const allFiltered = fuzzySearchCourses(normalizedCourses, search)
  const limitedCourses = allFiltered.slice(0, 20)


  return (
    <Card className="max-w-4xl mx-auto mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Search Courses</CardTitle>
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
        ) : limitedCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No courses found.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-2">
              Showing {limitedCourses.length} of {allFiltered.length} results
              {allFiltered.length > 20 && ' (limited to 20)'}
            </p>

            <div className="space-y-3">
              {limitedCourses.map((course) => (
                <div
                  key={`${course.subject}-${course.number}-${course.suffix || ''}`}
                  onClick={() =>
                    navigate({
                      to: '/enrollment/courses/$courseId',
                      params: { courseId: `${course.subject}${course.number}${course.suffix || ''}` },
                    })
                  }
                  className="border rounded-md p-3 hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {course.subject} {course.number}
                        {course.suffix && <span className="ml-1">{course.suffix}</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">{course.title}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap justify-end text-right">
                      {course.hours && (
                        <Badge variant="outline">{course.hours} hr{course.hours > 1 ? 's' : ''}</Badge>
                      )}
                      {course.department_code && (
                        <Badge variant="secondary">{course.department_code}</Badge>
                      )}
                      {course.college_code && (
                        <Badge variant="default">{course.college_code}</Badge>
                      )}
                    </div>
                  </div>

                  {course.last_updated && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Last updated: {new Date(course.last_updated).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
