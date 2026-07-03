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

// Sem filiação: mantém a tela simples (o banner independe da filiação).
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({ empty: true, docs: [] })),
  limit: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}))

jest.mock("../../lib/firebase", () => ({ db: {} }))
// Evita a cadeia affiliates → cloudinary (usa import.meta, incompatível com Jest).
jest.mock("../../lib/affiliates", () => ({
  removeProfilePhoto: jest.fn(),
  updateAffiliateProfile: jest.fn(),
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
