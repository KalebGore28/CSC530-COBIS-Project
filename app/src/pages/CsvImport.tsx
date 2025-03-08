import { useState, useEffect, ChangeEvent } from "react"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
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

// Define table configuration type
interface TableConfig {
	name: string
	endpoint: string
	fields: string[]
}

export default function CsvImport({ user }: { user: any }) {
	const [tables, setTables] = useState<TableConfig[]>([])
	const [selectedTable, setSelectedTable] = useState<string>("")
	const [csvFile, setCsvFile] = useState<File | null>(null)
	const [csvData, setCsvData] = useState<string[][]>([])
	const [csvHeaders, setCsvHeaders] = useState<string[]>([])
	const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
	const [isLoading, setIsLoading] = useState(false)
	const [result, setResult] = useState<{
		message?: string
		totalRecords?: number
		errors?: { row: any; error: string }[]
	} | null>(null)

	// Fetch table metadata on mount
	useEffect(() => {
		const fetchTables = async () => {
			try {
				const response = await fetch("/api/import/metadata", {
					method: "GET",
					credentials: "include",
				})
				if (!response.ok) throw new Error("Failed to fetch table metadata")
				const data = await response.json()
				setTables(data)
			} catch (error: any) {
				setResult({ message: error.message || "Error fetching table metadata" })
			}
		}

		fetchTables()
	}, [])

	// Handle file upload and parse via backend with auto-mapping
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

				// Auto-map columns based on case-insensitive exact match
				const tableConfig = tables.find((t) => t.name === selectedTable)
				if (tableConfig) {
					const newMapping: Record<string, string> = {}
					tableConfig.fields.forEach((field) => {
						const matchedHeader = headers.find((header: string) =>
							header.toLowerCase() === field.toLowerCase()
						)
						newMapping[field] = matchedHeader || "" // Empty if no match
					})
					setColumnMapping(newMapping)
				} else {
					setColumnMapping({}) // Reset if no table selected
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
		const mappedData = csvData.map((row) => {
			const rowData: Record<string, string> = {}
			tableConfig.fields.forEach((field) => {
				const csvColumn = columnMapping[field]
				const columnIndex = csvHeaders.indexOf(csvColumn)
				rowData[field] = columnIndex >= 0 ? row[columnIndex] || "" : ""
			})
			return rowData
		})

		setIsLoading(true)
		try {
			const response = await fetch(tableConfig.endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					mappedData,
					fileName: csvFile.name,
					importedBy: user.info.email || user.info.first_name,
				}),
			})

			if (!response.ok) throw new Error("Failed to import data")
			const data = await response.json()
			setResult({
				message: data.message,
				totalRecords: data.totalRecords,
				errors: data.errors,
			})
		} catch (error: any) {
			setResult({ message: error.message || "Error importing data" })
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="p-6 flex-1 flex justify-center">
			<Card className="w-full max-w-full md:max-w-6xl flex flex-col">
				<CardHeader>
					<CardTitle className="text-3xl">CSV Import</CardTitle>
				</CardHeader>
				<CardContent className="flex-1 overflow-y-auto px-6">
					{/* Table Selection */}
					<div className="mb-6">
						<label className="block mb-2 text-sm font-medium">Select Table</label>
						<Select value={selectedTable} onValueChange={setSelectedTable}>
							<SelectTrigger>
								<SelectValue placeholder="Select a table" />
							</SelectTrigger>
							<SelectContent>
								{tables.map((table) => (
									<SelectItem key={table.name} value={table.name}>
										{table.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* File Upload */}
					<div className="mb-6">
						<label className="block mb-2 text-sm font-medium">Upload CSV File</label>
						<Input type="file" accept=".csv" onChange={handleFileChange} />
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
							{result.message && (
								<Alert
									variant={result.errors && result.errors.length > 0 ? "destructive" : "default"}
								>
									<AlertDescription>
										<p>{result.message}</p>
										{result.totalRecords !== undefined && (
											<p>Total Records: {result.totalRecords}</p>
										)}
										{result.errors && result.errors.length > 0 && (
											<div className="mt-2">
												<p>Errors:</p>
												<ul className="list-disc pl-5">
													{result.errors.map((err, index) => (
														<li key={index}>
															Row {JSON.stringify(err.row)}: {err.error}
														</li>
													))}
												</ul>
											</div>
										)}
									</AlertDescription>
								</Alert>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}