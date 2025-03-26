import { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import debounce from 'lodash.debounce';

interface SearchInputProps<T> {
	searchApi: (query: string) => Promise<T[]>;
	onSelect: (item: T) => void;
	placeholder?: string;
	debounceTime?: number;
	renderResult: (item: T) => React.ReactNode; // Added renderResult prop
}

export default function SearchInput<T>({
	searchApi,
	onSelect,
	placeholder = "Search...",
	debounceTime = 300,
	renderResult, // Destructure the new prop
}: SearchInputProps<T>) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<T[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	// Debounced search function to limit API calls
	const debouncedSearch = useCallback(
		debounce((searchQuery: string) => {
			if (searchQuery.length < 2) {
				setResults([]);
				setIsLoading(false);
				return;
			}
			setIsLoading(true);
			searchApi(searchQuery)
				.then((data) => {
					setResults(data);
					setIsLoading(false);
				})
				.catch((error) => {
					console.error('Search error:', error);
					setResults([]);
					setIsLoading(false);
				});
		}, debounceTime),
		[searchApi, debounceTime]
	);

	// Trigger search when query changes
	useEffect(() => {
		if (query.length >= 2) {
			debouncedSearch(query);
		} else {
			setResults([]);
			setIsLoading(false);
		}
	}, [query, debouncedSearch]);

	// Handle input changes
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
		setIsOpen(true);
	};

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Input
					type="text"
					placeholder={placeholder}
					value={query}
					onChange={handleInputChange}
					onFocus={() => setIsOpen(true)}
				/>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					{isLoading ? (
						<CommandGroup>
							<CommandItem disabled>Loading...</CommandItem>
						</CommandGroup>
					) : results.length > 0 ? (
						<CommandGroup>
							{results.map((result, index) => (
								<CommandItem
									key={index}
									onSelect={() => {
										onSelect(result);
										setIsOpen(false);
										setQuery(''); // Optional: Clear input after selection
									}}
								>
									{renderResult(result)} {/* Use the renderResult function */}
								</CommandItem>
							))}
						</CommandGroup>
					) : query.length >= 2 ? (
						<CommandGroup>
							<CommandItem disabled>No results found.</CommandItem>
						</CommandGroup>
					) : null}
				</Command>
			</PopoverContent>
		</Popover>
	);
}