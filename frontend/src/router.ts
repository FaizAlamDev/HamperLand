import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

import type { QueryClient } from '@tanstack/react-query'
import type { AuthContextProps } from 'react-oidc-context'

export interface AppRouterContext {
  queryClient: QueryClient
  auth: AuthContextProps
}

export const createAppRouter = (context: AppRouterContext) => {
  return createRouter({
    routeTree,
    context,
    defaultPreload: 'intent',
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
  })
}

export type AppRouter = ReturnType<typeof createAppRouter>

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter
  }
}
