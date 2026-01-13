import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'
import { getDb as getTestDb } from './helpers/db'
import { getStudentAccessLevel } from '@/utils/get-student-access-level'
import { faculty } from '@/db/schema'

vi.mock('@/db', () => ({
    getDb: () => getTestDb(),
}))

describe('getStudentAccessLevel', async () => {
    const db = getTestDb()

    // First reassign this instructor to CSC department: M711403719
    await db
        .update(faculty)
        .set({ department_code: 'CSC' })
        .where(eq(faculty.mnumber, 'M711403719'))

    it('department chair should have full access to a student enrolled in a program in the same department', async () => {
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['department_chair']),
            'CSC',
        )

        expect(result.mnumbers).toBeDefined()
        expect(result.mnumbers?.get('M806281144')?.accessLevel).toBe('full')
        expect(result.mnumbers?.get('M806281144')?.reason).toBe(
            'department_chair',
        )
    })

    it('department chair should have no access to a student not enrolled in one of their courses or a program in their same department', async () => {
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['department_chair']),
            'CSC',
        )

        expect(result.mnumbers).toBeDefined()
        expect(result.mnumbers?.get('M000708613')).toBeUndefined()
    })

    it('admin assistant should have limited access to a student in their department', async () => {
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['admin_assistant']),
            'CSC',
        )

        expect(result.mnumbers).toBeDefined()
        expect(result.mnumbers?.get('M806281144')?.accessLevel).toBe('limited')
        expect(result.mnumbers?.get('M806281144')?.reason).toBe(
            'admin_assistant',
        )
    })

    it('faculty should have course_scoped access to their own students', async () => {
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['role_irrelevant_for_test']),
            'CSC',
        )

        expect(result.mnumbers).toBeDefined()
        expect(result.mnumbers?.get('M000271999')?.accessLevel).toBe(
            'course_scoped',
        )
        expect(result.mnumbers?.get('M000271999')?.reason).toBe('instructor')
    })

    it('advisor should have full access to their own advised students', async () => {
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['role_irrelevant_for_test']),
            'CSC',
        )

        expect(result.mnumbers).toBeDefined()
        expect(result.mnumbers?.get('M766995777')?.accessLevel).toBe('full')
        expect(result.mnumbers?.get('M766995777')?.reason).toBe('advisor')
    })
})
