// Deploy de produção na conta Vercel `rimes-software`, sem depender de qual
// conta está logada na CLI. Usa um token guardado localmente (fora do git).
//
// Configuração (uma vez só):
//   1. Vercel (conta rimes-software) → Settings → Tokens → Create Token.
//   2. Salve o token no arquivo `.vercel-token.local` na raiz do projeto
//      (esse nome cai no *.local do .gitignore, então nunca vai pro git).
//      Ou defina a variável de ambiente VERCEL_TOKEN.
//
// Uso:
//   npm run deploy

import { readFileSync } from "node:fs"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const SCOPE = "rimes-software"
const PROJECT = "liga-noroeste-jiu-jitsu"
const TOKEN_FILE = fileURLToPath(new URL("../.vercel-token.local", import.meta.url))

function readToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN.trim()
  try {
    return readFileSync(TOKEN_FILE, "utf8").trim()
  } catch {
    return ""
  }
}

const token = readToken()
if (!token) {
  console.error(
    "\n❌ Token da Vercel não encontrado.\n" +
      "   Crie um token na conta rimes-software (Settings → Tokens) e salve em:\n" +
      "   .vercel-token.local  (ou defina VERCEL_TOKEN no ambiente)\n",
  )
  process.exit(1)
}

// O token autentica como rimes-software, independentemente do login da CLI.
const env = { ...process.env, VERCEL_TOKEN: token }
const run = (cmd) => execSync(cmd, { stdio: "inherit", env })

try {
  // Garante o vínculo desta pasta ao projeto existente (idempotente).
  run(`npx vercel link --yes --scope ${SCOPE} --project ${PROJECT}`)
  // Sobe pra produção.
  run("npx vercel --prod")
  console.log("\n✅ Deploy concluído na rimes-software.\n")
} catch {
  // O erro já foi impresso pela própria CLI (stdio herdado).
  process.exit(1)
}
