import React, { useState, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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



// Interface Imports
import { type MinimalFaculty, FacultySearch } from './provision-user/faculty-search';
import { type MinimalDepartment, DepartmentSelect } from './provision-user/department-select';
import { type College } from '@cobis/types';
import { CollegeSelect } from './provision-user/college-select';
import { MultiRoleSelect } from './provision-user/multi-role-select';
import type { QueryUser } from '@/pages/cobis-tools/users';

// Update Props: Remove initialUser
interface ProvisionUserFormProps {
	user: QueryUser | null; // Allow null to handle cases where no user is selected yet
	onSaveSuccess: (updatedUser: any) => void; // Pass back UserData on success
	onCancel: () => void;
	className?: string;
}

// --- Component Implementation ---

export const ProvisionUserForm: React.FC<ProvisionUserFormProps> = ({
	user,
	onSaveSuccess,
	onCancel,
	className,
}: ProvisionUserFormProps) => {
	const [selectedFaculty, setSelectedFaculty] = useState<MinimalFaculty | null>({
		mnumber: user?.mnumber || '',
		first_name: user?.name.split(' ')[0] || '',
		last_name: user?.name.split(' ')[1] || '',
	});
	const [selectedDepartment, setSelectedDepartment] = useState<MinimalDepartment | null>({
		code: user?.faculty?.department?.code || '',
		description: user?.faculty?.department?.description || '',
	});
	const [selectedCollege, setSelectedCollege] = useState<College | null>({
		code: user?.faculty?.college?.code || '',
		description: user?.faculty?.college?.description || '',
	});
	const [selectedRoleNames, setSelectedRoleNames] = useState<string[]>([
		...(user?.roles?.map(role => role.role.name) || []),
	]);

	return (
		<div className='space-y-4 p-6'>

			<span className="text-md font-semibold">Search Faculty</span>
			<FacultySearch
				selectedFaculty={selectedFaculty}
				onChange={(fac) => setSelectedFaculty(fac)}
			/>

			<span className="text-md font-semibold">Select Department</span>
			<DepartmentSelect
				selectedDepartment={selectedDepartment}
				onChange={(dept) => setSelectedDepartment(dept)}
			/>

			{/*  */}
			<span className="text-md font-semibold">Select College</span>
			<CollegeSelect
				selectedCollege={selectedCollege}
				onChange={(college) => setSelectedCollege(college)}
			/>

			<span className="text-md font-semibold">Assign Roles</span>
			<MultiRoleSelect
				selectedRoles={selectedRoleNames}
				onChange={(roles) => setSelectedRoleNames(roles)}
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
		</div>
	)
}