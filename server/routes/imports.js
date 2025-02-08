import express from 'express';
import sql from 'mssql';
import { poolPromise } from '../db.js';
import { buildInsertQuery, buildUpdateQuery, buildLogQuery } from '../utils/queryBuilders.js';

const router = express.Router();

/**
 * Process a single row: Check if it exists and then update or insert.
 * @param {Object} pool - The SQL connection pool.
 * @param {string} tableName - The target table name.
 * @param {string} primaryKey - The primary key column name.
 * @param {Object} row - The data row from the CSV.
 */
async function processRow(pool, tableName, primaryKey, row) {
  const primaryKeyValue = row[primaryKey];
  const { [primaryKey]: _, ...data } = row; // Remove primary key from data

  // Check if the row already exists
  const checkQuery = `SELECT COUNT(*) AS count FROM ${tableName} WHERE ${primaryKey} = @${primaryKey}`;
  const checkResult = await pool.request()
    .input(primaryKey, sql.NVarChar, primaryKeyValue)
    .query(checkQuery);

  const exists = checkResult.recordset[0].count > 0;

  if (exists) {
    // Build and execute the update query
    const { query, columns } = buildUpdateQuery(tableName, data, primaryKey);
    const request = pool.request().input(primaryKey, sql.NVarChar, primaryKeyValue);
    columns.forEach(col =>
      request.input(col, sql.NVarChar, data[col])
    );
    await request.query(query);
  } else {
    // Build and execute the insert query
    const { query, columns } = buildInsertQuery(tableName, row, primaryKey);
    const request = pool.request();
    columns.forEach(col => {
      let value = row[col]?.toString().trim() || null;
      request.input(col, sql.NVarChar, value);
  });
    await request.query(query);
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
 * @param {string} primaryKey - The primary key column name.
 * @param {Array} mappedData - Array of data rows to import.
 * @param {string} fileName - Name of the file being imported.
 * @param {string} importedBy - Identifier of who performed the import.
 * @returns {Object} - An object with the total records processed and any errors.
 */
async function importData(tableName, primaryKey, mappedData, fileName, importedBy) {
  if (!Array.isArray(mappedData) || mappedData.length === 0) {
    throw new Error('Invalid CSV data.');
  }

  const pool = await poolPromise;
  const totalRecords = mappedData.length;
  const errorDetails = [];

  for (const row of mappedData) {
    try {
      await processRow(pool, tableName, primaryKey, row);
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

// Endpoint: Import student_types data
router.post('/student_types', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;
    const result = await importData('student_types', 'code', mappedData, fileName, importedBy);
    res.json({
      message: 'Student types imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing student type data: ${error.message}`);
    res.status(500).json({ error: 'Error importing student type data.' });
  }
});

// Endpoint: Import college_codes data
router.post('/college_codes', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;
    const result = await importData('college_codes', 'code', mappedData, fileName, importedBy);
    res.json({
      message: 'College codes imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing college codes data: ${error.message}`);
    res.status(500).json({ error: 'Error importing college codes data.' });
  }
});

// Endpoint: Import colleges data
router.post('/colleges', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;
    const result = await importData('colleges', 'code', mappedData, fileName, importedBy);
    res.json({
      message: 'Colleges imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing colleges data: ${error.message}`);
    res.status(500).json({ error: 'Error importing colleges data.' });
  }
});

// Endpoint: Import nations data
router.post('/nations', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;
    const result = await importData('nations', 'code', mappedData, fileName, importedBy);
    res.json({
      message: 'Nations imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing nations data: ${error.message}`);
    res.status(500).json({ error: 'Error importing nations data.' });
  }
});

// Endpoint: Import part_of_term data
router.post('/part_of_term', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;
    const result = await importData('part_of_term', 'code', mappedData, fileName, importedBy);
    res.json({
      message: 'Part of term imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing part of term data: ${error.message}`);
    res.status(500).json({ error: 'Error importing part of term data.' });
  }
});

// Endpoint: Import academic_standing data
router.post('/academic_standing', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;
    const result = await importData('academic_standing', 'code', mappedData, fileName, importedBy);
    res.json({
      message: 'Academic standing imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing academic standing data: ${error.message}`);
    res.status(500).json({ error: 'Error importing academic standing data.' });
  }
});

// Endpoint: Import admit_codes data
router.post('/admit_codes', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;
    const result = await importData('admit_codes', 'code', mappedData, fileName, importedBy);
    res.json({
      message: 'Admit codes imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing admit codes data: ${error.message}`);
    res.status(500).json({ error: 'Error importing admit codes data.' });
  }
});

// Endpoint: Import registration_status data
router.post('/registration_status', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;
    const result = await importData('registration_status', 'code', mappedData, fileName, importedBy);
    res.json({
      message: 'Registration status imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing registration status data: ${error.message}`);
    res.status(500).json({ error: 'Error importing registration status data.' });
  }
});

// Endpoint: Import instructional_methods data
router.post('/instructional_methods', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;
    const result = await importData('instructional_methods', 'code', mappedData, fileName, importedBy);
    res.json({
      message: 'Instructional methods imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing instructional methods data: ${error.message}`);
    res.status(500).json({ error: 'Error importing instructional methods data.' });
  }
});


export default router;