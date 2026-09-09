import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth"
import { collection, deleteField, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"
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
 * Nova validade da anuidade ao confirmar um pagamento.
 * Se a filiação ainda está vigente (validade futura), soma 1 ano a partir
 * dela — o atleta não perde os dias que já pagou. Caso contrário (primeira
 * ativação ou em atraso), conta 1 ano a partir de hoje.
 */
function nextValidUntil(currentValidUntil?: string): string {
  const today = toISODate(new Date())
  const base = currentValidUntil && currentValidUntil > today ? currentValidUntil : today
  const d = new Date(`${base}T00:00:00`)
  d.setFullYear(d.getFullYear() + 1)
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
 * Cria a conta de acesso e grava a filiação + primeira anuidade pendente.
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
  // reverter nem bloquear o cadastro. A anuidade é recriada pelo admin ao
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
 * Resolve o cardId atual da filiação lendo o documento no servidor.
 * O `cardId` que a tela tem em mãos pode estar desatualizado: se a filiação
 * foi carregada antes do admin confirmar o pagamento, o estado local ainda
 * não conhece a carteirinha que já existe no banco. Sem esta leitura, a foto
 * é gravada só em `affiliates` e o QR Code mostra a carteirinha sem foto.
 */
async function resolveCardId(cpf: string, cardId?: string): Promise<string | undefined> {
  if (cardId) return cardId
  try {
    const snap = await getDoc(doc(db, "affiliates", cleanCpf(cpf)))
    return snap.exists() ? (snap.data().cardId as string | undefined) : undefined
  } catch {
    return undefined
  }
}

/**
 * Comprime e envia a foto de perfil para o Cloudinary e salva a photoURL
 * na filiação e no card público (para a carteirinha/validação).
 */
export async function uploadProfilePhoto(uid: string, cpf: string, file: File, cardId?: string) {
  const blob = await compressSquareImage(file)
  const photoURL = await uploadToCloudinary(blob, `profilePhotos/${uid}`)
  await updateDoc(doc(db, "affiliates", cleanCpf(cpf)), { photoURL })
  const id = await resolveCardId(cpf, cardId)
  if (id) await updateDoc(doc(db, "publicCards", id), { photoURL })
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
 * Confirma o pagamento de uma anuidade (ação do admin).
 * Marca o pagamento como pago, ativa a filiação, define a validade
 * (1 ano a partir de hoje) e gera/atualiza a carteirinha pública.
 */
export async function confirmPayment(params: {
  cpf: string
  month: string
  adminUid: string
  affiliate: AffiliateCardData
}): Promise<{ cardId: string; validUntil: string }> {
  const cpf = cleanCpf(params.cpf)
  const validUntil = nextValidUntil(params.affiliate.validUntil)

  // A lista do admin pode ter sido carregada antes de o atleta enviar a foto
  // (ou trocar a faixa/os dados) no painel dele. Relemos a filiação para o
  // card público nascer com os dados atuais, e não com o que estava na tela.
  let fresh: Partial<AffiliateCardData> = {}
  try {
    const snap = await getDoc(doc(db, "affiliates", cpf))
    if (snap.exists()) fresh = snap.data() as Partial<AffiliateCardData>
  } catch {
    // Sem a leitura, seguimos com os dados da tela: confirmar o pagamento é
    // mais importante do que ter a foto no card neste instante.
  }

  const cardId = fresh.cardId ?? params.affiliate.cardId ?? crypto.randomUUID()

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
    fullName: fresh.fullName ?? params.affiliate.fullName,
    academyId: fresh.academyId ?? params.affiliate.academyId,
    belt: fresh.belt ?? params.affiliate.belt,
    status: "active",
    photoURL: fresh.photoURL ?? params.affiliate.photoURL ?? "",
    birthDate: fresh.birthDate ?? params.affiliate.birthDate ?? "",
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

/**
 * Remove um pagamento confirmado por engano (ação do admin).
 * Devolve o filiado ao estado anterior ao clique: volta a pendente, perde a
 * validade e deixa de exibir a carteirinha. O `cardId` é PRESERVADO — assim o
 * QR Code que o atleta já tenha impresso volta a valer quando o pagamento for
 * refeito, em vez de virar um cartão órfão.
 *
 * A carteirinha pública não é apagada: fica com status "pending", para que a
 * leitura do QR mostre "Pagamento pendente" em vez de "não encontrada" — quem
 * confere precisa ver a pendência, não um erro de sistema.
 */
export async function adminRevertPayment(params: {
  cpf: string
  month: string
  cardId?: string
}) {
  const cpf = cleanCpf(params.cpf)

  await updateDoc(doc(db, "affiliates", cpf), {
    status: "pending",
    validUntil: deleteField(),
    lastPaymentAt: deleteField(),
  })

  // merge: preserva `amount`, `method` e `createdAt` — o pagamento volta a ser
  // uma cobrança pendente, exatamente como antes da confirmação.
  await setDoc(doc(db, "affiliates", cpf, "payments", params.month), {
    month: params.month,
    status: "pending",
    paidAt: deleteField(),
    confirmedBy: deleteField(),
  }, { merge: true })

  if (params.cardId) {
    await updateDoc(doc(db, "publicCards", params.cardId), {
      status: "pending",
      validUntil: "",
    })
  }
}

/** Ajusta manualmente a validade da anuidade (admin). */
export async function adminSetValidUntil(cpf: string, validUntil: string, cardId?: string) {
  await updateDoc(doc(db, "affiliates", cleanCpf(cpf)), { validUntil })
  if (cardId) await updateDoc(doc(db, "publicCards", cardId), { validUntil })
}

/**
 * Remoção lógica (soft delete) de um filiado — ação do admin.
 * Preserva o registro (e o histórico de competições), apenas marca como
 * inativo: o filiado sai da lista principal e passa a aparecer no filtro
 * "Removidos", com todos os dados intactos.
 *
 * O pagamento também é revogado (validade, último pagamento e a anuidade do
 * mês voltam ao estado pendente): é isso que trava a carteirinha, já que ela
 * só é liberada com a filiação ativa. Para voltar, o admin marca como pago —
 * `confirmPayment` reativa e reemite a carteirinha com o mesmo `cardId`.
 *
 * @param month anuidade a devolver para pendente (yyyy-mm). Sem ela, apenas o
 *              status e a validade são revogados.
 */
export async function adminSoftDelete(cpf: string, cardId?: string, month?: string) {
  const id = cleanCpf(cpf)
  await updateDoc(doc(db, "affiliates", id), {
    status: "inactive",
    inactivatedAt: serverTimestamp(),
    validUntil: deleteField(),
    lastPaymentAt: deleteField(),
  })

  if (month) {
    // merge: preserva `amount`, `method` e `createdAt` — a anuidade volta a ser
    // uma cobrança pendente, como antes da confirmação.
    await setDoc(doc(db, "affiliates", id, "payments", month), {
      month,
      status: "pending",
      paidAt: deleteField(),
      confirmedBy: deleteField(),
    }, { merge: true })
  }

  // O card é preservado (mesmo cardId) só que invalidado: quem ler o QR já
  // impresso vê a situação real em vez de "carteirinha não encontrada".
  if (cardId) await updateDoc(doc(db, "publicCards", cardId), { status: "inactive", validUntil: "" })
  // O índice `cpfRegistry` NÃO é apagado: remover é só resetar o pagamento,
  // nada sai de nenhuma coleção. O CPF segue registrado — a filiação existe,
  // apenas está inativa até o admin marcar o pagamento de novo.
}

/**
 * Devolve um filiado removido para a lista normal (ação do admin).
 * Ele volta como PENDENTE — ativar não é o mesmo que pagar: a carteirinha só
 * é liberada depois, quando o admin marcar o pagamento como pago. Nada é
 * criado nem apagado aqui; só o status volta ao que era antes da remoção.
 */
export async function adminReactivate(cpf: string, cardId?: string) {
  const id = cleanCpf(cpf)
  await updateDoc(doc(db, "affiliates", id), {
    status: "pending",
    reactivatedAt: serverTimestamp(),
  })
  // O card volta a "pendente": quem ler o QR vê a pendência de pagamento, e
  // não uma filiação cancelada.
  if (cardId) await updateDoc(doc(db, "publicCards", cardId), { status: "pending", validUntil: "" })
}

// Campos que o próprio filiado pode editar no perfil (dados de contato/endereço).
// CPF, faixa, categoria, status e datas ficam fora — só o admin altera.
export interface EditableProfile {
  // Dados do cadastro.
  fullName: string
  birthDate: string // yyyy-mm-dd
  gender: number
  academyId: number
  belt: number
  role: number
  // Contato e endereço.
  email: string
  instagram: string
  phone: string
  address: string
  neighborhood: string
  zipCode: string
  city: string
  state: string
}

/**
 * Atualiza os dados do próprio filiado (todos os campos do cadastro).
 * Fora daqui ficam apenas CPF (é o id do documento), status, validade e
 * carteirinha — pagamento e emissão são do admin.
 *
 * A categoria é recalculada da data de nascimento (nunca é digitada), e o
 * card público é sincronizado: nome, faixa, academia e nascimento aparecem
 * na carteirinha e na validação por QR Code.
 */
export async function updateAffiliateProfile(cpf: string, data: EditableProfile, cardId?: string) {
  const id = cleanCpf(cpf)
  const category = categoryFromBirthDate(data.birthDate)
  await updateDoc(doc(db, "affiliates", id), { ...data, category: category.id })

  const card = await resolveCardId(id, cardId)
  if (card) {
    await updateDoc(doc(db, "publicCards", card), {
      fullName: data.fullName,
      belt: data.belt,
      academyId: data.academyId,
      birthDate: data.birthDate,
    })
  }
}

/** Remove a foto de perfil do filiado (e do card público, se houver). */
export async function removeProfilePhoto(cpf: string, cardId?: string) {
  await updateDoc(doc(db, "affiliates", cleanCpf(cpf)), { photoURL: "" })
  const id = await resolveCardId(cpf, cardId)
  if (id) await updateDoc(doc(db, "publicCards", id), { photoURL: "" })
}

/** Lista todas as filiações (apenas admin, conforme regras). */
export async function listAffiliates(): Promise<AdminAffiliate[]> {
  const snap = await getDocs(query(collection(db, "affiliates"), orderBy("fullName")))
  return snap.docs.map((d) => d.data() as AdminAffiliate)
}
