import { Link } from '@tanstack/react-router'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import type { CartItem } from '@/types'

interface OrderSummaryProps {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  placeOrder: () => void
  placing: boolean
}

export default function OrderSummary({
  items,
  totalItems,
  totalPrice,
  placeOrder,
  placing,
}: OrderSummaryProps) {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Items ({totalItems})</span>
            </div>

            <div className="mt-4 space-y-2 max-h-64 overflow-auto">
              {items.map((i) => (
                <div
                  key={i.productId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={i.image}
                      alt={i.name}
                      className="w-12 h-10 object-cover rounded"
                    />
                    <div>
                      <div className="text-sm font-medium">{i.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Qty: {i.qty}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    ₹{(i.qty * i.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Subtotal</span>
              <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Shipping</span>
              <span>₹0.00</span>
            </div>

            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            <Button
              className="w-full"
              onClick={placeOrder}
              disabled={items.length === 0 || placing}
            >
              {placing ? 'Placing order...' : 'Place Order'}
            </Button>

            <Link to="/cart">
              <Button variant="ghost" className="w-full">
                Back to Cart
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
