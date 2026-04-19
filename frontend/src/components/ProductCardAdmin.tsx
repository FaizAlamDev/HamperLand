import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import EditProductForm from './EditProductForm'
import type { Product } from '@/types'

export default function ProductCardAdmin({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border rounded p-4 flex gap-4 items-center">
      <img
        src={product.image}
        alt={product.name}
        className="w-20 h-20 object-cover rounded"
      />

      <div className="flex-1">
        <h3 className="font-semibold">{product.name}</h3>
        <p className="text-gray-500">₹{product.price}</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="px-3 py-2 bg-gray-900 text-white rounded">
            Edit
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>

          <EditProductForm product={product} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
