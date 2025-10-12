import { toast } from "sonner"

const GRAPHQL_ENDPOINT = "/api/graphql";

export const fetchGraphQL = async (query: string, variables: any) => {
	const res = await fetch(GRAPHQL_ENDPOINT, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ query, variables }),
	});
	const json = await res.json();
	if (json.errors) {
		const errorMessage = json.errors.map((error: any) => error.message).join(", ");
		toast.error(`GraphQL Error: ${errorMessage}`);
	}
	return json.data;
};