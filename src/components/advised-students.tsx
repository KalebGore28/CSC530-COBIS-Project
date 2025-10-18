import { Suspense, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/custom/modal';
import { StudentDetail } from '@/components/ui/custom/student-detail';

// Import types
import { students } from '@/db/schema';

type Student = typeof students.$inferSelect;

// Import GraphQL imports
import { useQuery } from '@tanstack/react-query';
import { execute } from '@/graphql/execute';
import { graphql } from '@/graphql';


interface ExtendedStudent
	extends Omit<
		Student,
		'birthdate' | 'citizenship' | 'race_code' | 'race_description' |
		'residency_code' | 'residency_description' | 'cell_phone'
	> { }

type TermInfo = {
	year: number;
	term: string;
	term_code: string;
}

const advisedStudentsQuery = graphql(`
	query advisedStudentsQuery(
	$mnumber: String!
	$term_code: String!
	$year: Int!
	) {
	studentAdvisors(
		where: {
		advisor_mnumber: { eq: $mnumber }
		term_code: { eq: $term_code }
		year: { eq: $year }
		}
	) {
		student {
			mnumber
			first_name
			middle_name
			last_name
			suffix
			email
			gender
		}
	}
	}
`);

// Custom skeleton for AdvisedStudents
function AdvisedStudentsSkeleton() {
	return (
		<Card className='w-full'>
			<CardHeader>
				<CardTitle>
					<Skeleton className="h-6 w-32" />
				</CardTitle>
				<CardDescription>
					<Skeleton className="h-4 w-48" />
				</CardDescription>
			</CardHeader>
			<CardContent className='px-4'>
				<div className="overflow-auto rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead><Skeleton className="h-4 w-24" /></TableHead>
								<TableHead><Skeleton className="h-4 w-40" /></TableHead>
								<TableHead><Skeleton className="h-4 w-48" /></TableHead>
								<TableHead><Skeleton className="h-4 w-16" /></TableHead>
								<TableHead><Skeleton className="h-4 w-24" /></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									<TableCell><Skeleton className="h-4 w-24" /></TableCell>
									<TableCell><Skeleton className="h-4 w-40" /></TableCell>
									<TableCell><Skeleton className="h-4 w-48" /></TableCell>
									<TableCell><Skeleton className="h-4 w-16" /></TableCell>
									<TableCell><Skeleton className="h-4 w-24" /></TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}

export function AdvisedStudents({
	mnumber,
	term_info,
	title,
	modalOpen,
}: {
	mnumber: string;
	term_info: TermInfo;
	title?: string;
	modalOpen?: boolean;
}) {
	return (
		<Suspense fallback={<AdvisedStudentsSkeleton />}>
			<AdvisedStudentContent
				mnumber={mnumber}
				term_info={term_info}
				title={title}
				modalOpen={modalOpen}
			/>
		</Suspense>
	);
}

export function AdvisedStudentContent({
	mnumber,
	term_info,
	title = 'My Advised Students',
	modalOpen = false,
}: {
	mnumber: string;
	term_info: TermInfo;
	title?: string;
	modalOpen?: boolean;
}) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState<ExtendedStudent | null>(null);

	const { data, isLoading } = useQuery({
		queryKey: ['advisedStudentsQuery', mnumber, term_info.term_code, term_info.year],
		queryFn: async () => await execute(advisedStudentsQuery, {
			mnumber,
			term_code: term_info.term_code,
			year: term_info.year,
		})
	});

	if (isLoading) {
		return <AdvisedStudentsSkeleton />;
	}

	const students = data?.studentAdvisors?.map((advisee) => ({
		mnumber: advisee.student.mnumber,
		first_name: advisee.student.first_name,
		middle_name: advisee.student.middle_name,
		last_name: advisee.student.last_name,
		suffix: advisee.student.suffix,
		email: advisee.student.email,
		gender: advisee.student.gender,
	})) ?? [];

	return (
		<Card className='w-full'>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>
					Term: {term_info.term} {term_info.year}
				</CardDescription>
			</CardHeader>
			<CardContent className='px-4'>
				<div className="overflow-auto rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>M-Number</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Gender</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{students && students.length > 0 ? (
								students.map((s) => (
									<TableRow
										key={s.mnumber}
										className="cursor-pointer hover:bg-muted/50 transition"
										onClick={() => {
											//@ts-ignore
											setSelectedStudent(s);
											setIsModalOpen(true);
										}}
									>
										<TableCell>{s.mnumber}</TableCell>
										<TableCell className='truncate max-w-[120px]'>
											{`${s.last_name}, ${s.first_name}${s.middle_name ? ' ' + s.middle_name : ''}${s.suffix ? ' ' + s.suffix : ''}`}
										</TableCell>
										<TableCell className='truncate max-w-[120px]'>
											<a href={`mailto:${(s.email ?? '').toLowerCase()}`} className="hover:underline">
												{(s.email ?? '').toLowerCase()}
											</a>
										</TableCell>
										<TableCell>
											{s.gender === 'M' ? 'Male' : 'Female'}
										</TableCell>
									</TableRow>
								)))
								: (
									<TableRow>
										<TableCell colSpan={5} className="text-center py-8">
											No advised students found.
										</TableCell>
									</TableRow>
								)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
			{modalOpen && <Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={`Student Detail: ${selectedStudent?.last_name}, ${selectedStudent?.first_name}`}
				size='5xl'
			>
				{selectedStudent?.mnumber && (
					<StudentDetail mnumber={selectedStudent?.mnumber} />
				)}
			</Modal>}
		</Card>
	);
}

