import { CATEGORY_RANGES } from "./affiliateOptions"

/**
 * Categorias de peso (Gi) do Adulto e do Master, nos limites usados pela
 * IBJJF em 2026. O valor é o PESO MÁXIMO da categoria: quem bate exatamente o
 * limite ainda está nela; acima disso sobe para a próxima.
 *
 * As categorias infantis e juvenis têm tabela própria, que a Liga ainda não
 * cadastrou — por isso a classificação só vale do Adulto para cima.
 */
export interface WeightClass {
  label: string
  /** Peso máximo em kg. `null` no Pesadíssimo, que não tem limite. */
  max: number | null
}

export const WEIGHT_CLASSES_MALE: WeightClass[] = [
  { label: "Galo", max: 57.5 },
  { label: "Pluma", max: 64.0 },
  { label: "Pena", max: 70.0 },
  { label: "Leve", max: 76.0 },
  { label: "Médio", max: 82.3 },
  { label: "Meio-pesado", max: 88.3 },
  { label: "Pesado", max: 94.3 },
  { label: "Superpesado", max: 100.5 },
  { label: "Pesadíssimo", max: null },
]

export const WEIGHT_CLASSES_FEMALE: WeightClass[] = [
  { label: "Galo", max: 48.5 },
  { label: "Pluma", max: 53.5 },
  { label: "Pena", max: 58.5 },
  { label: "Leve", max: 64.0 },
  { label: "Médio", max: 69.0 },
  { label: "Meio-pesado", max: 74.0 },
  { label: "Pesado", max: 79.3 },
  { label: "Superpesado", max: 85.5 },
  { label: "Pesadíssimo", max: null },
]

/** 1 = masculino, 2 = feminino (mesma convenção de GENDER_LABELS). */
export const GENDER_MALE = 1
export const GENDER_FEMALE = 2

/** Idade a partir da qual vale a tabela adulta (Adulto e Masters). */
const MIN_ADULT_AGE = 18

/** A tabela adulta vale para esta categoria de idade? */
export function hasAdultWeightTable(categoryId: number): boolean {
  const faixa = CATEGORY_RANGES.find((c) => c.id === categoryId)
  return !!faixa && faixa.min >= MIN_ADULT_AGE
}

export function weightClassesFor(gender: number): WeightClass[] | null {
  if (gender === GENDER_MALE) return WEIGHT_CLASSES_MALE
  if (gender === GENDER_FEMALE) return WEIGHT_CLASSES_FEMALE
  return null
}

/**
 * Categoria de peso do atleta, pelo peso declarado e pelo sexo. Devolve null
 * quando falta informação ou quando a categoria de idade não usa a tabela
 * adulta (infantil e juvenil têm limites próprios).
 */
export function weightClass(params: {
  weight?: number
  gender?: number
  ageCategoryId?: number
}): string | null {
  const { weight, gender, ageCategoryId } = params
  if (!weight || !gender) return null
  if (ageCategoryId !== undefined && !hasAdultWeightTable(ageCategoryId)) return null

  const tabela = weightClassesFor(gender)
  if (!tabela) return null

  const faixa = tabela.find((c) => c.max === null || weight <= c.max)
  return faixa?.label ?? null
}
