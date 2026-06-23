import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import type { User } from "firebase/auth"
import { auth } from "../lib/firebase"

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL ?? "").toLowerCase()

interface AuthContextValue {
  user: User | null
  loading: boolean
  isAdmin: boolean
  signUp: (nome: string, email: string, senha: string) => Promise<void>
  signIn: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  async function signUp(nome: string, email: string, senha: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, senha)
    if (nome) await updateProfile(cred.user, { displayName: nome })
  }

  async function signIn(email: string, senha: string) {
    await signInWithEmailAndPassword(auth, email, senha)
  }

  async function logout() {
    await signOut(auth)
  }

  const isAdmin =
    !!user && !!ADMIN_EMAIL && user.email?.toLowerCase() === ADMIN_EMAIL

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, signUp, signIn, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>")
  return ctx
}
