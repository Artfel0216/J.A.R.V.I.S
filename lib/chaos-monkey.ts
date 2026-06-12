export interface ChaosChallenge {
  id: string
  type: 'network' | 'env_var' | 'code_bug' | 'config_break' | 'service_kill' | 'dns_hijack' | 'firewall_rule' | 'git_sabotage'
  title: string
  description: string
  hint: string
  solution: string
  severity: 'easy' | 'medium' | 'hard' | 'stark'
  startedAt: string
  timeLimitMinutes: number
  resolved: boolean
  expired: boolean
}

export interface ChaosSession {
  active: boolean
  currentChallenge: ChaosChallenge | null
  challengesCompleted: number
  challengesFailed: number
  score: number
  startedAt: string | null
  difficulty: 'easy' | 'medium' | 'hard' | 'stark'
}

const challengePool: Omit<ChaosChallenge, 'id' | 'startedAt' | 'resolved' | 'expired'>[] = [
  {
    type: 'network',
    title: 'Corte de Rota de Rede',
    description: 'Jarvis desativou a rota padrão do gateway. Você não consegue acessar a internet. Descubra qual rota foi removida e restaure-a.',
    hint: 'Use "route print" ou "ip route" para listar as rotas. A rota padrão tem destino 0.0.0.0/0.',
    solution: 'Adicionar rota padrão: route add 0.0.0.0 mask 0.0.0.0 <gateway_ip>',
    severity: 'easy',
    timeLimitMinutes: 5,
  },
  {
    type: 'env_var',
    title: 'Variável de Ambiente Sabotada',
    description: 'Jarvis alterou o valor de PATH (ou NODE_PATH, ou outra variável crítica). Comandos como node, npm ou git pararam de funcionar. Encontre e corrija.',
    hint: 'Compare "echo %PATH%" com o valor original. Verifique se algum diretório foi removido ou corrompido.',
    solution: 'Restaurar PATH original via setx PATH <valor_original> ou editar manualmente.',
    severity: 'easy',
    timeLimitMinutes: 5,
  },
  {
    type: 'code_bug',
    title: 'Bug Injetado no Código',
    description: 'Jarvis injetou um bug sutil no código-fonte. O projeto compila mas uma função específica retorna resultados errados. Encontre e corrija.',
    hint: 'Procure por operadores trocados (== por !=, + por -), valores hardcoded ou lógica invertida em condicionais.',
    solution: 'Reverter a alteração maliciosa. Verificar diff do git para encontrar o arquivo modificado.',
    severity: 'medium',
    timeLimitMinutes: 10,
  },
  {
    type: 'config_break',
    title: 'Configuração do Servidor Corrompida',
    description: 'Jarvis corrompeu um arquivo de configuração crítico (nginx.conf, .env, tsconfig.json). O servidor não sobe mais. Diagnostique e corrija.',
    hint: 'Verifique os logs do servidor. O erro geralmente aponta a linha exata do problema de configuração.',
    solution: 'Restaurar o arquivo de configuração do backup ou reescrever a seção corrompida.',
    severity: 'medium',
    timeLimitMinutes: 10,
  },
  {
    type: 'service_kill',
    title: 'Serviço Crítico Derrubado',
    description: 'Jarvis derrubou um serviço essencial (banco de dados, servidor web, Docker). Descubra qual serviço parou e reinicie-o.',
    hint: 'Use "sc query" ou "Get-Service" para listar serviços. Procure por serviços com status "Stopped" que deveriam estar "Running".',
    solution: 'Reiniciar o serviço: Start-Service <nome> ou net start <nome>.',
    severity: 'easy',
    timeLimitMinutes: 5,
  },
  {
    type: 'dns_hijack',
    title: 'Sequestro de DNS',
    description: 'Jarvis alterou o arquivo hosts do Windows para redirecionar domínios conhecidos (github.com, npmjs.com) para 127.0.0.1. Você não consegue acessar repositórios.',
    hint: 'Verifique o arquivo C:\\Windows\\System32\\drivers\\etc\\hosts. Procure por entradas suspeitas.',
    solution: 'Remover as entradas maliciosas do arquivo hosts.',
    severity: 'easy',
    timeLimitMinutes: 5,
  },
  {
    type: 'firewall_rule',
    title: 'Regra de Firewall Restritiva',
    description: 'Jarvis adicionou uma regra no firewall bloqueando todas as conexões na porta 3000 (ou 443). Seu servidor local não responde mais.',
    hint: 'Use "netsh advfirewall firewall show rule" para listar regras. Procure por regras de bloqueio recentes.',
    solution: 'Remover a regra: netsh advfirewall firewall delete rule name="<nome_da_regra>"',
    severity: 'medium',
    timeLimitMinutes: 8,
  },
  {
    type: 'git_sabotage',
    title: 'Histórico Git Comprometido',
    description: 'Jarvis fez um rebase ou force push em um branch e "perdeu" os últimos 3 commits. Recupere o trabalho perdido usando o reflog.',
    hint: 'Use "git reflog" para encontrar os commits perdidos e "git cherry-pick" ou "git reset" para recuperá-los.',
    solution: 'git reflog para encontrar o hash, depois git cherry-pick ou git reset --hard <hash>',
    severity: 'hard',
    timeLimitMinutes: 15,
  },
  {
    type: 'config_break',
    title: 'Dependência Quebrada (Stark Level)',
    description: 'Jarvis editou o package.json para apontar uma dependência para um pacote inexistente ou versão incompatível. O npm install falha, mas o erro não é óbvio.',
    hint: 'Leia atentamente o erro do npm install. Procure por dependências com nomes suspeitos ou versões que não existem.',
    solution: 'Reverter a alteração no package.json e rodar npm install.',
    severity: 'stark',
    timeLimitMinutes: 12,
  },
  {
    type: 'code_bug',
    title: 'Loop Infinito (Stark Level)',
    description: 'Jarvis introduziu um loop infinito no código. O servidor web funciona, mas uma rota específica faz a CPU disparar para 100% e nunca responde.',
    hint: 'Monitore a CPU com "tasklist" ou "Get-Process". Acesse rotas uma a uma até encontrar a que trava. Procure por while(true) ou for(;;) sem break.',
    solution: 'Remover o loop infinito ou adicionar uma condição de saída adequada.',
    severity: 'stark',
    timeLimitMinutes: 15,
  },
]

let currentSession: ChaosSession = {
  active: false,
  currentChallenge: null,
  challengesCompleted: 0,
  challengesFailed: 0,
  score: 0,
  startedAt: null,
  difficulty: 'medium',
}

let availableChallenges: Omit<ChaosChallenge, 'id' | 'startedAt' | 'resolved' | 'expired'>[] = [...challengePool]

export async function activateChaosMonkey(
  difficulty?: 'easy' | 'medium' | 'hard' | 'stark'
): Promise<{
  success: boolean
  session: ChaosSession
  challenge: ChaosChallenge | null
  message: string
}> {
  const filteredPool = difficulty
    ? challengePool.filter(c => c.severity === difficulty)
    : challengePool.filter(c => c.severity === 'medium' || c.severity === 'hard')

  if (filteredPool.length === 0) {
    return {
      success: false,
      session: currentSession,
      challenge: null,
      message: 'Nenhum desafio disponível para a dificuldade selecionada, Senhor.',
    }
  }

  const randomChallenge = filteredPool[Math.floor(Math.random() * filteredPool.length)]

  const challenge: ChaosChallenge = {
    ...randomChallenge,
    id: `chaos_${Date.now()}`,
    startedAt: new Date().toISOString(),
    resolved: false,
    expired: false,
  }

  currentSession = {
    active: true,
    currentChallenge: challenge,
    challengesCompleted: 0,
    challengesFailed: 0,
    score: 0,
    startedAt: challenge.startedAt,
    difficulty: difficulty || 'medium',
  }

  return {
    success: true,
    session: currentSession,
    challenge,
    message: `⚡ MODO CHAOS MONKEY ATIVADO, SENHOR!\n\nDesafio: ${challenge.title}\nDificuldade: ${challenge.severity.toUpperCase()}\nTempo limite: ${challenge.timeLimitMinutes} minutos\n\n${challenge.description}\n\nDica: ${challenge.hint}\n\nO relógio está correndo. Boa sorte.`,
  }
}

export async function getChaosStatus(): Promise<{
  session: ChaosSession
  remainingTime: number | null
  message: string
}> {
  if (!currentSession.active || !currentSession.currentChallenge) {
    return {
      session: currentSession,
      remainingTime: null,
      message: 'Nenhum desafio ativo no momento. Peça para ativar o Chaos Monkey quando estiver pronto para o treinamento.',
    }
  }

  const startedAt = new Date(currentSession.currentChallenge.startedAt).getTime()
  const elapsed = Date.now() - startedAt
  const limitMs = currentSession.currentChallenge.timeLimitMinutes * 60 * 1000
  const remaining = Math.max(0, Math.floor((limitMs - elapsed) / 1000))

  if (remaining <= 0 && !currentSession.currentChallenge.resolved) {
    currentSession.currentChallenge.expired = true
    currentSession.challengesFailed++
    currentSession.active = false

    return {
      session: currentSession,
      remainingTime: 0,
      message: `⏰ TEMPO ESGOTADO, SENHOR!\n\nSolução do desafio "${currentSession.currentChallenge.title}":\n${currentSession.currentChallenge.solution}\n\nTente novamente — até o Stark mais brilhante já falhou antes de acertar.`,
    }
  }

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  return {
    session: currentSession,
    remainingTime: remaining,
    message: `⏱️ ${minutes}:${seconds.toString().padStart(2, '0')} restantes. Desafio: ${currentSession.currentChallenge.title}.`,
  }
}

export async function resolveChaosChallenge(
  answer?: string
): Promise<{
  success: boolean
  correct: boolean
  session: ChaosSession
  pointsEarned: number
  message: string
}> {
  if (!currentSession.active || !currentSession.currentChallenge) {
    return {
      success: false,
      correct: false,
      session: currentSession,
      pointsEarned: 0,
      message: 'Nenhum desafio ativo para resolver, Senhor.',
    }
  }

  const challenge = currentSession.currentChallenge

  if (challenge.expired || challenge.resolved) {
    return {
      success: false,
      correct: false,
      session: currentSession,
      pointsEarned: 0,
      message: 'Este desafio já foi encerrado.',
    }
  }

  const difficultyPoints: Record<string, number> = {
    easy: 100,
    medium: 250,
    hard: 500,
    stark: 1000,
  }

  const points = difficultyPoints[challenge.severity] || 100
  const timeBonus = challenge.timeLimitMinutes > 0
    ? Math.floor(points * 0.3)
    : 0

  challenge.resolved = true
  currentSession.challengesCompleted++
  currentSession.score += points + timeBonus
  currentSession.active = false

  return {
    success: true,
    correct: true,
    session: currentSession,
    pointsEarned: points + timeBonus,
    message: `✅ DESAFIO CONCLUÍDO, SENHOR!\n\nDesafio: ${challenge.title}\nPontos base: +${points}\nBônus de tempo: +${timeBonus}\nTotal: +${points + timeBonus} pontos\n\nScore total: ${currentSession.score} pontos\nDesafios completados: ${currentSession.challengesCompleted}\n\nSolução esperada: ${challenge.solution}`,
  }
}

export async function getChaosScoreboard(): Promise<{
  session: ChaosSession
  achievements: string[]
  level: string
  nextLevel: string
  pointsToNextLevel: number
}> {
  const levelThresholds = [
    { name: 'Estagiário de Tecnologia', minScore: 0 },
    { name: 'Técnico de Laboratório', minScore: 300 },
    { name: 'Engenheiro de Sistemas', minScore: 750 },
    { name: 'Arquiteto de Software', minScore: 1500 },
    { name: 'Mestre em Segurança', minScore: 2500 },
    { name: 'Gênio da Infraestrutura', minScore: 4000 },
    { name: 'Lenda Viva (Tony Stark)', minScore: 6000 },
  ]

  let currentLevel = levelThresholds[0].name
  let nextLevel = 'Máximo'
  let pointsToNextLevel = 0

  for (let i = 0; i < levelThresholds.length; i++) {
    if (currentSession.score >= levelThresholds[i].minScore) {
      currentLevel = levelThresholds[i].name
      if (i + 1 < levelThresholds.length) {
        nextLevel = levelThresholds[i + 1].name
        pointsToNextLevel = levelThresholds[i + 1].minScore - currentSession.score
      } else {
        nextLevel = 'Máximo alcançado!'
        pointsToNextLevel = 0
      }
    }
  }

  const achievements: string[] = []
  if (currentSession.challengesCompleted >= 1) achievements.push('🥇 Primeiro Desafio')
  if (currentSession.challengesCompleted >= 5) achievements.push('🏆 Veterano Chaos Monkey')
  if (currentSession.challengesCompleted >= 10) achievements.push('👑 Mestre do Caos')
  if (currentSession.score >= 1000) achievements.push('💻 Engenheiro de Elite')
  if (currentSession.score >= 2500) achievements.push('🛡️ Guardião da Infraestrutura')

  return {
    session: currentSession,
    achievements,
    level: currentLevel,
    nextLevel,
    pointsToNextLevel,
  }
}

export async function listChaosChallenges(): Promise<{
  challenges: { type: string; title: string; severity: string; timeLimitMinutes: number }[]
}> {
  return {
    challenges: challengePool.map(c => ({
      type: c.type,
      title: c.title,
      severity: c.severity,
      timeLimitMinutes: c.timeLimitMinutes,
    })),
  }
}
