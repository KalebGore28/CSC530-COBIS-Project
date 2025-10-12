import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMutation } from "react-relay";
import { toast } from 'sonner';

// GraphQL mutation—note we renamed it to “provisionUserMutation”:
import type { provisionUserMutation } from './__generated__/provisionUserMutation.graphql';
import { graphql } from "react-relay";

const provisionUserMutation = graphql`
  mutation provisionUserMutation($input: CreateFacultyInput!) {
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
		user {
		id
		}
    }
  }
`;

// Interface Imports
import { type MinimalFaculty, FacultySearch } from './faculty-search';
import { type MinimalDepartment, DepartmentSelect } from './department-select';
import { Role, type College } from '@cobis/types';
import { CollegeSelect } from './college-select';
import { MultiRoleSelect } from './multi-role-select';
import type { QueryUser } from '@/pages/cobis-tools/users';


// Update Props: we no longer pass “initialUser” separately—just the selected `user`
interface ProvisionUserFormProps {
	user: QueryUser | null; // user may be null if nothing is selected
	onSaveSuccess: (updatedUser: QueryUser) => void; // callback when the mutation succeeds
	onCancel: () => void;
}

export const ProvisionUserForm: React.FC<ProvisionUserFormProps> = ({
	user,
	onSaveSuccess,
	onCancel,
}) => {
	// Faculty: only initialize if both user.mnumber and user.name exist
	const [selectedFaculty, setSelectedFaculty] = useState<MinimalFaculty | null>(
		user?.mnumber && user?.name
			? {
				mnumber: user.mnumber,
				first_name: user.name.split(" ")[0],
				last_name: user.name.split(" ")[1] || "",
			}
			: null
	);

	// Department: only initialize if user.faculty.department is non‐nullish
	const [selectedDepartment, setSelectedDepartment] = useState<MinimalDepartment | null>(
		user?.faculty?.department
			? {
				code: user.faculty.department.code,
				description: user.faculty.department.description,
			}
			: null
	);

	// College: only initialize if user.faculty.college is non‐nullish
	const [selectedCollege, setSelectedCollege] = useState<College | null>(
		user?.faculty?.college
			? {
				code: user.faculty.college.code,
				description: user.faculty?.college?.description,
			}
			: null
	);

	const [selectedRoleNames, setSelectedRoleNames] = useState<Role[]>(
		user?.roles?.map(r => ({ ...r.role, id: parseInt(r.role.id, 10) })) || []
	);
	const [isEnabled, setIsEnabled] = useState<boolean>(user?.isEnabled || false);

	// 1) Setup the Relay mutation hook. `commit` is what we call on click;
	//    `isInFlight` is true while the network request is pending.
	const [commit, isInFlight] = useMutation<provisionUserMutation>(
		provisionUserMutation
	);

	// 2) When “Save Provision” is clicked, gather all fields into a single
	//    CreateFacultyInput and fire `commit({ variables: { input } })`.
	//    We do not need useEffect—this is a direct click‐handler approach.
	const handleSaveClick = () => {
		if (!user) {
			toast.error("No user selected for provisioning.");
			return;
		}
		if (!selectedFaculty || !selectedDepartment || !selectedCollege || selectedFaculty.mnumber.trim() === '') {
			toast.error("Please select a faculty member, department, and college.");
			return;
		}

		const input = {
			user_id: user.id,
			mnumber: selectedFaculty.mnumber,
			college_code: selectedCollege.code,
			department_code: selectedDepartment.code,
			role_ids: selectedRoleNames.map((r) => r.id), // array of numbers
			enableUser: isEnabled,
		};

		commit({
			variables: { input },
			onCompleted: (_, errors) => {
				if (errors && errors.length > 0) {
					// Optionally surface an error toast
					return;
				}
				// `response.provisionFaculty` is the newly returned Faculty object
				onSaveSuccess({
					...user,
				});
			},
		});
	};

	return (

		<div className="space-y-4 p-6">
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
					checked={isEnabled}
					onCheckedChange={(checked) => setIsEnabled(!!checked)}
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
				<Button
					type="button"
					variant="outline"
					onClick={onCancel}
					disabled={isInFlight}
				>
					Cancel
				</Button>

				<Button
					type="button"
					onClick={handleSaveClick}
					disabled={
						isInFlight ||
						!selectedFaculty ||
						!selectedDepartment ||
						!selectedCollege
					}
				>
					{isInFlight ? "Saving…" : "Save Provision"}
				</Button>
			</div>
		</div>
	);
};
