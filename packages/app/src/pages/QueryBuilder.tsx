"use client"

import React, { useEffect, useState } from "react"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"

const allowedOperators = ["=", "!=", ">", "<", "LIKE"]

interface Metadata {
	table: string
	columns: string[]
	relationships?: { relatedTable: string; on: Record<string, string> }[]
}

interface Filter {
	column: string
	operator: string
	value: string
}

interface Join {
	table: string
	on: Record<string, string>
}

interface Sort {
	column: string
	direction: "asc" | "desc"
}

interface Pagination {
	limit: number
	offset: number
}

const QueryBuilderPage: React.FC = () => {
	const [metadata, setMetadata] = useState<Metadata[]>([])
	const [selectedTable, setSelectedTable] = useState<string>("")
	const [selectedColumns, setSelectedColumns] = useState<string[]>([])
	const [filters, setFilters] = useState<Filter[]>([])
	const [joins, setJoins] = useState<Join[]>([])
	const [sort, setSort] = useState<Sort>({ column: "", direction: "asc" })
	const [pagination, setPagination] = useState<Pagination>({ limit: 10, offset: 0 })
	const [results, setResults] = useState<any[]>([])
	const [error, setError] = useState<string>("")
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [isRelationshipsOpen, setIsRelationshipsOpen] = useState<boolean>(true)

	useEffect(() => {
		const fetchMetadata = async () => {
			try {
				const response = await fetch("/api/custom-query/metadata")
				if (!response.ok) throw new Error("Failed to fetch metadata")
				const data = await response.json()
				setMetadata(data.metadata || [])
			} catch (err) {
				console.error(err)
				setError("Failed to load metadata")
			}
		}
		fetchMetadata()
	}, [])

	useEffect(() => {
		if (selectedTable) {
			const tableMeta = metadata.find((m) => m.table === selectedTable)
			if (tableMeta) {
				setSelectedColumns(tableMeta.columns.map((col) => `${selectedTable}.${col}`))
				setJoins([])
			}
		}
	}, [selectedTable, metadata])

	const handleAddJoin = (table: string, condition: Record<string, string>) => {
		const newJoin = { table, on: condition }
		const isDuplicate = joins.some(
			(join) => join.table === table && JSON.stringify(join.on) === JSON.stringify(condition)
		)
		if (!isDuplicate) {
			setJoins([...joins, newJoin])
		}
	}

	const handleRemoveJoin = (index: number) => {
		const joinToRemove = joins[index]
		const newJoins = joins.filter((_, i) => i !== index)

		const dependentJoins = newJoins.filter((join) =>
			Object.keys(join.on).some((leftCol) => leftCol.startsWith(joinToRemove.table + "."))
		)

		if (dependentJoins.length > 0) {
			const dependentTables = dependentJoins.map((j) => j.table)
			setJoins(newJoins.filter((join) => !dependentTables.includes(join.table)))
		} else {
			setJoins(newJoins)
		}

		const removedTables = [joinToRemove.table, ...dependentJoins.map((j) => j.table)]
		setSelectedColumns(
			selectedColumns.filter((col) => !removedTables.some((table) => col.startsWith(table + ".")))
		)
	}

	const handleExecuteQuery = async () => {
		if (!selectedTable) {
			setError("Please select a table")
			return
		}
		if (selectedColumns.length === 0) {
			setError("Please select at least one column")
			return
		}

		const queryDef: any = {
			table: selectedTable,
			select: selectedColumns,
			filters,
			joins,
			pagination,
		}

		if (sort.column && sort.column.trim() !== "") {
			queryDef.sort = sort
		}

		setIsLoading(true)
		try {
			const response = await fetch("/api/custom-query/execute", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ queryDef, role: "faculty" }),
			})
			if (!response.ok) throw new Error("Query execution failed")
			const data = await response.json()
			setResults(data.results || [])
			setError("")
		} catch (err: any) {
			setError(err.message || "Query execution failed")
		} finally {
			setIsLoading(false)
		}
	}

	const getAvailableRelationships = (): { relatedTable: string; on: Record<string, string> }[] => {
		if (!selectedTable) return []

		const mainTableMeta = metadata.find((m) => m.table === selectedTable)
		let availableRelationships = mainTableMeta ? [...(mainTableMeta.relationships || [])] : []

		joins.forEach((join) => {
			const joinedTableMeta = metadata.find((m) => m.table === join.table)
			if (joinedTableMeta && joinedTableMeta.relationships) {
				availableRelationships = availableRelationships.concat(joinedTableMeta.relationships)
			}
		})

		return availableRelationships.filter(
			(rel) =>
				!joins.some(
					(join) =>
						join.table === rel.relatedTable && JSON.stringify(join.on) === JSON.stringify(rel.on)
				)
		)
	}

	const getAvailableColumns = (): string[] => {
		if (!selectedTable) return []

		const mainTableMeta = metadata.find((m) => m.table === selectedTable)
		let availableColumns = mainTableMeta
			? mainTableMeta.columns.map((col) => `${selectedTable}.${col}`)
			: []

		joins.forEach((join) => {
			const joinedTableMeta = metadata.find((m) => m.table === join.table)
			if (joinedTableMeta && joinedTableMeta.columns) {
				const joinedColumns = joinedTableMeta.columns.map((col) => `${join.table}.${col}`)
				availableColumns = [...availableColumns, ...joinedColumns]
			}
		})

		return [...new Set(availableColumns)]
	}

	const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const options = e.target.options
		const selected: string[] = []
		for (let i = 0; i < options.length; i++) {
			if (options[i].selected) {
				selected.push(options[i].value)
			}
		}
		setSelectedColumns(selected)
	}

	return (
		<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
			<Card>
				<CardHeader>
					<CardTitle className="text-3xl">Custom Query Builder</CardTitle>
				</CardHeader>
				<CardContent>
					{error && (
						<Alert variant="destructive" className="mb-6">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					{/* Table Selector */}
					<div className="mb-6">
						<Label htmlFor="table-select" className="mb-2 block">
							Table
						</Label>
						<Select value={selectedTable} onValueChange={setSelectedTable}>
							<SelectTrigger id="table-select">
								<SelectValue placeholder="Select table" />
							</SelectTrigger>
							<SelectContent>
								{metadata.map((m) => (
									<SelectItem key={m.table} value={m.table}>
										{m.table}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Column Selector */}
					{selectedTable && (
						<div className="mb-6">
							<Label htmlFor="column-select" className="mb-2 block">
								Select Columns
							</Label>
							<select
								id="column-select"
								multiple
								className="w-full p-3 border border-input rounded-md focus:ring-2 focus:ring-ring h-40 bg-background text-foreground"
								value={selectedColumns}
								onChange={handleColumnChange}
							>
								{getAvailableColumns().map((col) => (
									<option key={col} value={col}>
										{col}
									</option>
								))}
							</select>
							<p className="mt-1 text-sm text-muted-foreground">
								Hold Ctrl (or Cmd) to select multiple columns
							</p>
						</div>
					)}

					{/* Filters Builder */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold mb-3">Filters</h3>
						{filters.map((f, index) => (
							<div key={index} className="flex items-center space-x-3 mb-3">
								<Input
									placeholder="Column"
									value={f.column}
									onChange={(e) => {
										const newFilters = [...filters]
										newFilters[index].column = e.target.value
										setFilters(newFilters)
									}}
									className="flex-1"
								/>
								<Select
									value={f.operator}
									onValueChange={(value) => {
										const newFilters = [...filters]
										newFilters[index].operator = value
										setFilters(newFilters)
									}}
								>
									<SelectTrigger className="w-24">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{allowedOperators.map((op) => (
											<SelectItem key={op} value={op}>
												{op}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Input
									placeholder="Value"
									value={f.value}
									onChange={(e) => {
										const newFilters = [...filters]
										newFilters[index].value = e.target.value
										setFilters(newFilters)
									}}
									className="flex-1"
								/>
								<Button
									variant="destructive"
									onClick={() => {
										const newFilters = filters.filter((_, i) => i !== index)
										setFilters(newFilters)
									}}
								>
									Remove
								</Button>
							</div>
						))}
						<Button
							variant="outline"
							onClick={() => setFilters([...filters, { column: "", operator: "=", value: "" }])}
						>
							Add Filter
						</Button>
					</div>

					{/* Available Relationships */}
					{selectedTable && (
						<div className="mb-6">
							<Collapsible open={isRelationshipsOpen} onOpenChange={setIsRelationshipsOpen}>
								<CollapsibleTrigger asChild>
									<div className="flex items-center justify-between mb-3">
										<h3 className="text-lg font-semibold">Available Relationships</h3>
										<Button variant="ghost" size="sm">
											{isRelationshipsOpen ? <ChevronUp /> : <ChevronDown />}
										</Button>
									</div>
								</CollapsibleTrigger>
								<CollapsibleContent>
									{getAvailableRelationships().map((rel, index) => (
										<Card key={index} className="mb-3">
											<CardContent className="flex justify-between items-center pt-6">
												<div>
													<p>
														<strong>Join with:</strong> {rel.relatedTable}
													</p>
													<div className="text-sm text-muted-foreground mt-1">
														<strong>On:</strong>
														<ul className="list-disc pl-5">
															{Object.entries(rel.on).map(([leftCol, rightCol]) => (
																<li key={leftCol}>
																	{`${leftCol} = ${rel.relatedTable}.${rightCol}`}
																</li>
															))}
														</ul>
													</div>
												</div>
												<Button onClick={() => handleAddJoin(rel.relatedTable, rel.on)}>
													Add Join
												</Button>
											</CardContent>
										</Card>
									))}
								</CollapsibleContent>
							</Collapsible>
						</div>
					)}

					{/* Selected Joins */}
					{joins.length > 0 && (
						<div className="mb-6">
							<h3 className="text-lg font-semibold mb-3">Selected Joins</h3>
							{joins.map((join, idx) => (
								<Card key={idx} className="mb-3">
									<CardContent className="flex justify-between items-center pt-6">
										<div>
											<p>
												<strong>Table:</strong> {join.table}
											</p>
											<div className="text-sm text-muted-foreground mt-1">
												<strong>On:</strong>
												<ul className="list-disc pl-5">
													{Object.entries(join.on).map(([leftCol, rightCol]) => (
														<li key={leftCol}>
															{`${leftCol} = ${join.table}.${rightCol}`}
														</li>
													))}
												</ul>
											</div>
										</div>
										<Button
											variant="destructive"
											onClick={() => handleRemoveJoin(idx)}
										>
											Remove
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					)}

					{/* Sorting */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold mb-3">Sort</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Input
								placeholder="Sort Column (e.g., student_courses.mnumber)"
								value={sort.column}
								onChange={(e) => setSort({ ...sort, column: e.target.value })}
							/>
							<Select
								value={sort.direction}
								onValueChange={(value) => setSort({ ...sort, direction: value as "asc" | "desc" })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="asc">Ascending</SelectItem>
									<SelectItem value="desc">Descending</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Pagination */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold mb-3">Pagination</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="limit">Limit</Label>
								<Input
									id="limit"
									type="number"
									value={pagination.limit}
									onChange={(e) => setPagination({ ...pagination, limit: Number(e.target.value) })}
								/>
							</div>
							<div>
								<Label htmlFor="offset">Offset</Label>
								<Input
									id="offset"
									type="number"
									value={pagination.offset}
									onChange={(e) => setPagination({ ...pagination, offset: Number(e.target.value) })}
								/>
							</div>
						</div>
					</div>

					<Button
						className="w-full text-lg"
						onClick={handleExecuteQuery}
						disabled={isLoading}
					>
						{isLoading ? "Executing..." : "Execute Query"}
					</Button>

					{/* Results */}
					<div className="mt-8">
						<h3 className="text-lg font-semibold mb-3">Results</h3>
						{results.length > 0 ? (
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											{results[0] &&
												Object.keys(results[0]).map((col) => (
													<TableHead key={col}>{col}</TableHead>
												))}
										</TableRow>
									</TableHeader>
									<TableBody>
										{results.map((row, idx) => (
											<TableRow key={idx}>
												{Object.entries(row).map(([col, value]) => (
													// @ts-ignore
													<TableCell key={col}>{value}</TableCell>
												))}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						) : (
							<div className="p-4 text-muted-foreground text-center bg-muted rounded-md">
								No results
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export default QueryBuilderPage