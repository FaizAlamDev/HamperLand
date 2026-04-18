import type { CreateProductInput, Product } from '@/types'

const API_URL = import.meta.env.VITE_PRODUCT_API_URL

export const createProduct = async (
  productPayload: CreateProductInput,
  token: string,
) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productPayload),
  })
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export const updateProduct = async (
  productId: string,
  payload: Partial<Product>,
  token: string,
) => {
  const response = await fetch(`${API_URL}/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to update product')
  }
  return response.json()
}

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(API_URL)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}
