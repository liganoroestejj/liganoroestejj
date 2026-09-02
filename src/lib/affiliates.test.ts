import { adminRevertPayment, confirmPayment, registerAffiliate, type AffiliateInput } from "./affiliates"

// Borda do Firebase Auth: criação de usuário + e-mail de confirmação.
const mockCreateUser = jest.fn()
const mockUpdateProfile = jest.fn()
const mockSendVerification = jest.fn()
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: (...a: unknown[]) => mockCreateUser(...a),
  updateProfile: (...a: unknown[]) => mockUpdateProfile(...a),
  sendEmailVerification: (...a: unknown[]) => mockSendVerification(...a),
}))

// Borda do Firestore: só precisamos observar as gravações. O `doc()` devolve
// o caminho para que os testes saibam QUAL documento foi escrito.
const mockSetDoc = jest.fn()
const mockUpdateDoc = jest.fn()
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  deleteDoc: jest.fn(),
  deleteField: jest.fn(() => "__deleted__"),
  doc: (_db: unknown, ...segs: string[]) => ({ path: segs.join("/") }),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(() => "ts"),
  setDoc: (...a: unknown[]) => mockSetDoc(...a),
  updateDoc: (...a: unknown[]) => mockUpdateDoc(...a),
}))

jest.mock("./firebase", () => ({ auth: {}, db: {} }))
jest.mock("./image", () => ({ compressSquareImage: jest.fn() }))
jest.mock("./cloudinary", () => ({ uploadToCloudinary: jest.fn() }))

const input: AffiliateInput = {
  cpf: "111.444.777-35",
  birthDate: "1990-05-10",
  gender: 1,
  fullName: "João Silva",
  email: "joao@x.com",
  instagram: "@joao",
  phone: "22999998888",
  address: "Rua A, 123",
  neighborhood: "Centro",
  zipCode: "28300000",
  city: "Itaperuna",
  state: "RJ",
  academyId: 1,
  belt: 6,
  role: 1,
  password: "123456",
}

beforeEach(() => {
  jest.clearAllMocks()
  mockCreateUser.mockResolvedValue({ user: { uid: "u1" } })
  mockUpdateProfile.mockResolvedValue(undefined)
  mockSendVerification.mockResolvedValue(undefined)
  mockSetDoc.mockResolvedValue(undefined)
  mockUpdateDoc.mockResolvedValue(undefined)
})

/** Payload gravado no documento cujo caminho bate com `path`. */
function writeTo(mock: jest.Mock, path: string) {
  const call = mock.mock.calls.find((c) => (c[0] as { path: string }).path === path)
  return call?.[1] as Record<string, unknown> | undefined
}

/** Mesma conta do código: data ISO local. */
function isoPlusYears(iso: string, years: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setFullYear(d.getFullYear() + years)
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${String(d.getDate()).padStart(2, "0")}`
}

function hoje(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${String(d.getDate()).padStart(2, "0")}`
}

describe("registerAffiliate — e-mail de confirmação", () => {
  it("envia o e-mail de confirmação para o usuário recém-criado", async () => {
    await registerAffiliate(input)
    expect(mockSendVerification).toHaveBeenCalledTimes(1)
    expect(mockSendVerification).toHaveBeenCalledWith({ uid: "u1" })
  })

  it("dispara o e-mail depois de criar o usuário e ainda grava a filiação", async () => {
    const ordem: string[] = []
    mockCreateUser.mockImplementationOnce(async () => {
      ordem.push("createUser")
      return { user: { uid: "u1" } }
    })
    mockSendVerification.mockImplementationOnce(async () => { ordem.push("sendVerification") })
    mockSetDoc.mockImplementation(async () => { ordem.push("setDoc") })

    await registerAffiliate(input)

    expect(ordem[0]).toBe("createUser")
    expect(ordem[1]).toBe("sendVerification")
    expect(ordem).toContain("setDoc")
  })

  it("não quebra o cadastro quando o envio do e-mail falha", async () => {
    mockSendVerification.mockRejectedValueOnce(new Error("smtp fora do ar"))

    const res = await registerAffiliate(input)

    // A filiação é concluída normalmente...
    expect(res).toEqual({ cpf: "11144477735", uid: "u1" })
    // ...e todas as gravações acontecem (affiliate + anuidade + cpfRegistry).
    expect(mockSetDoc).toHaveBeenCalledTimes(3)
  })

  it("reverte a conta órfã se a gravação da filiação falhar", async () => {
    const mockDelete = jest.fn().mockResolvedValue(undefined)
    mockCreateUser.mockResolvedValueOnce({ user: { uid: "u1", delete: mockDelete } })
    // A 1ª escrita (a própria filiação) falha.
    mockSetDoc.mockRejectedValueOnce(new Error("firestore offline"))

    await expect(registerAffiliate(input)).rejects.toThrow()

    // A conta recém-criada é apagada (rollback) e nada mais é gravado.
    expect(mockDelete).toHaveBeenCalledTimes(1)
    expect(mockSetDoc).toHaveBeenCalledTimes(1)
  })

  it("conclui o cadastro mesmo se as escritas secundárias falharem", async () => {
    // Filiação grava (1ª), mas a anuidade (2ª) falha: não deve reverter.
    mockSetDoc.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("offline"))

    const res = await registerAffiliate(input)

    expect(res).toEqual({ cpf: "11144477735", uid: "u1" })
  })
})

const carteira = {
  uid: "u1",
  fullName: "João Silva",
  academyId: 1,
  belt: 6,
  cardId: "card-1",
}

describe("confirmPayment — anuidade", () => {
  it("dá validade de 1 ano a partir de hoje na primeira ativação", async () => {
    const { validUntil } = await confirmPayment({
      cpf: "111.444.777-35",
      month: "2026-09",
      adminUid: "admin-1",
      affiliate: carteira, // sem validUntil
    })

    expect(validUntil).toBe(isoPlusYears(hoje(), 1))
  })

  it("soma 1 ano sobre a validade atual quando ainda está vigente", async () => {
    const futuro = isoPlusYears(hoje(), 1) // ainda vale

    const { validUntil } = await confirmPayment({
      cpf: "111.444.777-35",
      month: "2026-09",
      adminUid: "admin-1",
      affiliate: { ...carteira, validUntil: futuro },
    })

    // Não perde os dias já pagos: parte da validade vigente, não de hoje.
    expect(validUntil).toBe(isoPlusYears(futuro, 1))
  })

  it("conta 1 ano a partir de hoje quando a validade já venceu", async () => {
    const { validUntil } = await confirmPayment({
      cpf: "111.444.777-35",
      month: "2026-09",
      adminUid: "admin-1",
      affiliate: { ...carteira, validUntil: "2020-01-01" },
    })

    expect(validUntil).toBe(isoPlusYears(hoje(), 1))
  })

  it("grava a mesma validade no filiado e na carteirinha pública", async () => {
    const { validUntil } = await confirmPayment({
      cpf: "111.444.777-35",
      month: "2026-09",
      adminUid: "admin-1",
      affiliate: carteira,
    })

    expect(writeTo(mockUpdateDoc, "affiliates/11144477735")).toMatchObject({ status: "active", validUntil })
    expect(writeTo(mockSetDoc, "publicCards/card-1")).toMatchObject({ status: "active", validUntil })
  })
})

describe("adminRevertPayment — remoção de pagamento", () => {
  const alvo = { cpf: "111.444.777-35", month: "2026-09", cardId: "card-1" }

  it("devolve o filiado para pendente e apaga validade e último pagamento", async () => {
    await adminRevertPayment(alvo)

    expect(writeTo(mockUpdateDoc, "affiliates/11144477735")).toEqual({
      status: "pending",
      validUntil: "__deleted__",
      lastPaymentAt: "__deleted__",
    })
  })

  it("volta a cobrança para pendente sem apagar o valor já registrado", async () => {
    await adminRevertPayment(alvo)

    const pag = writeTo(mockSetDoc, "affiliates/11144477735/payments/2026-09")
    expect(pag).toEqual({
      month: "2026-09",
      status: "pending",
      paidAt: "__deleted__",
      confirmedBy: "__deleted__",
    })
    // `amount` não entra no payload: o merge preserva o que já estava gravado.
    expect(pag).not.toHaveProperty("amount")
    expect(mockSetDoc).toHaveBeenCalledWith(expect.anything(), expect.anything(), { merge: true })
  })

  it("invalida a carteirinha pública mantendo o mesmo cardId", async () => {
    await adminRevertPayment(alvo)

    // O doc não é apagado: o QR já impresso continua abrindo e passa a
    // mostrar "pagamento pendente".
    expect(writeTo(mockSetDoc, "publicCards/card-1")).toBeUndefined()
    expect(writeTo(mockUpdateDoc, "publicCards/card-1")).toEqual({
      status: "pending",
      validUntil: "",
    })
  })

  it("não tenta escrever carteirinha quando o filiado ainda não tem uma", async () => {
    await adminRevertPayment({ cpf: "111.444.777-35", month: "2026-09" })

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1)
    expect(writeTo(mockUpdateDoc, "affiliates/11144477735")).toBeDefined()
  })
})
