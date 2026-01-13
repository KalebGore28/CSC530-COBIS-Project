import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'
import { getDb as getTestDb } from './helpers/db'
import { getStudentAccessLevel, createAccessKey } from '@/utils/get-student-access-level-beta'
import { faculty } from '@/db/schema'

vi.mock('@/db', () => ({
    getDb: () => getTestDb(),
}))

describe('getStudentAccessLevelBeta', async () => {
    const db = getTestDb()

    // First reassign this instructor to CSC department: M711403719
    await db
        .update(faculty)
        .set({ department_code: 'CSC' })
        .where(eq(faculty.mnumber, 'M711403719'))

    it('faculty should have course_scoped access to their own students', async () => {
        const studentCacheKey = createAccessKey('M000271999', 2020, '50')
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['role_irrelevant_for_test']),
            'CSC',
        )

        expect(result.terms).toBeDefined()
        expect(result.terms?.get(studentCacheKey)?.accessLevel).toBe(
            'course_scoped',
        )
        expect(result.terms?.get(studentCacheKey)?.reason).toBe('instructor_course_assignment')
        expect(result.terms?.get(studentCacheKey)?.role).toBe('instructor')
    })

    it('advisor should have full access to their own advised students', async () => {
        const studentCacheKey = createAccessKey('M766995777', 2024, '80')
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['role_irrelevant_for_test']),
            'CSC',
        )

        expect(result.terms).toBeDefined()
        expect(result.terms?.get(studentCacheKey)?.accessLevel).toBe('full')
        expect(result.terms?.get(studentCacheKey)?.reason).toBe('advisor_assignment')
        expect(result.terms?.get(studentCacheKey)?.role).toBe('advisor')
    })
})
