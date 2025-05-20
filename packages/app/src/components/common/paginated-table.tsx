import { useState, useMemo, useCallback } from 'react';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ExportButton } from '@/components/common/export-button';

/**
 * Column definition for PaginatedTable.
 * Generates a distinct type for each keyof T, so transform gets the correct value type.
 */
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
	onRowClick?: (row: T) => void;
	className?: string;
	fileName?: string;
	preHeader?: string[];
	[key: string]: any;
}

export function PaginatedTable<T>({
	data,
	columns,
	rowsPerPage = 10,
	onRowClick,
	className,
	fileName = 'export',
	preHeader = [],
	...tableProps
}: PaginatedTableProps<T>) {
	const [currentPage, setCurrentPage] = useState(1);
	const totalPages = Math.ceil(data.length / rowsPerPage);

	const currentData = useMemo(() => {
		const start = (currentPage - 1) * rowsPerPage;
		return data.slice(start, start + rowsPerPage);
	}, [data, currentPage, rowsPerPage]);


	const handlePrevious = useCallback(() => {
		setCurrentPage((prev) => Math.max(prev - 1, 1));
	}, []);

	const handleNext = useCallback(() => {
		setCurrentPage((prev) => Math.min(prev + 1, totalPages));
	}, [totalPages]);

	return (
		<div className="space-y-4">
			{data.length > 0 && (
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<div>
						Showing{' '}
						<strong>{Math.min((currentPage - 1) * rowsPerPage + 1, data.length)}</strong>-
						<strong>{Math.min(currentPage * rowsPerPage, data.length)}</strong> of{' '}
						<strong>{data.length}</strong> rows
					</div>
					<ExportButton data={data} filename={fileName} preHeader={preHeader} />
				</div>
			)}

			{/* Table */}

			<Table className={className} {...tableProps}>
				<TableHeader>
					<TableRow>
						{columns.map((col) => (
							<TableHead key={String(col.key)}>{col.label}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{currentData.length > 0
						? currentData.map((row, rowIndex) => (
							<TableRow
								key={rowIndex}
								onClick={onRowClick ? () => onRowClick(row) : undefined}
								className={onRowClick ? 'cursor-pointer hover:bg-gray-100' : undefined}
							>
								{columns.map((col) => {
									const cellValue = row[col.key];
									// Ensure display value is always a renderable type (string or number)
									const display = col.transform ? col.transform(cellValue, row) : String(cellValue);
									return (
										<TableCell key={String(col.key)} className="truncate max-w-[120px]">
											{display}
										</TableCell>
									);
								})}
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

			{totalPages > 1 && (
				<div className="flex justify-end items-center gap-2">
					<Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentPage === 1} className={currentPage === 1 ? 'hidden' : ''}>
						← Previous
					</Button>
					<Button variant="outline" size="sm" onClick={handleNext} disabled={currentPage === totalPages} className={currentPage === totalPages ? 'hidden' : ''}>
						Next →
					</Button>
				</div>
			)}
		</div>
	);
}
