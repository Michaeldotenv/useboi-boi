'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { theme } from './theme'
import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return <QueryClientProvider client={queryClient}>
    <ChakraProvider theme={theme}>{children}</ChakraProvider>
  </QueryClientProvider>
} 