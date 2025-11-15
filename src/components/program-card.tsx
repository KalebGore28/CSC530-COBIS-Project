import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label';

import { programsCollection } from '@/collections/programs';
import { departmentsCollection } from '@/collections/departments';
import { collegesCollection } from '@/collections/colleges';
import { useLiveQuery, eq } from '@tanstack/react-db';

const termCodeMap: Record<string, string> = {
    '10': 'Spring',
    '50': 'Summer',
    '80': 'Fall',
    '90': 'Winter',
}

type ProgramCardProps = {
    programCode: string
    setStartYear?: (year: number) => void
    setStartTerm?: (term: string) => void
    setEndYear?: (year: number) => void
    setEndTerm?: (term: string) => void
}

export function ProgramCard({ programCode, setStartYear, setStartTerm, setEndYear, setEndTerm }: ProgramCardProps) {

    const { data: program } = useLiveQuery((q) =>
        q.from({ programs: programsCollection })
            .leftJoin({ departments: departmentsCollection }, ({ programs, departments }) =>
                eq(programs.department_code, departments.code)
            )
            .leftJoin({ colleges: collegesCollection }, ({ programs, colleges }) =>
                eq(programs.college_code, colleges.code)
            )
            .select(({ programs, departments, colleges }) => ({
                code: programs.code,
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
            .where(({ programs }) =>
                eq(programs.code, programCode)
            )
            .findOne()
    )

    return (
        <Card className="mx-auto border rounded-2xl overflow-hidden">
            <CardHeader>
                <CardTitle className="text-lg font-bold">
                    {program ? `${program.code} - ${program.description}` : 'Program Not Found'}
                </CardTitle>
            </CardHeader>

            <CardContent>
                {program ? (
                    <div className="space-y-4">
                        <p className="text-gray-600">{program.description || 'No description available'}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                            <div><span className="font-medium">Department:</span> {program.department_description || 'N/A'}</div>
                            <div><span className="font-medium">College:</span> {program.college_description || 'N/A'}</div>
                            <div><span className="font-medium">CIP Code:</span> {program.cip_code || 'N/A'}</div>
                            <div><span className="font-medium">Last Updated:</span> {program.last_updated ? new Date(program.last_updated).toLocaleDateString() : 'N/A'}</div>
                            <div><span className="font-medium">Program Type:</span> {program.is_major ? 'Major' : program.is_minor ? 'Minor' : 'N/A'}</div>
                            <div><span className="font-medium">Accreditation:</span> {program.is_aacsb ? 'AACSB' : 'N/A'}</div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {program.is_major && <Badge variant="default">Major</Badge>}
                            {program.is_minor && <Badge variant="default">Minor</Badge>}
                            {program.is_aacsb && <Badge variant="default">AACSB</Badge>}
                            {program.has_concentration && <Badge variant="default">Concentration</Badge>}
                            {program.is_discontinued && <Badge variant="destructive">Discontinued</Badge>}
                        </div>

                        {/* Range selectors */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex space-x-4">
                                <div className="space-y-1">
                                    <Label htmlFor="start-year">Start Year</Label>
                                    <Select
                                        onValueChange={(value) => setStartYear?.(parseInt(value))}
                                        defaultValue=""
                                    >
                                        <SelectTrigger className='w-35'>
                                            <SelectValue placeholder="Select Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Render the last 20 years up until the current year */}
                                            {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 19 + i)
                                                .sort((a, b) => b - a) // Sort descending
                                                .map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}

                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="start-term">Start Term</Label>
                                    <Select
                                        onValueChange={(value) => setStartTerm?.(value)}
                                        defaultValue=""
                                    >
                                        <SelectTrigger className='w-35'>
                                            <SelectValue placeholder="Select Term" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(termCodeMap).map(([code, name]) => (
                                                <SelectItem key={code} value={code}>
                                                    {name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <div className="space-y-1">
                                    <Label htmlFor="end-year">End Year</Label>
                                    <Select
                                        onValueChange={(value) => setEndYear?.(parseInt(value))}
                                        defaultValue=""
                                    >
                                        <SelectTrigger className='w-35'>
                                            <SelectValue placeholder="Select Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Render the last 20 years up until the current year */}
                                            {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 19 + i)
                                                .sort((a, b) => b - a) // Sort descending
                                                .map((year) => (
                                                    <SelectItem key={year} value={year.toString()}>
                                                        {year}
                                                    </SelectItem>
                                                ))}

                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="end-term">End Term</Label>
                                    <Select
                                        onValueChange={(value) => setEndTerm?.(value)}
                                        defaultValue=""
                                    >
                                        <SelectTrigger className='w-35'>
                                            <SelectValue placeholder="Select Term" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(termCodeMap).map(([code, name]) => (
                                                <SelectItem key={code} value={code}>
                                                    {name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">No program details found for code: {programCode}</p>
                )}
            </CardContent>
        </Card>
    )
}
