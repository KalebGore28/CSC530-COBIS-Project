// parseCourseCode.test.ts
import { describe, it, expect } from 'vitest';
import { parseCourseCode, ParsedCourseCode } from '../../utils/convert-course-code';

describe('parseCourseCode', () => {
	it('should parse a standard course code correctly', () => {
		const result = parseCourseCode('MATH101');
		const expected: ParsedCourseCode = { subject: 'MATH', number: 101, suffix: '', valid: true };
		expect(result).toEqual(expected);
	});

	it('should parse a course code with a suffix', () => {
		const result = parseCourseCode('CSCI201A');
		const expected: ParsedCourseCode = { subject: 'CSCI', number: 201, suffix: 'A', valid: true };
		expect(result).toEqual(expected);
	});

	it('should handle lowercase letters and convert subject to uppercase', () => {
		const result = parseCourseCode('phys250b');
		const expected: ParsedCourseCode = { subject: 'PHYS', number: 250, suffix: 'b', valid: true };
		expect(result).toEqual(expected);
	});

	it('should trim whitespace before parsing', () => {
		const result = parseCourseCode('  BIO111  ');
		const expected: ParsedCourseCode = { subject: 'BIO', number: 111, suffix: '', valid: true };
		expect(result).toEqual(expected);
	});

	it('should return invalid for null input', () => {
		const result = parseCourseCode(null as any);
		expect(result.valid).toBe(false);
	});

	it('should return invalid for undefined input', () => {
		const result = parseCourseCode(undefined as any);
		expect(result.valid).toBe(false);
	});

	it('should return invalid for an empty string', () => {
		const result = parseCourseCode('');
		expect(result.valid).toBe(false);
	});

	it('should return invalid for a string with only whitespace', () => {
		const result = parseCourseCode('   ');
		expect(result.valid).toBe(false);
	});

	it('should return invalid for codes without numbers', () => {
		const result = parseCourseCode('MATH');
		expect(result.valid).toBe(false);
	});

	it('should return invalid for codes without letters', () => {
		const result = parseCourseCode('101');
		expect(result.valid).toBe(false);
	});

	it('should return invalid for codes with numbers before letters', () => {
		const result = parseCourseCode('101MATH');
		expect(result.valid).toBe(false);
	});

	it('should return invalid for codes with multiple suffixes', () => {
		const result = parseCourseCode('CHEM101XY');
		expect(result.valid).toBe(false);
	});

	it('should return invalid for codes with special characters', () => {
		const result = parseCourseCode('ENG-101');
		expect(result.valid).toBe(false);
	});

	it('should return the default invalid object structure for invalid inputs', () => {
		const result = parseCourseCode('INVALID');
		const expectedInvalid: ParsedCourseCode = { subject: '', number: 0, suffix: '', valid: false };
		expect(result).toEqual(expectedInvalid);
	});
});