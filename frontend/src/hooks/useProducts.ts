import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProduct, fetchProducts } from '@/api/products'
import { useAuth } from 'react-oidc-context'
import type { CreateProductInput } from '@/types'

export const productKeys = {
  all: ['products'] as const,
  detail: (id: string) => ['products', id] as const,
}

export const useCreateProduct = () => {
  const auth = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (newProduct: CreateProductInput) => {
      const token = auth.user?.id_token
      if (!token) {
        throw new Error('User not authenticated')
      }
      return createProduct(newProduct, token)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      console.log('Product created successfully: ', data)
    },
    onError: (error) => {
      console.error('Error creating product: ', error)
    },
  })
}

export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  })
}
