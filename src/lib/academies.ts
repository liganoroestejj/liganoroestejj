import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore"
import { db } from "./firebase"

export interface Academy {
  id: number
  name: string
}

/**
 * Cache do processo: a lista muda raramente e é lida em várias telas
 * (cadastro, admin, carteirinha e validação por QR). Sem ele, cada carteirinha
 * renderizada dispararia uma leitura no Firestore.
 */
let cache: Promise<Academy[]> | null = null

export function listAcademies(): Promise<Academy[]> {
  if (!cache) {
    cache = getDocs(query(collection(db, "academies"), orderBy("name")))
      .then((snap) => snap.docs.map((d) => d.data() as Academy))
      // Falha não fica em cache: a próxima tela tenta de novo.
      .catch((err) => { cache = null; throw err })
  }
  return cache
}

/** Descarta o cache — usado depois de adicionar ou remover. */
export function invalidateAcademies() {
  cache = null
}

/**
 * Cadastra uma academia (ação do admin).
 * O id é numérico e sequencial porque é ele que fica gravado em `academyId`
 * nos filiados e nas carteirinhas. Ids nunca são reaproveitados nem
 * reordenados: fazer isso trocaria a academia de quem já está cadastrado.
 */
export async function addAcademy(name: string): Promise<Academy> {
  const nome = name.trim()
  const atuais = await listAcademies()
  const id = atuais.reduce((maior, a) => Math.max(maior, a.id), 0) + 1
  await setDoc(doc(db, "academies", String(id)), { id, name: nome, createdAt: serverTimestamp() })
  invalidateAcademies()
  return { id, name: nome }
}

/**
 * Renomeia uma academia (ação do admin).
 * O id NÃO muda — é o que mantém os filiados e as carteirinhas apontando para
 * ela. Renomear é seguro: o nome novo aparece em todo lugar na hora.
 */
export async function renameAcademy(id: number, name: string) {
  await updateDoc(doc(db, "academies", String(id)), { name: name.trim() })
  invalidateAcademies()
}

/** Remove uma academia (ação do admin). */
export async function removeAcademy(id: number) {
  await deleteDoc(doc(db, "academies", String(id)))
  invalidateAcademies()
}
