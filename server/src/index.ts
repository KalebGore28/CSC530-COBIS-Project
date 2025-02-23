import app from "./app";

const PORT = 4000;

app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`🔗 http://localhost:${PORT}`);
});

export default app;