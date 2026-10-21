import { CATEGORY_RANGES, categoryFromBirthDate } from "./affiliateOptions"
import {
  competitionCategoryLabel,
  FESTIVAL_LABEL,
  GENDER_FEMALE,
  GENDER_MALE,
  hasAdultWeightTable,
  isFestival,
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

  it("classifica os pesos que já estão no sistema", () => {
    // Casos reais da lista de inscritos, conferidos contra a tabela da IBJJF.
    expect(classe(95.3)).toBe("Superpesado") // entre 94,3 e 100,5
    expect(classe(94.3)).toBe("Pesado")      // limite exato do Pesado
    expect(classe(64)).toBe("Pluma")         // limite exato da Pluma
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

  it("sem categoria de idade (cadastro sem nascimento)", () => {
    // Não dá para saber se compete no adulto: classificar seria um chute.
    expect(weightClass({ weight: 80, gender: GENDER_MALE })).toBeNull()
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

describe("competitionCategoryLabel — categoria no campeonato", () => {
  const categoriaDe = (nascimento: string) =>
    competitionCategoryLabel(categoryFromBirthDate(nascimento).id)

  it("chama de Festival quem tem até 9 anos", () => {
    const hoje = new Date()
    const comIdade = (anos: number) =>
      `${hoje.getFullYear() - anos}-01-01`
    expect(categoriaDe(comIdade(5))).toBe(FESTIVAL_LABEL)  // Pré-Mirim
    expect(categoriaDe(comIdade(7))).toBe(FESTIVAL_LABEL)  // Mirim
    expect(categoriaDe(comIdade(9))).toBe(FESTIVAL_LABEL)  // Infantil A
  })

  it("mantém o nome da categoria a partir dos 10 anos", () => {
    const hoje = new Date()
    const comIdade = (anos: number) => `${hoje.getFullYear() - anos}-01-01`
    expect(categoriaDe(comIdade(10))).toBe("Infantil B")
    expect(categoriaDe(comIdade(13))).toBe("Infanto A")
    expect(categoriaDe(comIdade(15))).toBe("Infanto B")
    expect(categoriaDe(comIdade(17))).toBe("Juvenil")
    expect(categoriaDe(comIdade(25))).toBe("Adulto")
  })

  it("devolve traço para categoria inexistente", () => {
    expect(competitionCategoryLabel(999)).toBe("—")
  })
})

describe("isFestival", () => {
  it("vale só para as categorias até 9 anos", () => {
    const hoje = new Date()
    const idDe = (anos: number) => categoryFromBirthDate(`${hoje.getFullYear() - anos}-01-01`).id
    expect(isFestival(idDe(5))).toBe(true)
    expect(isFestival(idDe(9))).toBe(true)
    expect(isFestival(idDe(10))).toBe(false)
    expect(isFestival(idDe(30))).toBe(false)
  })

  it("Festival não tem divisão de peso", () => {
    const hoje = new Date()
    const idFestival = categoryFromBirthDate(`${hoje.getFullYear() - 8}-01-01`).id
    expect(weightClass({ weight: 30, gender: GENDER_MALE, ageCategoryId: idFestival })).toBeNull()
  })
})

/**
 * Varredura das duas tabelas: para CADA categoria confere o limite exato (fica
 * nela) e um décimo acima (sobe para a seguinte). Assim nenhuma faixa fica
 * sem teste, mesmo que a tabela mude no futuro.
 */
describe.each([
  ["masculino", GENDER_MALE, WEIGHT_CLASSES_MALE],
  ["feminino", GENDER_FEMALE, WEIGHT_CLASSES_FEMALE],
] as const)("weightClass — varre a tabela %s", (_nome, gender, tabela) => {
  const classe = (weight: number) => weightClass({ weight, gender, ageCategoryId: ADULTO })

  const comLimite = tabela.filter((c) => c.max !== null)

  it.each(comLimite.map((c) => [c.label, c.max as number]))(
    "%s: o peso máximo (%s kg) fica na categoria",
    (label, max) => {
      expect(classe(max)).toBe(label)
    },
  )

  it.each(
    comLimite.map((c, i) => [c.label, c.max as number, tabela[i + 1].label]),
  )("%s: um décimo acima de %s kg vira %s", (_label, max, proxima) => {
    expect(classe(max + 0.1)).toBe(proxima)
  })

  it("a última categoria não tem limite", () => {
    const ultima = tabela[tabela.length - 1]
    expect(ultima.max).toBeNull()
    expect(classe(300)).toBe(ultima.label)
  })

  it("o peso mínimo aceito cai na primeira categoria", () => {
    expect(classe(10)).toBe(tabela[0].label)
  })
})

describe("Categoria pela data de referência", () => {
  it("usa a idade no dia do evento, não a de hoje", () => {
    // Faz 18 anos em 01/11/2026, entre "hoje" e o dia do evento (08/11).
    const nascimento = "2008-11-01"
    const antes = new Date(2026, 9, 20) // 20/10/2026
    const noEvento = new Date(2026, 10, 8) // 08/11/2026

    expect(competitionCategoryLabel(categoryFromBirthDate(nascimento, antes).id)).toBe("Juvenil")
    expect(competitionCategoryLabel(categoryFromBirthDate(nascimento, noEvento).id)).toBe("Adulto")
  })

  it("quem vira adulto até o evento passa a ter categoria de peso", () => {
    const nascimento = "2008-11-01"
    const antes = new Date(2026, 9, 20)
    const noEvento = new Date(2026, 10, 8)

    expect(weightClass({
      weight: 80,
      gender: GENDER_MALE,
      ageCategoryId: categoryFromBirthDate(nascimento, antes).id,
    })).toBeNull()

    expect(weightClass({
      weight: 80,
      gender: GENDER_MALE,
      ageCategoryId: categoryFromBirthDate(nascimento, noEvento).id,
    })).toBe("Médio")
  })

  it("não antecipa o aniversário por causa do fuso", () => {
    // Nascido em 09/01: no dia 08/01 ainda tem a idade antiga.
    expect(categoryFromBirthDate("2016-01-09", new Date(2026, 0, 8)).label).toBe("Infantil A") // 9 anos
    expect(categoryFromBirthDate("2016-01-09", new Date(2026, 0, 9)).label).toBe("Infantil B") // 10 anos
  })
})

/**
 * Varredura da categoria de idade: confere TODAS as idades de 4 a 60 anos na
 * data do evento, e também a virada — o dia anterior ao aniversário ainda é a
 * categoria antiga. É o que garante que ninguém cai na categoria errada.
 */
describe("Categoria de idade — varredura completa", () => {
  const EVENTO = new Date(2026, 10, 8) // 08/11/2026

  /** Nascimento de quem completa `anos` exatamente no dia do evento. */
  const nascidoPara = (anos: number) => `${2026 - anos}-11-08`

  const esperado: [number, string][] = [
    [4, "Pré-Mirim"], [5, "Pré-Mirim"],
    [6, "Mirim"], [7, "Mirim"],
    [8, "Infantil A"], [9, "Infantil A"],
    [10, "Infantil B"], [11, "Infantil B"],
    [12, "Infanto A"], [13, "Infanto A"],
    [14, "Infanto B"], [15, "Infanto B"],
    [16, "Juvenil"], [17, "Juvenil"],
    [18, "Adulto"], [25, "Adulto"], [29, "Adulto"],
    [30, "Master 1"], [35, "Master 1"],
    [36, "Master 2"], [40, "Master 2"],
    [41, "Master 3"], [45, "Master 3"],
    [46, "Master 4"], [50, "Master 4"],
    [51, "Master 5"], [55, "Master 5"],
    [56, "Master 6"], [60, "Master 6"],
  ]

  it.each(esperado)("%s anos no dia do evento → %s", (anos, categoria) => {
    expect(categoryFromBirthDate(nascidoPara(anos), EVENTO).label).toBe(categoria)
  })

  it.each(esperado)("%s anos: um dia antes do aniversário ainda é a categoria anterior", (anos) => {
    // Nasceu em 09/11: no dia 08/11 ainda não fez aniversário.
    const vesperaDoAniversario = `${2026 - anos}-11-09`
    const idadeNoEvento = anos - 1
    const faixa = CATEGORY_RANGES.find((c) => idadeNoEvento >= c.min && idadeNoEvento <= c.max)
    if (!faixa) return // abaixo da idade mínima de cadastro
    expect(categoryFromBirthDate(vesperaDoAniversario, EVENTO).label).toBe(faixa.label)
  })

  it("as faixas de idade são contíguas, sem buraco nem sobreposição", () => {
    const ordenadas = [...CATEGORY_RANGES].sort((a, b) => a.min - b.min)
    ordenadas.forEach((faixa, i) => {
      if (i === 0) return
      expect(faixa.min).toBe(ordenadas[i - 1].max + 1)
    })
  })

  it("toda idade de 4 a 60 cai em exatamente uma categoria", () => {
    for (let idade = 4; idade <= 60; idade++) {
      const faixas = CATEGORY_RANGES.filter((c) => idade >= c.min && idade <= c.max)
      expect(faixas).toHaveLength(1)
    }
  })
})
