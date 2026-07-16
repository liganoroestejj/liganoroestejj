import { registerAffiliate, type AffiliateInput } from "./affiliates"

// Borda do Firebase Auth: criação de usuário + e-mail de confirmação.
const mockCreateUser = jest.fn()
const mockUpdateProfile = jest.fn()
const mockSendVerification = jest.fn()
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: (...a: unknown[]) => mockCreateUser(...a),
  updateProfile: (...a: unknown[]) => mockUpdateProfile(...a),
  sendEmailVerification: (...a: unknown[]) => mockSendVerification(...a),
}))

// Borda do Firestore: só precisamos observar as gravações.
const mockSetDoc = jest.fn()
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn(() => ({})),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  orderBy: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(() => "ts"),
  setDoc: (...a: unknown[]) => mockSetDoc(...a),
  updateDoc: jest.fn(),
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
})

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
    // ...e todas as gravações acontecem (affiliate + mensalidade + cpfRegistry).
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
    // Filiação grava (1ª), mas a mensalidade (2ª) falha: não deve reverter.
    mockSetDoc.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error("offline"))

    const res = await registerAffiliate(input)

    expect(res).toEqual({ cpf: "11144477735", uid: "u1" })
  })
})
