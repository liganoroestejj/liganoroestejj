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
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [lembrar, setLembrar] = useState(false)
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [aviso, setAviso] = useState("")
  const [enviandoReset, setEnviandoReset] = useState(false)

  // Carrega o e-mail salvo, se "lembrar-me" estava ativo. Nunca guardamos a
  // senha: o Firebase já mantém a sessão; salvar a senha seria expô-la em claro.
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      try {
        const { email } = JSON.parse(saved)
        if (email) {
          setEmail(email)
          setLembrar(true)
        }
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
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email }))
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
        <div style={{ position: "relative", marginBottom: 18 }}>
          <input
            style={{ ...s.input, marginBottom: 0, paddingRight: 44 }}
            type={mostrarSenha ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", color: "#999" }}
          >
            {mostrarSenha ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

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
