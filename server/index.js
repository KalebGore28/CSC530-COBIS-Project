const express = require('express');
const cors = require('cors');
const db = require('./db');

// Import routes
const departmentRoutes = require('./routes/departmentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const importHistoryRoutes = require('./routes/importHistoryRoutes');

// Create Express app
const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Function to start the server only after the database is initialized
const startServer = async () => {
  try {
    await db.initialize(); // Ensure database is fully set up before starting
    console.log('✅ Database is ready. Starting the server...');

    // Routes
    app.use('/departments', departmentRoutes);
    app.use('/courses', courseRoutes);
    app.use('/import-history', importHistoryRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1); // Prevent server from starting if DB fails
  }
};

startServer();