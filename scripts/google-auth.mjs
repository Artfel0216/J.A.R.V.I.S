

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { google } from 'googleapis'

function loadEnvFile(path) {
  try {
    const raw = readFileSync(path, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      const key = m[1]
      let val = m[2].trim().replace(/^["']|["']$/g, '')
      if (!(key in process.env) || !process.env[key]) process.env[key] = val
    }
  } catch {
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env')

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌ Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env.local antes de rodar.\n')
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', 
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/calendar'],
})

const redirect = new URL(REDIRECT_URI)
const port = Number(redirect.port) || 3000

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`)
  const code = url.searchParams.get('code')

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Sem código de autorização na URL.')
    return
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h2>✅ Autorizado! Pode fechar esta aba e voltar ao terminal.</h2>')

    console.log('\n──────────────────────────────────────────────')
    if (tokens.refresh_token) {
      console.log('✅ Copie para o seu .env / .env.local:\n')
      console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`)
    } else {
      console.log('⚠️  Nenhum refresh_token retornado.')
      console.log('   Remova o acesso em https://myaccount.google.com/permissions e rode de novo.')
    }
    console.log('──────────────────────────────────────────────\n')
  } catch (err) {
    console.error('❌ Falha ao trocar o código por tokens:', err?.message)
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Falha ao obter tokens. Veja o terminal.')
  } finally {
    server.close()
    setTimeout(() => process.exit(0), 250)
  }
})

server.listen(port, () => {
  console.log(`\n🔐 Servidor de callback ouvindo em ${REDIRECT_URI}`)
  console.log('\n👉 Abra esta URL no navegador e autorize:\n')
  console.log(authUrl + '\n')
})
