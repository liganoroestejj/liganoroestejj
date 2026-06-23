import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Cadastro from "./Cadastro"

// Borda do Firebase: cpfAlreadyRegistered e registerAffiliate.
const mockCpfExists = jest.fn()
const mockRegister = jest.fn()
jest.mock("../../lib/affiliates", () => ({
  cpfAlreadyRegistered: (...a: unknown[]) => mockCpfExists(...a),
  registerAffiliate: (...a: unknown[]) => mockRegister(...a),
}))

const CPF_VALIDO = "111.444.777-35"

function renderCadastro() {
  return render(
    <MemoryRouter>
      <Cadastro />
    </MemoryRouter>,
  )
}

const type = (el: Element, value: string) => fireEvent.change(el, { target: { value } })

/** Preenche a Etapa 1 com CPF válido e avança para a Etapa 2. */
async function irParaEtapa2(container: HTMLElement) {
  type(container.querySelector('input[inputmode="numeric"]')!, CPF_VALIDO)
  type(container.querySelector('input[type="date"]')!, "1990-05-10")
  type(container.querySelector("select")!, "1")
  mockCpfExists.mockResolvedValueOnce(false)
  fireEvent.click(screen.getByText("Continuar"))
  await screen.findByText("Nome completo")
}

/** Preenche todos os campos da Etapa 2 com valores válidos. */
function preencherEtapa2(container: HTMLElement) {
  const ins = container.querySelectorAll("input")
  type(ins[0], "João Silva")     // nome
  type(ins[1], "joao@email.com") // e-mail
  type(ins[2], "@joao")          // instagram
  type(ins[3], "22999998888")    // telefone
  type(ins[4], "Rua A, 123")     // endereço
  type(ins[5], "Centro")         // bairro
  type(ins[6], "28300000")       // cep
  type(ins[7], "Itaperuna")      // cidade
  // ins[8] = categoria (disabled)
  type(ins[9], "123456")         // senha
  type(ins[10], "123456")        // confirmar
  const sels = container.querySelectorAll("select")
  type(sels[0], "RJ")  // estado
  type(sels[1], "1")   // academia
  type(sels[2], "6")   // faixa
  type(sels[3], "1")   // tipo
}

beforeEach(() => {
  jest.clearAllMocks()
  mockCpfExists.mockResolvedValue(false)
  mockRegister.mockResolvedValue({ cpf: "11144477735", uid: "u1" })
})

describe("Filiação — Etapa 1 (CPF)", () => {
  it("renderiza os campos da etapa 1", () => {
    renderCadastro()
    expect(screen.getByText("CPF")).toBeInTheDocument()
    expect(screen.getByText("Data de nascimento")).toBeInTheDocument()
    expect(screen.getByText("Continuar")).toBeInTheDocument()
  })

  it("rejeita CPF incompleto", async () => {
    const { container } = renderCadastro()
    type(container.querySelector('input[inputmode="numeric"]')!, "123")
    type(container.querySelector('input[type="date"]')!, "1990-05-10")
    type(container.querySelector("select")!, "1")
    fireEvent.click(screen.getByText("Continuar"))
    expect(await screen.findByText("Digite os 11 dígitos do CPF.")).toBeInTheDocument()
    expect(mockCpfExists).not.toHaveBeenCalled()
  })

  it("rejeita CPF com dígito verificador inválido", async () => {
    const { container } = renderCadastro()
    type(container.querySelector('input[inputmode="numeric"]')!, "111.111.111-11")
    type(container.querySelector('input[type="date"]')!, "1990-05-10")
    type(container.querySelector("select")!, "1")
    fireEvent.click(screen.getByText("Continuar"))
    expect(await screen.findByText("CPF inválido. Verifique os números digitados.")).toBeInTheDocument()
  })

  it("rejeita CPF já cadastrado", async () => {
    mockCpfExists.mockResolvedValueOnce(true)
    const { container } = renderCadastro()
    type(container.querySelector('input[inputmode="numeric"]')!, CPF_VALIDO)
    type(container.querySelector('input[type="date"]')!, "1990-05-10")
    type(container.querySelector("select")!, "1")
    fireEvent.click(screen.getByText("Continuar"))
    expect(await screen.findByText("Este CPF já possui uma filiação cadastrada.")).toBeInTheDocument()
  })

  it("avança para a etapa 2 com CPF válido e livre", async () => {
    const { container } = renderCadastro()
    await irParaEtapa2(container)
    expect(screen.getByText("Nome completo")).toBeInTheDocument()
  })
})

describe("Filiação — Etapa 2 (dados)", () => {
  it("bloqueia o envio e mostra erros por campo quando vazio", async () => {
    const { container } = renderCadastro()
    await irParaEtapa2(container)
    fireEvent.click(screen.getByText("Concluir filiação"))
    expect(await screen.findByText("Informe seu nome completo (nome e sobrenome).")).toBeInTheDocument()
    expect(screen.getByText("E-mail inválido.")).toBeInTheDocument()
    expect(mockRegister).not.toHaveBeenCalled()
  })

  it("registra a filiação e vai para a etapa de sucesso quando tudo é válido", async () => {
    const { container } = renderCadastro()
    await irParaEtapa2(container)
    preencherEtapa2(container)
    fireEvent.click(screen.getByText("Concluir filiação"))
    expect(await screen.findByText("FILIAÇÃO ENVIADA")).toBeInTheDocument()
    expect(mockRegister).toHaveBeenCalledTimes(1)
  })

  it("o botão Voltar retorna para a etapa 1", async () => {
    const { container } = renderCadastro()
    await irParaEtapa2(container)
    fireEvent.click(screen.getByText(/Voltar/))
    expect(await screen.findByText("Continuar")).toBeInTheDocument()
  })
})
