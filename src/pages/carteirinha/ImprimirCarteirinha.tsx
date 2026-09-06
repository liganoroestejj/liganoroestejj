import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getPublicCard, type PublicCard } from "../../lib/affiliates"
import Carteirinha from "../../components/Carteirinha"

/**
 * O Safari do iPhone (e as WebViews de Instagram/WhatsApp) ignoram o
 * `window.print()` disparado por um botão no meio da página. Por isso a
 * impressão ganhou uma rota própria: aqui a carteirinha é a única coisa na
 * tela, o print é tentado automaticamente e, se o iOS não abrir o diálogo,
 * o atleta usa o Compartilhar do próprio Safari — daí a instrução visível.
 */
const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)

/** Espera a foto carregar antes de imprimir, senão o PDF sai sem ela. */
function aguardarFoto(url?: string): Promise<void> {
  if (!url) return Promise.resolve()
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = url
  })
}

export default function ImprimirCarteirinha() {
  const { cardId } = useParams<{ cardId: string }>()
  const [card, setCard] = useState<PublicCard | null>(null)
  const [carregando, setCarregando] = useState(true)
  const ios = isIOS()

  useEffect(() => {
    ;(async () => {
      const c = cardId ? await getPublicCard(cardId) : null
      setCard(c)
      setCarregando(false)
      if (!c) return
      await aguardarFoto(c.photoURL)
      // O iOS abre o diálogo em cima da página sem que o usuário tenha pedido;
      // lá a impressão fica no botão/Compartilhar, sob controle dele.
      if (!ios) setTimeout(() => window.print(), 300)
    })()
  }, [cardId, ios])

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{`
        @page { margin: 12mm; }
        @media print {
          .no-print { display: none !important; }
          #carteirinha-print { margin: 0 auto; }
        }
        /* Sem isto o fundo escuro do cartão sai branco na impressão e o texto some. */
        #carteirinha-print, #carteirinha-print * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>

      {carregando ? (
        <p style={{ color: "#666", fontSize: 14 }}>Carregando carteirinha...</p>
      ) : card && cardId ? (
        <>
          <div id="carteirinha-print" style={{ width: "100%", maxWidth: 340 }}>
            <Carteirinha
              data={{
                fullName: card.fullName,
                photoURL: card.photoURL,
                belt: card.belt,
                academyId: card.academyId,
                cpf: card.cpf,
                birthDate: card.birthDate,
                validUntil: card.validUntil,
                cardId,
              }}
            />
          </div>

          <div className="no-print" style={{ width: "100%", maxWidth: 340, marginTop: 20, textAlign: "center" }}>
            <button
              onClick={() => window.print()}
              style={{ width: "100%", background: "#F0B90B", color: "#0A0A0A", fontSize: 12, fontWeight: 800, padding: "12px 22px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", border: "none", cursor: "pointer" }}
            >
              Imprimir / Salvar em PDF
            </button>
            {ios && (
              <p style={{ color: "#888", fontSize: 12, lineHeight: 1.5, marginTop: 14 }}>
                No iPhone e no iPad, se o botão não abrir o menu de impressão, toque em{" "}
                <strong style={{ color: "#ccc" }}>Compartilhar</strong> (o quadrado com a seta) e escolha{" "}
                <strong style={{ color: "#ccc" }}>Imprimir</strong> — na tela seguinte, aproxime dois dedos sobre a
                carteirinha para abrir o PDF e salvar em Arquivos ou Fotos.
              </p>
            )}
            {ios && (
              <p style={{ color: "#666", fontSize: 11, lineHeight: 1.5, marginTop: 10 }}>
                Se você abriu este link pelo Instagram ou WhatsApp, toque em "Abrir no Safari" antes de imprimir.
              </p>
            )}
          </div>
        </>
      ) : (
        <div style={{ maxWidth: 340, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Carteirinha não encontrada</div>
          <p style={{ color: "#888", fontSize: 14 }}>Este endereço não corresponde a nenhuma filiação válida da Liga Noroeste.</p>
        </div>
      )}
    </div>
  )
}
