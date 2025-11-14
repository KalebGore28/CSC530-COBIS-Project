import { SQLWrapper, and, eq, like, ilike, lt, lte, gt, gte } from "drizzle-orm"
import { AnyMySqlTable } from "drizzle-orm/mysql-core"

export function urlParamsWhereParser(params: URLSearchParams, table: AnyMySqlTable) {
    const whereConditions: SQLWrapper[] = []

    params.forEach((value, key) => {
        if (key === 'limit' || key === 'sort') return // Skip non-where params
        if (key.endsWith('_eq')) {
            const field = key.slice(0, -3)
            const col = (table as any)[field]
            if (!col) return
            whereConditions.push(eq(col, value))
        } else if (key.endsWith('_lt')) {
            const field = key.slice(0, -3)
            const col = (table as any)[field]
            if (!col) return
            whereConditions.push(lt(col, value))
        } else if (key.endsWith('_lte')) {
            const field = key.slice(0, -4)
            const col = (table as any)[field]
            if (!col) return
            whereConditions.push(lte(col, value))
        } else if (key.endsWith('_gt')) {
            const field = key.slice(0, -3)
            const col = (table as any)[field]
            if (!col) return
            whereConditions.push(gt(col, value))
        } else if (key.endsWith('_gte')) {
            const field = key.slice(0, -4)
            const col = (table as any)[field]
            if (!col) return
            whereConditions.push(gte(col, value))
        } else if (key.endsWith('_like')) {
            const field = key.slice(0, -5)
            const col = (table as any)[field]
            if (!col) return
            whereConditions.push(like(col, `%${value}%`))
        } else if (key.endsWith('_ilike')) {
            const field = key.slice(0, -6)
            const col = (table as any)[field]
            if (!col) return
            whereConditions.push(ilike(col, `%${value}%`))
        }
    })

    return and(...whereConditions)
}