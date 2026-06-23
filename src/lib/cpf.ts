/** Remove tudo que não for dígito. */
export function cleanCpf(value: string): string {
  return value.replace(/\D/g, "")
}

/** Formata como 000.000.000-00 (parcial enquanto digita). */
export function formatCpf(value: string): string {
  const d = cleanCpf(value).slice(0, 11)
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
}

/** Valida o dígito verificador do CPF. */
export function isValidCpf(value: string): boolean {
  const cpf = cleanCpf(value)
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false // todos iguais

  const digit = (factorStart: number, len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(cpf[i]) * (factorStart - i)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }

  return digit(10, 9) === parseInt(cpf[9]) && digit(11, 10) === parseInt(cpf[10])
}
