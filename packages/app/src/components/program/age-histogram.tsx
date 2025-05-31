import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

interface AgeHistogramProps {
	/** 
	 * Array of ages (numbers). 
	 * Example: [18, 22, 37, 45, …] 
	 */
	data: number[];
	/** 
	 * Width of each bin (in years). 
	 * Defaults to 10, which yields ranges like 0–9, 10–19, 20–29, … 
	 */
	binSize?: number;
	/**
	 * Optional title (defaults to “Age Histogram”) 
	 */
	title?: string;
	/**
	 * Optional description under title
	 */
	description?: string;
	className?: string;
}

interface Bin {
	/** Label for the X‐axis, e.g. “0–9”, “10–19”, … */
	range: string;
	/** Count of how many ages fell into this bin */
	count: number;
}

export const AgeHistogram: React.FC<AgeHistogramProps> = ({
	data,
	binSize = 10,
	title = "Age Histogram",
	description = "Distribution of ages",
	className = "",
}) => {
	//
	// 1) Compute bins in a useMemo so we only recalculate when `data` or `binSize` changes:
	//
	const chartData: Bin[] = useMemo(() => {
		if (!data.length) {
			console.warn("No data provided for histogram");
			return [];
		}

		// Find maximum age in the array (assume ages >= 0)
		const maxAge = Math.max(...data);

		// Number of bins = ceil((maxAge + 1) / binSize)
		const numBins = Math.ceil((maxAge + 1) / binSize);

		// Initialize an array of length `numBins`, all counts = 0
		const counts: number[] = Array(numBins).fill(0);

		// Tally each age into its bin index
		data.forEach((age) => {
			if (age < 0) {
				// optional: you can decide how to treat negative ages; here we ignore them
				return;
			}
			const idx = Math.floor(age / binSize);
			if (idx < numBins) {
				counts[idx] += 1;
			}
		});

		// Build the final array of { range, count }
		const bins: Bin[] = counts.map((count, i) => {
			const start = i * binSize;
			const end = start + binSize - 1;
			return {
				range: `${start}–${end}`,
				count,
			};
		});

		return bins;
	}, [data, binSize]);

	//
	// 2) Define a chartConfig that matches the shape of our bins:
	//    We only have one series (“count”), so we give it a label and a color.
	//
	const chartConfig = {
		count: {
			label: "Number of People",
			color: "hsl(var(--chart-1))",
		},
	} satisfies ChartConfig;

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="aspect-auto w-full h-60">
					<BarChart accessibilityLayer data={chartData}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="range"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent />}
						/>
						<Bar
							dataKey="count"
							fill="var(--color-count)"
							radius={8}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
};
