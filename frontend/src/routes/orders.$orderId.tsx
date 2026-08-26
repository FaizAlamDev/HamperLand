import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import OrderProgress from '@/components/OrderProgress'
import OrderStatusBadge from '@/components/OrderStatusBadge'
import PaymentStatusBadge from '@/components/PaymentStatusBadge'
import { useOrder } from '@/hooks/useOrders'
import type { OrderItem } from '@/types'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/orders/$orderId')({
  beforeLoad: async ({ context }) => {
    const auth = context.auth

    if (!auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: OrderDetailsPage,
})

function OrderDetailsPage() {
  const { orderId } = Route.useParams()

  const { data, isLoading } = useOrder(orderId)

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <Link
          to="/my-orders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Orders
        </Link>
        <div className="p-6">Order not found</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Link
        to="/my-orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Orders
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">Order #{data.orderId}</h1>

        <p className="text-gray-500">
          {new Date(data.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Order Progress</h2>

        <OrderProgress status={data.orderStatus} />
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Order Status</h2>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span> {data.orderStatus}
            <OrderStatusBadge status={data.orderStatus} />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Payment:</span> {data.paymentStatus}
            <PaymentStatusBadge status={data.paymentStatus} />
          </div>

          <p>
            <span className="font-medium">Method:</span> {data.paymentMethod}
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Items</h2>

        <div className="space-y-4">
          {data.items.map((item: OrderItem) => (
            <div key={item.productId} className="flex gap-4 items-center">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />

              <div className="flex-1">
                <p className="font-medium">{item.name}</p>

                <p className="text-sm text-gray-500">Qty: {item.qty}</p>
              </div>

              <div>₹{item.price * item.qty}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Shipping Address</h2>

        <div className="space-y-1">
          <p>{data.shippingAddress.name}</p>

          <p>{data.shippingAddress.phone}</p>

          <p>{data.shippingAddress.address}</p>

          <p>
            {data.shippingAddress.city}, {data.shippingAddress.state}
          </p>

          <p>{data.shippingAddress.pincode}</p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Totals</h2>

        <p>Total Items: {data.totals.totalItems}</p>

        <p className="font-semibold">Grand Total: ₹{data.totals.totalPrice}</p>
      </div>
    </div>
  )
}
