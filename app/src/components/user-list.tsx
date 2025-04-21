import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // <--- Import base axios
import { User, UserFilters } from '@/types/user'; // Adjust path
import UserCard from '@/components/user-card'; // Adjust path
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardFooter, CardContent } from './ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import debounce from 'lodash.debounce';

export const UserList: React.FC = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<UserFilters>({
		name: '',
		email: '',
		mnumber: '',
		college: '',
		department: '',
		isEnabled: undefined,
	});
	const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

	// Debounced function to fetch users directly using axios
	const debouncedFetchUsers = useCallback(
		debounce((currentFilters: UserFilters) => {
			setLoading(true);
			setError(null);

			const activeFilters = Object.entries(currentFilters).reduce((acc, [key, value]) => {
				if (value !== undefined && value !== '') {
					acc[key as keyof UserFilters] = typeof value === 'boolean' ? String(value) : value;
				}
				return acc;
			}, {} as Record<string, string | boolean>);

			// --- Direct Axios Call for GET /user ---
			axios.get<User[]>('/api/user', {
				params: activeFilters,
				withCredentials: true,
			})
				.then((response) => {
					setUsers(response.data);
				})
				.catch(() => {
					const userFriendlyError = 'Failed to fetch users. Check API connection and CORS setup.';
					setError(userFriendlyError);
					toast.error(userFriendlyError);
				})
				.finally(() => {
					setLoading(false);
				});
		}, 500),
		[toast]
	);

	// Effect remains the same
	useEffect(() => {
		debouncedFetchUsers(filters);
		return () => {
			debouncedFetchUsers.cancel();
		};
	}, [filters, debouncedFetchUsers]);

	// Filter input handlers remain the same
	const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setFilters(prev => ({ ...prev, [name]: value }));
	};

	const handleStatusFilterChange = (value: string) => {
		setFilters(prev => ({
			...prev,
			isEnabled: value === 'all' ? undefined : value === 'true',
		}));
	};

	// Function to handle enabling/disabling users directly using axios
	const handleToggleEnable = async (userId: string, currentStatus: boolean) => {
		setTogglingUserId(userId);

		const endpointPath = currentStatus ? `/api/user/${userId}/disable` : `/api/user/${userId}/enable`;

		const successMessage = currentStatus ? 'User disabled successfully' : 'User enabled successfully';
		const failureMessage = currentStatus ? 'Failed to disable user.' : 'Failed to enable user.';

		try {
			// --- Direct Axios Call for POST enable/disable ---
			await axios.post(endpointPath,
				{}, // Empty body for this POST request
				{ // Config object
					withCredentials: true, // <--- Add credentials flag here
					headers: { // Optional: Explicitly set Content-Type if needed, though Axios often infers it
						'Content-Type': 'application/json'
					}
				}
			);

			setUsers(prevUsers =>
				prevUsers.map(user =>
					user.id === userId ? { ...user, isEnabled: !currentStatus } : user
				)
			);
			toast.success(successMessage);
		} catch (err) {
			console.error(`${failureMessage} (${endpointPath})`, err);
			setError(failureMessage + " Please try again.");
			toast.error(failureMessage);
		} finally {
			setTogglingUserId(null);
		}
	};

	// --- JSX Rendering ---
	// (The rendering part remains exactly the same)
	return (
		<div className="container mx-auto p-4 space-y-6">
			<Toaster richColors position="top-right" />

			<h1 className="text-2xl font-bold">User Management</h1>

			{/* Filter Controls */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-card text-card-foreground">
				<div className="space-y-1">
					<Label htmlFor="name">Name</Label>
					<Input id="name" name="name" placeholder="Filter by name..." value={filters.name ?? ''} onChange={handleFilterChange} />
				</div>
				<div className="space-y-1">
					<Label htmlFor="email">Email</Label>
					<Input id="email" name="email" type="email" placeholder="Filter by email..." value={filters.email ?? ''} onChange={handleFilterChange} />
				</div>
				<div className="space-y-1">
					<Label htmlFor="mnumber">M-Number</Label>
					<Input id="mnumber" name="mnumber" placeholder="Filter by M-Number..." value={filters.mnumber ?? ''} onChange={handleFilterChange} />
				</div>
				<div className="space-y-1">
					<Label htmlFor="college">College</Label>
					<Input id="college" name="college" placeholder="Filter by College Code..." value={filters.college ?? ''} onChange={handleFilterChange} />
				</div>
				<div className="space-y-1">
					<Label htmlFor="department">Department</Label>
					<Input id="department" name="department" placeholder="Filter by Department Code..." value={filters.department ?? ''} onChange={handleFilterChange} />
				</div>
				<div className="space-y-1">
					<Label htmlFor="status">Status</Label>
					<Select value={filters.isEnabled === undefined ? 'all' : String(filters.isEnabled)} onValueChange={handleStatusFilterChange}>
						<SelectTrigger id="status"><SelectValue placeholder="Filter by Status" /></SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Users</SelectItem>
							<SelectItem value="true">Enabled</SelectItem>
							<SelectItem value="false">Disabled</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* User List Display */}
			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{[...Array(6)].map((_, i) => (
						<Card key={i} className="w-full">
							<CardHeader>
								<div className="flex items-center space-x-4">
									<Skeleton className="h-12 w-12 rounded-full" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-[150px]" />
										<Skeleton className="h-4 w-[200px]" />
									</div></div>
							</CardHeader>
							<CardContent className="space-y-2">
								<Skeleton className="h-4 w-[100px]" />
								<Skeleton className="h-4 w-[150px]" />
								<Skeleton className="h-4 w-[180px]" />
							</CardContent>
							<CardFooter>
								<Skeleton className="h-10 w-[120px]" />
							</CardFooter>
						</Card>
					))}
				</div>
			) : error ? (
				<div className="text-red-600 bg-red-100 border border-red-400 p-4 rounded-md">{error}</div>
			) : users.length === 0 ? (
				<div className="text-center text-muted-foreground py-8">No users found matching your criteria.</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{users.map((user) => (
						<UserCard
							key={user.id}
							user={user}
							onToggleEnable={handleToggleEnable}
							isToggling={togglingUserId === user.id}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default UserList;