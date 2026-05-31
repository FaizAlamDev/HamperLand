import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuth } from 'react-oidc-context'

export const Route = createFileRoute('/profile')({
  beforeLoad: async ({ context }) => {
    const auth = context.auth

    if (!auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: ProfileRoute,
})

export default function ProfileRoute() {
  const auth = useAuth()

  const profile = auth.user?.profile

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>

      <div className="border rounded-lg bg-white p-6 space-y-6">
        <div>
          <p className="text-sm text-gray-500">Full Name</p>

          <p className="font-medium">{profile?.name || '-'}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Email</p>

          <p className="font-medium">{profile?.email || '-'}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Phone Number</p>

          <p className="font-medium">{profile?.phone_number || '-'}</p>
        </div>
      </div>
    </div>
  )
}
