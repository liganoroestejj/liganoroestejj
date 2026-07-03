// Utilidades de sanitização/validação de entrada de texto.
// O React já faz escaping na renderização, mas aqui neutralizamos a entrada
// na origem (defesa em profundidade) para evitar armazenar conteúdo perigoso
// ou inconsistente no banco.

/** Remove tags/ângulos e colapsa espaços. Usar em qualquer texto livre. */
export function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/[<>]/g, "")
}

// Caracteres permitidos em nomes próprios: letras (com acentos), espaço,
// apóstrofo e hífen. Nada de dígitos, símbolos ou tags.
const NAME_ALLOWED_RE = /[^\p{L}\s'’-]/gu

/**
 * Filtra um nome para conter apenas letras, espaços, apóstrofo e hífen.
 * Colapsa espaços repetidos. Usar no onChange do campo de nome.
 */
export function sanitizeName(value: string): string {
  return value.replace(NAME_ALLOWED_RE, "").replace(/\s{2,}/g, " ")
}

/** true se o nome tem apenas caracteres válidos (letras/espaço/'/-). */
export function isValidName(value: string): boolean {
  const v = value.trim()
  return v.length >= 5 && v.includes(" ") && !NAME_ALLOWED_RE.test(v)
}
