import React, { useEffect, useState } from "react";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "../ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const TermRangeSelectorSkeleton: React.FC = () => (
	<Card className="col-span-2">
		<CardHeader>
			{/* Skeleton for the title */}
			<Skeleton className="h-6 w-40" />
			{/* Skeleton for the description */}
			<Skeleton className="h-4 w-[60%] mt-2" />
		</CardHeader>
		<CardContent className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* ────── Start Range Skeleton ────── */}
				<div>
					{/* Skeleton for "Start Term / Year" label */}
					<Skeleton className="h-4 w-28 mb-1" />
					<div className="flex space-x-2">
						{/* Skeleton for start-year select */}
						<Skeleton className="h-10 w-[100px]" />
						{/* Skeleton for start-term select */}
						<Skeleton className="h-10 w-[120px]" />
					</div>
				</div>

				{/* ────── End Range Skeleton ────── */}
				<div>
					{/* Skeleton for "End Term / Year" label */}
					<Skeleton className="h-4 w-28 mb-1" />
					<div className="flex space-x-2">
						{/* Skeleton for end-year select */}
						<Skeleton className="h-10 w-[100px]" />
						{/* Skeleton for end-term select */}
						<Skeleton className="h-10 w-[120px]" />
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
);


export interface TermRange {
	startYear: number;
	startTerm: "10" | "50" | "80" | "90"; // Spring, Summer, Fall, Winter
	endYear: number;
	endTerm: "10" | "50" | "80" | "90"; // Spring, Summer, Fall, Winter
}

const termMap: Record<string, string> = {
	"10": "Spring",
	"50": "Summer",
	"80": "Fall",
	"90": "Winter",
};

interface TermRangeSelectorProps {
	/**
	 * Array of available years (e.g. [2018, 2019, 2020, …]).
	 * The component will use these to populate both the start‐year and end‐year dropdowns.
	 */
	years: number[];
	/**
	 * (Optional) Initial values. If you omit this, it will default to
	 * the first entry in `years` and “10” (Spring) for both start and end.
	 */
	defaultValue?: Partial<TermRange>;
	/**
	 * Called any time one of the four selectors changes.
	 * Emits the full `{ startYear, startTerm, endYear, endTerm }` object.
	 */
	onChange: (range: TermRange) => void;
}

export const TermRangeSelector: React.FC<TermRangeSelectorProps> = ({
	years,
	defaultValue,
	onChange,
}) => {
	// If the consumer didn’t pass defaults, fall back to:
	//   - first year in `years` (if provided; otherwise current year),
	//   - term “10” (Spring).
	const firstYear = years.length > 0 ? years[0] : new Date().getFullYear();
	const {
		startYear: dvSY = firstYear,
		startTerm: dvST = "10",
		endYear: dvEY = firstYear,
		endTerm: dvET = "10",
	} = defaultValue || {};

	const [startYear, setStartYear] = useState<number>(dvSY);
	const [startTerm, setStartTerm] = useState<"10" | "50" | "80" | "90">(dvST);
	const [endYear, setEndYear] = useState<number>(dvEY);
	const [endTerm, setEndTerm] = useState<"10" | "50" | "80" | "90">(dvET);

	// Whenever any piece of state changes, notify the parent.
	useEffect(() => {
		onChange({ startYear, startTerm, endYear, endTerm });
	}, [startYear, startTerm, endYear, endTerm]);

	return (
		<Card className="col-span-2">
			<CardHeader>
				<CardTitle>Term Range Selector</CardTitle>
				<CardDescription>
					Select a range of terms to filter data. This will allow you to view
					student enrollment data within the specified term range.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* ────── Start Range ────── */}
					<div>
						<Label htmlFor="start-year" className="mb-1">
							Start Term / Year
						</Label>
						<div className="flex space-x-2">
							{/* Start Year */}
							<Select
								value={String(startYear)}
								onValueChange={(val) => {
									// Convert back to number
									const num = Number(val);
									if (!isNaN(num)) setStartYear(num);
								}}
							>
								<SelectTrigger id="start-year" className="w-[100px]">
									<SelectValue placeholder="Year" />
								</SelectTrigger>
								<SelectContent>
									{years.map((y) => (
										<SelectItem key={y} value={String(y)}>
											{y}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{/* Start Term */}
							<Select
								value={startTerm}
								onValueChange={(val) => setStartTerm(val as "10" | "50" | "80" | "90")}
							>
								<SelectTrigger id="start-term" className="w-[120px]">
									<SelectValue placeholder="Term" />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(termMap).map(([code, label]) => (
										<SelectItem key={code} value={code}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* ────── End Range ────── */}
					<div>
						<Label htmlFor="end-year" className="mb-1">
							End Term / Year
						</Label>
						<div className="flex space-x-2">
							{/* End Year */}
							<Select
								value={String(endYear)}
								onValueChange={(val) => {
									const num = Number(val);
									if (!isNaN(num)) setEndYear(num);
								}}
							>
								<SelectTrigger id="end-year" className="w-[100px]">
									<SelectValue placeholder="Year" />
								</SelectTrigger>
								<SelectContent>
									{years.map((y) => (
										<SelectItem key={y} value={String(y)}>
											{y}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							{/* End Term */}
							<Select value={endTerm} onValueChange={(val) => setEndTerm(val as "10" | "50" | "80" | "90")}>
								<SelectTrigger id="end-term" className="w-[120px]">
									<SelectValue placeholder="Term" />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(termMap).map(([code, label]) => (
										<SelectItem key={code} value={code}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			</CardContent>
		</Card >
	);
};
