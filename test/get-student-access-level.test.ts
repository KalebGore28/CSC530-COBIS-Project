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

    // The faculty should have full access to this student as department_chair: M806281144
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

    // The faculty should have no access to this student as faculty: M806281144
    it('department chair should have no access to a student not enrolled in one of their courses or a program in their same department', async () => {
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['role_irrelevant_for_test']),
            'CSC',
        )

        expect(result.mnumbers).toBeDefined()
        expect(result.mnumbers?.get('M806281144')).toBeUndefined()
    })

    // The faculty should have limited access to this student as admin_assistant: M806281144
    it('admin assistant should have limited access to a student in their department', async () => {
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['admin_assistant']),
            'CSC',
        )

        expect(result.mnumbers).toBeDefined()
        expect(result.mnumbers?.get('M806281144')?.accessLevel).toBe(
            'limited',
        )
        expect(result.mnumbers?.get('M806281144')?.reason).toBe(
            'admin_assistant',
        )
    })

    // Faculty should have course_scoped access to their own students: M806281144
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
})
