// parseTermCode.test.ts
import { describe, it, expect } from 'vitest';
import { parseTermCode, ParsedTermCode } from '../../utils/convert-term-code';

describe('parseTermCode', () => {
    it('should parse a valid YYYYMM term code correctly', () => {
        const result = parseTermCode('202308');
        const expected: ParsedTermCode = { year: 2023, term: '08', valid: true };
        expect(result).toEqual(expected);
    });

    it('should parse another valid YYYYMM term code', () => {
        const result = parseTermCode('202401');
        const expected: ParsedTermCode = { year: 2024, term: '01', valid: true };
        expect(result).toEqual(expected);
    });

    it('should trim whitespace before parsing', () => {
        const result = parseTermCode('  202505  ');
        const expected: ParsedTermCode = { year: 2025, term: '05', valid: true };
        expect(result).toEqual(expected);
    });

    it('should return invalid for null input', () => {
        const result = parseTermCode(null as any);
        expect(result.valid).toBe(false);
    });

    it('should return invalid for undefined input', () => {
        const result = parseTermCode(undefined as any);
        expect(result.valid).toBe(false);
    });

    it('should return invalid for an empty string', () => {
        const result = parseTermCode('');
        expect(result.valid).toBe(false);
    });

     it('should return invalid for a string with only whitespace', () => {
        const result = parseTermCode('   ');
        expect(result.valid).toBe(false);
    });

    it('should return invalid for codes shorter than 6 digits', () => {
        const result = parseTermCode('20230');
        expect(result.valid).toBe(false);
    });

    it('should return invalid for codes longer than 6 digits', () => {
        const result = parseTermCode('2023081');
        expect(result.valid).toBe(false);
    });

    it('should return invalid for codes with non-digit characters', () => {
        const result = parseTermCode('2023AB');
        expect(result.valid).toBe(false);
    });

    it('should return invalid for codes with separators', () => {
        const result = parseTermCode('2023-08');
        expect(result.valid).toBe(false);
    });

    it('should return the default invalid object structure for invalid inputs', () => {
        const result = parseTermCode('INVALID');
        const expectedInvalid: ParsedTermCode = { year: 0, term: '0', valid: false };
        expect(result).toEqual(expectedInvalid);
    });
});