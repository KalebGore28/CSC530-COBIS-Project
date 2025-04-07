import React, { useState, useEffect } from 'react';
import CsvImportService from '../services/csv-import-service';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Info, CheckCircle, AlertCircle, Upload, Bug } from 'lucide-react';

/**
 * A component for testing the CSV Import Service
 * This will work within your authenticated application context
 */
export const CsvServiceTester: React.FC = () => {
	const [activeTab, setActiveTab] = useState('config');
	const [loading, setLoading] = useState(false);
	const [results, setResults] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [file, setFile] = useState<File | null>(null);
	const [selectedTableId, setSelectedTableId] = useState<string>('');
	const [tables, setTables] = useState<any[]>([]);
	const [debugInfo, setDebugInfo] = useState<string>('');

	// Helper function to add debug info
	const addDebug = (message: string) => {
		console.log("[CsvServiceTester Debug]", message);
		setDebugInfo(prev => `${prev}\n${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`);
	};

	// Test fetching import configuration
	const testGetImportInfo = async () => {
		setLoading(true);
		setError(null);
		setDebugInfo('');
		addDebug('Starting fetch of import configuration...');

		try {
			const importInfo = await CsvImportService.getImportInfo();
			addDebug(`Received response: ${JSON.stringify(importInfo).substring(0, 200)}...`);

			// Check if the response has the expected structure
			if (!importInfo) {
				throw new Error('No data received from the server');
			}

			setResults(importInfo);

			// Log what we received to help debug
			addDebug(`Response has csvMappings: ${!!importInfo.csvMappings}`);
			if (importInfo.csvMappings) {
				addDebug(`Found ${importInfo.csvMappings.length} CSV mappings`);
			}

			addDebug(`Response has stats: ${!!importInfo.stats}`);
			if (importInfo.stats) {
				addDebug(`Stats content: ${JSON.stringify(importInfo.stats)}`);
			}

			// Safely extract tables
			const allTables: any[] = [];
			if (Array.isArray(importInfo.csvMappings)) {
				importInfo.csvMappings.forEach((mapping, idx) => {
					addDebug(`Processing mapping ${idx + 1}/${importInfo.csvMappings.length}, category: ${mapping.category}`);

					if (mapping.category === 'data' && Array.isArray(mapping.destinations)) {
						mapping.destinations.forEach(dest => {
							addDebug(`Adding data table: ${dest.tableName}`);
							allTables.push({
								...dest,
								category: 'data',
								matchingPatterns: mapping.filePatterns || []
							});
						});
					} else if (mapping.category === 'lookup' && mapping.destination) {
						addDebug(`Adding lookup table: ${mapping.destination.tableName}`);
						allTables.push({
							...mapping.destination,
							category: 'lookup',
							matchingPatterns: mapping.filePatterns || []
						});
					}
				});
			}

			addDebug(`Extracted ${allTables.length} tables total`);
			setTables(allTables);
		} catch (err: any) {
			console.error("Error in testGetImportInfo:", err);
			setError(`Failed to fetch import configuration: ${err.message || err}`);
			addDebug(`Error: ${err.message || JSON.stringify(err)}`);
			if (err.response) {
				addDebug(`Response status: ${err.response.status}`);
				addDebug(`Response data: ${JSON.stringify(err.response.data)}`);
			}
		} finally {
			setLoading(false);
		}
	};

	// Test pattern matching
	const testPatternMatching = () => {
		if (!tables.length) {
			setError('Please fetch configuration first to get tables');
			return;
		}

		setError(null);
		setDebugInfo('');
		addDebug('Starting pattern matching test...');

		const testFileNames = [
			'reg_cuba_test_scores_202310_20230815.csv',
			'reg_cuba_demographic_202310_20230815.csv',
			'reg_cuba_courses_during_term_202310_20230815.csv',
			'academic_standing.csv',
			'departments.csv',
			'random_file.csv'
		];

		try {
			addDebug(`Testing ${testFileNames.length} file names against ${tables.length} tables`);

			const results = testFileNames.map(fileName => {
				addDebug(`Testing file: ${fileName}`);
				const matchedTable = CsvImportService.findMatchingTable(fileName, tables);
				const result = {
					fileName,
					matched: !!matchedTable,
					tableName: matchedTable?.tableName || 'No match'
				};
				addDebug(`Result: ${result.matched ? 'Matched to ' + result.tableName : 'No match'}`);
				return result;
			});

			setResults(results);
			addDebug('Pattern matching completed successfully');
		} catch (err: any) {
			console.error("Error in testPatternMatching:", err);
			setError(`Pattern matching failed: ${err.message || err}`);
			addDebug(`Error: ${err.message || JSON.stringify(err)}`);
		}
	};

	// Handle file selection
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const selectedFile = e.target.files[0];
			setFile(selectedFile);
			addDebug(`File selected: ${selectedFile.name} (${selectedFile.size} bytes)`);

			// Try to auto-detect table
			if (tables.length) {
				addDebug(`Attempting to auto-detect table for ${selectedFile.name}`);
				const matchedTable = CsvImportService.findMatchingTable(selectedFile.name, tables);
				if (matchedTable) {
					addDebug(`Auto-detected table: ${matchedTable.tableName} (${matchedTable.tableId})`);
					setSelectedTableId(matchedTable.tableId);
				} else {
					addDebug(`No matching table found automatically`);
				}
			}
		}
	};

	// Test process import
	const testProcessImport = async () => {
		if (!file || !selectedTableId) {
			setError('Please select a file and destination table');
			return;
		}

		setLoading(true);
		setError(null);
		setDebugInfo('');
		addDebug(`Starting import process for file: ${file.name}, table: ${selectedTableId}`);

		try {
			addDebug('Calling processImport API...');
			const result = await CsvImportService.processImport(file, selectedTableId);
			addDebug(`Received response: ${JSON.stringify(result).substring(0, 200)}...`);
			setResults(result);
			addDebug('Import completed');
		} catch (err: any) {
			console.error("Error in testProcessImport:", err);
			setError(`Failed to process import: ${err.message || err}`);
			addDebug(`Error: ${err.message || JSON.stringify(err)}`);
			if (err.response) {
				addDebug(`Response status: ${err.response.status}`);
				addDebug(`Response data: ${JSON.stringify(err.response.data)}`);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Info size={20} />
					CSV Import Service Tester
				</CardTitle>
			</CardHeader>

			<CardContent>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="config">Configuration</TabsTrigger>
						<TabsTrigger value="patterns">Pattern Matching</TabsTrigger>
						<TabsTrigger value="import">Process Import</TabsTrigger>
					</TabsList>

					<TabsContent value="config" className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium">Test Import Configuration</h3>
							<Button onClick={testGetImportInfo} disabled={loading}>
								{loading ? 'Loading...' : 'Fetch Configuration'}
							</Button>
						</div>

						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{results && (
							<div className="mt-4 space-y-2">
								{/* Safely display stats if available */}
								{results.stats ? (
									<>
										<div className="flex items-center gap-2">
											<CheckCircle className="text-green-500" size={16} />
											<span className="font-medium">Found {results.stats.csvMappingCount || 'unknown'} CSV mappings:</span>
										</div>
										<ul className="list-disc pl-6">
											<li>{results.stats.dataTableCount || 0} data tables</li>
											<li>{results.stats.lookupTableCount || 0} lookup tables</li>
										</ul>
									</>
								) : (
									<div className="flex items-center gap-2">
										<CheckCircle className="text-green-500" size={16} />
										<span className="font-medium">Received configuration data (stats not available)</span>
									</div>
								)}

								<div className="mt-4">
									<h4 className="font-medium mb-2">Available Tables: {tables.length}</h4>
									<div className="max-h-80 overflow-y-auto bg-slate-50 p-4 rounded-md">
										{tables.map((table, index) => (
											<div key={index} className="mb-4 p-2 border-b border-slate-200">
												<div className="font-medium">{table.tableName}</div>
												<div className="text-sm text-slate-500">ID: {table.tableId}</div>
												<div className="text-sm text-slate-500">Type: {table.category}</div>
												{table.matchingPatterns && (
													<div className="text-xs text-slate-500 mt-1">
														Patterns: {table.matchingPatterns.join(', ')}
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							</div>
						)}
					</TabsContent>

					<TabsContent value="patterns" className="space-y-4">
						<div className="flex justify-between items-center">
							<h3 className="text-lg font-medium">Test Pattern Matching</h3>
							<Button onClick={testPatternMatching} disabled={loading || !tables.length}>
								{loading ? 'Testing...' : 'Test Patterns'}
							</Button>
						</div>

						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{activeTab === 'patterns' && results && Array.isArray(results) && (
							<div className="mt-4">
								<h4 className="font-medium mb-2">Pattern Matching Results:</h4>
								<div className="max-h-80 overflow-y-auto bg-slate-50 p-4 rounded-md">
									{results.map((result: any, index: number) => (
										<div key={index} className="mb-2 flex items-center gap-2">
											{result.matched ? (
												<CheckCircle className="text-green-500" size={16} />
											) : (
												<AlertCircle className="text-amber-500" size={16} />
											)}
											<span className="font-mono text-sm">{result.fileName}</span>
											<span className="text-slate-500">→</span>
											<span className={result.matched ? 'text-green-600 font-medium' : 'text-amber-600'}>
												{result.tableName}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</TabsContent>

					<TabsContent value="import" className="space-y-4">
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Test Import Process</h3>

							{tables.length === 0 && (
								<Alert>
									<Info className="h-4 w-4" />
									<AlertDescription>
										Please fetch configuration first to get available tables
									</AlertDescription>
								</Alert>
							)}

							<div className="grid grid-cols-1 gap-4">
								<div>
									<label className="block text-sm font-medium mb-2">Select CSV File</label>
									<div className="flex items-center space-x-2">
										<input
											type="file"
											accept=".csv"
											onChange={handleFileChange}
											className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-slate-50 file:text-slate-700
                        hover:file:bg-slate-100"
										/>
										{file && (
											<div className="flex items-center gap-1 text-green-600">
												<CheckCircle size={16} />
												<span>{file.name}</span>
											</div>
										)}
									</div>
								</div>

								{file && (
									<div>
										<label className="block text-sm font-medium mb-2">Destination Table</label>
										<select
											className="w-full p-2 border rounded-md"
											value={selectedTableId}
											onChange={(e) => setSelectedTableId(e.target.value)}
										>
											<option value="">Select a table...</option>
											{tables.map((table, index) => (
												<option key={index} value={table.tableId}>
													{table.tableName} ({table.category})
												</option>
											))}
										</select>
									</div>
								)}

								<Button
									onClick={testProcessImport}
									disabled={loading || !file || !selectedTableId}
									className="flex items-center gap-2"
								>
									{loading ? 'Processing...' : (
										<>
											<Upload size={16} />
											Process Import
										</>
									)}
								</Button>
							</div>

							{error && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							{activeTab === 'import' && results && typeof results === 'object' && 'success' in results && (
								<div className="mt-4 p-4 rounded-md border border-slate-200">
									<h4 className="font-medium mb-2 flex items-center gap-2">
										{results.success ? (
											<CheckCircle className="text-green-500" size={16} />
										) : (
											<AlertCircle className="text-red-500" size={16} />
										)}
										Import Results:
									</h4>

									<div className="grid grid-cols-2 gap-2 text-sm mt-2">
										<div className="bg-slate-50 p-2 rounded">Total: {results.totalRecords}</div>
										<div className="bg-green-50 p-2 rounded">Inserted: {results.inserted}</div>
										<div className="bg-blue-50 p-2 rounded">Updated: {results.updated}</div>
										<div className="bg-amber-50 p-2 rounded">Skipped: {results.skipped}</div>
										<div className="bg-red-50 p-2 rounded">Failed: {results.failed}</div>
									</div>

									{results.errorDetails && results.errorDetails.length > 0 && (
										<div className="mt-4">
											<h5 className="font-medium text-red-600 mb-2">Errors:</h5>
											<div className="max-h-60 overflow-y-auto bg-slate-50 p-3 rounded-md">
												{results.errorDetails.map((error: any, index: number) => (
													<div key={index} className="mb-3 pb-3 border-b border-slate-200">
														<div className="text-red-600 font-medium">{error.error}</div>
														<div className="text-xs text-slate-500 mt-1">Type: {error.errorType}</div>
														<pre className="text-xs bg-slate-100 p-2 mt-1 rounded overflow-x-auto">
															{JSON.stringify(error.row, null, 2)}
														</pre>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					</TabsContent>
				</Tabs>

				{/* Debug Panel */}
				{debugInfo && (
					<div className="mt-8 border-t pt-4">
						<div className="flex items-center gap-2 mb-2">
							<Bug size={16} className="text-slate-500" />
							<h4 className="font-medium text-slate-700">Debug Info</h4>
						</div>
						<pre className="text-xs bg-slate-100 p-4 rounded overflow-x-auto max-h-60 overflow-y-auto">
							{debugInfo}
						</pre>
					</div>
				)}
			</CardContent>

			<CardFooter className="flex justify-between">
				<div className="text-sm text-slate-500">
					This component allows testing the CSV Import Service within your application.
				</div>
			</CardFooter>
		</Card>
	);
};

export default CsvServiceTester; 