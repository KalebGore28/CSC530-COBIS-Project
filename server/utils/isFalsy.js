const isFalsy = (value) => {
	if (typeof value === 'string') {
		// Trim and convert to lowercase for consistency
		const normalized = value.trim().toLowerCase();

		// Explicitly check for exact matches
		if (normalized === "false" ||
			normalized === "null" ||
			normalized === "undefined" ||
			normalized === "" ||
			normalized === "0" ||
			normalized === "nan") {
			return true;
		}
	}

	// Check JavaScript's built-in falsy values
	return !value;
};

export default isFalsy;