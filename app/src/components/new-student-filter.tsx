"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

import { searchPrograms } from "@/utils/search";
import {
	GraphQLSearchInput,
	renderProgram,
} from "@/components/common/graphql-search-input";
import { Program } from "@/utils/search";

// Define a filter entry pairing a program with user-selected filter types
interface ProgramFilter {
	program: Program;
	filterTypes: {
		major: boolean;
		minor: boolean;
		concentration: boolean;
	};
}

interface FilterState {
	academicLevels: string[];
	gpaRange: [number, number];
	programFilters: ProgramFilter[];
	// …other filters…
}

interface StudentFiltersProps {
	onApplyFilters: (filters: FilterState) => void;
	onResetFilters?: () => void;
}

export const StudentFilters = ({
	onApplyFilters,
	onResetFilters,
}: StudentFiltersProps) => {
	const academicLevelOptions = [
		"Freshman",
		"Sophomore",
		"Junior",
		"Senior",
		"Graduate",
	];

	const [filters, setFilters] = useState<FilterState>({
		academicLevels: [],
		gpaRange: [0, 4.0],
		programFilters: [],
		// …initialize other filters…
	});

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

	const addProgram = (p: Program) =>
		setFilters((f) => ({
			...f,
			programFilters: f.programFilters.some((pf) => pf.program.code === p.code)
				? f.programFilters
				: [
					...f.programFilters,
					{ program: p, filterTypes: { major: false, minor: false, concentration: false } },
				],
		}));
	const removeProgram = (p: Program) =>
		setFilters((f) => ({
			...f,
			programFilters: f.programFilters.filter((pf) => pf.program.code !== p.code),
		}));

	// Toggle one of the filter types for a given program
	const toggleProgramFilter = (
		programCode: string,
		type: keyof ProgramFilter['filterTypes'],
		value: boolean
	) =>
		setFilters((f) => ({
			...f,
			programFilters: f.programFilters.map((pf) =>
				pf.program.code === programCode
					? { ...pf, filterTypes: { ...pf.filterTypes, [type]: value } }
					: pf
			),
		}));

	const resetAll = () => {
		setFilters({
			academicLevels: [],
			gpaRange: [0, 4.0],
			programFilters: [],
			// …reset other filters…
		});
		onResetFilters?.();
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Student Filters</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Academic Level */}
					<div className="space-y-2">
						<Label>Academic Level</Label>
						<div className="grid grid-cols-2 gap-2">
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
					<div className="space-y-4">
						<div className="flex justify-between">
							<Label>GPA Range</Label>
							<span className="text-sm text-muted-foreground">
								{filters.gpaRange[0].toFixed(1)} – {filters.gpaRange[1].toFixed(1)}
							</span>
						</div>
						<Slider
							defaultValue={[0, 4.0]}
							value={[filters.gpaRange[0], filters.gpaRange[1]]}
							min={0}
							max={4.0}
							step={0.1}
							onValueChange={setGpa}
						/>
					</div>

					{/* Program Search */}
					<div className="space-y-2">
						<Label>Programs</Label>
						<GraphQLSearchInput
							searchFn={searchPrograms}
							selectedItems={filters.programFilters.map((pf) => pf.program)}
							onSelect={addProgram}
							onRemove={removeProgram}
							placeholder="Search for programs"
							renderResult={renderProgram}
							className="w-full"
						/>
					</div>

					{/* Program Filters */}
					<div className="space-y-2">
						<Label>Program Filters</Label>
						{/* Show checkboxes for major/minor/concentration */}
						{/* After selecting, let user pick major/minor/concentration */}
						{filters.programFilters.map(({ program, filterTypes }) => (
							<Card key={program.code} className="w-full">
								<CardHeader>
									<CardTitle className="text-lg">{program.description}</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-6">
										<label className="flex items-center space-x-2">
											<Checkbox
												checked={filterTypes.major}
												onCheckedChange={(v) => toggleProgramFilter(program.code, 'major', Boolean(v))}
											/>
											<span>Major</span>
										</label>
										<label className="flex items-center space-x-2">
											<Checkbox
												checked={filterTypes.minor}
												onCheckedChange={(v) => toggleProgramFilter(program.code, 'minor', Boolean(v))}
											/>
											<span>Minor</span>
										</label>
										<label className="flex items-center space-x-2">
											<Checkbox
												checked={filterTypes.concentration}
												onCheckedChange={(v) => toggleProgramFilter(program.code, 'concentration', Boolean(v))}
											/>
											<span>Concentration</span>
										</label>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				<div className="flex justify-end space-x-3 mt-6">
					<Button variant="outline" onClick={resetAll}>
						Reset
					</Button>
					<Button onClick={() => onApplyFilters(filters)}>Apply</Button>
				</div>
			</CardContent>
		</Card>
	);
};
