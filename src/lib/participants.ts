import { collection, doc, getDoc, getDocs, writeBatch } from "firebase/firestore"
import { db } from "./firebase"
import { categoryFromBirthDate } from "./affiliateOptions"
import { ageOnDate, type Registration } from "./registrations"
import { competitionCategoryLabel, weightClass } from "./weightClasses"

/**
 * Lista de inscritos com pagamento confirmado no Open Pádua, visível para os
 * próprios inscritos pagos. Filiações e inscrições são privadas (só o dono e o
 * admin leem, e o id delas é o CPF), então quem monta esta lista é o admin: ao
 * abrir a aba de inscrições, ele publica aqui só o que pode ser mostrado entre
 * atletas — sem CPF, sem contato, sem data de nascimento.
 *
 * O id do doc é o uid do atleta: é assim que a regra do Firestore sabe se
 * quem está lendo também é um inscrito pago.
 */
export const PADUA_PARTICIPANTS = "paduaParticipants"

export interface Participant {
  uid: string
  fullName: string
  academyId: number
  belt: number
  gender: number | null
  photoURL: string | null
  /** Idade no dia do evento. */
  age: number | null
  /** Categoria de idade no dia do evento (id de CATEGORY_RANGES). */
  categoryId: number | null
  /** Nome da categoria no campeonato (até 9 anos é tudo Festival). */
  category: string | null
  /** Categoria de peso (só Adulto e Master têm tabela). */
  weightClass: string | null
}

/** Dados da filiação que entram na lista (subconjunto de AdminAffiliate). */
interface AffiliateInfo {
  cpf: string
  uid: string
  fullName: string
  academyId: number
  belt: number
  gender?: number
  photoURL?: string
  birthDate?: string
}

/** Monta a linha pública de um inscrito, com idade e categoria do dia do evento. */
export function buildParticipant(reg: Registration, a: AffiliateInfo, eventDate: Date): Participant {
  const categoryId = a.birthDate ? categoryFromBirthDate(a.birthDate, eventDate).id : null
  return {
    // O uid da filiação é o do login atual; o da inscrição é o do dia em que
    // ela foi feita. Normalmente são o mesmo.
    uid: a.uid || reg.uid,
    fullName: a.fullName,
    academyId: a.academyId,
    belt: a.belt,
    gender: a.gender ?? null,
    photoURL: a.photoURL ?? null,
    age: a.birthDate ? ageOnDate(a.birthDate, eventDate) : null,
    categoryId,
    category: categoryId === null ? null : competitionCategoryLabel(categoryId),
    weightClass: weightClass({ weight: reg.weight, gender: a.gender, ageCategoryId: categoryId ?? undefined }),
  }
}

/** Quem deve estar na lista: inscrição paga cuja filiação ainda existe. */
export function expectedParticipants(
  regs: Registration[],
  affiliates: AffiliateInfo[],
  eventDate: Date,
): Participant[] {
  const porCpf = new Map(affiliates.map((a) => [a.cpf, a]))
  return regs.flatMap((r) => {
    const a = porCpf.get(r.cpf)
    return r.status === "paid" && a ? [buildParticipant(r, a, eventDate)] : []
  })
}

/** O inscrito logado está na lista (inscrição paga)? */
export async function isParticipant(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, PADUA_PARTICIPANTS, uid))
  return snap.exists()
}

/** Todos os inscritos pagos — só um inscrito pago (ou o admin) consegue listar. */
export async function listParticipants(): Promise<Participant[]> {
  const snap = await getDocs(collection(db, PADUA_PARTICIPANTS))
  return snap.docs.map((d) => d.data() as Participant)
}

// Limite de operações por lote do Firestore.
const BATCH_LIMIT = 500

/**
 * Deixa a lista pública igual ao que as inscrições dizem (ação do admin):
 * publica quem pagou, tira quem deixou de estar pago ou foi removido, e
 * atualiza nome/faixa/academia que mudaram na filiação. Só grava o que mudou.
 */
export async function syncParticipants(expected: Participant[]): Promise<void> {
  const atuais = new Map((await listParticipants()).map((p) => [p.uid, p]))
  const esperados = new Map(expected.map((p) => [p.uid, p]))

  const ops: ((b: ReturnType<typeof writeBatch>) => void)[] = []
  for (const p of esperados.values()) {
    if (!sameParticipant(atuais.get(p.uid), p)) {
      ops.push((b) => b.set(doc(db, PADUA_PARTICIPANTS, p.uid), p))
    }
  }
  for (const uid of atuais.keys()) {
    if (!esperados.has(uid)) ops.push((b) => b.delete(doc(db, PADUA_PARTICIPANTS, uid)))
  }

  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db)
    ops.slice(i, i + BATCH_LIMIT).forEach((op) => op(batch))
    await batch.commit()
  }
}

const CAMPOS: (keyof Participant)[] = [
  "uid", "fullName", "academyId", "belt", "gender", "photoURL", "age", "categoryId", "category", "weightClass",
]

function sameParticipant(a: Participant | undefined, b: Participant): boolean {
  return !!a && CAMPOS.every((k) => (a[k] ?? null) === (b[k] ?? null))
}

/**
 * Categorias presentes na lista, na ordem de idade. O Festival junta três
 * categorias de idade, então a ordem é pelo menor id de cada nome.
 */
export function categoryOptions(list: Participant[]): string[] {
  const menorId = new Map<string, number>()
  for (const p of list) {
    if (p.category === null || p.categoryId === null) continue
    menorId.set(p.category, Math.min(menorId.get(p.category) ?? Infinity, p.categoryId))
  }
  return [...menorId.entries()].sort((a, b) => a[1] - b[1]).map(([c]) => c)
}

/** Idades presentes na lista, em ordem crescente. */
export function ageOptions(list: Participant[]): number[] {
  return [...new Set(list.flatMap((p) => (p.age === null ? [] : [p.age])))].sort((a, b) => a - b)
}

/** Ordena por categoria (idade) e depois por nome. */
export function sortParticipants(list: Participant[]): Participant[] {
  return [...list].sort(
    (a, b) =>
      (a.categoryId ?? Infinity) - (b.categoryId ?? Infinity) ||
      a.fullName.localeCompare(b.fullName, "pt-BR"),
  )
}
