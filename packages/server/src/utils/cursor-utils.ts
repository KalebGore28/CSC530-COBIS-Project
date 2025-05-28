// Utility functions (assumed to exist)
export const encodeCursor = (data: { year: number; term: string }) =>
	Buffer.from(JSON.stringify(data)).toString('base64');

export const decodeCursor = (cursor: string) => {
	try {
		return JSON.parse(Buffer.from(cursor, 'base64').toString()) as {
			year: number;
			term: string;
		};
	} catch (error) {
		throw new Error('Invalid cursor');
	}
};

// Builds Relay connection from rows
export const buildConnection = <T>(
	rows: T[],
	first: number,
	getCursor: (row: T) => string
): {
	edges: { cursor: string; node: T }[];
	pageInfo: {
		hasNextPage: boolean;
		hasPreviousPage: boolean;
		startCursor: string | null;
		endCursor: string | null;
	};
} => {
	const edges = rows.slice(0, first).map((row) => ({
		cursor: getCursor(row),
		node: row,
	}));

	return {
		edges,
		pageInfo: {
			hasNextPage: rows.length > first,
			hasPreviousPage: false, // Set to true if supporting backward pagination
			startCursor: edges.length > 0 ? edges[0].cursor : null,
			endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
		},
	};
};