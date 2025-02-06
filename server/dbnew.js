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

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_types')
            BEGIN
                CREATE TABLE student_types (
                    code NVARCHAR(10) PRIMARY KEY,
                    description NVARCHAR(255) NOT NULL,
                    next_student_type NVARCHAR(10) NOT NULL,
                    FOREIGN KEY (next_student_type) REFERENCES student_types(code)
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'college_codes')
            BEGIN
                CREATE TABLE college_codes (
                    code NVARCHAR(10) PRIMARY KEY,
                    name NVARCHAR(255) NOT NULL
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'colleges')
            BEGIN
                CREATE TABLE colleges (
                    code NVARCHAR(10) PRIMARY KEY,
                    description NVARCHAR(255) NOT NULL
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'nations')
            BEGIN
                CREATE TABLE nations (
                    code NVARCHAR(10) PRIMARY KEY,
                    description NVARCHAR(255) NOT NULL
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'part_of_term')
            BEGIN
                CREATE TABLE part_of_term (
                    code NVARCHAR(10) PRIMARY KEY,
                    description NVARCHAR(255) NOT NULL
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'academic_standing')
            BEGIN
                CREATE TABLE academic_standing (
                    code NVARCHAR(10) PRIMARY KEY,
                    description NVARCHAR(255) NOT NULL
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'admit_codes')
            BEGIN
                CREATE TABLE admit_codes (
                    code NVARCHAR(10) PRIMARY KEY,
                    description NVARCHAR(255) NOT NULL
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'registration_status')
            BEGIN
                CREATE TABLE registration_status (
                    code NVARCHAR(10) PRIMARY KEY,
                    description NVARCHAR(255) NOT NULL
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'instructional_methods')
            BEGIN
                CREATE TABLE instructional_methods (
                    code NVARCHAR(10) PRIMARY KEY,
                    description NVARCHAR(255) NOT NULL
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'terms')
            BEGIN
                CREATE TABLE terms (
                    code NVARCHAR(10) PRIMARY KEY,
                    description NVARCHAR(50) NOT NULL
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'departments')
            BEGIN 
                CREATE TABLE departments (
                    code NVARCHAR(10) PRIMARY KEY,
                    description NVARCHAR(255) NULL,
                    prefixes NVARCHAR(50) NULL,
                    canvas_id INT NULL,
                    college_code NVARCHAR(10) NOT NULL DEFAULT 'UNASSIGNED'
                );
            END 
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'courses')
            BEGIN
                CREATE TABLE courses (
                    subject NVARCHAR(10) NOT NULL,
                    course_number INT NOT NULL,
                    course_suffix NVARCHAR(5) NULL, -- Optional suffix like 'T'
                    title NVARCHAR(255) NOT NULL,
                    hours INT NOT NULL,
                    course_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
                    web_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
                    last_changed DATETIME DEFAULT GETDATE(),
                    PRIMARY KEY (subject, course_number, course_suffix), -- Composite key
                    FOREIGN KEY (subject) REFERENCES subjects(code)
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'students')
            BEGIN
                CREATE TABLE students (
                    mnumber NVARCHAR(10) PRIMARY KEY,
                    first_name NVARCHAR(50) NOT NULL,
                    middle_name NVARCHAR(50) NULL,
                    last_name NVARCHAR(50) NOT NULL,
                    suffix NVARCHAR(10) NULL,
                    gender NVARCHAR(10) NOT NULL,
                    birth_date DATE NOT NULL,
                    citizen_status NVARCHAR(10) NOT NULL,
                    race_code NVARCHAR(10) NOT NULL,
                    race_description NVARCHAR(255) NOT NULL,
                    age INT NOT NULL,
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_addresses')
            BEGIN
                CREATE TABLE student_addresses (
                    mnumber NVARCHAR(10) PRIMARY KEY,
                    type NVARCHAR(10) NOT NULL CEHCK (type IN ('HOME', 'LOCAL')),
                    street1 NVARCHAR(255) NOT NULL,
                    street2 NVARCHAR(255) NULL,
                    city NVARCHAR(100) NULL,
                    state NVARCHAR(10) NULL,
                    zip NVARCHAR(20) NULL,
                    nation_code NVARCHAR(10) NULL,
                    phone NVARCHAR(20) NULL,
                    FOREIGN KEY (mnumber) REFERENCES students(mnumber),
                    FOREIGN KEY (nation_code) REFERENCES nations(code)
                );
            END;
        `);

        console.log("✅ Database schema initialized.");
    } catch (error) {
        console.error("❌ Error creating tables:", error.message);
        process.exit(1);
    }
};

// Export connection pool and initialization function
export { poolPromise, initialize };

