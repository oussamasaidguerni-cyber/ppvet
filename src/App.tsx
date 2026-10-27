import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './features/dashboard/Dashboard'
import ClientsList from './features/clients/ClientsList'
import ClientForm from './features/clients/ClientForm'
import ClientProfile from './features/clients/ClientProfile'
import AnimalForm from './features/animals/AnimalForm'
import AnimalProfile from './features/animals/AnimalProfile'
import Settings from './features/settings/Settings'
import Placeholder from './pages/Placeholder'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute>
              <ClientsList />
            </ProtectedRoute>
          } />
          <Route path="/clients/new" element={
            <ProtectedRoute>
              <ClientForm />
            </ProtectedRoute>
          } />
          <Route path="/clients/:id" element={
            <ProtectedRoute>
              <ClientProfile />
            </ProtectedRoute>
          } />
          <Route path="/clients/:clientId/animals/new" element={
            <ProtectedRoute>
              <AnimalForm />
            </ProtectedRoute>
          } />
          <Route path="/animals/:id" element={
            <ProtectedRoute>
              <AnimalProfile />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute>
              <Placeholder 
                title="Appointments" 
                icon="calendar" 
                description="Appointment scheduling and management will be available in a future update." 
              />
            </ProtectedRoute>
          } />
          <Route path="/medical" element={
            <ProtectedRoute>
              <Placeholder 
                title="Medical Records" 
                icon="medical" 
                description="Medical records, visits, and consultations will be available in a future update." 
              />
            </ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute>
              <Placeholder 
                title="Billing" 
                icon="billing" 
                description="Invoicing, payments, and receipts will be available in a future update." 
              />
            </ProtectedRoute>
          } />
          <Route path="/inventory" element={
            <ProtectedRoute>
              <Placeholder 
                title="Inventory" 
                icon="inventory" 
                description="Product and inventory management will be available in a future update." 
              />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
