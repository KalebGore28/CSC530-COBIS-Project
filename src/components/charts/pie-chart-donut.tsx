import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		const totalCount = payload[0].value;
		const total = payload[0].payload.allTotal ||
			payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
		const percentage = totalCount / total * 100;

		return (
			<div className="bg-muted p-2 shadow rounded border">
				<p className="font-semibold">{`${data.grade}: ${data.count}`}</p>
				<p className="text-sm text-primary">{`${percentage.toFixed(2)}%`}</p>
			</div>
		);
	}
	return null;
};

// Default grade colors using shadcn theme
const DEFAULT_COLORS: Record<Grade, string> = {
	'A': 'var(--chart-1)',
	'B': 'var(--chart-2)',
	'C': 'var(--chart-3)',
	'D': 'var(--chart-4)',
	'E': 'var(--chart-5)',
	'N/A': 'var(--chart-6)',
};

// Define valid grades
export const VALID_GRADES = ['A', 'B', 'C', 'D', 'E', 'N/A'] as const;
export type Grade = typeof VALID_GRADES[number];

export type GradeDistribution = {
	grade: Grade;
	count: number; // Must be a positive integer (> 0)
};

// Runtime validation for GradeDistribution
export function validateGradeDistribution(data: GradeDistribution): boolean {
	return VALID_GRADES.includes(data.grade) && Number.isInteger(data.count) && data.count > 0;
}

export type PieChartDonutProps = {
	data: GradeDistribution[];
};

export function PieChartDonut({ data }: PieChartDonutProps) {
	// Filter out entries with count <= 0
	const filteredData = data.filter(item => validateGradeDistribution(item));

	// If filtered data is empty, return a message
	if (filteredData.length === 0) {
		return (
			<p className="text-center text-sm text-muted-foreground">
				No valid grade data available
			</p>
		);
	}

	// Calculate total for percentage calculations
	const total = filteredData.reduce((sum, item) => sum + item.count, 0);

	// Add total and colors to each data point
	const dataWithTotal = filteredData.map(item => ({
		...item,
		allTotal: total,
		color: DEFAULT_COLORS[item.grade] || 'var(--muted))',
	}));

	return (
		<div className="mx-auto aspect-square max-h-[250px]">
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Tooltip content={<CustomTooltip />} />
					<Pie
						data={dataWithTotal}
						dataKey="count"
						nameKey="grade"
						cx="50%"
						cy="50%"
						innerRadius={60}
						outerRadius={80}
						paddingAngle={2}
						label={({ grade }) => String(grade)}
					>
						{dataWithTotal.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.color} />
						))}
					</Pie>
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
}