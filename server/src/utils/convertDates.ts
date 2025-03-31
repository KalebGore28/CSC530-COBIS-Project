

/**
 * Function to convert date string from DDMMYYYY to YYYY-MM-DD
 * @param dateStr 
 * @returns 
 */
export function convertDateDDMMYYYY(dateStr: string) {
	if (!dateStr || dateStr.length !== 8) return null; // Ensure valid format
	const day = dateStr.substring(0, 2);
	const month = dateStr.substring(2, 4);
	const year = dateStr.substring(4, 8);
	return `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
}

/**
 * Function to convert date string from MMDDYYYY to YYYY-MM-DD
 * @param dateStr 
 * @returns 
 */
export function convertDateMMDDYYYY(dateStr: string) {
	if (!dateStr || dateStr.length !== 8) return null; // Ensure valid format
	const month = dateStr.substring(0, 2);
	const day = dateStr.substring(2, 4);
	const year = dateStr.substring(4, 8);
	return `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
}