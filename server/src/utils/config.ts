// /utils/config.js
if (process.env.NODE_ENV !== 'production') {
	console.log("🔁 Environment is not production. Loading dotenv...");
	require('dotenv').config();
}

export const config = {
	sessionSecret: process.env.SESSION_SECRET as string,
	jwtSecret: process.env.JWT_SECRET as string,
	db: {
		url: process.env.DB_URL as string,
	},
	oauth: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			callBack: process.env.GOOGLE_CALLBACK_URL as string,
		}
	}
};