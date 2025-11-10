import ProductsGrid from '@/components/ProductGrid'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

const mockProducts = [
  {
    _id: '1',
    name: 'Festive Hamper Mini',
    image: 'https://picsum.photos/seed/hamper1/600/400',
    price: 799,
    rating: 4.3,
    numReviews: 58,
  },
  {
    _id: '2',
    name: 'Decor Candle Set',
    image: 'https://picsum.photos/seed/decor1/600/400',
    price: 499,
    rating: 4.5,
    numReviews: 112,
  },
  {
    _id: '3',
    name: 'Wall Art (Framed)',
    image: 'https://picsum.photos/seed/art1/600/400',
    price: 1199,
    rating: 4.1,
    numReviews: 33,
  },
  {
    _id: '4',
    name: 'Planter Duo',
    image: 'https://picsum.photos/seed/planter/600/400',
    price: 699,
    rating: 4.6,
    numReviews: 77,
  },
]

function App() {
  return (
    <div className="text-center">
      <ProductsGrid products={mockProducts} />
    </div>
  )
}
