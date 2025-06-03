import React, { Suspense } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { useSession } from '@/context/session';
// import { Modal } from '@/components/modals/modal';
// import { ProvisionUserForm } from '@/components/forms/provision-user';
import { Skeleton } from "@/components/ui/skeleton";

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
	let currentAdminId = ''//session?.session?.data?.user?.id;

	// if (!currentAdminId) {
	// 	return null;
	// }

	return (
		<Suspense fallback={<Skeleton className="h-96 w-full" />}>
			<UserListContent currentAdminId={currentAdminId} />
		</Suspense>
	)

}

const UserListContent: React.FC<{ currentAdminId: string }> = ({ currentAdminId }) => {
	const data = useLazyLoadQuery<usersQuery>(
		usersQuery,
		{},
		{ fetchPolicy: 'store-or-network' }
	);

	const users = data.users || [];
	console.log(users);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{users.map(u => (
				<UserCard
					key={u.id}
					currentAdminId={currentAdminId}
					user={u}
					onOpenProvisionModal={() => { }}
				/>
			))}
		</div>
	);
}

const UserCard: React.FC<{
	user: usersQuery['response']['users'][number];
	currentAdminId: string;
	onOpenProvisionModal: (userId: string) => void;
}> = ({ user, currentAdminId, onOpenProvisionModal }) => {
	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
						<span className="text-lg font-bold text-gray-700">
							{getInitials(user.name)}
						</span>
					</div>
					<span>{user.name}</span>
				</CardTitle>
				<CardDescription className="text-sm text-gray-500">
					{user.email}
				</CardDescription>
				<div className="mt-2 flex items-center gap-2">
					<span className={`badge ${user.isEnabled ? 'bg-green-500' : 'bg-red-500'}`}>
						{user.isEnabled ? 'Enabled' : 'Disabled'}
					</span>
					<button
						className="btn btn-primary"
						// onClick={() => onOpenProvisionModal(user.id)}
					>
						Provision
					</button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="text-sm text-gray-600">
					<p><strong>M-Number:</strong> {user.mnumber}</p>
					<p><strong>College:</strong> {user.faculty?.college?.description || 'N/A'}</p>
					<p><strong>Department:</strong> {user.faculty?.department?.description || 'N/A'}</p>
					<p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
					<p><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
				</div>
			</CardContent>
		</Card>

	);
}