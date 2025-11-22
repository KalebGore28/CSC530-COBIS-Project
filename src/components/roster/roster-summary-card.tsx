import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { StudentCourse } from '@/routes/_authenticated/_layout/class-roster';

type RosterSummaryCardProps = {
	studentCourses: StudentCourse[];
	className?: string;
};

const gradeValues = new Map<string, number>([
	['A', 4.0],
	['B', 3.0],
	['C', 2.0],
	['D', 1.0],
	['E', 0.0],
]);

export function RosterSummaryCard({ studentCourses, className }: RosterSummaryCardProps) {

	const totalStudents = studentCourses.length;

	// Calculate Class GPA
	const classGPA =
		studentCourses.reduce((acc, sc) => acc + (sc.student_gpa || 0), 0) /
		(totalStudents || 1);

	// Calculate Midterm and Final Averages
	const midtermAverage =
		studentCourses.reduce((acc, sc) => {
			const grade = sc.midterm_grade ? gradeValues.get(sc.midterm_grade) || 0 : 0;
			return acc + grade;
		}, 0) / (totalStudents || 1);

	const finalAverage =
		studentCourses.reduce((acc, sc) => {
			const grade = sc.final_grade ? gradeValues.get(sc.final_grade) || 0 : 0;
			return acc + grade;
		}, 0) / (totalStudents || 1);

	const averageTrend = finalAverage - midtermAverage;

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
									{averageTrend > 0
										? `Up by ${averageTrend.toFixed(2)} grade points`
										: averageTrend < 0
											? `Down by ${Math.abs(averageTrend).toFixed(2)} grade points`
											: 'Stable'
									}
								</dd>
							</div>
						</dl>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};