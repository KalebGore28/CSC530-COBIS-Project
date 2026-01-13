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

    it('the access level check should meet performance tiers', async () => {
        const start = performance.now()
        await getStudentAccessLevel(
            'M711403719',
            new Set(['role_irrelevant_for_test']),
            'CSC',
        )
        const duration = performance.now() - start

        console.log(`Access level check took ${duration.toFixed(2)} ms`)

        // Performance tier warnings
        if (duration >= 1000) {
            console.warn('⚠️  UNACCEPTABLE: Access check took over 1 second!')
        } else if (duration >= 500) {
            console.warn('⚠️  WARNING: Access check took over 500ms')
        } else if (duration >= 200) {
            console.warn('⚠️  ACCEPTABLE: Access check took over 200ms')
        } else {
            console.log('✓ IDEAL: Access check completed in under 200ms')
        }

        // Expect ideal performance
        expect(duration).toBeLessThan(200) // Ideal: < 200ms
    })

    it('cached access level check should be instant', async () => {
        // First call to populate cache
        await getStudentAccessLevel('M711403719', new Set(['test']), 'CSC')

        // Second call should hit cache
        const start = performance.now()
        await getStudentAccessLevel('M711403719', new Set(['test']), 'CSC')
        const duration = performance.now() - start

        console.log(`Cached check took ${duration.toFixed(2)} ms`)

        if (duration >= 5) {
            console.warn('Cache is slower than expected')
        } else {
            console.log('Cache performance is excellent')
        }

        expect(duration).toBeLessThan(5) // Cache should be nearly instant
    })

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
