import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth"
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
import { cleanCpf } from "./cpf"
import { compressSquareImage } from "./image"
import { uploadToCloudinary } from "./cloudinary"
import { categoryFromBirthDate, MEMBERSHIP_FEE } from "./affiliateOptions"

export interface AffiliateInput {
  cpf: string
  birthDate: string // yyyy-mm-dd
  gender: number
  fullName: string
  email: string
  instagram: string
  phone: string
  address: string
  neighborhood: string
  zipCode: string
  city: string
  state: string // UF
  academyId: number
  belt: number
  role: number
  password: string
}

/** Mês atual no formato yyyy-mm. */
function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

/** Data local no formato ISO yyyy-mm-dd (sem deslocamento de fuso). */
function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/**
 * Nova validade da mensalidade ao confirmar um pagamento.
 * Se a filiação ainda está vigente (validade futura), soma 1 mês a partir
 * dela — o atleta não perde os dias que já pagou. Caso contrário (primeira
 * ativação ou em atraso), conta 1 mês a partir de hoje.
 */
function nextValidUntil(currentValidUntil?: string): string {
  const today = toISODate(new Date())
  const base = currentValidUntil && currentValidUntil > today ? currentValidUntil : today
  const d = new Date(`${base}T00:00:00`)
  d.setMonth(d.getMonth() + 1)
  return toISODate(d)
}

/** Dados públicos da carteirinha (sem informação sensível). */
export interface PublicCard {
  uid: string
  cpf: string
  fullName: string
  academyId: number
  belt: number
  status: string
  photoURL?: string
  birthDate?: string // NEW-04: exibido na carteirinha validada via QR
  validUntil: string
}

/**
 * Verifica se já existe filiação para o CPF informado.
 * Usa a coleção pública de índice `cpfRegistry` (não expõe dados pessoais),
 * permitindo a checagem na Etapa 1 antes do usuário ter conta.
 */
export async function cpfAlreadyRegistered(cpf: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "cpfRegistry", cleanCpf(cpf)))
  return snap.exists()
}

/**
 * Cria a conta de acesso e grava a filiação + primeira mensalidade pendente.
 * O doc da filiação usa o CPF como id (garante unicidade).
 */
export async function registerAffiliate(input: AffiliateInput) {
  const cpf = cleanCpf(input.cpf)
  const category = categoryFromBirthDate(input.birthDate)

  const cred = await createUserWithEmailAndPassword(auth, input.email, input.password)
  await updateProfile(cred.user, { displayName: input.fullName })

  // E-mail de confirmação de cadastro (nativo do Firebase Auth, gratuito).
  // Falha silenciosa: se o envio não sair, a filiação não pode ser bloqueada.
  try {
    await sendEmailVerification(cred.user)
  } catch {
    // Ignora: o cadastro já foi criado; o e-mail é só uma conveniência.
  }

  // Gravação da filiação — a ÚNICA escrita crítica. Se ela falhar, a conta de
  // acesso recém-criada fica órfã (login sem filiação, e-mail "preso"): então
  // revertemos apagando essa conta, liberando o e-mail para uma nova tentativa
  // limpa. Não usamos Cloud Functions — o rollback é feito aqui no cliente.
  // A carteirinha (cardId/publicCard) só é gerada após o 1º pagamento confirmado.
  try {
    await setDoc(doc(db, "affiliates", cpf), {
      uid: cred.user.uid,
      cpf,
      fullName: input.fullName,
      birthDate: input.birthDate,
      gender: input.gender,
      email: input.email,
      instagram: input.instagram,
      phone: input.phone,
      address: input.address,
      neighborhood: input.neighborhood,
      zipCode: input.zipCode,
      city: input.city,
      state: input.state,
      academyId: input.academyId,
      belt: input.belt,
      category: category.id,
      role: input.role,
      status: "pending",
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    await cred.user.delete().catch(() => { /* melhor esforço */ })
    throw err
  }

  // Escritas secundárias: a filiação já existe, então uma falha aqui NÃO deve
  // reverter nem bloquear o cadastro. A mensalidade é recriada pelo admin ao
  // confirmar o pagamento (setDoc com merge); o índice de CPF é reforçado pelo
  // id do doc da filiação (= CPF) + regras, que impedem duplicidade real.
  const month = currentMonth()
  try {
    await setDoc(doc(db, "affiliates", cpf, "payments", month), {
      month,
      amount: MEMBERSHIP_FEE,
      status: "pending",
      method: "whatsapp",
      createdAt: serverTimestamp(),
    })
    // Índice público de CPFs (só existência) para a checagem da Etapa 1.
    await setDoc(doc(db, "cpfRegistry", cpf), { createdAt: serverTimestamp() })
  } catch {
    // Ignora: secundárias, recuperáveis. A filiação já foi registrada.
  }

  return { cpf, uid: cred.user.uid }
}

/**
 * Comprime e envia a foto de perfil para o Cloudinary e salva a photoURL
 * na filiação e no card público (para a carteirinha/validação).
 */
export async function uploadProfilePhoto(uid: string, cpf: string, file: File, cardId?: string) {
  const blob = await compressSquareImage(file)
  const photoURL = await uploadToCloudinary(blob, `profilePhotos/${uid}`)
  await updateDoc(doc(db, "affiliates", cleanCpf(cpf)), { photoURL })
  if (cardId) await updateDoc(doc(db, "publicCards", cardId), { photoURL })
  return photoURL
}

export interface AffiliateCardData {
  uid: string
  fullName: string
  academyId: number
  belt: number
  photoURL?: string
  birthDate?: string
  cardId?: string
  validUntil?: string // validade atual, para renovar sem perder dias pagos
}

/**
 * Confirma o pagamento de uma mensalidade (ação do admin).
 * Marca o pagamento como pago, ativa a filiação, define a validade
 * (1 mês a partir de hoje) e gera/atualiza a carteirinha pública.
 */
export async function confirmPayment(params: {
  cpf: string
  month: string
  adminUid: string
  affiliate: AffiliateCardData
}): Promise<{ cardId: string; validUntil: string }> {
  const cpf = cleanCpf(params.cpf)
  const validUntil = nextValidUntil(params.affiliate.validUntil)
  const cardId = params.affiliate.cardId ?? crypto.randomUUID()

  await setDoc(doc(db, "affiliates", cpf, "payments", params.month), {
    month: params.month,
    amount: MEMBERSHIP_FEE,
    status: "paid",
    method: "whatsapp",
    paidAt: serverTimestamp(),
    confirmedBy: params.adminUid,
  }, { merge: true })

  await updateDoc(doc(db, "affiliates", cpf), {
    status: "active",
    validUntil,
    cardId,
    lastPaymentAt: serverTimestamp(),
  })

  const card: PublicCard = {
    uid: params.affiliate.uid,
    cpf,
    fullName: params.affiliate.fullName,
    academyId: params.affiliate.academyId,
    belt: params.affiliate.belt,
    status: "active",
    photoURL: params.affiliate.photoURL ?? "",
    birthDate: params.affiliate.birthDate ?? "",
    validUntil,
  }
  await setDoc(doc(db, "publicCards", cardId), card)

  return { cardId, validUntil }
}

/** Lê o registro público de uma carteirinha pelo cardId (validação via QR). */
export async function getPublicCard(cardId: string): Promise<PublicCard | null> {
  const snap = await getDoc(doc(db, "publicCards", cardId))
  return snap.exists() ? (snap.data() as PublicCard) : null
}

export interface AdminAffiliate {
  cpf: string
  uid: string
  fullName: string
  academyId: number
  belt: number
  role: number
  status: string
  photoURL?: string
  birthDate?: string
  validUntil?: string
  cardId?: string
  lastPaymentAt?: { seconds: number } | null
}

/** Ajusta manualmente a validade da mensalidade (admin). */
export async function adminSetValidUntil(cpf: string, validUntil: string, cardId?: string) {
  await updateDoc(doc(db, "affiliates", cleanCpf(cpf)), { validUntil })
  if (cardId) await updateDoc(doc(db, "publicCards", cardId), { validUntil })
}

/**
 * Remoção lógica (soft delete) de um filiado — ação do admin.
 * Preserva o registro (e o histórico de competições), apenas marca como
 * inativo. A carteirinha pública é invalidada.
 */
export async function adminSoftDelete(cpf: string, cardId?: string) {
  const id = cleanCpf(cpf)
  await updateDoc(doc(db, "affiliates", id), {
    status: "inactive",
    inactivatedAt: serverTimestamp(),
  })
  if (cardId) await updateDoc(doc(db, "publicCards", cardId), { status: "inactive" })
  // Libera o CPF: o índice `cpfRegistry` é o que bloqueia a Etapa 1 do
  // cadastro. Sem apagá-lo, o atleta removido nunca conseguiria se filiar de
  // novo. O registro em `affiliates` continua lá (histórico) e é sobrescrito
  // se houver um novo cadastro com o mesmo CPF (ver firestore.rules).
  await deleteDoc(doc(db, "cpfRegistry", id))
}

// Campos que o próprio filiado pode editar no perfil (dados de contato/endereço).
// CPF, faixa, categoria, status e datas ficam fora — só o admin altera.
export interface EditableProfile {
  email: string
  instagram: string
  phone: string
  address: string
  neighborhood: string
  zipCode: string
  city: string
  state: string
}

/** Atualiza os dados de contato/endereço do próprio filiado. */
export async function updateAffiliateProfile(cpf: string, data: EditableProfile) {
  await updateDoc(doc(db, "affiliates", cleanCpf(cpf)), { ...data })
}

/** Remove a foto de perfil do filiado (e do card público, se houver). */
export async function removeProfilePhoto(cpf: string, cardId?: string) {
  await updateDoc(doc(db, "affiliates", cleanCpf(cpf)), { photoURL: "" })
  if (cardId) await updateDoc(doc(db, "publicCards", cardId), { photoURL: "" })
}

/** Lista todas as filiações (apenas admin, conforme regras). */
export async function listAffiliates(): Promise<AdminAffiliate[]> {
  const snap = await getDocs(query(collection(db, "affiliates"), orderBy("fullName")))
  return snap.docs.map((d) => d.data() as AdminAffiliate)
}
