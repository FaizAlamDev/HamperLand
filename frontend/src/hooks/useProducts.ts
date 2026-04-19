import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '@/api/products'
import { useAuth } from 'react-oidc-context'
import type { CreateProductInput, Product } from '@/types'

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

export const useUpdateProduct = () => {
  const auth = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) => {
      const token = auth.user?.id_token
      if (!token) {
        throw new Error('User not authenticated')
      }
      return updateProduct(id, data, token)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      console.log('Product updated successfully: ', data)
    },
    onError: (error) => {
      console.error('Error updating product: ', error)
    },
  })
}

export const useDeleteProduct = () => {
  const auth = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string) => {
      const token = auth.user?.id_token
      if (!token) {
        throw new Error('User not authenticated')
      }
      return deleteProduct(productId, token)
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      console.log('Product deleted successfully: ', data)
    },
    onError: (error) => {
      console.error('Error deleting product: ', error)
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
