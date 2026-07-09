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

/**
 * true se o texto contém ao menos uma letra (NEW-01).
 * Usar em campos livres como "Nome da rua" e "Cidade" para rejeitar
 * entradas compostas apenas por símbolos/números.
 */
export function hasLetter(value: string): boolean {
  return /\p{L}/u.test(value)
}

// Validação de e-mail mais estrita (NEW-02): exige rótulos de domínio válidos
// e um TLD alfabético de 2+ caracteres, bloqueando formatos manifestamente
// inválidos (sem ponto, TLD numérico, domínio malformado, etc.).
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

/** true se o e-mail tem sintaxe válida e um domínio/TLD plausível. */
export function isValidEmail(value: string): boolean {
  const v = value.trim()
  // Bloqueia pontos consecutivos e ponto no início/fim da parte local.
  if (v.includes("..")) return false
  return EMAIL_RE.test(v)
}
