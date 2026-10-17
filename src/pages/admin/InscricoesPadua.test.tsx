import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import InscricoesPadua from "./InscricoesPadua"
import type { AdminAffiliate } from "../../lib/affiliates"
import type { Registration } from "../../lib/registrations"

// Borda da lib: a tela só lista e muda status; o Firestore não entra aqui.
const mockList = jest.fn()
const mockSetPaid = jest.fn()
const mockRemove = jest.fn()
const mockReactivate = jest.fn()
jest.mock("../../lib/registrations", () => ({
  PADUA_EVENT_ID: "2",
  listRegistrations: () => mockList(),
  setRegistrationPaid: (...a: unknown[]) => mockSetPaid(...a),
  removeRegistration: (...a: unknown[]) => mockRemove(...a),
  reactivateRegistration: (...a: unknown[]) => mockReactivate(...a),
}))

const academies = [
  { id: 1, name: "UP BJJ / Itaocara" },
  { id: 2, name: "Gracie Barra / Pádua" },
]
const academyName = (id: number) => academies.find((a) => a.id === id)?.name ?? "—"

const filiados: AdminAffiliate[] = [
  { cpf: "11111111111", uid: "u1", fullName: "Ana Resende", academyId: 1, belt: 9, role: 1, gender: 2, birthDate: "1990-03-10", status: "active" },
  { cpf: "22222222222", uid: "u2", fullName: "Bruno Lima", academyId: 2, belt: 6, role: 1, gender: 1, birthDate: "2017-05-01", status: "active" },
  { cpf: "33333333333", uid: "u3", fullName: "Carla Dias", academyId: 1, belt: 7, role: 1, gender: 2, birthDate: "2010-01-20", status: "active" },
]

const inscricoes: Registration[] = [
  { cpf: "11111111111", uid: "u1", status: "paid", fee: 120, createdAt: { seconds: 1760000000 } },
  { cpf: "22222222222", uid: "u2", status: "pending", fee: 100, createdAt: { seconds: 1761000000 } },
  { cpf: "33333333333", uid: "u3", status: "pending", fee: 120, createdAt: { seconds: 1762000000 } },
]

function renderLista(isMobile = false) {
  return render(
    <InscricoesPadua
      affiliates={filiados}
      academies={academies}
      academyName={academyName}
      isMobile={isMobile}
    />,
  )
}

/** Espera a lista aparecer (a busca é assíncrona). */
async function aguardarLista() {
  await screen.findByText("Ana Resende")
}

beforeEach(() => {
  jest.clearAllMocks()
  mockList.mockResolvedValue(inscricoes.map((i) => ({ ...i })))
  mockSetPaid.mockResolvedValue(undefined)
  mockRemove.mockResolvedValue(undefined)
  mockReactivate.mockResolvedValue(undefined)
})

describe("Inscrições — carregamento", () => {
  it("avisa enquanto carrega", () => {
    mockList.mockReturnValue(new Promise(() => {}))
    renderLista()
    expect(screen.getByText("Carregando inscrições...")).toBeInTheDocument()
  })

  it("mostra erro quando a listagem falha", async () => {
    mockList.mockRejectedValue(new Error("sem permissão"))
    renderLista()
    expect(await screen.findByText("Não foi possível carregar as inscrições.")).toBeInTheDocument()
  })

  it("avisa quando ninguém se inscreveu", async () => {
    mockList.mockResolvedValue([])
    renderLista()
    expect(await screen.findByText("Nenhuma inscrição ainda.")).toBeInTheDocument()
  })
})

describe("Inscrições — dados vindos da filiação", () => {
  it("mostra nome, academia, faixa, sexo e categoria atuais do atleta", async () => {
    renderLista()
    await aguardarLista()
    const linha = screen.getByText("Ana Resende").closest("tr") as HTMLElement
    expect(within(linha).getByText("UP BJJ / Itaocara")).toBeInTheDocument()
    expect(within(linha).getByText("Preta")).toBeInTheDocument()
    expect(within(linha).getByText("Feminino")).toBeInTheDocument()
    expect(within(linha).getByText("111.111.111-11")).toBeInTheDocument()
  })

  it("mostra o valor gravado na inscrição", async () => {
    renderLista()
    await aguardarLista()
    const linha = screen.getByText("Bruno Lima").closest("tr") as HTMLElement
    expect(within(linha).getByText("R$ 100,00")).toBeInTheDocument()
  })

  it("marca inscrição cujo filiado não existe mais", async () => {
    mockList.mockResolvedValue([{ cpf: "99999999999", uid: "u9", status: "pending", fee: 120 }])
    renderLista()
    expect(await screen.findByText("Filiação removida")).toBeInTheDocument()
  })
})

describe("Inscrições — resumo", () => {
  it("conta inscritos, pagos e pendentes", async () => {
    renderLista()
    await aguardarLista()
    expect(screen.getByRole("button", { name: "3 inscritos" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "1 pagos" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "2 pendentes" })).toBeInTheDocument()
  })

  it("soma só o que já foi pago", async () => {
    renderLista()
    await aguardarLista()
    expect(screen.getByText("R$ 120,00 recebidos")).toBeInTheDocument()
  })
})

describe("Inscrições — filtros", () => {
  it("filtra por pagas", async () => {
    renderLista()
    await aguardarLista()
    fireEvent.click(screen.getByRole("button", { name: "1 pagos" }))
    expect(screen.getByText("Ana Resende")).toBeInTheDocument()
    expect(screen.queryByText("Bruno Lima")).not.toBeInTheDocument()
  })

  it("filtra por pendentes", async () => {
    renderLista()
    await aguardarLista()
    fireEvent.click(screen.getByRole("button", { name: "2 pendentes" }))
    expect(screen.queryByText("Ana Resende")).not.toBeInTheDocument()
    expect(screen.getByText("Bruno Lima")).toBeInTheDocument()
  })

  it("filtra por academia", async () => {
    renderLista()
    await aguardarLista()
    fireEvent.change(screen.getByLabelText("Filtrar por academia"), { target: { value: "2" } })
    expect(screen.getByText("Bruno Lima")).toBeInTheDocument()
    expect(screen.queryByText("Ana Resende")).not.toBeInTheDocument()
  })

  it("filtra por sexo", async () => {
    renderLista()
    await aguardarLista()
    fireEvent.change(screen.getByLabelText("Filtrar por sexo"), { target: { value: "1" } })
    expect(screen.getByText("Bruno Lima")).toBeInTheDocument()
    expect(screen.queryByText("Carla Dias")).not.toBeInTheDocument()
  })

  it("busca por nome", async () => {
    renderLista()
    await aguardarLista()
    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), { target: { value: "carla" } })
    expect(screen.getByText("Carla Dias")).toBeInTheDocument()
    expect(screen.queryByText("Ana Resende")).not.toBeInTheDocument()
  })

  it("busca por CPF, mesmo formatado", async () => {
    renderLista()
    await aguardarLista()
    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), { target: { value: "222.222" } })
    expect(screen.getByText("Bruno Lima")).toBeInTheDocument()
    expect(screen.queryByText("Ana Resende")).not.toBeInTheDocument()
  })

  it("busca por academia", async () => {
    renderLista()
    await aguardarLista()
    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), { target: { value: "gracie" } })
    expect(screen.getByText("Bruno Lima")).toBeInTheDocument()
    expect(screen.queryByText("Carla Dias")).not.toBeInTheDocument()
  })

  it("avisa quando o filtro não devolve ninguém", async () => {
    renderLista()
    await aguardarLista()
    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), { target: { value: "zzz" } })
    expect(screen.getByText("Nenhuma inscrição encontrada para os filtros atuais.")).toBeInTheDocument()
  })

  it("combina filtro de sexo com busca", async () => {
    renderLista()
    await aguardarLista()
    fireEvent.change(screen.getByLabelText("Filtrar por sexo"), { target: { value: "2" } })
    fireEvent.change(screen.getByPlaceholderText(/buscar por nome/i), { target: { value: "ana" } })
    expect(screen.getByText("Ana Resende")).toBeInTheDocument()
    expect(screen.queryByText("Carla Dias")).not.toBeInTheDocument()
  })
})

describe("Inscrições — ordenação", () => {
  it("ordena por valor e inverte no segundo clique", async () => {
    renderLista()
    await aguardarLista()
    const nomes = () => screen.getAllByTitle(/Ana Resende|Bruno Lima|Carla Dias/).map((e) => e.textContent)

    fireEvent.click(screen.getByText(/^Valor/))
    expect(nomes()[0]).toBe("Bruno Lima") // R$ 100
    fireEvent.click(screen.getByText(/^Valor/))
    expect(nomes()[0]).not.toBe("Bruno Lima")
  })

  it("ordena pela data da inscrição", async () => {
    renderLista()
    await aguardarLista()
    fireEvent.click(screen.getByText(/^Inscrito em/))
    const primeiro = screen.getAllByTitle(/Ana Resende|Bruno Lima|Carla Dias/)[0]
    expect(primeiro).toHaveTextContent("Ana Resende")
  })
})

describe("Inscrições — pagamento", () => {
  it("pede confirmação antes de marcar como paga", async () => {
    renderLista()
    await aguardarLista()
    const linha = screen.getByText("Bruno Lima").closest("tr") as HTMLElement
    fireEvent.click(within(linha).getByRole("button", { name: /marcar pago/i }))
    expect(screen.getByText("Confirmar pagamento?")).toBeInTheDocument()
    expect(mockSetPaid).not.toHaveBeenCalled()
  })

  it("marca como paga ao confirmar", async () => {
    renderLista()
    await aguardarLista()
    const linha = screen.getByText("Bruno Lima").closest("tr") as HTMLElement
    fireEvent.click(within(linha).getByRole("button", { name: /marcar pago/i }))
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }))
    await waitFor(() => expect(mockSetPaid).toHaveBeenCalledWith("22222222222", true))
    await waitFor(() => expect(screen.getByRole("button", { name: "2 pagos" })).toBeInTheDocument())
  })

  it("não marca nada se o admin cancelar", async () => {
    renderLista()
    await aguardarLista()
    const linha = screen.getByText("Bruno Lima").closest("tr") as HTMLElement
    fireEvent.click(within(linha).getByRole("button", { name: /marcar pago/i }))
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(mockSetPaid).not.toHaveBeenCalled()
  })

  it("inscrição paga não tem botão de pagar, só o indicador", async () => {
    renderLista()
    await aguardarLista()
    const linha = screen.getByText("Ana Resende").closest("tr") as HTMLElement
    expect(within(linha).getByText("✓ Pago")).toBeInTheDocument()
    expect(within(linha).queryByRole("button", { name: /marcar pago/i })).not.toBeInTheDocument()
  })

  it("desfaz o pagamento pelo menu de ações", async () => {
    renderLista()
    await aguardarLista()
    const linha = screen.getByText("Ana Resende").closest("tr") as HTMLElement
    fireEvent.click(within(linha).getByRole("button", { name: "Ações" }))
    fireEvent.click(screen.getByRole("button", { name: "Desfazer pagamento" }))
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }))
    await waitFor(() => expect(mockSetPaid).toHaveBeenCalledWith("11111111111", false))
  })

  it("mostra erro quando a gravação do pagamento falha", async () => {
    mockSetPaid.mockRejectedValue(new Error("falhou"))
    renderLista()
    await aguardarLista()
    const linha = screen.getByText("Bruno Lima").closest("tr") as HTMLElement
    fireEvent.click(within(linha).getByRole("button", { name: /marcar pago/i }))
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }))
    expect(await screen.findByText(/não foi possível atualizar o pagamento de bruno lima/i)).toBeInTheDocument()
  })
})

describe("Inscrições — remover e reativar", () => {
  async function removerBruno() {
    const linha = screen.getByText("Bruno Lima").closest("tr") as HTMLElement
    fireEvent.click(within(linha).getByRole("button", { name: "Ações" }))
    fireEvent.click(screen.getByRole("button", { name: "Remover inscrição" }))
    fireEvent.click(screen.getByRole("button", { name: "Remover" }))
    await waitFor(() => expect(mockRemove).toHaveBeenCalledWith("22222222222"))
  }

  it("pede confirmação antes de remover", async () => {
    renderLista()
    await aguardarLista()
    const linha = screen.getByText("Bruno Lima").closest("tr") as HTMLElement
    fireEvent.click(within(linha).getByRole("button", { name: "Ações" }))
    fireEvent.click(screen.getByRole("button", { name: "Remover inscrição" }))
    expect(screen.getByText("Remover inscrição?")).toBeInTheDocument()
    expect(mockRemove).not.toHaveBeenCalled()
  })

  it("remove da lista e passa a contar em removidas", async () => {
    renderLista()
    await aguardarLista()
    await removerBruno()
    await waitFor(() => expect(screen.queryByText("Bruno Lima")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: "2 inscritos" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "1 removidas" })).toBeInTheDocument()
  })

  it("mostra a removida só no filtro próprio", async () => {
    renderLista()
    await aguardarLista()
    await removerBruno()
    fireEvent.click(await screen.findByRole("button", { name: "1 removidas" }))
    expect(screen.getByText("Bruno Lima")).toBeInTheDocument()
    expect(screen.queryByText("Ana Resende")).not.toBeInTheDocument()
  })

  it("reativa a inscrição, que volta como pendente", async () => {
    mockList.mockResolvedValue([
      ...inscricoes.map((i) => ({ ...i })),
      { cpf: "33333333333", uid: "u3", status: "removed", fee: 120 },
    ])
    renderLista()
    await aguardarLista()
    fireEvent.click(screen.getByRole("button", { name: "1 removidas" }))
    fireEvent.click(screen.getByRole("button", { name: /reativar inscrição/i }))
    fireEvent.click(screen.getByRole("button", { name: "Reativar" }))
    await waitFor(() => expect(mockReactivate).toHaveBeenCalledWith("33333333333"))
  })

  it("inscrição removida não oferece marcar pago nem menu", async () => {
    mockList.mockResolvedValue([{ cpf: "11111111111", uid: "u1", status: "removed", fee: 120 }])
    renderLista()
    fireEvent.click(await screen.findByRole("button", { name: "1 removidas" }))
    expect(screen.getByText("Ana Resende")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /marcar pago/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Ações" })).not.toBeInTheDocument()
  })

  it("mostra erro quando a remoção falha", async () => {
    mockRemove.mockRejectedValue(new Error("falhou"))
    renderLista()
    await aguardarLista()
    const linha = screen.getByText("Bruno Lima").closest("tr") as HTMLElement
    fireEvent.click(within(linha).getByRole("button", { name: "Ações" }))
    fireEvent.click(screen.getByRole("button", { name: "Remover inscrição" }))
    fireEvent.click(screen.getByRole("button", { name: "Remover" }))
    expect(await screen.findByText(/não foi possível remover a inscrição de bruno lima/i)).toBeInTheDocument()
  })
})

describe("Inscrições — mobile", () => {
  it("troca a tabela por cards com os mesmos dados", async () => {
    renderLista(true)
    await aguardarLista()
    expect(document.querySelector("table")).toBeNull()
    expect(screen.getAllByText("Sexo").length).toBe(3)
    expect(screen.getAllByText("Categoria").length).toBe(3)
    // "Feminino" também é opção do filtro: conta só o que está nos cards.
    const cartao = screen.getByText("Ana Resende").closest("div[style*='border-radius: 10px']") as HTMLElement
    expect(within(cartao).getByText("Feminino")).toBeInTheDocument()
    expect(within(cartao).getByText("UP BJJ / Itaocara")).toBeInTheDocument()
  })

  it("mantém os filtros no mobile", async () => {
    renderLista(true)
    await aguardarLista()
    fireEvent.change(screen.getByLabelText("Filtrar por sexo"), { target: { value: "1" } })
    expect(screen.getByText("Bruno Lima")).toBeInTheDocument()
    expect(screen.queryByText("Ana Resende")).not.toBeInTheDocument()
  })

  it("permite marcar pago pelo card", async () => {
    renderLista(true)
    await aguardarLista()
    const cartao = screen.getByText("Bruno Lima").closest("div[style*='border-radius: 10px']") as HTMLElement
    fireEvent.click(within(cartao).getByRole("button", { name: /marcar pago/i }))
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }))
    await waitFor(() => expect(mockSetPaid).toHaveBeenCalledWith("22222222222", true))
  })
})

describe("Inscrições — paginação", () => {
  it("quebra a lista em páginas e navega entre elas", async () => {
    const muitas = Array.from({ length: 12 }, (_, i) => ({
      cpf: String(i).padStart(11, "0"),
      uid: `u${i}`,
      status: "pending" as const,
      fee: 120,
    }))
    mockList.mockResolvedValue(muitas)
    renderLista()
    expect(await screen.findByText("Mostrando 1 a 10 de 12 inscritos")).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText("Página 2"))
    expect(screen.getByText("Mostrando 11 a 12 de 12 inscritos")).toBeInTheDocument()
  })
})
