import { useState } from "react"
import { Link } from "react-router-dom"
import { authErrorMessage } from "../../lib/authErrors"
import { cleanCpf, formatCpf, isValidCpf } from "../../lib/cpf"
import { formatCep, formatPhone } from "../../lib/masks"
import { hasLetter, isValidEmail, isValidName, sanitizeName } from "../../lib/sanitize"
import { fetchAddressByCep } from "../../lib/cep"
import { useAcademies } from "../../hooks/useAcademies"
import {
  cpfAlreadyRegistered,
  registerAffiliate,
  type AffiliateInput,
} from "../../lib/affiliates"
import {
  BELT_LABELS,
  categoryFromBirthDate,
  GENDER_LABELS,
  MEMBERSHIP_FEE,
  ROLE_LABELS,
  STATES,
  WHATSAPP_PHONE,
} from "../../lib/affiliateOptions"
import * as s from "./authStyles"

type Form = {
  cpf: string
  birthDate: string
  gender: string
  fullName: string
  email: string
  instagram: string
  phone: string
  address: string
  neighborhood: string
  zipCode: string
  city: string
  state: string
  academyId: string
  belt: string
  role: string
  password: string
  confirm: string
}

const empty: Form = {
  cpf: "", birthDate: "", gender: "", fullName: "", email: "", instagram: "",
  phone: "", address: "", neighborhood: "", zipCode: "", city: "", state: "RJ",
  academyId: "", belt: "", role: "", password: "", confirm: "",
}

// Limites coerentes para data de nascimento (evita anos absurdos: BUG-03).
const MIN_BIRTH_DATE = "1920-01-01"

// Idade mínima exigida pela categoria infantil (BUG-03): barra menores de 4 anos.
// A data máxima permitida é hoje menos MIN_AGE anos — nunca a data de hoje.
const MIN_AGE = 4
function isoYearsAgo(years: number): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - years)
  return d.toISOString().slice(0, 10)
}
const MAX_BIRTH_DATE = isoYearsAgo(MIN_AGE)

/** Valida a data de nascimento. Retorna mensagem de erro ou "" se ok. */
function validateBirthDate(iso: string): string {
  if (!iso) return "Informe a data de nascimento."
  if (iso < MIN_BIRTH_DATE) return "Data inválida (ano mínimo: 1920)."
  // Barra futuro e idades abaixo do mínimo (categoria infantil, 4 anos).
  if (iso > MAX_BIRTH_DATE) return `Data inválida (idade mínima: ${MIN_AGE} anos).`
  return ""
}

/** Valida um campo da Etapa 2. Retorna a mensagem de erro ou "" se ok. */
function validateField(name: keyof Form, form: Form): string {
  const v = (form[name] ?? "").trim()
  switch (name) {
    case "fullName":
      if (v.length < 5 || !v.includes(" ")) return "Informe seu nome completo (nome e sobrenome)."
      return isValidName(v) ? "" : "O nome deve conter apenas letras, espaços, apóstrofo ou hífen."
    case "email":
      return isValidEmail(v) ? "" : "E-mail inválido."
    case "instagram":
      return v.replace(/^@/, "").length >= 3 ? "" : "Instagram inválido (mín. 3 caracteres)."
    case "phone": {
      const d = v.replace(/\D/g, "")
      return d.length >= 10 && d.length <= 11 ? "" : "Telefone inválido (DDD + número, 10 ou 11 dígitos)."
    }
    case "address":
      if (v.length < 5) return "Endereço muito curto (mín. 5 caracteres)."
      return hasLetter(v) ? "" : "Endereço inválido (informe o nome da rua)."
    case "neighborhood":
      return v.length >= 3 ? "" : "Bairro muito curto (mín. 3 caracteres)."
    case "zipCode":
      return v.replace(/\D/g, "").length === 8 ? "" : "CEP deve ter 8 dígitos."
    case "city":
      if (v.length < 3) return "Cidade muito curta (mín. 3 caracteres)."
      return hasLetter(v) ? "" : "Cidade inválida (informe o nome da cidade)."
    case "state":
      return v ? "" : "Selecione o estado."
    case "academyId":
      return v ? "" : "Selecione a academia."
    case "belt":
      return v ? "" : "Selecione a faixa."
    case "role":
      return v ? "" : "Selecione o tipo de cadastro."
    case "password":
      return form.password.length >= 6 ? "" : "A senha deve ter no mínimo 6 caracteres."
    case "confirm":
      if (form.confirm.length < 6) return "Confirme a senha (mín. 6 caracteres)."
      return form.confirm === form.password ? "" : "As senhas não conferem."
    default:
      return ""
  }
}

const etapa2Fields: (keyof Form)[] = [
  "fullName", "email", "instagram", "phone", "address", "neighborhood",
  "zipCode", "city", "state", "academyId", "belt", "role", "password", "confirm",
]

const fieldErrStyle: React.CSSProperties = { color: "#f87171", fontSize: 12, marginTop: -10, marginBottom: 14 }

export default function Cadastro() {
  const { academies, carregando: carregandoAcademias, erro: erroAcademias } = useAcademies()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [form, setForm] = useState<Form>(empty)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [buscandoCep, setBuscandoCep] = useState(false)

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  // Ao completar 8 dígitos do CEP, autocompleta cidade/UF (e bairro/endereço,
  // se ainda vazios) via ViaCEP. Falha silenciosa: é só conveniência.
  async function handleCep(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 8)
    set("zipCode", digits)
    if (digits.length !== 8) return
    setBuscandoCep(true)
    try {
      const addr = await fetchAddressByCep(digits)
      if (!addr) return
      setForm((f) => ({
        ...f,
        city: addr.city || f.city,
        state: addr.state || f.state,
        neighborhood: f.neighborhood.trim() ? f.neighborhood : addr.neighborhood,
        address: f.address.trim() ? f.address : addr.street,
      }))
    } finally {
      setBuscandoCep(false)
    }
  }
  const touch = (k: keyof Form) => setTouched((t) => ({ ...t, [k]: true }))
  // Mensagem de erro do campo, só depois de "tocado" (blur) ou submit.
  const fieldErr = (k: keyof Form) => (touched[k] ? validateField(k, form) : "")

  // --- Etapa 1: valida o CPF antes de seguir ---
  async function avancarEtapa1(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    // 1) Formato: precisa dos 11 dígitos.
    if (cleanCpf(form.cpf).length !== 11) {
      setErro("Digite os 11 dígitos do CPF.")
      return
    }
    // 2) Dígito verificador: o CPF precisa ser matematicamente válido.
    if (!isValidCpf(form.cpf)) {
      setErro("CPF inválido. Verifique os números digitados.")
      return
    }
    // 3) Data de nascimento dentro de um intervalo coerente.
    const birthErr = validateBirthDate(form.birthDate)
    if (birthErr) {
      setErro(birthErr)
      return
    }
    // 4) Sexo é obrigatório.
    if (!form.gender) {
      setErro("Selecione o sexo.")
      return
    }
    setCarregando(true)
    try {
      // 3) Unicidade: não pode já existir filiação com este CPF.
      if (await cpfAlreadyRegistered(form.cpf)) {
        setErro("Este CPF já possui uma filiação cadastrada.")
        return
      }
      setStep(2)
    } catch {
      setErro("Não foi possível validar o CPF agora. Tente novamente.")
    } finally {
      setCarregando(false)
    }
  }

  // --- Etapa 2: grava a filiação ---
  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    // Marca todos como tocados pra exibir os erros por campo.
    setTouched(Object.fromEntries(etapa2Fields.map((f) => [f, true])))
    if (etapa2Fields.some((f) => validateField(f, form))) return
    setCarregando(true)
    try {
      const input: AffiliateInput = {
        cpf: form.cpf,
        birthDate: form.birthDate,
        gender: Number(form.gender),
        fullName: form.fullName,
        email: form.email,
        instagram: form.instagram,
        phone: form.phone,
        address: form.address,
        neighborhood: form.neighborhood,
        zipCode: form.zipCode,
        city: form.city,
        state: form.state,
        academyId: Number(form.academyId),
        belt: Number(form.belt),
        role: Number(form.role),
        password: form.password,
      }
      await registerAffiliate(input)
      setStep(3)
    } catch (err) {
      setErro(authErrorMessage(err))
    } finally {
      setCarregando(false)
    }
  }

  const categoria = form.birthDate ? categoryFromBirthDate(form.birthDate).label : "—"

  // ===== Etapa 3: sucesso + pagamento =====
  if (step === 3) {
    const msg = encodeURIComponent(
      `Olá! Concluí minha filiação na Liga Noroeste (${form.fullName}, CPF ${form.cpf}) e quero pagar a anuidade de R$ ${MEMBERSHIP_FEE},00.`,
    )
    return (
      <div style={s.page}>
        <div style={s.card}>
          <h1 style={s.title}>FILIAÇÃO ENVIADA</h1>
          <div style={s.subtitle}>Pagamento pendente</div>
          <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
            Sua filiação foi registrada com sucesso. Para ativar, faça o pagamento
            da anuidade pelo WhatsApp.
          </p>
          <div style={{ background: "#0A0A0A", border: "1px solid #333", borderRadius: 6, padding: "16px 18px", marginBottom: 22 }}>
            <div style={{ color: "#666", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Valor da anuidade</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#F0B90B", fontSize: 40, letterSpacing: 1 }}>R$ {MEMBERSHIP_FEE},00</div>
          </div>
          <a href={`https://wa.me/${WHATSAPP_PHONE}?text=${msg}`} target="_blank" rel="noopener noreferrer" style={{ ...s.button, display: "block", textAlign: "center", textDecoration: "none" }}>
            Pagar pelo WhatsApp
          </a>
          <div style={s.footerLink}>
            <Link to="/painel" style={{ color: "#F0B90B", fontWeight: 700 }}>Ir para minha área →</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <form style={s.card} onSubmit={step === 1 ? avancarEtapa1 : enviar}>
        <Link to="/" style={{ color: "#999", fontSize: 13, fontWeight: 600, textDecoration: "none", letterSpacing: 1, display: "inline-block", marginBottom: 20 }}>
          ← Voltar ao início
        </Link>
        <h1 style={s.title}>FILIAÇÃO</h1>
        <div style={s.subtitle}>Etapa {step} de 2 · Liga Noroeste</div>

        {erro && <div style={s.error}>{erro}</div>}

        {step === 1 ? (
          <>
            <label style={s.label}>CPF</label>
            <input
              style={s.input}
              value={form.cpf}
              onChange={(e) => set("cpf", formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              required
            />

            <label style={s.label}>Data de nascimento</label>
            <input
              style={s.input}
              className="date-accent"
              type="date"
              value={form.birthDate}
              min={MIN_BIRTH_DATE}
              max={MAX_BIRTH_DATE}
              onChange={(e) => set("birthDate", e.target.value)}
              required
            />

            <label style={s.label}>Sexo</label>
            <select style={s.select} value={form.gender} onChange={(e) => set("gender", e.target.value)} required>
              <option value="">Selecione</option>
              {Object.entries(GENDER_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>

            <button style={{ ...s.button, opacity: carregando ? 0.6 : 1 }} disabled={carregando}>
              {carregando ? "Validando CPF..." : "Continuar"}
            </button>
          </>
        ) : (
          <>
            <label style={s.label}>Nome completo</label>
            <input style={s.input} value={form.fullName} onChange={(e) => set("fullName", sanitizeName(e.target.value))} onBlur={() => touch("fullName")} autoComplete="name" />
            {fieldErr("fullName") && <div style={fieldErrStyle}>{fieldErr("fullName")}</div>}

            <label style={s.label}>E-mail</label>
            <input style={s.input} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} onBlur={() => touch("email")} autoComplete="email" />
            {fieldErr("email") && <div style={fieldErrStyle}>{fieldErr("email")}</div>}

            <label style={s.label}>Instagram</label>
            <input style={s.input} value={form.instagram} onChange={(e) => set("instagram", e.target.value)} onBlur={() => touch("instagram")} placeholder="@seuperfil" />
            {fieldErr("instagram") && <div style={fieldErrStyle}>{fieldErr("instagram")}</div>}

            <label style={s.label}>Telefone</label>
            <input style={s.input} value={formatPhone(form.phone)} onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 11))} onBlur={() => touch("phone")} placeholder="(22) 99999-8888" inputMode="numeric" />
            {fieldErr("phone") && <div style={fieldErrStyle}>{fieldErr("phone")}</div>}

            <label style={s.label}>Endereço</label>
            <input style={s.input} value={form.address} onChange={(e) => set("address", e.target.value)} onBlur={() => touch("address")} placeholder="Rua, Av., Travessa..." />
            {fieldErr("address") && <div style={fieldErrStyle}>{fieldErr("address")}</div>}

            <label style={s.label}>Bairro</label>
            <input style={s.input} value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} onBlur={() => touch("neighborhood")} />
            {fieldErr("neighborhood") && <div style={fieldErrStyle}>{fieldErr("neighborhood")}</div>}

            <label style={s.label}>CEP {buscandoCep && <span style={{ color: "#777", fontWeight: 400 }}>· buscando endereço...</span>}</label>
            <input style={s.input} value={formatCep(form.zipCode)} onChange={(e) => handleCep(e.target.value)} onBlur={() => touch("zipCode")} placeholder="00000-000" inputMode="numeric" />
            {fieldErr("zipCode") && <div style={fieldErrStyle}>{fieldErr("zipCode")}</div>}

            <label style={s.label}>Cidade</label>
            <input style={s.input} value={form.city} onChange={(e) => set("city", e.target.value)} onBlur={() => touch("city")} />
            {fieldErr("city") && <div style={fieldErrStyle}>{fieldErr("city")}</div>}

            <label style={s.label}>Estado (UF)</label>
            <select style={s.select} value={form.state} onChange={(e) => set("state", e.target.value)} onBlur={() => touch("state")}>
              {STATES.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
            </select>
            {fieldErr("state") && <div style={fieldErrStyle}>{fieldErr("state")}</div>}

            <label style={s.label}>Academia</label>
            <select
              style={s.select}
              value={form.academyId}
              onChange={(e) => set("academyId", e.target.value)}
              onBlur={() => touch("academyId")}
              disabled={carregandoAcademias || !!erroAcademias}
            >
              <option value="">
                {carregandoAcademias ? "Carregando academias..." : "Escolha sua academia"}
              </option>
              {academies.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            {erroAcademias && <div style={fieldErrStyle}>{erroAcademias}</div>}
            {fieldErr("academyId") && <div style={fieldErrStyle}>{fieldErr("academyId")}</div>}

            <label style={s.label}>Faixa</label>
            <select style={s.select} value={form.belt} onChange={(e) => set("belt", e.target.value)} onBlur={() => touch("belt")}>
              <option value="">Escolha sua faixa</option>
              {Object.entries(BELT_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            {fieldErr("belt") && <div style={fieldErrStyle}>{fieldErr("belt")}</div>}

            <label style={s.label}>Categoria (automática)</label>
            <input style={{ ...s.input, color: "#777" }} value={categoria} disabled />

            <label style={s.label}>Tipo de cadastro</label>
            <select style={s.select} value={form.role} onChange={(e) => set("role", e.target.value)} onBlur={() => touch("role")}>
              <option value="">Selecione</option>
              {Object.entries(ROLE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            {fieldErr("role") && <div style={fieldErrStyle}>{fieldErr("role")}</div>}

            <div style={{ height: 1, background: "#222", margin: "8px 0 20px" }} />
            <div style={s.label}>Dados de acesso</div>

            <label style={s.label}>Senha</label>
            <input style={s.input} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} onBlur={() => touch("password")} autoComplete="new-password" />
            {fieldErr("password") && <div style={fieldErrStyle}>{fieldErr("password")}</div>}

            <label style={s.label}>Confirmar senha</label>
            <input style={s.input} type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} onBlur={() => touch("confirm")} autoComplete="new-password" />
            {fieldErr("confirm") && <div style={fieldErrStyle}>{fieldErr("confirm")}</div>}

            <button style={{ ...s.button, opacity: carregando ? 0.6 : 1 }} disabled={carregando}>
              {carregando ? "Enviando..." : "Concluir filiação"}
            </button>
            <button type="button" onClick={() => { setErro(""); setStep(1) }} style={{ width: "100%", background: "none", border: "none", color: "#777", fontSize: 12, marginTop: 14, cursor: "pointer", letterSpacing: 1 }}>
              ← Voltar
            </button>
          </>
        )}

        <div style={s.footerLink}>
          Já tem conta?{" "}
          <Link to="/login" style={{ color: "#F0B90B", fontWeight: 700 }}>Entrar</Link>
        </div>
      </form>
    </div>
  )
}
