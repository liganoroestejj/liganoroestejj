import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Painel from "./Painel"

type FakeUser = { uid: string; email: string; emailVerified: boolean; displayName?: string }

// Usuário logado controlado por teste (prefixo "mock" p/ uso na factory do jest.mock).
let mockUser: FakeUser | null = null
const mockLogout = jest.fn()
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: mockUser, isAdmin: false, logout: mockLogout }),
}))

// Borda do Firebase Auth: reenvio da confirmação.
const mockSendVerification = jest.fn()
jest.mock("firebase/auth", () => ({
  sendEmailVerification: (...a: unknown[]) => mockSendVerification(...a),
}))

// Filiação lida do Firestore: por padrão nenhuma (o banner independe dela);
// os testes de edição injetam uma com `mockFiliacao`.
let mockFiliacao: Record<string, unknown> | null = null
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve(
    mockFiliacao
      ? { empty: false, docs: [{ data: () => mockFiliacao }] }
      : { empty: true, docs: [] },
  )),
  limit: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}))

const mockAcademies = [{ id: 1, name: "UP BJJ" }, { id: 2, name: "Gracie Barra" }]
jest.mock("../../hooks/useAcademies", () => ({
  useAcademies: () => ({ academies: mockAcademies, carregando: false, erro: "", recarregar: jest.fn() }),
}))

jest.mock("../../lib/firebase", () => ({ db: {} }))
// Evita a cadeia affiliates → cloudinary (usa import.meta, incompatível com Jest).
const mockUpdatePerfil = jest.fn()
jest.mock("../../lib/affiliates", () => ({
  removeProfilePhoto: jest.fn(),
  updateAffiliateProfile: (...a: unknown[]) => mockUpdatePerfil(...a),
  uploadProfilePhoto: jest.fn(),
}))
jest.mock("../../components/Carteirinha", () => () => null)
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}))

function renderPainel() {
  return render(
    <MemoryRouter>
      <Painel />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSendVerification.mockResolvedValue(undefined)
  mockUser = null
  mockFiliacao = null
  mockUpdatePerfil.mockResolvedValue(undefined)
})

describe("Painel — aviso de e-mail não confirmado", () => {
  it("mostra o banner e o e-mail quando a conta não está verificada", async () => {
    mockUser = { uid: "u1", email: "joao@x.com", emailVerified: false, displayName: "João" }
    renderPainel()
    expect(await screen.findByText("Confirme seu e-mail")).toBeInTheDocument()
    expect(screen.getByText("joao@x.com")).toBeInTheDocument()
    expect(screen.getByText("Reenviar e-mail")).toBeInTheDocument()
  })

  it("não mostra o banner quando o e-mail já está verificado", async () => {
    mockUser = { uid: "u1", email: "joao@x.com", emailVerified: true, displayName: "João" }
    renderPainel()
    await screen.findByText("Área do Atleta")
    expect(screen.queryByText("Confirme seu e-mail")).not.toBeInTheDocument()
  })

  it("reenvia a confirmação e exibe mensagem de sucesso", async () => {
    mockUser = { uid: "u1", email: "joao@x.com", emailVerified: false, displayName: "João" }
    renderPainel()
    fireEvent.click(await screen.findByText("Reenviar e-mail"))
    await waitFor(() => expect(mockSendVerification).toHaveBeenCalledWith(mockUser))
    expect(await screen.findByText(/reenviado/i)).toBeInTheDocument()
  })

  it("mostra mensagem de erro quando o reenvio falha", async () => {
    mockSendVerification.mockRejectedValueOnce(new Error("cota excedida"))
    mockUser = { uid: "u1", email: "joao@x.com", emailVerified: false, displayName: "João" }
    renderPainel()
    fireEvent.click(await screen.findByText("Reenviar e-mail"))
    expect(await screen.findByText(/Não foi possível reenviar/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Meus dados — o filiado edita TODOS os campos do próprio cadastro.
// Fora do formulário ficam CPF, status, validade e carteirinha (só o admin).
// ---------------------------------------------------------------------------
const FILIADO = {
  cpf: "10000000000",
  fullName: "Ana Silva",
  birthDate: "1995-04-20",
  gender: 2,
  academyId: 1,
  belt: 6,
  role: 1,
  category: 8,
  status: "pending",
  cardId: "card-1",
  email: "ana@teste.com",
  instagram: "@ana",
  phone: "22999998888",
  address: "Rua A",
  neighborhood: "Centro",
  zipCode: "28570000",
  city: "Itaocara",
  state: "RJ",
}

async function abrirEdicao() {
  mockUser = { uid: "u1", email: "ana@teste.com", emailVerified: true }
  mockFiliacao = { ...FILIADO }
  renderPainel()
  fireEvent.click(await screen.findByRole("button", { name: /editar dados/i }))
}

describe("Painel — edição de dados", () => {
  it("abre o formulário com todos os campos preenchidos", async () => {
    await abrirEdicao()

    expect(screen.getByLabelText("Nome completo")).toHaveValue("Ana Silva")
    expect(screen.getByLabelText("Data de nascimento")).toHaveValue("1995-04-20")
    expect(screen.getByLabelText("Sexo")).toHaveValue("2")
    expect(screen.getByLabelText("Academia")).toHaveValue("1")
    expect(screen.getByLabelText("Faixa")).toHaveValue("6")
    expect(screen.getByLabelText("Tipo")).toHaveValue("1")
    expect(screen.getByLabelText("E-mail")).toHaveValue("ana@teste.com")
    expect(screen.getByLabelText("Cidade")).toHaveValue("Itaocara")
  })

  it("salva as alterações de cadastro junto com as de contato", async () => {
    await abrirEdicao()

    fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Ana Paula Silva" } })
    fireEvent.change(screen.getByLabelText("Faixa"), { target: { value: "7" } })
    fireEvent.change(screen.getByLabelText("Academia"), { target: { value: "2" } })
    fireEvent.change(screen.getByLabelText("Tipo"), { target: { value: "2" } })
    fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "Cambuci" } })
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }))

    await waitFor(() => expect(mockUpdatePerfil).toHaveBeenCalled())
    const [cpf, dados, cardId] = mockUpdatePerfil.mock.calls[0]
    expect(cpf).toBe("10000000000")
    expect(cardId).toBe("card-1")
    expect(dados).toMatchObject({
      fullName: "Ana Paula Silva",
      belt: 7,
      academyId: 2,
      role: 2,
      city: "Cambuci",
      gender: 2,
      birthDate: "1995-04-20",
      zipCode: "28570000",
    })
  })

  it("mostra os novos dados na visualização depois de salvar", async () => {
    await abrirEdicao()

    fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Ana Paula Silva" } })
    fireEvent.change(screen.getByLabelText("Faixa"), { target: { value: "9" } })
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }))

    expect(await screen.findByText("Dados atualizados com sucesso.")).toBeInTheDocument()
    // Nome e faixa aparecem no bloco "Meus dados" e também no resumo da
    // situação/carteirinha — por isso a checagem é por ocorrência.
    expect(screen.getAllByText("Ana Paula Silva").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Preta").length).toBeGreaterThan(0)
  })

  it("recusa nome vazio", async () => {
    await abrirEdicao()

    fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "   " } })
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }))

    expect(await screen.findByText("Informe o nome completo.")).toBeInTheDocument()
    expect(mockUpdatePerfil).not.toHaveBeenCalled()
  })

  it("recusa data de nascimento vazia", async () => {
    await abrirEdicao()

    fireEvent.change(screen.getByLabelText("Data de nascimento"), { target: { value: "" } })
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }))

    expect(await screen.findByText("Informe a data de nascimento.")).toBeInTheDocument()
    expect(mockUpdatePerfil).not.toHaveBeenCalled()
  })

  it("recusa e-mail e CEP inválidos", async () => {
    await abrirEdicao()

    // Pontos consecutivos: passa na validação nativa do <input type="email">
    // (que bloqueia o submit antes do nosso código) e cai na nossa checagem.
    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ana..silva@teste.com" } })
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }))
    expect(await screen.findByText("E-mail inválido.")).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "ana@teste.com" } })
    fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "123" } })
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }))
    expect(await screen.findByText("CEP deve ter 8 dígitos.")).toBeInTheDocument()

    expect(mockUpdatePerfil).not.toHaveBeenCalled()
  })

  it("descarta as alterações ao cancelar", async () => {
    await abrirEdicao()

    fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Outro Nome" } })
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }))

    expect(mockUpdatePerfil).not.toHaveBeenCalled()
    expect(screen.getAllByText("Ana Silva").length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole("button", { name: /editar dados/i }))
    expect(screen.getByLabelText("Nome completo")).toHaveValue("Ana Silva")
  })

  it("avisa quando o salvamento falha", async () => {
    mockUpdatePerfil.mockRejectedValue(new Error("permission-denied"))
    await abrirEdicao()

    fireEvent.click(screen.getByRole("button", { name: /salvar/i }))

    expect(await screen.findByText("Não foi possível salvar. Tente novamente.")).toBeInTheDocument()
  })
})
