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
        className:
            'bg-[var(--bg-grade-a)] text-[var(--text-grade-a)] border-[var(--border-grade-a)] dark:bg-[var(--bg-grade-a)] dark:text-[var(--text-grade-a)] dark:border-[var(--border-grade-a)]',
        bgVar: 'var(--bg-grade-a)',
        textVar: 'var(--text-grade-a)',
        borderVar: 'var(--border-grade-a)',
    },
    B: {
        gpa: 3.0,
        className:
            'bg-[var(--bg-grade-b)] text-[var(--text-grade-b)] border-[var(--border-grade-b)] dark:bg-[var(--bg-grade-b)] dark:text-[var(--text-grade-b)] dark:border-[var(--border-grade-b)]',
        bgVar: 'var(--bg-grade-b)',
        textVar: 'var(--text-grade-b)',
        borderVar: 'var(--border-grade-b)',
    },
    C: {
        gpa: 2.0,
        className:
            'bg-[var(--bg-grade-c)] text-[var(--text-grade-c)] border-[var(--border-grade-c)] dark:bg-[var(--bg-grade-c)] dark:text-[var(--text-grade-c)] dark:border-[var(--border-grade-c)]',
        bgVar: 'var(--bg-grade-c)',
        textVar: 'var(--text-grade-c)',
        borderVar: 'var(--border-grade-c)',
    },
    D: {
        gpa: 1.0,
        className:
            'bg-[var(--bg-grade-d)] text-[var(--text-grade-d)] border-[var(--border-grade-d)] dark:bg-[var(--bg-grade-d)] dark:text-[var(--text-grade-d)] dark:border-[var(--border-grade-d)]',
        bgVar: 'var(--bg-grade-d)',
        textVar: 'var(--text-grade-d)',
        borderVar: 'var(--border-grade-d)',
    },
    E: {
        gpa: 0.0,
        className:
            'bg-[var(--bg-grade-e)] text-[var(--text-grade-e)] border-[var(--border-grade-e)] dark:bg-[var(--bg-grade-e)] dark:text-[var(--text-grade-e)] dark:border-[var(--border-grade-e)]',
        bgVar: 'var(--bg-grade-e)',
        textVar: 'var(--text-grade-e)',
        borderVar: 'var(--border-grade-e)',
    },
    NA: {
        gpa: null,
        className:
            'bg-[var(--bg-grade-na)] text-[var(--text-grade-na)] border-[var(--border-grade-na)] dark:bg-[var(--bg-grade-na)] dark:text-[var(--text-grade-na)] dark:border-[var(--border-grade-na)]',
        bgVar: 'var(--bg-grade-na)',
        textVar: 'var(--text-grade-na)',
        borderVar: 'var(--border-grade-na)',
    },
} satisfies Record<string, GradeDefinition>

export type GradeKey = keyof typeof GRADE_DEFINITION
export type GradeGPA = (typeof GRADE_DEFINITION)[GradeKey]['gpa']
export type GradeClass = (typeof GRADE_DEFINITION)[GradeKey]['className']
