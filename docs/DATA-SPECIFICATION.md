# CUBA Integrated Data & Ingestion Specification

## 1. Executive Summary

This document provides a comprehensive technical reference for the CUBA data ecosystem. It defines the structure of external data extracts, the logic of the application's ingestion engine, and the schema for internal database tables.

---

## 2. Ingestion Engine Architecture

### 2.1 The "Missing Row Resolver" Pattern

To maintain referential integrity during large-scale imports, the application utilizes a **Missing Row Resolver**. This mechanism prevents import failures when a record references a foreign key that does not yet exist in the local database.

**Execution Flow:**

1. **Intercept:** The system detects a reference to a non-existent ID (e.g., a new `department_id`).
2. **Invoke:** The engine calls the `missingRowResolver` specific to the target table.
3. **Generate Stub:** The resolver creates a "placeholder" record using the provided ID and a default description (e.g., `'unknown'`).
4. **Commit:** The primary record is imported, successfully linking to the newly created stub.

### 2.2 Ingestion Strategies

The application employs three distinct strategies for data handling:

| Strategy            | Description                                                                 | Maintenance Frequency |
| :------------------ | :-------------------------------------------------------------------------- | :-------------------- |
| **Dynamic Import**  | High-complexity mapping with transformations and async lookups.             | Scheduled/Frequent    |
| **Static Resolver** | Tables that rely on resolvers to handle new incoming references.            | Low (Mostly Static)   |
| **System Core**     | Managed strictly by application logic; no CSV import capability.            | High (Automated)      |

---

## 3. External Data Sources (Source Files)

These files are provided as external CSV extracts and serve as the raw input for the ingestion engine.

### 3.1 Course History Extracts

Contains academic history for students (BPA Majors or BPA Course enrollees).

- **File Patterns:**
  - `reg_cuba_courses_during_term _\d+_\d+\.csv`
  - `REG_CUBA_Courses_Grade_Time_Extract _\d+\.csv`
- **Scope:** One term only.

| Field Name     | Description                   | Format/Notes                        |
| :------------- | :---------------------------- | :---------------------------------- |
| `MNUMBER`      | Banner ID for Student         |                                     |
| `TERM`         | Academic History Term         | `YYYYSS` (e.g., 201010)             |
| `PARTOFTERM`\* | Part of Term Code             | e.g., first-half semester           |
| `CRSESUBJ`     | Course Prefix                 | e.g., ACC, ENG                      |
| `CRSENUMB`     | Course Number                 | Leading zeros for < 100 (e.g., 099) |
| `SECTION`      | Course Section                | Leading zeros for < 10 (e.g., 03)   |
| `CRHRS`        | Course Credit Hours           | `99.9` format                       |
| `LEVLCODE`     | Course Level                  | UG, GR, ES                          |
| `RSTSCODE`\*   | Most Recent Registration Code | _Requires Lookup_                   |
| `INSMCODE`\*   | Instructional Method          | _Requires Lookup_                   |
| `LASTATTEND`   | Last Attendance Date          | Instructor entry                    |
| `MIDGRADE`     | Midterm Grade                 | Instructor entry                    |
| `FINGRADE`     | Final Grade                   | Instructor entry                    |

### 3.2 Student Demographic Extracts

Contains a single record per student for the specific term.

- **File Patterns:**
  - `reg_cuba_demographic _\d+_\d+\.csv`
  - `REG_CUBA_Demographic_Grade_Time_Extract _\d+\.csv`

| Field Name   | Description                | Format/Notes                |
| :----------- | :------------------------- | :-------------------------- |
| `TERM`       | Enrollment Term of Extract | `YYYYSS`                    |
| `MNUMBER`    | Banner ID for Student      |                             |
| `LASTNAME`   | Student Last Name          |                             |
| `ADMITTERM`  | Term student was admitted  | `YYYYSS`                    |
| `LEVL`       | Student Program Level      | GR, UG, PB                  |
| `DEGREECODE` | Student Program Degree     | e.g., MBA, BS (000000=None) |
| `MAJOR1`\*   | First Major Code           | _Requires Lookup_           |
| `MSUGPA`     | MSU GPA                    | `9.99` format               |
| `OVERGPA`    | Overall GPA                | `9.99` format               |

_(Note: Full list of demographic fields available in the master data dictionary)._

---

## 4. Internal Database Mapping (Target Schema)

### 4.1 Dynamic Import Tables

These tables map directly from CSV inputs using complex transformation logic.

#### A. Course Catalog (`courses`)

**File Pattern:** `reg_cuba_catalog_\d{6}_\d{8}\.csv`  
**Transformation Logic:** Uses `parseCourseCode()` to split the `COURSE` string into Subject, Number, and Suffix. Performs async lookups for Department/College IDs.

| CSV Column        | Target Field    | Transformation / Notes                      |
| :---------------- | :-------------- | :------------------------------------------ |
| `COURSE`          | `id`            | Raw identifier                              |
| `COURSE`          | `subject`       | Extracted via `parseCourse $\to$ subject`   |
| `COURSE`          | `number`        | Extracted via `parse $\to$ number`          |
| `COURSE`          | `suffix`        | Extracted via `parse $\to$ suffix`          |
| `CRSETITLE`       | `title`         | Raw string                                  |
| `CREDITHRS`       | `hours`         | Raw numeric                                 |
| `COURSE` (lookup) | `department_id` | Async lookup via `getCoursePrefix(subject)` |

**Fallback Logic:** On error, creates record with title `'unknown'` and hours `0`.

#### B. Programs (`programs`)

**File Pattern:** `major_minor\.csv`  
**Transformation Logic:** Uses `safeParseString` to normalize nulls/empty strings into `undefined`.

| CSV Column    | Target Field    | Transformation / Notes                   |
| :------------ | :-------------- | :--------------------------------------- |
| `CODE`        | `id`            | Raw string                               |
| `DESCRIPTION` | `description`   | Raw string                               |
| `IS_MAJOR`    | `is_major`      | Boolean                                  |
| `DEPARTMENT`  | `department_id` | `safeParseString` (null $\to$ undefined) |
| `COLLEGE`     | `college_id`    | `safeParseString` (null $\to$ undefined) |

**Fallback Logic:** On error, creates record with description `'unknown'` and all booleans set to `false`.

### 4.2 Static Reference Tables (Resolver-Only)

These tables implement the standard resolver pattern: `{ id: missingData.id, description: 'unknown' }`.

| Table Name             | Role                               |
| :--------------------- | :--------------------------------- |
| `academicStanding`     | Academic standing codes            |
| `admitCodes`           | Admission type identifiers         |
| `colleges`             | College abbreviations and names    |
| `departments`          | Departmental identifiers           |
| `instructionalMethods` | Delivery modes (Online, In-Person) |
| `partOfTerm`           | Sub-term identifiers               |
| `registrationStatus`   | Registration state codes           |

### 4.3 System Core Tables

Managed internally; no ingestion mapping exists.

- **Identity:** `account`, `user`, `roles`, `userRoles`
- **Security/Session:** `session`, `verification`
- **Contextual:** `terms`

---

## 5. Global Reference Constants

### 5.1 Term Code Structure (`SS`)

The final two digits of all `TERM` and `ADMITTERM` fields denote the semester:

- **10**: Spring Term (e.g., `201010`)
- **50**: Summer Term (e.g., `201050`)
- **80**: Fall Term (e.g., `201080`)
