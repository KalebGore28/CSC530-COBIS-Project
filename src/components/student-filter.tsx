import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

import { courses, programs } from "@/db/schema";

type Program = typeof programs.$inferSelect;
type Course = typeof courses.$inferSelect;

import { ProgramSearchBox, ExtendedProgramSearch } from "@/components/search/program-search";
import { CourseSearchBox, ExtendedCourseSearch } from "@/components/search/course-search";

enum ComparisonOperator {
	EQ = "Equal",
	NE = "Not Equal",
	LT = "Less Than",
	LTE = "Less Than or Equal",
	GT = "Greater Than",
	GTE = "Greater Than or Equal",
}

type OperatorKey = keyof typeof ComparisonOperator;


export interface FilterState {
	academicLevels: string[];
	gpaRange: [number, number];
	programFilter: {
		code?: string;
		is_major?: boolean;
		is_minor?: boolean;
	};
	courseFilter: {
		course_id?: string;
		taken?: boolean;
		comparison?: OperatorKey;
		grade?: string;
	};
}

interface StudentFiltersProps {
	onApplyFilters: (filters: FilterState) => void;
	onResetFilters?: () => void;
}

export const StudentFilters = ({
	onApplyFilters,
	onResetFilters,
}: StudentFiltersProps) => {
	const academicLevelOptions = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"];
	const courseKey = (c: Course) => `${c.subject}${c.number}${c.suffix}`;

	// academic & GPA
	const [filters, setFilters] = useState<FilterState>({
		academicLevels: [],
		gpaRange: [0, 4.0],
		programFilter: {},
		courseFilter: {},
	});




	// Academic Level
	const toggleLevel = (level: string) =>
		setFilters((f) => ({
			...f,
			academicLevels: f.academicLevels.includes(level)
				? f.academicLevels.filter((l) => l !== level)
				: [...f.academicLevels, level],
		}));

	// GPA Range
	const setGpa = (vals: number[]) =>
		setFilters((f) => ({
			...f,
			gpaRange: [vals[0], vals[1]] as [number, number],
		}));

	// Program functions
	const setProgram = (p: ExtendedProgramSearch | null) => {
		if (!p) return;
		setFilters((f) => ({
			...f,
			programFilter: {
				code: p.code,
				is_major: p.is_major,
				is_minor: p.is_minor,
			},
		}));
	}


	// Course functions
	const setCourse = (c: ExtendedCourseSearch | null) => {
		if (!c) return;
		const key = courseKey(c);
		setFilters((f) => ({
			...f,
			courseFilter: {
				course_id: key,
				taken: c.taken,
				comparison: c.comparison as OperatorKey,
				grade: c.grade,
			},
		}));
	}

	return (
		<Card className="w-full">
			<CardContent className="flex flex-col gap-4">
				{/* Top Filters Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Academic Level */}
					<div className="flex flex-col gap-2 border rounded-md p-4 bg-muted/30">
						<span className="text-md font-semibold">Academic Level</span>
						<div className="flex flex-wrap gap-3">
							{academicLevelOptions.map((level) => (
								<label
									key={level}
									htmlFor={`level-${level}`}
									className="flex items-center gap-2 cursor-pointer select-none"
								>
									<Checkbox
										checked={filters.academicLevels.includes(level)}
										onCheckedChange={() => toggleLevel(level)}
										id={`level-${level}`}
									/>
									<span className="text-sm">{level}</span>
								</label>
							))}
						</div>
					</div>

					{/* GPA Range */}
					<div className="flex flex-col gap-2 border rounded-md p-4 bg-muted/30">
						<span className="text-md font-semibold">GPA Range</span>
						<div className="flex flex-col gap-2">
							<Slider
								value={[filters.gpaRange[0], filters.gpaRange[1]]}
								onValueChange={setGpa}
								step={0.1}
								min={0}
								max={4.0}
								className="w-full"
							/>
							<div className="flex justify-between text-sm font-medium text-muted-foreground">
								<span>{filters.gpaRange[0].toFixed(1)}</span>
								<span>{filters.gpaRange[1].toFixed(1)}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Program & Course Filters */}
				<div className="flex flex-col gap-2">
					<span className="text-md font-semibold">Program Filter</span>
					<ProgramSearchBox onSelectChange={setProgram} />
				</div>
				<div className="flex flex-col gap-2">
					<span className="text-md font-semibold">Course Filter</span>
					<CourseSearchBox onSelectChange={setCourse} />
				</div>
			</CardContent>
		</Card>

	);
};
