import { useQuery, useMutation } from '@tanstack/react-query'
import { createOrder, getOrder } from '@/api/orders'
import type { Order } from '@/types'
import { useAuth } from 'react-oidc-context'

export const useCreateOrder = () => {
  const auth = useAuth()

  return useMutation({
    mutationFn: (newOrder: Order) => {
      const token = auth.user?.id_token
      if (!token) {
        throw new Error('User not authenticated')
      }
      return createOrder(newOrder, token)
    },
    onSuccess: (data) => {
      console.log('Order placed successfully:', data)
    },
    onError: (error) => {
      console.error('Error placing order:', error)
    },
  })
}

export const useOrder = (orderId: string) => {
  const auth = useAuth()

  return useQuery({
    queryKey: ['order', orderId, auth.user?.profile.sub],
    queryFn: () => {
      const token = auth.user?.id_token

      if (!token) {
        throw new Error('User not authenticated')
      }
      return getOrder(orderId, token)
    },
    enabled: !!orderId && !!auth.user,
    retry: false,
  })
}
