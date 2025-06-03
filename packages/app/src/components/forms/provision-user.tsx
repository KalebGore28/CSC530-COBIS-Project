import React, { useState, useEffect, useCallback } from 'react';
import { UserData } from '@/types/user';
import axios from 'axios';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LookupSelector, LookupOption } from "@/components/selectors/lookup-selector";
import { MultiLookupSelector } from "@/components/selectors/multi-lookup-selector";
import SearchInput from "@/components/common/search-input";
import { cn } from "@/lib/utils";
// Import a spinner or loading component if you have one
// import { Spinner } from "@/components/ui/spinner";

// --- Types ---
interface Faculty {
	mnumber: string;
	firstName: string;
	lastName: string;
}

// Update Props: Remove initialUser
interface ProvisionUserFormProps {
	userId: string | null; // Allow null to handle cases where no user is selected yet
	onSaveSuccess: (updatedUser: UserData) => void; // Pass back UserData on success
	onCancel: () => void;
	className?: string;
}

// --- Component Implementation ---

export function ProvisionUserForm({
	userId,
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

	// State for validation errors
	const [collegeError, setCollegeError] = useState<string | null>(null);
	const [departmentError, setDepartmentError] = useState<string | null>(null);
	const [rolesError, setRolesError] = useState<string | null>(null);


	// --- Effects ---
	// Fetch initial user data when userId changes
	useEffect(() => {
		// Clear previous data and errors when userId changes or becomes null
		setSelectedCollege(null);
		setSelectedDepartment(null);
		setSelectedRoles([]);
		setSelectedFaculty(null);
		setIsEnabled(true); // Reset to default
		setCollegeError(null);
		setDepartmentError(null);
		setRolesError(null);
		setSubmitError(null);
		setFetchInitialError(null);


		if (!userId) {
			// If no userId, don't fetch, maybe reset form or show message
			setIsFetchingInitialData(false);
			// Optionally set an error or just leave the form blank/disabled
			// setFetchInitialError("No user selected for provisioning.");
			return;
		}

		const fetchUserData = async () => {
			setIsFetchingInitialData(true);
			setFetchInitialError(null); // Clear previous fetch error

			try {
				const response = await axios.get<UserData>(`/api/user/${userId}`, {
					withCredentials: true,
				});
				const userData = response.data;

				// --- Populate state based on fetched userData ---
				setIsEnabled(userData.isEnabled ?? true);

				const initialCollegeCode = userData.college_code || "0";
				const initialDepartmentCode = userData.department_code || "0000";
				// Set state with placeholder descriptions; Lookup components will fetch real ones
				setSelectedCollege({ code: initialCollegeCode, description: initialCollegeCode === "0" ? 'Select...' : 'Loading...' });
				setSelectedDepartment({ code: initialDepartmentCode, description: initialDepartmentCode === "0000" ? 'Select...' : 'Loading...' });

				const initialRoleCodes = userData.roles?.map(r => r.role_id) || [];
				// Set state with placeholder descriptions; Lookup components will fetch real ones
				setSelectedRoles(initialRoleCodes.map(code => ({ code, description: 'Loading...' })));

				const initialMnumber = userData.mnumber || null;
				if (initialMnumber && userData.name) { // Need name to prefill faculty display
					const nameParts = userData.name.split(' ') || [];
					const firstName = nameParts[0] || '';
					const lastName = nameParts.slice(1).join(' ') || '';
					setSelectedFaculty({ mnumber: initialMnumber, firstName, lastName });
				} else {
					setSelectedFaculty(null); // Clear if no mnumber or name
				}
				// --- End of state population ---

			} catch (error) {
				console.error("Failed to fetch user data:", error);
				let errorMsg = "Failed to load user data.";
				if (axios.isAxiosError(error)) {
					errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
				} else if (error instanceof Error) {
					errorMsg = error.message;
				}
				setFetchInitialError(errorMsg);
				toast.error(`Error loading user: ${errorMsg}`);
			} finally {
				setIsFetchingInitialData(false);
			}
		};

		fetchUserData();

	}, [userId]); // Re-run effect if userId changes

	const searchFaculty = useCallback(async (query: string): Promise<Faculty[]> => {
		if (!query || query.trim().length < 2) return [];
		try {
			const response = await fetch(`/api/search/faculty?query=${encodeURIComponent(query)}`);
			if (!response.ok) return [];
			return await response.json() as Faculty[];
		} catch (error) { return []; }
	}, []);


	// --- Event Handlers --- (Remain the same)
	const handleFacultySelect = (faculty: Faculty) => {
		setSelectedFaculty(faculty);
	};
	const handleFacultyRemove = () => {
		setSelectedFaculty(null);
	};
	const handleCollegeChange = (option: LookupOption | null) => {
		setSelectedCollege(option);
		if (option && option.code !== "0") setCollegeError(null);
	};
	const handleDepartmentChange = (option: LookupOption | null) => {
		setSelectedDepartment(option);
		if (option && option.code !== "0000") setDepartmentError(null);
	};
	const handleRolesChange = (options: LookupOption[]) => {
		setSelectedRoles(options);
		if (options.length > 0) setRolesError(null);
	};
	const handleEnabledChange = (checked: boolean | 'indeterminate') => {
		if (typeof checked === 'boolean') setIsEnabled(checked);
	};

	// --- Manual Validation --- (Remains the same)
	const validateForm = (): boolean => {
		let isValid = true;
		setCollegeError(null);
		setDepartmentError(null);
		setRolesError(null);
		setSubmitError(null); // Clear previous API error on new validation attempt

		if (!selectedCollege || selectedCollege.code === "0") {
			setCollegeError("College selection is required."); isValid = false;
		}
		if (!selectedDepartment || selectedDepartment.code === "0000") {
			setDepartmentError("Department selection is required."); isValid = false;
		}
		if (selectedRoles.length === 0) {
			setRolesError("At least one role is required."); isValid = false;
		}
		return isValid;
	};

	// --- Form Submission --- (Remains mostly the same, uses isSubmitting state)
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!userId) { // Should not happen if form is rendered, but good check
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
				`/api/user/${userId}/provision`,
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
	if (!userId) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				Please select a user to provision.
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
			{/* Faculty/M-Number Search */}
			<div className="space-y-2">
				<Label htmlFor="faculty-search">Faculty / M-Number (Optional)</Label>
				<SearchInput<Faculty>
					searchApi={searchFaculty}
					onSelect={handleFacultySelect}
					onRemove={handleFacultyRemove}
					selectedItems={selectedFaculty ? [selectedFaculty] : []}
					renderResult={(faculty: Faculty) => `${faculty.firstName} ${faculty.lastName} (${faculty.mnumber})`}
					placeholder="Search by name or M-Number..."
					className="w-full"
				/>
				<p className="text-sm text-muted-foreground">
					Select a faculty member to link their M-Number. Leave blank if not applicable.
				</p>
			</div>

			{/* College Selector */}
			<div className="space-y-2">
				<Label htmlFor="college-selector">College</Label>
				<LookupSelector
					lookupType="colleges"
					value={selectedCollege?.code}
					onValueChange={handleCollegeChange}
					placeholder="Select College..."
					className="w-full"
					// Disable while submitting
					disabled={isSubmitting}
				/>
				{collegeError && (
					<p className="text-sm font-medium text-destructive">{collegeError}</p>
				)}
			</div>

			{/* Department Selector */}
			<div className="space-y-2">
				<Label htmlFor="department-selector">Department</Label>
				<LookupSelector
					lookupType="departments"
					value={selectedDepartment?.code}
					onValueChange={handleDepartmentChange}
					placeholder="Select Department..."
					className="w-full"
					// Disable while submitting
					disabled={isSubmitting}
				/>
				{departmentError && (
					<p className="text-sm font-medium text-destructive">{departmentError}</p>
				)}
			</div>

			{/* Roles Multi-Selector */}
			<div className="space-y-2">
				<Label htmlFor="roles-selector">Roles</Label>
				<MultiLookupSelector
					lookupType="roles"
					value={selectedRoles.map(role => role.code)}
					onValueChange={handleRolesChange}
					placeholder="Select Roles..."
					triggerClassName="w-full"
					contentClassName="w-[--radix-popover-trigger-width]"
					// Disable while submitting
					disabled={isSubmitting}
				/>
				{rolesError && (
					<p className="text-sm font-medium text-destructive">{rolesError}</p>
				)}
			</div>

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