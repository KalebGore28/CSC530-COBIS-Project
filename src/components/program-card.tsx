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
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

import { termsCollection } from '@/integrations/tanstack-db/terms'
import { programsCollection } from '@/integrations/tanstack-db/programs'
import { departmentsCollection } from '@/integrations/tanstack-db/departments'
import { collegesCollection } from '@/integrations/tanstack-db/colleges'

type ProgramCardProps = {
    programCode: string
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

export function ProgramCard({
    programCode,
    startYear,
    startTerm,
    endYear,
    endTerm,
    setStartYear,
    setStartTerm,
    setEndYear,
    setEndTerm,
    exportData,
}: ProgramCardProps) {
    const { data: program } = useLiveQuery(
        (q) =>
            q
                .from({ programs: programsCollection })
                .leftJoin(
                    { departments: departmentsCollection },
                    ({ programs, departments }) =>
                        eq(programs.department_id, departments.id),
                )
                .leftJoin(
                    { colleges: collegesCollection },
                    ({ programs, colleges }) =>
                        eq(programs.college_id, colleges.id),
                )
                .select(({ programs, departments, colleges }) => ({
                    code: programs.id,
                    description: programs.description,
                    cip_code: programs.cip_code,
                    is_major: programs.is_major,
                    is_minor: programs.is_minor,
                    is_aacsb: programs.is_aacsb,
                    has_concentration: programs.has_concentration,
                    is_discontinued: programs.is_discontinued,
                    last_updated: programs.last_updated,
                    department_description: departments?.description,
                    college_description: colleges?.description,
                }))
                .where(({ programs }) => eq(programs.id, programCode))
                .findOne(),
        [programCode],
    )

    const { data: terms } = useLiveQuery((q) =>
        q.from({ terms: termsCollection }),
    )

    return (
        <Card className="mx-auto max-w-4xl overflow-hidden rounded-2xl border-2 pt-0 shadow-lg">
            <CardHeader className="bg-blue-950 pb-6 text-white">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="mb-1 text-sm font-semibold opacity-90">
                            {program?.code || 'N/A'}
                        </div>
                        <CardTitle className="text-2xl leading-tight font-bold">
                            {program?.description || 'Program Not Found'}
                        </CardTitle>
                    </div>
                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                        {program?.is_major && (
                            <Badge className="bg-white text-blue-600 hover:bg-gray-100">
                                Major
                            </Badge>
                        )}
                        {program?.is_minor && (
                            <Badge className="bg-white text-blue-600 hover:bg-gray-100">
                                Minor
                            </Badge>
                        )}
                        {program?.is_aacsb && (
                            <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-300">
                                AACSB
                            </Badge>
                        )}
                        {program?.has_concentration && (
                            <Badge className="bg-white text-blue-600 hover:bg-gray-100">
                                Concentration
                            </Badge>
                        )}
                        {program?.is_discontinued && (
                            <Badge variant="destructive">Discontinued</Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-6">
                {program ? (
                    <div className="space-y-6">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-800">
                                <div className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                    Department
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {program.department_description || 'N/A'}
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-800">
                                <div className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                    College
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {program.college_description || 'N/A'}
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:bg-gray-800">
                                <div className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                                    CIP Code
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {program.cip_code || 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Date Range Selectors */}
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950">
                            <h3 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Select Date Range
                            </h3>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Start Date */}
                                <div className="space-y-3">
                                    <div className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                        Start Period
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <Label
                                                htmlFor="start-year"
                                                className="mb-1 text-xs text-gray-600 dark:text-gray-400"
                                            >
                                                Year
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    setStartYear(
                                                        parseInt(value),
                                                    )
                                                }
                                                value={startYear.toString()}
                                            >
                                                <SelectTrigger className="border border-gray-200 bg-white">
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
                                                className="mb-1 text-xs text-gray-600 dark:text-gray-400"
                                            >
                                                Term
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    setStartTerm(value)
                                                }
                                                defaultValue={startTerm}
                                            >
                                                <SelectTrigger className="border border-gray-200 bg-white">
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
                                    <div className="text-xs font-semibold tracking-wide text-gray-600 uppercase dark:text-gray-400">
                                        End Period
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <Label
                                                htmlFor="end-year"
                                                className="mb-1 text-xs text-gray-600 dark:text-gray-400"
                                            >
                                                Year
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    setEndYear(parseInt(value))
                                                }
                                                value={endYear.toString()}
                                            >
                                                <SelectTrigger className="border border-gray-200 bg-white">
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
                                                className="mb-1 text-xs text-gray-600 dark:text-gray-400"
                                            >
                                                Term
                                            </Label>
                                            <Select
                                                onValueChange={(value) =>
                                                    setEndTerm(value)
                                                }
                                                value={endTerm}
                                            >
                                                <SelectTrigger className="border border-gray-200 bg-white">
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
                    <div className="py-8 text-center">
                        <p className="text-gray-500">
                            No program details found for code: {programCode}
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                {program?.last_updated && (
                    <div className="pt-2 text-center text-xs text-gray-500">
                        Last updated:{' '}
                        {new Date(program.last_updated).toLocaleDateString(
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
