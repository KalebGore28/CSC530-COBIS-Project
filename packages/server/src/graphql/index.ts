import { readFileSync } from 'fs'
import path, { dirname } from 'path'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { resolvers } from './resolvers'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const typeDefs = readFileSync(
	path.join(__dirname, 'schema.graphql'),
	'utf8'
)

export const schema = makeExecutableSchema({ typeDefs, resolvers })