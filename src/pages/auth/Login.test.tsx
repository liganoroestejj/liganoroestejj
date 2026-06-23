import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Login from "./Login"

const mockSignIn = jest.fn()
const mockNavigate = jest.fn()

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ signIn: mockSignIn }),
}))
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}))

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  )
}

const emailInput = (c: HTMLElement) => c.querySelector('input[type="email"]') as HTMLInputElement
const senhaInput = (c: HTMLElement) => c.querySelector('input[type="password"]') as HTMLInputElement

beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
})

describe("Tela de login", () => {
  it("renderiza campos, checkbox e links", () => {
    renderLogin()
    expect(screen.getByText("ENTRAR")).toBeInTheDocument()
    expect(screen.getByText("Lembrar-me")).toBeInTheDocument()
    expect(screen.getByText(/Voltar ao início/)).toBeInTheDocument()
    expect(screen.getByText("Cadastre-se")).toBeInTheDocument()
  })

  it("faz login e redireciona para /painel", async () => {
    mockSignIn.mockResolvedValueOnce(undefined)
    const { container } = renderLogin()
    fireEvent.change(emailInput(container), { target: { value: "a@b.com" } })
    fireEvent.change(senhaInput(container), { target: { value: "123456" } })
    fireEvent.click(screen.getByText("Entrar"))
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith("a@b.com", "123456"))
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/painel", { replace: true }))
  })

  it("mostra mensagem de erro quando o login falha (e não navega)", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("fail"))
    const { container } = renderLogin()
    fireEvent.change(emailInput(container), { target: { value: "a@b.com" } })
    fireEvent.change(senhaInput(container), { target: { value: "x" } })
    fireEvent.click(screen.getByText("Entrar"))
    expect(await screen.findByText(/Ocorreu um erro/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("salva credenciais no localStorage quando 'Lembrar-me' está marcado", async () => {
    mockSignIn.mockResolvedValueOnce(undefined)
    const { container } = renderLogin()
    fireEvent.change(emailInput(container), { target: { value: "a@b.com" } })
    fireEvent.change(senhaInput(container), { target: { value: "123456" } })
    fireEvent.click(screen.getByRole("checkbox"))
    fireEvent.click(screen.getByText("Entrar"))
    await waitFor(() =>
      expect(localStorage.getItem("lnjjp_login")).toBe(
        JSON.stringify({ email: "a@b.com", senha: "123456" }),
      ),
    )
  })

  it("preenche os campos a partir do localStorage ao montar", () => {
    localStorage.setItem("lnjjp_login", JSON.stringify({ email: "saved@x.com", senha: "secret" }))
    const { container } = renderLogin()
    expect(emailInput(container).value).toBe("saved@x.com")
    expect(senhaInput(container).value).toBe("secret")
    expect(screen.getByRole("checkbox")).toBeChecked()
  })
})
