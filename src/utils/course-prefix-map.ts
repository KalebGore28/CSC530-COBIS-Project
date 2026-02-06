import { sql } from 'drizzle-orm'
import { coursePrefixes } from '@/db/schema'
import { getDb } from '@/db'

type CoursePrefixValue = {
    department_code: string | null
    college_code: string | null
}

let cache: {
    map: Map<string, CoursePrefixValue>
    expiresAt: number
} | null = null

const CACHE_TTL_MS = 2 * 60 * 1000 // 2 minutes

async function loadCache(): Promise<Map<string, CoursePrefixValue>> {
    const db = getDb()
    const rows = await db
        .select({
            code: coursePrefixes.code,
            department_code: coursePrefixes.department_code,
            college_code: coursePrefixes.college_code,
        })
        .from(coursePrefixes)

    const map = new Map<string, CoursePrefixValue>()

    for (const row of rows) {
        map.set(row.code, {
            department_code: row.department_code,
            college_code: row.college_code,
        })
    }

    return map
}

export async function getCoursePrefix(
    prefix: string,
): Promise<CoursePrefixValue> {
    const db = getDb()
    const now = Date.now()

    if (!cache || cache.expiresAt <= now) {
        cache = {
            map: await loadCache(),
            expiresAt: now + CACHE_TTL_MS,
        }
    }

    const existing = cache.map.get(prefix)
    if (existing) {
        return existing
    }

    await db
        .insert(coursePrefixes)
        .values({
            code: prefix,
            department_code: null,
            college_code: null,
        })
        .onDuplicateKeyUpdate({ set: { code: sql`code` } })

    const emptyValue: CoursePrefixValue = {
        department_code: null,
        college_code: null,
    }

    cache.map.set(prefix, emptyValue)
    return emptyValue
}
