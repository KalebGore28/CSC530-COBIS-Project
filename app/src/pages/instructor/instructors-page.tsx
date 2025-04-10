import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
import { Search, Users, Loader2, AlertCircle, Mail } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

// Define instructor type based on API response
type Instructor = {
	mnumber: string;
	name: string;
	firstName: string;
	lastName: string;
	department: string;
	departmentCode: string;
	college: string;
	collegeCode: string;
	email: string;
	image: string;
};

const InstructorsPage: React.FC = () => {
	const navigate = useNavigate();
	const [instructors, setInstructors] = useState<Instructor[]>([]);
	const [filteredInstructors, setFilteredInstructors] = useState<Instructor[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [departmentFilter, setDepartmentFilter] = useState<string>('all');

	// Get unique departments for filtering
	const departments = instructors.length > 0
		? ['all', ...new Set(instructors.map(instructor => instructor.department))]
		: ['all'];

	// Fetch instructors data
	useEffect(() => {
		const fetchInstructors = async () => {
			try {
				setIsLoading(true);
				const response = await axios.get('/api/instructor', {
					withCredentials: true
				});
				setInstructors(response.data);
				setFilteredInstructors(response.data);
				setError(null);
			} catch (err) {
				console.error('Error fetching instructors:', err);
				setError('Failed to load instructors. Please try again later.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchInstructors();
	}, []);

	// Filter instructors based on search query and department filter
	useEffect(() => {
		let filtered = [...instructors];

		// Apply department filter
		if (departmentFilter !== 'all') {
			filtered = filtered.filter(instructor =>
				instructor.department === departmentFilter
			);
		}

		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(instructor =>
				instructor.name.toLowerCase().includes(query) ||
				instructor.email.toLowerCase().includes(query) ||
				instructor.mnumber.toLowerCase().includes(query)
			);
		}

		setFilteredInstructors(filtered);
	}, [searchQuery, departmentFilter, instructors]);

	// Handle instructor selection
	const handleSelectInstructor = (mnumber: string) => {
		navigate(`/instructors/${mnumber}`);
	};

	// Helper function to get initials from name
	const getInitials = (name: string): string => {
		return name
			.split(' ')
			.map(part => part.charAt(0))
			.join('')
			.toUpperCase();
	};

	return (
		<div className="container mx-auto py-6">
			<div className="flex flex-col space-y-6">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Instructors</h1>
						<p className="text-muted-foreground">
							View and manage all instructors in your department
						</p>
					</div>

					{/* Search and filter controls */}
					<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Search instructors..."
								className="pl-8 w-full sm:w-[250px] md:w-[300px]"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>

						<select
							className="h-10 rounded-md border border-input bg-background px-3 py-2"
							value={departmentFilter}
							onChange={(e) => setDepartmentFilter(e.target.value)}
						>
							{departments.map((dept) => (
								<option key={dept} value={dept}>
									{dept === 'all' ? 'All Departments' : dept}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Main content */}
				<Card>
					<CardHeader className="pb-3">
						<div className="flex justify-between items-center">
							<div>
								<CardTitle className="text-xl flex items-center gap-2">
									<Users className="h-5 w-5" />
									Instructor Directory
								</CardTitle>
								<CardDescription>
									{filteredInstructors.length} instructor{filteredInstructors.length !== 1 ? 's' : ''} found
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="flex justify-center items-center py-12">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
								<span className="ml-2">Loading instructors...</span>
							</div>
						) : error ? (
							<div className="flex justify-center items-center py-12 text-destructive">
								<AlertCircle className="h-6 w-6 mr-2" />
								<span>{error}</span>
							</div>
						) : filteredInstructors.length > 0 ? (
							<div className="rounded-md border">
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
											<TableRow key={instructor.mnumber} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelectInstructor(instructor.mnumber)}>
												<TableCell>
													<div className="flex items-center gap-3">
														<Avatar>
															<AvatarImage src={instructor.image} alt={instructor.name} />
															<AvatarFallback>{getInitials(instructor.name)}</AvatarFallback>
														</Avatar>
														<div className="flex flex-col">
															<span className="font-medium">{instructor.name}</span>
															<span className="text-sm text-muted-foreground">{instructor.mnumber}</span>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex flex-col">
														<span>{instructor.department}</span>
														<Badge variant="outline" className="w-fit text-xs">
															{instructor.collegeCode}
														</Badge>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Mail className="h-4 w-4 text-muted-foreground" />
														<a
															href={`mailto:${instructor.email}`}
															className="text-blue-600 hover:underline"
															onClick={(e) => e.stopPropagation()}
														>
															{instructor.email}
														</a>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<Users className="h-12 w-12 text-muted-foreground mb-4" />
								<h3 className="text-lg font-medium">No instructors found</h3>
								<p className="text-muted-foreground mt-1">
									Try adjusting your search or filter to find what you're looking for.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};

export default InstructorsPage;