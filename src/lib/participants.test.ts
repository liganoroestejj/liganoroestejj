import {
  ageOptions, buildParticipant, categoryOptions, expectedParticipants, isParticipant,
  listParticipants, sortParticipants, syncParticipants, type Participant,
} from "./participants"
import type { Registration } from "./registrations"
import { doc, getDoc, getDocs, writeBatch } from "firebase/firestore"

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
  it("entra só inscrição paga com filiação existente", () => {
    const lista = expectedParticipants(
      [reg("1", "paid"), reg("2", "pending"), reg("3", "removed"), reg("4", "paid")],
      [filiado("1", "1990-01-01"), filiado("2", "1990-01-01"), filiado("3", "1990-01-01")],
      EVENTO,
    )
    expect(lista.map((p) => p.uid)).toEqual(["u-1"])
  })
})

describe("isParticipant / listParticipants", () => {
  it("diz se o uid está na lista", async () => {
    ;(getDoc as jest.Mock).mockResolvedValue({ exists: () => true })
    expect(await isParticipant("u-1")).toBe(true)
    expect(doc).toHaveBeenCalledWith({}, "paduaParticipants", "u-1")
    ;(getDoc as jest.Mock).mockResolvedValue({ exists: () => false })
    expect(await isParticipant("u-2")).toBe(false)
  })

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
