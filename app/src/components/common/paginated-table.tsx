import React, { useState } from "react";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table"; // Adjust import based on your setup
import { Button } from "@/components/ui/button"; // ShadCN button for pagination

interface PaginatedTableProps {
	data: any[]; // Array of data to display
	columns: { key: string; label: string }[]; // Define columns dynamically
	rowsPerPage?: number; // Max rows per page
}

export const PaginatedTable: React.FC<PaginatedTableProps> = ({
	data,
	columns,
	rowsPerPage = 10, // Default to 10 rows per page
	...props
}) => {
	const [currentPage, setCurrentPage] = useState(1);
	const totalPages = Math.ceil(data.length / rowsPerPage);

	// Slice data based on current page
	const currentData = data.slice(
		(currentPage - 1) * rowsPerPage,
		currentPage * rowsPerPage
	);

	return (
		<div className="space-y-4">
			<Table {...props}>
				<TableHeader>
					<TableRow>
						{columns.map((column) => (
							<TableHead key={column.key}>{column.label}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{currentData.map((row, index) => (
						<TableRow key={index}>
							{columns.map((column) => (
								<TableCell key={column.key}>{row[column.key]}</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Pagination Controls */}
			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
					disabled={currentPage === 1}
				>
					← Previous
				</Button>
				{Array.from({ length: totalPages }, (_, i) => (
					<Button
						key={i}
						variant={currentPage === i + 1 ? "default" : "outline"}
						onClick={() => setCurrentPage(i + 1)}
					>
						{i + 1}
					</Button>
				))}
				<Button
					variant="outline"
					onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
					disabled={currentPage === totalPages}
				>
					Next →
				</Button>
			</div>
		</div>
	);
};
