import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"
import { db } from "./firebase"
import { cleanCpf } from "./cpf"

/**
 * Inscrições do campeonato de Santo Antônio de Pádua (2ª etapa).
 * O documento guarda só o vínculo (CPF/uid), a data e o pagamento: os dados do
 * atleta vêm sempre da filiação, buscados pelo CPF, para a lista do admin
 * refletir faixa, academia e categoria atualizadas no dia do evento.
 */
export const PADUA_COLLECTION = "paduaRegistrations"

/** Id do evento (em data/events) a que estas inscrições pertencem. */
export const PADUA_EVENT_ID = "2"

/** Valor da inscrição por idade (no dia do evento). */
export const FEE_UP_TO_9 = 100
export const FEE_FROM_10 = 120
const FEE_AGE_LIMIT = 9

export type RegistrationStatus = "pending" | "paid" | "removed"

export interface Registration {
  cpf: string
  uid: string
  status: RegistrationStatus
  fee: number
  createdAt?: { seconds: number } | null
  /** Quando o admin confirmou o pagamento. */
  paidAt?: { seconds: number } | null
}

/**
 * Idade que o atleta terá na data de referência (o dia do evento).
 * A data de nascimento é lida pelos componentes do ISO, e não por `new Date`:
 * a string "yyyy-mm-dd" é interpretada como UTC e, no fuso do Brasil, o
 * aniversário cairia um dia antes — quem nasceu em 09/11 passaria a contar a
 * idade nova já no dia 08/11, mudando o valor da inscrição.
 */
export function ageOnDate(birthDateIso: string, onDate: Date): number {
  const [ano, mes, dia] = birthDateIso.split("-").map(Number)
  if (!ano || !mes || !dia) return 0
  let age = onDate.getFullYear() - ano
  const m = onDate.getMonth() + 1 - mes
  if (m < 0 || (m === 0 && onDate.getDate() < dia)) age--
  return age
}

/** Até 9 anos no dia do evento paga R$ 100; de 10 anos em diante, R$ 120. */
export function registrationFee(birthDateIso: string, onDate: Date): number {
  return ageOnDate(birthDateIso, onDate) <= FEE_AGE_LIMIT ? FEE_UP_TO_9 : FEE_FROM_10
}

/** Inscrição do atleta neste campeonato, ou null se ainda não se inscreveu. */
export async function getRegistration(cpf: string): Promise<Registration | null> {
  const snap = await getDoc(doc(db, PADUA_COLLECTION, cleanCpf(cpf)))
  return snap.exists() ? (snap.data() as Registration) : null
}

/**
 * Cria a inscrição, que nasce pendente — quem confirma o pagamento é o admin,
 * mesmo esquema da filiação. Se já existir, devolve a que está lá sem
 * sobrescrever (o id é o CPF, então reabrir a tela não duplica nem reverte um
 * pagamento já confirmado).
 */
export async function createRegistration(params: {
  cpf: string
  uid: string
  fee: number
}): Promise<Registration> {
  const cpf = cleanCpf(params.cpf)
  const existente = await getRegistration(cpf)
  if (existente) return existente

  const nova: Registration = {
    cpf,
    uid: params.uid,
    status: "pending",
    fee: params.fee,
  }
  await setDoc(doc(db, PADUA_COLLECTION, cpf), { ...nova, createdAt: serverTimestamp() })
  return nova
}

/** Todas as inscrições do campeonato — só o admin consegue listar. */
export async function listRegistrations(): Promise<Registration[]> {
  const snap = await getDocs(collection(db, PADUA_COLLECTION))
  return snap.docs.map((d) => d.data() as Registration)
}

/** Confirma (ou desfaz) o pagamento da inscrição. Exclusivo do admin. */
export async function setRegistrationPaid(cpf: string, pago: boolean) {
  await updateDoc(doc(db, PADUA_COLLECTION, cleanCpf(cpf)), {
    status: pago ? "paid" : "pending",
    paidAt: pago ? serverTimestamp() : null,
  })
}

/**
 * Remove a inscrição sem apagar (ação do admin): ela sai da lista normal e
 * fica na lista "Removidas", de onde pode voltar — mesmo comportamento da
 * remoção de atleta na lista de filiados.
 */
export async function removeRegistration(cpf: string) {
  await updateDoc(doc(db, PADUA_COLLECTION, cleanCpf(cpf)), {
    status: "removed",
    // Uma inscrição removida não fica paga: se voltar, volta a dever.
    paidAt: null,
  })
}

/** Devolve a inscrição à lista, sempre como pendente de pagamento. */
export async function reactivateRegistration(cpf: string) {
  await updateDoc(doc(db, PADUA_COLLECTION, cleanCpf(cpf)), {
    status: "pending",
    paidAt: null,
  })
}
