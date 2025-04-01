/**
 * Result type for parsed term code
 */
export interface ParsedTermCode {
	year: number;
	term: number;
	valid: boolean;
  }
  
  /**
   * Parses a term code string in YYYYMM format
   * @param termCode The term code to parse
   * @returns An object with year and term as numbers, and a valid flag
   */
  export function parseTermCode(termCode: string): ParsedTermCode {
	// Default result for invalid input
	const invalidResult: ParsedTermCode = {
	  year: 0,
	  term: 0,
	  valid: false
	};
  
	// Handle null, undefined, or non-string input
	if (!termCode) {
	  return invalidResult;
	}
  
	// Ensure it's a string and trim whitespace
	const cleanTermCode = String(termCode).trim();
	
	// Check the format using regex
	const match = cleanTermCode.match(/^(\d{4})(\d{2})$/);
	
	if (!match) {
	  return invalidResult;
	}
	
	// Convert captured groups to numbers
	const year = parseInt(match[1], 10);
	const term = parseInt(match[2], 10);
	
	return {
	  year,
	  term, 
	  valid: true
	};
  }