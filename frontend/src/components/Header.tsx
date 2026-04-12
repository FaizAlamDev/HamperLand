import { Link } from '@tanstack/react-router'
import { ShoppingCart, Info, Menu, X } from 'lucide-react'
import { useAuth } from 'react-oidc-context'
import { useState } from 'react'
import { AuthControls } from './AuthControls'

const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN
const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID
const LOGOUT_URI = window.location.origin

export default function Header() {
  const auth = useAuth()
  const [open, setOpen] = useState(false)

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
  if (auth.error) return <div>Error</div>

  return (
    <>
      <header className="w-full h-16 bg-white shadow-md flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>

          <Link to="/" className="flex items-center">
            <img
              src="/logo.svg"
              alt="HamperLand"
              className="h-12 md:h-13 w-auto object-contain"
            />
            <span className="font-semibold text-lg hidden md:block leading-none">
              HamperLand
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-gray-600">
          <Link
            to="/about"
            className="flex items-center gap-1 hover:text-black"
          >
            <Info size={18} />
            About
          </Link>
          <Link to="/cart" className="flex items-center gap-1 hover:text-black">
            <ShoppingCart size={20} />
            Cart
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <AuthControls
            auth={auth}
            handleLogin={handleLogin}
            handleLogout={handleLogout}
            size="desktop"
          />
        </div>

        <div className="md:hidden flex items-center gap-3">
          <Link to="/cart">
            <ShoppingCart size={22} />
          </Link>

          <AuthControls
            auth={auth}
            handleLogin={handleLogin}
            handleLogout={handleLogout}
            size="mobile"
          />
        </div>

        <div
          className={`fixed inset-0 z-50 transition ${
            open ? 'visible' : 'invisible'
          }`}
        >
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setOpen(false)}
          />

          <div
            className={`absolute left-0 top-0 h-full w-64 bg-white p-5 transform transition-transform ${
              open ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold">Menu</span>
              <button onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-5 text-gray-700">
              <Link to="/" onClick={() => setOpen(false)}>
                Home
              </Link>

              <Link to="/about" onClick={() => setOpen(false)}>
                About
              </Link>

              <Link to="/cart" onClick={() => setOpen(false)}>
                Cart
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
