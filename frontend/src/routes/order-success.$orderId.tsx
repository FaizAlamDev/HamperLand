import { createFileRoute, useParams, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/order-success/$orderId')({
  component: OrderSuccessRoute,
})

function OrderSuccessRoute() {
  const { orderId } = useParams({ from: '/order-success/$orderId' })
  const storageKey = `hamperland-order-${orderId}`

  let order: null | any = null
  try {
    const raw = sessionStorage.getItem(storageKey)
    if (raw) order = JSON.parse(raw)
  } catch (e) {
    console.warn('Failed to parse order from sessionStorage', e)
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Card>
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold mb-2">Order not found</h2>
            <p className="text-sm text-muted-foreground mb-4">
              We couldn't find the order details. If you just placed an order,
              try returning to the store.
            </p>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Order Confirmed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            🎉 Thank you! Your order <strong>{order.id}</strong> has been
            placed.
          </p>

          <div className="rounded border bg-card p-4">
            <div className="mb-2 text-sm text-muted-foreground">Shipping</div>
            <div className="text-sm">
              <div>{order.shippingAddress.name}</div>
              <div>{order.shippingAddress.address}</div>
              <div>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.pincode}
              </div>
              <div>Phone: {order.shippingAddress.phone}</div>
            </div>
          </div>

          <div className="rounded border bg-card p-4">
            <div className="mb-2 text-sm text-muted-foreground">Items</div>
            <div className="space-y-2">
              {order.items.map((i: any) => (
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

          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-semibold">
                ₹{order.totals.totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2">
              <Link to="/">
                <Button>Continue Shopping</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    sessionStorage.removeItem(storageKey)
                  } catch {}
                  window.location.href = '/'
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrderSuccessRoute
