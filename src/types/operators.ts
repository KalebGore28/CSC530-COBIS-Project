export const OPERATORS = {
    '=': 'EQ',
    '>=': 'GTE',
    '<=': 'LTE',
    '≠': 'NE',
    '>': 'GT',
    '<': 'LT',
} as const

export type OperatorKey = keyof typeof OPERATORS
export type OperatorVal = (typeof OPERATORS)[OperatorKey]
