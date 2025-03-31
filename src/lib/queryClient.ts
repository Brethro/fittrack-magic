
import { QueryClient } from "@tanstack/react-query";

// Initialize React Query client with error handling
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Only retry network or timeout errors, not 4xx/5xx errors
        const err = error as Error;
        const shouldRetry = 
          !err.message?.includes('401') && 
          !err.message?.includes('403') && 
          failureCount < 2;
        return shouldRetry;
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry network errors, not application errors
        const err = error as Error;
        const shouldRetry = 
          !err.message?.includes('401') && 
          !err.message?.includes('403') && 
          failureCount < 1;
        return shouldRetry;
      },
    },
  },
});
