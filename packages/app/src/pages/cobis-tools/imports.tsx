import { useState } from "react";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { FileUpload } from "@/components/csv-import/file-upload";
import { CsvPreview } from "@/components/csv-import/csv-preview";
import { TableSelector } from "@/components/csv-import/table-selector";
import { ImportResultDisplay } from "@/components/csv-import/import-result";

import { ImportResult } from '@cobis/types';

import {
	type CSVFileMappingWithMetadata,
	processImport,
} from "@/services/csv-import-service";

export const CsvImport: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
	const [mapping, setMapping] = useState<CSVFileMappingWithMetadata | null>(null);
	const [importResult, setImportResult] = useState<ImportResult | null>(null);

	const resetImport = () => {
		setSelectedFile(null);
		setCsvData([]);
		setMapping(null);
		setImportResult(null);
	};

	return (
		<div className="max-w-5xl mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-3xl">CSV Import</CardTitle>
					<CardDescription>
						Import data from CSV files into the system
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-10">

					{/* Step 1: File Upload and Table Selection */}
					<div>
						<h2 className="text-xl font-bold mb-4">Step 1: Select Table and Upload CSV</h2>
						<FileUpload
							onFileChange={(e) => {
								const file = e.target.files?.[0] || null;
								setSelectedFile(file);
								console.log("Selected file:", file);
								// Reset parsed data if file changes
								if (!file) {
									resetImport();
								}
							}}
							onClearFile={resetImport}
							onParsedData={(results) => setCsvData(results.data as Record<string, string>[])}
							file={selectedFile}
						/>
					</div>

					<Separator />

					{/* Step 2: Preview Data */}
					{csvData.length > 0 && <div>
						<h2 className="text-xl font-bold mb-4">Step 2: Preview Your Data</h2>
						<CsvPreview
							csvData={csvData}
							maxRows={5}
							highlightSpecialValues={true}
							minColumnWidth={150}
						/>
					</div>}

					<Separator />

					{/* Step 3: Table Selector */}
					{csvData.length > 0 && <div>
						<h2 className="text-xl font-bold mb-4">Step 3: Select The Table</h2>
						<TableSelector
							file={selectedFile}
							selectedMapping={mapping}
							onSelectedMappingChange={setMapping}
						/>
					</div>}

					<Separator />

					{/* Step 4: Import Results */}
					{importResult && <div>
						<h2 className="text-xl font-bold mb-4">Import Results</h2>
						<ImportResultDisplay
							result={importResult}
						/>
					</div>}

				</CardContent>
				<CardFooter>
					{mapping && (
						<div className="flex flex-col space-y-4 w-full">
							<h2 className="text-xl font-bold mb-4">Process Import</h2>
							{!importResult && (
								<div>
									<Button
										onClick={async () => {
											const results = await processImport(csvData, mapping.mappingName);
											setImportResult(results);
										}}
									>
										Process Import
									</Button>
								</div>
							)}
							{importResult && (
								<div>
									<Button
										onClick={() => {
											setImportResult(null);
											setCsvData([]);
											setSelectedFile(null);
											setMapping(null);
										}}
									>
										Start New Import
									</Button>
								</div>
							)}
						</div>
					)}
				</CardFooter>
			</Card>
		</div>
	);
};