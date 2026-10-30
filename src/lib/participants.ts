import { collection, doc, getDoc, getDocs, limit, query, setDoc, where, writeBatch } from "firebase/firestore"
import { db } from "./firebase"
import { categoryFromBirthDate } from "./affiliateOptions"
import { ageOnDate, getRegistration, type Registration } from "./registrations"
import { competitionCategoryLabel, weightClass } from "./weightClasses"

/**
 * Lista de inscritos com pagamento confirmado no Open Pádua, visível para
 * qualquer atleta inscrito (pago ou pendente). Filiações e inscrições são privadas (só o dono e o
 * admin leem, e o id delas é o CPF), então quem monta esta lista é o admin: ao
 * abrir a aba de inscrições, ele publica aqui só o que pode ser mostrado entre
 * atletas — sem CPF, sem contato, sem data de nascimento.
 *
 * O id do doc é o uid do atleta. Quem pode ler é decidido por PADUA_VIEWERS.
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

/**
 * Quem pode VER a lista: qualquer atleta inscrito, pago ou não (removido não).
 * A regra do Firestore só conhece o uid de quem lê, e a inscrição é guardada
 * pelo CPF — este doc, com id = uid, é a ponte. Só o dono e o admin leem.
 */
export const PADUA_VIEWERS = "paduaViewers"

export interface Viewer {
  uid: string
  cpf: string
}

/** Quem pode ver a lista: inscrição não removida cuja filiação ainda existe. */
export function expectedViewers(regs: Registration[], affiliates: AffiliateInfo[]): Viewer[] {
  const porCpf = new Map(affiliates.map((a) => [a.cpf, a]))
  return regs.flatMap((r) => {
    const a = porCpf.get(r.cpf)
    return r.status !== "removed" && a ? [{ uid: a.uid || r.uid, cpf: r.cpf }] : []
  })
}

/** O atleta logado já está liberado para ver a lista? */
export async function isViewer(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, PADUA_VIEWERS, uid))
  return snap.exists()
}

/**
 * Libera a lista para o próprio atleta, se ele tiver inscrição ativa. Assim
 * quem acabou de se inscrever não depende do admin abrir a aba de inscrições.
 * A regra do Firestore confere a inscrição antes de aceitar.
 */
export async function ensureViewer(uid: string): Promise<boolean> {
  const snap = await getDocs(query(collection(db, "affiliates"), where("uid", "==", uid), limit(1)))
  if (snap.empty) return false
  const cpf = (snap.docs[0].data() as { cpf: string }).cpf
  const reg = await getRegistration(cpf)
  if (!reg || reg.status === "removed") return false
  await setDoc(doc(db, PADUA_VIEWERS, uid), { uid, cpf })
  return true
}

/** O inscrito logado está na lista (inscrição paga)? */
export async function isParticipant(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, PADUA_PARTICIPANTS, uid))
  return snap.exists()
}

/** Todos os inscritos pagos — só um inscrito (ou o admin) consegue listar. */
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

/**
 * Mesma ideia de syncParticipants para quem pode ver a lista (ação do admin):
 * libera quem se inscreveu e tira quem teve a inscrição removida.
 */
export async function syncViewers(expected: Viewer[]): Promise<void> {
  const snap = await getDocs(collection(db, PADUA_VIEWERS))
  const atuais = new Map(snap.docs.map((d) => [d.id, d.data() as Viewer]))
  const esperados = new Map(expected.map((v) => [v.uid, v]))

  const ops: ((b: ReturnType<typeof writeBatch>) => void)[] = []
  for (const v of esperados.values()) {
    const atual = atuais.get(v.uid)
    if (!atual || atual.cpf !== v.cpf) ops.push((b) => b.set(doc(db, PADUA_VIEWERS, v.uid), v))
  }
  for (const uid of atuais.keys()) {
    if (!esperados.has(uid)) ops.push((b) => b.delete(doc(db, PADUA_VIEWERS, uid)))
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
