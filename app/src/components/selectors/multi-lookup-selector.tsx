import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";


// Define the structure of a lookup item (code can be string or number)
interface LookupOption {
	code: string | number;
	description: string;
}

// Define the props for the component
interface MultiLookupSelectorProps {
	lookupType: string;
	value?: (string | number)[]; // Array of selected codes
	onValueChange: (selectedOptions: LookupOption[]) => void; // Callback with array of selected objects
	placeholder?: string;
	triggerClassName?: string; // ClassName for the trigger button
	contentClassName?: string; // ClassName for the popover content
	maxDisplay?: number; // Max number of badges to show before showing count
}

export function MultiLookupSelector({
	lookupType,
	value = [], // Default to empty array
	onValueChange,
	placeholder = "Select...",
	triggerClassName,
	contentClassName,
	maxDisplay = 2, // Default max badges to show
}: MultiLookupSelectorProps) {
	const [options, setOptions] = useState<LookupOption[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState(""); // To control input if needed

	// Memoize selected options based on the value prop
	const selectedOptionsMap = useMemo(() => {
		const map = new Map<string | number, LookupOption>();
		options.forEach(option => {
			if (value.includes(option.code)) {
				map.set(option.code, option);
			}
		});
		return map;
	}, [value, options]);


	// Effect to fetch data when lookupType changes
	useEffect(() => {
		if (!lookupType) {
			setOptions([]);
			setError(null);
			return;
		}

		const fetchData = async () => {
			setIsLoading(true);
			setError(null);
			setOptions([]);

			try {
				const apiUrl = `/api/lookup/${lookupType}`;
				const response = await fetch(apiUrl);

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				const data: LookupOption[] = await response.json();

				if (Array.isArray(data) && data.every(item => 'code' in item && 'description' in item)) {
					// Ensure codes are consistently string or number based on API response if possible, or handle mixed types
					setOptions(data);
				} else {
					throw new Error("Invalid data format received from API.");
				}
			} catch (err) {
				console.error(`Failed to fetch lookup [${lookupType}]:`, err);
				setError(err instanceof Error ? err.message : "An unknown error occurred.");
				setOptions([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [lookupType]); // Re-run effect if lookupType changes

	// Handle selection toggle
	const handleSelectToggle = (option: LookupOption) => {
		const currentSelectedCodes = new Set(value); // Use Set for efficient add/delete
		let newSelectedOptionsArray: LookupOption[] = [];

		if (currentSelectedCodes.has(option.code)) {
			currentSelectedCodes.delete(option.code);
		} else {
			currentSelectedCodes.add(option.code);
		}

		const newSelectedCodesArray = Array.from(currentSelectedCodes);

		// Rebuild the array of full selected objects based on the new codes
		// Ensure the order matches options or maintain insertion order if important
		const selectedObjectsMap = new Map<string | number, LookupOption>();
		options.forEach(opt => {
			if (newSelectedCodesArray.includes(opt.code)) {
				selectedObjectsMap.set(opt.code, opt);
			}
		});
		// Maintain the order based on the new code array
		newSelectedOptionsArray = newSelectedCodesArray.map(code => selectedObjectsMap.get(code)!);


		onValueChange(newSelectedOptionsArray); // Callback with the array of selected *objects*
	};

	// Determine text/badges for the trigger button
	const renderTriggerContent = () => {
		if (isLoading) return "Loading...";
		if (error) return "Error loading data";
		if (selectedOptionsMap.size === 0) return placeholder;

		const selectedDescriptions = Array.from(selectedOptionsMap.values());

		if (selectedOptionsMap.size <= maxDisplay) {
			return (
				<div className="flex flex-wrap gap-1">
					{selectedDescriptions.map((option) => (
						<Badge key={option.code} variant="secondary" className="font-normal">
							{option.description}
						</Badge>
					))}
				</div>
			);
		} else {
			return (
				<Badge variant="secondary" className="font-normal">
					{selectedOptionsMap.size} selected
				</Badge>
			);
		}
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={isOpen}
					className={cn("w-[200px] justify-between", triggerClassName)} // Adjust default width
					disabled={isLoading || !!error}
				>
					<div className="truncate pr-2">
						{renderTriggerContent()}
					</div>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className={cn("w-[200px] p-0", contentClassName)} align="start">
				<Command shouldFilter={true}> {/* Let Command handle filtering */}
					<CommandInput
						placeholder={`Search ${lookupType}...`}
						value={searchTerm}
						onValueChange={setSearchTerm}
					/>
					<CommandList>
						<ScrollArea className="max-h-[200px]"> {/* Limit height */}
							<CommandEmpty>
								{isLoading ? "Loading..." : error ? "Error loading." : "No results found."}
							</CommandEmpty>
							<CommandGroup>
								{!isLoading && !error && options.map((option) => {
									const isSelected = selectedOptionsMap.has(option.code);
									return (
										<CommandItem
											key={option.code}
											value={`${option.description} ${option.code}`} // Value for Command's internal filtering/search
											onSelect={() => {
												handleSelectToggle(option);
												// Keep popover open for multi-select
											}}
											className="flex items-center justify-between cursor-pointer"
										>
											<span>{option.description}</span>
											<div
												className={cn(
													"mr-2 h-4 w-4 rounded-sm border border-primary flex items-center justify-center",
													isSelected
														? "bg-primary text-primary-foreground"
														: "opacity-50 [&_svg]:invisible"
												)}
											>
												<Check className={cn("h-4 w-4")} />
											</div>
											{/* Alternative using Checkbox component:
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleSelectToggle(option)}
                            className="ml-auto"
                            aria-label={`Select ${option.description}`}
                        /> */}
										</CommandItem>
									);
								})}
							</CommandGroup>
						</ScrollArea>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}