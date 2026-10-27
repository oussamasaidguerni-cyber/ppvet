import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../lib/api'

export default function InvoicePrint() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    loadInvoice()
  }, [id])

  const loadInvoice = async () => {
    try {
      const result = await api.getInvoiceDetails(parseInt(id!))
      setData(result)
    } catch (error) {
      console.error(error)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (!data) return <div>Loading...</div>

  const { invoice, client, items, payments, clinic } = data

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold">{clinic?.clinic_name || 'P&PVET Clinic'}</h1>
        <p className="text-sm text-muted-foreground">{clinic?.phone} {clinic?.address}</p>
        <p className="text-sm text-muted-foreground">Currency: {clinic?.currency || 'DZD'}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold mb-2">Bill To:</h2>
          <p>{client?.full_name}</p>
          <p className="text-sm text-muted-foreground">{client?.phone}</p>
          <p className="text-sm text-muted-foreground">{client?.address}</p>
        </div>
        <div className="text-right">
          <p><strong>Invoice:</strong> {invoice.invoice_number}</p>
          <p><strong>Date:</strong> {invoice.created_at?.split('T')[0]}</p>
          <p><strong>Status:</strong> {invoice.status}</p>
        </div>
      </div>

      <table className="w-full mb-6">
        <thead className="border-b-2 border-black">
          <tr>
            <th className="text-left py-2">Description</th>
            <th className="text-right py-2">Qty</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item: any) => (
            <tr key={item.id} className="border-b border-gray-200">
              <td className="py-2">{item.description}</td>
              <td className="text-right py-2">{item.quantity}</td>
              <td className="text-right py-2">{item.unit_price} {clinic?.currency || 'DZD'}</td>
              <td className="text-right py-2">{item.line_total} {clinic?.currency || 'DZD'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{invoice.subtotal} {clinic?.currency || 'DZD'}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-{invoice.discount} {clinic?.currency || 'DZD'}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t pt-2">
            <span>Total:</span>
            <span>{invoice.total} {clinic?.currency || 'DZD'}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid:</span>
            <span>{invoice.amount_paid} {clinic?.currency || 'DZD'}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Balance:</span>
            <span>{invoice.balance} {clinic?.currency || 'DZD'}</span>
          </div>
        </div>
      </div>

      {payments.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Payments</h3>
          {payments.map((p: any) => (
            <div key={p.id} className="flex justify-between text-sm border-b border-gray-100 py-1">
              <span>{p.payment_date} - {p.payment_method}</span>
              <span>{p.amount} {clinic?.currency || 'DZD'}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 print:hidden">
        <button onClick={handlePrint} className="px-4 py-2 bg-black text-white">Print</button>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
