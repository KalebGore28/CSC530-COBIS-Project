import 'dotenv/config';
import { createDb } from "./db/connection";
import httpServer from './app';
import { loadPrefixMap } from './utils/prefixMap';

const PORT = Number(process.env.PORT)

async function start() {
    try {
        await createDb();

        await loadPrefixMap();

        await new Promise<void>(resolve =>
            httpServer.listen({ port: PORT }, resolve)
        );

        console.log(`🚀 Server is running at port: ${PORT}`);
    } catch (err) {
        console.error('❌ Fatal startup error:', err);
        process.exit(1);
    }
}

start();
