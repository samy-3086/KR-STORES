import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth as useSupabaseAuth } from '../hooks/useAuth'

const AuthContext = createContext<ReturnType<typeof useSupabaseAuth> | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useSupabaseAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}