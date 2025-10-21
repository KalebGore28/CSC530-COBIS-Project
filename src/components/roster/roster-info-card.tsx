import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Import types
import type { ExtendedCourse } from "../selectors/course-selector";
import type { ExtendedTerm } from "../selectors/term-selector";

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';

const getCurrentYearTermQuery = graphql(`
	query getCurrentYearTermQuery {
		getCurrentYearTerm {
			year
			term
			term_code
		}
	}
`);

// Custom skeleton for RosterInfoCard
const RosterInfoCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
	<Card className={className}>
		<CardContent>
			<div className="flex flex-col md:flex-row justify-between gap-6">
				<div>
					<Skeleton className="h-8 w-[300px] mb-2" />
					<Skeleton className="h-7 w-[250px] mb-2" />
					<Skeleton className="h-5 w-[220px]" />
				</div>
				<div className="flex flex-col justify-between items-end h-full gap-4">
					<Skeleton className="h-6 w-16 rounded-full" />
					<div className="text-right">
						<Skeleton className="h-8 w-32" />
					</div>
				</div>
			</div>
		</CardContent>
	</Card>
);

export type RosterInfoCardProps = {
	course: ExtendedCourse;
	term: ExtendedTerm;
	className?: string;
}

export function RosterInfoCard({ course, term, className }: RosterInfoCardProps) {
	const { data, isLoading } = useQuery({
		queryKey: ['getCurrentYearTermQuery'],
		queryFn: async () => await execute(getCurrentYearTermQuery),
	});

	if (isLoading) {
		return <RosterInfoCardSkeleton className={className} />;
	}

	const getCurrentYearTerm = data?.getCurrentYearTerm;

	const isActive =
		getCurrentYearTerm &&
		term.year === getCurrentYearTerm.year &&
		term.code === getCurrentYearTerm.term_code;

	return (
		<Card className={className}>
			<CardContent>
				<div className="flex flex-col md:flex-row justify-between gap-6">
					<div>
						<h2 className="text-2xl font-bold tracking-tight text-foreground">
							{course.course_subject} {course.course_number}
							{course.course_suffix} - {course.course_section}
						</h2>
						<p className="text-xl text-foreground">{course.title}</p>
						<p className="text-sm text-muted-foreground">
							{term.description} {term.year} • {course.creditHours} Credit Hours (Total Hours: {course.totalCreditHours})
						</p>
					</div>
					<div className="flex flex-col justify-between items-end h-full gap-4">
						<Badge
							variant={isActive ? "default" : "secondary"}
							className="text-sm font-medium rounded-full bg-primary px-4 py-1 dark:bg-primary/20"
						>
							<span className="text-xs font-normal text-white">
								{isActive ? "Active" : "Completed"}
							</span>
						</Badge>
						<div className="text-right">
							<p className="text-2xl font-bold text-foreground">
								{course.studentCount} <span className="text-lg font-normal text-muted-foreground">students</span>
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};