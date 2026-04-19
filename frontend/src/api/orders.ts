import type { CreateOrderInput } from '@/types'

const API_URL = import.meta.env.VITE_ORDERS_API_URL

export const createOrder = async (
  orderPayload: CreateOrderInput,
  token: string,
) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderPayload),
  })
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export const getOrder = async (orderId: string, token: string) => {
  const response = await fetch(`${API_URL}/${orderId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Order not found')
  }
  return response.json()
}

export const getOrders = async (token: string) => {
  const response = await fetch(`${API_URL}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    throw new Error('Orders not found')
  }
  return response.json()
}

export const updateOrder = async (
  orderId: string,
  data: any,
  token: string,
) => {
  const response = await fetch(`${API_URL}/${orderId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) throw new Error('Failed to update order')
  return response.json()
}
