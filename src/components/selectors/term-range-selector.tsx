import React, { useState } from "react";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface TermRange {
	startYear: number;
	startTerm: "10" | "50" | "80" | "90";
	endYear: number;
	endTerm: "10" | "50" | "80" | "90";
}

const termMap: Record<string, string> = {
	"10": "Spring",
	"50": "Summer",
	"80": "Fall",
	"90": "Winter",
};

interface TermRangeSelectorProps {
	years: number[];
	defaultValue?: Partial<TermRange>;
	onChange: (range: TermRange) => void;
}

export const TermRangeSelector: React.FC<TermRangeSelectorProps> = ({
	years,
	defaultValue,
	onChange,
}) => {
	const firstYear = years.length > 0 ? years[0] : new Date().getFullYear();
	const {
		startYear: dvSY = firstYear,
		startTerm: dvST = "10",
		endYear: dvEY = firstYear,
		endTerm: dvET = "10",
	} = defaultValue || {};

	const [range, setRange] = useState<TermRange>({
		startYear: dvSY,
		startTerm: dvST,
		endYear: dvEY,
		endTerm: dvET,
	});

	const updateRange = (key: keyof TermRange, value: string | number) => {
		setRange((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = () => {
		onChange(range);
	};

	return (
		<Card className="col-span-2">
			<CardHeader className="pb-3">
				<CardTitle className="text-base font-medium">Term Range</CardTitle>
				<CardDescription className="text-sm">
					Select a range of terms to filter data, then click <b>Load Data</b>.
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-3">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
					{/* ────── Start Range ────── */}
					<div className="space-y-1">
						<Label htmlFor="start-year">Start Term / Year</Label>
						<div className="flex space-x-1.5">
							<Select
								value={String(range.startYear)}
								onValueChange={(val) => {
									const num = Number(val);
									if (!isNaN(num)) updateRange("startYear", num);
								}}
							>
								<SelectTrigger id="start-year" className="w-[90px] h-8 text-sm">
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

							<Select
								value={range.startTerm}
								onValueChange={(val) =>
									updateRange("startTerm", val as TermRange["startTerm"])
								}
							>
								<SelectTrigger id="start-term" className="w-[110px] h-8 text-sm">
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
					<div className="space-y-1">
						<Label htmlFor="end-year">End Term / Year</Label>
						<div className="flex space-x-1.5">
							<Select
								value={String(range.endYear)}
								onValueChange={(val) => {
									const num = Number(val);
									if (!isNaN(num)) updateRange("endYear", num);
								}}
							>
								<SelectTrigger id="end-year" className="w-[90px] h-8 text-sm">
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

							<Select
								value={range.endTerm}
								onValueChange={(val) =>
									updateRange("endTerm", val as TermRange["endTerm"])
								}
							>
								<SelectTrigger id="end-term" className="w-[110px] h-8 text-sm">
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

				<div className="flex justify-end pt-2">
					<Button size="sm" onClick={handleSubmit}>
						Load Data
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
