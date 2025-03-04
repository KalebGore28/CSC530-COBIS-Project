import dotenv from 'dotenv';
dotenv.config({ path: 'src/.env' });

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