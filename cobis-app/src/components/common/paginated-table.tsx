import { useState, useCallback } from 'react';
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

export type Column<T> = {
	[K in keyof T]: {
		key: K;
		label: string;
		transform?: (value: T[K], row: T) => string | number;
	}
}[keyof T];

interface PaginatedTableSkeletonProps {
	columns: { key: string; label: string }[];
	rowCount?: number;
	className?: string;
}

export const PaginatedTableSkeleton: React.FC<PaginatedTableSkeletonProps> = ({
	columns,
	rowCount = 5,
	className = '',
}) => {
	return (
		<div className="space-y-4">
			{/* Info bar skeleton */}
			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<Skeleton className="h-4 w-32" />
			</div>

			{/* Table skeleton */}
			<Table className={className}>
				<TableHeader>
					<TableRow>
						{columns.map((col) => (
							<TableHead key={col.key}>
								<Skeleton className="h-4 w-24" />
							</TableHead>
						))}
					</TableRow>
				</TableHeader>

				<TableBody>
					{Array.from({ length: rowCount }).map((_, rowIndex) => (
						<TableRow key={rowIndex}>
							{columns.map((col) => (
								<TableCell key={col.key} className="truncate max-w-[120px]">
									<Skeleton className="h-5 w-full" />
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Pagination controls skeleton */}
			<div className="flex justify-end items-center gap-2">
				<Skeleton className="h-8 w-20" />
				<Skeleton className="h-8 w-20" />
			</div>
		</div>
	);
};

interface PaginatedTableProps<T> {
	data: T[];
	columns: Column<T>[];
	rowsPerPage?: number;
	totalRows?: number;
	onRowClick?: (row: T) => void;
	handlePreviousCallback?: () => void;
	handleNextCallback?: () => void;
	className?: string;
}


export function PaginatedTable<T>({
	data,
	columns,
	rowsPerPage = 10,
	totalRows,
	onRowClick,
	handlePreviousCallback,
	handleNextCallback,
	className,
}: PaginatedTableProps<T>) {
	const [currentPage, setCurrentPage] = useState(1);
	const effectiveTotal = totalRows ?? data.length;

	const totalPages = Math.ceil(effectiveTotal / rowsPerPage);

	const handlePrevious = useCallback(() => {
		if (currentPage > 1) {
			setCurrentPage((p) => p - 1);
			handlePreviousCallback?.();
		}
	}, [currentPage, handlePreviousCallback]);

	const handleNext = useCallback(() => {
		if (currentPage < totalPages) {
			setCurrentPage((p) => p + 1);
			handleNextCallback?.();
		}
	}, [currentPage, totalPages, handleNextCallback]);

	const startCount = (currentPage - 1) * rowsPerPage + 1;
	const endCount = Math.min(currentPage * rowsPerPage, effectiveTotal);

	return (
		<div className="space-y-4">
			{effectiveTotal > 0 && (
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<div>
						Showing{' '}
						<strong>{startCount}</strong> to{' '}
						<strong>{endCount}</strong> of{' '}
						<strong>{effectiveTotal}</strong> rows
					</div>
				</div>
			)}

			<Table className={className}>
				<TableHeader>
					<TableRow>
						{columns.map((col) => (
							<TableHead key={String(col.key)}>{col.label}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.length > 0 ? (
						data.map((row, rowIndex) => (
							<TableRow
								key={rowIndex}
								onClick={onRowClick ? () => onRowClick(row) : undefined}
								className={onRowClick ? 'cursor-pointer hover:bg-gray-100' : undefined}
							>
								{columns.map((col) => {
									const cellValue = row[col.key];
									const display = col.transform
										? col.transform(cellValue, row)
										: String(cellValue);
									return (
										<TableCell
											key={String(col.key)}
											className="truncate max-w-[120px]"
										>
											{display}
										</TableCell>
									);
								})}
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

			<div className="flex justify-end items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={handlePrevious}
					disabled={currentPage === 1}
					className={currentPage === 1 ? 'hidden' : ''}
				>
					← Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={handleNext}
					disabled={currentPage === totalPages}
					className={currentPage === totalPages ? 'hidden' : ''}
				>
					Next →
				</Button>
			</div>
		</div>
	);
}
