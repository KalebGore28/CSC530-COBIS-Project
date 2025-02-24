# CSC530-COBIS-Project

# Layout for defining endpoints

### User Story: [Story Title]
- **Story ID**: [Unique identifier]
- **As a**: [User role]
- **I want**: [The functionality/feature the user wants]
- **So that**: [The benefit or reason for the feature]

---

#### Acceptance Criteria:
    1. [First condition to be met]
    2. [Second condition to be met]
    3. [Third condition to be met]
    (add more as needed)

---

#### Endpoint(s):
- **Endpoint**: [URL path]
- **Method**: [GET, POST, PUT, DELETE, etc.]
- **Description**: [Brief description of what the endpoint does]
- **Request Body**: [Example of the data expected in the request body, if applicable]
- **Response Body**: [Example of the data structure for the response]
- **Status Codes**: [Expected HTTP status codes and their meaning]
  - 200: OK
  - 400: Bad Request
  - 404: Not Found
  - 500: Internal Server Error

---

#### Dependencies:
- [Any services, databases, or other components that are needed to complete this story]

#### Notes:
- [Any additional notes or clarifications related to this story]


# Status Codes:

-    200: OK (results found)
-    400: Bad Request (invalid query parameters or missing required parameters)
-    404: Not Found (no students found matching the criteria)
-    500: Internal Server Error

# User Interface and Data Access Flexibility for Custom Reports
 ### User Story: User Interface and Data Access Flexibility for Custom Reports
- **Story ID**: US000
- **As a**: System Designer
- **I want**: To create a flexible, user-friendly tool that enables users to query the database and generate custom reports dynamically
- **So that**: Users can generate reports tailored to their needs by applying filters, sorting, and querying data, without relying on predefined reports, while ensuring role-based data access restrictions.

---

#### Acceptance Criteria:
1. **Frontend Interface**: The system should provide a clean, intuitive interface for querying and sorting data without the need for predefined reports.
   - Users should be able to specify which fields to include in their query.
   - Users should be able to filter results dynamically (e.g., by semester, year, course, student major).
   - Users should be able to sort data by any field (e.g., ascending or descending order of grades, student name, GPA).
2. **Query Flexibility**: The system should allow users to build custom queries on the fly without requiring a stored procedure for each report.
   - Users should be able to combine multiple filters and apply complex conditions.
   - Queries should return results in an easily digestible format (e.g., tables, charts).
3. **Security & Role-Based Access Control**:
   - Each user’s access to data should be restricted based on their role.
   - Faculty, advisors, coordinators, chairs, and admins should only have access to the data they are authorized to view.
   - For example, faculty can only access their own courses, while department chairs can access information about all students and faculty within their department, but admins should not access FERPA-protected data like individual student grades.
4. **User Experience (UX)**: The system should focus on being user-friendly, offering:
   - Easy-to-use query-building tools.
   - Clear feedback when filters or queries return no results.
   - Visual aids (e.g., tooltips, instructional text) to help users understand how to use the tool.
5. **Audit Trails & Logs**: The system should log queries and report generation activities for auditing and compliance purposes.
6. **Exporting**: Users should be able to export the generated reports in standard formats (e.g., CSV, PDF).

---

#### Endpoint(s):
- **Endpoint**: `/api/query-builder`
- **Method**: POST
- **Description**: Allows users to create and execute custom queries, applying dynamic filters and sorting.
- **Request Body**:
  ```json
  {
    "user_id": "123",
    "filters": [
      {
        "field": "course_name",
        "operator": "=",
        "value": "Intro to Computer Science"
      },
      {
        "field": "grade",
        "operator": ">",
        "value": "B"
      }
    ],
    "sort": {
      "field": "student_name",
      "order": "asc"
    }
  }


# Flexible Query Tool with Role-Based Data Access

    ### User Story: Flexible Query Tool with Role-Based Data Access
    - **Story ID**: US001
    - **As a**: User
    - **I want**: A tool that allows me to query, filter, and sort data based on my needs, while ensuring that access is restricted according to my role
    - **So that**: I can retrieve the information I need, even if it's not explicitly covered by predefined use cases, while ensuring security through role-based access control

    ---

    #### Acceptance Criteria:
    1. The tool should allow users to input custom queries to retrieve data that is not covered by predefined use cases.
    2. Users should be able to filter the results based on various fields (e.g., date range, department, etc.).
    3. Users should be able to sort the results by different attributes (e.g., name, date, score, etc.).
    4. The tool should ensure that data access is restricted according to user roles (e.g., admins have full access, while regular users only see their own data).
    5. The system should validate the query parameters to ensure they are valid and return an appropriate error message for invalid queries.
    6. A user-friendly frontend interface should be available to enter queries, set filters, and specify sorting options.
    7. The tool should provide clear error messages if a user tries to access data they are not authorized to view.

    ---

    #### Endpoint(s):
    - **Endpoint**: `/api/data/query`?
    - **Method**: POST
    - **Description**: Accepts custom queries from the frontend, applies role-based access control, and returns the requested data.
    - **Request Body**:
    ```json
    {
        "query": "SELECT * FROM students WHERE department = 'Computer Science' AND gpa > 3.5",
        "filters": {
        "department": "Computer Science",
        "gpa": "> 3.5"
        },
        "sort": {
        "field": "gpa",
        "order": "desc"
        }
    }

    #### Dependencies:

    - Role-based access control system to ensure users only see data they are authorized to view.
    - Database or data service that can execute dynamic queries, support filtering, and sorting.
    - Frontend interface that allows users to create custom queries, apply filters, and specify sorting options.

    #### Notes:

    - The frontend should include a query builder or input form that helps users construct valid queries with filters and sorting without needing to write raw SQL.
    - User roles need to be tightly integrated into the query processing to ensure unauthorized access is prevented.
    - Query performance is important, so ensure proper indexing on the database to optimize for complex queries.
    - Consider implementing pagination in the response for large datasets to avoid performance issues.
    - Consider implementing caching for frequent queries to improve performance, especially when dealing with large student databases. (e.g., adding filters one by one to narrow results)

# Generate List of Students with Machine Learning Experience

    ### User Story: Generate List of Students with Machine Learning Experience
    - **Story ID**: US002
    - **As a**: Department Chair
    - **I want**: To be able to query and generate a list of students who have completed machine learning courses, with the ability to filter by a minimum grade
    - **So that**: I can provide a list of qualified students to potential employers who seek candidates with experience in machine learning

    ---

    #### Acceptance Criteria:
    1. The system should allow querying students who have completed a specified course.
    2. The system should allow filtering the results based on a minimum grade (e.g., GPA or course grade).
    3. The list should include the student’s name, course name, grade, and any other relevant details (e.g., course year, department).
    4. The system should return an error message if no students match the query criteria.
    5. The system should allow users to filter by multiple courses (if applicable).

    ---

    #### Endpoint(s):
    - **Endpoint**: `/api/students/courses`
    - **Method**: GET
    - **Description**: Retrieves a list of students who have completed course(s), with an optional filter for a minimum grade.
    - **Request Body**: No body required for this GET request.
    - **Query Parameters**:
    - `min_grade`: (Optional) The minimum grade to filter students by (e.g., `min_grade=85`).
    - `course_name`: (Optional) Specific course name to filter students who completed a particular course (e.g., `course_name="Intro to Machine Learning"`).
    - **Response Body**:
    ```json
    [
        {
        "student_id": "12345",
        "name": "John Doe",
        "course_name": "Machine Learning 101",
        "grade": 90,
        "completion_year": 2024,
        "department": "Computer Science"
        },
        {
        "student_id": "67890",
        "name": "Jane Smith",
        "course_name": "Deep Learning Fundamentals",
        "grade": 88,
        "completion_year": 2024,
        "department": "Computer Science"
        }
    ]

    #### Dependencies:
    - Database service containing student records, course completions, and grades.
    - Course identifiers or tags in the system.

    #### Notes:
    - The min_grade filter should handle numerical values and work with various grading scales (e.g., letter grades may need to be converted into numerical equivalents).
    - Consider implementing caching for frequent queries to improve performance, especially when dealing with large student databases. (e.g., adding filters one by one to narrow results)

# Access to Class Rosters and Class-wide Statistics

    ### User Story: Access to Class Rosters and Class-wide Statistics
    - **Story ID**: US003
    - **As a**: Faculty Member
    - **I want**: Access to class rosters for current and previously taught courses, including a list of students, their majors, and the grades received
    - **So that**: I can review student performance and generate class-wide statistics, such as the overall class GPA

    ---

    #### Acceptance Criteria:
    1. The system should provide faculty with access to class rosters for both current and previously taught courses.
    2. Each roster should include:
    - A list of students.
    - The student’s major.
    - The grade received by each student.
    3. The system should allow the faculty to view class-wide statistics, such as the overall class GPA, based on student grades.
    4. The system should allow filtering by course, semester, and academic year.
    5. The system should ensure that faculty members can only access rosters for courses they have taught or are currently teaching.
    6. The system should display the class GPA in an easy-to-understand format (e.g., average GPA for the class).
    7. If no data is available (e.g., for courses with no students enrolled or if no grades have been recorded yet), the system should display an appropriate message.

    ---

    #### Endpoint(s):
    - **Endpoint**: `/api/class-roster`
    - **Method**: GET
    - **Description**: Retrieves the class roster for the specified course, including student names, majors, grades, and overall class GPA.
    - **Request Body**: No body required for this GET request.
    - **Query Parameters**:
    - `faculty_id`: (Required) The unique identifier of the faculty member (e.g., `faculty_id=123`).
    - `course_id`: (Required) The unique identifier of the course (e.g., `course_id="CS101"`).
    - `semester`: (Optional) The semester to filter by (e.g., `semester="Spring 2024"`).
    - `year`: (Optional) The academic year to filter by (e.g., `year="2024"`).
    - **Response Body**:
    ```json
    {
        "faculty_id": "123",
        "faculty_name": "Dr. John Doe",
        "course_id": "CS101",
        "course_name": "Intro to Computer Science",
        "semester": "Spring 2024",
        "class_roster": [
        {
            "student_id": "1001",
            "student_name": "John Doe",
            "major": "Computer Science",
            "grade": "A"
        },
        {
            "student_id": "1002",
            "student_name": "Jane Smith",
            "major": "Mathematics",
            "grade": "B"
        },
        {
            "student_id": "1003",
            "student_name": "Alex Johnson",
            "major": "Physics",
            "grade": "C"
        }
        ],
        "class_statistics": {
        "total_students": 3,
        "average_gpa": 3.33
        }
    }

    #### Dependencies:

    - Database containing course records, student enrollment, and grades for the courses.
    - Role-based access control to ensure faculty members can only access the rosters for their own courses.
    - A GPA calculation function that computes the class GPA based on student grades.

    #### Notes:

    - The class_statistics field should include any relevant class-wide statistics, such as the average GPA, and could also be expanded to include the distribution of grades (e.g. percentage of students with each grade).
    - Consider supporting filtering by multiple semesters and providing the option to query past courses to allow faculty to view historical rosters.
    - Data privacy is important, and faculty should only have access to the rosters of the courses they are teaching or have taught.
    - If no grades have been assigned yet or if there are no students enrolled in the course, the system should return an appropriate message like "No grades available" or "No students enrolled."

# Retrieve List of Senior Students with Minimum GPA Requirement

    ### User Story: Retrieve List of Senior Students with Minimum GPA Requirement
    - **Story ID**: US004
    - **As a**: Program Coordinator
    - **I want**: To run a query that retrieves a list of senior students who meet a specified minimum GPA requirement for each major
    - **So that**: I can identify outstanding seniors within each program based on academic performance

    ---

    #### Acceptance Criteria:
    1. The system should allow querying of senior students who have completed their penultimate year in their respective programs.
    2. The system should allow setting a minimum GPA filter for each major to identify students who meet the GPA requirement.
    3. The list should include the student's name, major, GPA, and year of study.
    4. The query should return students who have met or exceeded the specified GPA for their major.
    5. If no students match the query, an appropriate message should be displayed (e.g., "No students found matching the criteria").
    6. The system should ensure that data access is restricted based on user roles, allowing only authorized users to run the query.

    ---

    #### Endpoint(s):
    - **Endpoint**: `/api/students/seniors`
    - **Method**: GET
    - **Description**: Retrieves a list of senior students who meet the specified minimum GPA requirement for each major.
    - **Request Body**: No body required for this GET request.
    - **Query Parameters**:
    - `min_gpa`: (Required) The minimum GPA required to filter the students (e.g., `min_gpa=3.5`).
    - `major`: (Required) The major for which the students are being queried (e.g., `major="Computer Science"`).
    - `year`: (Optional) The year of study, defaulting to senior year if not specified (e.g., `year=4` for senior students).
    - **Response Body**:
    ```json
    [
        {
        "student_id": "12345",
        "name": "John Doe",
        "major": "Computer Science",
        "gpa": 3.8,
        "year": 4
        },
        {
        "student_id": "67890",
        "name": "Jane Smith",
        "major": "Computer Science",
        "gpa": 3.9,
        "year": 4
        }
    ]

    #### Dependencies:

    - Database containing student records, including major, GPA, and year of study.
    - Role-based access control system to restrict access to sensitive student data.

    #### Notes:

    - Ensure the database includes an accurate field for the "year" of study, indicating whether a student is in their senior year.
    - Consider implementing pagination for large result sets to ensure the system can handle large numbers of students without performance degradation.
    - The min_gpa parameter should accept numerical values and return students whose GPA is equal to or greater than the specified value.
    - Make sure the query supports multiple majors in case the coordinator needs to check different programs at once. 

# Retrieve Instructor Grade Distribution for Evaluation

    ### User Story: Retrieve Instructor Grade Distribution for Evaluation
    - **Story ID**: US005
    - **As a**: Department Chair
    - **I want**: To be able to determine an instructor's grade distribution for each class, each semester, or over a longer period of time
    - **So that**: I can evaluate faculty performance based on grade distribution, ensuring that faculty members can only access their own data

    ---

    #### Acceptance Criteria:
    1. The system should allow querying of grade distributions for a specific instructor, with filters for class, semester, and time period.
    2. Faculty members should only be able to see their own grade distribution.
    3. The grade distribution should include the breakdown of grades (e.g., A, B, C, etc.) for each course they taught.
    4. The system should support filtering by semester, class, or date range (e.g., last semester, past two years).
    5. The system should provide the data in a clear, easy-to-understand format (e.g., percentage breakdown or histogram of grades).
    6. If the instructor tries to access data for another faculty member, an authorization error should be returned.

    ---

    #### Endpoint(s):
    - **Endpoint**: `/api/grades/distribution`
    - **Method**: GET
    - **Description**: Retrieves grade distribution data for a specific instructor based on the selected filters (class, semester, and time period).
    - **Request Body**: No body required for this GET request.
    - **Query Parameters**:
    - `instructor_id`: (Required) The unique identifier of the instructor (e.g., `instructor_id=123`).
    - `class_id`: (Optional) The specific class for which to retrieve the grade distribution (e.g., `class_id="CS101"`).
    - `semester`: (Optional) The semester for which to retrieve grade distribution (e.g., `semester="Spring 2024"`).
    - `start_date`: (Optional) The start date for a custom date range (e.g., `start_date="2023-01-01"`).
    - `end_date`: (Optional) The end date for a custom date range (e.g., `end_date="2024-01-01"`).
    - **Response Body**:
    ```json
    {
        "instructor_id": "123",
        "class_id": "CS101",
        "semester": "Spring 2024",
        "grade_distribution": {
        "A": 40,
        "B": 35,
        "C": 15,
        "D": 5,
        "F": 5
        }
        {
        "instructor_id": "456",
        "class_id": "CS201",
        "semester": "Fall 2020 - Spring 2024",
        "grade_distribution": {
        "A": 256,
        "B": 211,
        "C": 55,
        "D": 18,
        "F": 11
        }
    }

    #### Dependencies:

    - Database containing grade records for each instructor and class, including semester and grade details.
    - Role-based access control to ensure faculty members only access their own data, and department chairs have access to all faculty data within their department.

    #### Notes:

    - The grade distribution data should be presented in a format that is easy to analyze, such as a percentage breakdown or a histogram.
    - Ensure proper security measures are in place to prevent faculty from accessing the grade distribution data of other instructors.
    - Consider implementing a caching mechanism for faster responses, especially when dealing with large amounts of grade data.
    - The time period filters should allow for flexible date ranges to enable long-term trend analysis (e.g., by semester, yearly, or over the last few years).

# Access Enrollment Numbers at Multiple Levels

    ### User Story: Access Enrollment Numbers at Multiple Levels
    - **Story ID**: US006
    - **As a**: Department Chair or Administrator
    - **I want**: To access enrollment numbers at multiple levels, including program-level, course-level, and faculty-level enrollment
    - **So that**: I can better understand enrollment trends, faculty workload, and overall program performance

    ---

    #### Acceptance Criteria:
    1. The system should allow querying of enrollment numbers for different levels:
    - Program-level enrollment across all programs in the department.
    - Course-level enrollment across all courses in the department.
    - Faculty-level enrollment, showing how many students each instructor is teaching.
    2. The system should provide a clear breakdown of enrollment for each program, course, and faculty member.
    3. Data should be filterable by semester, academic year, or specific time period.
    4. The system should ensure that only authorized users (e.g., department chairs or administrators) can access this data.
    5. The system should return data in an easy-to-understand format (e.g., tables or charts).

    ---

    #### Endpoint(s):
    - **Endpoint**: `/api/enrollment/programs`
    - **Method**: GET
    - **Description**: Retrieves program-level enrollment across all programs in the department.
    - **Request Body**: No body required for this GET request.
    - **Query Parameters**:
    - `department_id`: (Required) The unique identifier of the department (e.g., `department_id=456`).
    - `semester`: (Optional) The semester to filter by (e.g., `semester="Fall 2024"`).
    - `year`: (Optional) The academic year to filter by (e.g., `year="2024"`).
    - **Response Body**:
    ```json
    {
        "department_id": "456",
        "program_enrollment": [
        {
            "program_name": "Computer Science",
            "enrolled_students": 120
        },
        {
            "program_name": "Mathematics",
            "enrolled_students": 90
        }
        ]
    }

    # ########################################## #

    - **Endpoint**: `/api/enrollment/courses`
    - **Method**: GET
    - **Description**: Retrieves course-level enrollment across all programs in the department.
    - **Request Body**: No body required for this GET request.
    - **Query Parameters**:
    - `department_id`: (Required) The unique identifier of the department (e.g., `department_id=456`).
    - `semester`: (Optional) The semester to filter by (e.g., `semester="Fall 2024"`).
    - `year`: (Optional) The academic year to filter by (e.g., `year="2024"`).
    - **Response Body**:
    ```json
    {
        "department_id": "456",
        "program_enrollment": [
        {
            "program_name": "Computer Science",
            "enrolled_students": 120
        },
        {
            "program_name": "Mathematics",
            "enrolled_students": 90
        }
        ]
    }

    # ########################################## #

    - **Endpoint**: `/api/enrollment/faculty`
    - **Method**: GET
    - **Description**: Retrieves faculty-level enrollment showing the number of students taught by each instructor in the department.
    - **Request Body**: No body required for this GET request.
    - **Query Parameters**:
    - `department_id`: (Required) The unique identifier of the department (e.g., `department_id=456`).
    - `semester`: (Optional) The semester to filter by (e.g., `semester="Fall 2024"`).
    - `year`: (Optional) The academic year to filter by (e.g., `year="2024"`).
    - **Response Body**:
    ```json
    {
        "department_id": "456",
        "course_enrollment": [
            {
            "course_name": "CS101 - Intro to Computer Science",
            "enrolled_students": 80
            },
            {
            "course_name": "MATH201 - Calculus II",
            "enrolled_students": 75
            }
        ]
        }

    #### Dependencies:

    - Database containing student enrollment data for courses, programs, and faculty.
    - Role-based access control to ensure that only department chairs or administrators can access this data.

    #### Notes:

    - The system should be able to handle large datasets and return responses quickly, especially when querying across the entire department or multiple years.
    - For large departments, consider paginating the results for course or faculty-level enrollment queries.
    - Ensure that only department chairs or administrators can access these endpoints, to protect sensitive enrollment data.
    - Data should be organized clearly, and include counts for the number of enrolled students per program, course, and faculty member.

# Track Total Credit Hours Generated by Each Instructor

    ### User Story: Track Total Credit Hours Generated by Each Instructor
    - **Story ID**: US007
    - **As a**: Department Chair
    - **I want**: To track the total credit hours generated by each instructor, including the courses they teach and the credit hours generated based on course enrollment
    - **So that**: I can evaluate the workload and credit hour contributions of each instructor in the department

    ---

    #### Acceptance Criteria:
    1. The system should track the total credit hours generated by each instructor, based on the courses they teach and the number of students enrolled.
    2. The system should provide a list of courses taught by each instructor, along with the credit hours for each course and the total generated credit hours.
    3. For each course, the credit hours should be calculated as:
    - `credit_hours_per_course * number_of_students_enrolled`
    4. The system should allow for filtering by semester, academic year, or specific time period.
    5. The system should ensure that only authorized users (department chairs or administrators) can access the data.

    ---

    #### Endpoint(s):
    - **Endpoint**: `/api/credit-hours/instructor`
    - **Method**: GET
    - **Description**: Retrieves the total credit hours generated by an instructor, including the courses they taught and the total credit hours generated.
    - **Request Body**: No body required for this GET request.
    - **Query Parameters**:
    - `instructor_id`: (Required) The unique identifier of the instructor (e.g., `instructor_id=123`).
    - `semester`: (Optional) The semester to filter by (e.g., `semester="Spring 2024"`).
    - `year`: (Optional) The academic year to filter by (e.g., `year="2024"`).
    - **Response Body**:
    ```json
    {
        "instructor_id": "123",
        "instructor_name": "Dr. John Doe",
        "courses": [
        {
            "course_id": "CS101",
            "course_name": "Intro to Computer Science",
            "credit_hours": 3,
            "students_enrolled": 30,
            "total_credit_hours": 90
        },
        {
            "course_id": "CS201",
            "course_name": "Data Structures",
            "credit_hours": 4,
            "students_enrolled": 25,
            "total_credit_hours": 100
        }
        ],
        "total_credit_hours_generated": 190
    }

    #### Dependencies:

    - Database containing course records, student enrollments, and instructor assignments.
    - Role-based access control system to ensure only authorized users (department chairs or administrators) can access the credit hour data.

    #### Notes:

    - The total_credit_hours for each course should be calculated dynamically based on the number of students enrolled and the number of credit hours for the course.
    - For large departments or many courses, consider implementing pagination to handle the data more efficiently.
    - Ensure the system accounts for both undergraduate and graduate courses, if applicable, as credit hours can differ.
    - Provide an option to view credit hours generated over multiple years or semesters for long-term analysis.
    - Display the data in a clear and structured format, summarizing the total credit hours generated by each instructor across all their courses.

# Determine Number of Students Needing to Take a Specific Course

    ### User Story: Determine Number of Students Needing to Take a Specific Course
    - **Story ID**: US008
    - **As a**: Department Chair or Program Coordinator
    - **I want**: To determine the number of students who still need to take a specific course
    - **So that**: I can make informed decisions about which classes need to be offered when creating the schedule of classes

    ---

    #### Acceptance Criteria:
    1. The system should allow querying to determine how many students still need to take a specific course based on their program requirements and completed coursework.
    2. The query should filter students based on their program and the specific course that they need to take.
    3. The system should return the number of students who have not yet completed the course, indicating which students still need to enroll.
    4. The system should allow filtering by semester, academic year, or other relevant time period.
    5. The system should ensure that only authorized users (department chairs or program coordinators) can access this data.

    ---

    #### Endpoint(s):
    - **Endpoint**: `/api/students/needs-course`
    - **Method**: GET
    - **Description**: Retrieves the number of students who still need to take a specific course, based on their program requirements and completed coursework.
    - **Request Body**: No body required for this GET request.
    - **Query Parameters**:
    - `program_id`: (Required) The unique identifier of the program (e.g., `program_id=123`).
    - `course_id`: (Required) The unique identifier of the course (e.g., `course_id="CS101"`).
    - `semester`: (Optional) The semester to filter by (e.g., `semester="Fall 2024"`).
    - `year`: (Optional) The academic year to filter by (e.g., `year="2024"`).
    - **Response Body**:
    ```json
    {
        "program_id": "123",
        "program_name": "Computer Science",
        "course_id": "CS101",
        "course_name": "Intro to Computer Science",
        "students_needed": 50,
        "students_list": [
        {
            "student_id": "1001",
            "student_name": "John Doe",
            "remaining_courses": ["CS101"]
        },
        {
            "student_id": "1002",
            "student_name": "Jane Smith",
            "remaining_courses": ["CS101"]
        }
        ]
    }

    #### Dependencies:

    - Database containing student course enrollment and completion records.
    - A list of program requirements for each course that students need to take to complete their program.
    - Role-based access control to ensure that only department chairs or program coordinators can access this data.

    #### Notes:

    - The system should be able to calculate whether a student has completed the course based on the courses they have enrolled in or successfully passed.
    - It may also be helpful to provide the number of students who need a course in upcoming semesters or academic years to help with long-term planning.
    - The students_list could include details about each student’s progress toward fulfilling their program requirements (e.g., courses completed, remaining courses).
    - Consider providing options to export or visualize the data (e.g., CSV or graph format) to assist with scheduling decisions.

# END #

