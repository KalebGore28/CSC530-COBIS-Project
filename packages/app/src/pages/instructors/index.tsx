import React, { useState, useMemo, Suspense } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/context/session';

// GraphQL imports
import type { instructorsQuery } from "./__generated__/instructorsQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

const instructorsQuery = graphql`
	query instructorsQuery {
		instructors {
			first_name
			last_name
			mnumber
			college {
				code
				description
			}
			department {
				code
				description
			}
			user {
				email
				image
			}
		}
	}
`;

// Helper function to get initials from name
const getInitials = (name: string): string => {
	if (!name) return 'N/A';
	return name
		.split(' ')
		.map(part => part.charAt(0))
		.join('')
		.toUpperCase();
};

// Custom skeleton for InstructorsPage
const InstructorsPageSkeleton: React.FC = () => (
	<Card>
		<CardHeader className="pb-3">
			<div className="flex flex-wrap justify-between items-center">
				{/* Title & description skeletons */}
				<div>
					<div className="flex items-center gap-2 mb-2">
						<Skeleton className="h-5 w-5 rounded-full" />
						<Skeleton className="h-6 w-32" />
					</div>
					<Skeleton className="h-4 w-40" />
				</div>

				{/* Search & filter skeletons */}
				<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
					<Skeleton className="h-10 w-[250px] rounded-lg" />
					<Skeleton className="h-10 w-[150px] rounded-lg" />
				</div>
			</div>
		</CardHeader>

		<CardContent>
			<Table>
				{/* Table header skeleton */}
				<TableHeader>
					<TableRow>
						<TableHead>
							<Skeleton className="h-4 w-32" />
						</TableHead>
						<TableHead>
							<Skeleton className="h-4 w-24" />
						</TableHead>
						<TableHead>
							<Skeleton className="h-4 w-40" />
						</TableHead>
					</TableRow>
				</TableHeader>

				{/* Table body skeleton rows */}
				<TableBody>
					{Array.from({ length: 5 }).map((_, i) => (
						<TableRow key={i}>
							<TableCell>
								<div className="flex items-center gap-3">
									<Skeleton className="h-8 w-8 rounded-full" />
									<Skeleton className="h-4 w-24" />
								</div>
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-20" />
							</TableCell>
							<TableCell>
								<Skeleton className="h-4 w-32" />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</CardContent>
	</Card>
);

export const InstructorsPage: React.FC = () => {
	return (
		<div className="w-full p-6 mx-auto space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
				<h2 className="col-span-full text-center font-bold text-2xl">
					Instructors
				</h2>
				<p className="text-muted-foreground col-span-full text-center">
					View and manage all instructors in your department
				</p>
			</div>
			<Suspense fallback={<InstructorsPageSkeleton />}>
				<InstructorsPageContent />
			</Suspense>
		</div>
	);
}

const InstructorsPageContent: React.FC = () => {
	const navigate = useNavigate();
	const { session } = useSession();
	const data = useLazyLoadQuery<instructorsQuery>(
		instructorsQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
	);

	const instructors = data.instructors || [];
	const [searchQuery, setSearchQuery] = useState('');
	const [departmentFilter, setDepartmentFilter] = useState<string>('All Departments');

	// Get unique departments for filtering
	const departments = useMemo(() => {
		if (!instructors || instructors.length === 0) return ['All Departments'];
		const uniqueDepartments = new Set(instructors.map(instructor => instructor.department.description));
		return ['All Departments', ...Array.from(uniqueDepartments)];
	}, [instructors]);

	// Compute filtered instructors
	const getFilteredInstructors = () => {
		if (!instructors || instructors.length === 0) return [];

		let filtered = [...instructors];

		// Apply department filter
		if (departmentFilter !== 'All Departments') {
			filtered = filtered.filter(instructor =>
				instructor.department.description === departmentFilter
			);
		}

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(instructor =>
				(instructor.first_name && instructor.first_name.toLowerCase().includes(query)) ||
				(instructor.last_name && instructor.last_name.toLowerCase().includes(query)) ||
				(instructor.mnumber && instructor.mnumber.toLowerCase().includes(query))
			);
		}
		return filtered;
	}
	const filteredInstructors = getFilteredInstructors();

	// Handle instructor selection
	const handleSelectInstructor = (mnumber: string) => {
		navigate(`/instructors/${mnumber}`);
	};

	// Handle search input change with debounce
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex flex-wrap justify-between items-center">
					<div className='pr-4 pb-4'>
						<CardTitle className="text-xl flex items-center gap-2">
							<Users className="h-5 w-5" />
							Instructor Directory
						</CardTitle>
						<CardDescription>
							{filteredInstructors.length} instructor{filteredInstructors.length !== 1 ? 's' : ''} found
						</CardDescription>
					</div>
					{/* Search and Filter Controls*/}
					<div className="flex flex-wrap gap-2 sm:gap-4">
						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Search instructors..."
								className="pl-8 w-full"
								value={searchQuery}
								onChange={handleSearchChange}
							/>
						</div>
						<Select value={departmentFilter} onValueChange={setDepartmentFilter}>
							<SelectTrigger>
								<SelectValue placeholder="Filter by department" />
							</SelectTrigger>
							<SelectContent>
								{departments.map((dept) => (
									<SelectItem key={dept} value={dept}>{dept}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{filteredInstructors.length > 0 ? (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[250px]">Instructor</TableHead>
								<TableHead>Department</TableHead>
								<TableHead>Email</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredInstructors.map((instructor) => (
								<TableRow
									key={instructor.mnumber}
									className={`cursor-pointer hover:bg-muted/50 ${session?.info.department !== instructor.department.code ? 'opacity-50 cursor-not-allowed' : ''}`}
									onClick={() => {
										if (session?.info.department === instructor.department.code) {
											handleSelectInstructor(instructor.mnumber);
										}
									}}
								>
									<TableCell className="truncate max-w-[120px]">
										<div className="flex items-center gap-3">
											<Avatar>
												<AvatarImage src={instructor.user?.image ?? undefined} alt={instructor.first_name || ''} />
												<AvatarFallback>{getInitials(`${instructor.first_name} ${instructor.last_name}`)}</AvatarFallback>
											</Avatar>
											<div className="flex flex-col">
												<span className="font-medium">{`${instructor.first_name} ${instructor.last_name}`}</span>
												<span className="text-sm text-muted-foreground">{instructor.mnumber}</span>
											</div>
										</div>
									</TableCell>
									<TableCell className="truncate max-w-[120px]">
										<div className="flex flex-col">
											<span>{instructor.department.description}</span>
										</div>
									</TableCell>
									<TableCell className="truncate max-w-[120px]">
										<div className="flex items-center gap-2">
											<Mail className="h-4 w-4 text-muted-foreground" />
											<a
												href={`mailto:${instructor.user?.email}`}
												className="hover:underline"
												onClick={(e) => e.stopPropagation()}
											>
												{instructor.user?.email || 'N/A'}
											</a>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

				) : (
					filteredInstructors.length === 0 && (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<Users className="h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium">No instructors found</h3>
							<p className="text-muted-foreground mt-1">
								Try adjusting your search or filter to find what you're looking for.
							</p>
						</div>
					)
				)}
			</CardContent>
		</Card>
	);
}