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

export type Column<T> = {
	[K in keyof T]: {
		key: K;
		label: string;
		transform?: (value: T[K], row: T) => string | number;
	}
}[keyof T];

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
