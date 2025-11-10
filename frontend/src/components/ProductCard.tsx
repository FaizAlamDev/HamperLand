import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface Product {
  _id: string
  name: string
  image: string
  price: number
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow my-3 rounded-lg">
      {/* <Link to={`/product/${product._id}`}> */}
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-56 object-cover"
      />
      {/* </Link> */}

      <CardContent className="p-4">
        {/* <Link to={`/product/${product._id}`}> */}
        <h3 className="font-semibold text-lg hover:underline">
          {product.name}
        </h3>
        {/* </Link> */}

        <div className="mt-2 text-xl font-bold text-primary">
          ₹{product.price.toFixed(2)}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end"></CardFooter>
    </Card>
  )
}
