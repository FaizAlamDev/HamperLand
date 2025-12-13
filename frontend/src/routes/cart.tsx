import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCartStore from '@/store/useCartStore'
import type { CartItem } from '@/types'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Trash } from 'lucide-react'

export const Route = createFileRoute('/cart')({
  component: CartRoute,
})

function CartRoute() {
  const items = useCartStore((s) => s.items)
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)
  const getTotalItems = useCartStore((s) => s.getTotalItems)
  const getTotalPrice = useCartStore((s) => s.getTotalPrice)
  const clearCart = useCartStore((s) => s.clearCart)

  const navigate = useNavigate()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <Card className="p-6">
          <CardContent className="text-center">
            <p className="mb-4 text-muted-foreground">Your cart is empty.</p>
            <Link to="/">
              <Button>Go Shopping</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {items.map((item: CartItem) => (
              <div
                key={item.productId}
                className="flex flex-col md:flex-row gap-4 rounded-lg border bg-card p-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full md:w-28 h-40 md:h-20 object-cover rounded"
                />

                <div className="flex-1 min-w-0">
                  <Link to="/product/$id" params={{ id: item.productId }}>
                    <h3 className="font-semibold hover:underline truncate">
                      {item.name}
                    </h3>
                  </Link>

                  <p className="mt-1 text-sm text-muted-foreground">
                    ₹{item.price.toFixed(2)}
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-sm">Qty</span>

                    <Select
                      value={String(item.qty)}
                      onValueChange={(v) =>
                        updateQty(item.productId, Number(v))
                      }
                    >
                      <SelectTrigger className="w-20 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: item.countInStock }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="ml-2"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <div className="text-sm text-muted-foreground">Subtotal</div>
                  <div className="text-lg font-semibold">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <Card>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Items ({totalItems})</span>
                  <span className="font-semibold">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => navigate({ to: '/checkout' })}
                    disabled={items.length === 0}
                  >
                    Proceed to Checkout
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      clearCart()
                    }}
                  >
                    Clear Cart
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Shipping & taxes calculated at checkout.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartRoute
