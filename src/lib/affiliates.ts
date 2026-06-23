import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"
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

/** Validade: 1 mês após a data informada (padrão: hoje). ISO yyyy-mm-dd. */
function addOneMonth(from = new Date()): string {
  const d = new Date(from)
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().slice(0, 10)
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

  // A carteirinha (cardId/publicCard) só é gerada após o 1º pagamento confirmado.
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

  const month = currentMonth()
  await setDoc(doc(db, "affiliates", cpf, "payments", month), {
    month,
    amount: MEMBERSHIP_FEE,
    status: "pending",
    method: "whatsapp",
    createdAt: serverTimestamp(),
  })

  // Índice público de CPFs (só existência) para a checagem da Etapa 1.
  await setDoc(doc(db, "cpfRegistry", cpf), { createdAt: serverTimestamp() })

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
  cardId?: string
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
  const validUntil = addOneMonth()
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
  validUntil?: string
  cardId?: string
  lastPaymentAt?: { seconds: number } | null
}

/** Ajusta manualmente a validade da mensalidade (admin). */
export async function adminSetValidUntil(cpf: string, validUntil: string, cardId?: string) {
  await updateDoc(doc(db, "affiliates", cleanCpf(cpf)), { validUntil })
  if (cardId) await updateDoc(doc(db, "publicCards", cardId), { validUntil })
}

/** Lista todas as filiações (apenas admin, conforme regras). */
export async function listAffiliates(): Promise<AdminAffiliate[]> {
  const snap = await getDocs(query(collection(db, "affiliates"), orderBy("fullName")))
  return snap.docs.map((d) => d.data() as AdminAffiliate)
}
