import app from "./app";
import { createDb } from "./db/connection";

createDb().then(() => {
	console.log('Database connected');
});

const PORT = 4000;

app.listen(PORT, () => {
	console.log(`🔗Server running on http://localhost:${PORT}`);
});

export default app;