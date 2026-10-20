import { useEffect, useState } from "react"
import { Link, Navigate, useLocation, useParams } from "react-router-dom"
import { collection, getDocs, limit, query, where } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { useAuth } from "../../context/AuthContext"
import { getEventById, getEventDate, getEventStatus } from "../../data/events"
import { formatCpf } from "../../lib/cpf"
import { weightClass } from "../../lib/weightClasses"
import {
  createRegistration,
  getRegistration,
  isValidWeight,
  MAX_WEIGHT,
  MIN_WEIGHT,
  PADUA_EVENT_ID,
  parseWeight,
  registrationFee,
  type Registration,
} from "../../lib/registrations"
import {
  BELT_LABELS,
  categoryFromBirthDate,
  effectiveStatus,
  WHATSAPP_PHONE,
} from "../../lib/affiliateOptions"
import * as s from "../auth/authStyles"

interface Affiliate {
  cpf: string
  uid: string
  fullName: string
  birthDate?: string
  belt?: number
  gender?: number
  status?: string
  validUntil?: string
}

const avisoBox: React.CSSProperties = {
  background: "rgba(240,185,11,0.08)",
  border: "1px solid rgba(240,185,11,0.35)",
  color: "#F0B90B",
  fontSize: 13,
  lineHeight: 1.5,
  padding: "10px 14px",
  borderRadius: 6,
  marginBottom: 18,
}

const linha: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  fontSize: 13,
  color: "#ddd",
  padding: "7px 0",
  borderBottom: "1px solid #1e1e1e",
}

const rotulo: React.CSSProperties = { color: "#777" }

const telaCarregando = (texto: string) => (
  <div style={{ ...s.page, color: "#F0B90B", fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 4, fontSize: 22 }}>
    {texto}
  </div>
)

export default function Inscricao() {
  const { id } = useParams()
  const { pathname } = useLocation()
  const { user, loading } = useAuth()
  const evento = getEventById(id)

  const [carregando, setCarregando] = useState(true)
  const [afiliado, setAfiliado] = useState<Affiliate | null>(null)
  const [inscricao, setInscricao] = useState<Registration | null>(null)
  const [semFiliacao, setSemFiliacao] = useState(false)
  // Filiação existente, mas com anuidade pendente ou vencida.
  const [filiacaoEmAberto, setFiliacaoEmAberto] = useState(false)
  // Filiado sem data de nascimento: não dá para calcular o valor por idade.
  const [semNascimento, setSemNascimento] = useState(false)
  const [erro, setErro] = useState("")
  // Peso declarado: única informação que não vem da filiação, porque muda a
  // cada campeonato. Sem ele não há inscrição.
  const [peso, setPeso] = useState("")
  const [erroPeso, setErroPeso] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [valor, setValor] = useState(0)

  // A coleção de inscrições é a do Open Pádua: nenhuma outra etapa grava aqui,
  // e depois da data do evento ninguém mais se inscreve.
  const inscricoesAbertas =
    !!evento && evento.id === PADUA_EVENT_ID && evento.open && getEventStatus(evento) !== "passado"

  // Ao abrir a tela carregamos a filiação (todos os dados do atleta vêm dela)
  // e uma inscrição já existente. A gravação em si só acontece quando o atleta
  // informa o peso e confirma.
  useEffect(() => {
    if (!user || !evento || !inscricoesAbertas) return
    const dataEvento = getEventDate(evento)
    let ativo = true
    ;(async () => {
      try {
        const q = query(collection(db, "affiliates"), where("uid", "==", user.uid), limit(1))
        const snap = await getDocs(q)
        if (!ativo) return
        if (snap.empty) {
          setSemFiliacao(true)
          return
        }
        const dados = snap.docs[0].data() as Affiliate
        setAfiliado(dados)
        // Só atleta com a anuidade em dia compete: quem está pendente ou em
        // atraso regulariza a filiação antes de se inscrever na etapa.
        if (effectiveStatus(dados.status ?? "pending", dados.validUntil) !== "active") {
          setFiliacaoEmAberto(true)
          return
        }
        if (!dados.birthDate || !dataEvento) {
          setSemNascimento(true)
          return
        }
        setValor(registrationFee(dados.birthDate, dataEvento))
        // Já inscrito? Vai direto para o comprovante, sem pedir o peso de novo.
        const jaInscrito = await getRegistration(dados.cpf)
        if (ativo && jaInscrito) setInscricao(jaInscrito)
      } catch (err) {
        // O detalhe fica só no console (o atleta vê apenas o aviso amigável).
        // Causa mais comum: a regra do Firestore para `paduaRegistrations`
        // ainda não publicada — aí a leitura/escrita volta como
        // `permission-denied`.
        console.error("[inscricao] falha ao carregar a inscrição:", err)
        if (ativo) setErro("Não foi possível concluir sua inscrição agora. Tente novamente em alguns minutos.")
      } finally {
        if (ativo) setCarregando(false)
      }
    })()
    return () => {
      ativo = false
    }
  }, [user, evento, inscricoesAbertas])

  async function confirmar(e: React.FormEvent) {
    e.preventDefault()
    if (!afiliado || !user) return
    const kg = parseWeight(peso)
    if (!isValidWeight(kg)) {
      setErroPeso(`Informe o peso em quilos, entre ${MIN_WEIGHT} e ${MAX_WEIGHT}.`)
      return
    }
    setErroPeso("")
    setErro("")
    setEnviando(true)
    try {
      // O id do documento é o CPF, então confirmar duas vezes não duplica.
      setInscricao(await createRegistration({ cpf: afiliado.cpf, uid: user.uid, fee: valor, weight: kg }))
    } catch (err) {
      console.error("[inscricao] falha ao criar inscrição:", err)
      setErro("Não foi possível concluir sua inscrição agora. Tente novamente em alguns minutos.")
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return telaCarregando("CARREGANDO...")

  if (!evento) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <h1 style={s.title}>EVENTO NÃO ENCONTRADO</h1>
          <div style={s.footerLink}>
            <Link to="/" style={{ color: "#F0B90B", fontWeight: 700 }}>Voltar ao início</Link>
          </div>
        </div>
      </div>
    )
  }

  if (evento && !inscricoesAbertas) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <h1 style={s.title}>INSCRIÇÕES FECHADAS</h1>
          <div style={s.subtitle}>{evento.title}</div>
          <div style={avisoBox}>
            As inscrições desta etapa não estão abertas.
          </div>
          <div style={s.footerLink}>
            <Link to={`/evento/${evento.id}`} style={{ color: "#F0B90B", fontWeight: 700 }}>← Voltar ao evento</Link>
          </div>
        </div>
      </div>
    )
  }

  // Sem login: manda para o login avisando que é preciso ser filiado, e guarda
  // esta página como destino para voltar pra cá depois de entrar.
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: pathname,
          aviso:
            "Para se inscrever é preciso ser filiado à Liga Noroeste. Entre com sua conta de filiado. Se ainda não tem, faça sua filiação.",
        }}
      />
    )
  }

  if (carregando) return telaCarregando("CARREGANDO SEUS DADOS...")

  if (filiacaoEmAberto && afiliado) {
    const emAtraso = effectiveStatus(afiliado.status ?? "pending", afiliado.validUntil) === "overdue"
    return (
      <div style={s.page}>
        <div style={s.card}>
          <h1 style={s.title}>INSCRIÇÃO</h1>
          <div style={s.subtitle}>{evento?.title}</div>
          <div style={avisoBox}>
            {emAtraso
              ? "Sua anuidade está vencida. Regularize a filiação para se inscrever na etapa."
              : "Sua filiação ainda está com pagamento pendente. Assim que a organização confirmar, você pode se inscrever na etapa."}
          </div>
          <Link to="/painel" style={{ ...s.button, display: "block", textAlign: "center", textDecoration: "none" }}>
            Ir para minha área
          </Link>
          <div style={s.footerLink}>
            <Link to={`/evento/${evento?.id ?? ""}`} style={{ color: "#F0B90B", fontWeight: 700 }}>← Voltar ao evento</Link>
          </div>
        </div>
      </div>
    )
  }

  if (semNascimento) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <h1 style={s.title}>INSCRIÇÃO</h1>
          <div style={s.subtitle}>{evento?.title}</div>
          <div style={avisoBox}>
            Falta a data de nascimento no seu cadastro — é ela que define a
            categoria e o valor da inscrição. Complete seus dados e volte aqui.
          </div>
          <Link to="/painel" style={{ ...s.button, display: "block", textAlign: "center", textDecoration: "none" }}>
            Completar cadastro
          </Link>
          <div style={s.footerLink}>
            <Link to={`/evento/${evento?.id ?? ""}`} style={{ color: "#F0B90B", fontWeight: 700 }}>← Voltar ao evento</Link>
          </div>
        </div>
      </div>
    )
  }

  if (semFiliacao) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <h1 style={s.title}>INSCRIÇÃO</h1>
          <div style={s.subtitle}>{evento.title}</div>
          <div style={avisoBox}>
            Sua conta ainda não tem uma filiação cadastrada. Só atletas filiados
            podem se inscrever nas etapas da Liga.
          </div>
          <Link to="/cadastro" style={{ ...s.button, display: "block", textAlign: "center", textDecoration: "none" }}>
            Fazer filiação
          </Link>
          <div style={s.footerLink}>
            <Link to={`/evento/${evento.id}`} style={{ color: "#F0B90B", fontWeight: 700 }}>← Voltar ao evento</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!afiliado) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <h1 style={s.title}>INSCRIÇÃO</h1>
          <div style={s.subtitle}>{evento.title}</div>
          <div style={s.error}>{erro || "Não foi possível concluir sua inscrição agora."}</div>
          <div style={s.footerLink}>
            <Link to={`/evento/${evento.id}`} style={{ color: "#F0B90B", fontWeight: 700 }}>← Voltar ao evento</Link>
          </div>
        </div>
      </div>
    )
  }

  // Ainda não inscrito: falta o peso, a única coisa que o atleta informa.
  if (!inscricao) {
    return (
      <div style={s.page}>
        <form style={s.card} onSubmit={confirmar}>
          <Link to={`/evento/${evento.id}`} style={{ color: "#999", fontSize: 13, fontWeight: 600, textDecoration: "none", letterSpacing: 1, display: "inline-block", marginBottom: 20 }}>
            ← Voltar ao evento
          </Link>
          <h1 style={s.title}>INSCRIÇÃO</h1>
          <div style={s.subtitle}>{evento.title} · {evento.date}</div>

          {erro && <div style={s.error}>{erro}</div>}

          <div style={{ marginBottom: 22 }}>
            <div style={linha}><span style={rotulo}>Atleta</span><span>{afiliado.fullName}</span></div>
            <div style={linha}><span style={rotulo}>CPF</span><span>{formatCpf(afiliado.cpf)}</span></div>
            <div style={linha}><span style={rotulo}>Faixa</span><span>{afiliado.belt ? BELT_LABELS[afiliado.belt] : "—"}</span></div>
            <div style={linha}>
              <span style={rotulo}>Categoria</span>
              <span>{afiliado.birthDate ? categoryFromBirthDate(afiliado.birthDate).label : "—"}</span>
            </div>
            <div style={linha}><span style={rotulo}>Valor</span><span>R$ {valor},00</span></div>
          </div>

          <label style={s.label} htmlFor="peso">Peso (kg)</label>
          <input
            id="peso"
            style={s.input}
            value={peso}
            onChange={(e) => setPeso(e.target.value.replace(/[^\d.,]/g, "").slice(0, 6))}
            placeholder="Ex.: 82,5"
            inputMode="decimal"
            autoFocus
          />
          {erroPeso && <div style={{ color: "#f87171", fontSize: 12, marginTop: -10, marginBottom: 14 }}>{erroPeso}</div>}

          <div style={avisoBox}>
            Informe o peso com que pretende competir. Ele define sua categoria
            de peso e só pode ser alterado pela organização.
          </div>

          <button style={{ ...s.button, opacity: enviando ? 0.6 : 1 }} disabled={enviando}>
            {enviando ? "Enviando..." : "Confirmar inscrição"}
          </button>
        </form>
      </div>
    )
  }

  // Inscrição retirada pela organização: o atleta não reabre sozinho.
  if (inscricao.status === "removed") {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <h1 style={s.title}>INSCRIÇÃO REMOVIDA</h1>
          <div style={s.subtitle}>{evento.title}</div>
          <div style={avisoBox}>
            Sua inscrição nesta etapa foi removida pela organização. Fale com a
            Liga pelo WhatsApp se achar que foi engano.
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...s.button, display: "block", textAlign: "center", textDecoration: "none" }}
          >
            Falar com a organização
          </a>
          <div style={s.footerLink}>
            <Link to={`/evento/${evento.id}`} style={{ color: "#F0B90B", fontWeight: 700 }}>← Voltar ao evento</Link>
          </div>
        </div>
      </div>
    )
  }

  const paga = inscricao.status === "paid"
  // Só o Adulto e os Masters têm tabela cadastrada; nos outros fica só o peso.
  const classeDePeso = weightClass({
    weight: inscricao.weight,
    gender: afiliado.gender,
    ageCategoryId: afiliado.birthDate ? categoryFromBirthDate(afiliado.birthDate).id : undefined,
  })
  const categoria = afiliado.birthDate ? categoryFromBirthDate(afiliado.birthDate).label : "—"
  const faixa = afiliado.belt ? BELT_LABELS[afiliado.belt] : "—"
  const msg = encodeURIComponent(
    `Olá! Me inscrevi no ${evento.title} (${afiliado.fullName}, CPF ${formatCpf(afiliado.cpf)}) e quero pagar a inscrição de R$ ${inscricao.fee},00.`,
  )

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>{paga ? "INSCRIÇÃO CONFIRMADA" : "INSCRIÇÃO ENVIADA"}</h1>
        <div style={s.subtitle}>{paga ? "Pagamento confirmado" : "Pagamento pendente"}</div>

        <div style={{ marginBottom: 22 }}>
          <div style={linha}><span style={rotulo}>Evento</span><span>{evento.title}</span></div>
          <div style={linha}><span style={rotulo}>Data</span><span>{evento.date}</span></div>
          <div style={linha}><span style={rotulo}>Atleta</span><span>{afiliado.fullName}</span></div>
          <div style={linha}><span style={rotulo}>CPF</span><span>{formatCpf(afiliado.cpf)}</span></div>
          <div style={linha}><span style={rotulo}>Faixa</span><span>{faixa}</span></div>
          <div style={linha}><span style={rotulo}>Categoria</span><span>{categoria}</span></div>
          <div style={linha}><span style={rotulo}>Peso declarado</span><span>{inscricao.weight ? `${inscricao.weight} kg` : "—"}</span></div>
          {classeDePeso && (
            <div style={linha}><span style={rotulo}>Categoria de peso</span><span>{classeDePeso}</span></div>
          )}
        </div>

        <div style={{ background: "#0A0A0A", border: "1px solid #333", borderRadius: 6, padding: "16px 18px", marginBottom: 22 }}>
          <div style={{ color: "#666", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Valor da inscrição</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", color: "#F0B90B", fontSize: 40, letterSpacing: 1 }}>R$ {inscricao.fee},00</div>
          <div style={{ color: "#777", fontSize: 12 }}>Valor conforme a idade do atleta na data do evento.</div>
        </div>

        {paga ? (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80", fontSize: 13, padding: "10px 14px", borderRadius: 6 }}>
            Pagamento confirmado pela organização. Sua vaga está garantida.
          </div>
        ) : (
          <>
            <div style={avisoBox}>
              Sua inscrição foi registrada e fica pendente até a organização
              confirmar o pagamento, feito pelo WhatsApp.
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${msg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...s.button, display: "block", textAlign: "center", textDecoration: "none" }}
            >
              Pagar pelo WhatsApp
            </a>
          </>
        )}

        <div style={s.footerLink}>
          <Link to={`/evento/${evento.id}`} style={{ color: "#F0B90B", fontWeight: 700 }}>← Voltar ao evento</Link>
        </div>
      </div>
    </div>
  )
}
