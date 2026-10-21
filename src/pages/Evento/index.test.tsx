import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import EventoDesktop from "./Evento.desktop"
import EventoMobile from "./Evento.mobile"

// Mocka a borda do Firebase (o Header usa AuthContext).
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: null, isAdmin: false, loading: false }),
}))

function renderAt(ui: React.ReactElement, path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/evento/:id" element={ui} />
      </Routes>
    </MemoryRouter>
  )
}

describe.each([
  ["Desktop", <EventoDesktop />],
  ["Mobile", <EventoMobile />],
])("Evento — %s", (_, ui) => {
  it("mostra o evento da URL", () => {
    renderAt(ui, "/evento/2")
    expect(screen.getByRole("heading", { name: "Open Pádua Jiu Jitsu" })).toBeInTheDocument()
    expect(screen.getByText(/08\/11\/2026/)).toBeInTheDocument()
  })

  it("o botão Regulamento leva para a tela do edital", () => {
    renderAt(ui, "/evento/2")
    expect(screen.getByText("Regulamento").closest("a")).toHaveAttribute("href", "/evento/2/regulamento")
  })

  it("não mostra o botão Regulamento em evento sem edital", () => {
    renderAt(ui, "/evento/1")
    expect(screen.queryByText("Regulamento")).toBeNull()
  })

  it("mostra 'não encontrado' para id inexistente", () => {
    renderAt(ui, "/evento/999")
    expect(screen.getByText("Evento não encontrado")).toBeInTheDocument()
  })
})
