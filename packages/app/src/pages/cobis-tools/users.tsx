import React, { useState, useEffect, useMemo, Suspense } from 'react';
import axios from 'axios';
import { User, UserFilters, UserData } from '@/types/user';
import UserCard from '@/components/user-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useSession } from '@/context/session';
import { Modal } from '@/components/modals/modal';
import { ProvisionUserForm } from '@/components/forms/provision-user';
import { Skeleton } from "@/components/ui/skeleton";

// GraphQL imports
import { graphql, useLazyLoadQuery } from "react-relay";

export const UserList: React.FC = () => {
	const { session } = useSession();
	const currentAdminId = session?.session?.data?.user?.id;

	// raw list
	const [allUsers, setAllUsers] = useState<User[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// client-side filters
	const [filters, setFilters] = useState<UserFilters>({
		name: '',
		email: '',
		mnumber: '',
		college: '',
		department: '',
		isEnabled: undefined,
	});

	// modal state
	const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
	const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

	// 1) Fetch all users once
	useEffect(() => {
		setIsLoading(true);
		axios
			.get<User[]>('/api/user', { withCredentials: true })
			.then(res => setAllUsers(res.data))
			.catch(err => {
				console.error(err);
				const msg = 'Failed to load users.';
				setError(msg);
				toast.error(msg);
			})
			.finally(() => setIsLoading(false));
	}, []);

	// 2) Derive filtered list
	const filteredUsers = useMemo(() => {
		return allUsers.filter(u => {
			const name_filter = (filters.name ?? '').toLowerCase();
			const email_filter = (filters.email ?? '').toLowerCase();
			const mnumber_filter = (filters.mnumber ?? '').toLowerCase();
			const college_filter = (filters.college ?? '').toLowerCase();
			const department_filter = (filters.department ?? '').toLowerCase();

			// name
			if (filters.name && !u.name.toLowerCase().includes(name_filter)) {
				return false;
			}

			// email
			if (filters.email && !u.email.toLowerCase().includes(email_filter)) {
				return false;
			}

			// m-number
			if (
				filters.mnumber &&
				!((u.mnumber ?? '').toLowerCase().includes(mnumber_filter))
			) {
				return false;
			}

			// college: check both college and college_code
			if (filters.college) {
				const colName = (u.college ?? '').toLowerCase();
				const colCode = (u.college_code ?? '').toLowerCase();
				if (!colName.includes(college_filter) && !colCode.includes(college_filter)) {
					return false;
				}
			}

			// department: check both department and department_code
			if (filters.department) {
				const deptName = (u.department ?? '').toLowerCase();
				const deptCode = (u.department_code ?? '').toLowerCase();
				if (!deptName.includes(department_filter) && !deptCode.includes(department_filter)) {
					return false;
				}
			}

			// status
			if (filters.isEnabled !== undefined && u.isEnabled !== filters.isEnabled) {
				return false;
			}

			return true;
		});
	}, [allUsers, filters]);


	// handlers
	const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFilters(f => ({ ...f, [name]: value }));
	};
	const handleStatusFilterChange = (val: string) =>
		setFilters(f => ({ ...f, isEnabled: val === 'all' ? undefined : val === 'true' }));

	const handleToggleEnable = async (userId: string, currentStatus: boolean) => {
		if (userId === currentAdminId && currentStatus) {
			toast.error("You cannot disable your own account.");
			return;
		}
		setTogglingUserId(userId);
		const endpoint = currentStatus ? `/api/user/${userId}/disable` : `/api/user/${userId}/enable`;
		try {
			await axios.post(endpoint, {}, { withCredentials: true });
			setAllUsers(us =>
				us.map(u => (u.id === userId ? { ...u, isEnabled: !currentStatus } : u))
			);
			toast.success(currentStatus ? 'User disabled' : 'User enabled');
		} catch {
			toast.error(currentStatus ? 'Failed to disable' : 'Failed to enable');
		} finally {
			setTogglingUserId(null);
		}
	};

	const handleOpenProvisionModal = (userId: string) => {
		setSelectedUserId(userId);
		setIsProvisionModalOpen(true);
	};
	const handleCloseProvisionModal = () => {
		setIsProvisionModalOpen(false);
		setSelectedUserId(null);
	};
	const handleProvisionSaveSuccess = (updated: UserData) => {
		setAllUsers(us =>
			us.map(u =>
				u.id === updated.id
					? {
						...u,
						// merge updated fields (cast as needed)
						name: updated.name ?? u.name,
						email: updated.email ?? u.email,
						mnumber: updated.mnumber ?? u.mnumber,
						college: updated.college ?? u.college,
						college_code: updated.college_code ?? u.college_code,
						department: updated.department ?? u.department,
						department_code: updated.department_code ?? u.department_code,
						isEnabled: updated.isEnabled ?? u.isEnabled,
						roles: updated.roles
							? updated.roles.map(r => ({ ...r, role_id: Number(r.role_id) }))
							: u.roles,
					}
					: u
			)
		);
		handleCloseProvisionModal();
	};

	return (
		<div className="space-y-6">

			{/* Filters */}
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-card text-card-foreground">
				<div className="space-y-1">
					<Label htmlFor="name">Name</Label>
					<Input id="name" name="name" value={filters.name} onChange={handleFilterChange} placeholder="Filter by name…" />
				</div>
				<div className="space-y-1">
					<Label htmlFor="email">Email</Label>
					<Input id="email" name="email" type="email" value={filters.email} onChange={handleFilterChange} placeholder="Filter by email…" />
				</div>
				<div className="space-y-1">
					<Label htmlFor="mnumber">M-Number</Label>
					<Input id="mnumber" name="mnumber" value={filters.mnumber} onChange={handleFilterChange} placeholder="Filter by M-Number…" />
				</div>
				<div className="space-y-1">
					<Label htmlFor="college">College</Label>
					<Input id="college" name="college" value={filters.college} onChange={handleFilterChange} placeholder="Filter by college…" />
				</div>
				<div className="space-y-1">
					<Label htmlFor="department">Department</Label>
					<Input id="department" name="department" value={filters.department} onChange={handleFilterChange} placeholder="Filter by department…" />
				</div>
				<div className="space-y-1">
					<Label htmlFor="status">Status</Label>
					<Select value={filters.isEnabled === undefined ? 'all' : String(filters.isEnabled)} onValueChange={handleStatusFilterChange}>
						<SelectTrigger><SelectValue placeholder="All users" /></SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Users</SelectItem>
							<SelectItem value="true">Enabled</SelectItem>
							<SelectItem value="false">Disabled</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* List */}
			{isLoading && <p>Loading users…</p>}
			{!isLoading && error && <p className="text-red-600">{error}</p>}
			{!isLoading && !error && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{filteredUsers.map(u => (
						<UserCard
							key={u.id}
							user={u}
							onToggleEnable={handleToggleEnable}
							isToggling={togglingUserId === u.id}
							currentAdminId={currentAdminId}
							onOpenProvisionModal={handleOpenProvisionModal}
						/>
					))}
				</div>
			)}

			{/* Provision Modal */}
			{isProvisionModalOpen && selectedUserId && (
				<Modal isOpen onClose={handleCloseProvisionModal} title="Edit / Provision User" size="lg">
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