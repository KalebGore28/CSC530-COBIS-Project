// import { Request, Response, NextFunction } from "express";

export function normalizeHeadersMiddleware(req, res, next) {
	if (!req.body.mappedData || !Array.isArray(req.body.mappedData)) {
		return res.status(400).json({ error: 'Invalid request data: mappedData is required and should be an array.' });
	}

	// Normalize column headers to lowercase
	req.body.mappedData = req.body.mappedData.map((row: { [s: string]: unknown; } | ArrayLike<unknown>) => {
		return Object.fromEntries(
			Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), typeof value === 'string' ? value.trim() : value])
		);
	});

	next(); // Move to the next middleware/route handler
}