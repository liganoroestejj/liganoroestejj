import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth"
import { auth } from "../../lib/firebase"
import { authErrorMessage } from "../../lib/authErrors"
import * as s from "./authStyles"

/**
 * Página de ação de autenticação do Firebase (BUG-13).
 *
 * Substitui o handler padrão do Firebase (tela branca, botão azul genérico e
 * textos em inglês) por uma página em português, centralizada e com a
 * identidade visual da Liga Noroeste (Dark Mode + #F0B90B).
 *
 * Para ativá-la, configure no Firebase Console
 * (Authentication > Templates > "Personalizar URL de ação")
 * a URL: https://SEU_DOMINIO/auth/action
 * O Firebase adiciona ?mode=...&oobCode=... automaticamente.
 */
export default function AuthAction() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const mode = params.get("mode")
  const oobCode = params.get("oobCode") ?? ""

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState("")
  const [email, setEmail] = useState("")

  // Redefinição de senha
  const [senha, setSenha] = useState("")
  const [confirm, setConfirm] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [concluido, setConcluido] = useState(false)

  // Verificação de e-mail
  const [emailVerificado, setEmailVerificado] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (!oobCode || !mode) {
        setErro("Link inválido ou expirado.")
        setCarregando(false)
        return
      }
      try {
        if (mode === "resetPassword") {
          // Valida o código e recupera o e-mail associado.
          const mail = await verifyPasswordResetCode(auth, oobCode)
          setEmail(mail)
        } else if (mode === "verifyEmail") {
          await applyActionCode(auth, oobCode)
          setEmailVerificado(true)
        } else {
          setErro("Ação não suportada.")
        }
      } catch (err) {
        setErro(authErrorMessage(err))
      } finally {
        setCarregando(false)
      }
    })()
  }, [mode, oobCode])

  async function redefinirSenha(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    if (senha.length < 6) {
      setErro("A senha deve ter no mínimo 6 caracteres.")
      return
    }
    if (senha !== confirm) {
      setErro("As senhas não conferem.")
      return
    }
    setSalvando(true)
    try {
      await confirmPasswordReset(auth, oobCode, senha)
      setConcluido(true)
    } catch (err) {
      setErro(authErrorMessage(err))
    } finally {
      setSalvando(false)
    }
  }

  // Cabeçalho comum às telas.
  const Header = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <>
      <Link to="/" style={{ color: "#999", fontSize: 13, fontWeight: 600, textDecoration: "none", letterSpacing: 1, display: "inline-block", marginBottom: 20 }}>
        ← Voltar ao início
      </Link>
      <h1 style={s.title}>{title}</h1>
      <div style={s.subtitle}>{subtitle}</div>
    </>
  )

  return (
    <div style={s.page}>
      <div style={s.card}>
        {carregando ? (
          <>
            <Header title="AGUARDE" subtitle="Liga Noroeste Jiu-Jitsu Pro" />
            <p style={{ color: "#aaa", fontSize: 14 }}>Validando seu link...</p>
          </>
        ) : erro && !concluido ? (
          <>
            <Header title="OPS" subtitle="Liga Noroeste Jiu-Jitsu Pro" />
            <div style={s.error}>{erro}</div>
            <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              O link pode ter expirado ou já ter sido utilizado. Solicite um novo pelo login.
            </p>
            <Link to="/login" style={{ ...s.button, display: "block", textAlign: "center", textDecoration: "none" }}>
              Ir para o login
            </Link>
          </>
        ) : mode === "verifyEmail" && emailVerificado ? (
          <>
            <Header title="E-MAIL CONFIRMADO" subtitle="Liga Noroeste Jiu-Jitsu Pro" />
            <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
              Seu e-mail foi verificado com sucesso. Agora você já pode acessar sua área de atleta.
            </p>
            <button onClick={() => navigate("/painel")} style={s.button}>
              Ir para minha área
            </button>
          </>
        ) : mode === "resetPassword" && concluido ? (
          <>
            <Header title="SENHA REDEFINIDA" subtitle="Liga Noroeste Jiu-Jitsu Pro" />
            <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
              Sua senha foi alterada com sucesso. Use a nova senha para entrar.
            </p>
            <Link to="/login" style={{ ...s.button, display: "block", textAlign: "center", textDecoration: "none" }}>
              Entrar
            </Link>
          </>
        ) : mode === "resetPassword" ? (
          <form onSubmit={redefinirSenha}>
            <Header title="NOVA SENHA" subtitle="Liga Noroeste Jiu-Jitsu Pro" />
            {email && (
              <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>
                Defina uma nova senha para <span style={{ color: "#ddd" }}>{email}</span>.
              </p>
            )}

            <label style={s.label}>Nova senha</label>
            <input style={s.input} type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" />

            <label style={s.label}>Confirmar nova senha</label>
            <input style={s.input} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />

            <button style={{ ...s.button, opacity: salvando ? 0.6 : 1 }} disabled={salvando}>
              {salvando ? "Salvando..." : "Redefinir senha"}
            </button>
          </form>
        ) : (
          <>
            <Header title="OPS" subtitle="Liga Noroeste Jiu-Jitsu Pro" />
            <p style={{ color: "#888", fontSize: 14 }}>Ação não reconhecida.</p>
          </>
        )}
      </div>
    </div>
  )
}
