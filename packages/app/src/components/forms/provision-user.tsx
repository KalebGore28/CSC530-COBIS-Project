import React, { useState, useEffect, Suspense } from 'react';

//GraphQL imports
import { graphql, useLazyLoadQuery } from "react-relay";

const facultySearchAddQuery = graphql`
	mutation facultySearchAddQuery($input: CreateFacultyInput!) {
		provisionFaculty(input: CreateFacultyInput!) {
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

import axios from 'axios';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";


import { CollegeSelect } from './provision-user/college-select';
import { DepartmentSelect } from './provision-user/department-select';
import { MultiRoleSelect } from './provision-user/multi-role-select';
import { FacultySearch } from './provision-user/faculty-search';
import type { QueryUser } from '@/pages/cobis-tools/users';

// --- Types ---
interface Faculty {
	mnumber: string;
	firstName: string;
	lastName: string;
}

// Update Props: Remove initialUser
interface ProvisionUserFormProps {
	user: QueryUser | null; // Allow null to handle cases where no user is selected yet
	onSaveSuccess: (updatedUser: UserData) => void; // Pass back UserData on success
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
	// --- State ---
	// Form field states
	const [selectedCollege, setSelectedCollege] = useState<LookupOption | null>(null);
	const [selectedDepartment, setSelectedDepartment] = useState<LookupOption | null>(null);
	const [selectedRoles, setSelectedRoles] = useState<LookupOption[]>([]);
	const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
	const [isEnabled, setIsEnabled] = useState<boolean>(true);

	// Loading/Error states for form submission
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
	const [submitError, setSubmitError] = useState<string | null>(null); // API errors on PUT

	// Loading/Error states for initial data fetch
	const [isFetchingInitialData, setIsFetchingInitialData] = useState<boolean>(false);
	const [fetchInitialError, setFetchInitialError] = useState<string | null>(null);





	const handleEnabledChange = (checked: boolean | 'indeterminate') => {
		if (typeof checked === 'boolean') setIsEnabled(checked);
	};

	// --- Manual Validation --- (Remains the same)
	const validateForm = (): boolean => {
		let isValid = true;
		setSubmitError(null); // Clear previous API error on new validation attempt
		return isValid;
	};

	// --- Form Submission --- (Remains mostly the same, uses isSubmitting state)
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!user) { // Should not happen if form is rendered, but good check
			toast.error("Cannot save, User ID is missing.");
			return;
		}
		if (!validateForm()) {
			toast.error("Please fix the errors in the form.");
			return;
		}

		setIsSubmitting(true); // Use isSubmitting state
		setSubmitError(null);

		const payload = {
			role_ids: selectedRoles.map(o => Number(o.code)).filter(id => !isNaN(id) && id > 0),
			mnumber: selectedFaculty?.mnumber ?? null,
			isEnabled: isEnabled,
			college: selectedCollege?.code ?? "0",
			department: selectedDepartment?.code ?? "0000",
		};

		try {
			const response = await axios.put(
				`/api/user/${user.id}/provision`,
				payload,
				{ withCredentials: true, headers: { 'Content-Type': 'application/json' } }
			);

			if (response.data && response.data.success && response.data.user) {
				toast.success("User provisioned successfully.");
				onSaveSuccess(response.data.user); // Pass back updated user data
			} else {
				throw new Error(response.data?.message || "Provisioning failed. Please check the details.");
			}
		} catch (error) {
			console.error("Provisioning failed:", error);
			let errorMsg = "An unexpected error occurred.";
			if (axios.isAxiosError(error)) {
				errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
			} else if (error instanceof Error) { errorMsg = error.message; }
			setSubmitError(errorMsg);
			toast.error(`Provisioning Failed: ${errorMsg}`);
		} finally {
			setIsSubmitting(false); // Use isSubmitting state
		}
	};

	// --- Render Logic ---

	// Handle initial loading state
	if (isFetchingInitialData) {
		return (
			<div className="flex justify-center items-center p-8">
				{/* Replace with your preferred loading indicator */}
				{/* <Spinner size="large" /> */}
				Loading user data...
			</div>
		);
	}

	// Handle initial data fetch error
	if (fetchInitialError) {
		return (
			<div className="p-4 text-center text-destructive">
				<p>Error loading user data:</p>
				<p>{fetchInitialError}</p>
				<Button variant="outline" onClick={onCancel} className="mt-4">Close</Button>
			</div>
		);
	}

	// Handle case where userId is null/not provided after initial checks
	if (!user) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				Please select a user to provision.
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
			<FacultySearch
				onChange={() => { }}
			/>

			<DepartmentSelect
				onChange={() => { }}
			/>

			<CollegeSelect
				onChange={() => { }}
			/>

			<MultiRoleSelect
				onChange={() => { }}
			/>



			{/* isEnabled Checkbox */}
			<div className="flex items-center space-x-2">
				<Checkbox
					id="isEnabled"
					checked={isEnabled}
					onCheckedChange={handleEnabledChange}
					// Disable while submitting
					disabled={isSubmitting}
				/>
				<Label
					htmlFor="isEnabled"
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
				>
					Enable User Account
				</Label>
			</div>

			{/* General API Submission Error Display */}
			{submitError && (
				<p className="text-sm font-medium text-destructive">{submitError}</p>
			)}

			{/* Action Buttons */}
			<div className="flex justify-end space-x-3 pt-4">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : 'Save Provision'}
				</Button>
			</div>
		</form>
	);
}