/**
 * Redimensiona e comprime uma imagem no navegador antes do upload.
 * Recorta no centro em formato quadrado (ideal pra carteirinha) e
 * devolve um Blob JPEG leve.
 */
export async function compressSquareImage(
  file: File,
  size = 600,
  quality = 0.8,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)

  // Recorte central quadrado.
  const side = Math.min(bitmap.width, bitmap.height)
  const sx = (bitmap.width - side) / 2
  const sy = (bitmap.height - side) / 2

  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Não foi possível processar a imagem.")
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar a imagem."))),
      "image/jpeg",
      quality,
    )
  })
}
