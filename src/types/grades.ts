type GradeDefinition = {
    gpa: number | null
    className: string
    bgVar: string
    textVar: string
    borderVar: string
}

export const GRADE_DEFINITION = {
    A: {
        gpa: 4.0,
        className: '',
        bgVar: 'var(--chart-1)',
        textVar: 'var(--chart-1)',
        borderVar: 'var(--chart-1)',
    },
    B: {
        gpa: 3.0,
        className: '',
        bgVar: 'var(--chart-2)',
        textVar: 'var(--chart-2)',
        borderVar: 'var(--chart-2)',
    },
    C: {
        gpa: 2.0,
        className: '',
        bgVar: 'var(--chart-3)',
        textVar: 'var(--chart-3)',
        borderVar: 'var(--chart-3)',
    },
    D: {
        gpa: 1.0,
        className: '',
        bgVar: 'var(--chart-4)',
        textVar: 'var(--chart-4)',
        borderVar: 'var(--chart-4)',
    },
    E: {
        gpa: 0.0,
        className: '',
        bgVar: 'var(--chart-5)',
        textVar: 'var(--chart-5)',
        borderVar: 'var(--chart-5)',
    },
    NA: {
        gpa: null,
        className: '',
        bgVar: 'var(--bg-grade-na)',
        textVar: 'var(--text-grade-na)',
        borderVar: 'var(--border-grade-na)',
    },
} satisfies Record<string, GradeDefinition>

export type GradeKey = keyof typeof GRADE_DEFINITION
export type GradeGPA = (typeof GRADE_DEFINITION)[GradeKey]['gpa']
export type GradeClass = (typeof GRADE_DEFINITION)[GradeKey]['className']
