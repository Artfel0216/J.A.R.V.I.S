export interface AmbientLightState {
  active: boolean
  mode: 'music' | 'video' | 'game' | 'off'
  dominantColor: string
  brightness: number
  transition: 'smooth' | 'pulse' | 'beat'
}

export interface RPGState {
  active: boolean
  scenario: string
  playerName: string
  scene: string
  choices: string[]
  soundtrack: string
  narrative: string
}

const lightState: AmbientLightState = {
  active: false,
  mode: 'off',
  dominantColor: '#000000',
  brightness: 50,
  transition: 'smooth',
}

let rpgSession: RPGState | null = null

export async function syncAmbilight(
  mode: AmbientLightState['mode'],
  _mediaType?: 'music' | 'movie' | 'game'
): Promise<{
  success: boolean
  state: AmbientLightState
  message: string
}> {
  lightState.active = true
  lightState.mode = mode
  lightState.transition = mode === 'music' ? 'beat' : 'smooth'

  const colorMap: Record<string, string> = {
    music: '#ff6b35',
    video: '#1a1a2e',
    game: '#e94560',
  }
  lightState.dominantColor = colorMap[mode] || '#ff6b35'
  lightState.brightness = mode === 'game' ? 70 : mode === 'music' ? 40 : 50

  return {
    success: true,
    state: { ...lightState },
    message: 'Iluminacao ambiente sincronizada em modo ' +
      (mode === 'music' ? 'musical (ritmo sincronizado)' :
       mode === 'video' ? 'cinema (luz suave envolvente)' :
       mode === 'game' ? 'gamer (cores dinâmicas)' : 'off'),
  }
}

export async function startRPG(
  playerName: string,
  scenario?: string
): Promise<RPGState> {
  const scenarios = [
    'Stark Industries - Uma noite no laboratorio',
    'Mansao Stark - Convidados indesejados',
    'Beco de Cingapura - Missao de reconhecimento',
    'Torre dos Vingadores - Protocolo de emergencia',
  ]

  const selectedScenario = scenario || scenarios[Math.floor(Math.random() * scenarios.length)]

  rpgSession = {
    active: true,
    scenario: selectedScenario,
    playerName,
    scene: 'Introducao',
    choices: [
      'Investigar o som suspeito no laboratorio',
      'Verificar os sistemas de seguranca',
      'Chamar o Happy Hogan para ajudar',
      'Ignorar e continuar trabalhando',
    ],
    soundtrack: 'Trilha sonora: "Iron Man 3 - Can You Dig It (Orchestral)"',
    narrative: 'Sao 23:47 na ' + selectedScenario + '. Voce, ' + playerName + ', esta' +
      ' ajustando os parametros do novo Reator Arc Mark VI quando ouve um barulho estranho vindo' +
      ' do andar inferior. O J.A.R.V.I.S. reporta: "Senhor, detectei uma anomalia no perímetro de' +
      ' segurança. Nao identifiquei nenhum dos nossos funcionarios autorizados no local."\n\n' +
      'O que voce faz?',
  }

  return rpgSession
}

export async function rpgChoice(choiceIndex: number): Promise<RPGState> {
  if (!rpgSession) {
    return {
      active: false,
      scenario: '',
      playerName: '',
      scene: 'Erro',
      choices: [],
      soundtrack: '',
      narrative: 'Nenhuma sessao de RPG ativa. Use startRPG para iniciar.',
    }
  }

  const outcomes = [
    'Voce se aproxima silenciosamente do laboratorio. As luzes estao apagadas, mas ha um brilho' +
    ' azul vindo do reator de prototipo. Ao entrar, encontra... Pepper Pots segurando uma caneca' +
    ' de cafe. "Desculpe, querido. Nao conseguia dormir."',
    'O J.A.R.V.I.S. ativa os protocolos de defesa. As cameras mostram... um gato siames que entrou' +
    ' pela janela da cozinha. "Parece que nosso intruso e o Sr. Whiskers, Senhor."',
    'Happy aparece em 2 minutos com um extintor de incendio na mao. "Onde esta o problema, chefe?"' +
    ' Nao ha perigo, mas a situacao vira uma noite de pizza e historias no laboratorio.',
    'Voce decide que nao vale o risco e continua soldando o reator. Mas... um alarme de verdade dispara' +
    ' 10 minutos depois. Talvez devesse ter investigado, Senhor.',
  ]

  const idx = Math.min(choiceIndex, outcomes.length - 1)
  rpgSession.scene = 'Resolucao'
  rpgSession.choices = []
  rpgSession.narrative = outcomes[idx]

  return rpgSession
}
