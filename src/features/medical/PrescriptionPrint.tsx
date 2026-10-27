import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function PrescriptionPrint() {
  const { id } = useParams()
  const [prescription, setPrescription] = useState<any>(null)
  const [animal, setAnimal] = useState<any>(null)
  const [clinic, setClinic] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const { db } = await import('../../lib/db')
      const p = await db.prescriptions.get(parseInt(id!))
      if (p) {
        setPrescription(p)
        const a = await db.animals.get(p.animal_id)
        const c = await db.clients.get(p.client_id)
        const cl = await db.clinic.toCollection().first()
        setAnimal({ ...a, owner: c })
        setClinic(cl)
      }
    }
    load()
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  if (!prescription) return <div>Loading...</div>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold">{clinic?.clinic_name || 'P&PVET Clinic'}</h1>
        <p className="text-sm">{clinic?.phone} {clinic?.address}</p>
      </div>
      
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Date:</strong> {prescription.prescription_date}</p>
            <p><strong>Patient:</strong> {animal?.name} ({animal?.species})</p>
          </div>
          <div>
            <p><strong>Owner:</strong> {animal?.owner?.full_name}</p>
            <p><strong>Phone:</strong> {animal?.owner?.phone}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">℞ Prescription</h2>
        <div className="border p-4">
          <p className="text-lg font-semibold mb-2">{prescription.medication_name}</p>
          {prescription.dosage && <p><strong>Dosage:</strong> {prescription.dosage}</p>}
          {prescription.frequency && <p><strong>Frequency:</strong> {prescription.frequency}</p>}
          {prescription.duration && <p><strong>Duration:</strong> {prescription.duration}</p>}
          {prescription.instructions && <p className="mt-2"><strong>Instructions:</strong> {prescription.instructions}</p>}
        </div>
      </div>

      <div className="mt-12 pt-4 border-t">
        <p className="text-sm text-right">Veterinarian Signature</p>
      </div>

      <div className="mt-6 print:hidden">
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
