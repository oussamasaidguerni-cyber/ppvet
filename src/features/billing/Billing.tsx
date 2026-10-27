import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { api } from '../../lib/api'

export default function Billing() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    items: [{ description: '', quantity: 1, unit_price: 0, product_id: '' }],
    discount: 0
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [invs, clis, prods] = await Promise.all([api.getInvoices(), api.getClients(), api.getProducts()])
      setInvoices(invs)
      setClients(clis)
      setProducts(prods)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setFormData({...formData, items: [...formData.items, { description: '', quantity: 1, unit_price: 0, product_id: '' }]})
  }

  const updateItem = (index: number, field: string, value: any) => {
    const items = [...formData.items]
    items[index] = { ...items[index], [field]: value }
    if (field === 'product_id' && value) {
      const prod = products.find(p => p.id == value)
      if (prod) {
        items[index].description = prod.name
        items[index].unit_price = prod.selling_price
      }
    }
    setFormData({...formData, items})
  }

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0)
    return subtotal - Number(formData.discount || 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createInvoice({
        client_id: parseInt(formData.client_id),
        items: formData.items.map(i => ({...i, quantity: parseInt(i.quantity as any), unit_price: parseInt(i.unit_price as any), product_id: i.product_id ? parseInt(i.product_id) : null})),
        discount: parseInt(formData.discount as any || 0)
      })
      setShowForm(false)
      loadData()
      alert('Invoice created')
    } catch (error: any) {
      alert(error.message)
    }
  }

  const addPayment = async (invoiceId: number) => {
    const amount = prompt('Payment amount (DZD):')
    if (!amount) return
    try {
      await api.createPayment({ invoice_id: invoiceId, amount: parseInt(amount) })
      loadData()
      alert('Payment recorded')
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 p-4 mb-6 space-y-4">
          <div>
            <Label>Client</Label>
            <select className="w-full h-10 border border-gray-300 px-3" onChange={(e) => setFormData({...formData, client_id: e.target.value})} required>
              <option value="">Select...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          
          <div>
            <Label>Items</Label>
            {formData.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                <select className="col-span-3 h-10 border border-gray-300 px-2" onChange={(e) => updateItem(idx, 'product_id', e.target.value)}>
                  <option value="">Custom</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.selling_price} DZD)</option>)}
                </select>
                <Input className="col-span-3" placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} required />
                <Input className="col-span-2" type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} required />
                <Input className="col-span-2" type="number" placeholder="Price" value={item.unit_price} onChange={(e) => updateItem(idx, 'unit_price', e.target.value)} required />
                <div className="col-span-2 flex items-center text-sm">{Number(item.quantity) * Number(item.unit_price)} DZD</div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem}>Add Item</Button>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xs">
            <div>
              <Label>Discount (DZD)</Label>
              <Input type="number" onChange={(e) => setFormData({...formData, discount: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <Label>Total</Label>
              <div className="h-10 flex items-center font-semibold">{calculateTotal()} DZD</div>
            </div>
          </div>

          <Button type="submit">Create Invoice</Button>
        </form>
      )}

      <div className="border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Invoice #</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Client</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Total</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Paid</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Balance</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-200 last:border-0">
                <td className="px-4 py-3 text-sm">{inv.invoice_number}</td>
                <td className="px-4 py-3">{inv.client_name}</td>
                <td className="px-4 py-3">{inv.total} DZD</td>
                <td className="px-4 py-3">{inv.amount_paid} DZD</td>
                <td className="px-4 py-3">{inv.balance} DZD</td>
                <td className="px-4 py-3 text-sm capitalize">{inv.status.replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  {inv.status !== 'paid' && (
                    <button onClick={() => addPayment(inv.id)} className="text-sm text-black underline">Add Payment</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && (
          <div className="p-6 text-center text-gray-600">No invoices</div>
        )}
      </div>
    </div>
  )
}
