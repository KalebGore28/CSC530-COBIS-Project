import React, { useMemo } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
	ChartConfig,
} from "@/components/ui/chart";
import {
	BarChart,
	CartesianGrid,
	XAxis,
	Bar,
} from "recharts";

export type StudentDatum = {
	citizenship: "US" | "International";
	gender: "M" | "F";
};

interface GenderCitizenshipProps {
	data: StudentDatum[];
	className?: string;
}

export const GenderCitizenship: React.FC<GenderCitizenshipProps> = ({ data, className }) => {
	// Categories
	const citizenshipCategories = ["US", "International"] as const;
	const genderCategories = ["M", "F"] as const;

	// Aggregate counts
	const { citizenshipChartData } = useMemo(() => {
		const countsByCitizenship: Record<
			"US" | "International",
			Record<"M" | "F", number>
		> = {
			US: { M: 0, F: 0 },
			International: { M: 0, F: 0 },
		};
		const countsByGender: Record<
			"M" | "F",
			Record<"US" | "International", number>
		> = {
			M: { US: 0, International: 0 },
			F: { US: 0, International: 0 },
		};

		data.forEach((item) => {
			const { citizenship, gender } = item;
			if (
				(citizenship === "US" || citizenship === "International") &&
				(gender === "M" || gender === "F")
			) {
				countsByCitizenship[citizenship][gender] += 1;
				countsByGender[gender][citizenship] += 1;
			}
		});

		const citizenshipChartData = citizenshipCategories.map((cit) => ({
			citizenship: cit,
			M: countsByCitizenship[cit].M,
			F: countsByCitizenship[cit].F,
		}));

		const genderChartData = genderCategories.map((gen) => ({
			gender: gen,
			US: countsByGender[gen].US,
			International: countsByGender[gen].International,
		}));

		return { citizenshipChartData, genderChartData };
	}, [data]);

	const citizenshipChartConfig = {
		M: { label: "Male", color: "hsl(var(--chart-1))" },
		F: { label: "Female", color: "hsl(var(--chart-2))" },
	} satisfies ChartConfig;

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Overview: Citizenship &amp; Gender</CardTitle>
				<CardDescription>
					This chart shows the distribution of students by citizenship
				</CardDescription>
			</CardHeader>

			{/* CardContent flexes to fill remaining space below the header */}
			<CardContent>
				<ChartContainer config={citizenshipChartConfig} className="aspect-auto h-60">
					<BarChart data={citizenshipChartData}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="citizenship"
							tickLine={false}
							tickMargin={8}
							axisLine={false}
						/>
						<ChartTooltip content={<ChartTooltipContent hideLabel />} />
						<ChartLegend content={<ChartLegendContent />} />
						<Bar
							dataKey="M"
							stackId="stack1"
							fill="var(--color-male)"
							radius={[0, 0, 4, 4]}
						/>
						<Bar
							dataKey="F"
							stackId="stack1"
							fill="var(--color-female)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
};
