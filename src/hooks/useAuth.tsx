import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ppvet_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading] = useState(false)

  const signIn = async (username: string, password: string) => {
    if (username === 'mehdi' && password === '12345') {
      const userData = { id: '1', name: 'mehdi' }
      setUser(userData)
      localStorage.setItem('ppvet_user', JSON.stringify(userData))
      return
    }
    throw new Error('Invalid credentials')
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('ppvet_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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
