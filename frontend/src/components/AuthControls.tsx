import type { useAuth } from 'react-oidc-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Link } from '@tanstack/react-router'

type Props = {
  auth: ReturnType<typeof useAuth>
  handleLogin: () => void
  handleLogout: () => void
  size?: 'desktop' | 'mobile'
}

export function AuthControls({
  auth,
  handleLogin,
  handleLogout,
  size = 'desktop',
}: Props) {
  const user = auth.user?.profile

  const groups = auth.user?.profile['cognito:groups'] as string[]
  const isAdmin = groups?.includes('admin')

  const isMobile = size === 'mobile'

  const buttonClass = isMobile
    ? 'text-sm px-2 py-1 bg-gray-200 rounded'
    : 'px-4 py-2 bg-gray-200 rounded hover:bg-gray-300'

  if (!auth.isAuthenticated) {
    return (
      <button
        onClick={handleLogin}
        className={
          isMobile
            ? 'text-sm px-3 py-1 bg-black text-white rounded'
            : 'px-4 py-2 bg-black text-white rounded'
        }
      >
        Login
      </button>
    )
  }

  return (
    <>
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={buttonClass}>Admin</button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/admin/createProduct">Create Product</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to="/admin/listProducts">Edit Products</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={buttonClass}>
            {isMobile
              ? user?.name?.split(' ')[0] || user?.email
              : user?.name || user?.email}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2 border-b">
            <p className="text-sm font-medium">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>

          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
