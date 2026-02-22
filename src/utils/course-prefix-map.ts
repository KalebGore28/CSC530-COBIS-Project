import { sql } from 'drizzle-orm'
import { coursePrefixes } from '@/db/schema'
import { getDb } from '@/db'

type CoursePrefixValue = {
    department_id: string | null
    college_id: string | null
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
            id: coursePrefixes.id,
            department_id: coursePrefixes.department_id,
            college_id: coursePrefixes.college_id,
        })
        .from(coursePrefixes)

    const map = new Map<string, CoursePrefixValue>()

    for (const row of rows) {
        map.set(row.id, {
            department_id: row.department_id,
            college_id: row.college_id,
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
            id: prefix,
            department_id: null,
            college_id: null,
        })
        .onDuplicateKeyUpdate({ set: { id: sql`id` } })

    const emptyValue: CoursePrefixValue = {
        department_id: null,
        college_id: null,
    }

    cache.map.set(prefix, emptyValue)
    return emptyValue
}
