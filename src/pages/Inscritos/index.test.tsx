import { fireEvent, render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import InscritosDesktop from "./Inscritos.desktop"
import InscritosMobile from "./Inscritos.mobile"
import type { Participant } from "../../lib/participants"

// Borda do Firebase: o Header e a tela usam AuthContext.
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "u-ana" }, isAdmin: false, loading: false }),
}))

jest.mock("../../hooks/useAcademies", () => ({
  useAcademies: () => ({
    academies: [{ id: 1, name: "UP BJJ / Itaocara" }, { id: 2, name: "Gracie Barra / Pádua" }],
    carregando: false,
    erro: "",
  }),
}))

// A busca (e a liberação só para pagos) é do hook; a tela recebe o resultado.
const mockUseParticipants = jest.fn()
jest.mock("../../hooks/useParticipants", () => ({
  useParticipants: (...a: unknown[]) => mockUseParticipants(...a),
}))

// lib/participants puxa o Firestore; a tela só usa os helpers puros.
jest.mock("../../lib/firebase", () => ({ db: {} }))

const p = (over: Partial<Participant>): Participant => ({
  uid: "x", fullName: "X", academyId: 1, belt: 1, gender: 1,
  age: 25, categoryId: 8, category: "Adulto", weightClass: null, ...over,
})

const lista: Participant[] = [
  p({ uid: "u-ana", fullName: "Ana Resende", academyId: 1, belt: 9, gender: 2, age: 36, categoryId: 10, category: "Master 2", weightClass: "Pluma" }),
  p({ uid: "u-bruno", fullName: "Bruno Lima", academyId: 2, belt: 1, gender: 1, age: 9, categoryId: 3, category: "Festival" }),
  p({ uid: "u-caio", fullName: "Caio Souza", academyId: 2, belt: 1, gender: 1, age: 6, categoryId: 2, category: "Festival" }),
  p({ uid: "u-dani", fullName: "Dani Costa", academyId: 1, belt: 6, gender: 2, age: 25, categoryId: 8, category: "Adulto", weightClass: "Leve" }),
  p({ uid: "u-edu", fullName: "Edu Alves", academyId: 1, belt: 7, gender: 1, age: 25, categoryId: 8, category: "Adulto", weightClass: "Médio" }),
]

const pronto = (participantes = lista) => ({ participantes, carregando: false, liberado: true, erro: "" })

/** Mostra a URL atual, para conferir os filtros na query string. */
function Url() {
  const loc = useLocation()
  return <div data-testid="url">{loc.pathname + loc.search}</div>
}

function renderAt(ui: React.ReactElement, path = "/evento/2/inscritos") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/evento/:id/inscritos" element={<>{ui}<Url /></>} />
      </Routes>
    </MemoryRouter>,
  )
}

const nomes = () => lista.map((l) => l.fullName).filter((n) => screen.queryByText(n))

beforeEach(() => {
  jest.clearAllMocks()
  mockUseParticipants.mockReturnValue(pronto())
})

describe.each([
  ["Desktop", () => <InscritosDesktop />],
  ["Mobile", () => <InscritosMobile />],
])("Inscritos — %s", (_, ui) => {
  describe("estados", () => {
    it("avisa enquanto carrega", () => {
      mockUseParticipants.mockReturnValue({ ...pronto([]), carregando: true })
      renderAt(ui())
      expect(screen.getByText("Carregando inscritos...")).toBeInTheDocument()
    })

    it("mostra erro quando a lista falha", () => {
      mockUseParticipants.mockReturnValue({ ...pronto([]), erro: "Não foi possível carregar a lista de inscritos." })
      renderAt(ui())
      expect(screen.getByText("Não foi possível carregar a lista de inscritos.")).toBeInTheDocument()
    })

    it("bloqueia quem não está inscrito e leva à inscrição", () => {
      mockUseParticipants.mockReturnValue({ ...pronto([]), liberado: false })
      renderAt(ui())
      expect(screen.getByText(/exclusiva de quem já está inscrito/)).toBeInTheDocument()
      expect(screen.getByText("Fazer minha inscrição").closest("a")).toHaveAttribute("href", "/evento/2/inscricao")
      expect(screen.queryByText("Ana Resende")).toBeNull()
    })

    it("avisa quando ainda não há inscritos", () => {
      mockUseParticipants.mockReturnValue(pronto([]))
      renderAt(ui())
      expect(screen.getByText("Nenhum inscrito ainda.")).toBeInTheDocument()
    })

    it("evento sem lista de inscritos (id da URL)", () => {
      renderAt(ui(), "/evento/1/inscritos")
      expect(screen.getByText("Este evento não tem lista de inscritos.")).toBeInTheDocument()
      // Não busca nada para evento sem inscrições.
      expect(mockUseParticipants).toHaveBeenCalledWith(undefined, false)
    })

    it("evento inexistente", () => {
      renderAt(ui(), "/evento/999/inscritos")
      expect(screen.getByText("Este evento não tem lista de inscritos.")).toBeInTheDocument()
    })

    it("busca a lista com o uid de quem está logado", () => {
      renderAt(ui())
      expect(mockUseParticipants).toHaveBeenCalledWith("u-ana", false)
    })
  })

  describe("lista", () => {
    it("mostra título, evento e total", () => {
      renderAt(ui())
      expect(screen.getByRole("heading", { name: "Inscritos" })).toBeInTheDocument()
      expect(screen.getByText(/Open Pádua Jiu Jitsu · 08\/11\/2026/)).toBeInTheDocument()
      expect(screen.getByText("5 inscritos")).toBeInTheDocument()
    })

    it("ordena por categoria e depois por nome", () => {
      renderAt(ui())
      const textos = screen.getAllByText(/^(Ana Resende|Bruno Lima|Caio Souza|Dani Costa|Edu Alves)$/).map((e) => e.textContent)
      expect(textos).toEqual(["Caio Souza", "Bruno Lima", "Dani Costa", "Edu Alves", "Ana Resende"])
    })

    it("mostra só nome e academia de cada inscrito", () => {
      renderAt(ui())
      expect(screen.getAllByText("UP BJJ / Itaocara")).toHaveLength(3)
      expect(screen.getAllByText("Gracie Barra / Pádua")).toHaveLength(2)
      // Faixa, sexo, idade e categoria de peso não aparecem.
      expect(screen.queryByText(/Preta/)).toBeNull()
      expect(screen.queryByText(/Feminino/)).toBeNull()
      expect(screen.queryByText(/Pluma/)).toBeNull()
      expect(screen.queryByText("36")).toBeNull()
    })

    it("não mostra CPF", () => {
      renderAt(ui())
      expect(screen.queryByText(/\d{3}\.\d{3}\.\d{3}-\d{2}/)).toBeNull()
    })

    it("não mostra foto", () => {
      const { container } = renderAt(ui())
      expect(container.querySelector("main section img")).toBeNull()
    })

    it("o voltar leva ao evento", () => {
      renderAt(ui())
      expect(screen.getByText("← Voltar").closest("a")).toHaveAttribute("href", "/evento/2")
    })
  })

  describe("filtros", () => {
    it("oferece só as categorias presentes, na ordem de idade", () => {
      renderAt(ui())
      const sel = screen.getByLabelText("Filtrar por categoria")
      expect(within(sel).getAllByRole("option").map((o) => o.textContent))
        .toEqual(["Todas as categorias", "Festival", "Adulto", "Master 2"])
    })

    it("filtra por categoria e grava na URL", () => {
      renderAt(ui())
      fireEvent.change(screen.getByLabelText("Filtrar por categoria"), { target: { value: "Festival" } })
      expect(nomes()).toEqual(["Bruno Lima", "Caio Souza"])
      expect(screen.getByTestId("url")).toHaveTextContent("categoria=Festival")
      expect(screen.getByText("2 no filtro")).toBeInTheDocument()
    })

    it("filtra por idade", () => {
      renderAt(ui())
      fireEvent.change(screen.getByLabelText("Filtrar por idade"), { target: { value: "25" } })
      expect(nomes()).toEqual(["Dani Costa", "Edu Alves"])
      expect(screen.getByTestId("url")).toHaveTextContent("idade=25")
    })

    it("as idades oferecidas são as da categoria escolhida", () => {
      renderAt(ui())
      const idade = screen.getByLabelText("Filtrar por idade")
      expect(within(idade).getAllByRole("option").map((o) => o.textContent))
        .toEqual(["Todas as idades", "6 anos", "9 anos", "25 anos", "36 anos"])
      fireEvent.change(screen.getByLabelText("Filtrar por categoria"), { target: { value: "Festival" } })
      expect(within(idade).getAllByRole("option").map((o) => o.textContent))
        .toEqual(["Todas as idades", "6 anos", "9 anos"])
    })

    it("combina categoria e idade", () => {
      renderAt(ui())
      fireEvent.change(screen.getByLabelText("Filtrar por categoria"), { target: { value: "Festival" } })
      fireEvent.change(screen.getByLabelText("Filtrar por idade"), { target: { value: "9" } })
      expect(nomes()).toEqual(["Bruno Lima"])
    })

    it("trocar a categoria limpa a idade", () => {
      renderAt(ui(), "/evento/2/inscritos?idade=25")
      fireEvent.change(screen.getByLabelText("Filtrar por categoria"), { target: { value: "Festival" } })
      expect(screen.getByTestId("url")).not.toHaveTextContent("idade=")
      expect(nomes()).toEqual(["Bruno Lima", "Caio Souza"])
    })

    it("abre já filtrado pelos parâmetros da URL", () => {
      renderAt(ui(), "/evento/2/inscritos?categoria=Adulto&idade=25")
      expect(screen.getByLabelText("Filtrar por categoria")).toHaveValue("Adulto")
      expect(screen.getByLabelText("Filtrar por idade")).toHaveValue("25")
      expect(nomes()).toEqual(["Dani Costa", "Edu Alves"])
    })

    it("avisa quando o filtro não devolve ninguém", () => {
      renderAt(ui(), "/evento/2/inscritos?categoria=Juvenil")
      expect(screen.getByText("Nenhum inscrito para os filtros atuais.")).toBeInTheDocument()
    })

    it("limpar filtros volta à lista completa", () => {
      renderAt(ui(), "/evento/2/inscritos?categoria=Adulto")
      fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }))
      expect(nomes()).toHaveLength(5)
      expect(screen.getByTestId("url")).toHaveTextContent(/^\/evento\/2\/inscritos$/)
      expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull()
    })

    it("voltar para 'Todas' remove o parâmetro", () => {
      renderAt(ui(), "/evento/2/inscritos?categoria=Adulto")
      fireEvent.change(screen.getByLabelText("Filtrar por categoria"), { target: { value: "" } })
      expect(screen.getByTestId("url")).not.toHaveTextContent("categoria=")
    })
  })
})
