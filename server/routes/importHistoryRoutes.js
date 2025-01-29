const express = require('express');
const router = express.Router();
const db = require('../database/db');

// ✅ Get Import History (Filtered by Entity Type)
router.get('/', (req, res) => {
  const { entity } = req.query; // Get entity type from query params

  let query = `SELECT * FROM imports`;
  let params = [];

  if (entity) {
    query += ` WHERE entity_type = ?`;
    params.push(entity);
  }

  query += ` ORDER BY import_date DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching import history:', err);
      return res.status(500).json({ error: 'Failed to retrieve import history' });
    }
    res.json(rows);
  });
});

module.exports = router;