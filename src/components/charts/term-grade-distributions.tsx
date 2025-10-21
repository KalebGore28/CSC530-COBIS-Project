import { useState } from "react"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Area, AreaChart, XAxis, YAxis, LabelList, CartesianGrid } from "recharts"

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

const defaultChartConfig: ChartConfig = {
	A: { label: "A", color: "var(--chart-1)" },
	B: { label: "B", color: "var(--chart-2)" },
	C: { label: "C", color: "var(--chart-3)" },
	D: { label: "D", color: "var(--chart-4)" },
	E: { label: "E", color: "var(--chart-5)" },
	"N/A": { label: "N/A", color: "var(--chart-6)" },
}

const yearMap: Record<string, number> = {
	"1y": 1,
	"2y": 2,
	"3y": 3,
	"5y": 5,
	"10y": 10,
};

// Map term codes to sort order for chronological sorting
const termSortOrder: { [key: string]: number } = {
	'10': 1, // Spring
	'50': 2, // Summer
	'80': 3, // Fall
	'90': 4, // Winter
};

const allGrades = ['A', 'B', 'C', 'D', 'E', 'N/A'];

const getCurrentYearTermQuery = graphql(`
	query getCurrentYearTermQuery {
		getCurrentYearTerm {
			year
			term
			term_code
		}
	}
`);

const termGradeDistributionsQuery = graphql(`
	query termGradeDistributionsQuery($mnumber: String!, $startTerm: String!, $startYear: Int!) {
		facultySingle(where: { mnumber: { eq: $mnumber }}) {
			mnumber
			grade_distribution_trend(startTerm: $startTerm, startYear: $startYear) {
				distributions {
					count
					grade
					percentage
				}
				term {
					code
					description
				}
				year
			}
		}
	}
`);

export function TermGradeDistribution({ mnumber, title, description }: {
	mnumber: string
	title: string
	description: string
}) {
	const [timeRange, setTimeRange] = useState("1y")
	const [offset, setOffset] = useState(1)

	const { data: getCurrentYearTermData, isLoading: isLoadingCurrentYearTerm } = useQuery({
		queryKey: ['getCurrentYearTerm'],
		queryFn: () => execute(getCurrentYearTermQuery),
	});

	const getCurrentYearTerm = getCurrentYearTermData?.getCurrentYearTerm;

	const { data: gradeDistributionDataQueryData } = useQuery({
		queryKey: ['termGradeDistributions', mnumber, offset, getCurrentYearTerm],
		queryFn: () => execute(termGradeDistributionsQuery, {
			mnumber,
			startTerm: getCurrentYearTerm!.term_code!,
			startYear: getCurrentYearTerm!.year! - offset,
		}),
		enabled: !!getCurrentYearTerm && !!getCurrentYearTerm.year && !!getCurrentYearTerm.term_code && !isLoadingCurrentYearTerm,
	});

	const gradeDistributionData = gradeDistributionDataQueryData?.facultySingle;

	// Handle time range change
	const handleTimeRangeChange = (value: string) => {
		setTimeRange(value)
		setOffset(yearMap[value] ?? 1);
	}

	return (
		<Card className="gap-0">
			<CardHeader className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-center border-b gap-4 py-4">
				{/* Left column: title + description */}
				<div className="text-center sm:text-left">
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</div>

				{/* Right column: fetch / select controls */}
				<div className="flex items-center justify-center sm:justify-end space-x-2">
					<Select value={timeRange} onValueChange={handleTimeRangeChange}>
						<SelectTrigger
							className="w-[160px] rounded-lg"
							aria-label="Select time range"
						>
							<SelectValue placeholder="All time" />
						</SelectTrigger>
						<SelectContent className="rounded-xl">
							<SelectItem value="10y" className="rounded-lg">
								Last 10 years
							</SelectItem>
							<SelectItem value="5y" className="rounded-lg">
								Last 5 years
							</SelectItem>
							<SelectItem value="3y" className="rounded-lg">
								Last 3 years
							</SelectItem>
							<SelectItem value="2y" className="rounded-lg">
								Last 2 years
							</SelectItem>
							<SelectItem value="1y" className="rounded-lg">
								Last year
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>

			<CardContent className="mx-4 px-0">
				{gradeDistributionData && gradeDistributionData.grade_distribution_trend && (
					<GradeDistributionChart
						//@ts-ignore
						grade_distribution_data={gradeDistributionData.grade_distribution_trend}
					/>
				)
				}
			</CardContent>
		</Card>
	)
}

type GradeDistributionTrendItem = {
	distributions: { count?: number; grade: string; percentage: number }[];
	term: { code: string; description: string };
	year: number;
};

const GradeDistributionChart: React.FC<{ grade_distribution_data: GradeDistributionTrendItem[] }> = ({ grade_distribution_data }) => {
	// Transform the data into a format suitable for the chart
	const transformedData = (grade_distribution_data)
		.map((item) => {
			// Initialize gradeData with all grades set to 0
			const gradeData = allGrades.reduce((acc, grade) => {
				acc[grade] = 0; // Default to 0
				return acc;
			}, {} as Record<string, number>);

			// Populate actual grade percentages
			item.distributions.forEach((distribution) => {
				const grade = distribution.grade;
				const percentage = distribution.percentage;
				gradeData[grade] = percentage;
			});

			return {
				date: `${item.term.description}-${item.year}`, // e.g., "Fall-2023"
				termCode: item.term.code, // e.g., "80"
				year: item.year, // e.g., 2023
				...gradeData,
			};
		})
		.sort((a, b) => {
			// Sort by year first
			if (a.year !== b.year) {
				return a.year - b.year; // Ascending year (e.g., 2023 before 2024)
			}
			// If years are equal, sort by term code
			return termSortOrder[a.termCode] - termSortOrder[b.termCode]; // Ascending term (Spring < Summer < Fall < Winter)
		});

	return (
		<ChartContainer
			config={defaultChartConfig}
			className="aspect-auto h-[400px] w-full"
		>
			<AreaChart
				data={transformedData}
				margin={{
					top: 40,
					right: 30,
					left: 30,
				}}
			>
				<defs>
					{Object.entries(defaultChartConfig).map(([grade, config]) => (
						<linearGradient
							key={grade}
							id={`fill${grade}`}
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor={config.color}
								stopOpacity={0.8}
							/>
							<stop
								offset="95%"
								stopColor={config.color}
								stopOpacity={0.1}
							/>
						</linearGradient>
					))}
				</defs>
				<CartesianGrid vertical={false} />

				<XAxis
					dataKey="date"
					tickLine={false}
					axisLine={false}
					tickMargin={8}
					minTickGap={32}
				/>
				<YAxis
					width={40}
					tickLine={false}
					axisLine={false}
					tickCount={6}
					tickFormatter={(value) => `${value.toFixed(0)}%`}
					domain={[0, 100]}
					label={{
						value: "Percentage of Grades",
						angle: -90,
						position: "insideLeft",
						offset: -20,
						style: {
							textAnchor: "middle",
							fill: "var(--text-secondary)",
							fontSize: 12,
						},
					}}
					tickMargin={15}
				/>
				<ChartTooltip
					cursor={false}
					content={
						<ChartTooltipContent
							indicator="dot"
						/>
					}
				/>
				{Object.entries(defaultChartConfig).map(([grade, config]) => (
					<Area
						key={grade}
						dataKey={grade}
						type="natural"
						fill={`url(#fill${grade})`}
						stroke={config.color}
						stackId="a"
					>
						<LabelList
							dataKey={grade}
							position="bottom"
							offset={0}
							content={(renderProps) => <CustomizedLabel {...renderProps} dataKey={grade} />}
						/>

					</Area>
				))}
				<ChartLegend
					content={<ChartLegendContent />}
					verticalAlign="bottom"
				/>
			</AreaChart>
		</ChartContainer>
	)
}

// Custom Label Component for LabelList
const CustomizedLabel: React.FC<any> = ({ x, y, value, dataKey }) => {
	const MIN_PERCENTAGE_TO_SHOW = 5;
	if (value < MIN_PERCENTAGE_TO_SHOW || isNaN(x) || isNaN(y)) return null;
	return (
		<text
			x={x}
			y={y + 15}
			fill="var(--primary)"
			fontSize={10}
			textAnchor="middle"
			dominantBaseline="middle"
		>
			{`${dataKey}-${value.toFixed(0)}%`}
		</text>
	);
};