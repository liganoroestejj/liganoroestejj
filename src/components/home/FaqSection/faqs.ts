// Fonte única das perguntas frequentes, para manter mobile e desktop
// sempre com o mesmo conteúdo (BUG-17).
export interface Faq {
  q: string
  a: string
}

export const faqs: Faq[] = [
  {
    q: "Quando acontecem os campeonatos de 2026?",
    a: "Os campeonatos são realizados ao longo do ano. Confira o calendário completo na seção Calendário.",
  },
  {
    q: "Como posso acessar o ranking atualizado?",
    a: "A classificação é atualizada após cada etapa e pode ser acessada na seção Ranking, filtrando por ano e categoria.",
  },
  {
    q: "Como fazer minha filiação ou renovação?",
    a: "Acesse a seção Atletas > Nova Filiação para se filiar, ou Atletas > Renovação para renovar sua carteirinha.",
  },
  {
    q: "A filiação é obrigatória para competir?",
    a: "Sim, a filiação é obrigatória para participar de todos os campeonatos oficiais da Liga Noroeste.",
  },
]
