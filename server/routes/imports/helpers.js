import sql from 'mssql';
import { poolPromise } from '../../db.js';
import { buildInsertQuery, buildUpdateQuery, buildLogQuery } from '../../utils/queryBuilders.js';

/**
 * Process a single row: Check if it exists and then update or insert.
 * This version allows for dynamic type conversion based on a columnTypes mapping.
 * 
 * @param {Object} pool - The SQL connection pool.
 * @param {string} tableName - The target table name.
 * @param {string|Array} primaryKey - The primary key column name(s).
 * @param {Object} row - The data row from the CSV.
 * @param {Object} [columnTypes={}] - Optional mapping of column names to type strings.
 *                                    Example: { age: 'int', course_fee: 'decimal' }
 */
async function processRow(pool, tableName, primaryKey, row, columnTypes = {}) {
	// Allow primaryKey to be either a single string or an array (for composite keys)
	const keyFields = Array.isArray(primaryKey) ? primaryKey : [primaryKey];

	// Helper: Maps a type string to an mssql type.
	function getSqlType(typeStr) {
		switch (typeStr.toLowerCase()) {
			case 'int':
			case 'integer':
				return sql.Int;
			case 'decimal':
				return sql.Decimal(18, 2); // default precision 18, scale 2
			case 'float':
				return sql.Float;
			case 'bit':
			case 'boolean':
				return sql.Bit;
			default:
				return sql.NVarChar;
		}
	}

	// Helper: Converts a value to the correct type based on the type string.
	function convertValue(value, typeStr) {
		if (value == null) return null;
		switch (typeStr.toLowerCase()) {
			case 'int':
			case 'integer':
				return parseInt(value, 10);
			case 'decimal':
			case 'float':
				return parseFloat(value);
			case 'bit':
			case 'boolean':
				if (typeof value === 'boolean') return value;
				return value.toString().toLowerCase() === 'true' || value === 1 || value === '1';
			default:
				return value.toString().trim();
		}
	}

	// Remove composite key fields from the rest of the data to update
	const data = { ...row };
	keyFields.forEach(key => delete data[key]);

	// Build the check query using composite key conditions
	const conditions = keyFields.map(key => `${key} = @${key}`).join(' AND ');
	const checkQuery = `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${conditions}`;

	const checkRequest = pool.request();
	keyFields.forEach(key => {
		const typeStr = columnTypes[key] || 'nvarchar';
		const type = getSqlType(typeStr);
		checkRequest.input(key, type, convertValue(row[key], typeStr));
	});
	const checkResult = await checkRequest.query(checkQuery);
	const exists = checkResult.recordset[0].count > 0;

	if (exists) {
		// Update the row

		const { query, columns } = buildUpdateQuery(tableName, data, primaryKey);
		const updateRequest = pool.request();

		// Add each key field as an input parameter
		keyFields.forEach(key => {
			const typeStr = columnTypes[key] || 'nvarchar';
			const type = getSqlType(typeStr);
			updateRequest.input(key, type, convertValue(row[key], typeStr));
		});

		// Add the rest of the columns to update
		columns.forEach(col => {
			const typeStr = columnTypes[col] || 'nvarchar';
			const type = getSqlType(typeStr);
			let value = row[col] === null ? null : convertValue(row[col], typeStr);

			updateRequest.input(col, type, value);
		});
		await updateRequest.query(query);
	} else {
		// Insert the row

		const { query, columns } = buildInsertQuery(tableName, row, primaryKey);
		const insertRequest = pool.request();

		// Add the columns to insert
		columns.forEach(col => {
			const typeStr = columnTypes[col] || 'nvarchar';
			const type = getSqlType(typeStr);
			insertRequest.input(col, type, convertValue(row[col], typeStr));
		});
		await insertRequest.query(query);
	}
}

/**
* Log the result of the import operation.
* @param {Object} pool - The SQL connection pool.
* @param {Object} logData - The log details.
*/
async function logImportOperation(pool, logData) {
	const { query: logQuery, columns: logColumns } = buildLogQuery("imports", logData);
	const request = pool.request();

	logColumns.forEach(col => {
		// Set total_records as INT explicitly; others as NVARCHAR
		const type = col === 'total_records' ? sql.Int : sql.NVarChar;
		request.input(col, type, logData[col]);
	});

	await request.query(logQuery);
}

/**
 * Generic import function that can be reused for any table.
 * @param {string} tableName - The target table name.
 * @param {string|Array} primaryKey - The primary key column name(s).
 * @param {Array} mappedData - Array of data rows to import.
 * @param {string} fileName - Name of the file being imported.
 * @param {string} importedBy - Identifier of who performed the import.
 * @returns {Object} - An object with the total records processed and any errors.
 */
async function importData(tableName, primaryKey, mappedData, fileName, importedBy, columnTypes = {}) {
	if (!Array.isArray(mappedData) || mappedData.length === 0) {
		throw new Error('Invalid CSV data.');
	}

	const pool = await poolPromise;
	const totalRecords = mappedData.length;
	const errorDetails = [];

	for (const row of mappedData) {
		try {
			await processRow(pool, tableName, primaryKey, row, columnTypes);
		} catch (error) {
			errorDetails.push({ row, error: error.message });
			console.error(`Error processing row: ${error.message}`);
		}
	}

	// Log the import operation
	const logData = {
		entity_type: tableName,
		file_name: fileName || 'Unknown File',
		import_status: 'Completed',
		imported_by: importedBy || 'System',
		total_records: parseInt(totalRecords, 10),
		error_details: errorDetails.length > 0 ? JSON.stringify(errorDetails) : null
	};

	await logImportOperation(pool, logData);

	return { totalRecords, errorDetails };
}

// Helper function to convert DDMMYYYY to YYYY-MM-DD
function convertDateDDMMYYYY(dateStr) {
	if (!dateStr || dateStr.length !== 8) return null; // Ensure valid format
	const day = dateStr.substring(0, 2);
	const month = dateStr.substring(2, 4);
	const year = dateStr.substring(4, 8);
	return `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
}

// Helper function to convert MMDDYYYY to YYYY-MM-DD
function convertDateMMDDYYYY(dateStr) {
	if (!dateStr || dateStr.length !== 8) return null; // Ensure valid format
	const month = dateStr.substring(0, 2);
	const day = dateStr.substring(2, 4);
	const year = dateStr.substring(4, 8);
	return `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
}

export { importData, convertDateDDMMYYYY, convertDateMMDDYYYY };