import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '@/api/products'

export const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => ['products', id] as const,
}

export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  })
}
