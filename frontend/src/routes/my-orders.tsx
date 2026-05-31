import MyOrderCard from '@/components/MyOrderCard'
import { useMyOrders } from '@/hooks/useOrders'
import type { Order } from '@/types'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/my-orders')({
  beforeLoad: async ({ context }) => {
    const auth = context.auth

    if (!auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: MyOrdersPage,
})

export default function MyOrdersPage() {
  const { data, isLoading } = useMyOrders()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!data?.orders?.length) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">My Orders</h1>

        <p>No orders yet.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

      <div className="space-y-4">
        {data.orders.map((order: Order) => (
          <MyOrderCard key={order.orderId} order={order} />
        ))}
      </div>
    </div>
  )
}
