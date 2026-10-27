import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './features/dashboard/Dashboard'
import ClientsList from './features/clients/ClientsList'
import ClientForm from './features/clients/ClientForm'
import ClientProfile from './features/clients/ClientProfile'
import AnimalForm from './features/animals/AnimalForm'
import AnimalProfile from './features/animals/AnimalProfile'
import Appointments from './features/appointments/Appointments'
import MedicalRecords from './features/medical/MedicalRecords'
import Billing from './features/billing/Billing'
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
          <Route path="/clients/:id" element={<ClientProfile />} />
          <Route path="/clients/:clientId/animals/new" element={<AnimalForm />} />
          <Route path="/animals/:id" element={<AnimalProfile />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/medical" element={<MedicalRecords />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}

export default App
