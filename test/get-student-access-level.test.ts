import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'
import { getDb as getTestDb } from './helpers/db'
import {
    createAccessKey,
    getStudentAccessLevel,
    invalidateAccessCache,
} from '@/utils/get-student-access-level'
import { faculty, programs } from '@/db/schema'

vi.mock('@/db', () => ({
    getDb: () => getTestDb(),
}))

describe('createAccessKey', () => {
    it('should create a access key for a student term', () => {
        const key1 = createAccessKey('M123456789', 2023, '10')
        const key2 = createAccessKey('M123456789', 2023, '20')
        const key3 = createAccessKey('M987654321', 2023, '10')

        expect(key1).toBe('M123456789:2023-10')
        expect(key2).toBe('M123456789:2023-20')
        expect(key3).toBe('M987654321:2023-10')
    })
})

describe('invalidateAccessCache', async () => {
    const db = getTestDb()

    // First reassign this instructor to CSC department: M711403719
    await db
        .update(faculty)
        .set({ department_id: 'CSC' })
        .where(eq(faculty.mnumber, 'M711403719'))

    beforeEach(() => {
        // Populate cache with dummy data
        getStudentAccessLevel('M711403719', new Set(['test_role']), 'CSC', {
            bypassCache: true,
        })
    })

    afterEach(() => {
        // Clear cache after each test
        invalidateAccessCache()
    })

    it('should invalidate the entire cache when no mnumber is provided', async () => {
        // Ensure cache has data
        let result = await getStudentAccessLevel(
            'M711403719',
            new Set(['test_role']),
            'CSC',
        )
        expect(result.students.size).toBeGreaterThan(0)

        // Invalidate entire cache
        invalidateAccessCache()

        // Next call with same parameters should bypass cache and repopulate
        result = await getStudentAccessLevel(
            'M711403719',
            new Set(['test_role']),
            'CSC',
            { bypassCache: true },
        )
        expect(result.students.size).toBeGreaterThan(0)
    })

    it('should invalidate cache for a specific user mnumber', async () => {
        // Ensure cache has data
        let result = await getStudentAccessLevel(
            'M711403719',
            new Set(['test_role']),
            'CSC',
        )
        expect(result.students.size).toBeGreaterThan(0)

        // Invalidate cache for specific mnumber
        invalidateAccessCache('M711403719')

        // Next call with same parameters should bypass cache and repopulate
        result = await getStudentAccessLevel(
            'M711403719',
            new Set(['test_role']),
            'CSC',
            { bypassCache: true },
        )
        expect(result.students.size).toBeGreaterThan(0) // Cache repopulated
    })
})

describe('getStudentAccessLevelBeta', async () => {
    const db = getTestDb()

    // First reassign this instructor to CSC department: M711403719
    await db
        .update(faculty)
        .set({ department_id: 'CSC' })
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
        expect(result.terms.get(studentCacheKey)?.accessLevel).toBe(
            'course_scoped',
        )
        expect(result.terms.get(studentCacheKey)?.reason).toBe('instructor')
        expect(result.terms.get(studentCacheKey)?.role).toBe('instructor')
    })

    it('advisor should have full access to their own advised students', async () => {
        const studentCacheKey = createAccessKey('M766995777', 2024, '80')
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['role_irrelevant_for_test']),
            'CSC',
        )

        expect(result.terms).toBeDefined()
        expect(result.terms.get(studentCacheKey)?.accessLevel).toBe('full')
        expect(result.terms.get(studentCacheKey)?.reason).toBe('advisor')
        expect(result.terms.get(studentCacheKey)?.role).toBe('advisor')
    })

    it('admin assistant should have limited access to students in their department', async () => {
        const studentCacheKey = createAccessKey('M766995777', 2022, '90')
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['admin_assistant']),
            'CSC',
        )

        expect(result.terms).toBeDefined()
        expect(result.terms.get(studentCacheKey)?.accessLevel).toBe('limited')
        expect(result.terms.get(studentCacheKey)?.reason).toBe(
            'within_department',
        )
        expect(result.terms.get(studentCacheKey)?.role).toBe('admin_assistant')
    })

    it('department chair should have course scoped access to students taking classes in their department', async () => {
        const studentCacheKey = createAccessKey('M862301697', 2023, '10')
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['department_chair']),
            'ACC',
        )

        expect(result.terms).toBeDefined()
        expect(result.terms.get(studentCacheKey)?.accessLevel).toBe(
            'course_scoped',
        )
        expect(result.terms.get(studentCacheKey)?.reason).toBe(
            'student_course_in_department',
        )
        expect(result.terms.get(studentCacheKey)?.role).toBe('department_chair')
    })

    it('department chair should have full access to students in their department', async () => {
        const studentCacheKey = createAccessKey('M766995777', 2022, '90')
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['department_chair']),
            'CSC',
        )

        expect(result.terms).toBeDefined()
        expect(result.terms.get(studentCacheKey)?.accessLevel).toBe('full')
        expect(result.terms.get(studentCacheKey)?.reason).toBe(
            'within_department',
        )
        expect(result.terms.get(studentCacheKey)?.role).toBe('department_chair')
    })

    it('program coordinator should have full access to students in their programs', async () => {
        // First we need to assign M711403719 as program coordinator for program 'A015'
        await db
            .update(programs)
            .set({
                coordinator: 'M711403719',
            })
            .where(eq(programs.id, 'A015'))

        const studentCacheKey = createAccessKey('M000520156', 2021, '80')
        const result = await getStudentAccessLevel(
            'M711403719',
            new Set(['program_coordinator']),
            'CSC',
        )

        expect(result.terms).toBeDefined()
        expect(result.terms.get(studentCacheKey)?.accessLevel).toBe('full')
        expect(result.terms.get(studentCacheKey)?.reason).toBe('within_program')
        expect(result.terms.get(studentCacheKey)?.role).toBe(
            'program_coordinator',
        )
    })
})
