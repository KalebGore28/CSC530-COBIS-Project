import { describe, expect, it } from 'vite-plus/test'
import { getDb as getTestDb } from './helpers/db'
import { departmentChairAccessCheck } from '@/utils/access-checks/department-chair'

describe('departmentChairAccessCheck', () => {
    const db = getTestDb()

    /**
     * Sanity Check SQl Queries:
     *
     * Course Scoped Access Only:
     * SELECT
     *      COUNT(DISTINCT sc.mnumber) AS distinct_student_count
     * FROM student_courses sc
     * INNER JOIN courses c
     *      ON sc.course_id = c.id
     * WHERE c.department_id = 'ACC';
     *
     * Full Access Only:
     * SELECT
     *      COUNT(DISTINCT sp.mnumber) AS distinct_student_count
     * FROM student_programs sp
     * INNER JOIN programs p
     *      ON sp.program_id = p.id
     * WHERE p.department_id = 'ACC';
     *
     * Combined Logic (should match the function's accessible students result):
     * SELECT COUNT(DISTINCT mnumber) AS distinct_student_count
     * FROM (
     *      SELECT sc.mnumber
     *      FROM student_courses sc
     *      INNER JOIN courses c
     *          ON sc.course_id = c.id
     *      WHERE c.department_id = 'ACC'
     *
     *      UNION
     *
     *      SELECT sp.mnumber
     *      FROM student_programs sp
     *      INNER JOIN programs p
     *          ON sp.program_id = p.id
     *      WHERE p.department_id = 'ACC'
     * ) AS combined_students;
     */
    it('should return correct accessible students and term access for department chair', async () => {
        const userDepartmentId = 'ACC'

        const { accessibleStudents, termAccessMap } =
            await departmentChairAccessCheck(db, userDepartmentId)

        // Check that we have the expected students in the accessible set
        expect(accessibleStudents).toBeInstanceOf(Set)
        expect(accessibleStudents.size).toEqual(41)

        // Check that termAccessMap has entries and they have the correct structure
        expect(termAccessMap).toBeInstanceOf(Map)
        expect(termAccessMap.size).toEqual(159)

        let fullAccessCount = 0
        let courseScopedAccessCount = 0

        // Test the entries
        for (const [_, entry] of termAccessMap.entries()) {
            // Count the number of entries that have full access
            if (entry.accessLevel === 'full') {
                fullAccessCount++
                expect(entry.reason).toEqual('within_department')
                expect(entry.role).toEqual('department_chair')
            } else if (entry.accessLevel === 'course_scoped') {
                courseScopedAccessCount++
                expect(entry.reason).toEqual('student_course_in_department')
                expect(entry.role).toEqual('department_chair')
            }
        }

        expect(fullAccessCount).toEqual(24)
        expect(courseScopedAccessCount).toEqual(135)
    })
})
