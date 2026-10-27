import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { api } from '../../lib/api'

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '', category: '', selling_price: 0, cost_price: 0, current_stock: 0, minimum_stock: 0, unit: 'piece'
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await api.getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createProduct({
        ...formData,
        selling_price: parseInt(formData.selling_price as any),
        cost_price: parseInt(formData.cost_price as any),
        current_stock: parseInt(formData.current_stock as any),
        minimum_stock: parseInt(formData.minimum_stock as any)
      })
      setShowForm(false)
      setFormData({ name: '', category: '', selling_price: 0, cost_price: 0, current_stock: 0, minimum_stock: 0, unit: 'piece' })
      loadProducts()
      alert('Product added')
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 p-4 mb-6 space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Product Name *</Label>
              <Input onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
              <Label>Category</Label>
              <Input onChange={(e) => setFormData({...formData, category: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Selling Price (DZD)</Label>
              <Input type="number" onChange={(e) => setFormData({...formData, selling_price: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <Label>Cost Price (DZD)</Label>
              <Input type="number" onChange={(e) => setFormData({...formData, cost_price: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <Label>Unit</Label>
              <Input onChange={(e) => setFormData({...formData, unit: e.target.value})} defaultValue="piece" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Current Stock</Label>
              <Input type="number" onChange={(e) => setFormData({...formData, current_stock: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <Label>Minimum Stock</Label>
              <Input type="number" onChange={(e) => setFormData({...formData, minimum_stock: parseInt(e.target.value) || 0})} />
            </div>
          </div>
          <Button type="submit">Add Product</Button>
        </form>
      )}

      <div className="border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Category</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Price</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Stock</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Min Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id} className="border-b border-gray-200 last:border-0">
                <td className="px-4 py-3">{prod.name}</td>
                <td className="px-4 py-3 text-gray-600">{prod.category || '-'}</td>
                <td className="px-4 py-3">{prod.selling_price} DZD</td>
                <td className="px-4 py-3">{prod.current_stock} {prod.unit}</td>
                <td className="px-4 py-3">{prod.minimum_stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-6 text-center text-gray-600">No products</div>
        )}
      </div>
    </div>
  )
}
