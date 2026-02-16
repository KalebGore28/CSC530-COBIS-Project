import type { TermAccessKey } from '@/types/access-checks'

export function createTermAccessKey(
    mnumber: string,
    year: number,
    term_id: string,
): TermAccessKey {
    return `${mnumber}:${year}-${term_id}`
}
