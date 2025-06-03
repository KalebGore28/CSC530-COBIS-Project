import React, { useState, Suspense } from 'react';

//GraphQL imports
import type { provisionUserQuery } from './__generated__/provisionUserQuery.graphql';
import { graphql, useLazyLoadQuery } from "react-relay";

const provisionUserQuery = graphql`
	mutation provisionUserQuery($input: CreateFacultyInput!) {
		provisionFaculty(input: $input) {
			mnumber
			first_name
			last_name
			department {
				code
				description
			}
			college {
				code
				description
			}
		}
	}
`;


import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// 
import { CollegeSelect } from './provision-user/college-select';
import { DepartmentSelect } from './provision-user/department-select';
import { MultiRoleSelect } from './provision-user/multi-role-select';
import { FacultySearch } from './provision-user/faculty-search';


import type { QueryUser } from '@/pages/cobis-tools/users';

// Update Props: Remove initialUser
interface ProvisionUserFormProps {
	user: QueryUser | null; // Allow null to handle cases where no user is selected yet
	onSaveSuccess: (updatedUser: any) => void; // Pass back UserData on success
	onCancel: () => void;
	className?: string;
}

// --- Component Implementation ---

export function ProvisionUserForm({
	user,
	onSaveSuccess,
	onCancel,
	className,
}: ProvisionUserFormProps) {

	return (
		<>
			<FacultySearch
				onChange={() => { }}
				defaultMnumber={'M22106375'}
			/>

			<DepartmentSelect
				onChange={() => { }}
				defaultCode={'0000'}
			/>

			<CollegeSelect
				onChange={() => { }}
				defaultCode={'0'}
			/>

			<MultiRoleSelect
				onChange={() => { }}
				defaultRoles={[
					'faculty',
					'advisor',
				]}
			/>

			<div className="flex items-center space-x-2">
				<Checkbox
					id="isEnabled"
					checked={false}
					onCheckedChange={() => { }}
					// Disable while submitting
					disabled={false}
				/>
				<Label
					htmlFor="isEnabled"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Enable User Account
				</Label>
			</div>

			{/* Action Buttons */}
			<div className="flex justify-end space-x-3 pt-4">
				<Button type="button" variant="outline" onClick={onCancel} disabled={false}>
					Cancel
				</Button>
				<Button type="submit" disabled={false}>
					{false ? 'Saving...' : 'Save Provision'}
				</Button>
			</div>
		</>
	)
}