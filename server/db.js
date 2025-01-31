import sql from 'mssql';

// Read environment variables for SQL Server connection
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrongPassw0rd',
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'test_db',
  options: {
    encrypt: true, // Set to `true` if using Azure SQL Server
    trustServerCertificate: true, // Needed for self-signed certs in Docker
  },
};

console.log(`🔌 Connecting to SQL Server at ${config.server}:${config.port}...`);
console.log(`🏢 Database: ${config.database}`);

// Create a connection pool
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('✅ Connected to SQL Server');
    return pool;
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });

// Run queries using the connection pool
const runQuery = async (query) => {
  const pool = await poolPromise;
  return pool.request().query(query);
};

// Initialize database tables (migrating from SQLite to SQL Server)
const initialize = async () => {
  try {
    await runQuery(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='departments' AND xtype='U')
      CREATE TABLE departments (
        code NVARCHAR(255) PRIMARY KEY,
        description TEXT NOT NULL,
        prefixes TEXT,
        canvas_id TEXT,
        college TEXT
      )
    `);

    await runQuery(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='courses' AND xtype='U')
      CREATE TABLE courses (
        course NVARCHAR(255) PRIMARY KEY,
        title TEXT NOT NULL,
        hours INT NOT NULL,
        course_fee DECIMAL(10,2),
        web_fee DECIMAL(10,2),
        last_changed DATETIME DEFAULT GETDATE()
      )
    `);

    await runQuery(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='imports' AND xtype='U')
      CREATE TABLE imports (
        id INT IDENTITY(1,1) PRIMARY KEY,
        entity_type NVARCHAR(255) NOT NULL,
        file_name NVARCHAR(255) NOT NULL,
        total_records INT NOT NULL,
        error_details TEXT,
        import_status NVARCHAR(50) NOT NULL,
        imported_by NVARCHAR(255) NOT NULL,
        import_date DATETIME DEFAULT GETDATE()
      )
    `);

    console.log("✅ Database schema initialized.");
  } catch (error) {
    console.error("❌ Error creating tables:", error.message);
    process.exit(1);
  }
};

// Export connection pool and initialization function
export { poolPromise, initialize };