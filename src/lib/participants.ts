import { collection, doc, getDoc, getDocs, limit, query, setDoc, where, writeBatch } from "firebase/firestore"
import { db } from "./firebase"
import { categoryFromBirthDate } from "./affiliateOptions"
import { ageOnDate, getRegistration, PADUA_EVENT_ID, type Registration } from "./registrations"
import { competitionCategoryLabel, weightClass } from "./weightClasses"
import { getEventById, getEventDate } from "../data/events"

/**
 * Lista de inscritos do Open Pádua (pagos e pendentes; removidos não),
 * visível para qualquer atleta inscrito. Filiações e inscrições são privadas
 * (só o dono e o admin leem, e o id delas é o CPF), então aqui fica só o que
 * pode ser mostrado entre atletas — sem CPF, sem contato, sem data de
 * nascimento e sem foto.
 *
 * Duas fontes mantêm a lista: o próprio atleta publica a sua linha ao abrir a
 * lista (assim quem acabou de se inscrever já aparece), e o admin, ao abrir a
 * aba de inscrições, deixa tudo em dia e tira quem foi removido.
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
    age: a.birthDate ? ageOnDate(a.birthDate, eventDate) : null,
    categoryId,
    category: categoryId === null ? null : competitionCategoryLabel(categoryId),
    weightClass: weightClass({ weight: reg.weight, gender: a.gender, ageCategoryId: categoryId ?? undefined }),
  }
}

/** Quem deve estar na lista: inscrição não removida cuja filiação ainda existe. */
export function expectedParticipants(
  regs: Registration[],
  affiliates: AffiliateInfo[],
  eventDate: Date,
): Participant[] {
  const porCpf = new Map(affiliates.map((a) => [a.cpf, a]))
  return regs.flatMap((r) => {
    const a = porCpf.get(r.cpf)
    return r.status !== "removed" && a ? [buildParticipant(r, a, eventDate)] : []
  })
}

/** Data do Open Pádua: idade e categoria valem por ela. */
export function paduaEventDate(): Date {
  const evento = getEventById(PADUA_EVENT_ID)
  return (evento && getEventDate(evento)) ?? new Date()
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

/**
 * A linha do próprio atleta logado, se ele tiver inscrição ativa — ou null.
 * De quebra libera a leitura da lista para ele (PADUA_VIEWERS): quem acabou de
 * se inscrever não depende do admin abrir a aba de inscrições. A regra do
 * Firestore confere a inscrição antes de aceitar.
 */
export async function prepareSelf(uid: string): Promise<Participant | null> {
  const snap = await getDocs(query(collection(db, "affiliates"), where("uid", "==", uid), limit(1)))
  if (snap.empty) return null
  const filiado = snap.docs[0].data() as AffiliateInfo
  const reg = await getRegistration(filiado.cpf)
  if (!reg || reg.status === "removed") return null
  const viewer = await getDoc(doc(db, PADUA_VIEWERS, uid))
  if (!viewer.exists()) await setDoc(doc(db, PADUA_VIEWERS, uid), { uid, cpf: filiado.cpf })
  return buildParticipant(reg, { ...filiado, uid }, paduaEventDate())
}

/**
 * Garante que a linha do atleta está na lista e atualizada (nome, faixa, academia
 * que ele mudou no painel). Devolve a lista já com ela.
 */
export async function ensureListed(eu: Participant, lista: Participant[]): Promise<Participant[]> {
  if (sameParticipant(lista.find((p) => p.uid === eu.uid), eu)) return lista
  await setDoc(doc(db, PADUA_PARTICIPANTS, eu.uid), eu)
  return [...lista.filter((p) => p.uid !== eu.uid), eu]
}

/**
 * Coloca o atleta logado na lista, sem precisar abri-la: chamado ao se
 * inscrever e ao abrir o Painel, para que os outros já o vejam. Sem inscrição
 * ativa não faz nada.
 */
export async function publishSelf(uid: string): Promise<void> {
  const eu = await prepareSelf(uid)
  if (eu) await setDoc(doc(db, PADUA_PARTICIPANTS, eu.uid), eu)
}

/** Todos os inscritos — só um inscrito (ou o admin) consegue listar. */
export async function listParticipants(): Promise<Participant[]> {
  const snap = await getDocs(collection(db, PADUA_PARTICIPANTS))
  return snap.docs.map((d) => d.data() as Participant)
}

// Limite de operações por lote do Firestore.
const BATCH_LIMIT = 500

/**
 * Deixa a lista pública igual ao que as inscrições dizem (ação do admin):
 * publica quem se inscreveu, tira quem foi removido, e
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
  "uid", "fullName", "academyId", "belt", "gender", "age", "categoryId", "category", "weightClass",
]

// Conta os campos também: um doc antigo com campo a mais (a foto, que saiu da
// lista) é regravado e perde esse campo.
function sameParticipant(a: Participant | undefined, b: Participant): boolean {
  return !!a
    && Object.keys(a).length === CAMPOS.length
    && CAMPOS.every((k) => (a[k] ?? null) === (b[k] ?? null))
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
