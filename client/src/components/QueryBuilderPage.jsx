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
	const [isLoading, setIsLoading] = useState(false);
	const [isRelationshipsOpen, setIsRelationshipsOpen] = useState(true);

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

	useEffect(() => {
		if (selectedTable) {
			const tableMeta = metadata.find(m => m.table === selectedTable);
			if (tableMeta) {
				setSelectedColumns(tableMeta.columns); // Default to all main table columns
				setJoins([]);
			}
		}
	}, [selectedTable, metadata]);

	const handleAddJoin = (table, condition) => {
		const newJoin = { table, on: condition };
		const isDuplicate = joins.some(
			join => join.table === table && JSON.stringify(join.on) === JSON.stringify(condition)
		);
		if (!isDuplicate) {
			setJoins([...joins, newJoin]);
		}
	};

	const handleRemoveJoin = (index) => {
		const joinToRemove = joins[index];
		const newJoins = joins.filter((_, i) => i !== index);

		// Check for dependent joins
		const dependentJoins = newJoins.filter(join =>
			Object.keys(join.on).some(leftCol =>
				leftCol.startsWith(joinToRemove.table + '.')
			)
		);

		// Remove dependent joins
		if (dependentJoins.length > 0) {
			const dependentTables = dependentJoins.map(j => j.table);
			setJoins(newJoins.filter(join => !dependentTables.includes(join.table)));
		} else {
			setJoins(newJoins);
		}

		// Update selectedColumns to remove columns from removed tables
		const removedTables = [joinToRemove.table, ...dependentJoins.map(j => j.table)];
		setSelectedColumns(selectedColumns.filter(col =>
			!removedTables.some(table => col.startsWith(table + '.'))
		));
	};

	const handleExecuteQuery = async () => {
		if (!selectedTable) {
			setError('Please select a table');
			return;
		}
		if (selectedColumns.length === 0) {
			setError('Please select at least one column');
			return;
		}

		const queryDef = {
			table: selectedTable,
			select: selectedColumns,
			filters,
			joins,
			pagination
		};

		if (sort.column && sort.column.trim() !== '') {
			queryDef.sort = sort;
		}

		setIsLoading(true);
		try {
			const res = await axios.post('/api/custom-query/execute', {
				queryDef,
				role: "Faculty"
			});
			setResults(res.data.results);
			setError('');
		} catch (err) {
			setError(err.response?.data?.error || "Query execution failed");
		} finally {
			setIsLoading(false);
		}
	};

	const getAvailableRelationships = () => {
		if (!selectedTable) return [];

		const mainTableMeta = metadata.find(m => m.table === selectedTable);
		let availableRelationships = mainTableMeta ? [...(mainTableMeta.relationships || [])] : [];

		joins.forEach(join => {
			const joinedTableMeta = metadata.find(m => m.table === join.table);
			if (joinedTableMeta && joinedTableMeta.relationships) {
				availableRelationships = availableRelationships.concat(joinedTableMeta.relationships);
			}
		});

		return availableRelationships.filter(rel =>
			!joins.some(join =>
				join.table === rel.relatedTable &&
				JSON.stringify(join.on) === JSON.stringify(rel.on)
			)
		);
	};

	// New helper function to get all available columns
	const getAvailableColumns = () => {
		if (!selectedTable) return [];

		const mainTableMeta = metadata.find(m => m.table === selectedTable);
		let availableColumns = mainTableMeta ? mainTableMeta.columns.map(col => `${selectedTable}.${col}`) : [];

		joins.forEach(join => {
			const joinedTableMeta = metadata.find(m => m.table === join.table);
			if (joinedTableMeta && joinedTableMeta.columns) {
				const joinedColumns = joinedTableMeta.columns.map(col => `${join.table}.${col}`);
				availableColumns = [...availableColumns, ...joinedColumns];
			}
		});

		// Remove duplicates (in case of overlapping column names, though prefixes should prevent this)
		return [...new Set(availableColumns)];
	};

	const handleColumnChange = (e) => {
		const options = e.target.options;
		const selected = [];
		for (let i = 0; i < options.length; i++) {
			if (options[i].selected) {
				selected.push(options[i].value);
			}
		}
		setSelectedColumns(selected);
	};

	return (
		<div className="min-h-screen bg-gray-100 py-8">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-white shadow-lg rounded-lg p-6">
					<h1 className="text-3xl font-bold text-gray-900 mb-6">Custom Query Builder</h1>

					{error && (
						<div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
							{error}
						</div>
					)}

					{/* Table Selector */}
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">Table</label>
						<select
							className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
						<div className="mb-6">
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Select Columns
							</label>
							<select
								multiple
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-40"
								value={selectedColumns}
								onChange={handleColumnChange}
							>
								{getAvailableColumns().map(col => (
									<option key={col} value={col}>
										{col}
									</option>
								))}
							</select>
							<p className="mt-1 text-sm text-gray-500">
								Hold Ctrl (or Cmd) to select multiple columns
							</p>
						</div>
					)}

					{/* Filters Builder */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-3">Filters</h3>
						{filters.map((f, index) => (
							<div key={index} className="flex items-center space-x-3 mb-3">
								<input
									className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
									className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
									className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
									className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
							className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							onClick={() => setFilters([...filters, { column: '', operator: '=', value: '' }])}
						>
							Add Filter
						</button>
					</div>

					{/* Available Relationships */}
					{selectedTable && (
						<div className="mb-6">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold text-gray-900 mb-3">Available Relationships</h3>
								<button
									className="text-blue-600 hover:text-blue-800 mb-3"
									onClick={() => setIsRelationshipsOpen(!isRelationshipsOpen)}
								>
									{isRelationshipsOpen ? 'Hide' : 'Show'}
								</button>
							</div>
							{isRelationshipsOpen && (
								<div>
									{getAvailableRelationships().map((rel, index) => (
										<div key={index} className="p-4 bg-gray-50 rounded-lg mb-3 flex justify-between items-center">
											<div>
												<p><strong>Join with:</strong> {rel.relatedTable}</p>
												<div className="text-sm text-gray-600 mt-1">
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
											<button
												className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
												onClick={() => handleAddJoin(rel.relatedTable, rel.on)}
											>
												Add Join
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{/* Selected Joins */}
					{joins.length > 0 && (
						<div className="mb-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Joins</h3>
							{joins.map((join, idx) => (
								<div key={idx} className="p-4 bg-gray-50 rounded-lg mb-3 flex justify-between items-center">
									<div>
										<p><strong>Table:</strong> {join.table}</p>
										<div className="text-sm text-gray-600 mt-1">
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
									<button
										className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
										onClick={() => handleRemoveJoin(idx)}
									>
										Remove
									</button>
								</div>
							))}
						</div>
					)}

					{/* Sorting */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-3">Sort</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<input
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								type="text"
								placeholder="Sort Column (e.g., student_courses.mnumber)"
								value={sort.column}
								onChange={(e) => setSort({ ...sort, column: e.target.value })}
							/>
							<select
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								value={sort.direction}
								onChange={(e) => setSort({ ...sort, direction: e.target.value })}
							>
								<option value="asc">Ascending</option>
								<option value="desc">Descending</option>
							</select>
						</div>
					</div>

					{/* Pagination */}
					<div className="mb-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-3">Pagination</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<input
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								type="number"
								placeholder="Limit"
								value={pagination.limit}
								onChange={(e) => setPagination({ ...pagination, limit: Number(e.target.value) })}
							/>
							<input
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								type="number"
								placeholder="Offset"
								value={pagination.offset}
								onChange={(e) => setPagination({ ...pagination, offset: Number(e.target.value) })}
							/>
						</div>
					</div>

					<button
						className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-medium disabled:bg-gray-400"
						onClick={handleExecuteQuery}
						disabled={isLoading}
					>
						{isLoading ? 'Executing...' : 'Execute Query'}
					</button>

					{/* Results */}
					<div className="mt-8">
						<h3 className="text-lg font-semibold text-gray-900 mb-3">Results</h3>
						{results.length > 0 ? (
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											{results[0] && Object.keys(results[0]).map(col => (
												<th
													key={col}
													className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
												>
													{col}
												</th>
											))}
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{results.map((row, idx) => (
											<tr key={idx} className="hover:bg-gray-50">
												{Object.entries(row).map(([col, value]) => (
													<td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
														{value}
													</td>
												))}
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : (
							<div className="p-4 text-gray-500 text-center bg-gray-50 rounded-lg">
								No results
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default QueryBuilder;