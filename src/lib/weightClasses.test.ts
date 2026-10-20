import { categoryFromBirthDate } from "./affiliateOptions"
import {
  GENDER_FEMALE,
  GENDER_MALE,
  hasAdultWeightTable,
  weightClass,
  WEIGHT_CLASSES_FEMALE,
  WEIGHT_CLASSES_MALE,
} from "./weightClasses"

/** Id da categoria de idade de um adulto (usado nos casos abaixo). */
const ADULTO = categoryFromBirthDate("1992-10-25").id

describe("Tabelas de peso", () => {
  it("usa os limites masculinos da IBJJF", () => {
    expect(WEIGHT_CLASSES_MALE.map((c) => [c.label, c.max])).toEqual([
      ["Galo", 57.5],
      ["Pluma", 64.0],
      ["Pena", 70.0],
      ["Leve", 76.0],
      ["Médio", 82.3],
      ["Meio-pesado", 88.3],
      ["Pesado", 94.3],
      ["Superpesado", 100.5],
      ["Pesadíssimo", null],
    ])
  })

  it("usa os limites femininos da IBJJF", () => {
    expect(WEIGHT_CLASSES_FEMALE.map((c) => [c.label, c.max])).toEqual([
      ["Galo", 48.5],
      ["Pluma", 53.5],
      ["Pena", 58.5],
      ["Leve", 64.0],
      ["Médio", 69.0],
      ["Meio-pesado", 74.0],
      ["Pesado", 79.3],
      ["Superpesado", 85.5],
      ["Pesadíssimo", null],
    ])
  })
})

describe("weightClass — masculino", () => {
  const classe = (weight: number) => weightClass({ weight, gender: GENDER_MALE, ageCategoryId: ADULTO })

  it("classifica pelo peso declarado", () => {
    expect(classe(55)).toBe("Galo")
    expect(classe(62)).toBe("Pluma")
    expect(classe(68)).toBe("Pena")
    expect(classe(74)).toBe("Leve")
    expect(classe(80)).toBe("Médio")
    expect(classe(86)).toBe("Meio-pesado")
    expect(classe(92)).toBe("Pesado")
    expect(classe(98)).toBe("Superpesado")
    expect(classe(130)).toBe("Pesadíssimo")
  })

  it("mantém na categoria quem bate exatamente o limite", () => {
    expect(classe(57.5)).toBe("Galo")
    expect(classe(82.3)).toBe("Médio")
    expect(classe(100.5)).toBe("Superpesado")
  })

  it("sobe de categoria quem passa do limite por pouco", () => {
    expect(classe(57.6)).toBe("Pluma")
    expect(classe(82.4)).toBe("Meio-pesado")
    expect(classe(100.6)).toBe("Pesadíssimo")
  })
})

describe("weightClass — feminino", () => {
  const classe = (weight: number) => weightClass({ weight, gender: GENDER_FEMALE, ageCategoryId: ADULTO })

  it("usa limites menores que os masculinos", () => {
    expect(classe(55)).toBe("Pena")
    expect(classe(64)).toBe("Leve")
    expect(classe(80)).toBe("Superpesado")
    expect(classe(90)).toBe("Pesadíssimo")
  })

  it("mantém na categoria quem bate exatamente o limite", () => {
    expect(classe(48.5)).toBe("Galo")
    expect(classe(79.3)).toBe("Pesado")
  })

  it("classifica o mesmo peso diferente de um homem", () => {
    const peso = 62
    expect(weightClass({ weight: peso, gender: GENDER_FEMALE, ageCategoryId: ADULTO })).toBe("Leve")
    expect(weightClass({ weight: peso, gender: GENDER_MALE, ageCategoryId: ADULTO })).toBe("Pluma")
  })
})

describe("weightClass — quando não dá para classificar", () => {
  it("sem peso", () => {
    expect(weightClass({ gender: GENDER_MALE, ageCategoryId: ADULTO })).toBeNull()
  })

  it("sem sexo no cadastro", () => {
    expect(weightClass({ weight: 80, ageCategoryId: ADULTO })).toBeNull()
  })

  it("categoria infantil, que tem tabela própria ainda não cadastrada", () => {
    const infantil = categoryFromBirthDate("2017-05-01").id
    expect(weightClass({ weight: 28, gender: GENDER_MALE, ageCategoryId: infantil })).toBeNull()
  })

  it("categoria juvenil", () => {
    const juvenil = categoryFromBirthDate("2010-01-20").id
    expect(weightClass({ weight: 60, gender: GENDER_FEMALE, ageCategoryId: juvenil })).toBeNull()
  })
})

describe("hasAdultWeightTable", () => {
  it("vale do Adulto para cima", () => {
    expect(hasAdultWeightTable(categoryFromBirthDate("1992-10-25").id)).toBe(true) // Adulto/Master
    expect(hasAdultWeightTable(categoryFromBirthDate("1980-01-01").id)).toBe(true) // Master
  })

  it("não vale para juvenil e infantil", () => {
    expect(hasAdultWeightTable(categoryFromBirthDate("2010-01-20").id)).toBe(false)
    expect(hasAdultWeightTable(categoryFromBirthDate("2017-05-01").id)).toBe(false)
  })
})
