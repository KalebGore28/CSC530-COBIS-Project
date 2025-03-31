import { useState, useEffect, ChangeEvent } from "react"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSession } from "@/hooks/session-context"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from "@/components/ui/accordion"

// Enhanced table configuration type
interface TableConfig {
	name: string
	endpoint: string
	fields: string[]
	category: "lookup" | "data" // Categorize tables 
	description?: string
	dependencies?: {
		tableName: string
		field: string
		foreignTable: string
		foreignField: string
	}[]
}

// File type mapping
interface FileTypeMapping {
	pattern: RegExp
	tableType: string
	description: string
}

interface ImportError {
	row: Record<string, string>
	error: string
	errorType: "foreign_key" | "validation" | "unknown"
	dependencyInfo?: {
		tableName: string
		field: string
		value: string
	}
}

export default function CsvImport() {
	const { session } = useSession()
	const [tables, setTables] = useState<TableConfig[]>([])
	const [tableCategories, setTableCategories] = useState<{
		lookup: TableConfig[],
		data: TableConfig[]
	}>({ lookup: [], data: [] })
	const [selectedCategory, setSelectedCategory] = useState<"lookup" | "data" | "">("")
	const [selectedTable, setSelectedTable] = useState<string>("")
	const [csvFile, setCsvFile] = useState<File | null>(null)
	const [csvData, setCsvData] = useState<string[][]>([])
	const [csvHeaders, setCsvHeaders] = useState<string[]>([])
	const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
	const [isLoading, setIsLoading] = useState(false)
	const [result, setResult] = useState<{
		totalRecords?: number
		inserted?: number
		updated?: number
		skipped?: number
		skippedDetails?: { row: any; reason: string }[]
		failed?: number
		errorDetails?: ImportError[]
		message?: string
	} | null>(null)

	// State for error recovery
	const [pendingErrors, setPendingErrors] = useState<ImportError[]>([])
	const [currentErrorIndex, setCurrentErrorIndex] = useState<number>(0)
	const [fixedData, setFixedData] = useState<Record<string, string>[]>([])
	const [isFixMode, setIsFixMode] = useState(false)
	const [suggestedTable, setSuggestedTable] = useState<string>("")

	// File pattern mapping
	const filePatterns: FileTypeMapping[] = [
		{
			pattern: /reg_cuba_test_scores_\d+_\d+\.csv$/i,
			tableType: "test_scores",
			description: "Test scores data"
		},
		{
			pattern: /reg_cuba_demographic_\d+_\d+\.csv$/i,
			tableType: "demographics",
			description: "Student demographic information"
		},
		{
			pattern: /reg_cuba_overrides_\d+_\d+\.csv$/i,
			tableType: "overrides",
			description: "Override information"
		},
		{
			pattern: /reg_cuba_prev_colleges_\d+_\d+\.csv$/i,
			tableType: "previous_colleges",
			description: "Previous college information"
		},
		{
			pattern: /reg_cuba_courses_during_term_\d+_\d+\.csv$/i,
			tableType: "courses_during_term",
			description: "Courses taken during term"
		},
		{
			pattern: /reg_cuba_catalog_\d+_\d+\.csv$/i,
			tableType: "course_catalog",
			description: "Course catalog data"
		},
		{
			pattern: /\d+_REG_CUBA_Courses_Grade_Time_Extract_\d+\.csv$/i,
			tableType: "courses_during_term",
			description: "End of term course data"
		},
		{
			pattern: /\d+_REG_CUBA_Demographic_Grade_Time_Extract_\d+\.csv$/i,
			tableType: "demographics",
			description: "End of term demographic data"
		},
	]

	// Fetch table metadata on mount
	useEffect(() => {
		const fetchTables = async () => {
			try {
				const response = await fetch("/api/import/metadata", {
					method: "GET",
					credentials: "include",
				})
				if (!response.ok) throw new Error("Failed to fetch table metadata")
				const data: TableConfig[] = await response.json()
				setTables(data)

				// Categorize tables
				const lookup = data.filter(t => t.category === "lookup")
				const regular = data.filter(t => t.category === "data")
				setTableCategories({
					lookup,
					data: regular
				})
			} catch (error: any) {
				setResult({ message: error.message || "Error fetching table metadata" })
			}
		}

		fetchTables()
	}, [])

	// Suggest table based on filename
	useEffect(() => {
		if (csvFile) {
			const fileName = csvFile.name
			for (const pattern of filePatterns) {
				if (pattern.pattern.test(fileName)) {
					// Find matching table by type
					const matchingTable = tables.find(t => t.name.toLowerCase().includes(pattern.tableType))
					if (matchingTable) {
						setSelectedTable(matchingTable.name)
						setSelectedCategory(matchingTable.category)
					}
					break
				}
			}
		}
	}, [csvFile, tables])

	// Handle category selection
	const handleCategoryChange = (category: "lookup" | "data") => {
		setSelectedCategory(category)
		setSelectedTable("")
	}

	// Enhanced column auto-mapping function
	const autoMapColumns = (
		headers: string[],
		fields: string[],
		existingMapping: Record<string, string> = {}
	): Record<string, string> => {
		const newMapping: Record<string, string> = { ...existingMapping };

		// First pass: exact matches (case-insensitive)
		fields.forEach((field) => {
			// Skip if already mapped correctly
			if (newMapping[field] && headers.includes(newMapping[field])) {
				return;
			}

			// Try exact match
			const exactMatch = headers.find(
				(header) => header.toLowerCase() === field.toLowerCase()
			);

			if (exactMatch) {
				newMapping[field] = exactMatch;
				return;
			}

			// Try matching by removing spaces and underscores
			const normalizedField = field.toLowerCase().replace(/[\s_-]/g, '');
			const normalizedMatch = headers.find(
				(header) => header.toLowerCase().replace(/[\s_-]/g, '') === normalizedField
			);

			if (normalizedMatch) {
				newMapping[field] = normalizedMatch;
				return;
			}

			// Try substring matching (if header contains the field as a substring)
			const substringMatch = headers.find(
				(header) => header.toLowerCase().includes(field.toLowerCase())
			);

			if (substringMatch) {
				newMapping[field] = substringMatch;
				return;
			}

			// Try to match field tokens with header tokens
			const fieldTokens = field.toLowerCase().split(/[\s_-]/);
			const headerWithMostMatches = headers.reduce(
				(best, current) => {
					const currentTokens = current.toLowerCase().split(/[\s_-]/);
					const matches = fieldTokens.filter(token =>
						currentTokens.some(headerToken => headerToken.includes(token) || token.includes(headerToken))
					).length;

					return matches > best.matches ? { header: current, matches } : best;
				},
				{ header: "", matches: 0 }
			);

			if (headerWithMostMatches.matches > 0) {
				newMapping[field] = headerWithMostMatches.header;
				return;
			}
		});

		return newMapping;
	};


	// In your handleFileChange function, replace the existing auto-mapping logic:
	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setCsvFile(file)
			const formData = new FormData()
			formData.append("file", file)

			try {
				const response = await fetch("/api/import/parse-csv", {
					method: "POST",
					body: formData,
					credentials: "include",
				})
				if (!response.ok) throw new Error("Failed to parse CSV")
				const { headers, data } = await response.json()
				setCsvHeaders(headers)
				setCsvData(data)

				// Reset error state when loading new file
				setIsFixMode(false)
				setPendingErrors([])
				setFixedData([])

				// Attempt to automatically suggest table if not already selected
				if (!selectedTable && csvFile) {
					const fileName = csvFile.name
					for (const pattern of filePatterns) {
						if (pattern.pattern.test(fileName)) {
							// Find matching table by type
							const matchingTable = tables.find(t => t.name.toLowerCase().includes(pattern.tableType))
							if (matchingTable) {
								setSelectedTable(matchingTable.name)
								setSelectedCategory(matchingTable.category)
								break;
							}
						}
					}
				}

				// Auto-map columns with enhanced logic
				const tableConfig = tables.find((t) => t.name === selectedTable)
				if (tableConfig) {
					const newMapping = autoMapColumns(headers, tableConfig.fields)
					setColumnMapping(newMapping)
				} else {
					// If no table selected yet, try to match columns against all known tables
					// to help identify which table this CSV might be for
					let bestTableMatch = { tableName: "", matchCount: 0 };

					for (const table of tables) {
						const testMapping = autoMapColumns(headers, table.fields);
						const matchCount = Object.values(testMapping).filter(val => val).length;

						if (matchCount > bestTableMatch.matchCount) {
							bestTableMatch = { tableName: table.name, matchCount };
						}
					}

					// If we found a good match and it has more than 3 matching columns, suggest that table
					if (bestTableMatch.matchCount >= 3 && bestTableMatch.tableName) {
						const suggestedTable = tables.find(t => t.name === bestTableMatch.tableName);
						if (suggestedTable) {
							setSelectedTable(suggestedTable.name);
							setSelectedCategory(suggestedTable.category);

							// Now map columns for the suggested table
							const newMapping = autoMapColumns(headers, suggestedTable.fields);
							setColumnMapping(newMapping);
						}
					} else {
						setColumnMapping({});
					}
				}
			} catch (error: any) {
				setResult({ message: error.message || "Error parsing CSV file" })
			}
		}
	}

	// Handle column mapping
	const handleColumnMap = (field: string, csvColumn: string) => {
		setColumnMapping((prev) => ({ ...prev, [field]: csvColumn }))
	}

	// Map CSV data to the expected format
	const mapCsvDataToFields = (data: string[][], headers: string[], mapping: Record<string, string>, fields: string[]) => {
		return data.map((row) => {
			const rowData: Record<string, string> = {}
			fields.forEach((field) => {
				const csvColumn = mapping[field]
				const columnIndex = headers.indexOf(csvColumn)
				rowData[field] = columnIndex >= 0 ? row[columnIndex] || "" : ""
			})
			return rowData
		})
	}

	// Handle import submission
	const handleImport = async () => {
		if (!selectedTable || !csvFile || !csvData.length || !Object.keys(columnMapping).length) {
			setResult({ message: "Please select a table, upload a CSV, and map all required fields." })
			return
		}

		const tableConfig = tables.find((t) => t.name === selectedTable)
		if (!tableConfig) return

		// Validate mapping
		const missingFields = tableConfig.fields.filter((field) => !columnMapping[field])
		if (missingFields.length > 0) {
			setResult({ message: `Missing mapping for fields: ${missingFields.join(", ")}` })
			return
		}

		// Map CSV data to the expected format
		const mappedData = mapCsvDataToFields(csvData, csvHeaders, columnMapping, tableConfig.fields)

		setIsLoading(true)
		try {
			const response = await fetch(`${tableConfig.endpoint}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					mappedData,
					fileName: csvFile.name,
					importedBy: session?.user.email || session?.user.name,
				}),
			})

			if (!response.ok) throw new Error("Failed to import data")
			const data = await response.json()

			// Handle errors that might need fixing
			if (data.errorDetails && data.errorDetails.length > 0) {
				// Foreign key errors need special handling
				const foreignKeyErrors = data.errorDetails.filter(
					(err: ImportError) => err.errorType === "foreign_key"
				)

				if (foreignKeyErrors.length > 0) {
					setPendingErrors(foreignKeyErrors)
					setCurrentErrorIndex(0)
					setIsFixMode(true)

					// Find related lookup table for first error
					if (foreignKeyErrors[0].dependencyInfo) {
						const relatedTable = foreignKeyErrors[0].dependencyInfo.tableName
						setSuggestedTable(relatedTable)
					}
				}
			}

			setResult({
				totalRecords: data.totalRecords,
				inserted: data.inserted,
				updated: data.updated,
				skipped: data.skipped,
				skippedDetails: data.skippedDetails,
				failed: data.failed,
				errorDetails: data.errorDetails,
			})
		} catch (error: any) {
			setResult({ message: error.message || "Error importing data" })
		} finally {
			setIsLoading(false)
		}
	}

	// Handle retry for fixed rows
	const handleRetryImport = async () => {
		if (fixedData.length === 0 || !selectedTable) return

		const tableConfig = tables.find((t) => t.name === selectedTable)
		if (!tableConfig) return

		setIsLoading(true)
		try {
			const response = await fetch(`${tableConfig.endpoint}/retry`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					fixedData,
					fileName: csvFile?.name,
					importedBy: session?.user.email || session?.user.name,
				}),
			})

			if (!response.ok) throw new Error("Failed to import fixed data")
			const data = await response.json()

			// Update result with new information
			setResult(prev => ({
				totalRecords: (prev?.totalRecords || 0),
				inserted: (prev?.inserted || 0) + (data.inserted || 0),
				updated: (prev?.updated || 0) + (data.updated || 0),
				skipped: (prev?.skipped || 0) + (data.skipped || 0),
				skippedDetails: [...(prev?.skippedDetails || []), ...(data.skippedDetails || [])],
				failed: (prev?.failed || 0) - fixedData.length + (data.failed || 0),
				errorDetails: data.errorDetails || [],
			}))

			// Reset fix mode
			setIsFixMode(false)
			setPendingErrors([])
			setFixedData([])
		} catch (error: any) {
			setResult({ message: error.message || "Error importing fixed data" })
		} finally {
			setIsLoading(false)
		}
	}

	// Add a missing lookup value
	const addMissingValue = async (tableName: string, data: Record<string, string>) => {
		try {
			const response = await fetch(`/api/import/add-lookup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					tableName,
					data,
				}),
			})

			if (!response.ok) throw new Error("Failed to add lookup value")
			return await response.json()
		} catch (error: any) {
			throw new Error(error.message || "Error adding lookup value")
		}
	}

	// Current error being handled
	const currentError = pendingErrors[currentErrorIndex]

	// Determine if we have foreign key errors that need fixing
	const hasForeignKeyErrors = result?.errorDetails?.some(err => err.errorType === "foreign_key") || false

	return (
		<div className="p-6 flex-1 flex justify-center">
			<Card className="w-full max-w-full md:max-w-6xl flex flex-col">
				<CardHeader>
					<CardTitle className="text-3xl">CSV Import</CardTitle>
					<CardDescription>
						Import data from CSV files into the system
					</CardDescription>
				</CardHeader>
				<CardContent className="flex-1 overflow-y-auto px-6">
					{isFixMode ? (
						<div className="space-y-6">
							<Alert variant="destructive">
								<AlertDescription>
									<p className="font-semibold">Some rows couldn't be imported due to missing reference data.</p>
									<p>Follow the steps below to fix {pendingErrors.length} remaining issues.</p>
								</AlertDescription>
							</Alert>

							{/* Error resolution interface */}
							<div className="border rounded-lg p-4">
								<h3 className="font-semibold text-lg mb-4">
									Issue {currentErrorIndex + 1} of {pendingErrors.length}
								</h3>

								<div className="space-y-4">
									<div>
										<p className="font-medium">Problem:</p>
										<p className="text-red-500">{currentError?.error}</p>
									</div>

									<div>
										<p className="font-medium">Row data:</p>
										<Table>
											<TableHeader>
												<TableRow>
													{Object.keys(currentError?.row || {}).map(key => (
														<TableHead key={key}>{key}</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												<TableRow>
													{Object.values(currentError?.row || {}).map((value, i) => (
														<TableCell key={i}>{value}</TableCell>
													))}
												</TableRow>
											</TableBody>
										</Table>
									</div>

									{currentError?.dependencyInfo && (
										<div>
											<p className="font-medium">Required action:</p>
											<p>Add missing value "{currentError.dependencyInfo.value}" to "{currentError.dependencyInfo.tableName}" table</p>

											<Dialog>
												<DialogTrigger asChild>
													<Button className="mt-2">Add Missing Value</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle>Add Missing Reference Data</DialogTitle>
														<DialogDescription>
															Add the missing value to fix this import error.
														</DialogDescription>
													</DialogHeader>

													{/* Form would go here to collect required fields */}
													{/* This is simplified - you'd need to dynamically generate fields based on the lookup table */}
													<div className="py-4">
														<form className="space-y-4" onSubmit={(e) => {
															e.preventDefault()
															const formData = new FormData(e.currentTarget)
															const data: Record<string, string> = {}
															formData.forEach((value, key) => {
																data[key] = value.toString()
															})

															// Add logic to submit lookup value and mark this error as fixed
														}}>
															<div className="grid gap-2">
																<label htmlFor="id">ID</label>
																<Input
																	id="id"
																	name="id"
																	defaultValue={currentError.dependencyInfo.value}
																/>
															</div>
															<div className="grid gap-2">
																<label htmlFor="name">Name</label>
																<Input id="name" name="name" />
															</div>
															<Button type="submit">Save</Button>
														</form>
													</div>
												</DialogContent>
											</Dialog>
										</div>
									)}

									<div className="flex justify-between pt-4">
										<Button
											variant="outline"
											disabled={currentErrorIndex === 0}
											onClick={() => setCurrentErrorIndex(prev => Math.max(0, prev - 1))}
										>
											Previous Issue
										</Button>

										<Button
											disabled={currentErrorIndex >= pendingErrors.length - 1}
											onClick={() => setCurrentErrorIndex(prev => Math.min(pendingErrors.length - 1, prev + 1))}
										>
											Next Issue
										</Button>
									</div>
								</div>
							</div>

							{/* Fixed data retry button */}
							<div className="flex justify-end">
								<Button
									disabled={fixedData.length === 0}
									onClick={handleRetryImport}
								>
									Retry Import with Fixed Data ({fixedData.length})
								</Button>
							</div>
						</div>
					) : (
						<>
							{/* Table Category Selection */}
							<div className="mb-6">
								<label className="block mb-2 text-sm font-medium">Select Category</label>
								<Tabs value={selectedCategory} onValueChange={(value: any) => handleCategoryChange(value)}>
									<TabsList className="grid w-full grid-cols-2">
										<TabsTrigger value="lookup">
											Lookup Tables
											<Badge variant="secondary" className="ml-2">
												{tableCategories.lookup.length}
											</Badge>
										</TabsTrigger>
										<TabsTrigger value="data">
											Data Tables
											<Badge variant="secondary" className="ml-2">
												{tableCategories.data.length}
											</Badge>
										</TabsTrigger>
									</TabsList>
								</Tabs>
							</div>

							{/* Table Selection */}
							{selectedCategory && (
								<div className="mb-6">
									<label className="block mb-2 text-sm font-medium">Select Table</label>
									<Select value={selectedTable} onValueChange={setSelectedTable}>
										<SelectTrigger>
											<SelectValue placeholder="Select a table" />
										</SelectTrigger>
										<SelectContent>
											{tableCategories[selectedCategory as "lookup" | "data"].map((table) => (
												<SelectItem key={table.name} value={table.name}>
													{table.name}
													{table.description && ` - ${table.description}`}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}

							{/* File Upload */}
							<div className="mb-6">
								<label className="block mb-2 text-sm font-medium">Upload CSV File</label>
								<Input type="file" accept=".csv" onChange={handleFileChange} />
								{csvFile && (
									<p className="text-sm mt-1">
										File: <span className="font-medium">{csvFile.name}</span>
									</p>
								)}
							</div>

							{/* Column Mapping */}
							{selectedTable && csvHeaders.length > 0 && (
								<div className="mb-6">
									<h3 className="text-lg font-semibold mb-3">Map CSV Columns</h3>
									<div className="max-h-96 overflow-y-auto border rounded">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Required Field</TableHead>
													<TableHead>CSV Column</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{tables
													.find((t) => t.name === selectedTable)!
													.fields.map((field) => (
														<TableRow key={field}>
															<TableCell>{field}</TableCell>
															<TableCell>
																<Select
																	value={columnMapping[field] || ""}
																	onValueChange={(value) => handleColumnMap(field, value)}
																>
																	<SelectTrigger
																		className={columnMapping[field] ? "" : "border-red-500"}
																	>
																		<SelectValue placeholder={columnMapping[field] ? columnMapping[field] : "Select a column (unmapped)"} />
																	</SelectTrigger>
																	<SelectContent>
																		{csvHeaders.map((header) => (
																			<SelectItem key={header} value={header}>
																				{header}
																			</SelectItem>
																		))}
																	</SelectContent>
																</Select>
															</TableCell>
														</TableRow>
													))}
											</TableBody>
										</Table>
									</div>
								</div>
							)}

							{/* CSV Preview */}
							{csvData.length > 0 && (
								<div className="mb-6">
									<h3 className="text-lg font-semibold mb-3">CSV Preview</h3>
									<div className="max-h-96 overflow-x-auto border rounded" style={{ maxWidth: "100%", overflowX: "auto" }}>
										<Table style={{ minWidth: "100%", maxWidth: "100%" }}>
											<TableHeader>
												<TableRow>
													{csvHeaders.map((header) => (
														<TableHead key={header}>{header}</TableHead>
													))}
												</TableRow>
											</TableHeader>
											<TableBody>
												{csvData.slice(0, 5).map((row, index) => (
													<TableRow key={index}>
														{row.map((cell, i) => (
															<TableCell key={i}>{cell}</TableCell>
														))}
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</div>
							)}

							{/* Import Button */}
							<Button
								onClick={handleImport}
								disabled={isLoading || !selectedTable || !csvFile}
								className="w-full"
							>
								{isLoading ? "Importing..." : "Import CSV"}
							</Button>

							{/* Result Display */}
							{result && (
								<div className="mt-6">
									{result.totalRecords !== undefined ? (
										<Alert
											variant={result.failed && result.failed > 0 ? "destructive" : "default"}
										>
											<AlertDescription>
												{result.failed && result.failed > 0 ? (
													<p>Data import completed with errors.</p>
												) : (
													<p>Data imported successfully.</p>
												)}
												<p>Total Records: {result.totalRecords}</p>
												<p>Inserted: {result.inserted}</p>
												<p>Updated: {result.updated}</p>
												<p>Skipped: {result.skipped}</p>

												{/* Skipped records accordion */}
												{(result.skipped ?? 0) > 0 && result.skippedDetails && (
													<Accordion type="single" collapsible className="mt-4">
														<AccordionItem value="skipped">
															<AccordionTrigger>Skipped rows ({result.skipped})</AccordionTrigger>
															<AccordionContent>
																<div className="mt-2">
																	{Object.entries(
																		result.skippedDetails.reduce((acc, detail) => {
																			acc[detail.reason] = (acc[detail.reason] || 0) + 1;
																			return acc;
																		}, {} as Record<string, number>)
																	).map(([reason, count]) => (
																		<div key={reason} className="flex justify-between py-1">
																			<span>{reason}:</span>
																			<Badge variant="outline">{count}</Badge>
																		</div>
																	))}
																</div>
															</AccordionContent>
														</AccordionItem>
													</Accordion>
												)}

												{/* Error records accordion */}
												{result.failed && result.failed > 0 && result.errorDetails && (
													<Accordion type="single" collapsible className="mt-4">
														<AccordionItem value="errors">
															<AccordionTrigger>Errors ({result.failed})</AccordionTrigger>
															<AccordionContent>
																<div className="space-y-3">
																	{hasForeignKeyErrors && (
																		<Button
																			onClick={() => {
																				setIsFixMode(true)
																				setPendingErrors(result.errorDetails?.filter(err =>
																					err.errorType === "foreign_key"
																				) || [])
																				setCurrentErrorIndex(0)
																			}}
																			className="w-full"
																		>
																			Fix Foreign Key Errors
																		</Button>
																	)}

																	<div className="border rounded overflow-hidden">
																		{result.errorDetails.map((err, index) => (
																			<div key={index} className="p-2 border-b last:border-0">
																				<div className="flex items-center gap-2">
																					<Badge variant={err.errorType === "foreign_key" ? "outline" : "destructive"}>
																						{err.errorType === "foreign_key" ? "Reference Error" : "Error"}
																					</Badge>
																					<p className="text-sm font-medium">{err.error}</p>
																				</div>
																			</div>
																		))}
																	</div>
																</div>
															</AccordionContent>
														</AccordionItem>
													</Accordion>
												)}
											</AlertDescription>
										</Alert>
									) : (
										<Alert variant="destructive">
											<AlertDescription>
												<p>{result.message}</p>
											</AlertDescription>
										</Alert>
									)}
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	)
}