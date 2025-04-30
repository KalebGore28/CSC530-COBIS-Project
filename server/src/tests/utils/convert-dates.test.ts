// dateUtils.test.ts
import { describe, it, expect } from 'vitest';
import { convertDateDDMMYYYY, convertDateMMDDYYYY } from '../../utils/convert-dates';

// --- Tests for convertDateDDMMYYYY ---
describe('convertDateDDMMYYYY', () => {
    it('should correctly convert a valid DDMMYYYY date string', () => {
        // Arrange: Define the input date string
        const inputDate = '31122023';
        // Act: Call the function
        const result = convertDateDDMMYYYY(inputDate);
        // Assert: Check if the output is the expected YYYY-MM-DD format
        expect(result).toBe('2023-12-31');
    });

    it('should correctly convert another valid DDMMYYYY date string', () => {
        const inputDate = '01012024';
        const result = convertDateDDMMYYYY(inputDate);
        expect(result).toBe('2024-01-01');
    });

    it('should return null for a string with incorrect length', () => {
        // Test with a shorter string
        expect(convertDateDDMMYYYY('3112202')).toBeNull();
        // Test with a longer string
        expect(convertDateDDMMYYYY('311220234')).toBeNull();
    });

    it('should return null for an empty string', () => {
        expect(convertDateDDMMYYYY('')).toBeNull();
    });

    // Vitest implicitly tests for undefined/null if the type is string | null | undefined
    // But we can be explicit if the function signature expects 'string' strictly
    // and handles potential undefined/null internally (as yours does with the check)
    it('should return null for null input', () => {
        // Pass null directly, asserting it aligns with the function's guard clause
        expect(convertDateDDMMYYYY(null as any)).toBeNull(); // Using 'as any' because TS expects string
    });

    it('should return null for undefined input', () => {
         // Pass undefined directly
        expect(convertDateDDMMYYYY(undefined as any)).toBeNull(); // Using 'as any'
    });
});

// --- Tests for convertDateMMDDYYYY ---
describe('convertDateMMDDYYYY', () => {
    it('should correctly convert a valid MMDDYYYY date string', () => {
        // Arrange
        const inputDate = '12312023';
        // Act
        const result = convertDateMMDDYYYY(inputDate);
        // Assert
        expect(result).toBe('2023-12-31');
    });

    it('should correctly convert another valid MMDDYYYY date string', () => {
        const inputDate = '01012024';
        const result = convertDateMMDDYYYY(inputDate);
        expect(result).toBe('2024-01-01');
    });

    it('should return null for a string with incorrect length', () => {
        expect(convertDateMMDDYYYY('1231202')).toBeNull();
        expect(convertDateMMDDYYYY('123120234')).toBeNull();
    });

    it('should return null for an empty string', () => {
        expect(convertDateMMDDYYYY('')).toBeNull();
    });

    it('should return null for null input', () => {
        expect(convertDateMMDDYYYY(null as any)).toBeNull();
    });

    it('should return null for undefined input', () => {
        expect(convertDateMMDDYYYY(undefined as any)).toBeNull();
    });
});