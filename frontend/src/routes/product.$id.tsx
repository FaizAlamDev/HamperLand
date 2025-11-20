import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import mockProducts from '@/mock/mockProducts.json'
import type { Product } from '@/types'
import useCartStore from '@/store/useCartStore'

export const Route = createFileRoute('/product/$id')({
  component: ProductScreen,
})

function ProductScreen() {
  const [qty, setQty] = useState('1')

  const productMap = Object.fromEntries(mockProducts.map((p) => [p._id, p]))

  const { id } = Route.useParams()
  const product: Product = productMap[id]

  const addItem = useCartStore((state) => state.addItem)
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link to="/" className="text-lg text-primary hover:underline">
        ← Go Back
      </Link>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <img
            src={product.image}
            alt={product.name}
            className="rounded-lg w-full object-cover shadow-sm"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{product.name}</h2>
          <p className="text-xl font-bold text-primary">₹{product.price}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {product.description}
          </p>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Purchase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Price:</span>
              <span className="font-semibold">₹{product.price}</span>
            </div>

            <div className="flex justify-between">
              <span>Status:</span>
              <span
                className={
                  product.countInStock > 0 ? 'text-green-600' : 'text-red-600'
                }
              >
                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {product.countInStock > 0 && (
              <div className="flex justify-between items-center">
                <span>Qty:</span>
                <Select value={qty} onValueChange={setQty}>
                  <SelectTrigger className="w-20">
                    <SelectValue placeholder="1" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: product.countInStock }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              className="w-full"
              disabled={product.countInStock === 0}
              onClick={() => {
                addItem(product, Number(qty))
                navigate({ to: '/cart' })
              }}
            >
              Add To Cart
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ProductScreen
