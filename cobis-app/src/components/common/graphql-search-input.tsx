import React, { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface HasCodeDesc {
	code: string;
	description: string;
}

// 2) Constrain your props
interface GraphQLSearchInputProps<T extends HasCodeDesc> {
	searchFn: (query: string) => Promise<T[]>;
	selectedItems: T[];
	onSelect: (item: T) => void;
	onRemove: (item: T) => void;
	renderResult: (item: T) => React.ReactNode;
	placeholder?: string;
	debounceTime?: number;
	className?: string;
}

export const GraphQLSearchInput = <T extends HasCodeDesc>({
	searchFn,
	selectedItems,
	onSelect,
	onRemove,
	renderResult,
	placeholder = "Search...",
	debounceTime = 300,
	className = "",
}: GraphQLSearchInputProps<T>) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<T[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchResults = useCallback(
		debounce(async (q: string) => {
			if (q.length < 2) return;
			setLoading(true);
			try {
				const data = await searchFn(q);
				setResults(data);
			} catch (err) {
				console.error("Search error:", err);
			} finally {
				setLoading(false);
			}
		}, debounceTime),
		[searchFn, debounceTime]
	);

	useEffect(() => {
		if (!query) {
			setResults([]);
			setLoading(false);
		} else {
			fetchResults(query);
		}
	}, [query, fetchResults]);

	return (
		<Command className={`h-auto rounded-lg border shadow-md md:min-w-[450px] ${className}`}>
			<CommandInput
				placeholder={placeholder}
				value={query}
				onValueChange={q => setQuery(q)}
			/>
			<CommandList>
				{loading && (
					<CommandGroup>
						{[...Array(3)].map((_, i) => (
							<CommandItem key={i} className="!pointer-events-none">
								<Skeleton className="h-4 w-full" />
							</CommandItem>
						))}
					</CommandGroup>
				)}
				{!loading && results.length === 0 && query.length >= 2 && (
					<CommandEmpty>No results found.</CommandEmpty>
				)}
				{!loading && results.length > 0 && (
					<CommandGroup>
						{results.map((r, i) => (
							<CommandItem
								key={i}
								value={`${r.code} ${r.description}`}
								className="flex flex-col"
								onSelect={() => {
									onSelect(r);
									setQuery("");
								}}
							>
								{renderResult(r)}
							</CommandItem>
						))}
					</CommandGroup>
				)}

				{selectedItems.length > 0 && (
					<CommandGroup heading="Selected">
						{selectedItems.map((r, i) => (
							<CommandItem
								key={i}
								className="flex items-center w-full"
							>
								<div className="flex-1 min-w-0">
									<div className="truncate">
										{renderResult(r)}
									</div>
								</div>
								<button
									onClick={() => onRemove(r)}
									className="text-red-500 ml-2 flex-shrink-0"
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
};

// Helpers

export function renderProgram(program: Program) {
	return (
		<div className="flex flex-wrap items-center justify-start space-x-2 w-full gap-2">
			<span className="flex-shrink-0 font-medium">
				{program.code} — {program.description}
			</span>
			<div className="space-x-2">
				{program.is_major && (
					<Badge
						variant="outline"
						className="text-green-800 border-green-800 bg-green-100 dark:text-green-100 dark:bg-green-900"
					>
						Major
					</Badge>
				)}
				{program.is_minor && (
					<Badge
						variant="outline"
						className="text-blue-800 border-blue-800 bg-blue-100 dark:text-blue-100 dark:bg-blue-900"
					>
						Minor
					</Badge>
				)}
				{program.has_concentration && (
					<Badge
						variant="outline"
						className="text-purple-800 border-purple-800 bg-purple-100 dark:text-purple-100 dark:bg-purple-900"
					>
						Concentration
					</Badge>
				)}
				{program.is_discontinued && (
					<Badge
						variant="outline"
						className="text-red-800 border-red-800 bg-red-100 dark:text-red-100 dark:bg-red-900"
					>
						Discontinued
					</Badge>
				)}
				{program.is_aacsb && (
					<Badge
						variant="outline"
						className="text-amber-800 border-amber-800 bg-amber-100 dark:text-amber-100 dark:bg-amber-900"
					>
						AACSB
					</Badge>
				)}
			</div>
		</div>
	);
}

export const renderCourse = (course: Course) => (
	<div className="flex items-center justify-start space-x-2 w-full">
		<span className="flex-shrink-0 font-medium">
			{course.subject} {course.number}{course.suffix} — {course.title}
		</span>
	</div>
);