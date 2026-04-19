import OrderCard from '@/components/OrderCard'
import { useOrders } from '@/hooks/useOrders'
import type { Order } from '@/types'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/orders')({
  component: AdminOrdersPage,
  beforeLoad: ({ context }) => {
    const auth = context.auth

    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }

    const groups = auth.user?.profile['cognito:groups']

    if (!Array.isArray(groups) || !groups.includes('admin')) {
      throw redirect({ to: '/' })
    }
  },
})

export default function AdminOrdersPage() {
  const { data, isLoading } = useOrders()

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="p-6 space-y-4">
      {data.orders.map((order: Order) => (
        <OrderCard key={order.orderId} order={order} />
      ))}
    </div>
  )
}
