import isFalsy from './isFalsy.js';

// Adjusted check: only skip if value is undefined, null, or an empty string.
const buildInsertQuery = (tableName, data, primaryKey) => {
	// Convert primaryKey to an array for composite key support.
	const keyFields = Array.isArray(primaryKey) ? primaryKey : [primaryKey];
	const insertColumns = [];
	const insertValues = [];

	Object.entries(data).forEach(([key, value]) => {
		// Always include the key fields, and for non-key fields, only skip if value is undefined, null, or an empty string.
		if ((value !== undefined && value !== null && value !== '') || keyFields.includes(key)) {
			insertColumns.push(key);
			insertValues.push(`@${key}`);
		}
	});

	if (insertColumns.length === 0) {
		throw new Error("No valid fields provided for INSERT.");
	}

	return {
		query: `INSERT INTO ${tableName} (${insertColumns.join(', ')}) VALUES (${insertValues.join(', ')})`,
		columns: insertColumns
	};
};

const buildUpdateQuery = (tableName, data, primaryKey) => {
	// Ensure primaryKey is an array so that we can handle composite keys.
	const keyFields = Array.isArray(primaryKey) ? primaryKey : [primaryKey];
	const updateFields = [];

	// Iterate over data fields, excluding any that are part of the composite key.
	Object.entries(data).forEach(([key, value]) => {
		if (!isFalsy(value) && !keyFields.includes(key)) { // Ignore primary key fields and falsy values
			updateFields.push(`${key} = @${key}`);
		}
	});

	if (updateFields.length === 0) {
		throw new Error("No valid fields provided for UPDATE.");
	}

	// Build the WHERE clause for the composite key by joining each key with 'AND'
	const whereClause = keyFields.map(key => `${key} = @${key}`).join(' AND ');

	return {
		query: `UPDATE ${tableName} SET ${updateFields.join(', ')} WHERE ${whereClause}`,
		columns: updateFields.map(field => field.split(' = ')[0])
	};
};

const buildLogQuery = (tableName, data) => {
	const insertColumns = [];
	const insertValues = [];

	// Required Fields (MUST be provided)
	const requiredFields = ["entity_type", "file_name", "import_status", "imported_by", "total_records"];

	requiredFields.forEach((key) => {
		if (!data[key]) {
			throw new Error(`Missing required field: ${key}`);
		}
		insertColumns.push(key);
		insertValues.push(`@${key}`);
	});

	// Handle Optional Fields
	Object.entries(data).forEach(([key, value]) => {
		if (!isFalsy(value) && !requiredFields.includes(key)) {
			insertColumns.push(key);
			insertValues.push(`@${key}`);
		}
	});

	// Exclude `import_date` so SQL Server defaults to `SYSDATETIME()`
	return {
		query: `INSERT INTO ${tableName} (${insertColumns.join(', ')}) VALUES (${insertValues.join(', ')})`,
		columns: insertColumns
	};
};

export {
	buildInsertQuery,
	buildUpdateQuery,
	buildLogQuery
};