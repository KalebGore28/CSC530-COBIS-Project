import express from 'express';
import sql from 'mssql';
import { poolPromise } from '../db.js';
import { normalizeHeadersMiddleware } from '../middleware/normalizeHeaders.js';
import { buildInsertQuery, buildUpdateQuery, buildLogQuery } from '../utils/queryBuilders.js';

const router = express.Router();

// Middleware to normalize column headers to lowercase
router.use(normalizeHeadersMiddleware);

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

// Endpoint: Import courses data
router.post('/courses', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;

    // Transform the CSV data to match the database schema
    const transformedData = mappedData.map(row => {

      const courseMatch = row.course.match(/^([A-Za-z]+)(\d+)([A-Za-z]*)$/);

      if (!courseMatch) {
        console.warn(`⚠ Invalid COURSE format: ${row.course}`);
        return null; // Skip invalid rows
      }

      return {
        subject: courseMatch[1],          // Extracts the subject (e.g., "ACC")
        course_number: parseInt(courseMatch[2], 10),  // Extracts course number (e.g., 200)
        course_suffix: courseMatch[3] || '', // Extracts suffix if present (e.g., "T" from "100T")
        title: row.crsetitle.trim(),      // Map to `title`
        hours: parseInt(row.crhrs, 10) || 0, // Map to `hours` (default 0 if null)
        course_fee: parseFloat(row.course_fee) || 0, // Map to `course_fee`, default 0
        web_fee: parseFloat(row.web_fee) || 0,  // Map to `web_fee`, default 0
      };
    }).filter(row => row !== null); // Remove invalid rows

    const columnTypes = {
      subject: 'nvarchar',
      course_number: 'int',
      course_suffix: 'nvarchar',
      title: 'nvarchar',
      hours: 'int',
      course_fee: 'decimal',
      web_fee: 'decimal',
    };

    const result = await importData('courses', ['subject', 'course_number', 'course_suffix'], transformedData, fileName, importedBy, columnTypes);

    res.json({
      message: 'Courses imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing courses data: ${error.message}`);
    res.status(500).json({ error: 'Error importing courses data.' });
  }
});

// Endpoint: Import departments data
router.post('/departments', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;

    // Transform the CSV data to match the database schema
    const transformedData = mappedData.map(row => {

      // Split the prefixes into an array
      const prefixes = row.prefixes.split(',').map(p => p.trim()).filter(p => p.length > 0);

      return {
        code: row.code,
        description: row.description,
        prefixes: row.prefixes === 'NULL' ? null : prefixes.join(','),
        canvas_id: parseInt(row.canvas_id, 10) || null,
        college: row.college === 'NULL' ? "UNASSIGNED" : row.college
      };
    });

    const columnTypes = {
      code: 'nvarchar',
      description: 'nvarchar',
      prefixes: 'nvarchar',
      canvas_id: 'int',
      college: 'nvarchar'
    };

    const result = await importData('departments', 'code', transformedData, fileName, importedBy, columnTypes);
    res.json({
      message: 'Departments imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing departments data: ${error.message}`);
    res.status(500).json({ error: 'Error importing departments data.' });
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

// Endpoint: Import programs data
router.post('/programs', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;

    // Transform the CSV data to match the database schema
    const transformedData = mappedData.map(row => {
      return {
        code: row.code,
        description: row.description,
        cip_code: row.cip_code === 'NULL' ? null : row.cip_code,
        is_major: row.is_major === '1',
        is_minor: row.is_minor === '1',
        has_concentration: row.has_concentration === '1',
        is_discontinued: row.is_discontinued === '1',
        is_aacsb: row.is_aacsb === '1',
        department: row.department === 'NULL' ? 'UNASSIGNED' : row.department,
        college: row.college === 'NULL' ? 'UNASSIGNED' : row.college
      };
    });

    // console.log(transformedData);

    const result = await importData('programs', 'code', transformedData, fileName, importedBy);
    res.json({
      message: 'Programs imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing programs data: ${error.message}`);
    res.status(500).json({ error: 'Error importing programs data.' });
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

// Endpoint: Import overrides data
router.post('/overrides', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;

    // Transform the CSV data to match the database schema
    const transformedData = mappedData.map(row => {

      const termMatch = row.term.match(/^(\d{4})(\d{2})$/);

      if (!termMatch) {
        console.warn(`⚠ Invalid TERM format: ${row.term}`);
        return null; // Skip invalid rows
      }

      // Separate optional course suffix from course number
      const courseMatch = row.crsenumb.match(/^(\d+)([A-Za-z]*)$/);

      return {
        mnumber: row.mnumber,
        term: termMatch[2],
        year: parseInt(termMatch[1]),
        crn: row.crn,
        subject: row.subj,
        course_number: parseInt(courseMatch[1], 10),
        course_suffix: courseMatch[2] || '',
        section: row.section,
        override_type: row.override,
        granted_by: row.userid,
        override_date: convertDateDDMMYYYY(row.activitydate)
      };
    }).filter(row => row !== null); // Remove invalid rows

    // Define column types for SQL binding
    const columnTypes = {
      mnumber: 'nvarchar',
      term: 'nvarchar',
      year: 'int',
      crn: 'nvarchar',
      subject: 'nvarchar',
      course_number: 'int',
      course_suffix: 'nvarchar',
      section: 'nvarchar',
      override_type: 'nvarchar',
      granted_by: 'nvarchar',
      override_date: 'datetime'
    };


    const result = await importData('overrides', 'mnumber', transformedData, fileName, importedBy, columnTypes);
    res.json({
      message: 'Overrides imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing override data: ${error.message}`);
    res.status(500).json({ error: 'Error importing override data.' });
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

// Endpoint: Import previous_colleges data
router.post('/previous_colleges', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;

    // Transform the CSV data to match the database schema
    const transformedData = mappedData.map(row => {
      return {
        mnumber: row.mnumber,
        college_code: row.collegecode,
        college_description: row.collegedesc,
        degree: row.degree,
        date: convertDateDDMMYYYY(row.degreedate),
      };
    });

    const columnTypes = {
      mnumber: 'nvarchar',
      college_code: 'nvarchar',
      college_description: 'nvarchar',
      degree: 'nvarchar',
      date: 'datetime',
    };

    const result = await importData('previous_colleges', ['mnumber', 'college_code'], transformedData, fileName, importedBy, columnTypes);
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

// Endpoint: Import course_prefixes data
router.post('/subject_prefixes', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;

    // Transform the CSV data to match the database schema
    const transformedData = mappedData.map(row => {
      return {
        college: row.college,
        department: row.department,
        prefix: row.prefix,
      };
    });

    const result = await importData('subject_prefixes', ['college', 'department', 'prefix'], transformedData, fileName, importedBy);
    res.json({
      message: 'Course prefixes imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing course prefixes data: ${error.message}`);
    res.status(500).json({ error: 'Error importing course prefixes data.' });
  }
});

// Endpoint: Import student_programs data
router.post('/student_courses', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;

    // Transform the CSV data to match the database schema
    const transformedData = mappedData.map(row => {
      const termMatch = row.term.match(/^(\d{4})(\d{2})$/);

      if (!termMatch) {
        console.warn(`⚠ Invalid TERM format: ${row.term}`);
        return null; // Skip invalid rows
      }

      // Separate optional course suffix from course number
      const courseMatch = row.crsenumb.match(/^(\d+)([A-Za-z]*)$/);

      return {
        mnumber: row.mnumber,
        term: termMatch[2],
        year: parseInt(termMatch[1], 10),
        part_of_term: row.partofterm,
        crn: row.crn,
        subject: row.crsesubj,
        course_number: parseInt(courseMatch[1], 10),
        course_suffix: courseMatch[2] || '',
        section: row.section,
        hours: parseFloat(row.crhrs) || 0,
        level: row.levlcode,
        registration_status: row.rstscode,
        instructional_method: row.insmcode,
        last_attendance: row.lastattend,
        midterm_grade: row.midgrade,
        final_grade: row.fingrade,
      };
    }).filter(row => row !== null); // Remove invalid rows

    const columnTypes = {
      mnumber: 'nvarchar',
      term: 'nvarchar',
      year: 'int',
      crn: 'nvarchar',
      subject: 'nvarchar',
      course_number: 'int',
      course_suffix: 'nvarchar',
      section: 'nvarchar',
      hours: 'decimal',
      level: 'nvarchar',
      registration_status: 'nvarchar',
      instructional_method: 'nvarchar',
      last_attendance: 'datetime',
      midterm_grade: 'nvarchar',
      final_grade: 'nvarchar',
    };

    const result = await importData('student_courses', ['mnumber', 'term', 'year', 'crn'], transformedData, fileName, importedBy, columnTypes);
    res.json({
      message: 'Student Courses imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing Student Courses data: ${error.message}`);
    res.status(500).json({ error: 'Error importing Student Courses data.' });
  }
});

// Endpoint: Import terms data
router.post('/terms', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;
    const result = await importData('terms', 'code', mappedData, fileName, importedBy);
    res.json({
      message: 'Terms imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing terms data: ${error.message}`);
    res.status(500).json({ error: 'Error importing terms data.' });
  }
});

// Endpoint: Import test_scores data
router.post('/test_scores', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;

    // Transform the CSV data to match the database schema
    const transformedData = mappedData.map(row => {
      return {
        mnumber: row.mnumber,
        code: row.testcode,
        description: row.testdesc,
        score: parseFloat(row.testscore) || 0,
        date: convertDateMMDDYYYY(row.testdate),
      };
    });

    const columnTypes = {
      mnumber: 'nvarchar',
      code: 'nvarchar',
      description: 'nvarchar',
      score: 'decimal',
      date: 'datetime',
    };

    const result = await importData('test_scores', ['mnumber', 'code'], transformedData, fileName, importedBy, columnTypes);
    res.json({
      message: 'Test scores imported successfully.',
      totalRecords: result.totalRecords,
      errors: result.errorDetails
    });
  } catch (error) {
    console.error(`Error importing test scores data: ${error.message}`);
    res.status(500).json({ error: 'Error importing test scores data.' });
  }
});

// Endpoint: Import demographics data
router.post('/demographics', async (req, res) => {
  try {
    const { mappedData, fileName, importedBy } = req.body;

    // Break up the date of fields to their respective tables and transform the data
    const studentData = mappedData.map(row => {
      return {
        mnumber: row.mnumber,
        first_name: row.firstname,
        last_name: row.lastname,
        middle_name: row.middlename,
        suffix: row.suffix,
        gender: row.gender,
        birth_date: convertDateMMDDYYYY(row.birthdate),
        citizenship: row.citizen,
        race_code: row.race,
        race_description: row.racedesc,
        residency_code: row.residcode,
        residency_description: row.residdesc,
        age: parseInt(row.age, 10),
        cell_phone: row.cellphone,
      };
    });

    const studentColumnTypes = {
      mnumber: 'nvarchar',
      first_name: 'nvarchar',
      last_name: 'nvarchar',
      middle_name: 'nvarchar',
      suffix: 'nvarchar',
      gender: 'nvarchar',
      birth_date: 'datetime',
      citizenship: 'nvarchar',
      race_code: 'nvarchar',
      race_description: 'nvarchar',
      residency_code: 'nvarchar',
      residency_description: 'nvarchar',
      age: 'int',
      cell_phone: 'nvarchar',
    };

    const result1 = await importData('students', 'mnumber', studentData, fileName, importedBy, studentColumnTypes);

    const studentAddressesData = mappedData.flatMap(row => {
      const addresses = [];

      // If HOMESTREET1 exists, create a 'HOME' address entry
      if (row.homestreet1) {
        addresses.push({
          mnumber: row.mnumber,
          type: 'HOME',
          street1: row.homestreet1,
          street2: row.homestreet2 || null,
          city: row.homecity || null,
          state: row.homestate || null,
          zip: row.homezip || null,
          nation_code: row.homenation || null,
          phone: row.homephone || null
        });
      }

      // If LOCSTREET1 exists, create a 'LOCAL' address entry
      if (row.locstreet1) {
        addresses.push({
          mnumber: row.mnumber,
          type: 'LOCAL',
          street1: row.locstreet1,
          street2: row.locstreet2 || null,
          city: row.loccity || null,
          state: row.locstate || null,
          zip: row.loczip || null,
          nation_code: row.locnation || null,
          phone: row.locphone || null
        });
      }

      return addresses; // This will return either one or two objects per student
    });

    const addressColumnTypes = {
      mnumber: 'nvarchar',
      type: 'nvarchar',
      street1: 'nvarchar',
      street2: 'nvarchar',
      city: 'nvarchar',
      state: 'nvarchar',
      zip: 'nvarchar',
      nation_code: 'nvarchar',
      phone: 'nvarchar',
    };

    const result2 = await importData('student_addresses', ['mnumber', 'type'], studentAddressesData, fileName, importedBy, addressColumnTypes);

    const studentAcademicData = mappedData.map(row => {

      const admitTermMatch = row.admitterm.match(/^(\d{4})(\d{2})$/);

      return {
        mnumber: row.mnumber,
        admit_term: admitTermMatch[2],
        admit_year: parseInt(admitTermMatch[1], 10),
        admit_code: row.admitcode,
        academic_standing: row.acadstanding,
        msu_attempted_hours: parseFloat(row.msuatthours) || 0,
        msu_earned_hours: parseFloat(row.msuearnhours) || 0,
        msu_quality_points: parseFloat(row.msuqp) || 0,
        msu_gpa: parseFloat(row.msugpa) || 0,
        overall_attempted_hours: parseFloat(row.overallatthours) || 0,
        overall_earned_hours: parseFloat(row.overallearnhours) || 0,
        overall_quality_points: parseFloat(row.overqp) || 0,
        overall_gpa: parseFloat(row.overgpa) || 0,
      };
    });

    const academicColumnTypes = {
      mnumber: 'nvarchar',
      admit_term: 'nvarchar',
      admit_year: 'int',
      admit_code: 'nvarchar',
      academic_standing: 'nvarchar',
      msu_attempted_hours: 'decimal',
      msu_earned_hours: 'decimal',
      msu_quality_points: 'decimal',
      msu_gpa: 'decimal',
      overall_attempted_hours: 'decimal',
      overall_earned_hours: 'decimal',
      overall_quality_points: 'decimal',
      overall_gpa: 'decimal',
    };

    const result3 = await importData('student_academic_info', ['mnumber', 'admit_term', 'admit_year'], studentAcademicData, fileName, importedBy, academicColumnTypes);

    const studentProgramsData = mappedData.flatMap(row => {
      const programs = [];

      const termMatch = row.admitterm.match(/^(\d{4})(\d{2})$/);

      // If MAJOR1 exists, create a 'MAJOR' program entry
      if (row.major1) {
        programs.push({
          mnumber: row.mnumber,
          term: termMatch[2],
          year: parseInt(termMatch[1], 10),
          study: row.program,
          type: 'MAJOR',
          level: row.levl,
          program_code: row.major1,
          department: row.major1dept,
          college: row.major1coll,
        });
      }

      // If MAJOR2 exists, create a 'MAJOR' program entry
      if (row.major2) {
        programs.push({
          mnumber: row.mnumber,
          term: termMatch[2],
          year: parseInt(termMatch[1], 10),
          study: row.program,
          type: 'MAJOR',
          level: row.levl,
          program_code: row.major2,
          department: row.major2dept,
          college: row.major2coll,
        });
      }

      // If MINOR1 exists, create a 'MINOR' program entry
      if (row.minor1) {
        programs.push({
          mnumber: row.mnumber,
          term: termMatch[2],
          year: parseInt(termMatch[1], 10),
          study: row.program,
          type: 'MINOR',
          level: row.levl,
          program_code: row.minor1,
          department: row.minor1dept,
          college: row.minor1coll,
        });
      }

      // If MINOR2 exists, create a 'MINOR' program entry
      if (row.minor2) {
        programs.push({
          mnumber: row.mnumber,
          term: termMatch[2],
          year: parseInt(termMatch[1], 10),
          study: row.program,
          type: 'MINOR',
          level: row.levl,
          program_code: row.minor2,
          department: row.minor2dept,
          college: row.minor2coll,
        });
      }

      return programs;
    });

    const programColumnTypes = {
      mnumber: 'nvarchar',
      term: 'nvarchar',
      year: 'int',
      study: 'nvarchar',
      type: 'nvarchar',
      level: 'nvarchar',
      program_code: 'nvarchar',
      department: 'nvarchar',
      college: 'nvarchar',
    };

    const result4 = await importData('student_programs', ['mnumber', 'term', 'year', 'type', 'program_code'], studentProgramsData, fileName, importedBy, programColumnTypes);

    const advisorData = mappedData.map(row => {
      return {
        advisor_id: row.advnumb,
        first_name: row.advfname,
        last_name: row.advlname,
        middle_name: row.advmname,
        suffix: row.advsuffix,
      };
    });

    const advisorColumnTypes = {
      advisor_id: 'nvarchar',
      first_name: 'nvarchar',
      last_name: 'nvarchar',
      middle_name: 'nvarchar',
      suffix: 'nvarchar',
    };

    const result5 = await importData('advisors', 'advisor_id', advisorData, fileName, importedBy, advisorColumnTypes);

    const studentAdvisorData = mappedData.map(row => {

      const termMatch = row.admitterm.match(/^(\d{4})(\d{2})$/);
      return {
        mnumber: row.mnumber,
        term: termMatch[2],
        year: parseInt(termMatch[1], 10),
        advisor_id: row.advnumb,
      };
    });

    const studentAdvisorColumnTypes = {
      mnumber: 'nvarchar',
      term: 'nvarchar',
      year: 'int',
      advisor_id: 'nvarchar',
    };

    const result6 = await importData('student_advisors', ['mnumber', 'term', 'year', 'advisor_id'], studentAdvisorData, fileName, importedBy, studentAdvisorColumnTypes);

    res.json({
      message: 'Demographics imported successfully.',
      totalRecords: result1.totalRecords,
      errors: result1.errorDetails,
      totalAddresses: result2.totalRecords,
      totalAcademic: result3.totalRecords,
      totalPrograms: result4.totalRecords,
      totalAdvisors: result5.totalRecords,
      totalStudentAdvisors: result6.totalRecords,
    });

  } catch (error) {
    console.error(`Error importing terms data: ${error.message}`);
    res.status(500).json({ error: 'Error importing terms data.' });
  }
});

export default router;