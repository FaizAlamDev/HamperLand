import { Link } from '@tanstack/react-router'
import { ShoppingCart, Info } from 'lucide-react'
import { useAuth } from 'react-oidc-context'

const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID
const LOGOUT_URI = import.meta.env.VITE_COGNITO_LOGOUT_URI

export default function Header() {
  const auth = useAuth()

  const handleLogin = () => {
    auth.signinRedirect()
  }

  const handleLogout = async () => {
    try {
      await auth.removeUser()
    } catch (e) {
      console.error('Error clearing user', e)
    }
    window.location.href = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(
      LOGOUT_URI,
    )}`
  }

  if (auth.isLoading) return null

  if (auth.error) {
    return <div>Error</div>
  }

  return (
    <header className="w-full h-16 bg-white shadow-md flex items-center justify-between px-6">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded" />
        <span className="font-semibold text-lg">
          <Link to="/">HamperLand</Link>
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center space-x-6">
        <Link
          to="/about"
          className="flex items-center space-x-1 hover:text-gray-700 text-gray-600"
        >
          <Info size={20} />
          <span>About</span>
        </Link>

        <Link
          to="/cart"
          className="flex items-center space-x-1 hover:text-gray-700 text-gray-600"
        >
          <ShoppingCart size={20} />
          <span>Cart</span>
        </Link>

        {!auth.isAuthenticated ? (
          <button
            onClick={handleLogin}
            className="text-sm px-4 py-2 bg-black text-white rounded"
          >
            {' '}
            Login{' '}
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 bg-gray-800 text-white rounded"
          >
            {' '}
            Logout{' '}
          </button>
        )}
      </div>
    </header>
  )
}
