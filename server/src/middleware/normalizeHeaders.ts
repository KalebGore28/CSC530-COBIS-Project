import { Request, Response, NextFunction } from "express";

/**
 * Middleware to normalize column headers to lowercase.
 * Looks for a `mappedData` array in the request body and normalizes the column headers to lowercase.
 */
export function normalizeHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
	if (!req.body.mappedData || !Array.isArray(req.body.mappedData)) {
		res.status(400).json({ error: 'Invalid request data: mappedData is required and should be an array.' });
		return
	}

	// Normalize column headers to lowercase
	req.body.mappedData = req.body.mappedData.map((row: { [s: string]: unknown; } | ArrayLike<unknown>) => {
		return Object.fromEntries(
			Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), typeof value === 'string' ? value.trim() : value])
		);
	});

	next();
}