import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV, formatRosterForExport } from "@/utils/csv-export";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

interface ExportButtonProps {
	data: any[];
	filename?: string;
	isActiveTerm?: boolean;
}

/**
 * Export button with dropdown options for CSV and PDF
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
	data,
	filename = 'class-roster',
	isActiveTerm = true
}) => {
	const handleCSVExport = () => {
		try {
			if (!data?.length) {
				toast.error("No data available to export");
				return;
			}

			const formattedData = formatRosterForExport(data, isActiveTerm);
			exportToCSV(formattedData, { filename });
			toast.success("Data has been exported as CSV");
		} catch (error) {
			console.error("Export error:", error);
			toast.error("Failed to export data");
		}
	};

	const handlePDFExport = () => {
		toast.success("PDF export coming soon");
	};

	return (
		<div className="relative">
			<Toaster />
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline">
						<Download className="mr-2 h-4 w-4" />
						Export
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={handleCSVExport}>
						Export as CSV
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handlePDFExport}>
						Export as PDF
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default ExportButton;