import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import RegulamentoDesktop from "./Regulamento.desktop"
import RegulamentoMobile from "./Regulamento.mobile"

// Mocka a borda do Firebase (o Header usa AuthContext).
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: null, isAdmin: false, loading: false }),
}))

function renderAt(ui: React.ReactElement, path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/evento/:id/regulamento" element={ui} />
      </Routes>
    </MemoryRouter>
  )
}

describe.each([
  ["Desktop", <RegulamentoDesktop />],
  ["Mobile", <RegulamentoMobile />],
])("Regulamento — %s", (_, ui) => {
  it("mostra o título e todos os capítulos do edital do evento da URL", () => {
    renderAt(ui, "/evento/2/regulamento")
    expect(screen.getByText("Edital Oficial — Pádua Open 2026")).toBeInTheDocument()
    expect(screen.getByText("Capítulo I — Das Disposições Gerais")).toBeInTheDocument()
    expect(screen.getByText("Capítulo XIII — Das Disposições Finais")).toBeInTheDocument()
  })

  it("mostra o texto dos artigos e o quadro de informações", () => {
    renderAt(ui, "/evento/2/regulamento")
    expect(screen.getByText("Art. 1º.")).toBeInTheDocument()
    expect(screen.getByText("Art. 56.")).toBeInTheDocument()
    expect(screen.getByText(/Não haverá categoria Absoluto/)).toBeInTheDocument()
    expect(screen.getByText("Quadro de Informações")).toBeInTheDocument()
  })

  it("o voltar leva para a página do evento", () => {
    renderAt(ui, "/evento/2/regulamento")
    expect(screen.getByText("← Voltar ao evento").closest("a")).toHaveAttribute("href", "/evento/2")
  })

  it("mostra 'não encontrado' para evento sem regulamento", () => {
    renderAt(ui, "/evento/1/regulamento")
    expect(screen.getByText("Regulamento não encontrado")).toBeInTheDocument()
    expect(screen.queryByText(/Capítulo I/)).toBeNull()
  })
})
