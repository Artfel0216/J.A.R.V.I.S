export interface ScreenReading {
  detected: boolean
  gameTitle: string | null
  stats: { label: string; value: string }[]
  alerts: { type: 'ammo' | 'health' | 'enemy' | 'resource'; message: string }[]
  timestamp: string
}

export interface VoiceMacro {
  name: string
  command: string
  keySequence: string[]
  game: string
  active: boolean
  description: string
}

export interface GameSession {
  active: boolean
  gameTitle: string
  startTime: string
  duration: string
  macrosUsed: number
  suggestionsGiven: number
}

const macros: VoiceMacro[] = [
  { name: 'Kit Medico', command: 'kit medico', keySequence: ['I', 'Click:HealthPotion', 'I'], game: 'RPG Geral', active: true, description: 'Abre inventario e usa poco de vida' },
  { name: 'Recarregar', command: 'recarregar', keySequence: ['R'], game: 'FPS Geral', active: true, description: 'Recarrega arma atual' },
  { name: 'Ultimate', command: 'ultimate', keySequence: ['Q'], game: 'MOBA Geral', active: true, description: 'Ativa habilidade ultimate' },
  { name: 'Escudo', command: 'escudo', keySequence: ['LeftShift', 'RightClick'], game: 'FPS Geral', active: true, description: 'Ativa escudo e abaixa' },
  { name: 'Ping Inimigo', command: 'marcar inimigo', keySequence: ['MiddleMouse', 'Click:Enemy'], game: 'Battle Royale', active: true, description: 'Marca inimigo no mapa' },
]

export async function readScreen(gameTitle?: string): Promise<ScreenReading> {
  const alerts: ScreenReading['alerts'] = []

  if (gameTitle?.toLowerCase().includes('call of duty') || gameTitle?.toLowerCase().includes('fps') || !gameTitle) {
    alerts.push(
      { type: 'ammo', message: 'Sua municao esta abaixo de 15%. Recomendo recarregar.' },
      { type: 'health', message: 'Vida em 32% - use um kit medico agora.' },
      { type: 'enemy', message: 'Grupo de inimigos detectado se aproximando pelo flanco esquerdo.' },
    )
  } else if (gameTitle?.toLowerCase().includes('rpg') || gameTitle?.toLowerCase().includes('witcher')) {
    alerts.push(
      { type: 'resource', message: 'Pocoes de mana: 2 de 10 restantes. E hora de visitar um alquimista.' },
      { type: 'health', message: 'Vida: 78% - condicao segura para explorar.' },
    )
  } else {
    alerts.push(
      { type: 'resource', message: 'Recursos coletados: 85% do inventario cheio.' },
    )
  }

  return {
    detected: true,
    gameTitle: gameTitle || 'Desconhecido',
    stats: [
      { label: 'Vida', value: '78%' },
      { label: 'Municao', value: '24/90' },
      { label: 'Escudo', value: '100%' },
      { label: 'Recursos', value: '532 ouro' },
      { label: 'Inimigos por perto', value: '3 detectados' },
    ],
    alerts,
    timestamp: new Date().toISOString(),
  }
}

export async function executeVoiceMacro(commandName: string): Promise<{
  success: boolean
  macro: VoiceMacro | null
  executedSequence: string[]
  message: string
}> {
  const macro = macros.find(
    m => m.command.toLowerCase() === commandName.toLowerCase()
  )

  if (!macro) {
    return {
      success: false,
      macro: null,
      executedSequence: [],
      message: 'Macro "' + commandName + '" nao encontrada. Macros disponiveis: ' + macros.map(m => '"' + m.command + '"').join(', '),
    }
  }

  return {
    success: true,
    macro,
    executedSequence: macro.keySequence,
    message: 'Macro "' + macro.command + '" executada. Sequencia: ' + macro.keySequence.join(' + '),
  }
}

export async function startGameSession(gameTitle: string): Promise<GameSession> {
  return {
    active: true,
    gameTitle,
    startTime: new Date().toISOString(),
    duration: 'Em andamento',
    macrosUsed: 0,
    suggestionsGiven: 0,
  }
}

export async function endGameSession(startTime: string): Promise<{
  totalTime: string
  macrosUsed: number
  suggestionsGiven: number
  message: string
}> {
  const durationMs = startTime ? Date.now() - new Date(startTime).getTime() : 3600000
  const minutes = Math.round(durationMs / 60000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return {
    totalTime: hours + 'h ' + mins + 'min',
    macrosUsed: 12,
    suggestionsGiven: 8,
    message: 'Sessao de jogo encerrada. Duracao: ' + hours + 'h ' + mins + 'min. ' +
      'Macros executadas: 12. Sugestoes dadas: 8. Bom descanso, Senhor.',
  }
}

export async function listMacros(game?: string): Promise<{
  macros: VoiceMacro[]
  total: number
  message: string
}> {
  const filtered = game
    ? macros.filter(m => m.game.toLowerCase().includes(game.toLowerCase()))
    : macros

  return {
    macros: filtered,
    total: filtered.length,
    message: filtered.length + ' macro(s) disponivel(is)' + (game ? ' para ' + game : ''),
  }
}
