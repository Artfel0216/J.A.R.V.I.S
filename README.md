# 🤖 J.A.R.V.I.S.

> _"Just A Rather Very Intelligent System"_

Um assistente virtual inteligente inspirado no universo do **Homem de Ferro** (ecossistema Stark). O J.A.R.V.I.S. combina IA conversacional com streaming em tempo real, comando e resposta por voz, integrações com APIs do mundo real e uma interface imersiva e futurista.

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwind-css&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-4-2D3748?logo=prisma&logoColor=white" />
  <img alt="Gemini" src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?logo=google&logoColor=white" />
</p>

---

## ✨ Funcionalidades

- 🧠 **IA conversacional** — respostas com _streaming_ em tempo real via **Google Gemini 2.5 Flash**.
- 🎙️ **Interface de voz** — fale com o assistente e ouça suas respostas (Web Speech API: reconhecimento + síntese de fala).
- 🌐 **Integrações reais** — o assistente busca dados externos automaticamente conforme o contexto da mensagem:
  - ☀️ **Clima** — previsão do tempo (OpenWeather)
  - 📰 **Notícias** — manchetes atuais (NewsAPI)
  - 🔎 **Busca na web** — pesquisa em tempo real (Serper / Google)
  - 🧮 **Cálculos e conhecimento** — consultas matemáticas e factuais (Wolfram Alpha)
- 💬 **Histórico persistente** — conversas salvas por usuário, com possibilidade de retomar diálogos anteriores.
- 🔐 **Autenticação** — login com e-mail e senha (NextAuth v5 + bcrypt), sessões via JWT.
- 🛡️ **Rate limiting** — proteção contra abuso de requisições.
- ✨ **UI imersiva** — animações fluidas (Framer Motion), visualizador de áudio em canvas, boot screen e a estética futurista Stark.

---

## 🛠️ Stack

| Camada            | Tecnologia                                            |
| ----------------- | ----------------------------------------------------- |
| Framework         | [Next.js 16](https://nextjs.org/) (App Router)        |
| UI                | React 19, Tailwind CSS 4, Framer Motion, lucide-react |
| Linguagem         | TypeScript 5                                          |
| IA                | Google Generative AI (`@google/generative-ai`)        |
| Autenticação      | NextAuth v5 (Credentials) + bcryptjs                  |
| Banco de dados    | Prisma ORM + SQLite                                   |
| Testes            | Jest + ts-jest                                        |

---

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm (ou pnpm/yarn)

### 1. Clone o repositório

```bash
git clone https://github.com/Artfel0216/J.A.R.V.I.S.git
cd J.A.R.V.I.S
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL="file:./dev.db"

# Autenticação
NEXTAUTH_SECRET="gere-uma-chave-secreta-aqui"

# IA (obrigatório)
GEMINI_API_KEY="sua-chave-da-api-gemini"

# Integrações (opcionais — cada uma habilita uma capacidade)
OPENWEATHER_API_KEY="sua-chave"
NEWSAPI_KEY="sua-chave"
SERPER_API_KEY="sua-chave"
WOLFRAM_APP_ID="seu-app-id"
```

> 💡 Apenas `GEMINI_API_KEY` é obrigatória para a conversa funcionar. As integrações são ativadas individualmente conforme as chaves disponíveis.

### 4. Prepare o banco de dados

```bash
npx prisma generate
npx prisma db push
```

### 5. Rode em modo de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). 🎉

> No primeiro login, a conta é criada automaticamente com o e-mail e a senha informados.

---

## 📜 Scripts

| Comando         | Descrição                            |
| --------------- | ------------------------------------ |
| `npm run dev`   | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção             |
| `npm run start` | Inicia o servidor de produção        |
| `npm run lint`  | Executa o ESLint                     |

---

## 📂 Estrutura do projeto

```
jarvis/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # Rotas do NextAuth
│   │   ├── chat/                 # Endpoint de chat (streaming Gemini)
│   │   ├── conversations/        # CRUD de conversas
│   │   └── health/               # Health check
│   ├── components/               # BootScreen, Header, InputBar,
│   │                             # JarvisDashboard, MessageBubble,
│   │                             # Sidebar, Visualizer, LoginForm
│   ├── hooks/                    # useChat (streaming SSE), useSpeech (STT + TTS)
│   ├── login/                    # Página de login
│   ├── layout.tsx
│   └── page.tsx                  # Dashboard principal
├── lib/
│   ├── auth.ts                   # Configuração do NextAuth
│   ├── integrations.ts           # Clima, notícias, busca, Wolfram
│   ├── prisma.ts                 # Cliente Prisma singleton
│   ├── rateLimiter.ts            # Limitação de requisições
│   └── utils.ts                  # Helpers
├── prisma/
│   └── schema.prisma             # Modelos: User, Conversation, Message, etc.
└── ...
```

---

## 🧩 Como funcionam as integrações

A função [`resolveIntegration`](lib/integrations.ts) analisa a mensagem do usuário e, com base em palavras-chave (ex.: _"clima"_, _"notícias"_, _"calcular"_, _"pesquisar"_), aciona a API externa correspondente antes de compor o contexto enviado à IA. Se uma chave de API não estiver configurada, a integração retorna um aviso amigável e a conversa segue normalmente.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir _issues_ e _pull requests_.

1. Faça um fork do projeto
2. Crie sua branch (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -m 'feat: minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Projeto de uso pessoal e educacional. Sinta-se livre para estudar e adaptar.

---

<p align="center">
  Feito com ⚡ por <a href="https://github.com/Artfel0216">Arthur Fellipe</a>
</p>
```
