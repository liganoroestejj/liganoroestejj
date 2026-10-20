import {
  ageOnDate, FEE_FROM_10, FEE_UP_TO_9, isValidWeight, MAX_WEIGHT, MIN_WEIGHT,
  parseWeight, registrationFee,
} from "./registrations"

jest.mock("./firebase", () => ({ db: {} }))
jest.mock("firebase/firestore", () => ({
  collection: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  serverTimestamp: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
}))

// Dia do Open Pádua: 08/11/2026 (mês 10 = novembro no construtor do JS).
const EVENTO = new Date(2026, 10, 8)

describe("ageOnDate — idade na data do evento", () => {
  it("conta o aniversário do próprio dia do evento", () => {
    expect(ageOnDate("2016-11-08", EVENTO)).toBe(10)
  })

  it("não conta aniversário de um dia depois do evento", () => {
    expect(ageOnDate("2016-11-09", EVENTO)).toBe(9)
  })

  it("não antecipa a idade por causa do fuso (data ISO é lida como local)", () => {
    // "2017-11-09" vira 08/11 em UTC-3 se lido com `new Date`: o atleta
    // apareceria um ano mais velho justamente no dia do evento.
    expect(ageOnDate("2017-11-09", EVENTO)).toBe(8)
  })

  it("conta aniversário já passado no ano", () => {
    expect(ageOnDate("1992-10-25", EVENTO)).toBe(34)
  })

  it("devolve 0 para data vazia ou malformada", () => {
    expect(ageOnDate("", EVENTO)).toBe(0)
    expect(ageOnDate("25/10/1992", EVENTO)).toBe(0)
  })
})

describe("registrationFee — valor por idade", () => {
  it("cobra o valor infantil até 9 anos", () => {
    expect(registrationFee("2017-05-01", EVENTO)).toBe(FEE_UP_TO_9)
  })

  it("cobra o valor infantil para quem faz 9 anos no dia do evento", () => {
    expect(registrationFee("2017-11-08", EVENTO)).toBe(FEE_UP_TO_9)
  })

  it("cobra o valor cheio a partir dos 10 anos", () => {
    expect(registrationFee("2016-11-08", EVENTO)).toBe(FEE_FROM_10)
  })

  it("cobra o infantil de quem só faz 10 anos depois do evento", () => {
    expect(registrationFee("2016-12-31", EVENTO)).toBe(FEE_UP_TO_9)
  })

  it("cobra o valor cheio de um adulto", () => {
    expect(registrationFee("1992-10-25", EVENTO)).toBe(FEE_FROM_10)
  })

  it("usa os valores combinados: R$ 100 e R$ 120", () => {
    expect(FEE_UP_TO_9).toBe(100)
    expect(FEE_FROM_10).toBe(120)
  })
})

describe("parseWeight — peso digitado", () => {
  it("aceita ponto como separador decimal", () => {
    expect(parseWeight("90.2")).toBe(90.2)
  })

  it("aceita vírgula, que é como se digita no Brasil", () => {
    expect(parseWeight("90,2")).toBe(90.2)
  })

  it("aceita peso inteiro", () => {
    expect(parseWeight("90")).toBe(90)
  })

  it("ignora espaços em volta", () => {
    expect(parseWeight(" 90,2 ")).toBe(90.2)
  })

  it("não vira número com dois separadores", () => {
    expect(Number.isNaN(parseWeight("90,2.5"))).toBe(true)
  })

  it("não vira número com texto", () => {
    expect(Number.isNaN(parseWeight("noventa"))).toBe(true)
  })
})

describe("isValidWeight — limites", () => {
  it("aceita peso de criança e de adulto", () => {
    expect(isValidWeight(28.5)).toBe(true)
    expect(isValidWeight(90.2)).toBe(true)
  })

  it("aceita exatamente os limites", () => {
    expect(isValidWeight(MIN_WEIGHT)).toBe(true)
    expect(isValidWeight(MAX_WEIGHT)).toBe(true)
  })

  it("recusa abaixo do mínimo e acima do máximo", () => {
    expect(isValidWeight(MIN_WEIGHT - 0.1)).toBe(false)
    expect(isValidWeight(MAX_WEIGHT + 0.1)).toBe(false)
  })

  it("recusa não-número (campo vazio ou texto)", () => {
    expect(isValidWeight(NaN)).toBe(false)
    expect(isValidWeight(parseWeight(""))).toBe(false)
  })
})
