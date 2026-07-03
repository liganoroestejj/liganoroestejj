import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { authErrorMessage } from "../../lib/authErrors"
import * as s from "./authStyles"

const REMEMBER_KEY = "lnjjp_login"

export default function Login() {
  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [lembrar, setLembrar] = useState(false)
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [aviso, setAviso] = useState("")
  const [enviandoReset, setEnviandoReset] = useState(false)

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

  async function handleReset() {
    setErro("")
    setAviso("")
    if (!email.trim()) {
      setErro("Informe seu e-mail acima para receber o link de redefinição.")
      return
    }
    setEnviandoReset(true)
    try {
      await resetPassword(email.trim())
      setAviso("Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.")
    } catch (err) {
      setErro(authErrorMessage(err))
    } finally {
      setEnviandoReset(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setAviso("")
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
        {aviso && (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80", fontSize: 13, padding: "10px 14px", borderRadius: 6, marginBottom: 14 }}>
            {aviso}
          </div>
        )}

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

        <div style={{ textAlign: "right", marginBottom: 14 }}>
          <button
            type="button"
            onClick={handleReset}
            disabled={enviandoReset}
            style={{ background: "none", border: "none", color: "#F0B90B", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0, letterSpacing: 0.5, opacity: enviandoReset ? 0.6 : 1 }}
          >
            {enviandoReset ? "Enviando..." : "Esqueci minha senha"}
          </button>
        </div>

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
