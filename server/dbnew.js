import sql from "mssql";

// Defaults the database name to 'tempdb' when not in production mode
const databaseName =
    process.env.NODE_ENV !== "prod" ? "tempdb" : process.env.DB_NAME;

// Read environment variables for SQL Server connection
const config = {
    user: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "YourStrongPassw0rd",
    server: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 1433,
    database: databaseName,
    options: {
        encrypt: true, // Set to `true` if using Azure SQL Server
        trustServerCertificate: true, // Needed for self-signed certs in Docker
    },
};

console.log(
    `🔌 Connecting to SQL Server at ${config.server}:${config.port}...`,
);
console.log(`🏢 Database: ${config.database}`);

// Create a connection pool
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
        console.log("✅ Connected to SQL Server");
        return pool;
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    });

// Run queries using the connection pool
const runQuery = async (query) => {
    const pool = await poolPromise;
    return pool.request().query(query);
};

// Initialize database tables
const initialize = async () => {

	try {
        // Create table's

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'departments')
            BEGIN 
                CREATE TABLE departments (
                    code NVARCHAR(10) PRIMARY KEY,
                    description NVARCHAR(100),
                    prefixes NVARCHAR(100),
                    canvas_id INT,
                    college NVARCHAR(100)
                );
            END 
        `);



        console.log("✅ Database schema initialized.");
    } catch (error) {
        console.error("❌ Error creating tables:", error.message);
        process.exit(1);
    }
};

// Export connection pool and initialization function
export { poolPromise, initialize };

