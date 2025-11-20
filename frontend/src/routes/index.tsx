import ProductsGrid from '@/components/ProductGrid'
import { createFileRoute } from '@tanstack/react-router'
import mockProducts from '@/mock/mockProducts.json'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
      <ProductsGrid products={mockProducts} />
    </div>
  )
}
