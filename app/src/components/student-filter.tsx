"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import { GraphQLSearchInput, renderProgram } from "@/components/common/graphql-search-input";
import { Program, searchPrograms } from "@/utils/search";

export interface FilterState {
	academicLevels: string[];
	gpaRange: [number, number];
	selectedPrograms: Program[];
	programFilters: Record<string, Partial<Record<keyof Program, boolean>>>;
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

	// programs + per-program flag map
	const [selectedPrograms, setSelectedPrograms] = useState<Program[]>([]);
	const [programFilters, setProgramFilters] = useState<
		Record<string, Partial<Record<keyof Program, boolean>>>
	>({});

	const toggleLevel = (level: string) =>
		setFilters((f) => ({
			...f,
			academicLevels: f.academicLevels.includes(level)
				? f.academicLevels.filter((l) => l !== level)
				: [...f.academicLevels, level],
		}));

	const setGpa = (vals: number[]) =>
		setFilters((f) => ({
			...f,
			gpaRange: [vals[0], vals[1]] as [number, number],
		}));

	const addProgram = (p: Program) => {
		setSelectedPrograms((ps) =>
			ps.some((x) => x.code === p.code) ? ps : [...ps, p]
		);
		setProgramFilters((maps) => (maps[p.code] ? maps : { ...maps, [p.code]: {} }));
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

	const resetAll = () => {
		setFilters({ academicLevels: [], gpaRange: [0, 4.0] });
		setSelectedPrograms([]);
		setProgramFilters({});
		onResetFilters?.();
	};

	// only major & minor
	const FILTERABLE: { key: keyof Program; label: string }[] = [
		{ key: "is_major", label: "Major" },
		{ key: "is_minor", label: "Minor" },
	];

	return (
		<Card className="w-full">
			<CardContent className="pt-2">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Academic Level */}
					<div>
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
					<div>
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
					<div className="col-span-1 md:col-span-2 my-4">
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
					<div className="col-span-1 md:col-span-2 my-4">
						<Label>Program Filters</Label>
						<Card className="w-full mt-2">
							<CardContent>
								{selectedPrograms.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No programs selected
									</p>
								) : (
									<div className="space-y-2">
										{selectedPrograms.map((program) => (
											<div
												key={program.code}
												className="flex items-center justify-between"
											>
												<span className="text-sm font-medium truncate max-w-[50%]">
													{program.description}
												</span>
												<div className="flex items-center gap-4">
													{FILTERABLE.map(({ key, label }) =>
														program[key] ? (
															<label
																key={key}
																className="flex items-center space-x-1"
															>
																<Checkbox
																	checked={!!programFilters[program.code]?.[key]}
																	onCheckedChange={() =>
																		toggleProgramFlag(program.code, key)
																	}
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
								selectedPrograms,
								programFilters,
							})
						}
					>
						Apply
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
