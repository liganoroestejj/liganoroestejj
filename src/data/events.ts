import camp1 from "../assets/image/campeonato1.jpeg"
import campPadua from "../assets/image/campeonato-padua.jpeg"
import camp3 from "../assets/image/campeonato3.webp"

export type EventItem = {
  id: string
  etapa: string
  title: string
  date: string
  city: string
  open: boolean
  img: string
}

export const events: EventItem[] = [
  { id: "1", etapa: "1ª", title: "1ª Etapa — Liga Noroeste Jiu-Jitsu Pro", date: "10/10/2026", city: "Em breve", open: false, img: camp1 },
  { id: "2", etapa: "2ª", title: "Open Pádua Jiu Jitsu", date: "08/11/2026", city: "Em breve", open: true, img: campPadua },
  { id: "3", etapa: "3ª", title: "3ª Etapa — Liga Noroeste Jiu-Jitsu Pro", date: "Em breve", city: "Em breve", open: false, img: camp3 },
]

export const hasDate = (e: EventItem) => e.date !== "Em breve"

export const getEventById = (id?: string) => events.find(e => e.id === id)

export type EventStatus = "sem-data" | "futuro" | "hoje" | "passado"

/** Data do evento como Date, ou null quando ainda é "Em breve". */
export const getEventDate = (e: EventItem): Date | null => parseDate(e.date)

const parseDate = (date: string): Date | null => {
  const m = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  return isNaN(d.getTime()) ? null : d
}

export const getEventStatus = (e: EventItem): EventStatus => {
  const d = parseDate(e.date)
  if (!d) return "sem-data"
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  if (d.getTime() === hoje.getTime()) return "hoje"
  return d.getTime() > hoje.getTime() ? "futuro" : "passado"
}

export const getEventPlaceLabel = (e: EventItem) => {
  switch (getEventStatus(e)) {
    case "hoje": return "Acontecendo hoje"
    case "passado": return "Evento realizado"
    default: return `📍 ${e.city}`
  }
}
