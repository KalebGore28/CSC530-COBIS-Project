import { describe, expect, it } from 'vite-plus/test'
import { getDb as getTestDb } from './helpers/db'
import { advisorAccessCheck } from '@/utils/access-checks/advisor'

describe('advisorAccessCheck', () => {
    const db = getTestDb()

    it('should return correct accessible students and term access for advisor', async () => {
        const userMnumber = 'M100000001'

        const { accessibleStudents, termAccessMap } = await advisorAccessCheck(
            db,
            userMnumber,
        )

        // Check that we have the expected students in the accessible set
        expect(accessibleStudents).toBeInstanceOf(Set)
        expect(accessibleStudents.size).toEqual(12)

        // Check that termAccessMap has entries and they have the correct structure
        expect(termAccessMap).toBeInstanceOf(Map)
        expect(termAccessMap.size).toEqual(18)

        // Test is the entries
        for (const [_, entry] of termAccessMap.entries()) {
            expect(entry.accessLevel).toEqual('full')
            expect(entry.reason).toEqual('advisor')
            expect(entry.role).toEqual('advisor')
        }
    })

    it('should return empty sets for a user who has no advisees', async () => {
        const userMnumber = 'M100000010'

        const { accessibleStudents, termAccessMap } = await advisorAccessCheck(
            db,
            userMnumber,
        )

        expect(accessibleStudents).toBeInstanceOf(Set)
        expect(accessibleStudents.size).toEqual(0)

        expect(termAccessMap).toBeInstanceOf(Map)
        expect(termAccessMap.size).toEqual(0)
    })
})
