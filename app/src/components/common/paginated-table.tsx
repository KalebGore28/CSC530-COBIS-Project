import React, { useState, useMemo, useCallback } from 'react';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const DOTS = '...';

function range(start: number, end: number): number[] {
	return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getPaginationItems(
	currentPage: number,
	totalPages: number,
	siblingCount: number
): (number | string)[] {
	const totalPageNumbers = siblingCount * 2 + 5;
	if (totalPages <= totalPageNumbers) {
		return range(1, totalPages);
	}

	const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
	const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
	const shouldShowLeftDots = leftSiblingIndex > 2;
	const shouldShowRightDots = rightSiblingIndex < totalPages - 2;
	const firstPageIndex = 1;
	const lastPageIndex = totalPages;

	if (!shouldShowLeftDots && shouldShowRightDots) {
		const leftItemCount = 3 + 2 * siblingCount;
		return [...range(1, leftItemCount), DOTS, totalPages];
	}

	if (shouldShowLeftDots && !shouldShowRightDots) {
		const itemCount = 3 + 2 * siblingCount;
		return [firstPageIndex, DOTS, ...range(lastPageIndex - itemCount + 1, lastPageIndex)];
	}

	if (shouldShowLeftDots && shouldShowRightDots) {
		return [
			firstPageIndex,
			DOTS,
			...range(leftSiblingIndex, rightSiblingIndex),
			DOTS,
			lastPageIndex,
		];
	}

	return range(1, totalPages);
}

interface Column {
	key: string;
	label: string;
}

interface PaginatedTableProps<T> {
	data: T[];
	columns: Column[];
	rowsPerPage?: number;
	onRowClick?: (row: T) => void;
	isLoading?: boolean;
	className?: string;
	[key: string]: any;
}

export function PaginatedTable<T>({
	data,
	columns,
	rowsPerPage = 10,
	onRowClick,
	isLoading = false,
	className,
	...tableProps
}: PaginatedTableProps<T>) {
	const [currentPage, setCurrentPage] = useState(1);
	const totalPages = Math.ceil(data.length / rowsPerPage);
	const siblingCount = 1;

	const currentData = useMemo(() => {
		const start = (currentPage - 1) * rowsPerPage;
		return data.slice(start, start + rowsPerPage);
	}, [data, currentPage, rowsPerPage]);

	const paginationItems = useMemo(
		() => getPaginationItems(currentPage, totalPages, siblingCount),
		[currentPage, totalPages, siblingCount]
	);

	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
	}, []);

	const handlePrevious = useCallback(() => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	}, []);

	const handleNext = useCallback(() => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	}, [totalPages]);

	return (
		<div className="space-y-4">
			{data.length > 0 && !isLoading && (
				<div className="text-sm text-muted-foreground">
					Showing{' '}
					<strong>{Math.min((currentPage - 1) * rowsPerPage + 1, data.length)}</strong>-
					<strong>{Math.min(currentPage * rowsPerPage, data.length)}</strong> of{' '}
					<strong>{data.length}</strong> rows
				</div>
			)}

			<Table className={className} {...tableProps}>
				<TableHeader>
					<TableRow>
						{columns.map((col) => (
							<TableHead key={col.key}>{col.label}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{isLoading
						? Array.from({ length: rowsPerPage }).map((_, i) => (
							<TableRow key={`skeleton-${i}`}>
								{columns.map((col) => (
									<TableCell key={col.key}>
										<Skeleton className="h-4 w-full" />
									</TableCell>
								))}
							</TableRow>
						))
						: currentData.length > 0
							? currentData.map((row, rowIndex) => (
								<TableRow
									key={rowIndex}
									onClick={onRowClick ? () => onRowClick(row) : undefined}
									className={onRowClick ? 'cursor-pointer hover:bg-gray-100' : undefined}
								>
									{columns.map((col) => (
										<TableCell key={col.key}>{(row as any)[col.key]}</TableCell>
									))}
								</TableRow>
							))
							: (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										No results found.
									</TableCell>
								</TableRow>
							)}
				</TableBody>
			</Table>

			{!isLoading && totalPages > 1 && (
				<div className="flex justify-end items-center gap-2">
					<Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentPage === 1}>
						← Previous
					</Button>
					{paginationItems.map((item, idx) =>
						item === DOTS ? (
							<span key={`dots-${idx}`} className="px-2 py-1 text-muted-foreground">
								{DOTS}
							</span>
						) : (
							<Button
								key={`page-${item}-${idx}`}
								variant={item === currentPage ? 'default' : 'outline'}
								size="sm"
								onClick={() => handlePageChange(item as number)}
							>
								{item}
							</Button>
						)
					)}
					<Button variant="outline" size="sm" onClick={handleNext} disabled={currentPage === totalPages}>
						Next →
					</Button>
				</div>
			)}
		</div>
	);
}
