import dotenv from 'dotenv';

// Load .env from src/ in dev, but allow override in production
dotenv.config({ path: process.env.NODE_ENV === 'production' ? undefined : 'src/.env' });

export const config = {
  frontend_origin: process.env.FRONTEND_ORIGIN as string,
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