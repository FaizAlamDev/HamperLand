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
import { useDeleteProduct } from '@/hooks/useProducts'

export default function ProductCardAdmin({ product }: { product: Product }) {
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { mutateAsync: deleteProduct, isPending } = useDeleteProduct()

  const handleDelete = async () => {
    await deleteProduct(product.productId)
    setConfirmOpen(false)
  }

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
          <button className="px-2 py-1 bg-gray-900 text-white rounded text-sm md:px-3 md:py-2 md:text-base">
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger asChild>
          <button className="px-2 py-1 bg-red-600 text-white rounded text-sm md:px-3 md:py-2 md:text-base">
            Delete
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product?</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">This action cannot be undone.</p>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-3 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-3 py-2 bg-red-600 text-white rounded"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
