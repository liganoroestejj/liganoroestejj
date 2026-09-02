import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Admin from "./Admin"
import type { AdminAffiliate } from "../../lib/affiliates"

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { uid: "admin-1" }, isAdmin: true, logout: jest.fn() }),
}))

// Borda da lib: a tela só precisa da lista; as ações não são exercidas aqui.
const mockListAffiliates = jest.fn()
jest.mock("../../lib/affiliates", () => ({
  listAffiliates: () => mockListAffiliates(),
  confirmPayment: jest.fn(),
  adminSoftDelete: jest.fn(),
  adminRevertPayment: jest.fn(),
}))

const mockAddAcademy = jest.fn()
const mockRemoveAcademy = jest.fn()
const mockRenameAcademy = jest.fn()
jest.mock("../../lib/academies", () => ({
  addAcademy: (...a: unknown[]) => mockAddAcademy(...a),
  removeAcademy: (...a: unknown[]) => mockRemoveAcademy(...a),
  renameAcademy: (...a: unknown[]) => mockRenameAcademy(...a),
}))

let mockAcademies = [{ id: 1, name: "UP BJJ" }]
const mockRecarregarAcademias = jest.fn()
jest.mock("../../hooks/useAcademies", () => ({
  useAcademies: () => ({
    academies: mockAcademies,
    carregando: false,
    erro: "",
    recarregar: mockRecarregarAcademias,
  }),
}))

// Controla o layout: a paginação tem que funcionar nos dois.
let mockIsMobile = false
jest.mock("../../hooks/useMediaQuery", () => ({
  useMediaQuery: () => mockIsMobile,
}))

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}))

/** N filiados pendentes, nomeados de forma previsível para conferir a fatia. */
function fabricarFiliados(n: number): AdminAffiliate[] {
  return Array.from({ length: n }, (_, i) => ({
    cpf: String(10000000000 + i),
    uid: `u${i}`,
    fullName: `Atleta ${String(i + 1).padStart(2, "0")}`,
    academyId: 1,
    belt: 1,
    role: 1,
    status: "pending",
  }))
}

async function renderAdmin(qtd: number) {
  mockListAffiliates.mockResolvedValue(fabricarFiliados(qtd))
  const utils = render(<MemoryRouter><Admin /></MemoryRouter>)
  await waitFor(() => expect(screen.getByText("Atleta 01")).toBeInTheDocument())
  return utils
}

const barra = () => screen.getByText(/Mostrando/).parentElement as HTMLElement
const btnAnterior = () => screen.getByRole("button", { name: /página anterior/i })
const btnProxima = () => screen.getByRole("button", { name: /próxima página/i })

beforeEach(() => {
  jest.clearAllMocks()
  mockIsMobile = false
  mockAcademies = [{ id: 1, name: "UP BJJ" }]
})

describe("Admin — paginação (desktop)", () => {
  it("mostra só a primeira página e informa o intervalo", async () => {
    await renderAdmin(23)

    expect(screen.getByText("Mostrando 1 a 10 de 23 filiados")).toBeInTheDocument()
    expect(screen.getByText("Atleta 10")).toBeInTheDocument()
    expect(screen.queryByText("Atleta 11")).not.toBeInTheDocument()
  })

  it("deixa 'Anterior' sem ação na primeira página", async () => {
    await renderAdmin(23)

    expect(btnAnterior()).toBeDisabled()
    expect(btnProxima()).toBeEnabled()
  })

  it("avança e volta de página", async () => {
    await renderAdmin(23)

    fireEvent.click(btnProxima())
    expect(screen.getByText("Mostrando 11 a 20 de 23 filiados")).toBeInTheDocument()
    expect(screen.getByText("Atleta 11")).toBeInTheDocument()
    expect(screen.queryByText("Atleta 10")).not.toBeInTheDocument()

    fireEvent.click(btnAnterior())
    expect(screen.getByText("Mostrando 1 a 10 de 23 filiados")).toBeInTheDocument()
  })

  it("deixa 'Próxima' sem ação na última página, que pode vir incompleta", async () => {
    await renderAdmin(23)

    fireEvent.click(screen.getByRole("button", { name: "Página 3" }))

    expect(screen.getByText("Mostrando 21 a 23 de 23 filiados")).toBeInTheDocument()
    expect(btnProxima()).toBeDisabled()
    expect(btnAnterior()).toBeEnabled()
  })

  it("desativa os dois lados quando tudo cabe numa página", async () => {
    await renderAdmin(4)

    expect(screen.getByText("Mostrando 1 a 4 de 4 filiados")).toBeInTheDocument()
    expect(btnAnterior()).toBeDisabled()
    expect(btnProxima()).toBeDisabled()
  })

  it("troca a quantidade por página e volta para a primeira", async () => {
    await renderAdmin(23)

    fireEvent.click(btnProxima()) // sai da página 1
    fireEvent.change(screen.getByLabelText("Filiados por página"), { target: { value: "25" } })

    expect(screen.getByText("Mostrando 1 a 23 de 23 filiados")).toBeInTheDocument()
    expect(screen.getByText("Atleta 23")).toBeInTheDocument()
  })

  it("oferece as opções de 10 a 30 por página", async () => {
    await renderAdmin(23)

    const opcoes = within(screen.getByLabelText("Filiados por página"))
      .getAllByRole("option")
      .map((o) => o.textContent)
    expect(opcoes).toEqual(["10 por página", "15 por página", "20 por página", "25 por página", "30 por página"])
  })

  it("volta para a primeira página ao buscar", async () => {
    await renderAdmin(23)

    fireEvent.click(btnProxima())
    expect(screen.getByText("Mostrando 11 a 20 de 23 filiados")).toBeInTheDocument()

    // A busca reduz a lista: sem o reset, o admin cairia numa página vazia.
    // "23" não aparece em nenhum CPF fabricado, então casa só pelo nome.
    fireEvent.change(screen.getByPlaceholderText(/Buscar por nome/), { target: { value: "Atleta 23" } })

    expect(screen.getByText("Mostrando 1 a 1 de 1 filiado")).toBeInTheDocument()
    expect(screen.getByText("Atleta 23")).toBeInTheDocument()
  })

  it("não mostra a barra quando o filtro não devolve ninguém", async () => {
    await renderAdmin(23)

    fireEvent.change(screen.getByPlaceholderText(/Buscar por nome/), { target: { value: "zzzz" } })

    expect(screen.queryByText(/Mostrando/)).not.toBeInTheDocument()
    expect(screen.getByText(/Nenhum filiado encontrado/)).toBeInTheDocument()
  })
})

describe("Admin — paginação (mobile)", () => {
  beforeEach(() => { mockIsMobile = true })

  it("pagina os cards igual ao desktop", async () => {
    await renderAdmin(23)

    expect(screen.getByText("Mostrando 1 a 10 de 23 filiados")).toBeInTheDocument()
    expect(screen.queryByText("Atleta 11")).not.toBeInTheDocument()

    fireEvent.click(btnProxima())

    expect(screen.getByText("Atleta 11")).toBeInTheDocument()
    expect(screen.getByText("Mostrando 11 a 20 de 23 filiados")).toBeInTheDocument()
  })

  it("mantém os controles acessíveis no layout empilhado", async () => {
    await renderAdmin(23)

    expect(barra()).toBeInTheDocument()
    expect(btnAnterior()).toBeDisabled()
    expect(screen.getByLabelText("Filiados por página")).toBeInTheDocument()
  })
})

describe("Admin — configurações do cadastro (academias)", () => {
  const inputNova = () => screen.getByLabelText("Nome da nova academia")
  const btnAdicionar = () => screen.getByRole("button", { name: /adicionar/i })

  it("lista as academias cadastradas com a contagem", async () => {
    mockAcademies = [{ id: 1, name: "UP BJJ" }, { id: 2, name: "Gracie Barra" }]
    await renderAdmin(3)

    expect(screen.getByText("Configurações do cadastro")).toBeInTheDocument()
    expect(screen.getByText("Academias (2)")).toBeInTheDocument()
    // "UP BJJ" também aparece na coluna Academia da tabela de filiados.
    expect(screen.getAllByText("UP BJJ").length).toBeGreaterThan(0)
    expect(screen.getByText("Gracie Barra")).toBeInTheDocument()
  })

  it("não deixa remover quando só existe uma academia", async () => {
    mockAcademies = [{ id: 1, name: "UP BJJ" }]
    await renderAdmin(3)

    const remover = screen.getByRole("button", { name: "Remover UP BJJ" })
    expect(remover).toBeDisabled()
    expect(remover).toHaveAttribute("title", "É preciso manter ao menos uma academia")
  })

  it("libera a remoção assim que existe mais de uma", async () => {
    mockAcademies = [{ id: 1, name: "UP BJJ" }, { id: 2, name: "Gracie Barra" }]
    await renderAdmin(3)

    screen.getAllByRole("button", { name: /^Remover / }).forEach((b) => expect(b).toBeEnabled())
  })

  it("adiciona uma academia nova", async () => {
    mockAcademies = [{ id: 1, name: "UP BJJ" }]
    mockAddAcademy.mockResolvedValue({ id: 2, name: "Gracie Barra" })
    await renderAdmin(3)

    fireEvent.change(inputNova(), { target: { value: "Gracie Barra" } })
    fireEvent.click(btnAdicionar())

    await waitFor(() => expect(mockAddAcademy).toHaveBeenCalledWith("Gracie Barra"))
    await waitFor(() => expect(mockRecarregarAcademias).toHaveBeenCalled())
  })

  it("recusa nome vazio", async () => {
    await renderAdmin(3)

    fireEvent.change(inputNova(), { target: { value: "   " } })
    fireEvent.click(btnAdicionar())

    expect(await screen.findByText("Informe o nome da academia.")).toBeInTheDocument()
    expect(mockAddAcademy).not.toHaveBeenCalled()
  })

  it("recusa nome repetido ignorando acento e caixa", async () => {
    mockAcademies = [{ id: 1, name: "Ação Jiu-Jitsu" }, { id: 2, name: "UP BJJ" }]
    await renderAdmin(3)

    fireEvent.change(inputNova(), { target: { value: "acao jiu-jitsu" } })
    fireEvent.click(btnAdicionar())

    expect(await screen.findByText("Já existe uma academia com esse nome.")).toBeInTheDocument()
    expect(mockAddAcademy).not.toHaveBeenCalled()
  })

  it("avisa quantos filiados perdem a academia antes de remover", async () => {
    mockAcademies = [{ id: 1, name: "UP BJJ" }, { id: 2, name: "Gracie Barra" }]
    await renderAdmin(3) // os 3 fabricados usam academyId 1

    fireEvent.click(screen.getByRole("button", { name: "Remover UP BJJ" }))

    expect(await screen.findByText(/3 filiados usam esta academia/)).toBeInTheDocument()
  })

  it("remove a academia após confirmar", async () => {
    mockAcademies = [{ id: 1, name: "UP BJJ" }, { id: 2, name: "Gracie Barra" }]
    mockRemoveAcademy.mockResolvedValue(undefined)
    await renderAdmin(3)

    fireEvent.click(screen.getByRole("button", { name: "Remover Gracie Barra" }))
    const modal = screen.getByText("Remover academia").parentElement as HTMLElement
    fireEvent.click(within(modal).getByRole("button", { name: /^remover$/i }))

    await waitFor(() => expect(mockRemoveAcademy).toHaveBeenCalledWith(2))
  })

  it("usa o nome vindo da coleção na lista de filiados", async () => {
    mockAcademies = [{ id: 1, name: "Nome Novo" }]
    await renderAdmin(2)

    expect(screen.getAllByText("Nome Novo").length).toBeGreaterThan(0)
  })
})

describe("Admin — editar academia", () => {
  const btnEditar = (nome: string) => screen.getByRole("button", { name: `Editar ${nome}` })

  it("abre o campo de edição já preenchido", async () => {
    mockAcademies = [{ id: 1, name: "UP BJJ" }, { id: 2, name: "Gracie Barra" }]
    await renderAdmin(2)

    fireEvent.click(btnEditar("Gracie Barra"))

    expect(screen.getByLabelText("Novo nome de Gracie Barra")).toHaveValue("Gracie Barra")
    expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument()
  })

  it("salva o nome novo mantendo o mesmo id", async () => {
    mockAcademies = [{ id: 1, name: "UP BJJ" }, { id: 2, name: "Gracie Barra" }]
    mockRenameAcademy.mockResolvedValue(undefined)
    await renderAdmin(2)

    fireEvent.click(btnEditar("Gracie Barra"))
    fireEvent.change(screen.getByLabelText("Novo nome de Gracie Barra"), { target: { value: "GB Itaperuna" } })
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }))

    await waitFor(() => expect(mockRenameAcademy).toHaveBeenCalledWith(2, "GB Itaperuna"))
    await waitFor(() => expect(mockRecarregarAcademias).toHaveBeenCalled())
  })

  it("cancela sem gravar nada", async () => {
    mockAcademies = [{ id: 1, name: "UP BJJ" }, { id: 2, name: "Gracie Barra" }]
    await renderAdmin(2)

    fireEvent.click(btnEditar("Gracie Barra"))
    fireEvent.change(screen.getByLabelText("Novo nome de Gracie Barra"), { target: { value: "Outro" } })
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }))

    expect(mockRenameAcademy).not.toHaveBeenCalled()
    expect(screen.getByText("Gracie Barra")).toBeInTheDocument()
  })

  it("recusa nome vazio na edição", async () => {
    mockAcademies = [{ id: 1, name: "UP BJJ" }, { id: 2, name: "Gracie Barra" }]
    await renderAdmin(2)

    fireEvent.click(btnEditar("Gracie Barra"))
    fireEvent.change(screen.getByLabelText("Novo nome de Gracie Barra"), { target: { value: "  " } })
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }))

    expect(await screen.findByText("Informe o nome da academia.")).toBeInTheDocument()
    expect(mockRenameAcademy).not.toHaveBeenCalled()
  })

  it("recusa renomear para o nome de outra academia", async () => {
    mockAcademies = [{ id: 1, name: "UP BJJ" }, { id: 2, name: "Gracie Barra" }]
    await renderAdmin(2)

    fireEvent.click(btnEditar("Gracie Barra"))
    fireEvent.change(screen.getByLabelText("Novo nome de Gracie Barra"), { target: { value: "up bjj" } })
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }))

    expect(await screen.findByText("Já existe uma academia com esse nome.")).toBeInTheDocument()
    expect(mockRenameAcademy).not.toHaveBeenCalled()
  })

  it("permite corrigir só a caixa do próprio nome", async () => {
    mockAcademies = [{ id: 1, name: "up bjj" }]
    mockRenameAcademy.mockResolvedValue(undefined)
    await renderAdmin(2)

    fireEvent.click(btnEditar("up bjj"))
    fireEvent.change(screen.getByLabelText("Novo nome de up bjj"), { target: { value: "UP BJJ" } })
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }))

    await waitFor(() => expect(mockRenameAcademy).toHaveBeenCalledWith(1, "UP BJJ"))
  })
})
