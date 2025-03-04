import React, { useEffect, useState } from 'react';
import axios from 'axios';

const allowedOperators = ['=', '!=', '>', '<', 'LIKE'];

const QueryBuilder = () => {
	const [metadata, setMetadata] = useState([]);
	const [selectedTable, setSelectedTable] = useState('');
	const [selectedColumns, setSelectedColumns] = useState([]);
	const [filters, setFilters] = useState([]);
	const [joins, setJoins] = useState([]);
	const [sort, setSort] = useState({ column: '', direction: 'asc' });
	const [pagination, setPagination] = useState({ limit: 10, offset: 0 });
	const [results, setResults] = useState([]);
	const [error, setError] = useState('');

	// Fetch metadata on mount
	useEffect(() => {
		axios.get('/api/custom-query/metadata')
			.then(res => {
				setMetadata(res.data.metadata);
			})
			.catch(err => {
				console.error(err);
				setError('Failed to load metadata');
			});
	}, []);

	// When the user selects a table, reset columns (but do NOT force joins).
	useEffect(() => {
		if (selectedTable) {
			const tableMeta = metadata.find(m => m.table === selectedTable);
			if (tableMeta) {
				// Default to selecting all columns (or none, if you prefer).
				setSelectedColumns(tableMeta.columns);
				// Clear joins or keep them as is. Let the user manually add them.
				setJoins([]);
			}
		}
	}, [selectedTable, metadata]);

	// Adds a new join definition (based on an available relationship).
	// For example, if the user picks "student_courses" from a dropdown of possible relationships.
	// Function to handle adding joins with unique checks
	const handleAddJoin = (table, condition) => {
		// Instead of expanding every key, build one join object
		console.log("Joins:", table, condition);
		const newJoin = {
			table,
			on: condition // e.g. { term: "term", year: "year" }
		};

		// Check if we already have the same table+on combination
		const isDuplicate = joins.some(
			join => join.table === table && JSON.stringify(join.on) === JSON.stringify(condition)
		);

		if (!isDuplicate) {
			setJoins([...joins, newJoin]);
		}
	};

	// Function to remove a join by index
	const handleRemoveJoin = (index) => {
		const newJoins = joins.filter((_, i) => i !== index);
		setJoins(newJoins);
	};

	const handleExecuteQuery = async () => {
		const queryDef = {
			table: selectedTable,
			select: selectedColumns,
			filters,
			joins,
			pagination
		};

		// Only include sort if a valid column has been specified
		if (sort.column && sort.column.trim() !== '') {
			query.sort = sort;
		}

		try {
			const res = await axios.post('/api/custom-query/execute', {
				queryDef,
				role: "Faculty"
			});
			console.log(res.data.results);
			setResults(res.data.results);
			setError('');
		} catch (err) {
			console.error(err);
			setError(err.response?.data?.error || "Query execution failed");
		}
	};

	return (
		<div className="p-4 max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold mb-4">Custom Query Builder</h1>
			{error && <div className="text-red-500 mb-4">{error}</div>}

			{/* Table Selector */}
			<div className="mb-4">
				<label className="block font-medium mb-1">Table:</label>
				<select
					className="border rounded p-2 w-full"
					value={selectedTable}
					onChange={(e) => setSelectedTable(e.target.value)}
				>
					<option value="">Select table</option>
					{metadata.map(m => (
						<option key={m.table} value={m.table}>{m.table}</option>
					))}
				</select>
			</div>

			{/* Column Selector */}
			{selectedTable && (
				<div className="mb-4">
					<label className="block font-medium mb-1">
						Columns (comma-separated):
					</label>
					<input
						className="border rounded p-2 w-full"
						type="text"
						value={selectedColumns.join(', ')}
						onChange={(e) =>
							setSelectedColumns(e.target.value.split(',').map(s => s.trim()))
						}
					/>
					<small className="text-gray-500">
						Available:&nbsp;
						{metadata.find(m => m.table === selectedTable)?.columns.join(', ')}
					</small>
				</div>
			)}

			{/* Filters Builder */}
			<div className="mb-4">
				<h3 className="font-bold mb-2">Filters</h3>
				{filters.map((f, index) => (
					<div key={index} className="flex space-x-2 mb-2">
						<input
							className="border rounded p-2 flex-1"
							type="text"
							placeholder="Column"
							value={f.column}
							onChange={(e) => {
								const newFilters = [...filters];
								newFilters[index].column = e.target.value;
								setFilters(newFilters);
							}}
						/>
						<select
							className="border rounded p-2"
							value={f.operator}
							onChange={(e) => {
								const newFilters = [...filters];
								newFilters[index].operator = e.target.value;
								setFilters(newFilters);
							}}
						>
							{allowedOperators.map(op => (
								<option key={op} value={op}>{op}</option>
							))}
						</select>
						<input
							className="border rounded p-2 flex-1"
							type="text"
							placeholder="Value"
							value={f.value}
							onChange={(e) => {
								const newFilters = [...filters];
								newFilters[index].value = e.target.value;
								setFilters(newFilters);
							}}
						/>
						<button
							className="bg-red-500 text-white px-2 py-1 rounded"
							onClick={() => {
								const newFilters = filters.filter((_, i) => i !== index);
								setFilters(newFilters);
							}}
						>
							Remove
						</button>
					</div>
				))}
				<button
					className="bg-blue-500 text-white px-3 py-1 rounded"
					onClick={() => setFilters([...filters, { column: '', operator: '=', value: '' }])}
				>
					Add Filter
				</button>
			</div>

			{/* Show available relationships, let user optionally add them */}
			{selectedTable && (
				<div className="mb-4">
					<h3 className="font-bold mb-2">Available Relationships</h3>
					{(metadata.find(m => m.table === selectedTable)?.relationships || []).map((rel, index) => (
						<div key={index} className="p-2 border rounded mb-2">
							<strong>Join with:</strong> {rel.relatedTable}<br />
							<strong>On:</strong>{' '}
							<span className="text-gray-600">{JSON.stringify(rel.on)}</span>
							<button
								className="ml-2 bg-blue-400 text-white px-2 py-1 rounded"
								onClick={() => {
									console.log("Adding join", rel.relatedTable, rel.on);
									handleAddJoin(rel.relatedTable, rel.on)
								}}
							>
								Add Join
							</button>
						</div>
					))}
				</div>
			)}

			{/* Show relationships for each joined table */}
			{joins.map((join, jIndex) => {
				const joinedMeta = metadata.find(m => m.table === join.table);
				if (!joinedMeta) return null;
				return (
					<div key={jIndex} className="mb-4">
						<h4 className="font-bold mb-2">More Relationships for {join.table}</h4>
						{(joinedMeta.relationships || []).map((rel, rIndex) => (
							<div key={rIndex} className="p-2 border rounded mb-2">
								<strong>Join with:</strong> {rel.relatedTable}
								<br />
								<strong>Columns:</strong>{' '}
								{Object.entries(rel.on).map(([leftKey, rightKey]) => (
									<div key={leftKey}>
										{`${join.table}.${leftKey} = ${rel.relatedTable}.${rightKey}`}
									</div>
								))}
								<button
									className="ml-2 bg-blue-400 text-white px-2 py-1 rounded"
									onClick={() => handleAddJoin(rel.relatedTable, rel.on)}
								>
									Add Join
								</button>
							</div>
						))}
					</div>
				);
			})}

			{/* Join Editor (the user can remove or see the merges) */}
			{joins.length > 0 && (
				<div className="mb-4">
					<h3 className="font-bold mb-2">Selected Joins</h3>
					{joins.map((join, idx) => (
						<div key={idx} className="p-2 border rounded mb-2 flex items-center justify-between">
							<div>
								<strong>Table:</strong> {join.table}<br />
								<strong>On:</strong>{' '}
								<span className="text-gray-600">{JSON.stringify(join.on)}</span>
							</div>
							<button
								className="bg-red-500 text-white px-2 py-1 rounded"
								onClick={() => handleRemoveJoin(idx)}
							>
								Remove Join
							</button>
						</div>
					))}
				</div>
			)}

			{/* Sorting */}
			<div className="mb-4">
				<h3 className="font-bold mb-2">Sort</h3>
				<input
					className="border rounded p-2 w-full mb-2"
					type="text"
					placeholder="Sort Column (e.g., student_courses.mnumber)"
					value={sort.column}
					onChange={(e) => setSort({ ...sort, column: e.target.value })}
				/>
				<select
					className="border rounded p-2 w-full"
					value={sort.direction}
					onChange={(e) => setSort({ ...sort, direction: e.target.value })}
				>
					<option value="asc">asc</option>
					<option value="desc">desc</option>
				</select>
			</div>

			{/* Pagination */}
			<div className="mb-4">
				<h3 className="font-bold mb-2">Pagination</h3>
				<input
					className="border rounded p-2 w-full mb-2"
					type="number"
					placeholder="Limit"
					value={pagination.limit}
					onChange={(e) => setPagination({ ...pagination, limit: Number(e.target.value) })}
				/>
				<input
					className="border rounded p-2 w-full"
					type="number"
					placeholder="Offset"
					value={pagination.offset}
					onChange={(e) => setPagination({ ...pagination, offset: Number(e.target.value) })}
				/>
			</div>

			<button
				className="bg-green-500 text-white px-4 py-2 rounded"
				onClick={handleExecuteQuery}
			>
				Execute Query
			</button>

			<h3 className="mt-6 font-bold">Results</h3>
			{results.length > 0 ? (
				<table className="mt-2 border-collapse border w-full">
					<thead>
						<tr>
							{results[0] && Object.keys(results[0]).map(col => (
								<th key={col} className="border p-2 bg-gray-200">{col}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{results.map((row, idx) => (
							<tr key={idx}>
								{Object.entries(row).map(([col, value]) => (
									<td key={col} className="border p-2">{value}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<div className="mt-4">No results</div>
			)}
		</div>
	);
};

export default QueryBuilder;