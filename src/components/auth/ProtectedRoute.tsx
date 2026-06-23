import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

/** Exige usuário logado. `adminOnly` exige que seja a conta de admin. */
export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode
  adminOnly?: boolean
}) {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          color: "#F0B90B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: 4,
          fontSize: 22,
        }}
      >
        CARREGANDO...
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/painel" replace />

  return <>{children}</>
}
