import { describe, expect, it } from 'vitest'
import { getDb as getTestDb } from './helpers/db'
import { adminAssistantAccessCheck } from '@/utils/access/admin-assistant-check'

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

        // Test the entries
        for (const [_, entry] of termAccessMap.entries()) {
            expect(entry.accessLevel).toEqual('limited')
            expect(entry.reason).toEqual('within_department')
            expect(entry.role).toEqual('admin_assistant')
        }
    })

    it('should return empty sets for a department with no students', async () => {
        const userDepartmentId = 'NON_EXISTENT_DEPT'

        const { accessibleStudents, termAccessMap } =
            await adminAssistantAccessCheck(db, userDepartmentId)

        expect(accessibleStudents).toBeInstanceOf(Set)
        expect(accessibleStudents.size).toEqual(0)

        expect(termAccessMap).toBeInstanceOf(Map)
        expect(termAccessMap.size).toEqual(0)
    })
})
