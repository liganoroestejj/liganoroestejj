import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { authErrorMessage } from "../../lib/authErrors"
import * as s from "./authStyles"

const REMEMBER_KEY = "lnjjp_login"

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [lembrar, setLembrar] = useState(false)
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)

  // Carrega credenciais salvas, se "lembrar-me" estava ativo.
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      try {
        const { email, senha } = JSON.parse(saved)
        setEmail(email ?? "")
        setSenha(senha ?? "")
        setLembrar(true)
      } catch { /* ignora dados inválidos */ }
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setCarregando(true)
    try {
      await signIn(email, senha)
      if (lembrar) {
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email, senha }))
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }
      // O redirecionamento admin x usuário acontece no /painel.
      navigate("/painel", { replace: true })
    } catch (err) {
      setErro(authErrorMessage(err))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={s.page}>
      <form style={s.card} onSubmit={handleSubmit}>
        <Link to="/" style={{ color: "#999", fontSize: 13, fontWeight: 600, textDecoration: "none", letterSpacing: 1, display: "inline-block", marginBottom: 20 }}>
          ← Voltar ao início
        </Link>
        <h1 style={s.title}>ENTRAR</h1>
        <div style={s.subtitle}>Liga Noroeste Jiu-Jitsu Pro</div>

        {erro && <div style={s.error}>{erro}</div>}

        <label style={s.label}>E-mail</label>
        <input
          style={s.input}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label style={s.label}>Senha</label>
        <input
          style={s.input}
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="current-password"
          required
        />

        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#999", fontSize: 13, marginBottom: 18, cursor: "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={lembrar}
            onChange={(e) => setLembrar(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: "#F0B90B", cursor: "pointer" }}
          />
          Lembrar-me
        </label>

        <button style={{ ...s.button, opacity: carregando ? 0.6 : 1 }} disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </button>

        <div style={s.footerLink}>
          Não tem conta?{" "}
          <Link to="/cadastro" style={{ color: "#F0B90B", fontWeight: 700 }}>
            Cadastre-se
          </Link>
        </div>
      </form>
    </div>
  )
}
