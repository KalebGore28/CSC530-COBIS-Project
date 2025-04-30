import React, { useState, useMemo } from "react";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table"; // Adjust import based on your setup
import { Button } from "@/components/ui/button";

// Define DOTS constant locally or import if preferred
const DOTS = '...';

// Helper function to generate a range of numbers (can be inside or outside component)
const range = (start: number, end: number): number[] => {
	let length = end - start + 1;
	return Array.from({ length }, (_, idx) => idx + start);
};


interface PaginatedTableProps {
	data: any[];
	columns: { key: string; label: string }[];
	rowsPerPage?: number;
	onRowClick?: (rowData: any) => void; // Optional callback function for row click
	[key: string]: any; // Allow other props
}

export const PaginatedTable: React.FC<PaginatedTableProps> = ({
	data,
	columns,
	rowsPerPage = 10,
	onRowClick, // Destructure the new prop
	...props

}) => {
	const [currentPage, setCurrentPage] = useState(1);
	const totalPages = Math.ceil(data.length / rowsPerPage);
	const siblingCount = 1; // How many pages neighbours to show on each side

	// --- Memoized Data Calculation (Kept from previous suggestion for performance) ---
	const currentData = useMemo(() => {
		const firstPageIndex = (currentPage - 1) * rowsPerPage;
		const lastPageIndex = firstPageIndex + rowsPerPage;
		return data.slice(firstPageIndex, lastPageIndex);
	}, [data, currentPage, rowsPerPage]);

	// --- NEW: Pagination Items Calculation Logic (Inside Component) ---
	const paginationItems: (string | number)[] = useMemo(() => {
		if (totalPages <= 1) return []; // No items if only one page or less

		const totalPageNumbers = siblingCount + 5; // Minimum items: 1st + Last + Current + Siblings*2 + Dots*2 (can be simplified)

		// Case 1: Show all pages if total is less than calculation threshold
		if (totalPageNumbers >= totalPages) {
			return range(1, totalPages);
		}

		// Calculate siblings and check if dots are needed
		const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
		const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
		const shouldShowLeftDots = leftSiblingIndex > 2;
		const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

		const firstPageIndex = 1;
		const lastPageIndex = totalPages;

		// Case 2: No left dots, right dots needed
		if (!shouldShowLeftDots && shouldShowRightDots) {
			let leftItemCount = 3 + 2 * siblingCount;
			let leftRange = range(1, leftItemCount);
			return [...leftRange, DOTS, lastPageIndex];
		}

		// Case 3: Left dots needed, no right dots
		if (shouldShowLeftDots && !shouldShowRightDots) {
			let rightItemCount = 3 + 2 * siblingCount;
			let rightRange = range(totalPages - rightItemCount + 1, totalPages);
			return [firstPageIndex, DOTS, ...rightRange];
		}

		// Case 4: Both dots needed
		if (shouldShowLeftDots && shouldShowRightDots) {
			let middleRange = range(leftSiblingIndex, rightSiblingIndex);
			return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
		}

		// Fallback (should generally not be reached with the logic above)
		return range(1, totalPages);

	}, [currentPage, totalPages, siblingCount]); // Dependencies for recalculation


	// --- Event Handlers (Unchanged) ---
	const onPageChange = (pageNumber: number | string) => {
		if (typeof pageNumber === 'number') {
			setCurrentPage(pageNumber);
		}
	};
	const onNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
	const onPrevious = () => setCurrentPage(prev => Math.max(prev - 1, 1));
	const isLastPage = currentPage === totalPages;

	// --- Component Rendering ---
	return (
		<div className="space-y-4">
			{/* Row Count Display (Optional but helpful) */}
			{data.length > 0 && (
				<div className="text-sm text-muted-foreground">
					Showing{' '}
					<strong>
						{Math.min((currentPage - 1) * rowsPerPage + 1, data.length)}
						-
						{Math.min(currentPage * rowsPerPage, data.length)}
					</strong>{' '}
					of <strong>{data.length}</strong> rows
				</div>
			)}

			{/* Table Rendering (Unchanged) */}
			<Table {...props}>
				<TableHeader>
					<TableRow>
						{columns.map((column) => (
							<TableHead key={column.key}>{column.label}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{currentData.length > 0 ? (
						currentData.map((row, index) => (

							<TableRow key={`${row[columns[0]?.key] ?? index}-${index}`}
								onClick={() => onRowClick?.(row)} // Call callback if it exists
								className="cursor-pointer hover:bg-gray-100"
							>
								{columns.map((column) => (
									<TableCell key={column.key}>{row[column.key]}</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length} className="h-24 text-center">
								No results found.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			{/* --- Updated Pagination Controls --- */}
			{/* Only show controls if there's more than one page */}
			{totalPages > 1 && (
				<div className="flex justify-end items-center gap-2">
					{/* Previous Button */}
					<Button
						variant="outline"
						size="sm"
						onClick={onPrevious}
						disabled={currentPage === 1}
					>
						← Previous
					</Button>

					{/* Page Number Buttons and Ellipses - Uses the calculated 'paginationItems' */}
					{paginationItems.map((item, index) => {
						if (item === DOTS) {
							// Render ellipsis as non-interactive text
							return <span key={`dots-${index}`} className="px-2 py-1 text-muted-foreground">...</span>;
						}

						// Render a page number button
						return (
							<Button
								key={item}
								variant={item === currentPage ? "default" : "outline"}
								size="sm"
								onClick={() => onPageChange(item)}
							>
								{item}
							</Button>
						);
					})}

					{/* Next Button */}
					<Button
						variant="outline"
						size="sm"
						onClick={onNext}
						disabled={isLastPage}
					>
						Next →
					</Button>
				</div>
			)}
		</div>
	);
};