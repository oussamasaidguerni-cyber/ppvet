import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import CommandPalette from './components/CommandPalette'
import Dashboard from './features/dashboard/Dashboard'
import ClientsList from './features/clients/ClientsList'
import ClientForm from './features/clients/ClientForm'
import ClientEdit from './features/clients/ClientEdit'
import ClientProfile from './features/clients/ClientProfile'
import AnimalForm from './features/animals/AnimalForm'
import AnimalEdit from './features/animals/AnimalEdit'
import AnimalProfile from './features/animals/AnimalProfile'
import Appointments from './features/appointments/Appointments'
import AppointmentCalendar from './features/appointments/AppointmentCalendar'
import MedicalRecords from './features/medical/MedicalRecords'
import StartVisit from './features/medical/StartVisit'
import Billing from './features/billing/Billing'
import InvoicePrint from './features/billing/InvoicePrint'
import PrescriptionPrint from './features/medical/PrescriptionPrint'
import Inventory from './features/inventory/Inventory'
import Settings from './features/settings/Settings'

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<ClientsList />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/edit/:id" element={<ClientEdit />} />
          <Route path="/clients/:id" element={<ClientProfile />} />
          <Route path="/clients/:clientId/animals/new" element={<AnimalForm />} />
          <Route path="/animals/edit/:id" element={<AnimalEdit />} />
          <Route path="/animals/:id" element={<AnimalProfile />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/appointments/calendar" element={<AppointmentCalendar />} />
          <Route path="/medical" element={<MedicalRecords />} />
          <Route path="/medical/start-visit" element={<StartVisit />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/billing/print/:id" element={<InvoicePrint />} />
          <Route path="/prescription/print/:id" element={<PrescriptionPrint />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
      <CommandPalette />
    </Router>
  )
}

export default App
