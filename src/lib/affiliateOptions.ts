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

// Categorias por faixa etária. PLACEHOLDER — ajustar quando o cliente
// enviar a tabela oficial. Calculada pela data de nascimento.
export const CATEGORY_RANGES: { id: number; label: string; min: number; max: number }[] = [
  { id: 1, label: "Infantil (até 17 anos)", min: 0, max: 17 },
  { id: 2, label: "Adulto (18 a 29 anos)", min: 18, max: 29 },
  { id: 3, label: "Master (30 anos ou mais)", min: 30, max: 200 },
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
  return (
    CATEGORY_RANGES.find((c) => age >= c.min && age <= c.max) ??
    CATEGORY_RANGES[CATEGORY_RANGES.length - 1]
  )
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
