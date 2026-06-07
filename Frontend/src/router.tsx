import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, // Prevents queries from refetching when switching tabs/windows
        refetchOnReconnect: false,   // Prevents background calls when network status changes
        retry: 1,                    // Limits automatic failure retries to 1
        staleTime: 15 * 1000,        // Considers data fresh for 15s to reduce repetitive hits
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
