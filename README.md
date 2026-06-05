# J.A.R.V.I.S. — Next.js Edition

Interface holográfica de IA com autenticação, banco de dados e integrações externas.

## Stack
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — estética holográfica HUD
- **NextAuth v5** — OAuth Google + GitHub
- **Prisma + SQLite** — histórico de conversas persistido
- **Anthropic SDK** — Claude Sonnet 4 com personalidade JARVIS
- **Web Speech API** — voz bidirecional (STT + TTS)
- **Canvas API** — visualizador de áudio animado

## Integrações
| Serviço | Variável | Ativa quando... |
|---|---|---|
| OpenWeatherMap | `OPENWEATHER_API_KEY` | usuário pergunta sobre clima |
| NewsAPI | `NEWSAPI_KEY` | usuário pede notícias |
| Serper (Google) | `SERPER_API_KEY` | usuário pede busca na web |
| Wolfram Alpha | `WOLFRAM_APP_ID` | usuário pede cálculos |

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Gerar cliente Prisma + banco de dados
npx prisma generate
npx prisma db push

# 3. Configurar variáveis de ambiente (.env.local)
ANTHROPIC_API_KEY=sk-ant-...
NEXTAUTH_SECRET=qualquer-string-aleatoria-segura
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# 4. Rodar em desenvolvimento
npm run dev

# 5. Build de produção
npm run build && npm start
```

## OAuth — Configuração

**Google:** console.cloud.google.com → APIs → Credenciais → OAuth 2.0
- Redirect URI: `http://localhost:3000/api/auth/callback/google`

**GitHub:** github.com/settings/developers → OAuth Apps
- Callback URL: `http://localhost:3000/api/auth/callback/github`

## Estrutura
```
src/
├── app/
│   ├── page.tsx                    # Redireciona para login ou dashboard
│   ├── login/page.tsx              # Tela de autenticação
│   └── api/
│       ├── auth/[...nextauth]/     # Handler NextAuth
│       ├── chat/                   # Streaming + integrações
│       ├── conversations/          # CRUD de conversas
│       └── health/                 # Status do sistema
├── components/jarvis/
│   ├── JarvisDashboard.tsx         # Orquestrador principal
│   ├── Header.tsx                  # Barra superior com status
│   ├── Sidebar.tsx                 # Histórico + visualizador + métricas
│   ├── Visualizer.tsx              # Canvas animado (idle/ouvindo/falando)
│   ├── MessageBubble.tsx           # Bolha de mensagem
│   ├── InputBar.tsx                # Input + microfone + TTS toggle
│   └── BootScreen.tsx              # Tela de inicialização
├── hooks/
│   ├── useChat.ts                  # Streaming SSE + histórico
│   └── useSpeech.ts                # STT + TTS
├── lib/
│   ├── auth.ts                     # Configuração NextAuth
│   ├── prisma.ts                   # Cliente Prisma singleton
│   ├── integrations.ts             # Clima, notícias, busca, Wolfram
│   └── utils.ts                    # cn() helper
└── middleware.ts                   # Proteção de rotas
```
