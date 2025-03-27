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
	const [selectedItems, setSelectedItems] = useState<T[]>([]);

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
		setSelectedItems((prevItems) => {
			const updatedItems = [...prevItems, item];
			return updatedItems;
		});
		onSelect(item);
	};

	const handleRemove = (item: T) => {
		setSelectedItems((prevItems) => prevItems.filter((i) => i !== item));
	};

	return (
		<Command className={`rounded-lg border shadow-md md:min-w-[450px] ${className}`}>
			<CommandInput placeholder={placeholder} onValueChange={(value) => setQuery(value)} value={query} />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup>
					{results.map((result, index) => (
						<CommandItem
							key={index}
							onSelect={() => {
								handleSelect(result);
								setQuery('');
							}}
						>
							{renderResult(result)}
						</CommandItem>
					))}
				</CommandGroup>
				{selectedItems.length > 0 && (
					<CommandGroup heading="Selected">
						{selectedItems.map((item, index) => (
							<CommandItem key={index} className='flex justify-between items-center'>
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