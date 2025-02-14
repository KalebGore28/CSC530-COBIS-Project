import sql from "mssql";
import config from "./utils/config.js";

console.log(`🔌 Connecting to SQL Server at ${config.database.server}:${config.database.port}...`);
console.log(`🏢 Database: ${config.database.database}`);

// Create a connection pool
const poolPromise = new sql.ConnectionPool(config.database)
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
        // Logging/Audit Tables
        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'imports')
            BEGIN
                CREATE TABLE imports (
                id INT IDENTITY(1,1) PRIMARY KEY,
                entity_type NVARCHAR(255) NOT NULL,
                file_name NVARCHAR(255) NOT NULL,
                total_records INT NOT NULL,
                error_details NVARCHAR(MAX) DEFAULT 'No errors reported.',
                import_status NVARCHAR(50) NOT NULL,
                imported_by NVARCHAR(255) NOT NULL,
                import_date DATETIME DEFAULT GETDATE()
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_types')
            BEGIN
                CREATE TABLE student_types (
                    code NVARCHAR(10) PRIMARY KEY,
                    description NVARCHAR(255) NOT NULL,
                    next_student_type NVARCHAR(10) NULL,
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
                    description NVARCHAR(255) NOT NULL
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
                    college NVARCHAR(10) NOT NULL DEFAULT 'UNASSIGNED',
                    FOREIGN KEY (college) REFERENCES colleges(code)
                );
            END 
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'subject_prefixes')
            BEGIN
                CREATE TABLE subject_prefixes (
                    college NVARCHAR(10) NOT NULL,
                    department NVARCHAR(10) NOT NULL,
                    prefix NVARCHAR(10) NOT NULL,
                    PRIMARY KEY (college, department, prefix),
                    FOREIGN KEY (college) REFERENCES colleges(code),
                    FOREIGN KEY (department) REFERENCES departments(code)
                );
            END;    
            
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'courses')
            BEGIN
                CREATE TABLE courses (
                    subject NVARCHAR(10) NOT NULL,
                    course_number INT NOT NULL,
                    course_suffix NVARCHAR(5) NOT NULL DEFAULT '',
                    title NVARCHAR(255) NOT NULL,
                    hours INT NOT NULL,
                    course_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
                    web_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
                    last_changed DATETIME DEFAULT GETDATE(),
                    PRIMARY KEY (subject, course_number, course_suffix),
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
                    department NVARCHAR(10) NOT NULL DEFAULT 'UNASSIGNED',
                    college NVARCHAR(10) NOT NULL DEFAULT 'UNASSIGNED',
                    added_on DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (department) REFERENCES departments(code),
                    FOREIGN KEY (college) REFERENCES colleges(code)
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'advisors')
            BEGIN
                CREATE TABLE advisors (
                    advisor_id NVARCHAR(10) PRIMARY KEY,
                    first_name NVARCHAR(50) NOT NULL,
                    last_name NVARCHAR(50) NOT NULL,
                    middle_name NVARCHAR(50) NULL,
                    suffix NVARCHAR(10) NULL,
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
                    gender NVARCHAR(10) NULL,
                    birth_date DATE NULL,
                    citizenship NVARCHAR(10) NULL,
                    race_code NVARCHAR(10) NULL,
                    race_description NVARCHAR(255) NULL,
                    residency_code NVARCHAR(10) NULL,
                    residency_description NVARCHAR(255) NULL,
                    age INT NULL,
                    cell_phone NVARCHAR(20) NULL,
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'test_scores')
            BEGIN
                CREATE TABLE test_scores (
                    mnumber NVARCHAR(10) NOT NULL,
                    code NVARCHAR(10) NOT NULL,
                    description NVARCHAR(255) NOT NULL,
                    score DECIMAL(5,2) NOT NULL,
                    date DATE NOT NULL,
                    PRIMARY KEY (mnumber, code),
                    FOREIGN KEY (mnumber) REFERENCES students(mnumber)
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'previous_colleges')
            BEGIN
                CREATE TABLE previous_colleges (
                    mnumber NVARCHAR(10) NOT NULL,
                    college_code NVARCHAR(10) NOT NULL,
                    college_description NVARCHAR(255) NOT NULL,
                    degree NVARCHAR(50) NOT NULL,
                    date DATE NOT NULL,
                    PRIMARY KEY (mnumber, college_code),
                    FOREIGN KEY (mnumber) REFERENCES students(mnumber),
                    FOREIGN KEY (college_code) REFERENCES college_codes(code)
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_addresses')
            BEGIN
                CREATE TABLE student_addresses (
                    mnumber NVARCHAR(10) NOT NULL,
                    type NVARCHAR(10) NOT NULL CHECK (type IN ('HOME', 'LOCAL')),
                    street1 NVARCHAR(255) NOT NULL,
                    street2 NVARCHAR(255) NULL,
                    city NVARCHAR(100) NULL,
                    state NVARCHAR(20) NULL,
                    zip NVARCHAR(20) NULL,
                    nation_code NVARCHAR(10) NULL,
                    phone NVARCHAR(20) NULL,
                    PRIMARY KEY (mnumber, type), -- Composite key that allows a local and home address
                    FOREIGN KEY (mnumber) REFERENCES students(mnumber),
                    FOREIGN KEY (nation_code) REFERENCES nations(code)
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_academic_info')
            BEGIN
                CREATE TABLE student_academic_info (
                    mnumber NVARCHAR(10) NOT NULL,
                    admit_term NVARCHAR(10) NOT NULL,
                    admit_year INT NOT NULL,
                    admit_code NVARCHAR(10) NOT NULL,
                    academic_standing NVARCHAR(10) NOT NULL,
                    msu_attempted_hours DECIMAL(10, 2) NOT NULL,
                    msu_earned_hours DECIMAL(10, 2) NOT NULL,
                    msu_quality_points DECIMAL(10, 2) NOT NULL,
                    msu_gpa DECIMAL(3, 2) NOT NULL,
                    overall_attempted_hours DECIMAL(10, 2) NOT NULL,
                    overall_earned_hours DECIMAL(10, 2) NOT NULL,
                    overall_quality_points DECIMAL(10, 2) NOT NULL,
                    overall_gpa DECIMAL(3, 2) NOT NULL,
                    PRIMARY KEY (mnumber, admit_term, admit_year),
                    FOREIGN KEY (admit_term) REFERENCES terms(code),
                    FOREIGN KEY (admit_code) REFERENCES admit_codes(code),
                    FOREIGN KEY (mnumber) REFERENCES students(mnumber),
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_programs')
            BEGIN
                CREATE TABLE student_programs (
                    mnumber NVARCHAR(10) NOT NULL,
                    term NVARCHAR(10) NOT NULL,
                    year INT NOT NULL,
                    study NVARCHAR(10) NOT NULL,
                    type NVARCHAR(10) NOT NULL CHECK (type IN ('MAJOR', 'MINOR')),
                    level NVARCHAR(10) NOT NULL CHECK (level IN ('UG', 'GR', 'PB')),
                    program_code NVARCHAR(10) NOT NULL,
                    department NVARCHAR(10) NOT NULL,
                    college NVARCHAR(10) NOT NULL,
                    PRIMARY KEY (mnumber, term, year, type, program_code),
                    FOREIGN KEY (mnumber) REFERENCES students(mnumber),
                    FOREIGN KEY (term) REFERENCES terms(code),
                    FOREIGN KEY (program_code) REFERENCES programs(code),
                    FOREIGN KEY (department) REFERENCES departments(code),
                    FOREIGN KEY (college) REFERENCES colleges(code)
                );
            END;    
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_courses')
            BEGIN
                CREATE TABLE student_courses (
                    mnumber NVARCHAR(10) NOT NULL,
                    term NVARCHAR(10) NOT NULL,
                    year INT NOT NULL,
                    part_of_term NVARCHAR(10) NOT NULL,
                    crn NVARCHAR(10) NOT NULL,
                    subject NVARCHAR(10) NOT NULL,
                    course_number INT NOT NULL,
                    course_suffix NVARCHAR(5) NULL,
                    section INT NOT NULL,
                    hours INT NOT NULL,
                    level NVARCHAR(10) NOT NULL,
                    registration_status NVARCHAR(10) NOT NULL,
                    instructional_method NVARCHAR(10) NOT NULL,
                    last_attendance DATE NULL,
                    midterm_grade NVARCHAR(10) NULL,
                    final_grade NVARCHAR(10) NULL,
                    PRIMARY KEY (mnumber, term, year, crn),
                    FOREIGN KEY (term) REFERENCES terms(code),
                    FOREIGN KEY (part_of_term) REFERENCES part_of_term(code),
                    FOREIGN KEY (subject, course_number, course_suffix) REFERENCES courses(subject, course_number, course_suffix),
                    FOREIGN KEY (registration_status) REFERENCES registration_status(code),
                    FOREIGN KEY (instructional_method) REFERENCES instructional_methods(code)
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'student_advisors')
            BEGIN
                CREATE TABLE student_advisors (
                    mnumber NVARCHAR(10) NOT NULL,
                    term NVARCHAR(10) NOT NULL,
                    year INT NOT NULL,
                    advisor_id NVARCHAR(10) NOT NULL,
                    PRIMARY KEY (mnumber, term, year, advisor_id),
                    FOREIGN KEY (mnumber) REFERENCES students(mnumber),
                    FOREIGN KEY (term) REFERENCES terms(code),
                    FOREIGN KEY (advisor_id) REFERENCES advisors(advisor_id)
                );
            END;    
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'overrides')
            BEGIN
                CREATE TABLE overrides (
                id INT IDENTITY(1,1) PRIMARY KEY,
                mnumber NVARCHAR(10) NOT NULL,
                term NVARCHAR(10) NOT NULL,
                year INT NOT NULL,
                crn NVARCHAR(10) NOT NULL,
                subject NVARCHAR(10) NOT NULL,
                course_number INT NOT NULL,
                course_suffix NVARCHAR(5) NOT NULL DEFAULT '',
                section NVARCHAR(10) NOT NULL,
                override_type NVARCHAR(50) NOT NULL,
                granted_by NVARCHAR(10) NOT NULL,
                override_date DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (term) REFERENCES terms(code),
                FOREIGN KEY (mnumber) REFERENCES students(mnumber),
                FOREIGN KEY (subject, course_number, course_suffix) REFERENCES courses(subject, course_number, course_suffix)
                );
            END; 
        `);

        // RBAC Tables
        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'users')
            BEGIN
                CREATE TABLE users (
                    user_id NVARCHAR(255) PRIMARY KEY, -- Unique SSO identifier
                    email NVARCHAR(255) UNIQUE NOT NULL,
                    display_name NVARCHAR(255) NOT NULL,
                    is_active BIT DEFAULT 1, -- Soft delete mechanism
                    last_login DATETIME NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE()
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'roles')
            BEGIN
                CREATE TABLE roles (
                    role_id INT PRIMARY KEY IDENTITY(1,1), -- Fix for SQL Server
                    role_name NVARCHAR(50) UNIQUE NOT NULL
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'user_roles')
            BEGIN
                CREATE TABLE user_roles (
                    user_id NVARCHAR(255) NOT NULL,
                    role_id INT NOT NULL,
                    PRIMARY KEY (user_id, role_id),
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'permissions')
            BEGIN
                CREATE TABLE permissions (
                    permission_id INT PRIMARY KEY IDENTITY(1,1), -- Fix for SQL Server
                    table_name NVARCHAR(100) NOT NULL,  -- Which table the permission applies to
                    column_name NVARCHAR(100) NULL,     -- NULL means entire table access
                    can_read BIT DEFAULT 0,  -- Read access (BOOLEAN -> BIT Fix)
                    can_write BIT DEFAULT 0, -- Write access (BOOLEAN -> BIT Fix)
                    description NVARCHAR(255) NULL      -- Short explanation for admin UI
                );
            END;
        `);

        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'role_permissions')
            BEGIN
                CREATE TABLE role_permissions (
                    role_id INT NOT NULL,
                    permission_id INT NOT NULL,
                    PRIMARY KEY (role_id, permission_id),
                    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
                    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
                );
            END;
        `);

        // User Permissions Table (Overrides Role-Based Permissions)
        await runQuery(`
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'user_permissions')
            BEGIN
                CREATE TABLE user_permissions (
                    user_id NVARCHAR(255) NOT NULL, 
                    permission_id INT NOT NULL,
                    PRIMARY KEY (user_id, permission_id),
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
                );
            END;
        `);

        // Insert DEFAULT values
        await runQuery(`
            -- Insert 'UNASSIGNED' college code if it doesn't exist
            IF NOT EXISTS (SELECT * FROM colleges WHERE code = 'UNASSIGNED')
            BEGIN
                INSERT INTO colleges (code, description) VALUES ('UNASSIGNED', 'Unassigned');
            END;
        
            -- Insert 'UNASSIGNED' department if it doesn't exist
            IF NOT EXISTS (SELECT * FROM departments WHERE code = 'UNASSIGNED')
            BEGIN
                INSERT INTO departments (code, description, college) VALUES ('UNASSIGNED', 'Unassigned', 'UNASSIGNED');
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