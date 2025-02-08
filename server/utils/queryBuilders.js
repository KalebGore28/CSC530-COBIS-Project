import isFalsy from './isFalsy.js';

const buildInsertQuery = (tableName, data, primaryKey) => {
    const insertColumns = [];
    const insertValues = [];

    Object.entries(data).forEach(([key, value]) => {
        // Ensure the primary key is ALWAYS included
        if (!isFalsy(value) || key === primaryKey) {  
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
	const updateFields = [];

	Object.entries(data).forEach(([key, value]) => {
		if (!isFalsy(value) && key !== primaryKey) { // Ignore primary key and falsy values
			updateFields.push(`${key} = @${key}`);
		}
	});

	if (updateFields.length === 0) {
		throw new Error("No valid fields provided for UPDATE.");
	}

	return {
		query: `UPDATE ${tableName} SET ${updateFields.join(', ')} WHERE ${primaryKey} = @${primaryKey}`,
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