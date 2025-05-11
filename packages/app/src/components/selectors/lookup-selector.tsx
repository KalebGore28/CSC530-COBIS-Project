import { useState, useEffect } from "react";

import { cn } from "@/lib/utils"; // Assuming shadcn's default utils setup
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"; // Adjust path if needed

// Define the structure of a lookup item
export interface LookupOption {
	code: string;
	description: string;
}

// Define the props for the component
interface LookupSelectorProps {
	lookupType: string; // e.g., 'departments', 'colleges'
	value?: string; // The currently selected code (controlled component)
	onValueChange: (selectedOption: LookupOption | null) => void; // Callback with the full object or null
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export function LookupSelector({
	lookupType,
	value,
	onValueChange,
	placeholder = "Select...", // Default placeholder
	className,
	disabled = false,
}: LookupSelectorProps) {
	const [options, setOptions] = useState<LookupOption[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Effect to fetch data when lookupType changes
	useEffect(() => {
		// Skip fetching if lookupType is not provided
		if (!lookupType) {
			setOptions([]);
			setError(null);
			return;
		}

		const fetchData = async () => {
			setIsLoading(true);
			setError(null);
			setOptions([]); // Clear previous options

			try {
				// Construct the API URL
				const apiUrl = `/api/lookup/${lookupType}`; // Use relative path assuming same origin, or provide full base URL if needed
				const response = await fetch(apiUrl);

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				const data: LookupOption[] = await response.json();

				// Basic validation of response structure
				if (Array.isArray(data) && data.every(item => 'code' in item && 'description' in item)) {
					setOptions(data);
				} else {
					throw new Error("Invalid data format received from API.");
				}

			} catch (err) {
				console.error(`Failed to fetch lookup [${lookupType}]:`, err);
				setError(err instanceof Error ? err.message : "An unknown error occurred.");
				setOptions([]); // Clear options on error
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [lookupType]); // Re-run effect if lookupType changes

	// Handle the change event from the underlying Select component
	const handleSelectChange = (selectedCode: string) => {
		// Find the full option object based on the selected code
		const selectedOption = options.find(option => option.code === selectedCode) || null;
		// Call the parent's callback function with the full object
		onValueChange(selectedOption);
	};

	// Find the description of the currently selected value for display
	const selectedOptionDescription = options.find(option => option.code === value)?.description;

	return (
		<Select
			value={value} // Controlled component: value is managed by parent
			onValueChange={handleSelectChange} // Notify parent on change
			disabled={isLoading || disabled} // Disable if loading or explicitly disabled
		>
			<SelectTrigger className={cn("w-[180px]", className)}>
				{/* Display selected description or placeholder */}
				<SelectValue placeholder={isLoading ? "Loading..." : error ? "Error" : placeholder}>
					{selectedOptionDescription}
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{/* Handle loading state */}
				{isLoading && <SelectItem value="loading" disabled>Loading...</SelectItem>}

				{/* Handle error state */}
				{error && <SelectItem value="error" disabled>Error: {error}</SelectItem>}

				{/* Handle no options state (after loading and no error) */}
				{!isLoading && !error && options.length === 0 && (
					<SelectItem value="no-options" disabled>No options available</SelectItem>
				)}

				{/* Render options */}
				{!isLoading && !error && options.length > 0 && options.map((option) => (
					<SelectItem key={option.code} value={option.code}>
						{option.code} - {option.description}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}