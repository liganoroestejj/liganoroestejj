// Opções de filiação. Salvamos sempre o índice (número) e exibimos o rótulo
// em português. Estado é exceção: salva a sigla (UF).

export const GENDER_LABELS: Record<number, string> = {
  1: "Masculino",
  2: "Feminino",
}

export const BELT_LABELS: Record<number, string> = {
  1: "Branca",
  2: "Cinza",
  3: "Amarela",
  4: "Laranja",
  5: "Verde",
  6: "Azul",
  7: "Roxa",
  8: "Marrom",
  9: "Preta",
}

export const ROLE_LABELS: Record<number, string> = {
  1: "Atleta",
  2: "Professor",
}

// Academias disponíveis. Por enquanto apenas uma.
export const ACADEMIES: { id: number; name: string }[] = [
  { id: 1, name: "Up Fight House" },
]

// Siglas de estados (UF).
export const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]

// Divisão oficial por idade da Liga. Calculada pela data de nascimento.
// Faixas contíguas de 4 a 200 anos (registro exige idade mínima de 4 — ver
// MIN_AGE no Cadastro). Obs.: a regra de competição "a partir de 16 anos pode
// lutar no Adulto (branca só 18+)" é elegibilidade de disputa, não a categoria
// de idade do atleta — aqui guardamos sempre a categoria pela idade real.
export const CATEGORY_RANGES: { id: number; label: string; min: number; max: number }[] = [
  { id: 1, label: "Pré-Mirim", min: 4, max: 5 },
  { id: 2, label: "Mirim", min: 6, max: 7 },
  { id: 3, label: "Infantil A", min: 8, max: 9 },
  { id: 4, label: "Infantil B", min: 10, max: 11 },
  { id: 5, label: "Infanto A", min: 12, max: 13 },
  { id: 6, label: "Infanto B", min: 14, max: 15 },
  { id: 7, label: "Juvenil", min: 16, max: 17 },
  { id: 8, label: "Adulto", min: 18, max: 29 },
  { id: 9, label: "Master 1", min: 30, max: 35 },
  { id: 10, label: "Master 2", min: 36, max: 40 },
  { id: 11, label: "Master 3", min: 41, max: 45 },
  { id: 12, label: "Master 4", min: 46, max: 50 },
  { id: 13, label: "Master 5", min: 51, max: 55 },
  { id: 14, label: "Master 6", min: 56, max: 200 },
]

/** Idade em anos a partir de uma data ISO (yyyy-mm-dd). */
export function ageFromBirthDate(iso: string): number {
  const birth = new Date(iso)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

/** Nome da categoria a partir do índice salvo. */
export function categoryLabelById(id: number): string {
  return CATEGORY_RANGES.find((c) => c.id === id)?.label ?? "—"
}

/** Categoria (id + label) calculada pela data de nascimento. */
export function categoryFromBirthDate(iso: string) {
  const age = ageFromBirthDate(iso)
  const match = CATEGORY_RANGES.find((c) => age >= c.min && age <= c.max)
  if (match) return match
  // Fora das faixas: abaixo da mínima → primeira; acima → última.
  return age < CATEGORY_RANGES[0].min ? CATEGORY_RANGES[0] : CATEGORY_RANGES[CATEGORY_RANGES.length - 1]
}

/**
 * Status efetivo considerando a validade da mensalidade.
 * "active" cuja validade já passou vira "overdue" (deve pagar novamente).
 */
export function effectiveStatus(status: string, validUntil?: string): string {
  if (status === "active" && validUntil) {
    const today = new Date().toISOString().slice(0, 10)
    if (today > validUntil) return "overdue"
  }
  return status
}

export const MEMBERSHIP_FEE = 30
export const WHATSAPP_PHONE = "5522981436950"
