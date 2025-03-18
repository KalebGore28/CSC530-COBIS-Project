import { fromNodeHeaders } from "better-auth/node";
import express, { Request, Response } from 'express';
import { auth } from "../lib/auth";

const app = express();
app.get("/me", async (req: Request, res: Response) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	return res.json(session);
});

export default app;