import sql from 'mssql';

// Defaults the database name to 'tempdb' when not in production mode
const databaseName = process.env.NODE_ENV !== 'prod' ? 'tempdb' : process.env.DB_NAME;

// Read environment variables for SQL Server connection
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrongPassw0rd',
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  database: databaseName,
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

// Initialize database tables
const initialize = async () => {
  try {

    // Core Entity Tables
    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'departments')
      BEGIN
        CREATE TABLE departments (
          code NVARCHAR(10) PRIMARY KEY,
          description NVARCHAR(255) NOT NULL,
          prefixes NVARCHAR(50),
          canvas_id INT NULL,
          college_code NVARCHAR(10) NOT NULL DEFAULT 'UNASSIGNED',
          FOREIGN KEY (college_code) REFERENCES colleges(code)
        );
      END;

      IF NOT EXISTS (SELECT * FROM departments WHERE code = 'UNASSIGNED')
      BEGIN
        INSERT INTO departments (code, description, college_code) VALUES ('UNASSIGNED', 'Unassigned Department', 'UNASSIGNED');
      END;
    `);

    // Note: The "code" field is still used for reference. Imported data combines subject and course_number into a single field.
    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'courses')
      BEGIN
        CREATE TABLE courses (
          code NVARCHAR(10) PRIMARY KEY, -- Unique ID (Still stores "ACC100" for reference)
          subject NVARCHAR(10) NOT NULL, -- Extracted from course_id (e.g., "ACC")
          course_number NVARCHAR(10) NOT NULL, -- Extracted from course_id (e.g., "100")
          title NVARCHAR(255) NOT NULL,
          hours INT NOT NULL,
          course_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
          web_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
          last_changed DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (subject) REFERENCES subjects(code)
        );
      END;
    `);

    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'students')
      BEGIN
        CREATE TABLE students (
          code NVARCHAR(10) PRIMARY KEY,
          first_name NVARCHAR(50) NOT NULL,
          middle_name NVARCHAR(50) NULL,
          last_name NVARCHAR(50) NOT NULL,
          suffix NVARCHAR(10) NULL, -- Jr, III, etc.
          birth_date DATE NULL,
          gender CHAR(1) CHECK (gender IN ('M', 'F')) NULL,
          citizenship CHAR(1) CHECK (citizenship IN ('Y', 'N', 'R')) NOT NULL, -- Y=Yes, N=No, R=Resident Alien
          race_code NVARCHAR(10) NULL,
          race_description NVARCHAR(255) NULL,
          nation_code NVARCHAR(10) NULL,
          FOREIGN KEY (nation_code) REFERENCES nation(code)
        );  
      END;
    `);

    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'programs')
      BEGIN
        CREATE TABLE programs (
          code NVARCHAR(10) PRIMARY KEY,
          description NVARCHAR(255) NOT NULL,
          cip_code NVARCHAR(10) NULL,
          is_major BIT NOT NULL DEFAULT 0,
          is_minor BIT NOT NULL DEFAULT 0,
          has_concentration BIT NOT NULL DEFAULT 0,
          is_discontinued BIT NOT NULL DEFAULT 0,
          is_aacsb BIT NOT NULL DEFAULT 0,
          department_code NVARCHAR(10) NOT NULL DEFAULT 'UNASSIGNED',
          college_code NVARCHAR(10) NOT NULL DEFAULT 'UNASSIGNED',
          added_on DATETIME DEFAULT GETDATE(),
          FOREIGN KEY (department_code) REFERENCES departments(code),
          FOREIGN KEY (college_code) REFERENCES colleges(code)
        );
      END;
    `);

    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'test_scores')
      BEGIN
        CREATE TABLE test_scores (
          id INT IDENTITY(1,1) PRIMARY KEY,
          student_code NVARCHAR(10) NOT NULL,
          test_code NVARCHAR(10) NOT NULL,
          test_description NVARCHAR(255) NOT NULL,
          score DECIMAL(5,2) NOT NULL,
          test_date DATE NOT NULL
          FOREIGN KEY (student_code) REFERENCES students(code)
        );
      END;
    `);

    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'previous_colleges')
      BEGIN
        CREATE TABLE previous_colleges (
          id INT IDENTITY(1,1) PRIMARY KEY,
          student_code NVARCHAR(10) NOT NULL,
          college_code NVARCHAR(10) NOT NULL,
          degree NVARCHAR(50) NULL,
          degree_date DATE NULL,
          FOREIGN KEY (student_code) REFERENCES students(code),
          FOREIGN KEY (college_code) REFERENCES college_codes(code)
        );
      END;
    `);

    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'advisors')
      BEGIN
        CREATE TABLE advisors (
            id NVARCHAR(10) PRIMARY KEY,
            first_name NVARCHAR(50) NOT NULL,
            last_name NVARCHAR(50) NOT NULL,
            middle_name NVARCHAR(50) NULL,
            suffix NVARCHAR(10) NULL -- Jr, III, etc.
        );
      END;
    `);

    // Relationship Tables
    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_courses')
      BEGIN
        CREATE TABLE student_courses (
          id INT IDENTITY(1,1) PRIMARY KEY,
          student_code NVARCHAR(10) NOT NULL,
          year INT NOT NULL, -- YYYY Extracted from term (YYYYSS)
          term_code NVARCHAR(10) NOT NULL, -- SS Extracted from term (YYYYSS)
          crn NVARCHAR(10) NOT NULL, -- Course Reference Number (Registration ID)
          subject_code NVARCHAR(10) NOT NULL, -- Course Prefix (e.g., "ACC", "ENG")
          course_number NVARCHAR(10) NOT NULL, -- Course Number (e.g., "100", "099")
          section NVARCHAR(10) NOT NULL, -- Course Section (e.g., "03")
          credit_hours DECIMAL(4,1) NOT NULL, -- Course Credit Hours (99.9 format)
          course_level NVARCHAR(10) NOT NULL, -- Course Level (UG, GR, ES)
          part_of_term_code NVARCHAR(10) NULL,
          registration_status_code NVARCHAR(10) NULL,
          instructional_method_code NVARCHAR(10) NULL,
          last_attendance DATE NULL,
          midterm_grade NVARCHAR(10) NULL,
          final_grade NVARCHAR(10) NULL,
          FOREIGN KEY (student_code) REFERENCES students(code),
          FOREIGN KEY (term_code) REFERENCES terms(code),
          FOREIGN KEY (subject_code) REFERENCES subjects(code),
          FOREIGN KEY (part_of_term_code) REFERENCES part_of_term(code),
          FOREIGN KEY (registration_status_code) REFERENCES registration_status(code),
          FOREIGN KEY (instructional_method_code) REFERENCES instructional_methods(code)
        );
      END;
    `);

    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_addresses')
      BEGIN
        CREATE TABLE student_addresses (
          student_code NVARCHAR(10) PRIMARY KEY,
          home_street1 NVARCHAR(255) NULL,
          home_street2 NVARCHAR(255) NULL,
          home_city NVARCHAR(100) NULL,
          home_state NVARCHAR(10) NULL,
          home_zip NVARCHAR(20) NULL,
          home_nation_code NVARCHAR(10) NULL,
          home_phone NVARCHAR(20) NULL,

          local_street1 NVARCHAR(255) NULL,
          local_street2 NVARCHAR(255) NULL,
          local_city NVARCHAR(100) NULL,
          local_state NVARCHAR(10) NULL,
          local_zip NVARCHAR(20) NULL,
          local_nation_code NVARCHAR(10) NULL,
          local_phone NVARCHAR(20) NULL,
          cell_phone NVARCHAR(20) NULL,

          FOREIGN KEY (student_code) REFERENCES students(code),
          FOREIGN KEY (home_nation_code) REFERENCES nation(code),
          FOREIGN KEY (local_nation_code) REFERENCES nation(code)
        );
      END;
    `);

    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_enrollment')
      BEGIN
        CREATE TABLE student_enrollment (
          id INT IDENTITY(1,1) PRIMARY KEY,
          student_code NVARCHAR(10) NOT NULL,
          admit_term_year INT NOT NULL,
          admit_term_code NVARCHAR(10) NOT NULL,
          catalog_year INT NULL,
          catalog_term_code NVARCHAR(10) NULL,
          level NVARCHAR(10) NOT NULL CHECK (level IN ('GR', 'UG', 'PB')), -- Graduate, Undergraduate, Post-Baccalaureate
          degree_code NVARCHAR(50) NULL,
          admit_code NVARCHAR(10) NULL,
          academic_standing_code NVARCHAR(10) NULL,
          
          msu_attempted_hours DECIMAL(6,2) NOT NULL,
          msu_earned_hours DECIMAL(6,2) NOT NULL,
          msu_quality_points DECIMAL(6,2) NOT NULL,
          msu_gpa DECIMAL(4,2) NOT NULL,

          overall_attempted_hours DECIMAL(6,2) NOT NULL,
          overall_earned_hours DECIMAL(6,2) NOT NULL,
          overall_quality_points DECIMAL(6,2) NOT NULL,
          overall_gpa DECIMAL(4,2) NOT NULL,

          FOREIGN KEY (student_code) REFERENCES students(code),
          FOREIGN KEY (admit_term_code) REFERENCES terms(code),
          FOREIGN KEY (catalog_term_code) REFERENCES terms(code),
          FOREIGN KEY (admit_code) REFERENCES admit_codes(code),
          FOREIGN KEY (academic_standing_code) REFERENCES academic_standing(code)
        );
      END;
    `);

    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_programs')
      BEGIN
        CREATE TABLE student_programs (
          id INT IDENTITY(1,1) PRIMARY KEY,
          student_code NVARCHAR(10) NOT NULL,
          program_type NVARCHAR(10) CHECK (program_type IN ('MAJOR', 'MINOR')) NOT NULL, -- Distinguish Major/Minor
          program_code NVARCHAR(10) NOT NULL,
          department_code NVARCHAR(10) NULL,
          college_code NVARCHAR(10) NULL,
          FOREIGN KEY (student_code) REFERENCES students(code),
          FOREIGN KEY (program_code) REFERENCES programs(code),
          FOREIGN KEY (department_code) REFERENCES departments(code),
          FOREIGN KEY (college_code) REFERENCES colleges(code)
        );
      END;
    `);

    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_advisors')
      BEGIN
        CREATE TABLE student_advisors (
          id INT IDENTITY(1,1) PRIMARY KEY,
          student_code NVARCHAR(10) NOT NULL,
          advisor_id NVARCHAR(10) NOT NULL,
          assigned_date DATE NOT NULL,
          end_date DATE NULL, -- NULL = current advisor, non-NULL = historical advisor
          FOREIGN KEY (student_code) REFERENCES students(code),
          FOREIGN KEY (advisor_id) REFERENCES advisors(id)
        );
      END;
    `);

    // Logging/Audit Tables
    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'imports')
      BEGIN
        CREATE TABLE imports (
          id INT IDENTITY(1,1) PRIMARY KEY,
          entity_type NVARCHAR(255) NOT NULL,
          file_name NVARCHAR(255) NOT NULL,
          total_records INT NOT NULL,
          error_details NVARCHAR(255) NULL,
          import_status NVARCHAR(50) NOT NULL,
          imported_by NVARCHAR(255) NOT NULL,
          import_date DATETIME DEFAULT GETDATE()
        );
      END;
    `);

    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'overrides')
      BEGIN
        CREATE TABLE overrides (
            id INT IDENTITY(1,1) PRIMARY KEY,
            student_code NVARCHAR(10) NOT NULL, -- Student receiving the override
            year INT NOT NULL, -- YYYY Extracted from TERM (YYYYSS)
            term_code NVARCHAR(10) NOT NULL, -- SS Extracted from TERM (YYYYSS)
            crn NVARCHAR(10) NOT NULL, -- Course Reference Number
            subject_code NVARCHAR(10) NOT NULL, -- Course Prefix (e.g., "ACC", "ENG")
            course_number NVARCHAR(10) NOT NULL, -- Course Number (e.g., "099", "100")
            section NVARCHAR(10) NOT NULL, -- Course Section (e.g., "03")
            override_type NVARCHAR(50) NOT NULL, -- Type of override granted
            granted_by NVARCHAR(10) NOT NULL, -- UserID of the instructor or admin
            activity_date DATE NOT NULL, -- Date the override was granted
            FOREIGN KEY (student_code) REFERENCES students(code),
            FOREIGN KEY (term_code) REFERENCES terms(code),
            FOREIGN KEY (subject_code) REFERENCES subjects(code)
            FOREIGN KEY (course_number) REFERENCES courses(code)
        );
      END;
    `);

    // Structured Lookup Tables
    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'subjects')
      BEGIN
        CREATE TABLE subjects (
            code NVARCHAR(10) PRIMARY KEY,
            description NVARCHAR(255) NOT NULL,
            department_code NVARCHAR(10) NOT NULL,
            college_code NVARCHAR(10) NOT NULL,
            FOREIGN KEY (department_code) REFERENCES departments(code),
            FOREIGN KEY (college_code) REFERENCES colleges(code)
        );
      END;
    `);

    // Pure Lookup Tables
    await runQuery(`
      IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_types')
      BEGIN
        CREATE TABLE student_types (
            code NVARCHAR(10) PRIMARY KEY,
            description NVARCHAR(255) NOT NULL
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
    
      IF NOT EXISTS (SELECT * FROM colleges WHERE code = 'UNASSIGNED')
      BEGIN
        INSERT INTO colleges (code, description) VALUES ('UNASSIGNED', 'Unassigned College');
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
            code NVARCHAR(10) PRIMARY KEY, -- Term code (10, 50, 80)
            description NVARCHAR(50) NOT NULL -- Expanded description (Spring, Summer, Fall, Winter)
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