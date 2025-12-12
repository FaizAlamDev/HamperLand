import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/admin/createProduct')({
  component: CreateProduct,
})

function CreateProduct() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    countInStock: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (selectedFile.size > 2 * 1024 * 1024) {
      alert('File is too large! Max 2MB allowed to save costs.')
      return
    }

    setFile(selectedFile)

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreview(objectUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !formData.name || !formData.price || !formData.countInStock)
      return

    setIsUploading(true)
    setStatus('idle')

    try {
      const response = await fetch(import.meta.env.VITE_PRODUCT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: Number(formData.price),
          description: formData.description,
          countInStock: formData.countInStock,
          contentType: file.type,
        }),
      })

      if (!response.ok) throw new Error('Failed to create product entry')

      const { uploadUrl } = await response.json()

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!uploadResponse.ok) throw new Error('Failed to upload image to S3')

      setStatus('success')
      setFormData({ name: '', price: '', description: '', countInStock: '' })
      setFile(null)
      setPreview(null)
    } catch (error) {
      console.error(error)
      setStatus('error')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            CountInStock
          </label>
          <input
            type="number"
            required
            min="0"
            step="1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.countInStock}
            onChange={(e) =>
              setFormData({ ...formData, countInStock: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-gray-50 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition">
              <span className="text-sm text-gray-600">Choose File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-500">
              {file ? file.name : 'No file chosen'}
            </span>
          </div>

          {preview && (
            <div className="mt-4 relative w-32 h-32 border rounded overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {status === 'success' && (
          <div className="p-3 bg-green-50 text-green-700 rounded text-sm">
            Product created successfully!
          </div>
        )}
        {status === 'error' && (
          <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
            Something went wrong. Please try again.
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || !file}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${isUploading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}
          `}
        >
          {isUploading ? 'Uploading...' : 'Create Product'}
        </button>
      </form>
    </div>
  )
}
