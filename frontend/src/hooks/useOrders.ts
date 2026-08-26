import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from 'react-oidc-context'
import type {
  CreateOrderInput,
  OrderStatus,
  PaymentStatus,
  VerifyPaymentInput,
} from '@/types'
import {
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
  updateOrder,
  verifyPayment,
} from '@/api/orders'

export const orderKeys = {
  all: ['orders'] as const,
  my: ['my-orders'] as const,
  detail: (id: string) => ['order', id] as const,
}

export type UpdateOrderInput = {
  orderStatus?: OrderStatus
  paymentStatus?: PaymentStatus
}

export const useCreateOrder = () => {
  const auth = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newOrder: CreateOrderInput) => {
      const token = auth.user?.id_token
      if (!token) {
        throw new Error('User not authenticated')
      }
      return createOrder(newOrder, token)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.my,
      })
      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      })
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
    queryKey: orderKeys.detail(orderId),
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

export const useMyOrders = () => {
  const auth = useAuth()

  return useQuery({
    queryKey: orderKeys.my,
    queryFn: () => {
      const token = auth.user?.id_token

      if (!token) {
        throw new Error('User not authenticated')
      }

      return getMyOrders(token)
    },
    enabled: !!auth.user,
    select: (data: { orders: import('@/types').Order[] }) => ({
      ...data,
      orders: [...data.orders].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    }),
  })
}

export const useOrders = () => {
  const auth = useAuth()

  return useQuery({
    queryKey: orderKeys.all,
    queryFn: async () => {
      const token = auth.user?.id_token
      if (!token) {
        throw new Error('User not authenticated')
      }
      return getOrders(token)
    },
  })
}

export const useVerifyPayment = () => {
  const auth = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string
      data: VerifyPaymentInput
    }) => {
      const token = auth.user?.id_token
      if (!token) {
        throw new Error('User not authenticated')
      }
      return verifyPayment(orderId, data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      })
      queryClient.invalidateQueries({
        queryKey: orderKeys.my,
      })
      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      })
    },
    onError: (error) => {
      console.error('Error verifying payment:', error)
    },
  })
}

export const useUpdateOrder = () => {
  const auth = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderId,
      data,
    }: {
      orderId: string
      data: UpdateOrderInput
    }) => {
      const token = auth.user?.id_token
      if (!token) {
        throw new Error('User not authenticated')
      }
      return updateOrder(orderId, data, token)
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: orderKeys.my,
      })
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.orderId),
      })
      console.log('Order updated successfully:', data)
    },
    onError: (error) => {
      console.error('Error updating order:', error)
    },
  })
}
