import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import Inscricao from "./Inscricao"
import type { Registration } from "../../lib/registrations"

type FakeUser = { uid: string }

let mockUser: FakeUser | null = null
let mockLoading = false
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: mockUser, isAdmin: false, loading: mockLoading, logout: jest.fn() }),
}))

// Filiação lida do Firestore pelo uid do usuário logado.
let mockFiliacao: Record<string, unknown> | null = null
let mockErroBusca = false
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(() => {
    if (mockErroBusca) return Promise.reject(new Error("firestore fora do ar"))
    return Promise.resolve(
      mockFiliacao
        ? { empty: false, docs: [{ data: () => mockFiliacao }] }
        : { empty: true, docs: [] },
    )
  }),
  limit: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}))
jest.mock("../../lib/firebase", () => ({ db: {} }))

// Borda da lib: leitura e gravação da inscrição são mockadas; o cálculo do
// valor por idade e a validação do peso continuam os de verdade.
const mockCreate = jest.fn()
const mockGet = jest.fn()
jest.mock("../../lib/registrations", () => ({
  ...jest.requireActual("../../lib/registrations"),
  createRegistration: (...a: unknown[]) => mockCreate(...a),
  getRegistration: (...a: unknown[]) => mockGet(...a),
}))

/** Mostra o que a tela mandou para o /login (destino e motivo). */
function LoginFalso() {
  const { state } = useLocation() as { state?: { from?: string; aviso?: string } }
  return (
    <div>
      <span>TELA DE LOGIN</span>
      <span>{state?.from}</span>
      <span>{state?.aviso}</span>
    </div>
  )
}

function renderInscricao(rota = "/evento/2/inscricao") {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route path="/evento/:id/inscricao" element={<Inscricao />} />
        <Route path="/login" element={<LoginFalso />} />
        <Route path="/painel" element={<div>PAINEL</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

const inscricaoPendente: Registration = { cpf: "12964858705", uid: "u1", status: "pending", fee: 120, weight: 82.5 }

const filiadoAtivo = {
  cpf: "12964858705",
  uid: "u1",
  fullName: "Maurício Rimes Vieira",
  birthDate: "1992-10-25",
  belt: 6,
  status: "active",
  validUntil: "2027-09-02",
}

beforeEach(() => {
  jest.clearAllMocks()
  // Date precisa ser falso (o status do evento depende de "hoje"); os timers
  // seguem reais para o waitFor do Testing Library funcionar.
  jest.useFakeTimers({ doNotFake: ["setTimeout", "setInterval", "clearTimeout", "clearInterval", "queueMicrotask", "nextTick", "performance"] })
  jest.setSystemTime(new Date(2026, 9, 17)) // 17/10/2026, antes do evento
  mockUser = { uid: "u1" }
  mockLoading = false
  mockFiliacao = { ...filiadoAtivo }
  mockErroBusca = false
  mockCreate.mockResolvedValue(inscricaoPendente)
  mockGet.mockResolvedValue(null) // por padrão, ainda não inscrito
})

afterEach(() => {
  jest.useRealTimers()
})

describe("Inscrição — acesso", () => {
  it("mostra o carregamento enquanto a sessão não resolve", () => {
    mockLoading = true
    renderInscricao()
    expect(screen.getByText("CARREGANDO...")).toBeInTheDocument()
  })

  it("manda para o login quem não está logado, avisando que precisa ser filiado", async () => {
    mockUser = null
    renderInscricao()
    expect(await screen.findByText("TELA DE LOGIN")).toBeInTheDocument()
    expect(screen.getByText("/evento/2/inscricao")).toBeInTheDocument()
    expect(screen.getByText(/é preciso ser filiado/i)).toBeInTheDocument()
  })

  it("não cria inscrição para quem não está logado", async () => {
    mockUser = null
    renderInscricao()
    await screen.findByText("TELA DE LOGIN")
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("diz que a etapa está fechada mesmo para quem não está logado", async () => {
    // Sem isso o visitante era mandado ao login para só depois descobrir que
    // não há inscrição naquela etapa.
    mockUser = null
    renderInscricao("/evento/1/inscricao")
    expect(await screen.findByText("INSCRIÇÕES FECHADAS")).toBeInTheDocument()
    expect(screen.queryByText("TELA DE LOGIN")).not.toBeInTheDocument()
  })

  it("avisa sobre evento inexistente sem exigir login", async () => {
    mockUser = null
    renderInscricao("/evento/999/inscricao")
    expect(await screen.findByText("EVENTO NÃO ENCONTRADO")).toBeInTheDocument()
    expect(screen.queryByText("TELA DE LOGIN")).not.toBeInTheDocument()
  })

  it("avisa quando o evento da URL não existe", async () => {
    renderInscricao("/evento/999/inscricao")
    expect(await screen.findByText("EVENTO NÃO ENCONTRADO")).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("recusa etapa que não é a do Open Pádua", async () => {
    renderInscricao("/evento/1/inscricao")
    expect(await screen.findByText("INSCRIÇÕES FECHADAS")).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("recusa inscrição depois da data do evento", async () => {
    jest.setSystemTime(new Date(2026, 10, 9)) // 09/11/2026, dia seguinte
    renderInscricao()
    expect(await screen.findByText("INSCRIÇÕES FECHADAS")).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })
})

describe("Inscrição — situação da filiação", () => {
  it("manda fazer filiação quem tem conta sem cadastro", async () => {
    mockFiliacao = null
    renderInscricao()
    expect(await screen.findByText("Fazer filiação")).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("barra filiação com pagamento pendente", async () => {
    mockFiliacao = { ...filiadoAtivo, status: "pending", validUntil: undefined }
    renderInscricao()
    expect(await screen.findByText(/pagamento pendente/i)).toBeInTheDocument()
    expect(screen.getByText("Ir para minha área")).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("barra filiação com anuidade vencida", async () => {
    mockFiliacao = { ...filiadoAtivo, status: "active", validUntil: "2026-01-01" }
    renderInscricao()
    expect(await screen.findByText(/anuidade está vencida/i)).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("pede a data de nascimento quando falta no cadastro", async () => {
    mockFiliacao = { ...filiadoAtivo, birthDate: undefined }
    renderInscricao()
    expect(await screen.findByText("Completar cadastro")).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })
})

/** Preenche o peso e envia o formulário da inscrição. */
async function confirmarComPeso(valor = "82,5") {
  const campo = await screen.findByLabelText("Peso (kg)")
  fireEvent.change(campo, { target: { value: valor } })
  fireEvent.click(screen.getByRole("button", { name: /confirmar inscrição/i }))
}

describe("Inscrição — peso", () => {
  it("pede o peso antes de criar a inscrição", async () => {
    renderInscricao()
    expect(await screen.findByLabelText("Peso (kg)")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /confirmar inscrição/i })).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("mostra os dados do atleta e o valor já no formulário", async () => {
    renderInscricao()
    await screen.findByLabelText("Peso (kg)")
    expect(screen.getByText("Maurício Rimes Vieira")).toBeInTheDocument()
    expect(screen.getByText("129.648.587-05")).toBeInTheDocument()
    expect(screen.getByText("R$ 120,00")).toBeInTheDocument()
  })

  it("recusa envio sem peso", async () => {
    renderInscricao()
    await screen.findByLabelText("Peso (kg)")
    fireEvent.click(screen.getByRole("button", { name: /confirmar inscrição/i }))
    expect(await screen.findByText(/informe o peso em quilos/i)).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("recusa peso fora dos limites", async () => {
    renderInscricao()
    await confirmarComPeso("3")
    expect(await screen.findByText(/informe o peso em quilos/i)).toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("aceita peso com vírgula", async () => {
    renderInscricao()
    await confirmarComPeso("82,5")
    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ weight: 82.5 })))
  })

  it("não pede o peso de novo para quem já se inscreveu", async () => {
    mockGet.mockResolvedValue(inscricaoPendente)
    renderInscricao()
    expect(await screen.findByText("INSCRIÇÃO ENVIADA")).toBeInTheDocument()
    expect(screen.queryByLabelText("Peso (kg)")).not.toBeInTheDocument()
    expect(mockCreate).not.toHaveBeenCalled()
  })
})

describe("Inscrição — criação", () => {
  it("cria a inscrição do filiado em dia e confirma na tela", async () => {
    renderInscricao()
    await confirmarComPeso()
    expect(await screen.findByText("INSCRIÇÃO ENVIADA")).toBeInTheDocument()
    expect(screen.getByText("Pagamento pendente")).toBeInTheDocument()
    expect(mockCreate).toHaveBeenCalledWith({ cpf: "12964858705", uid: "u1", fee: 120, weight: 82.5 })
  })

  it("cobra R$ 100 de atleta com até 9 anos no dia do evento", async () => {
    mockFiliacao = { ...filiadoAtivo, birthDate: "2017-05-01" }
    mockCreate.mockResolvedValue({ ...inscricaoPendente, fee: 100 })
    renderInscricao()
    await confirmarComPeso("28")
    await screen.findByText("INSCRIÇÃO ENVIADA")
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ fee: 100, weight: 28 }))
    expect(screen.getByText("R$ 100,00")).toBeInTheDocument()
  })

  it("mostra o peso declarado no comprovante", async () => {
    renderInscricao()
    await confirmarComPeso()
    await screen.findByText("INSCRIÇÃO ENVIADA")
    expect(screen.getByText("82.5 kg")).toBeInTheDocument()
  })

  it("mostra os dados do atleta no comprovante", async () => {
    renderInscricao()
    await confirmarComPeso()
    await screen.findByText("INSCRIÇÃO ENVIADA")
    expect(screen.getByText("Maurício Rimes Vieira")).toBeInTheDocument()
    expect(screen.getByText("Azul")).toBeInTheDocument()
    expect(screen.getByText("R$ 120,00")).toBeInTheDocument()
  })

  it("oferece o pagamento pelo WhatsApp com o valor na mensagem", async () => {
    renderInscricao()
    await confirmarComPeso()
    await screen.findByText("INSCRIÇÃO ENVIADA")
    const link = screen.getByRole("link", { name: /pagar pelo whatsapp/i })
    expect(link).toHaveAttribute("href", expect.stringContaining("wa.me/"))
    expect(decodeURIComponent(link.getAttribute("href") ?? "")).toContain("R$ 120,00")
  })

  it("mostra inscrição já confirmada sem oferecer pagamento", async () => {
    mockGet.mockResolvedValue({ ...inscricaoPendente, status: "paid" })
    renderInscricao()
    expect(await screen.findByText("INSCRIÇÃO CONFIRMADA")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /pagar pelo whatsapp/i })).not.toBeInTheDocument()
  })

  it("avisa quando a organização removeu a inscrição", async () => {
    mockGet.mockResolvedValue({ ...inscricaoPendente, status: "removed" })
    renderInscricao()
    expect(await screen.findByText("INSCRIÇÃO REMOVIDA")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /falar com a organização/i })).toBeInTheDocument()
  })
})

describe("Inscrição — erros", () => {
  it("mostra aviso amigável quando a busca da filiação falha", async () => {
    mockErroBusca = true
    renderInscricao()
    expect(await screen.findByText(/não foi possível concluir sua inscrição/i)).toBeInTheDocument()
  })

  it("mostra aviso amigável quando a gravação é negada", async () => {
    mockCreate.mockRejectedValue(Object.assign(new Error("negado"), { code: "permission-denied" }))
    renderInscricao()
    await confirmarComPeso()
    expect(await screen.findByText(/não foi possível concluir sua inscrição/i)).toBeInTheDocument()
  })

  it("não vaza o código do erro para o atleta", async () => {
    mockCreate.mockRejectedValue(Object.assign(new Error("negado"), { code: "permission-denied" }))
    renderInscricao()
    await confirmarComPeso()
    await screen.findByText(/não foi possível concluir sua inscrição/i)
    expect(screen.queryByText(/permission-denied/)).not.toBeInTheDocument()
  })
})

describe("Inscrição — volta para o evento", () => {
  it("mantém o link de volta em todas as saídas", async () => {
    renderInscricao()
    await confirmarComPeso()
    await screen.findByText("INSCRIÇÃO ENVIADA")
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /voltar ao evento/i })).toHaveAttribute("href", "/evento/2"),
    )
  })
})
