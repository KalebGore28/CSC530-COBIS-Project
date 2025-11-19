import { createFileRoute } from '@tanstack/react-router'
import { getDbConnection } from '@/db'
import { studentAcademicInfo } from '@/db/schema'
import { urlParamsParser } from '@/utils/url-params-parser'
import { getStudentAccess } from '@/utils/get-student-access'

export const Route = createFileRoute(
    '/api/__protected/data/student-academic-info',
)({
    server: {
        handlers: {
            GET: async ({ request, context }) => {
                const user_roles = context.roles
                const { orm } = await getDbConnection()

                const params = new URL(request.url).searchParams

                const { limit, whereConditions, sort } = urlParamsParser(params, studentAcademicInfo)

                let results = await orm
                    .select()
                    .from(studentAcademicInfo)
                    .where(whereConditions)
                    .orderBy(...sort)
                    .limit(limit || 1000) // Default limit to 1000 if not specified

                // Apply student access restrictions based on roles
                if (!user_roles.includes('cobis_administrator') && !user_roles.includes('department_chair')) {
                    const studentAccess = await getStudentAccess(context.mnumber || '', {
                        instructorCheck: false,
                        advisorCheck: true,
                    })
                    results = results.filter((student) =>
                        studentAccess.mnumbers.includes(student.mnumber)
                    )
                }

                return new Response(JSON.stringify(results), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
            }
        }
    }
})