import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import HomeDesktop from "./Home.desktop"
import HomeMobile from "./Home.mobile"

// Mocka a borda do Firebase (AuthContext usa import.meta.env / firebase).
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: null, isAdmin: false, loading: false }),
}))

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe("Tela inicial — Desktop", () => {
  it("renderiza o hero, o menu de navegação e o footer", () => {
    renderWithRouter(<HomeDesktop />)
    expect(screen.getByText(/Federação Regional/i)).toBeInTheDocument()
    expect(screen.getByText("Início")).toBeInTheDocument()
    expect(screen.getByText("liganoroestejj@gmail.com")).toBeInTheDocument()
  })

  it("os CTAs do hero apontam para as rotas certas", () => {
    renderWithRouter(<HomeDesktop />)
    // "Fazer Filiação" aparece no hero e no footer; basta existir ao menos um
    expect(screen.getAllByText("Fazer Filiação").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Ver Calendário").length).toBeGreaterThan(0)
  })
})

describe("Tela inicial — Mobile", () => {
  it("renderiza o hero", () => {
    renderWithRouter(<HomeMobile />)
    expect(screen.getByText(/Federação Regional/i)).toBeInTheDocument()
  })

  it("esconde o menu de navegação atrás do hambúrguer (fora do DOM até abrir)", () => {
    renderWithRouter(<HomeMobile />)
    expect(screen.queryByText("Início")).toBeNull()
  })
})
