import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
	GraphQLSearchInput,
	renderProgram,
	renderCourse
} from "@/components/common/graphql-search-input";
import {
	Program,
	searchPrograms,
	Course,
	searchCourses
} from "@/utils/search";
import { Switch } from "@/components/ui/switch";

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
	const addProgram = (p: Program) => {
		setSelectedPrograms((ps) =>
			ps.some((x) => x.code === p.code) ? ps : [...ps, p]
		);

		setProgramFilters((maps) =>
			maps[p.code]
				? maps
				: {
					...maps,
					[p.code]: {
						is_major: p.is_major,
						is_minor: p.is_minor,
					},
				}
		);
	};

	const removeProgram = (p: Program) => {
		setSelectedPrograms((ps) => ps.filter((x) => x.code !== p.code));
		setProgramFilters((maps) => {
			const { [p.code]: _, ...rest } = maps;
			return rest;
		});
	};

	const toggleProgramFlag = (programCode: string, flag: keyof Program) => {
		setProgramFilters((maps) => ({
			...maps,
			[programCode]: {
				...(maps[programCode] || {}),
				[flag]: !((maps[programCode]?.[flag]) ?? false),
			},
		}));
	};

	// Course functions
	const addCourse = (c: Course) => {
		const key = courseKey(c);

		setSelectedCourses(cs =>
			cs.some(x => courseKey(x) === key) ? cs : [...cs, c]
		);

		setCourseFilters(maps => {
			if (maps[key]) return maps;
			return {
				...maps,
				[key]: {
					taken: true,
					gradeOperator: 'EQ' as keyof typeof ComparisonOperator,
					grade: "A",
				},
			};
		});
	};

	const removeCourse = (c: Course) => {
		const key = courseKey(c);
		setSelectedCourses(cs => cs.filter(x => courseKey(x) !== key));
		setCourseFilters(({ [key]: _, ...rest }) => rest);
	};

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
			<CardContent className="pt-2">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

					{/* Academic Level */}
					<div className="border rounded-lg p-4 shadow">
						<Label>Academic Level</Label>
						<div className="grid grid-cols-2 gap-2 mt-2">
							{academicLevelOptions.map((level) => (
								<label key={level} className="flex items-center space-x-2">
									<Checkbox
										checked={filters.academicLevels.includes(level)}
										onCheckedChange={() => toggleLevel(level)}
									/>
									<span>{level}</span>
								</label>
							))}
						</div>
					</div>

					{/* GPA Range */}
					<div className="border rounded-lg p-4 shadow">
						<div className="flex justify-between">
							<Label>GPA Range</Label>
							<span className="text-sm text-muted-foreground">
								{filters.gpaRange[0].toFixed(1)} – {filters.gpaRange[1].toFixed(1)}
							</span>
						</div>
						<Slider
							className="mt-2"
							defaultValue={[0, 4.0]}
							value={[filters.gpaRange[0], filters.gpaRange[1]]}
							min={0}
							max={4.0}
							step={0.1}
							onValueChange={setGpa}
						/>
					</div>

					{/* Program Search */}
					<div className="col-span-1 md:col-span-2">
						<Label>Programs</Label>
						<GraphQLSearchInput
							searchFn={searchPrograms}
							selectedItems={selectedPrograms}
							onSelect={addProgram}
							onRemove={removeProgram}
							placeholder="Search for programs"
							renderResult={renderProgram}
							className="w-full mt-2"
						/>
					</div>

					{/* Program Filters */}
					<div className="col-span-1 md:col-span-2">
						<Label>Program Filters</Label>
						<Card className="w-full mt-2">
							<CardContent>
								{!selectedPrograms.length ? (
									<p className="text-sm text-muted-foreground">No programs selected</p>
								) : (
									<div className="space-y-2">
										{selectedPrograms.map(({ code, description, ...program }) => (
											<div key={code} className="flex flex-wrap items-center justify-between gap-2">
												<span className="text-sm font-medium">{description}</span>
												<div className="flex items-center gap-4 border rounded-lg p-2">
													{FILTERABLE.map(({ key, label }) =>
														program[key] ? (
															<label key={key} className="flex items-center space-x-1">
																<Checkbox
																	checked={!!programFilters[code]?.[key]}
																	onCheckedChange={() => toggleProgramFlag(code, key)}
																/>
																<span className="text-sm">{label}</span>
															</label>
														) : null
													)}
												</div>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Course Search */}
					<div className="col-span-1 md:col-span-2">
						<Label>Courses</Label>
						<GraphQLSearchInput
							// Wrap searchCourses to map Course to HasCodeDesc
							searchFn={async (query: string) => {
								const courses = await searchCourses(query);
								return courses.map(c => ({
									code: `${c.subject}-${c.number}${c.suffix ? `-${c.suffix}` : ''}`, // Combine subject, number, suffix for code
									description: c.title, // Use title as description
									originalCourse: c,
								}));
							}}
							// Map selectedCourses for display in the component
							selectedItems={selectedCourses.map(c => ({
								code: `${c.subject}-${c.number}${c.suffix ? `-${c.suffix}` : ''}`,
								description: c.title,
								originalCourse: c, // Include original course data
							}))}
							// Adapt onSelect to extract the original course
							onSelect={(item: any) => { // Use 'any' or define a mapped type if needed
								if (item.originalCourse) {
									addCourse(item.originalCourse as Course);
								}
							}}
							// Adapt onRemove to extract the original course
							onRemove={(item: any) => { // Use 'any' or define a mapped type if needed
								if (item.originalCourse) {
									removeCourse(item.originalCourse as Course);
								}
							}}
							// Adapt renderResult to use the mapped structure or original course
							renderResult={(item: any) => { // Use 'any' or define a mapped type
								// Assuming renderCourse expects the original Course object
								if (item.originalCourse) {
									return renderCourse(item.originalCourse as Course);
								}
								// Fallback or alternative rendering if needed
								return <div>{item.code}: {item.description}</div>;
							}}
							placeholder="Search for courses"
							className="w-full mt-2"
						/>
					</div>

					{/* Course Filters */}
					<div className="col-span-1 md:col-span-2">
						<Label>Course Filters</Label>
						<Card className="w-full mt-2">
							<CardContent>
								{!selectedCourses.length ? (
									<p className="text-sm text-muted-foreground">No courses selected</p>
								) : (
									<div className="space-y-2">
										{selectedCourses.map(c => {
											const key = courseKey(c);
											const { taken, gradeOperator, grade } = courseFilters[key] || { taken: false };

											return (
												<div key={key} className="w-full flex flex-wrap items-center justify-between gap-2 border rounded-lg p-2">
													<span className="text-sm font-medium truncate">
														{c.subject} {c.number}{c.suffix} — {c.title}
													</span>

													{taken &&
														<div className="flex flex-wrap justify-start gap-2">
															<Select value={gradeOperator} onValueChange={v => setCourseGradeOperator(key, v as OperatorKey)}>
																<SelectTrigger className="min-w-[70px]">
																	<SelectValue placeholder="Op" />
																</SelectTrigger>
																<SelectContent>
																	{(Object.keys(ComparisonOperator) as OperatorKey[]).map(opKey => (
																		<SelectItem key={opKey} value={opKey}>
																			{ComparisonOperator[opKey]}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>

															<Select value={grade} onValueChange={v => setCourseGrade(key, v)}>
																<SelectTrigger className="min-w-[70px]">
																	<SelectValue placeholder="Grade" />
																</SelectTrigger>
																<SelectContent>
																	{['A', 'B', 'C', 'D', 'E'].map(g => (
																		<SelectItem key={g} value={g}>{g}</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</div>
													}

													<div className="flex items-center justify-self-end">
														<label className="flex items-center space-x-1">
															<Switch
																checked={taken}
																onCheckedChange={() => toggleCourseTaken(key)}
															/>
															<span className="text-sm">{taken ? 'Taken' : 'Not Taken'}</span>
														</label>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</CardContent>
						</Card>
					</div>

				</div>

				<div className="flex justify-end space-x-3 mt-6">
					<Button variant="outline" onClick={resetAll}>
						Reset
					</Button>
					<Button
						onClick={() =>
							onApplyFilters({
								academicLevels: filters.academicLevels,
								gpaRange: filters.gpaRange,
								programFilters,
								courseFilters,
							})
						}
					>
						Run Search
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
