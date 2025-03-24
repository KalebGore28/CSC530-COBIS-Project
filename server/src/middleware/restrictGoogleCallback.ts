import { Request, Response, NextFunction } from "express";


export const restrictGoogleCallback = (req: Request, res: Response, next: NextFunction): void => {
	const hd = typeof req.query.hd === 'string' ? req.query.hd : undefined; // Ensure hd is a string
	const allowedDomains = ['murraystate.edu']; // Your allowed domains

	// Check if hd exists and is in the allowed list
	if (!hd || !allowedDomains.includes(hd)) { // Check if hd exists and is in the allowed list
		res.status(403).json({ error: 'Access restricted to specific domains' });
		return;
	}

	// If it passes, move on to the next step (e.g., authentication handler)
	next();
};