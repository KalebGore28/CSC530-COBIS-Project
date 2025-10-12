import 'dotenv/config';
import { getDbConnection } from "./db";
import httpServer from './app';
import { loadPrefixMap } from './utils/prefixMap';

const PORT = Number(process.env.PORT);

let server: Awaited<ReturnType<typeof httpServer.listen>> | null = null;

async function start() {
    try {
        await loadPrefixMap();

        await new Promise<void>((resolve) => {
            server = httpServer.listen({ port: PORT }, resolve);
        });

        console.log(`🚀 Server is running at port: ${PORT}`);
    } catch (err) {
        console.error('❌ Fatal startup error:', err);
        process.exit(1);
    }
}

// Graceful shutdown for Cloud Run
process.on('SIGTERM', async () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');

    try {
        if (server && typeof server.close === 'function') {
            await new Promise<void>((resolve, reject) =>
                server!.close((err?: Error) => (err ? reject(err) : resolve()))
            );
            console.log('✅ HTTP server closed.');
        }

        const dbConn = await getDbConnection();
        await dbConn.db.end(); // Close MySQL pool
        console.log('✅ Database pool closed.');
    } catch (err) {
        console.error('❌ Error during shutdown:', err);
    } finally {
        process.exit(0);
    }
});

start();