/**
 * Result type for parsed course code
 */
export interface ParsedCourseCode {
	subject: string;
	number: number;
	suffix: string;
	valid: boolean;
  }
  
  /**
   * Parses a course code string (e.g., "AGR100", "MATH101T")
   * @param courseCode The course code to parse
   * @returns An object with subject, number, and optional suffix
   */
  export function parseCourseCode(courseCode: string): ParsedCourseCode {
	// Default result for invalid input
	const invalidResult: ParsedCourseCode = {
	  subject: '',
	  number: 0,
	  suffix: '',
	  valid: false
	};
  
	// Handle null, undefined, or non-string input
	if (!courseCode) {
	  return invalidResult;
	}
  
	// Ensure it's a string and trim whitespace
	const cleanCode = String(courseCode).trim();
	
	// Match pattern: letters + numbers + optional letter suffix
	const match = cleanCode.match(/^([A-Za-z]+)(\d+)([A-Za-z]?)$/);
	
	if (!match) {
	  return invalidResult;
	}
	
	// Parse the components
	const subject = match[1].toUpperCase();  // Convert to uppercase
	const number = parseInt(match[2], 10);
	const suffix = match[3] || ''; // Empty string if no suffix exists
	
	return {
	  subject,
	  number,
	  suffix,
	  valid: true
	};
  }