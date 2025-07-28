import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache dados por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Manter cache por 10 minutos quando não usado
      gcTime: 10 * 60 * 1000,
      // Retry automático em caso de erro
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch em foco da janela
      refetchOnWindowFocus: false,
      // Refetch quando reconectar
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry para mutations
      retry: 1,
    },
  },
})