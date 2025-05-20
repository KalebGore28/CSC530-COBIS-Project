import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Terminal } from 'lucide-react';
import { Modal } from '@/components/modals/modal';
import StudentDetail from '@/components/student-detail';

export interface AdvisorAPIResponse {
	advisedStudents: Student[];
	term: string;
	year: number;
	termName: string;
}

interface ShownTermAndYear {
	term: string;
	year: number;
	termName: string;
}

export interface Student {
	mnumber: string;
	firstName: string;
	middleName?: string;
	lastName: string;
	suffix?: string;
	email: string;
	age: number;
	gender: string;
}

export interface AdvisorAdvisedStudentsProps {
	mnumber: string;
	term?: string;
	year?: number;
	title?: string;
}

const AdvisorAdvisedStudents: React.FC<AdvisorAdvisedStudentsProps> = ({
	mnumber,
	term,
	year,
	title,
}) => {
	const [students, setStudents] = useState<Student[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Modal state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedMnumber, setSelectedMnumber] = useState<string | null>(null);
	const [selectedName, setSelectedName] = useState<string>('');

	const [shownTermAndYear, setShownTermAndYear] = useState<ShownTermAndYear>({
		term: '',
		year: 0,
		termName: '',
	});

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			setError(null);
			try {
				const url = `/api/advisor/${mnumber}`;
				const response = await axios.get<AdvisorAPIResponse>(url, {
					params: { term, year },
					withCredentials: true,
				});

				setStudents(response.data.advisedStudents);
				setShownTermAndYear({
					term: response.data.term,
					year: response.data.year,
					termName: response.data.termName,
				});
			} catch (err: any) {
				// …same error handling…
			} finally {
				setIsLoading(false);
			}
		})();
	}, [mnumber, term, year]);

	const renderSkeletons = () =>
		Array.from({ length: 5 }).map((_, i) => (
			<TableRow key={i}>
				<TableCell><Skeleton className="h-4 w-24" /></TableCell>
				<TableCell><Skeleton className="h-4 w-40" /></TableCell>
				<TableCell><Skeleton className="h-4 w-48" /></TableCell>
				<TableCell><Skeleton className="h-4 w-16" /></TableCell>
				<TableCell><Skeleton className="h-4 w-24" /></TableCell>
			</TableRow>
		));

	const onRowClick = (s: Student) => {
		setSelectedMnumber(s.mnumber);
		setSelectedName(`${s.firstName} ${s.lastName}`);
		setIsModalOpen(true);
	};

	return (
		<Card className='w-full'>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>
					{shownTermAndYear
						? `Term: ${shownTermAndYear.termName} ${shownTermAndYear.year}`
						: 'Current term & year'}
				</CardDescription>
			</CardHeader>
			<CardContent className='px-4'>
				{error && (
					<Alert variant="destructive" className="mb-4">
						<Terminal className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				<div className="overflow-auto rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>M-Number</TableHead>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Age</TableHead>
								<TableHead>Gender</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isLoading
								? renderSkeletons()
								: students.length > 0
									? students.map((s) => (
										<TableRow
											key={s.mnumber}
											onClick={() => onRowClick(s)}
											className="cursor-pointer hover:bg-muted/50 transition"
										>
											<TableCell>{s.mnumber}</TableCell>
											<TableCell className='truncate max-w-[120px]'>
												{`${s.lastName}, ${s.firstName}${s.middleName ? ' ' + s.middleName : ''}${s.suffix ? ' ' + s.suffix : ''}`}
											</TableCell>
											<TableCell className='truncate max-w-[120px]'>{s.email.toLowerCase()}</TableCell>
											<TableCell>{s.age}</TableCell>
											<TableCell>
												{s.gender === 'M' ? 'Male' : 'Female'}
											</TableCell>
										</TableRow>
									))
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

			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title={`Student Detail: ${selectedName}`}
				size='5xl'
			>
				{selectedMnumber && (
					<StudentDetail key={selectedMnumber} mnumber={selectedMnumber} />
				)}
			</Modal>
		</Card>
	);
};

export default AdvisorAdvisedStudents;