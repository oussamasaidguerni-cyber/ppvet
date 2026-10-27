import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AppLayout from './layout/AppLayout'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <AppLayout>{children}</AppLayout>
}
