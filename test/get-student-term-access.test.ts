import { beforeAll, describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { getDb as getTestDb } from './helpers/db'
import { getStudentTermAccess } from '@/utils/get-student-term-access'
import { programs } from '@/db/schema'

describe('getStudentTermAccess', () => {
    const db = getTestDb()

    beforeAll(async () => {
        // Assign the program coordinator role to the program '1070' for testing purposes
        await db
            .update(programs)
            .set({ coordinator: 'M100000001' })
            .where(eq(programs.id, '1070'))
    })

    it('should return correct accessible students and term access for a user with no additional roles', async () => {
        const userMnumber = 'M100000001'

        const { students, terms } = await getStudentTermAccess(
            db,
            userMnumber,
            new Set(),
            'IRRELEVANT_DEPT',
            { bypassCache: true },
        )

        expect(students).toBeInstanceOf(Set)
        expect(students.size).toEqual(44)

        expect(terms).toBeInstanceOf(Map)
        expect(terms.size).toEqual(152)

        // The only two roles this user can have is instructor or advisor.
        // Instructor role should give course_scoped access, advisor role should give full access.
        for (const [_, entry] of terms.entries()) {
            expect(['course_scoped', 'full']).toContain(entry.accessLevel)
            if (entry.accessLevel === 'course_scoped') {
                expect(entry.reason).toEqual('instructor')
                expect(entry.role).toEqual('instructor')
            } else if (entry.accessLevel === 'full') {
                expect(entry.reason).toEqual('advisor')
                expect(entry.role).toEqual('advisor')
            } else {
                throw new Error(`Unexpected access level: ${entry.accessLevel}`)
            }
        }
    })

    it('should return correct accessible students and term access for a program coordinator user', async () => {
        const userMnumber = 'M100000001'

        const { students, terms } = await getStudentTermAccess(
            db,
            userMnumber,
            new Set(['program_coordinator']),
            'ACC',
            { bypassCache: true },
        )

        // Check that we have the expected students in the accessible set
        expect(students).toBeInstanceOf(Set)
        expect(students.size).toEqual(49)

        // Check that termAccessMap has entries and they have the correct structure
        expect(terms).toBeInstanceOf(Map)
        expect(terms.size).toEqual(167)

        let limitedCount = 0
        let courseScopedCount = 0
        let fullCount = 0

        // Test the entries
        for (const [_, entry] of terms.entries()) {
            if (entry.accessLevel === 'limited') {
                expect(entry.reason).toEqual('within_department')
                expect(entry.role).toEqual('admin_assistant')
                limitedCount++
            } else if (entry.accessLevel === 'course_scoped') {
                expect(entry.reason).toEqual('instructor')
                expect(entry.role).toEqual('instructor')
                courseScopedCount++
            } else {
                if (entry.role === 'advisor') {
                    expect(entry.reason).toEqual('advisor')
                } else if (entry.role === 'program_coordinator') {
                    expect(entry.reason).toEqual('within_program')
                } else {
                    throw new Error(
                        `Unexpected role for full access: ${entry.role}`,
                    )
                }
                fullCount++
            }
        }

        // Check that we have a mix of access levels
        expect(limitedCount).toEqual(0)
        expect(courseScopedCount).toEqual(125)
        expect(fullCount).toEqual(42)
    })

    it('should return correct accessible students and term access for a admin assistant user', async () => {
        const userMnumber = 'M100000001'

        const { students, terms } = await getStudentTermAccess(
            db,
            userMnumber,
            new Set(['admin_assistant']),
            'ACC',
            { bypassCache: true },
        )

        // Check that we have the expected students in the accessible set
        expect(students).toBeInstanceOf(Set)
        expect(students.size).toEqual(49)

        // Check that termAccessMap has entries and they have the correct structure
        expect(terms).toBeInstanceOf(Map)
        expect(terms.size).toEqual(167)

        let limitedCount = 0
        let courseScopedCount = 0
        let fullCount = 0

        // Test the entries
        for (const [_, entry] of terms.entries()) {
            if (entry.accessLevel === 'limited') {
                expect(entry.reason).toEqual('within_department')
                expect(entry.role).toEqual('admin_assistant')
                limitedCount++
            } else if (entry.accessLevel === 'course_scoped') {
                expect(entry.reason).toEqual('instructor')
                expect(entry.role).toEqual('instructor')
                courseScopedCount++
            } else {
                expect(entry.reason).toEqual('advisor')
                expect(entry.role).toEqual('advisor')
                fullCount++
            }
        }

        // Check that we have a mix of access levels
        expect(limitedCount).toEqual(15)
        expect(courseScopedCount).toEqual(134)
        expect(fullCount).toEqual(18)
    })

    it('should return correct accessible students and term access for a department chair user', async () => {
        const userMnumber = 'M100000001'

        const { students, terms } = await getStudentTermAccess(
            db,
            userMnumber,
            new Set(['department_chair']),
            'ACC',
            { bypassCache: true },
        )

        // Check that we have the expected students in the accessible set
        expect(students).toBeInstanceOf(Set)
        expect(students.size).toEqual(49)

        // Check that termAccessMap has entries and they have the correct structure
        expect(terms).toBeInstanceOf(Map)
        expect(terms.size).toEqual(171)

        let limitedCount = 0
        let courseScopedCount = 0
        let fullCount = 0

        // Test the entries
        for (const [_, entry] of terms.entries()) {
            if (entry.accessLevel === 'limited') {
                expect(entry.reason).toEqual('within_department')
                expect(entry.role).toEqual('admin_assistant')
                limitedCount++
            } else if (entry.accessLevel === 'course_scoped') {
                if (entry.role === 'instructor') {
                    expect(entry.reason).toEqual('instructor')
                } else if (entry.role === 'department_chair') {
                    expect(entry.reason).toEqual('student_course_in_department')
                } else {
                    throw new Error(
                        `Unexpected role for course_scoped access: ${entry.role}`,
                    )
                }
                courseScopedCount++
            } else {
                if (entry.role === 'advisor') {
                    expect(entry.reason).toEqual('advisor')
                } else if (entry.role === 'department_chair') {
                    expect(entry.reason).toEqual('within_department')
                } else {
                    throw new Error(
                        `Unexpected role for full access: ${entry.role}`,
                    )
                }
                fullCount++
            }
        }

        // Check that we have a mix of access levels
        expect(limitedCount).toEqual(0)
        expect(courseScopedCount).toEqual(129)
        expect(fullCount).toEqual(42)
    })

    it('should return correct accessible students and term access for a user with multiple roles', async () => {
        const userMnumber = 'M100000001'

        const { students, terms } = await getStudentTermAccess(
            db,
            userMnumber,
            new Set([
                'department_chair',
                'program_coordinator',
                'admin_assistant',
            ]),
            'ACC',
            { bypassCache: true },
        )

        // Check that we have the expected students in the accessible set
        expect(students).toBeInstanceOf(Set)
        expect(students.size).toEqual(49)

        // Check that termAccessMap has entries and they have the correct structure
        expect(terms).toBeInstanceOf(Map)
        expect(terms.size).toEqual(171)

        let limitedCount = 0
        let courseScopedCount = 0
        let fullCount = 0

        // Test the entries
        for (const [_, entry] of terms.entries()) {
            if (entry.accessLevel === 'limited') {
                expect(entry.reason).toEqual('within_department')
                expect(entry.role).toEqual('admin_assistant')
                limitedCount++
            } else if (entry.accessLevel === 'course_scoped') {
                if (entry.role === 'instructor') {
                    expect(entry.reason).toEqual('instructor')
                } else if (entry.role === 'department_chair') {
                    expect(entry.reason).toEqual('student_course_in_department')
                } else {
                    throw new Error(
                        `Unexpected role for course_scoped access: ${entry.role}`,
                    )
                }
                courseScopedCount++
            } else {
                if (entry.role === 'advisor') {
                    expect(entry.reason).toEqual('advisor')
                } else if (entry.role === 'department_chair') {
                    expect(entry.reason).toEqual('within_department')
                } else if (entry.role === 'program_coordinator') {
                    expect(entry.reason).toEqual('within_program')
                } else {
                    throw new Error(
                        `Unexpected role for full access: ${entry.role}`,
                    )
                }
                fullCount++
            }
        }

        // Check that we have a mix of access levels
        expect(limitedCount).toEqual(0)
        expect(courseScopedCount).toEqual(129)
        expect(fullCount).toEqual(42)
    })
})
