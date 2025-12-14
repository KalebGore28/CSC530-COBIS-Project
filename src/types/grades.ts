export const GRADES = {
    A: 4.0,
    B: 3.0,
    C: 2.0,
    D: 1.0,
    E: 0.0,
} as const

export type GradeKey = keyof typeof GRADES
export type GradeVal = (typeof GRADES)[GradeKey]
