// Consulta de endereço por CEP via ViaCEP (API pública, sem chave).
// Usa fetch nativo — nenhuma dependência adicional.

export interface CepAddress {
  street: string       // logradouro
  neighborhood: string // bairro
  city: string         // localidade
  state: string        // uf
}

/**
 * Busca o endereço de um CEP (8 dígitos). Retorna null se o CEP não existir
 * ou se a consulta falhar (offline, etc.) — o preenchimento é só uma
 * conveniência, nunca deve travar o formulário.
 */
export async function fetchAddressByCep(cep: string): Promise<CepAddress | null> {
  const digits = cep.replace(/\D/g, "")
  if (digits.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    if (!res.ok) return null
    const data = await res.json()
    if (data?.erro) return null
    return {
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade ?? "",
      state: data.uf ?? "",
    }
  } catch {
    return null
  }
}
