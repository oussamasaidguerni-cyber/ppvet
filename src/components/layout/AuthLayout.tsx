import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">P&PVET</h1>
          <p className="mt-2 text-sm text-gray-600">Veterinary Clinic Management System</p>
        </div>
        {children}
      </div>
    </div>
  )
}
