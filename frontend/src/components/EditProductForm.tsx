import { useUpdateProduct } from '@/hooks/useProducts'
import type { Product } from '@/types'
import { useState } from 'react'

export default function EditProductForm({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const [form, setForm] = useState(product)
  const { mutateAsync, isPending } = useUpdateProduct()

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    await mutateAsync({
      id: product.productId,
      data: {
        name: form.name,
        price: form.price,
        description: form.description,
        countInStock: form.countInStock,
      },
    })

    onClose()
  }

  return (
    <div className="space-y-4">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-cover rounded"
      />

      <input
        className="w-full border px-3 py-2 rounded"
        value={form.name}
        onChange={(e) => handleChange('name', e.target.value)}
        placeholder="Name"
      />

      <input
        type="number"
        className="w-full border px-3 py-2 rounded"
        value={form.price}
        onChange={(e) => handleChange('price', Number(e.target.value))}
        placeholder="Price"
      />

      <textarea
        className="w-full border px-3 py-2 rounded"
        value={form.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="Description"
      />

      <input
        type="number"
        className="w-full border px-3 py-2 rounded"
        value={form.countInStock}
        onChange={(e) => handleChange('countInStock', Number(e.target.value))}
        placeholder="Stock"
      />

      <button
        onClick={handleSave}
        disabled={isPending}
        className="w-full bg-black text-white py-2 rounded"
      >
        {isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}
