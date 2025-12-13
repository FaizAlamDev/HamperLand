import type { Product } from '@/types'

const API_URL = import.meta.env.VITE_PRODUCT_API_URL

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(API_URL)
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}
