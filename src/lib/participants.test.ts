import {
  ageOptions, buildParticipant, categoryOptions, ensureListed, expectedParticipants, expectedViewers,
  listParticipants, prepareSelf, sortParticipants, syncParticipants, syncViewers,
  type Participant,
} from "./participants"
import type { Registration } from "./registrations"
import { getDoc, getDocs, setDoc, writeBatch } from "firebase/firestore"

const mockGetRegistration = jest.fn()
jest.mock("./registrations", () => ({
  ...jest.requireActual("./registrations"),
  getRegistration: (...a: unknown[]) => mockGetRegistration(...a),
}))

jest.mock("./firebase", () => ({ db: {} }))
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  doc: jest.fn((_db: unknown, col: string, id: string) => `${col}/${id}`),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  writeBatch: jest.fn(),
  limit: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}))

// Dia do Open Pádua: 08/11/2026.
const EVENTO = new Date(2026, 10, 8)

const reg = (cpf: string, status: Registration["status"], weight = 70): Registration =>
  ({ cpf, uid: `reg-${cpf}`, status, fee: 120, weight })

const filiado = (cpf: string, birthDate: string | undefined, extra: object = {}) => ({
  cpf, uid: `u-${cpf}`, fullName: `Atleta ${cpf}`, academyId: 1, belt: 6, gender: 1, birthDate, ...extra,
})

function participante(over: Partial<Participant>): Participant {
  return {
    uid: "u", fullName: "X", academyId: 1, belt: 1, gender: 1, photoURL: null,
    age: 20, categoryId: 8, category: "Adulto", weightClass: null, ...over,
  }
}

beforeEach(() => jest.clearAllMocks())

describe("buildParticipant", () => {
  it("usa idade e categoria do dia do evento", () => {
    // Faz 18 anos no dia do evento: já compete no Adulto.
    const p = buildParticipant(reg("1", "paid", 75), filiado("1", "2008-11-08"), EVENTO)
    expect(p.age).toBe(18)
    expect(p.category).toBe("Adulto")
    expect(p.weightClass).toBe("Leve")
  })

  it("junta até 9 anos no Festival e não classifica o peso", () => {
    const p = buildParticipant(reg("1", "paid", 28), filiado("1", "2018-01-01"), EVENTO)
    expect(p.category).toBe("Festival")
    expect(p.weightClass).toBeNull()
  })

  it("não expõe CPF, contato nem data de nascimento", () => {
    const p = buildParticipant(
      { ...reg("12345678900", "paid"), uid: "uid-1" },
      filiado("12345678900", "1990-01-01", { uid: "uid-1", fullName: "Ana", email: "a@b.com", phone: "22999999999" }),
      EVENTO,
    )
    const texto = JSON.stringify(p)
    expect(texto).not.toContain("12345678900")
    expect(texto).not.toContain("a@b.com")
    expect(texto).not.toContain("1990-01-01")
  })

  it("usa o uid da filiação (login atual)", () => {
    expect(buildParticipant(reg("1", "paid"), filiado("1", "1990-01-01"), EVENTO).uid).toBe("u-1")
  })

  it("sem nascimento fica sem idade nem categoria (e sem undefined, que o Firestore recusa)", () => {
    const p = buildParticipant(reg("1", "paid"), filiado("1", undefined), EVENTO)
    expect(p.age).toBeNull()
    expect(p.category).toBeNull()
    expect(p.photoURL).toBeNull()
    expect(Object.values(p)).not.toContain(undefined)
  })
})

describe("expectedParticipants", () => {
  it("entra toda inscrição não removida (paga ou pendente) com filiação existente", () => {
    const lista = expectedParticipants(
      [reg("1", "paid"), reg("2", "pending"), reg("3", "removed"), reg("4", "paid")],
      [filiado("1", "1990-01-01"), filiado("2", "1990-01-01"), filiado("3", "1990-01-01")],
      EVENTO,
    )
    expect(lista.map((p) => p.uid)).toEqual(["u-1", "u-2"])
  })
})

describe("listParticipants", () => {
  it("lista os docs", async () => {
    const p = participante({ uid: "a" })
    ;(getDocs as jest.Mock).mockResolvedValue({ docs: [{ data: () => p }] })
    expect(await listParticipants()).toEqual([p])
  })
})

describe("syncParticipants", () => {
  function prepara(atuais: Participant[]) {
    ;(getDocs as jest.Mock).mockResolvedValue({ docs: atuais.map((p) => ({ data: () => p })) })
    const batch = { set: jest.fn(), delete: jest.fn(), commit: jest.fn().mockResolvedValue(undefined) }
    ;(writeBatch as jest.Mock).mockReturnValue(batch)
    return batch
  }

  it("publica quem é novo, tira quem saiu e atualiza quem mudou", async () => {
    const igual = participante({ uid: "igual" })
    const mudou = participante({ uid: "mudou", fullName: "Antigo" })
    const saiu = participante({ uid: "saiu" })
    const batch = prepara([igual, mudou, saiu])
    const novo = participante({ uid: "novo" })
    const mudouAgora = { ...mudou, fullName: "Novo nome" }

    await syncParticipants([igual, mudouAgora, novo])

    expect(batch.set).toHaveBeenCalledTimes(2)
    expect(batch.set).toHaveBeenCalledWith("paduaParticipants/mudou", mudouAgora)
    expect(batch.set).toHaveBeenCalledWith("paduaParticipants/novo", novo)
    expect(batch.delete).toHaveBeenCalledWith("paduaParticipants/saiu")
    expect(batch.commit).toHaveBeenCalledTimes(1)
  })

  it("não grava nada quando já está em dia", async () => {
    const p = participante({ uid: "a" })
    prepara([p])
    await syncParticipants([{ ...p }])
    expect(writeBatch).not.toHaveBeenCalled()
  })

  it("divide em lotes de 500", async () => {
    const batch = prepara([])
    const muitos = Array.from({ length: 501 }, (_, i) => participante({ uid: `u${i}` }))
    await syncParticipants(muitos)
    expect(batch.commit).toHaveBeenCalledTimes(2)
  })
})

describe("quem pode ver a lista (paduaViewers)", () => {
  it("todo inscrito não removido com filiação, pago ou pendente", () => {
    const lista = expectedViewers(
      [reg("1", "paid"), reg("2", "pending"), reg("3", "removed"), reg("4", "paid")],
      [filiado("1", undefined), filiado("2", undefined), filiado("3", undefined)],
    )
    expect(lista).toEqual([{ uid: "u-1", cpf: "1" }, { uid: "u-2", cpf: "2" }])
  })

  describe("prepareSelf", () => {
    const comFiliacao = () =>
      (getDocs as jest.Mock).mockResolvedValue({
        empty: false,
        docs: [{ data: () => filiado("111", "1990-01-01", { fullName: "Ana" }) }],
      })

    it("inscrição pendente libera o atleta e devolve a linha dele", async () => {
      comFiliacao()
      mockGetRegistration.mockResolvedValue(reg("111", "pending"))
      ;(getDoc as jest.Mock).mockResolvedValue({ exists: () => false })
      const eu = await prepareSelf("u-1")
      expect(setDoc).toHaveBeenCalledWith("paduaViewers/u-1", { uid: "u-1", cpf: "111" })
      expect(eu).toEqual(expect.objectContaining({ uid: "u-1", fullName: "Ana", category: "Master 2" }))
    })

    it("já liberado não grava de novo", async () => {
      comFiliacao()
      mockGetRegistration.mockResolvedValue(reg("111", "paid"))
      ;(getDoc as jest.Mock).mockResolvedValue({ exists: () => true })
      expect(await prepareSelf("u-1")).not.toBeNull()
      expect(setDoc).not.toHaveBeenCalled()
    })

    it("sem filiação não libera", async () => {
      ;(getDocs as jest.Mock).mockResolvedValue({ empty: true, docs: [] })
      expect(await prepareSelf("u-1")).toBeNull()
      expect(setDoc).not.toHaveBeenCalled()
    })

    it("sem inscrição não libera", async () => {
      comFiliacao()
      mockGetRegistration.mockResolvedValue(null)
      expect(await prepareSelf("u-1")).toBeNull()
      expect(setDoc).not.toHaveBeenCalled()
    })

    it("inscrição removida não libera", async () => {
      comFiliacao()
      mockGetRegistration.mockResolvedValue(reg("111", "removed"))
      expect(await prepareSelf("u-1")).toBeNull()
      expect(setDoc).not.toHaveBeenCalled()
    })
  })

  describe("ensureListed", () => {
    it("publica o atleta que ainda não está na lista", async () => {
      const eu = participante({ uid: "eu" })
      const outro = participante({ uid: "outro" })
      expect(await ensureListed(eu, [outro])).toEqual([outro, eu])
      expect(setDoc).toHaveBeenCalledWith("paduaParticipants/eu", eu)
    })

    it("atualiza a linha que mudou (ex.: trocou a foto)", async () => {
      const antigo = participante({ uid: "eu", photoURL: null })
      const eu = { ...antigo, photoURL: "nova.jpg" }
      expect(await ensureListed(eu, [antigo])).toEqual([eu])
      expect(setDoc).toHaveBeenCalledWith("paduaParticipants/eu", eu)
    })

    it("não grava quando já está em dia", async () => {
      const eu = participante({ uid: "eu" })
      const lista = [{ ...eu }]
      expect(await ensureListed(eu, lista)).toBe(lista)
      expect(setDoc).not.toHaveBeenCalled()
    })
  })

  it("syncViewers libera os novos e tira os removidos", async () => {
    ;(getDocs as jest.Mock).mockResolvedValue({
      docs: [
        { id: "fica", data: () => ({ uid: "fica", cpf: "1" }) },
        { id: "sai", data: () => ({ uid: "sai", cpf: "2" }) },
      ],
    })
    const batch = { set: jest.fn(), delete: jest.fn(), commit: jest.fn().mockResolvedValue(undefined) }
    ;(writeBatch as jest.Mock).mockReturnValue(batch)
    await syncViewers([{ uid: "fica", cpf: "1" }, { uid: "novo", cpf: "3" }])
    expect(batch.set).toHaveBeenCalledTimes(1)
    expect(batch.set).toHaveBeenCalledWith("paduaViewers/novo", { uid: "novo", cpf: "3" })
    expect(batch.delete).toHaveBeenCalledWith("paduaViewers/sai")
  })
})

describe("opções de filtro e ordenação", () => {
  const lista = [
    participante({ uid: "1", fullName: "Zé", categoryId: 8, category: "Adulto", age: 25 }),
    participante({ uid: "2", fullName: "Ana", categoryId: 8, category: "Adulto", age: 19 }),
    participante({ uid: "3", fullName: "Bia", categoryId: 3, category: "Festival", age: 9 }),
    participante({ uid: "4", fullName: "Caio", categoryId: 1, category: "Festival", age: 5 }),
    participante({ uid: "5", fullName: "Dani", categoryId: null, category: null, age: null }),
  ]

  it("categorias na ordem de idade, sem repetir o Festival", () => {
    expect(categoryOptions(lista)).toEqual(["Festival", "Adulto"])
  })

  it("idades únicas em ordem crescente", () => {
    expect(ageOptions(lista)).toEqual([5, 9, 19, 25])
  })

  it("ordena por categoria e depois por nome, sem categoria no fim", () => {
    expect(sortParticipants(lista).map((p) => p.fullName)).toEqual(["Caio", "Bia", "Ana", "Zé", "Dani"])
  })
})
