/**
 * API layer exports
 */

// Re-export all Ghost and Printful API functions and types
export * from './ghost';
export * from './printful';

// TODO: Add React Query integration hooks in separate file
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 minutes
//       refetchOnWindowFocus: false,
//     },
//   },
// });