import type { TypedDocumentString } from './graphql'

export async function execute<TResult, TVariables>(
    query: TypedDocumentString<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
    const response = await fetch(import.meta.env.VITE_GRAPHQL_HTTP_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/graphql-response+json'
        },
        body: JSON.stringify({
            query,
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