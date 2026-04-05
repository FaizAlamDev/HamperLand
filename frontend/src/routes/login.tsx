import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }) => {
    const auth = context.auth

    if (!auth.isAuthenticated) {
      auth.signinRedirect()
    } else {
      throw redirect({ to: '/' })
    }
  },
})
