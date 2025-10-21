import type { TypedDocumentString } from './graphql'
import persistedMap from '../../persisted-queries/client.json';

function extractOperationName(query: any): string | null {
    const raw = query.value;
    const match = raw.match(/\b(query|mutation|subscription)\s+([A-Za-z0-9_]+)/);
    return match ? match[2] : null;
}

export async function execute<TResult, TVariables>(
    query: TypedDocumentString<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
    // Extract the operation name
    const operationName = extractOperationName(query);
    if (!operationName) {
        throw new Error("Could not extract GraphQL operation name");
    }

    // Lookup hash from persisted map
    const hash = (persistedMap as Record<string, string>)[operationName];
    if (!hash) {
        throw new Error(`No persisted query hash found for: ${operationName}`);
    }

    const response = await fetch("https://cobis-migration-694292090335.us-central1.run.app/api/graphql", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/graphql-response+json'
        },
        body: JSON.stringify({
            doc_id: hash,
            variables
        })
    })

    if (!response.ok) {
        throw new Error('Network response was not ok')
    }

    const json = await response.json();
    if (json.errors) {
        console.error(json.errors);
        throw new Error('GraphQL execution error');
    }
    return json.data as TResult; // ✅ unwrap

}