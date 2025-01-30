const express = require('express');
const router = express.Router();
const { poolPromise } = require('../db'); // Use poolPromise instead of `db`

const sql = require('mssql');

// ✅ Get Import History (Filtered by Entity Type)
router.get('/', async (req, res) => {
  const { entity } = req.query; // Get entity type from query params

  try {
    const pool = await poolPromise; // Ensure connection pool is ready

    let query = `SELECT * FROM imports`;
    
    if (entity) {
      query += ` WHERE entity_type = @entity`;
    }

    query += ` ORDER BY import_date DESC`;

    const request = pool.request();
    
    if (entity) {
      request.input('entity', sql.NVarChar, entity);
    }

    const result = await request.query(query);
    
    res.json(result.recordset); // SQL Server returns results in `recordset`
  } catch (err) {
    console.error('Error fetching import history:', err);
    res.status(500).json({ error: 'Failed to retrieve import history' });
  }
});

module.exports = router;