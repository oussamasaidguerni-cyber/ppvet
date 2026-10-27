import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Printer, Trash2 } from 'lucide-react'
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
    discount: 0 as any
  })
  const [errors, setErrors] = useState<any>({})
  const [submitting, setSubmitting] = useState(false)

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

  const removeItem = (index: number) => {
    if (formData.items.length === 1) return
    const items = formData.items.filter((_, i) => i !== index)
    setFormData({...formData, items})
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
    setErrors({})
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_price || 0)), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = Math.max(0, Number(formData.discount || 0))
    const total = subtotal - discount
    return total < 0 ? 0 : total
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: any = {}
    
    if (!formData.client_id) {
      newErrors.client_id = 'Client is required'
    }
    
    formData.items.forEach((item, idx) => {
      if (!item.description?.trim()) {
        newErrors[`item_${idx}_description`] = 'Description required'
      }
      if (Number(item.quantity) <= 0) {
        newErrors[`item_${idx}_quantity`] = 'Quantity must be > 0'
      }
      if (Number(item.unit_price) < 0) {
        newErrors[`item_${idx}_unit_price`] = 'Price must be >= 0'
      }
    })
    
    if (Number(formData.discount) < 0) {
      newErrors.discount = 'Discount cannot be negative'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setSubmitting(true)
    try {
      await api.createInvoice({
        client_id: parseInt(formData.client_id),
        items: formData.items.map(i => ({...i, quantity: parseInt(i.quantity as any), unit_price: parseInt(i.unit_price as any), product_id: i.product_id ? parseInt(i.product_id) : null})),
        discount: Math.max(0, parseInt(formData.discount as any || 0))
      })
      setShowForm(false)
      setFormData({
        client_id: '',
        items: [{ description: '', quantity: 1, unit_price: 0, product_id: '' }],
        discount: 0
      })
      setErrors({})
      loadData()
      alert('Invoice created successfully')
    } catch (error: any) {
      alert(error.message || 'Failed to create invoice')
    } finally {
      setSubmitting(false)
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

  const deleteInvoice = async (invoiceId: number) => {
    if (confirm('Delete this invoice permanently? This cannot be undone.')) {
      try {
        await api.deleteInvoice(invoiceId)
        loadData()
      } catch (error: any) {
        alert(error.message)
      }
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
        <form onSubmit={handleSubmit} className="border border-border bg-card p-6 mb-6 space-y-5">
          <div>
            <Label htmlFor="client">Client</Label>
            <select 
              id="client"
              className="w-full h-10 border border-input bg-background text-foreground px-3 focus:outline-none focus:ring-2 focus:ring-ring mt-1" 
              style={{ colorScheme: 'light dark' }}
              value={formData.client_id}
              onChange={(e) => { setFormData({...formData, client_id: e.target.value}); setErrors({...errors, client_id: ''}) }} 
            >
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
            {errors.client_id && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.client_id}</p>}
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Invoice Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>Add Item</Button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, idx) => (
                <div key={idx} className="border border-border p-3 space-y-2 md:space-y-0 md:grid md:grid-cols-12 md:gap-2">
                  <div className="md:col-span-3">
                    <Label className="text-xs md:hidden">Item/Service</Label>
                    <select 
                      className="w-full h-10 border border-input bg-background text-foreground px-2 focus:outline-none focus:ring-2 focus:ring-ring" 
                      style={{ colorScheme: 'light dark' }}
                      value={item.product_id}
                      onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                    >
                      <option value="">Custom item</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.selling_price} DZD)</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <Label className="text-xs md:hidden">Description</Label>
                    <Input placeholder="Description" value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} />
                    {errors[`item_${idx}_description`] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors[`item_${idx}_description`]}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs md:hidden">Quantity</Label>
                    <Input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} />
                    {errors[`item_${idx}_quantity`] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors[`item_${idx}_quantity`]}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-xs md:hidden">Unit Price (DZD)</Label>
                    <Input type="number" min="0" placeholder="Price" value={item.unit_price} onChange={(e) => updateItem(idx, 'unit_price', e.target.value)} />
                    {errors[`item_${idx}_unit_price`] && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors[`item_${idx}_unit_price`]}</p>}
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between md:justify-start gap-2">
                    <div className="text-sm text-foreground">{Number(item.quantity || 0) * Number(item.unit_price || 0)} DZD</div>
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(idx)} className="text-sm text-red-600 dark:text-red-400 hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-72 space-y-2 border border-border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{calculateSubtotal()} DZD</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm">Discount (DZD)</Label>
                <Input 
                  type="number" 
                  min="0"
                  className="w-32 h-9"
                  value={formData.discount}
                  onChange={(e) => { setFormData({...formData, discount: e.target.value}); setErrors({...errors, discount: ''}) }} 
                />
              </div>
              {errors.discount && <p className="text-xs text-red-600 dark:text-red-400">{errors.discount}</p>}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-lg font-semibold text-foreground">{calculateTotal()} DZD</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create Invoice'}</Button>
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setErrors({}) }}>Cancel</Button>
          </div>
        </form>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Invoice History</h2>
        {invoices.length === 0 ? (
          <div className="border border-border bg-card p-6 text-center">
            <p className="text-muted-foreground mb-4">No invoices yet.</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Invoice
            </Button>
          </div>
        ) : (
          <div className="border border-border bg-card overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Invoice #</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Client</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Total</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Paid</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-foreground">Balance</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground font-medium">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-foreground">{inv.client_name}</td>
                    <td className="px-4 py-3 text-right text-foreground">{inv.total} DZD</td>
                    <td className="px-4 py-3 text-right text-foreground">{inv.amount_paid} DZD</td>
                    <td className="px-4 py-3 text-right text-foreground">{inv.balance} DZD</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' :
                        inv.status === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400' :
                        'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
                      }`}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 flex-wrap">
                      {inv.status !== 'paid' && (
                        <button onClick={() => addPayment(inv.id)} className="text-sm text-foreground hover:underline">Add Payment</button>
                      )}
                      <Link to={`/billing/print/${inv.id}`} target="_blank" className="text-sm text-foreground hover:underline flex items-center gap-1">
                        <Printer className="h-3 w-3" /> Print
                      </Link>
                      <button onClick={() => deleteInvoice(inv.id)} className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
