import camp1 from "../assets/image/campeonato1.jpeg"
import camp2 from "../assets/image/campeonato2.jpeg"
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
  { id: "2", etapa: "2ª", title: "2ª Etapa — Liga Noroeste Jiu-Jitsu Pro", date: "Em breve", city: "Em breve", open: false, img: camp2 },
  { id: "3", etapa: "3ª", title: "3ª Etapa — Liga Noroeste Jiu-Jitsu Pro", date: "Em breve", city: "Em breve", open: false, img: camp3 },
]

export const hasDate = (e: EventItem) => e.date !== "Em breve"

export const getEventById = (id?: string) => events.find(e => e.id === id)
