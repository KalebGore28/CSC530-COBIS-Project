import React, { useState } from "react";
import { Download, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { exportToCSV, formatRosterForExport } from "@/utils/csv-export";

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
	const [notification, setNotification] = useState<{
		show: boolean;
		type: 'success' | 'error';
		message: string;
	} | null>(null);

	const handleCSVExport = () => {
		try {
			if (!data || data.length === 0) {
				setNotification({
					show: true,
					type: 'error',
					message: "No data available to export"
				});

				// Clear notification after a delay
				setTimeout(() => setNotification(null), 3000);
				return;
			}

			const formattedData = formatRosterForExport(data, isActiveTerm);
			exportToCSV(formattedData, {
				filename: filename
			});

			setNotification({
				show: true,
				type: 'success',
				message: "Data has been exported as CSV"
			});

			// Clear notification after a delay
			setTimeout(() => setNotification(null), 3000);
		} catch (error) {
			console.error("Export error:", error);
			setNotification({
				show: true,
				type: 'error',
				message: "Failed to export data"
			});

			// Clear notification after a delay
			setTimeout(() => setNotification(null), 3000);
		}
	};

	const handlePDFExport = () => {
		setNotification({
			show: true,
			type: 'success',
			message: "PDF export coming soon"
		});

		// Clear notification after a delay
		setTimeout(() => setNotification(null), 3000);
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
					<DropdownMenuItem onClick={handlePDFExport}>
						Export as PDF
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{notification && notification.show && (
				<div className="absolute right-0 mt-2 w-64 z-50">
					<Alert variant={notification.type === 'success' ? "default" : "destructive"}>
						{notification.type === 'success' ? (
							<Check className="h-4 w-4" />
						) : (
							<AlertCircle className="h-4 w-4" />
						)}
						<AlertTitle>
							{notification.type === 'success' ? "Success" : "Error"}
						</AlertTitle>
						<AlertDescription>
							{notification.message}
						</AlertDescription>
					</Alert>
				</div>
			)}
		</div>
	);
};

export default ExportButton;