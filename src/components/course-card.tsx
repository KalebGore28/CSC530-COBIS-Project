import { eq, useLiveQuery } from '@tanstack/react-db'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

import { termsCollection } from '@/integrations/tanstack-db/terms'
import { coursesCollection } from '@/integrations/tanstack-db/courses'
import { departmentsCollection } from '@/integrations/tanstack-db/departments'
import { collegesCollection } from '@/integrations/tanstack-db/colleges'

type CourseCardProps = {
    courseCode: string
    startYear: number
    startTerm: string
    endYear: number
    endTerm: string
    setStartYear: (year: number) => void
    setStartTerm: (term: string) => void
    setEndYear: (year: number) => void
    setEndTerm: (term: string) => void
    exportData?: () => void
}

const termOptions = [
    { label: 'Spring', value: '10' },
    { label: 'Summer', value: '50' },
    { label: 'Fall', value: '80' },
    { label: 'Winter', value: '90' },
]

export function CourseCard({
    courseCode,
    startYear,
    startTerm,
    endYear,
    endTerm,
    setStartYear,
    setStartTerm,
    setEndYear,
    setEndTerm,
    exportData,
}: CourseCardProps) {
    const { data: course } = useLiveQuery(
        (q) =>
            q
                .from({ courses: coursesCollection })
                .leftJoin(
                    { departments: departmentsCollection },
                    ({ courses, departments }) =>
                        eq(courses.department_id, departments.id),
                )
                .leftJoin(
                    { colleges: collegesCollection },
                    ({ courses, colleges }) =>
                        eq(courses.college_id, colleges.id),
                )
                .where(({ courses }) => eq(courses.id, courseCode))
                .select(({ courses, departments, colleges }) => ({
                    code: courses.id,
                    subject: courses.subject,
                    number: courses.number,
                    suffix: courses.suffix,
                    title: courses.title,
                    hours: courses.hours,
                    last_updated: courses.last_updated,
                    department_description: departments?.description,
                    college_description: colleges?.description,
                }))
                .findOne(),
        [courseCode],
    )

    const { data: terms } = useLiveQuery((q) =>
        q.from({ terms: termsCollection }),
    )

    return (
        <Card className="max-w-4xl mx-auto border-2 rounded-2xl shadow-lg overflow-hidden pt-0">
            <CardHeader className="bg-blue-950 text-white pb-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-sm font-semibold opacity-90 mb-1">
                            {course?.code || 'N/A'}
                        </div>
                        <CardTitle className="text-2xl font-bold leading-tight">
                            {course?.title || 'Course Not Found'}
                        </CardTitle>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-6">
                {course ? (
                    <div className="space-y-6">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                    Department
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {course.department_description || 'N/A'}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                    College
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {course.college_description || 'N/A'}
                                </div>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                                    Hours
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {course.hours > 1
                                        ? `${course.hours} hrs`
                                        : `${course.hours} hr` || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Date Range Selectors */}
                        <div className="bg-blue-50 dark:bg-blue-950 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                Select Date Range
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Start Date */}
                                <div className="space-y-3">
                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                        Start Period
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <Label
                                                htmlFor="start-year"
                                                className="text-xs text-gray-600 dark:text-gray-400 mb-1"
                                            >
                                                Year
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    setStartYear(
                                                        parseInt(value ?? ''),
                                                    )
                                                }
                                                value={startYear.toString()}
                                            >
                                                <SelectTrigger className="bg-white border border-gray-200">
                                                    <SelectValue placeholder="Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from(
                                                        { length: 20 },
                                                        (_, i) =>
                                                            new Date().getFullYear() -
                                                            19 +
                                                            i,
                                                    )
                                                        .sort((a, b) => b - a)
                                                        .map((year) => (
                                                            <SelectItem
                                                                key={year}
                                                                value={year.toString()}
                                                            >
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1">
                                            <Label
                                                htmlFor="start-term"
                                                className="text-xs text-gray-600 dark:text-gray-400 mb-1"
                                            >
                                                Term
                                            </Label>
                                            <Select
                                                items={termOptions}
                                                onValueChange={(value) =>
                                                    setStartTerm(value ?? '')
                                                }
                                                defaultValue={startTerm}
                                            >
                                                <SelectTrigger className="bg-white border border-gray-200">
                                                    <SelectValue placeholder="Term" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {terms.map((term) => (
                                                        <SelectItem
                                                            key={term.id}
                                                            value={term.id}
                                                        >
                                                            {term.description}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* End Date */}
                                <div className="space-y-3">
                                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                        End Period
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <Label
                                                htmlFor="end-year"
                                                className="text-xs text-gray-600 dark:text-gray-400 mb-1"
                                            >
                                                Year
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    setEndYear(
                                                        parseInt(value ?? ''),
                                                    )
                                                }
                                                value={endYear.toString()}
                                            >
                                                <SelectTrigger className="bg-white border border-gray-200">
                                                    <SelectValue placeholder="Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from(
                                                        { length: 20 },
                                                        (_, i) =>
                                                            new Date().getFullYear() -
                                                            19 +
                                                            i,
                                                    )
                                                        .sort((a, b) => b - a)
                                                        .map((year) => (
                                                            <SelectItem
                                                                key={year}
                                                                value={year.toString()}
                                                            >
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex-1">
                                            <Label
                                                htmlFor="end-term"
                                                className="text-xs text-gray-600 dark:text-gray-400 mb-1"
                                            >
                                                Term
                                            </Label>
                                            <Select
                                                items={termOptions}
                                                onValueChange={(value) =>
                                                    setEndTerm(value ?? '')
                                                }
                                                value={endTerm}
                                            >
                                                <SelectTrigger className="bg-white border border-gray-200">
                                                    <SelectValue placeholder="Term" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {terms.map((term) => (
                                                        <SelectItem
                                                            key={term.id}
                                                            value={term.id}
                                                        >
                                                            {term.description}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            No course details found for code: {courseCode}
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                {course?.last_updated && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                        Last updated:{' '}
                        {new Date(course.last_updated).toLocaleDateString(
                            'en-US',
                            {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            },
                        )}
                    </div>
                )}
                {exportData && (
                    <div className="text-center">
                        <Button onClick={exportData}>Export Data</Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
