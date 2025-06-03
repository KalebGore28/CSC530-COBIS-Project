import React, { Suspense, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from '@/context/session';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/modals/modal';
import { ProvisionUserForm } from '@/components/forms/provision-user';

// GraphQL imports
import type { usersQuery } from "./__generated__/usersQuery.graphql";
import { graphql, useLazyLoadQuery } from "react-relay";

const usersQuery = graphql`
	query usersQuery {
		users {
			id
			mnumber
			name
			email
			emailVerified
			image
			createdAt
			updatedAt
			isEnabled
			lastLogin
			faculty {
				college {
					code
					description
				}
				department {
					code
					description
				}
			}
			roles {
				role {
					id
					name
				}
			}
		}
	}
`;

export type QueryUser = usersQuery['response']['users'][number];

const getInitials = (name: string | null | undefined): string => {
	if (!name) {
		return '??';
	}
	return name
		.split(' ')
		.map(n => (n && n[0] ? n[0] : ''))
		.join('')
		.toUpperCase();

}

export const UserList: React.FC = () => {
	const { session } = useSession();
	let currentAdminId = session?.session?.data?.user?.id;

	if (!currentAdminId) {
		return null;
	}

	return (
		<Suspense fallback={<Skeleton className="h-96 w-full" />}>
			<UserListContent currentAdminId={currentAdminId} />
		</Suspense>
	)

}

const UserListContent: React.FC<{ currentAdminId: string }> = ({ currentAdminId }) => {
	const [selectedUser, setSelectedUser] = useState<QueryUser | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	const data = useLazyLoadQuery<usersQuery>(
		usersQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
	);

	const users = data.users || [];

	const filteredUsers = users.filter((user) => {
		const term = searchTerm.toLowerCase();
		return (
			user.name?.toLowerCase().includes(term) ||
			user.mnumber?.toLowerCase().includes(term) ||
			user.email?.toLowerCase().includes(term)
		);
	});

	return (
		<div className="space-y-4">
			{/* Filter Card */}
			<Card className="w-full max-w-3xl mx-auto">
				<CardHeader>
					<CardTitle>Filter Users</CardTitle>
					<CardDescription>Search by name, M#, or email.</CardDescription>
				</CardHeader>
				<CardContent>
					<Input
						placeholder="Search users..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</CardContent>
			</Card>

			{/* User Cards */}
			<div className="flex flex-wrap gap-4 justify-center">
				{filteredUsers.map((u) => (
					<UserCard
						key={u.id}
						currentAdminId={currentAdminId}
						user={u}
						onOpenProvisionModal={() => {
							setSelectedUser(u);
							setModalOpen(true);
						}}
					/>
				))}
			</div>

			{/* Modal */}
			<Modal
				isOpen={modalOpen}
				onClose={() => {
					setModalOpen(false);
					setSelectedUser(null);
				}}
				title="Provision User"
				description="Fill in the details to provision this user."
				size="lg"
			>
				<ProvisionUserForm
					user={selectedUser}
					// TODO: finish this part
					onSaveSuccess={() => { }}
					onCancel={() => {
						setModalOpen(false);
						setSelectedUser(null);
					}}
				/>
			</Modal>
		</div>
	);
};


const UserCard: React.FC<{
	user: usersQuery['response']['users'][number];
	currentAdminId: string;
	onOpenProvisionModal: (userId: string) => void;
}> = ({ user, currentAdminId, onOpenProvisionModal }) => {
	const initials = getInitials(user.name);

	return (
		<Card className="w-full max-w-sm min-w-[250px] flex flex-col shadow-sm border border-muted gap-0 p-2">
			<CardHeader className="flex flex-row items-start justify-between space-y-0 p-2">
				<div className="flex items-center gap-2 flex-shrink min-w-0">
					<div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
						{initials}
					</div>
					<div className="min-w-0">
						<CardTitle className="text-sm font-medium truncate">
							{user.name}
							{currentAdminId === user.id && (
								<span className="text-xs text-muted-foreground ml-1">(You)</span>
							)}
						</CardTitle>
						<CardDescription className="text-xs text-muted-foreground truncate">
							{user.email}
						</CardDescription>
					</div>
				</div>
				<Label className={`text-xs ${user.isEnabled ? 'bg-green-100 text-green-800 border border-green-800' : 'bg-red-100 text-red-800 border border-red-800'} px-2 py-1 rounded whitespace-nowrap flex-shrink-0 ml-2`}>
					{user.isEnabled ? 'Active' : 'Inactive'}
				</Label>
			</CardHeader>
			<CardContent className="text-xs text-muted-foreground space-y-1 p-2 flex-1">
				<p className="truncate"><strong className="text-foreground font-medium">M#:</strong> {user.mnumber || 'N/A'}</p>
				<p className="truncate"><strong className="text-foreground font-medium">College:</strong> {user.faculty?.college?.description || 'N/A'}</p>
				<p className="truncate"><strong className="text-foreground font-medium">Department:</strong> {user.faculty?.department?.description || 'N/A'}</p>
				<p><strong className="text-foreground font-medium">Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
				<p className="truncate">
					<strong className="text-foreground font-medium">Last Login:</strong>{' '}
					{user.lastLogin && user.lastLogin !== '0' ? new Date(parseInt(user.lastLogin) * 1000).toLocaleString() : 'Never'}
				</p>
			</CardContent>
			<CardFooter className="flex flex-col gap-2 p-2">
				<div className="flex flex-wrap w-full gap-1">
					<Label className="text-xs flex-shrink-0">Roles:</Label>
					{user.roles.length > 0 ? user.roles.map(role => (
						<Label

							key={role.role.id}
							className="p-1 rounded text-xs whitespace-nowrap border bg-muted text-muted-foreground"
							title={role.role.name}
						>
							{role.role.name}
						</Label>
					))
						: <span className="text-muted-foreground text-xs">No roles assigned</span>
					}
					<div className="flex flex-wrap gap-1 max-w-[70%]">
					</div>
				</div>
				{currentAdminId !== user.id && (
					<Button
						className="w-full px-3 py-1 rounded text-sm transition-colors"
						onClick={() => onOpenProvisionModal(user.id)}
					>
						Provision User
					</Button>
				)}
			</CardFooter>
		</Card>
	);
};
