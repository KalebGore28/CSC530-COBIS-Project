import 'dotenv/config';

import httpServer from './app';
import { createDb } from "./db/connection";

createDb().then(() => {
	console.log('Database connected');
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
await new Promise<void>(resolve =>
    httpServer.listen({ port: PORT }, resolve)
);