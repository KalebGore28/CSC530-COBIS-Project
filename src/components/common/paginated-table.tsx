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
	key: keyof T;
	label: string;
	transform?: (value: T[keyof T], row: T) => string | number;
};

interface PaginatedTableProps<T> {
	data: T[];
	columns: Column<T>[];
	rowsPerPage: number;
	totalRows: number;
	currentPage: number;
	onPageChange: (page: number) => void;
	onRowClick?: (row: T) => void;
	className?: string;
}

export function PaginatedTableSkeleton({ columns, rowCount, className }: {
	columns: { key: string; label: string }[];
	rowCount: number;
	className?: string;
}) {
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

export function PaginatedTable<T>({
	data,
	columns,
	rowsPerPage,
	totalRows,
	currentPage,
	onPageChange,
	onRowClick,
	className,
}: PaginatedTableProps<T>) {
	const totalPages = Math.ceil(totalRows / rowsPerPage);
	const startCount = (currentPage - 1) * rowsPerPage + 1;
	const endCount = Math.min(currentPage * rowsPerPage, totalRows);

	return (
		<div className="space-y-4">
			{totalRows > 0 && (
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<div>
						Showing <strong>{startCount}</strong> to <strong>{endCount}</strong> of{" "}
						<strong>{totalRows}</strong> rows
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
								className={onRowClick ? "cursor-pointer hover:bg-gray-100" : undefined}
							>
								{columns.map((col) => {
									const val = row[col.key];
									return (
										<TableCell key={String(col.key)} className="truncate max-w-[120px]">
											{col.transform ? col.transform(val, row) : String(val)}
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

			{/* Pagination */}
			<div className="flex justify-end items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage - 1)}
					disabled={currentPage === 1}
				>
					← Previous
				</Button>
				<span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange(currentPage + 1)}
					disabled={currentPage === totalPages}
				>
					Next →
				</Button>
			</div>
		</div>
	);
}