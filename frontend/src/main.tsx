import { useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { AuthProvider, useAuth } from 'react-oidc-context'

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'
import { createAppRouter } from './router.ts'

import './styles.css'
import LoadingSpinner from './components/LoadingSpinner.tsx'

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()

const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'email openid profile',
  automaticSilentRenew: true,
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname)
  },
}

function AppRouter() {
  const auth = useAuth()

  const router = useMemo(() => {
    return createAppRouter({
      ...TanStackQueryProviderContext,
      auth,
    })
  }, [auth.isAuthenticated])

  if (auth.isLoading) {
    return <LoadingSpinner />
  }

  if (auth.error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Authentication error
      </div>
    )
  }

  return <RouterProvider router={router} />
}

// Render the app
const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <AuthProvider {...cognitoAuthConfig}>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <AppRouter />
      </TanStackQueryProvider.Provider>
    </AuthProvider>,
  )
}
