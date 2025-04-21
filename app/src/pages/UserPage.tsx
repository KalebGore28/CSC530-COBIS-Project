import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, UserFilters, UserData } from '@/types/user'; // Adjust path
import UserCard from '@/components/user-card'; // Adjust path
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import debounce from 'lodash.debounce';
import { useSession } from '@/context/session';
import { Modal } from '@/components/modals/modal';
import { ProvisionUserForm } from '@/components/forms/provision-user'

export const UserList: React.FC = () => {
	const { session } = useSession();
	const currentAdminId = session?.session?.data?.user?.id;

	const [users, setUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [_, setError] = useState<string | null>(null);
	const [filters, setFilters] = useState<UserFilters>({
		name: '',
		email: '',
		mnumber: '',
		college: '',
		department: '',
		isEnabled: undefined,
	});
	const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
	const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	// Debounced function to fetch users (keep as is)
	const debouncedFetchUsers = useCallback(
		debounce((currentFilters: UserFilters) => {
			setIsLoading(true);
			setError(null);

			const activeFilters = Object.entries(currentFilters).reduce((acc, [key, value]) => {
				if (value !== undefined && value !== '') {
					acc[key as keyof UserFilters] = typeof value === 'boolean' ? String(value) : value;
				}
				return acc;
			}, {} as Record<string, string | boolean>);

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
					setIsLoading(false);
				});
		}, 500),
		[]
	);

	// Effect to fetch users (keep as is)
	useEffect(() => {
		debouncedFetchUsers(filters);
		return () => {
			debouncedFetchUsers.cancel();
		};
	}, [filters, debouncedFetchUsers]);

	// Filter input handlers (keep as is)
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

	// Function to handle enabling/disabling users
	const handleToggleEnable = async (userId: string, currentStatus: boolean) => {
		if (userId === currentAdminId && currentStatus) {
			toast.error("You cannot disable your own account.");
			console.warn("Attempted to disable self. Action prevented.");
			return; // Stop execution here
		}

		setTogglingUserId(userId);

		const endpointPath = currentStatus ? `/api/user/${userId}/disable` : `/api/user/${userId}/enable`;
		const successMessage = currentStatus ? 'User disabled successfully' : 'User enabled successfully';
		const failureMessage = currentStatus ? 'Failed to disable user.' : 'Failed to enable user.';

		try {
			await axios.post(endpointPath,
				{},
				{
					withCredentials: true,
					headers: { 'Content-Type': 'application/json' },
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

	const handleOpenProvisionModal = (userId: string) => {
		setSelectedUserId(userId); // Set the user ID for the form
		setIsProvisionModalOpen(true); // Open the modal
	};

	const handleCloseProvisionModal = () => {
		setIsProvisionModalOpen(false);
		setSelectedUserId(null); // Clear the user ID when closing
	};

	const handleProvisionSaveSuccess = (updatedUser: UserData) => {
		console.log("Provision successful in parent, updating list:", updatedUser);
		// Update the specific user in the list
		// Ensure the updatedUser structure matches the User type or adapt as needed
		setUsers(prevUsers =>
			prevUsers.map(u =>
				u.id === updatedUser.id
					// Smart merge: keep existing fields, overwrite with updated ones
					// Convert role_id back to string if User type requires it, otherwise keep as number
					? {
						...u,
						mnumber: updatedUser.mnumber,
						name: updatedUser.name,
						email: updatedUser.email, // Assuming email doesn't change here, but good practice
						image: updatedUser.image,
						isEnabled: updatedUser.isEnabled,
						college: updatedUser.college,
						department: updatedUser.department,
						// Handle potential type difference for roles
						roles: updatedUser.roles?.map(r => ({ ...r, role_id: String(r.role_id) })) || [], // Example: Convert role_id to string
					}
					: u
			)
		);
		// Alternatively, refetch the entire list for simplicity:
		// debouncedFetchUsers(filters);

		handleCloseProvisionModal(); // Close the modal after saving
	};

	return (
		<div className="container mx-auto p-4 space-y-6">
			<Toaster richColors position="top-right" />
			<h1 className="text-2xl font-bold">User Management</h1>

			{/* Filter Controls */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-card text-card-foreground">
				{/* Input fields ... */}
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
			{isLoading && <p>Loading users...</p>}

			{!isLoading && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{users.map(user => (
						<UserCard
							key={user.id}
							user={user}
							onToggleEnable={handleToggleEnable}
							isToggling={togglingUserId === user.id}
							currentAdminId={currentAdminId}
							onOpenProvisionModal={handleOpenProvisionModal}
						/>
					))}
				</div>
			)}

			{/* --- Provision User Modal --- */}
			{/* Render the modal conditionally based on state */}
			{isProvisionModalOpen && selectedUserId && (
				<Modal
					isOpen={isProvisionModalOpen}
					onClose={handleCloseProvisionModal}
					title="Edit / Provision User" // Set modal title
					description="Update user details and permissions." // Optional description
					size="lg" // Or 'xl' if the form is wide
				>
					{/*
                        Add a unique key based on selectedUserId.
                        This forces React to re-mount ProvisionUserForm when the user changes,
                        ensuring its internal useEffect for fetching data runs correctly.
                     */}
					<ProvisionUserForm
						key={selectedUserId}
						userId={selectedUserId}
						onSaveSuccess={handleProvisionSaveSuccess}
						onCancel={handleCloseProvisionModal}
					/>
				</Modal>
			)}
		</div>
	);
};

export default UserList;