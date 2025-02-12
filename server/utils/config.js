// /utils/config.js
if (process.env.NODE_ENV !== 'production') {
	console.log("🔁 Environment is not production. Loading dotenv...");
	const dotenv = await import('dotenv');
	dotenv.config();
}

const config = {
	googleClientId: process.env.GOOGLE_CLIENT_ID,
	googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
	sessionSecret: process.env.SESSION_SECRET,
	jwtSecret: process.env.JWT_SECRET,
	database: {
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		server: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT),
		database: process.env.DB_DATABASE,
		options: {
			encrypt: process.env.DB_ENCRYPT === 'true',
			trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
		},
	},
};

export default config;