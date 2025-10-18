import DataLoader from 'dataloader'
import { sql } from 'drizzle-orm'
import { studentCourses } from '../../db/schema'
import type { DbConnection } from '../../db'

type StudentCourse = typeof studentCourses.$inferSelect

// our “composite key” string format
function courseKey({
  term_code,
  year,
  course_subject,
  course_number,
  course_suffix,
  course_section,
}: {
  term_code: string
  year: number
  course_subject: string
  course_number: number
  course_suffix: string
  course_section: string
}) {
  return [term_code, year, course_subject, course_number, course_suffix, course_section].join('|')
}


export function createStudentsByCourseLoader(db: DbConnection['orm']) {
  return new DataLoader<string, StudentCourse[]>(async (keys) => {
    console.log("StudentsByCourseLoader - Loading keys:", keys);
    const parts = keys.map((k) => k.split('|'))
    const tuples = sql.join(
      parts.map(
        ([term, year, subject, number, suffix, section]) =>
          sql`(${term}, ${Number(year)}, ${subject}, ${Number(number)}, ${suffix}, ${section})`,
      ),
      sql`, `,
    )

    // single batched query
    const rows = await db
      .select()
      .from(studentCourses)
      .where(
        sql`(
          ${studentCourses.term_code},
          ${studentCourses.year},
          ${studentCourses.course_subject},
          ${studentCourses.course_number},
          ${studentCourses.course_suffix},
          ${studentCourses.course_section}
        ) IN (${tuples})`

      )
      .orderBy(
        sql`${studentCourses.year} DESC, ${studentCourses.term_code} DESC`,
      )

    console.log("StudentsByCourseLoader - Fetched Rows:", rows);

    // group by composite key
    const map = rows.reduce<Record<string, typeof rows>>((acc, row) => {
      const k = courseKey(row)
        ; (acc[k] ||= []).push(row)
      return acc
    }, {})

    // preserve original key order
    return keys.map((k) => map[k] ?? [])
  })
}
