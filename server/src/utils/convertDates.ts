// Helper function to convert DDMMYYYY to YYYY-MM-DD
export function convertDateDDMMYYYY(dateStr: string) {
	if (!dateStr || dateStr.length !== 8) return null; // Ensure valid format
	const day = dateStr.substring(0, 2);
	const month = dateStr.substring(2, 4);
	const year = dateStr.substring(4, 8);
	return `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
}

// Helper function to convert MMDDYYYY to YYYY-MM-DD
export function convertDateMMDDYYYY(dateStr: string) {
	if (!dateStr || dateStr.length !== 8) return null; // Ensure valid format
	const month = dateStr.substring(0, 2);
	const day = dateStr.substring(2, 4);
	const year = dateStr.substring(4, 8);
	return `${year}-${month}-${day}`; // Convert to YYYY-MM-DD
}