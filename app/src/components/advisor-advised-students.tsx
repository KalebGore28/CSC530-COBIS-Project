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

export interface Student {
	mnumber: string;
	firstName: string;
	middleName?: string;
	lastName: string;
	suffix?: string;
	email: string;
	age: number;
	residencyDescription: string;
	// …any other fields you need
}

export interface AdvisorAdvisedStudentsProps {
	term?: string;
	year?: number;
	title?: string;
}

const AdvisorAdvisedStudents: React.FC<AdvisorAdvisedStudentsProps> = ({
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

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await axios.get<Student[]>('/api/advisor/me', {
					params: { term, year },
					withCredentials: true,
				});
				setStudents(response.data);
			} catch (err: any) {
				// map common HTTP errors
				if (err.response?.status === 401) {
					setError('Unauthorized: Please log in.');
				} else if (err.response?.status === 403) {
					setError('Forbidden: You do not have permission.');
				} else {
					setError(err.response?.data?.error ?? err.message);
				}
			} finally {
				setIsLoading(false);
			}
		})();
	}, [term, year]);

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
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>
					{term && year
						? `Term: ${term} ${year}`
						: 'Current term & year'}
				</CardDescription>
			</CardHeader>
			<CardContent>
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
								<TableHead>Residency</TableHead>
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
											<TableCell>
												{`${s.lastName}, ${s.firstName}${s.middleName ? ' ' + s.middleName : ''}${s.suffix ? ' ' + s.suffix : ''}`}
											</TableCell>
											<TableCell>{s.email}</TableCell>
											<TableCell>{s.age}</TableCell>
											<TableCell>{s.residencyDescription}</TableCell>
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
				title={`Student Details — ${selectedName}`}
			>
				{selectedMnumber && (
					<StudentDetail key={selectedMnumber} mnumber={selectedMnumber} />
				)}
			</Modal>
		</Card>
	);
};

export default AdvisorAdvisedStudents;