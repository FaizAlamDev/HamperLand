import { useQuery, useMutation } from '@tanstack/react-query'
import { createOrder, getOrder } from '@/api/orders'
import type { Order } from '@/types'

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (newOrder: Order) => createOrder(newOrder),
    onSuccess: (data) => {
      console.log('Order placed successfully:', data)
    },
    onError: (error) => {
      console.error('Error placing order:', error)
    },
  })
}

export const useOrder = (orderId: string) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId,
    retry: false,
  })
}
