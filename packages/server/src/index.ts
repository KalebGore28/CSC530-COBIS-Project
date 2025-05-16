import 'dotenv/config';

import app from "./app";
import { createDb } from "./db/connection";

createDb().then(() => {
	console.log('Database connected');
});

const PORT = 4000;

app.listen(PORT, '0.0.0.0', () => {
	console.log(`🔗Server running on http://localhost:${PORT}`);
});

export default app;