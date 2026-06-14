import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Data stays "fresh" for 60s — no auto-refetch on navigate/focus while fresh (in-memory only; reload always fetches)
            staleTime: 60 * 1000,
            retry: 1,
        },
    },
});