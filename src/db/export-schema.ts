// scripts/export-schema.ts
import { printSchema } from 'graphql';
import { writeFileSync } from 'fs';
import { getDbConnection } from '.';

(async () => {
    const { graphql_schema } = await getDbConnection();

    // Print the schema to SDL
    const sdl = printSchema(graphql_schema);

    // Save it to schema.graphql
    writeFileSync('src/graphql/schema.graphql', sdl);

    console.log('✅ schema.graphql successfully generated!');
})();
