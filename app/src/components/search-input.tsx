import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"

interface SearchInputProps<T> {
	searchApi: (query: string) => Promise<T[]>;
	onSelect: (item: T) => void;
	placeholder?: string;
	debounceTime?: number;
	renderResult: (item: T) => React.ReactNode;
	className?: string;
}
function SearchInput<T>({
	searchApi,
	onSelect,
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

	// Fetch results when query changes
	useEffect(() => {
		if (query.length === 0) {
			setResults([]);
			return;
		}
		fetchResults(query);
	}, [query, fetchResults]); //fetchResults

	return (
		<Command className={`rounded-lg border shadow-md md:min-w-[450px] ${className}`}>
			<CommandInput placeholder={placeholder} onValueChange={(value) => setQuery(value)} value={query} />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup>
					{results.map((result, index) => (
						<CommandItem key={index} onSelect={() => {
							setQuery('');
							return onSelect(result)
						}}>
							{renderResult(result)}
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</Command>
	)
}

export default SearchInput;