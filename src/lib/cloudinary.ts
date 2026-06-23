const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Envia uma imagem para o Cloudinary via upload não assinado (unsigned).
 * `folder` organiza os arquivos (ex.: "profilePhotos/<uid>").
 * Retorna a URL segura da imagem.
 */
export async function uploadToCloudinary(blob: Blob, folder: string): Promise<string> {
  const form = new FormData()
  form.append("file", blob)
  form.append("upload_preset", UPLOAD_PRESET)
  form.append("folder", folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form },
  )

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Falha no upload da imagem: ${detail.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.secure_url as string
}
