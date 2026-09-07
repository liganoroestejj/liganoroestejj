import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { getPublicCard, type PublicCard } from "../../lib/affiliates"
import Carteirinha from "../../components/Carteirinha"

/**
 * Página de download da carteirinha.
 *
 * Não dá para depender de impressão: o Safari do iPhone ignora o
 * `window.print()` disparado no meio de uma página e as WebViews (o "Safari"
 * do Android, os navegadores internos do Instagram/WhatsApp) simplesmente não
 * implementam impressão — o botão não fazia nada. Aqui a carteirinha vira um
 * PNG gerado no próprio navegador e é entregue pelo primeiro caminho que o
 * aparelho aceitar: Compartilhar nativo, download, ou a imagem na tela para o
 * atleta segurar o dedo e salvar. O último sempre funciona.
 */

/** Baixa a foto como data URL para o canvas não esbarrar em CORS. */
async function embutirFoto(url?: string): Promise<string | undefined> {
  if (!url) return undefined
  try {
    const resp = await fetch(url, { mode: "cors" })
    const blob = await resp.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return url // segue com a URL original; o html2canvas ainda tenta via useCORS
  }
}

function nomeArquivo(fullName: string) {
  const slug = fullName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
  return `carteirinha-${slug || "lnjjp"}.png`
}

export default function ImprimirCarteirinha() {
  const { cardId } = useParams<{ cardId: string }>()
  const [card, setCard] = useState<PublicCard | null>(null)
  const [fotoEmbutida, setFotoEmbutida] = useState<string | undefined>()
  const [carregando, setCarregando] = useState(true)
  const [gerando, setGerando] = useState(false)
  const [aviso, setAviso] = useState("")
  const [erro, setErro] = useState("")
  const cartaoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ;(async () => {
      const c = cardId ? await getPublicCard(cardId) : null
      setCard(c)
      if (c) setFotoEmbutida(await embutirFoto(c.photoURL))
      setCarregando(false)
    })()
  }, [cardId])

  async function salvar() {
    if (!cartaoRef.current || !card) return
    setErro("")
    setGerando(true)
    try {
      const { default: html2canvas } = await import("html2canvas")
      const canvas = await html2canvas(cartaoRef.current, {
        backgroundColor: "#0A0A0A",
        scale: 2, // resolução suficiente para imprimir em papel depois
        useCORS: true,
        logging: false,
      })
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"))
      if (!blob) throw new Error("canvas vazio")

      const arquivo = new File([blob], nomeArquivo(card.fullName), { type: "image/png" })

      // 1) Compartilhar nativo — no iOS é o que leva a foto para Fotos/Arquivos.
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
      if (nav.canShare?.({ files: [arquivo] })) {
        try {
          await nav.share({ files: [arquivo], title: "Carteirinha LNJJP" })
          return
        } catch {
          // Cancelou ou o app recusou: cai no download.
        }
      }

      // 2) Download direto — Android e desktop. O href é data:, e não a URL do
      //    blob: alguns navegadores repassam o link ao gerenciador de downloads
      //    do Android, que não enxerga um blob: da página e falha com
      //    "<Sem título> / Falha no download".
      const a = document.createElement("a")
      a.href = canvas.toDataURL("image/png")
      a.download = arquivo.name
      a.rel = "noopener"
      document.body.appendChild(a)
      a.click()
      a.remove()
      setAviso("Carteirinha salva. Procure na pasta Downloads ou na galeria do seu aparelho.")
    } catch {
      setErro("Não foi possível gerar a imagem. Recarregue a página e tente de novo.")
    } finally {
      setGerando(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{`
        @page { margin: 12mm; }
        @media print { .no-print { display: none !important; } }
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
          <div id="carteirinha-print" ref={cartaoRef} style={{ width: "100%", maxWidth: 340, background: "#0A0A0A" }}>
            <Carteirinha
              data={{
                fullName: card.fullName,
                photoURL: fotoEmbutida,
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
              onClick={salvar}
              disabled={gerando}
              style={{ width: "100%", background: "#F0B90B", color: "#0A0A0A", fontSize: 12, fontWeight: 800, padding: "12px 22px", borderRadius: 5, letterSpacing: 1, textTransform: "uppercase", border: "none", cursor: "pointer", opacity: gerando ? 0.6 : 1 }}
            >
              {gerando ? "Gerando..." : "Baixar carteirinha"}
            </button>

            {erro && <p style={{ color: "#f87171", fontSize: 12, marginTop: 12 }}>{erro}</p>}
            {aviso && <p style={{ color: "#4ade80", fontSize: 12, lineHeight: 1.5, marginTop: 12 }}>{aviso}</p>}

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
