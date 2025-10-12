import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { courses, programs } from "@/db/schema";

type Program = typeof programs.$inferSelect;
type Course = typeof courses.$inferSelect;

import {
	GraphQLSearchInput,
	renderProgram,
	renderCourse
} from "@/components/common/graphql-search-input";
import { Switch } from "@/components/ui/switch";
import { ProgramSearchBox } from "@/components/search/program-search";
import { CourseSearchBox } from "@/components/search/course-search";

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
	programFilters: Record<string, Partial<Record<keyof Program, boolean>>>;
	courseFilters: Record<string, {
		taken?: boolean;
		gradeOperator?: OperatorKey;
		grade?: string;
	}>;
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

	// academic & GPA
	const [filters, setFilters] = useState<{
		academicLevels: string[];
		gpaRange: [number, number];
	}>({
		academicLevels: [],
		gpaRange: [0, 4.0],
	});

	const [selectedPrograms, setSelectedPrograms] = useState<Program[]>([]);
	const [programFilters, setProgramFilters] = useState<
		Record<string, Partial<Record<keyof Program, boolean>>>
	>({});
	const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
	const [courseFilters, setCourseFilters] = useState<
		Record<string, {
			taken: boolean;
			gradeOperator?: OperatorKey;
			grade?: string;
		}>
	>({});

	const courseKey = (c: Course) => `${c.subject}${c.number}${c.suffix}`;


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
	const setProgram = (p: Program | null) => {
		if (!p) return;
		setSelectedPrograms((ps) =>
			ps.some((x) => x.code === p.code) ? ps : [...ps, p]
		);
	}


	// Course functions
	const setCourse = (c: Course | null) => {
		if (!c) return;
		const key = courseKey(c);
		setSelectedCourses(cs => cs.some(x => courseKey(x) === key) ? cs : [...cs, c]);
	}

	const toggleCourseTaken = (key: string) => {
		setCourseFilters(maps => {
			const cur = maps[key] ?? { taken: false };
			const taken = !cur.taken;

			return {
				...maps,
				[key]: {
					taken,
					...(taken
						? {
							gradeOperator: cur.gradeOperator ?? 'EQ',
							grade: cur.grade ?? 'A',
						}
						: {}),
				},
			};
		});
	};



	const resetAll = () => {
		setFilters({ academicLevels: [], gpaRange: [0, 4.0] });
		setSelectedPrograms([]);
		setProgramFilters({});
		setSelectedCourses([]);
		setCourseFilters({});
		onResetFilters?.();
	};

	const setCourseGradeOperator = (key: string, op: OperatorKey) => {
		setCourseFilters(maps => {
			const cur = maps[key] ?? {};
			return {
				...maps,
				[key]: {
					...cur,
					gradeOperator: op,
					grade: cur.grade ?? "A",
				},
			};
		});
	};

	const setCourseGrade = (key: string, grade: string) => {
		setCourseFilters(maps => {
			const cur = maps[key] ?? {};
			return {
				...maps,
				[key]: {
					...cur,
					grade,
					gradeOperator: cur.gradeOperator ?? 'EQ',
				},
			};
		});
	};

	type FilterableProgramKeys = 'is_major' | 'is_minor';
	const FILTERABLE: { key: FilterableProgramKeys; label: string }[] = [
		{ key: 'is_major', label: 'Major' },
		{ key: 'is_minor', label: 'Minor' },
	];

	return (
		<Card className="w-full">
			<CardContent>
				<ProgramSearchBox onSelectChange={setProgram} />
				<CourseSearchBox onSelectChange={setCourse} />


			</CardContent>
		</Card>
	);
};
