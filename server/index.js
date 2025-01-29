const express = require('express');
const cors = require('cors');
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const importHistoryRoutes = require('./routes/importHistoryRoutes');

const app = express();
app.use(cors());

// Increase request body size limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PORT = process.env.PORT || 4000;

// Mount department routes at /department
app.use('/departments', departmentRoutes);
app.use('/courses', courseRoutes);
app.use('/import-history', importHistoryRoutes);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});