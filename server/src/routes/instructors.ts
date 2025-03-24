import express from 'express';
import { and, eq, sql } from "drizzle-orm";
import { getDbConnection } from "../db/connection";
import { instructorCourses } from "../db/models/instructor_courses";
import { studentCourses } from "../db/models/student_courses";

const router = express.Router()
router.get('/credit-hours', async (req: any, res: any) => {
  const dbConnectionInstance = await getDbConnection();
  const db = dbConnectionInstance.orm;
  const { instructorId, termCode, year } = req.query;

  // Validate query parameters
  if (!instructorId || !termCode || !year) {
    return res
      .status(400)
      .json({ error: "instructorId, termCode, and year are required." });
  }

  // Convert year from string to number
  const yearInt = parseInt(year as string, 10);
  if (isNaN(yearInt)) {
    return res
      .status(400)
      .json({ error: "Year must be a valid integer." });
  }

  try {
    const yearInt = parseInt(year as string, 10);

    const instructorCoursesResult = await db
      .select({
        totalCreditHours: sql<number>`COALESCE(SUM(${studentCourses.course_hours}), 0)`
      })
      .from(instructorCourses)
      .leftJoin(
        studentCourses,
        and(
          eq(instructorCourses.course_subject, studentCourses.course_subject),
          eq(instructorCourses.course_number, studentCourses.course_number),
          eq(instructorCourses.course_suffix, studentCourses.course_suffix),
          eq(instructorCourses.term, studentCourses.term),
          eq(instructorCourses.year, studentCourses.year)
        )
      )
      .where(
        and(
          eq(instructorCourses.user_id, instructorId as string),
          eq(instructorCourses.term, termCode as string),
          eq(instructorCourses.year, yearInt)
        )
      );

    return res.json(instructorCoursesResult[0]);
  } catch (error) {
    console.error("Error fetching credit hours:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;