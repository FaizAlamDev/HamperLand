import ProductCardAdmin from '@/components/ProductCardAdmin'
import { useProducts } from '@/hooks/useProducts'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/listProducts')({
  component: ListProducts,
  beforeLoad: ({ context }) => {
    const auth = context.auth

    if (!auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }

    const groups = auth.user?.profile['cognito:groups']

    if (!Array.isArray(groups) || !groups.includes('admin')) {
      throw redirect({ to: '/' })
    }
  },
})

function ListProducts() {
  const { data: products } = useProducts()

  return (
    <div className="p-6 space-y-4">
      {products?.map((p) => (
        <ProductCardAdmin key={p.productId} product={p} />
      ))}
    </div>
  )
}
