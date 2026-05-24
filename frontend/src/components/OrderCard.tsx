import {
  ORDER_STATUS_TRANSITIONS,
  PAYMENT_STATUS_TRANSITIONS,
} from '@/constants/orderTransitions'
import { useUpdateOrder } from '@/hooks/useOrders'
import type { Order, OrderStatus, PaymentStatus } from '@/types'
import { useState } from 'react'

export default function OrderCard({ order }: { order: Order }) {
  const [form, setForm] = useState({
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
  })

  const { mutateAsync, isPending } = useUpdateOrder()

  const isCOD = order.paymentMethod === 'COD'

  const allowedOrderTransitions = ORDER_STATUS_TRANSITIONS[order.orderStatus]
  const allowedPaymentTransitions =
    PAYMENT_STATUS_TRANSITIONS[order.paymentStatus]

  const handleSave = async () => {
    await mutateAsync({
      orderId: order.orderId,
      data: form,
    })
  }

  const handleCancel = async () => {
    await mutateAsync({
      orderId: order.orderId,
      data: { orderStatus: 'CANCELLED' },
    })
  }

  return (
    <div className="border rounded p-4 space-y-3">
      <div className="flex justify-between">
        <div>
          <p className="font-semibold">Order #{order.orderId}</p>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="text-sm text-gray-600">₹{order.totals?.totalPrice}</div>
      </div>

      <div className="text-sm">
        {order.items.map((item) => (
          <div key={item.productId}>
            {item.name} × {item.qty}
          </div>
        ))}
      </div>

      <div className="flex gap-4 flex-wrap">
        <select
          value={form.orderStatus}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              orderStatus: e.target.value as OrderStatus,
            }))
          }
          className="border px-2 py-1 rounded"
        >
          <option value={order.orderStatus}>{order.orderStatus}</option>

          {allowedOrderTransitions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        {isCOD && (
          <select
            value={form.paymentStatus}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                paymentStatus: e.target.value as PaymentStatus,
              }))
            }
            className="border px-2 py-1 rounded"
          >
            <option value={order.paymentStatus}>{order.paymentStatus}</option>

            {allowedPaymentTransitions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-3 py-2 bg-black text-white rounded"
        >
          {isPending ? 'Saving...' : 'Save'}
        </button>

        {order.orderStatus !== 'CANCELLED' &&
          order.orderStatus !== 'DELIVERED' && (
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="px-3 py-2 bg-red-600 text-white rounded"
            >
              Cancel Order
            </button>
          )}
      </div>
    </div>
  )
}
