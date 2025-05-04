import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCSV } from "@/utils/csv-export";
import { toast } from "sonner";

interface ExportButtonProps {
	data: any[];
	filename?: string;
	preHeader?: string[];   // each entry is one CSV line

}

/**
 * Export button with dropdown options for CSV and PDF
 */
export const ExportButton: React.FC<ExportButtonProps> = ({
	data,
	filename = 'unknown',
	preHeader = [],
}) => {
	console.log("ExportButton data:", data);
	const handleCSVExport = () => {
		try {
			if (!data?.length) {
				toast.error("No data available to export");
				return;
			}
			exportToCSV(data, { filename, preHeader });
			toast.success("Data has been exported as CSV");
		} catch (error) {
			console.error("Export error:", error);
			toast.error("Failed to export data");
		}
	};

	return (
		<div className="relative">
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
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default ExportButton;