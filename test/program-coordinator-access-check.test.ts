import { beforeAll, describe, expect, it } from 'vite-plus/test'
import { eq } from 'drizzle-orm'
import { getDb as getTestDb } from './helpers/db'
import { programCoordinatorAccessCheck } from '@/utils/access-checks/program-coordinator'
import { programs } from '@/db/schema'

describe('programCoordinatorAccessCheck', () => {
    const db = getTestDb()

    beforeAll(async () => {
        // Assign the program coordinator role to the program '1070' for testing purposes
        await db
            .update(programs)
            .set({ coordinator: 'M100000001' })
            .where(eq(programs.id, '1070'))
    })

    it('should return correct accessible students and term access for program coordinator', async () => {
        const userMnumber = 'M100000001'

        const { accessibleStudents, termAccessMap } =
            await programCoordinatorAccessCheck(db, userMnumber)

        // Check that we have the expected students in the accessible set
        expect(accessibleStudents).toBeInstanceOf(Set)
        expect(accessibleStudents.size).toEqual(8)

        // Check that termAccessMap has entries and they have the correct structure
        expect(termAccessMap).toBeInstanceOf(Map)
        expect(termAccessMap.size).toEqual(24)

        // Test the entries
        for (const [_, entry] of termAccessMap.entries()) {
            expect(entry.accessLevel).toEqual('full')
            expect(entry.reason).toEqual('within_program')
            expect(entry.role).toEqual('program_coordinator')
        }
    })
})
