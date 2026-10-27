import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  session: any
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ppvet_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading] = useState(false)

  const signIn = async (email: string, password: string) => {
    if (email === 'MEHDI' && password === '1234') {
      const userData = { id: '1', email: 'MEHDI', name: 'MEHDI' }
      setUser(userData)
      localStorage.setItem('ppvet_user', JSON.stringify(userData))
      return
    }
    throw new Error('Invalid credentials')
  }

  const signUp = async (email: string, password: string) => {
    if (email === 'MEHDI' && password === '1234') {
      const userData = { id: '1', email: 'MEHDI', name: 'MEHDI' }
      setUser(userData)
      localStorage.setItem('ppvet_user', JSON.stringify(userData))
      return
    }
    throw new Error('Use MEHDI / 1234')
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('ppvet_user')
  }

  return (
    <AuthContext.Provider value={{ user, session: null, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
