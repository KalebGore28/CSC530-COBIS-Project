import app from "./app";
import { initialize } from "./db.js";

const PORT = 4000;

// Function to start the server only after the database is initialized
const startServer = async () => {
	try {
		await initialize(); // Ensure database is fully set up before starting
		console.log("✅ Database is ready. Starting the server...");

		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
			console.log(`🔗 http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("❌ Failed to initialize database:", error);
		process.exit(1); // Prevent server from starting if DB fails
	}
};

startServer();