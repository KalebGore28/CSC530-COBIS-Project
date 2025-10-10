import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";

interface SearchInputProps<T> {
	searchApi: (query: string) => Promise<T[]>;
	onSelect: (item: T) => void;
	onRemove: (item: T) => void;
	selectedItems: T[];
	placeholder?: string;
	debounceTime?: number;
	renderResult: (item: T) => React.ReactNode;
	className?: string;
}

function SearchInput<T>({
	searchApi,
	onSelect,
	onRemove,
	selectedItems,
	placeholder = "Search...",
	debounceTime = 300,
	renderResult,
	className = "",
}: SearchInputProps<T>) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<T[]>([]);

	const fetchResults = useCallback(
		debounce((searchQuery: string) => {
			if (searchQuery.length < 2) {
				return;
			}
			searchApi(searchQuery)
				.then((data) => {
					setResults(data);
				})
				.catch((error) => {
					console.error('Search error:', error);
				});
		}, debounceTime),
		[searchApi, debounceTime]
	);

	useEffect(() => {
		if (query.length === 0) {
			setResults([]);
			return;
		}
		fetchResults(query);
	}, [query, fetchResults]);

	const handleSelect = (item: T) => {
		onSelect(item); // Call the parent's onSelect to add the item
		setQuery('');   // Clear the input
	};

	const handleRemove = (item: T) => {
		onRemove(item); // Call the parent's onRemove to remove the item
	};

	return (
		<Command className={`rounded-lg border shadow-md md:min-w-[450px] ${className}`}>
			<CommandInput
				placeholder={placeholder}
				onValueChange={(value) => setQuery(value)}
				value={query}
			/>
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup>
					{results.map((result, index) => (
						<CommandItem
							key={index}
							onSelect={() => handleSelect(result)}
						>
							{renderResult(result)}
						</CommandItem>
					))}
				</CommandGroup>
				{selectedItems.length > 0 && (
					<CommandGroup heading="Selected">
						{selectedItems.map((item, index) => (
							<CommandItem key={index} className="flex justify-between items-center">
								{renderResult(item)}
								<button
									onClick={() => handleRemove(item)}
									className="text-red-500 ml-2"
								>
									Remove
								</button>
							</CommandItem>
						))}
					</CommandGroup>
				)}
			</CommandList>
		</Command>
	);
}

export default SearchInput;