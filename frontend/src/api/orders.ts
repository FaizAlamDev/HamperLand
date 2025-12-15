import type { Order } from '@/types'

const API_URL = import.meta.env.VITE_ORDERS_API_URL

export const createOrder = async (orderPayload: Order) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  })
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export const getOrder = async (orderId: string) => {
  const response = await fetch(`${API_URL}/${orderId}`)
  if (!response.ok) {
    throw new Error('Order not found')
  }
  return response.json()
}
