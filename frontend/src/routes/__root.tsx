import {
  Outlet,
  createRootRouteWithContext,
  redirect,
} from '@tanstack/react-router'

import type { QueryClient } from '@tanstack/react-query'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { useAuth } from 'react-oidc-context'

interface MyRouterContext {
  queryClient: QueryClient
  auth: ReturnType<typeof useAuth>
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context }) => {
    const auth = context.auth

    if (auth.isAuthenticated) {
      const redirectTo = sessionStorage.getItem('post_login_redirect')

      if (redirectTo) {
        sessionStorage.removeItem('post_login_redirect')
        throw redirect({ to: redirectTo })
      }
    }
  },
  component: () => (
    <>
      <div className="min-h-screen flex flex-col bg-gray-100 text-foreground">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  ),
})
