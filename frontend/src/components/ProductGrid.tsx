import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types'

export default function ProductsGrid({ products }: { products: Product[] }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h2 className="mb-4 text-2xl font-bold">Featured Products</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  )
}
