import { Link } from '@tanstack/react-router'
import { ShoppingCart, Info } from 'lucide-react'

export default function Header() {
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

        <button className="flex items-center space-x-1 hover:text-gray-700 text-gray-600">
          <ShoppingCart size={20} />
          <span>Cart</span>
        </button>
      </div>
    </header>
  )
}
