export type Artigo = {
  num: string
  texto: string
}

export type Capitulo = {
  titulo: string
  artigos: Artigo[]
}

export type Regulamento = {
  titulo: string
  subtitulo: string
  capitulos: Capitulo[]
  quadro: { titulo: string; linhas: string[] }
}

// Edital do Pádua Open 2026 (id "2"), transcrito do documento enviado pela Liga.
const paduaOpen2026: Regulamento = {
  titulo: "Edital Oficial — Pádua Open 2026",
  subtitulo: "Santo Antônio de Pádua/RJ • 2026",
  capitulos: [
    {
      titulo: "Capítulo I — Das Disposições Gerais",
      artigos: [
        { num: "Art. 1º.", texto: "A LIGA NOROESTE JIU-JITSU PRO, doravante denominada ORGANIZAÇÃO, torna público o presente edital para realização do campeonato Pádua Open 2026, evento de Jiu-Jitsu esportivo destinado a atletas e equipes, conforme as condições deste documento." },
        { num: "Art. 2º.", texto: "O evento está previsto para o dia 08 de novembro de 2026, com início previsto às 10h, no Campestre Pádua Clube, em Santo Antônio de Pádua/RJ. Estrada Pádua-Pirapetinga km 2. A programação poderá ser ajustada por necessidade operacional, com comunicação pelos canais oficiais." },
        { num: "Art. 3º.", texto: "Modalidades previstas: JIU JITSU (GI); infantil e adulto; todas categorias por faixas e idades.\nLimite de 200 atletas/inscrições!" },
        { num: "Art. 4º.", texto: "A participação implica ciência e aceitação deste edital e do regulamento técnico indicado pela organização. Regulamento técnico adotado será o da IBJJF." },
        { num: "Art. 5º.", texto: "A organização poderá ajustar cronograma, áreas de luta e procedimentos operacionais por motivo justificado, divulgando as alterações pelos canais oficiais e preservando, na medida do possível, a segurança e a igualdade entre os participantes." },
      ],
    },
    {
      titulo: "Capítulo II — Das Inscrições, Prazos e Pagamentos",
      artigos: [
        { num: "Art. 6º.", texto: "As inscrições serão realizadas pelo site da LIGA DE JIU JITSU NOROESTE PRO ou contato oficial, no período de 20/10 até 04/11 — às 22:00 hs ou até o limite de vagas, se previamente definido." },
        { num: "Art. 7º.", texto: "Os valores e lotes de inscrição deverão ser publicados pela organização antes da abertura das inscrições.\nTabela de inscrições:\nFestival infantil até 9 anos R$ 100,00;\nAtletas acima de 9 anos (inclusive adultos) R$ 120,00." },
        { num: "Art. 8º.", texto: "A inscrição somente será considerada confirmada após a confirmação do pagamento por comprovante Pix pela organização. Formas de pagamento aceitas: Somente Pix!" },
        { num: "Art. 9º.", texto: "As informações cadastrais, incluindo nome, data de nascimento, equipe, graduação e peso, são de responsabilidade do atleta ou de seu responsável legal. Informações falsas ou divergentes poderão resultar em correção, mudança de categoria quando autorizada, ou desclassificação, após análise da organização." },
        { num: "Art. 10.", texto: "O prazo final para corrigir inscrição, peso, idade, graduação ou equipe será 05/11/2026 até às 22:00hs.\nO procedimento para solicitar alterações será via WhatsApp. Após o encerramento, alterações poderão ser recusadas para permitir a montagem das chaves e do cronograma." },
        { num: "Art. 11.", texto: "Política de desistência, reembolso, transferência de inscrição e cancelamento do evento, de acordo com a legislação aplicável." },
        { num: "Art. 12.", texto: "Inscrições de projetos sociais, bolsas ou condições especiais: “Não previsto nesta edição”." },
      ],
    },
    {
      titulo: "Capítulo III — Das Categorias",
      artigos: [
        { num: "Art. 13.", texto: "As categorias serão organizadas conforme idade, gênero, graduação, peso de acordo com a tabela: ANEXO I." },
        { num: "Art. 14.", texto: "Faixas etárias e divisões contempladas: (Kids até 9 anos festival) — Infantil, infanto juvenil A e B, Juvenil, Adulto e Master, conforme aplicável." },
        { num: "Art. 15.", texto: "Categorias de peso, não haverá tolerância; o atleta deverá estar de kimono no ato da pesagem!" },
        { num: "Art. 16.", texto: "Não haverá categoria Absoluto!" },
        { num: "Art. 17.", texto: "A organização poderá agrupar ou ajustar categorias quando houver número insuficiente de inscritos." },
        { num: "Art. 18.", texto: "Atleta sem adversário na categoria poderá permanecer e receber premiação, migrar para outra categoria elegível, solicitar crédito/reembolso até o dia 05/11/2026 às 22:00." },
      ],
    },
    {
      titulo: "Capítulo IV — Das Chaves, Checagem e Formas de Disputa",
      artigos: [
        { num: "Art. 19.", texto: "As chaves e o cronograma serão divulgados em 06/11/2026. É responsabilidade do atleta e do professor conferir nome, categoria, equipe e horário." },
        { num: "Art. 20.", texto: "Período de checagem final é de 07/11/2026 até 15hs. Solicitações de correção deverão ser enviadas por WhatsApp. Após o prazo, a organização poderá não aceitar alterações necessárias à montagem das chaves." },
        { num: "Art. 21.", texto: "O sistema de disputa será de chaves." },
        { num: "Art. 22.", texto: "A ausência de adversário, desistência, lesão, desclassificação ou alteração de regra específica. A organização deverá esclarecer se há mudança de categoria, luta extra ou premiação sem combate." },
        { num: "Art. 23.", texto: "Não serão aceitas reclamações sobre dados que poderiam ter sido corrigidos durante o prazo oficial de checagem, salvo erro material atribuível à organização ou outra hipótese expressamente admitida." },
      ],
    },
    {
      titulo: "Capítulo V — Da Identificação, Pesagem e Pontualidade",
      artigos: [
        { num: "Art. 24.", texto: "Para competir, o atleta deverá apresentar documento com foto e carteira da liga!\nMenores de idade deverão cumprir os procedimentos de identificação e autorização previstos pela organização." },
        { num: "Art. 25.", texto: "A pesagem ocorrerá antes das lutas. O limite de peso será o da categoria confirmada, conforme tabela oficial." },
        { num: "Art. 26.", texto: "O atleta deverá acompanhar as chamadas por locutor ou mesa de chamada e se apresentar quando solicitado. Antecedência mínima de chegada: 30 minutos." },
        { num: "Art. 27.", texto: "O não comparecimento após as chamadas oficiais poderá resultar em W.O. ou eliminação, conforme o procedimento definido." },
        { num: "Art. 28.", texto: "Excesso de peso, uniforme irregular ou divergência cadastral não serão toleradas." },
      ],
    },
    {
      titulo: "Capítulo VI — Da Premiação e da Pontuação por Equipes",
      artigos: [
        { num: "Art. 29.", texto: "Premiação individual: medalhas para 1º, 2º e terceiros lugares." },
        { num: "Art. 30.", texto: "Premiação por equipes: Não nessa edição." },
        { num: "Art. 34.", texto: "As premiações deverão ser retiradas logo após o final das chaves." },
      ],
    },
    {
      titulo: "Capítulo VII — Do Vestuário e dos Equipamentos",
      artigos: [
        { num: "Art. 35.", texto: "Requisitos do kimono — cores permitidas, estado de conservação, medidas e demais exigências." },
        { num: "Art. 36.", texto: "A organização realizará inspeção de uniforme e poderá exigir correção ou troca quando houver risco à segurança ou descumprimento das regras divulgadas. Prazo para ajuste e consequência da não regularização: [PREENCHER]." },
        { num: "Art. 37.", texto: "A referência técnica para avaliação do uniforme será da organização." },
      ],
    },
    {
      titulo: "Capítulo VIII — Da Arbitragem, Conduta e Recursos",
      artigos: [
        { num: "Art. 38.", texto: "A arbitragem será conduzida por equipe designada pela Liga, observando regulamento técnico e versão. A decisão técnica em combate seguirá os critérios previstos nesse regulamento." },
        { num: "Art. 39.", texto: "Atletas, professores, coaches e público deverão manter conduta respeitosa, sendo vedados agressões, ameaças, discriminação, intimidação, invasão da área de luta e comportamento antidesportivo." },
        { num: "Art. 40.", texto: "Sanções possíveis: advertência, retirada da área técnica, descredenciamento, desclassificação, perda de pontos da equipe ou encaminhamento disciplinar, conforme gravidade e regras previamente definidas. Procedimento e autoridade decisória:" },
        { num: "Art. 41.", texto: "Procedimento para apresentar protesto ou recurso: quem pode apresentar, prazo, responsável, forma, taxa se houver e matérias passíveis de revisão. Decisões e critérios devem ser comunicados de forma clara." },
      ],
    },
    {
      titulo: "Capítulo IX — Dos Coaches, Credenciamento e Acesso",
      artigos: [
        { num: "Art. 42.", texto: "O acesso à área técnica será permitido somente a pessoas credenciadas pela organização. Critérios de credenciamento:" },
        { num: "Art. 43.", texto: "Quantidade de coaches por equipe/área, prazo e forma de credenciamento: A credencial deverá permanecer visível e não poderá ser transferida sem autorização." },
        { num: "Art. 44.", texto: "Somente os professores poderão acompanhar os menores na área de luta." },
        { num: "Art. 45.", texto: "Ingresso do público: gratuito." },
      ],
    },
    {
      titulo: "Capítulo X — Saúde, Segurança e Participação de Menores",
      artigos: [
        { num: "Art. 46.", texto: "O atleta ou seu responsável legal declara que as informações fornecidas são verdadeiras e que a participação é voluntária. A organização deverá informar os documentos ou autorizações exigidos para menores:" },
        { num: "Art. 47.", texto: "Estrutura de atendimento de saúde no evento: [PREENCHER — equipe, ambulância, posto de atendimento e protocolo de emergência]. Contato de emergência e unidade de referência, se aplicável: [PREENCHER]." },
        { num: "Art. 48.", texto: "O Jiu-Jitsu é uma modalidade de contato e pode envolver risco de lesões. Esta cláusula não elimina deveres legais da organização, nem substitui os protocolos de segurança e atendimento." },
        { num: "Art. 49.", texto: "Responsável pelo recebimento de ocorrências e procedimento de atendimento: [PREENCHER]. A organização deverá adotar medidas razoáveis para segurança dos participantes e do público." },
      ],
    },
    {
      titulo: "Capítulo XI — Do Direito de Imagem e dos Dados Pessoais",
      artigos: [
        { num: "Art. 50.", texto: "Uso de imagem, voz e nome para divulgação do evento: finalidade, meios de divulgação, prazo e forma de autorização. Para menores de idade, deverá ser obtida autorização adequada do responsável legal." },
        { num: "Art. 51.", texto: "Os dados pessoais coletados na inscrição serão utilizados para organização da competição, comunicação, segurança e finalidades informadas ao participante, observada a legislação aplicável." },
      ],
    },
    {
      titulo: "Capítulo XII — Da Mídia e dos Patrocinadores",
      artigos: [
        { num: "Art. 52.", texto: "Fotógrafos, videomakers e demais profissionais de mídia deverão observar o credenciamento e as áreas autorizadas. Procedimento, prazo e contato para credenciamento:" },
        { num: "Art. 53.", texto: "A organização poderá definir áreas e condições para exposição de patrocinadores, equipes e parceiros. Regras para banners, distribuição de materiais e ativação de marcas:" },
      ],
    },
    {
      titulo: "Capítulo XIII — Das Disposições Finais",
      artigos: [
        { num: "Art. 54.", texto: "Os casos omissos serão analisados pela coordenação da LIGA NOROESTE JIU-JITSU PRO, respeitando este edital, o regulamento técnico divulgado e a legislação aplicável. Responsável oficial pela decisão:" },
        { num: "Art. 55.", texto: "Este edital deverá ser publicado no site da liga." },
        { num: "Art. 56.", texto: "Ao concluir a inscrição, o participante declara que teve acesso às regras aplicáveis e se compromete a observá-las, sem prejuízo dos direitos assegurados pela legislação." },
      ],
    },
  ],
  quadro: {
    titulo: "Quadro de Informações",
    linhas: [
      "Nome oficial: Pádua Open 2026",
      "Data: 08/11/2026",
      "Horário: 10h",
      "Local: Campestre Pádua Clube, Santo Antônio de Pádua/RJ",
      "Inscrições: liganoroestejj.com.br",
      "Responsáveis: Paulino Gomes Gallete e Daniel de Carvalho Seixas",
    ],
  },
}

const regulamentos: Record<string, Regulamento> = {
  "2": paduaOpen2026,
}

export const getRegulamentoByEventId = (id?: string) => (id ? regulamentos[id] : undefined)
