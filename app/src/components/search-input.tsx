import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface SearchBoxProps<T> {
	searchFunction: (query: string) => Promise<T[]>;
	renderResult: (result: T) => React.ReactNode;
	placeholder?: string;
	debounceTime?: number;
}

export default function SearchBox<T>({
	searchFunction,
	renderResult,
	placeholder = "Search...",
	debounceTime = 300,
}: SearchBoxProps<T>) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<T[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const handler = setTimeout(() => {
			if (query.trim()) {
				setIsLoading(true);
				searchFunction(query)
					.then(setResults)
					.finally(() => setIsLoading(false));
			} else {
				setResults([]);
			}
		}, debounceTime);

		return () => clearTimeout(handler);
	}, [query, searchFunction, debounceTime]);

	return (
		<div className="w-full max-w-md mx-auto relative">
			<Input
				type="text"
				placeholder={placeholder}
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				className="w-full"
			/>
			{isLoading && <div className="text-gray-500 text-sm">Loading...</div>}
			{results.length > 0 && (
				<Card className="absolute w-full mt-2 z-10">
					<CardContent>
						{results.map((result, index) => (
							<div key={index}>{renderResult(result)}</div>
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
