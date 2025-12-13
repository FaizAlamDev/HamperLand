import ProductsGrid from '@/components/ProductGrid'
import { useProducts } from '@/hooks/useProducts'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { data: products, isLoading, error } = useProducts()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error Loading Products</div>

  return (
    <div className="text-center">
      <ProductsGrid products={products || []} />
    </div>
  )
}
