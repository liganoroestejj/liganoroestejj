import { useEffect, useRef, useState } from "react"
import { Link, Navigate, useNavigate } from "react-router-dom"
import { collection, getDocs, limit, query, where } from "firebase/firestore"
import { sendEmailVerification } from "firebase/auth"
import { db } from "../../lib/firebase"
import { useAuth } from "../../context/AuthContext"
import { removeProfilePhoto, updateAffiliateProfile, uploadProfilePhoto, type EditableProfile } from "../../lib/affiliates"
import { BELT_LABELS, GENDER_LABELS, ROLE_LABELS, effectiveStatus, MEMBERSHIP_FEE, STATES, WHATSAPP_PHONE } from "../../lib/affiliateOptions"
import { useAcademies } from "../../hooks/useAcademies"
import { formatCep, formatPhone } from "../../lib/masks"
import { isValidEmail } from "../../lib/sanitize"

// Os dois botões da foto dividem a linha em partes iguais e quebram juntos no
// mobile: sem isso cada um ficava com a largura do próprio texto ("Trocar foto"
// x "Remover foto"), deixando a dupla desalinhada em telas estreitas.
const botaoFoto: React.CSSProperties = {
  flex: "1 1 150px",
  maxWidth: 180,
  fontSize: 12,
  padding: "9px 12px",
  borderRadius: 5,
  letterSpacing: 1,
  textTransform: "uppercase",
  textAlign: "center",
  whiteSpace: "nowrap",
  cursor: "pointer",
}

function formatDate(iso?: string): string {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  return d ? `${d}/${m}/${y}` : iso
}
import Carteirinha from "../../components/Carteirinha"

const WhatsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#F0B90B">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a3.178 3.178 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.124 1.525 5.857L.057 23.13a.75.75 0 0 0 .92.92l5.273-1.468A11.956 11.956 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.515-5.17-1.41l-.37-.219-3.827 1.065 1.065-3.827-.219-.37A9.956 9.956 0 0 1 2 12C2 6.478 6.478 2 12 2s10 4.478 10 10-4.478 10-10 10z"/>
  </svg>
)

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  pending: { text: "Pagamento pendente", color: "#F0B90B" },
  active: { text: "Ativo", color: "#22c55e" },
  overdue: { text: "Em atraso", color: "#ef4444" },
}

interface Affiliate {
  cpf: string
  fullName: string
  belt: number
  category: number
  academyId: number
  status: string
  photoURL?: string
  birthDate?: string
  gender?: number
  role?: number
  validUntil?: string
  cardId?: string
  // Dados de contato/endereço (editáveis pelo dono).
  email?: string
  instagram?: string
  phone?: string
  address?: string
  neighborhood?: string
  zipCode?: string
  city?: string
  state?: string
}

const emptyProfile: EditableProfile = {
  fullName: "", birthDate: "", gender: 1, academyId: 0, belt: 1, role: 1,
  email: "", instagram: "", phone: "", address: "",
  neighborhood: "", zipCode: "", city: "", state: "RJ",
}

function profileFromAffiliate(a: Affiliate): EditableProfile {
  return {
    fullName: a.fullName ?? "",
    birthDate: a.birthDate ?? "",
    gender: a.gender ?? 1,
    academyId: a.academyId,
    belt: a.belt,
    role: a.role ?? 1,
    email: a.email ?? "",
    instagram: a.instagram ?? "",
    phone: a.phone ?? "",
    address: a.address ?? "",
    neighborhood: a.neighborhood ?? "",
    zipCode: a.zipCode ?? "",
    city: a.city ?? "",
    state: a.state ?? "RJ",
  }
}

const editLabel: React.CSSProperties = { color: "#888", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, display: "block" }
const editInput: React.CSSProperties = { width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 6, color: "#eee", fontSize: 14, padding: "10px 12px", marginBottom: 12, boxSizing: "border-box", outline: "none" }

export default function Painel() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [removendoFoto, setRemovendoFoto] = useState(false)
  const [erroFoto, setErroFoto] = useState("")
  const [avisoFoto, setAvisoFoto] = useState("") // feedback de sucesso (BUG-16)
  const fileRef = useRef<HTMLInputElement>(null)

  // Aviso de e-mail não verificado (reenvio da confirmação)
  const [reenviando, setReenviando] = useState(false)
  const [reenvioMsg, setReenvioMsg] = useState("")

  // Edição de perfil (BUG-15)
  const [editando, setEditando] = useState(false)
  const [editForm, setEditForm] = useState<EditableProfile>(emptyProfile)
  const [salvando, setSalvando] = useState(false)
  const [erroEdit, setErroEdit] = useState("")
  const [avisoEdit, setAvisoEdit] = useState("")
  const { academies } = useAcademies()

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const q = query(collection(db, "affiliates"), where("uid", "==", user.uid), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) setAffiliate(snap.docs[0].data() as Affiliate)
      setCarregando(false)
    })()
  }, [user])

  // A conta de administrador é redirecionada para o painel admin.
  if (isAdmin) return <Navigate to="/admin" replace />

  async function handleLogout() {
    await logout()
    navigate("/", { replace: true })
  }

  async function reenviarConfirmacao() {
    if (!user) return
    setReenvioMsg("")
    setReenviando(true)
    try {
      await sendEmailVerification(user)
      setReenvioMsg("E-mail de confirmação reenviado. Verifique sua caixa de entrada (e o spam).")
    } catch {
      setReenvioMsg("Não foi possível reenviar agora. Tente novamente em alguns minutos.")
    } finally {
      setReenviando(false)
    }
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user || !affiliate) return
    setErroFoto("")
    setAvisoFoto("")
    setEnviandoFoto(true)
    try {
      const photoURL = await uploadProfilePhoto(user.uid, affiliate.cpf, file, affiliate.cardId)
      setAffiliate({ ...affiliate, photoURL })
      setAvisoFoto("Foto atualizada com sucesso.")
    } catch {
      setErroFoto("Não foi possível enviar a foto. Tente novamente.")
    } finally {
      setEnviandoFoto(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  async function handleRemoverFoto() {
    if (!affiliate || !affiliate.photoURL) return
    setErroFoto("")
    setAvisoFoto("")
    setRemovendoFoto(true)
    try {
      await removeProfilePhoto(affiliate.cpf, affiliate.cardId)
      setAffiliate({ ...affiliate, photoURL: "" })
      setAvisoFoto("Foto removida com sucesso.")
    } catch {
      setErroFoto("Não foi possível remover a foto. Tente novamente.")
    } finally {
      setRemovendoFoto(false)
    }
  }

  function abrirEdicao() {
    if (!affiliate) return
    setEditForm(profileFromAffiliate(affiliate))
    setErroEdit("")
    setAvisoEdit("")
    setEditando(true)
  }

  const setEdit = <K extends keyof EditableProfile>(k: K, v: EditableProfile[K]) =>
    setEditForm((f) => ({ ...f, [k]: v }))

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault()
    if (!affiliate) return
    setErroEdit("")
    setAvisoEdit("")
    if (!editForm.fullName.trim()) {
      setErroEdit("Informe o nome completo.")
      return
    }
    if (!editForm.birthDate) {
      setErroEdit("Informe a data de nascimento.")
      return
    }
    if (!academies.some((a) => a.id === editForm.academyId)) {
      setErroEdit("Escolha uma academia.")
      return
    }
    if (!isValidEmail(editForm.email)) {
      setErroEdit("E-mail inválido.")
      return
    }
    if (editForm.zipCode.replace(/\D/g, "").length !== 8) {
      setErroEdit("CEP deve ter 8 dígitos.")
      return
    }
    setSalvando(true)
    try {
      const data: EditableProfile = {
        ...editForm,
        fullName: editForm.fullName.trim(),
        zipCode: editForm.zipCode.replace(/\D/g, ""),
      }
      await updateAffiliateProfile(affiliate.cpf, data, affiliate.cardId)
      setAffiliate({ ...affiliate, ...data })
      setAvisoEdit("Dados atualizados com sucesso.")
      setEditando(false)
    } catch (err) {
      // Sem distinguir o motivo, "tente novamente" manda o usuário repetir uma
      // ação que nunca vai funcionar. Permissão negada é falha de configuração
      // (regras do Firestore desatualizadas), não algo que ele resolva.
      const codigo = (err as { code?: string })?.code ?? ""
      console.error("Falha ao salvar o perfil:", err)
      setErroEdit(codigo === "permission-denied"
        ? "Sem permissão para salvar estes dados. Avise a organização da liga (as regras do banco precisam ser atualizadas)."
        : "Não foi possível salvar. Tente novamente.")
    } finally {
      setSalvando(false)
    }
  }

  const eff = affiliate ? effectiveStatus(affiliate.status, affiliate.validUntil) : null
  const st = eff ? STATUS_LABEL[eff] ?? STATUS_LABEL.pending : null

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", padding: "60px 24px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link to="/" style={{ color: "#999", fontSize: 13, fontWeight: 600, textDecoration: "none", letterSpacing: 1, display: "inline-block", marginBottom: 24 }}>
          ← Voltar ao site
        </Link>
        <div style={{ color: "#F0B90B", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>
          Área do Atleta
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, color: "#fff", letterSpacing: 2, margin: 0 }}>
          Olá, {user?.displayName || user?.email}
        </h1>

        {user && !user.emailVerified && (
          <div style={{ background: "#1a1608", border: "1px solid #3a3320", borderRadius: 8, padding: "16px 20px", marginTop: 20 }}>
            <div style={{ color: "#F0B90B", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              Confirme seu e-mail
            </div>
            <div style={{ color: "#bbb", fontSize: 13, lineHeight: 1.5, marginBottom: reenvioMsg ? 8 : 12 }}>
              Enviamos um link de confirmação para <span style={{ color: "#ddd" }}>{user.email}</span>. Não recebeu?
            </div>
            {reenvioMsg && <div style={{ color: "#4ade80", fontSize: 12, marginBottom: 12 }}>{reenvioMsg}</div>}
            <button
              onClick={reenviarConfirmacao}
              disabled={reenviando}
              style={{ background: "none", color: "#F0B90B", fontSize: 12, fontWeight: 700, border: "1px solid #3a3320", padding: "8px 16px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", opacity: reenviando ? 0.6 : 1 }}
            >
              {reenviando ? "Reenviando..." : "Reenviar e-mail"}
            </button>
          </div>
        )}

        {carregando ? (
          <p style={{ color: "#666", fontSize: 14, marginTop: 16 }}>Carregando filiação...</p>
        ) : affiliate ? (
          <>
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: 8, padding: "24px", marginTop: 28, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ color: "#888", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>Situação</span>
                <span style={{ color: st!.color, fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>● {st!.text}</span>
              </div>
              <div style={{ color: "#ccc", fontSize: 14, marginBottom: 8 }}>Faixa: <span style={{ color: "#fff" }}>{BELT_LABELS[affiliate.belt] ?? "—"}</span></div>
              {affiliate.validUntil && (
                <div style={{ color: "#ccc", fontSize: 14, marginBottom: 8 }}>
                  Anuidade válida até: <span style={{ color: "#fff" }}>{formatDate(affiliate.validUntil)}</span>
                </div>
              )}
              {eff !== "active" && (
                <div style={{ color: eff === "overdue" ? "#ef4444" : "#F0B90B", fontSize: 13, marginBottom: 14 }}>
                  {eff === "overdue" ? "Sua anuidade venceu. Realize o pagamento para reativar." : "Realize o pagamento para ativar sua filiação."}
                </div>
              )}
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Olá! Sou ${affiliate.fullName} (CPF ${affiliate.cpf}) e quero realizar o pagamento da anuidade de R$ ${MEMBERSHIP_FEE},00.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#F0B90B", fontSize: 13, fontWeight: 700, textDecoration: "none", marginTop: 6 }}
              >
                <WhatsIcon /> Realizar pagamento
              </a>
            </div>

            {/* Foto da carteirinha */}
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: 8, padding: "24px", marginBottom: 28, display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ width: 88, height: 88, borderRadius: 8, background: "#0A0A0A", border: "1px solid #333", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {affiliate.photoURL ? (
                  <img src={affiliate.photoURL} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Foto da carteirinha</div>
                <div style={{ color: "#666", fontSize: 12, marginBottom: 10 }}>
                  {affiliate.photoURL ? "Foto enviada. Você pode trocá-la." : "Envie uma foto sua para a carteirinha digital."}
                </div>
                {erroFoto && <div style={{ color: "#f87171", fontSize: 12, marginBottom: 8 }}>{erroFoto}</div>}
                {avisoFoto && <div style={{ color: "#4ade80", fontSize: 12, marginBottom: 8 }}>{avisoFoto}</div>}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={enviandoFoto || removendoFoto}
                    style={{ ...botaoFoto, background: "#F0B90B", color: "#0A0A0A", fontWeight: 800, border: "none", opacity: enviandoFoto || removendoFoto ? 0.6 : 1 }}
                  >
                    {enviandoFoto ? "Enviando..." : affiliate.photoURL ? "Trocar foto" : "Enviar foto"}
                  </button>
                  {affiliate.photoURL && (
                    <button
                      onClick={handleRemoverFoto}
                      disabled={enviandoFoto || removendoFoto}
                      style={{ ...botaoFoto, background: "none", color: "#f87171", fontWeight: 700, border: "1px solid #533", opacity: enviandoFoto || removendoFoto ? 0.6 : 1 }}
                    >
                      {removendoFoto ? "Removendo..." : "Remover foto"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Meus dados — edição de contato/endereço (BUG-15) */}
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: 8, padding: "24px", marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editando ? 18 : 0 }}>
                <div style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Meus dados</div>
                {!editando && (
                  <button
                    onClick={abrirEdicao}
                    style={{ background: "none", color: "#F0B90B", fontSize: 12, fontWeight: 700, border: "1px solid #3a3320", padding: "8px 16px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}
                  >
                    Editar dados
                  </button>
                )}
              </div>

              {avisoEdit && !editando && <div style={{ color: "#4ade80", fontSize: 13, marginTop: 12 }}>{avisoEdit}</div>}

              {!editando ? (
                <div style={{ color: "#999", fontSize: 13, lineHeight: 1.9, marginTop: 12 }}>
                  <div>Nome: <span style={{ color: "#ddd" }}>{affiliate.fullName}</span></div>
                  <div>Nascimento: <span style={{ color: "#ddd" }}>{formatDate(affiliate.birthDate)}</span></div>
                  <div>Sexo: <span style={{ color: "#ddd" }}>{GENDER_LABELS[affiliate.gender ?? 0] ?? "—"}</span></div>
                  <div>Academia: <span style={{ color: "#ddd" }}>{academies.find((a) => a.id === affiliate.academyId)?.name ?? "—"}</span></div>
                  <div>Faixa: <span style={{ color: "#ddd" }}>{BELT_LABELS[affiliate.belt] ?? "—"}</span></div>
                  <div>Tipo: <span style={{ color: "#ddd" }}>{ROLE_LABELS[affiliate.role ?? 0] ?? "—"}</span></div>
                  <div>E-mail: <span style={{ color: "#ddd" }}>{affiliate.email || "—"}</span></div>
                  <div>Telefone: <span style={{ color: "#ddd" }}>{affiliate.phone ? formatPhone(affiliate.phone) : "—"}</span></div>
                  <div>Endereço: <span style={{ color: "#ddd" }}>{affiliate.address || "—"}{affiliate.neighborhood ? `, ${affiliate.neighborhood}` : ""}</span></div>
                  <div>Cidade/UF: <span style={{ color: "#ddd" }}>{affiliate.city || "—"}{affiliate.state ? ` / ${affiliate.state}` : ""}</span></div>
                  <div>CEP: <span style={{ color: "#ddd" }}>{affiliate.zipCode ? formatCep(affiliate.zipCode) : "—"}</span></div>
                </div>
              ) : (
                <form onSubmit={salvarPerfil}>
                  {erroEdit && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{erroEdit}</div>}

                  <label style={editLabel}>Nome completo</label>
                  <input aria-label="Nome completo" style={editInput} value={editForm.fullName} onChange={(e) => setEdit("fullName", e.target.value)} />

                  <label style={editLabel}>Data de nascimento</label>
                  <input aria-label="Data de nascimento" style={editInput} type="date" value={editForm.birthDate} onChange={(e) => setEdit("birthDate", e.target.value)} />

                  <label style={editLabel}>Sexo</label>
                  <select aria-label="Sexo" style={editInput} value={editForm.gender} onChange={(e) => setEdit("gender", Number(e.target.value))}>
                    {Object.entries(GENDER_LABELS).map(([id, label]) => (
                      <option key={id} value={id}>{label}</option>
                    ))}
                  </select>

                  <label style={editLabel}>Academia</label>
                  <select aria-label="Academia" style={editInput} value={editForm.academyId} onChange={(e) => setEdit("academyId", Number(e.target.value))}>
                    {/* A academia atual pode ter saído das opções: sem esta
                        entrada o select cairia sozinho na primeira da lista. */}
                    {!academies.some((a) => a.id === editForm.academyId) && (
                      <option value={editForm.academyId}>Selecione a academia</option>
                    )}
                    {academies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>

                  <label style={editLabel}>Faixa</label>
                  <select aria-label="Faixa" style={editInput} value={editForm.belt} onChange={(e) => setEdit("belt", Number(e.target.value))}>
                    {Object.entries(BELT_LABELS).map(([id, label]) => (
                      <option key={id} value={id}>{label}</option>
                    ))}
                  </select>

                  <label style={editLabel}>Tipo</label>
                  <select aria-label="Tipo" style={editInput} value={editForm.role} onChange={(e) => setEdit("role", Number(e.target.value))}>
                    {Object.entries(ROLE_LABELS).map(([id, label]) => (
                      <option key={id} value={id}>{label}</option>
                    ))}
                  </select>

                  <label style={editLabel}>E-mail</label>
                  <input aria-label="E-mail" style={editInput} type="email" value={editForm.email} onChange={(e) => setEdit("email", e.target.value)} />

                  <label style={editLabel}>Instagram</label>
                  <input aria-label="Instagram" style={editInput} value={editForm.instagram} onChange={(e) => setEdit("instagram", e.target.value)} placeholder="@seuperfil" />

                  <label style={editLabel}>Telefone</label>
                  <input aria-label="Telefone" style={editInput} value={formatPhone(editForm.phone)} onChange={(e) => setEdit("phone", e.target.value.replace(/\D/g, "").slice(0, 11))} inputMode="numeric" placeholder="(22) 99999-8888" />

                  <label style={editLabel}>Endereço</label>
                  <input aria-label="Endereço" style={editInput} value={editForm.address} onChange={(e) => setEdit("address", e.target.value)} />

                  <label style={editLabel}>Bairro</label>
                  <input aria-label="Bairro" style={editInput} value={editForm.neighborhood} onChange={(e) => setEdit("neighborhood", e.target.value)} />

                  <label style={editLabel}>CEP</label>
                  <input aria-label="CEP" style={editInput} value={formatCep(editForm.zipCode)} onChange={(e) => setEdit("zipCode", e.target.value.replace(/\D/g, "").slice(0, 8))} inputMode="numeric" placeholder="00000-000" />

                  <label style={editLabel}>Cidade</label>
                  <input aria-label="Cidade" style={editInput} value={editForm.city} onChange={(e) => setEdit("city", e.target.value)} />

                  <label style={editLabel}>Estado (UF)</label>
                  <select aria-label="Estado (UF)" style={editInput} value={editForm.state} onChange={(e) => setEdit("state", e.target.value)}>
                    {STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>

                  <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                    <button type="submit" disabled={salvando} style={{ background: "#F0B90B", color: "#0A0A0A", fontSize: 12, fontWeight: 800, padding: "11px 22px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", border: "none", cursor: "pointer", opacity: salvando ? 0.6 : 1 }}>
                      {salvando ? "Salvando..." : "Salvar"}
                    </button>
                    <button type="button" onClick={() => setEditando(false)} disabled={salvando} style={{ background: "none", color: "#999", fontSize: 12, fontWeight: 700, padding: "11px 22px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", border: "1px solid #444", cursor: "pointer" }}>
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Carteirinha digital — liberada após o 1º pagamento confirmado */}
            <div style={{ color: "#F0B90B", fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12, textAlign: "center" }}>
              Carteirinha digital
            </div>
            <div style={{ marginBottom: 28 }}>
              {affiliate.status === "active" && affiliate.cardId ? (
                <>
                  <div>
                    <Carteirinha
                      data={{
                        fullName: affiliate.fullName,
                        photoURL: affiliate.photoURL,
                        belt: affiliate.belt,
                        academyId: affiliate.academyId,
                        cpf: affiliate.cpf,
                        birthDate: affiliate.birthDate,
                        validUntil: affiliate.validUntil,
                        cardId: affiliate.cardId,
                      }}
                    />
                  </div>
                  <div style={{ textAlign: "center", marginTop: 16 }}>
                    {/* Link para a rota dedicada: impressão no navegador não é
                        confiável (Safari do iPhone e WebViews ignoram), então lá
                        a carteirinha vira uma imagem PNG salvável (BUG-14). */}
                    <a
                      href={`/carteirinha/${affiliate.cardId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-block", background: "none", color: "#F0B90B", fontSize: 12, fontWeight: 700, padding: "10px 22px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", border: "1px solid #3a3320", cursor: "pointer", textDecoration: "none" }}
                    >
                      Baixar carteirinha
                    </a>
                  </div>
                </>
              ) : (
                <div style={{ background: "#111", border: "1px dashed #333", borderRadius: 12, padding: "28px 24px", textAlign: "center" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" style={{ marginBottom: 10 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <div style={{ color: "#ccc", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Carteirinha bloqueada</div>
                  <div style={{ color: "#666", fontSize: 12, lineHeight: 1.5 }}>
                    Sua carteirinha digital será liberada após a confirmação do primeiro pagamento.
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <p style={{ color: "#666", fontSize: 14, marginTop: 16, marginBottom: 28 }}>
            Você ainda não tem uma filiação registrada.
          </p>
        )}

        <button
          onClick={handleLogout}
          style={{ border: "1px solid #444", color: "#999", fontSize: 12, fontWeight: 700, padding: "12px 24px", borderRadius: 5, letterSpacing: 2, textTransform: "uppercase", background: "none", cursor: "pointer" }}
        >
          Sair
        </button>
      </div>
    </div>
  )
}
