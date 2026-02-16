import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'
import { getDb as getTestDb } from './helpers/db'
import {
    createAccessKey,
    getStudentAccessLevel,
    invalidateAccessCache,
} from '@/utils/get-student-access-level'
import { faculty, programs } from '@/db/schema'
import { adminAssistantAccessCheck } from '@/utils/access/admin-assistant-check'

vi.mock('@/db', () => ({
    getDb: () => getTestDb(),
}))

describe('adminAssistantAccessCheck', () => {
    const db = getTestDb()

    it('should return correct accessible students and term access for admin assistant', async () => {
        const userDepartmentId = 'ACC'

        const { accessibleStudents, termAccessMap } =
            await adminAssistantAccessCheck(db, userDepartmentId)

        // Check that we have the expected students in the accessible set
        expect(accessibleStudents).toBeInstanceOf(Set)
        expect(accessibleStudents.size).toEqual(8)

        // Check that termAccessMap has entries and they have the correct structure
        expect(termAccessMap).toBeInstanceOf(Map)
        expect(termAccessMap.size).toEqual(24)

        // There should be 3 term entries for each student (8 students * 3 terms = 24 entries)
        for (const [key, _] of accessibleStudents.entries()) {
            const key1 = createAccessKey(key, 2025, '50')
            const key2 = createAccessKey(key, 2025, '80')
            const key3 = createAccessKey(key, 2025, '90')

            expect(termAccessMap.has(key1)).toBe(true)
            expect(termAccessMap.has(key2)).toBe(true)
            expect(termAccessMap.has(key3)).toBe(true)
        }
    })
})