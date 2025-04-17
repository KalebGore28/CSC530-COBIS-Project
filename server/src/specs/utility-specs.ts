import { z } from "zod";
export const CurrentTermResponse = z.object({
    term: z.string(),
    year: z.number(),
    termName: z.string()
});

export const UtilityAPISpecs = {
    "/api/utility/current-term": {
        get: {
            summary: "Get current term and year",
            tags: ["Utility"],
            responses: {
                200: {
                    description: "Successfully retrieved current term and year",
                    content: {
                        "application/json": {
                            schema: CurrentTermResponse
                        }
                    }
                },
                500: {
                    description: "Server error"
                }
            }
        }
    }
};