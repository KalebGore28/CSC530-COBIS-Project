import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

type RosterSummaryCardProps = {
	totalStudents: number;
	classGPA: number;
	midtermAverage: number;
	finalAverage: number;
	className?: string;
};

export function RosterSummaryCard({ totalStudents, classGPA, midtermAverage, finalAverage, className }: RosterSummaryCardProps) {
	// Calculate Average Trend
	const getClassStatistics = () => {
		const averageTrend = finalAverage - midtermAverage;
		const trendDescription =
			averageTrend > 0
				? `Up by ${averageTrend.toFixed(2)} grade points`
				: averageTrend < 0
					? `Down by ${Math.abs(averageTrend).toFixed(2)} grade points`
					: 'Stable';

		return { trendDescription };
	};

	const stats = getClassStatistics();

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Class Summary</CardTitle>
				<CardDescription>Performance metrics and statistics</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{/* Core Metrics */}
					<dl className="grid grid-cols-1 gap-4 text-sm">
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Total Students</dt>
							<dd className="font-medium">{totalStudents}</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Class GPA</dt>
							<dd className="font-medium">{classGPA.toFixed(2)}</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Midterm Average</dt>
							<dd className="font-medium">
								{midtermAverage > 0 ? midtermAverage.toFixed(2) : 'N/A'}
							</dd>
						</div>
						<div className="flex items-center justify-between">
							<dt className="text-muted-foreground">Final Average</dt>
							<dd className="font-medium">
								{finalAverage > 0 ? finalAverage.toFixed(2) : 'N/A'}
							</dd>
						</div>
					</dl>

					{/* Additional Statistics */}
					<div>
						<h3 className="text-sm font-semibold mb-2">Additional Insights</h3>
						<dl className="grid grid-cols-1 gap-4 text-sm">
							<div className="flex items-center justify-between">
								<dt className="text-muted-foreground">Average Trend</dt>
								<dd
									className="font-medium"
									style={{
										color:
											finalAverage > midtermAverage
												? 'green'
												: finalAverage < midtermAverage
													? 'red'
													: 'inherit',
									}}
								>
									{stats.trendDescription}
								</dd>
							</div>
						</dl>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};