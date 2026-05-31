import type { Order } from '@/types'
import { Link } from '@tanstack/react-router'
import OrderStatusBadge from './OrderStatusBadge'
import PaymentStatusBadge from './PaymentStatusBadge'

export default function MyOrderCard({ order }: { order: Order }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">Order #{order.orderId}</p>

          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <p className="font-medium">₹{order.totals.totalPrice}</p>

          <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span> {order.orderStatus}
          <OrderStatusBadge status={order.orderStatus} />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">Payment:</span> {order.paymentStatus}
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>

        <div>
          <span className="font-medium">Method:</span> {order.paymentMethod}
        </div>
      </div>

      <div className="mt-4">
        <Link
          to="/orders/$orderId"
          params={{ orderId: order.orderId }}
          className="inline-block px-4 py-2 bg-black text-white rounded"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
