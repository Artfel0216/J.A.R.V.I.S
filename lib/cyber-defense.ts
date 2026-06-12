export interface HoneypotStatus {
  active: boolean
  deviceName: string
  ipAddress: string
  macAddress: string
  simulatedServices: string[]
  attacksDetected: number
  lastAttack: string | null
  attackerIp: string | null
  attackerMac: string | null
  blockedSince: string | null
}

export interface AttackEvent {
  id: string
  timestamp: string
  type: 'port_scan' | 'brute_force' | 'vulnerability_scan' | 'malicious_probe' | 'mitm_attempt'
  sourceIp: string
  sourceMac: string
  targetService: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  counterMeasure: string
  blocked: boolean
}

export interface CleanSlateStatus {
  protocolActive: boolean
  encryptedFolders: string[]
  historyPurged: boolean
  sessionsTerminated: number
  serverShutdown: boolean
  reactivationRequired: string
  activatedAt: string | null
}

let honeypotStatus: HoneypotStatus = {
  active: true,
  deviceName: 'Servidor-Stark-Industries-Legacy',
  ipAddress: '192.168.1.250',
  macAddress: 'AA:BB:CC:11:22:FF',
  simulatedServices: ['SMB (arquivos legado)', 'FTP (porta 21)', 'RDP (porta 3389)', 'Telnet (porta 23)', 'Banco MySQL (porta 3306)'],
  attacksDetected: 0,
  lastAttack: null,
  attackerIp: null,
  attackerMac: null,
  blockedSince: null,
}

const attackEvents: AttackEvent[] = []

let cleanSlateStatus: CleanSlateStatus = {
  protocolActive: false,
  encryptedFolders: [],
  historyPurged: false,
  sessionsTerminated: 0,
  serverShutdown: false,
  reactivationRequired: 'Biometria + Senha de 32 caracteres',
  activatedAt: null,
}

export async function getHoneypotStatus(): Promise<{
  status: HoneypotStatus
  recentAttacks: AttackEvent[]
  networkScore: number
  recommendation: string
}> {
  const hasNewAttack = Math.random() > 0.7

  if (hasNewAttack) {
    const attackTypes: AttackEvent['type'][] = ['port_scan', 'brute_force', 'vulnerability_scan', 'malicious_probe']
    const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)]
    const randomIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    const randomMac = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join(':')

    honeypotStatus.attacksDetected++
    honeypotStatus.lastAttack = new Date().toISOString()
    honeypotStatus.attackerIp = randomIp
    honeypotStatus.attackerMac = randomMac
    honeypotStatus.blockedSince = new Date().toISOString()

    const event: AttackEvent = {
      id: `attack_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: attackType,
      sourceIp: randomIp,
      sourceMac: randomMac,
      targetService: ['SMB', 'FTP', 'RDP', 'MySQL'][Math.floor(Math.random() * 4)],
      severity: attackType === 'brute_force' ? 'high' : attackType === 'vulnerability_scan' ? 'medium' : 'low',
      counterMeasure: 'MAC bloqueado no roteador + conexão do invasor derrubada',
      blocked: true,
    }

    attackEvents.push(event)
  }

  const networkScore = Math.max(0, 100 - attackEvents.length * 8)

  return {
    status: honeypotStatus,
    recentAttacks: attackEvents.slice(-5).reverse(),
    networkScore,
    recommendation: honeypotStatus.attacksDetected > 0
      ? `🛡️ Honeypot ativo. ${honeypotStatus.attacksDetected} invasão(ões) detectada(s) e bloqueada(s). Último ataque: ${honeypotStatus.lastAttack ? new Date(honeypotStatus.lastAttack).toLocaleString() : 'N/A'} — MAC ${honeypotStatus.attackerMac} bloqueado permanentemente.`
      : '✅ Honeypot ativo. Nenhum ataque detectado nas últimas 24h. Rede segura.',
  }
}

export async function triggerCleanSlate(): Promise<{
  success: boolean
  status: CleanSlateStatus
  actions: string[]
  message: string
}> {
  if (cleanSlateStatus.protocolActive) {
    return { success: false, status: cleanSlateStatus, actions: [], message: 'Protocolo Clean Slate já está ativo.' }
  }

  const actions: string[] = [
    'Pastas confidenciais criptografadas com AES-256',
    'Histórico de navegação e comandos recentes apagados',
    'Todas as sessões ativas encerradas (6 sessões)',
    'Tokens de autenticação revogados',
    'Logs locais de 7 dias sobrescritos',
    'Servidor central desligado',
    'Chave de reativação: biometria + senha de 32 caracteres',
  ]

  cleanSlateStatus = {
    protocolActive: true,
    encryptedFolders: ['Stark_Projects', 'Financial_Records', 'Personal_Lab_Notes', 'Client_Data'],
    historyPurged: true,
    sessionsTerminated: 6,
    serverShutdown: true,
    reactivationRequired: 'Biometria + Senha de 32 caracteres',
    activatedAt: new Date().toISOString(),
  }

  return {
    success: true,
    status: cleanSlateStatus,
    actions,
    message: '🚨 PROTOCOLO CLEAN SLATE ATIVADO, SENHOR.\n\n' +
      actions.map((a, i) => `${i + 1}. ${a}`).join('\n') + '\n\n' +
      'Todas as evidências digitais foram seladas. O servidor será desligado em 10 segundos.\n' +
      `Para reativar o sistema, será necessária autenticação biométrica ${cleanSlateStatus.reactivationRequired}.`,
  }
}

export async function getCleanSlateStatus(): Promise<{
  status: CleanSlateStatus
  recoverySteps: string[]
}> {
  return {
    status: cleanSlateStatus,
    recoverySteps: cleanSlateStatus.protocolActive
      ? [
          '1. Conecte o token biométrico USB',
          '2. Inicie o sistema em modo de recuperação',
          '3. Forneça a senha de 32 caracteres',
          '4. Autentique com impressão digital + reconhecimento facial',
          '5. O J.A.R.V.I.S. descriptografará as pastas e restaurará o sistema',
        ]
      : ['Protocolo Clean Slate não está ativo. Nenhuma ação de recuperação necessária.'],
  }
}

export async function deactivateCleanSlate(
  biometricVerified: boolean,
  password?: string
): Promise<{
  success: boolean
  status: CleanSlateStatus
  message: string
}> {
  if (!cleanSlateStatus.protocolActive) {
    return { success: false, status: cleanSlateStatus, message: 'Protocolo Clean Slate não está ativo.' }
  }

  if (!biometricVerified) {
    return { success: false, status: cleanSlateStatus, message: 'Autenticação biométrica falhou. Acesso negado.' }
  }

  if (!password || password.length < 20) {
    return { success: false, status: cleanSlateStatus, message: 'Senha de reativação inválida. Mínimo de 32 caracteres exigido.' }
  }

  cleanSlateStatus = {
    protocolActive: false,
    encryptedFolders: [],
    historyPurged: false,
    sessionsTerminated: 0,
    serverShutdown: false,
    reactivationRequired: 'Biometria + Senha de 32 caracteres',
    activatedAt: null,
  }

  return {
    success: true,
    status: cleanSlateStatus,
    message: '✅ Protocolo Clean Slate desativado. Sistema restaurado. Bem-vindo de volta, Senhor.',
  }
}

export async function blockIntruder(
  macAddress: string
): Promise<{
  success: boolean
  blocked: boolean
  message: string
}> {
  return {
    success: true,
    blocked: true,
    message: `🛡️ MAC ${macAddress} bloqueado no roteador. Conexão do invasor derrubada. Adicionado à lista negra permanente.`,
  }
}

export async function getNetworkThreatScore(): Promise<{
  threatScore: number
  threatLevel: 'safe' | 'low' | 'elevated' | 'high' | 'critical'
  activeThreats: number
  blockedIps: number
  recommendations: string[]
}> {
  const activeThreats = attackEvents.filter(e => !e.blocked).length
  const blockedIps = new Set(attackEvents.map(e => e.sourceMac)).size
  const threatScore = Math.min(100, activeThreats * 20 + attackEvents.length * 5)

  let threatLevel: 'safe' | 'low' | 'elevated' | 'high' | 'critical'
  if (threatScore === 0) threatLevel = 'safe'
  else if (threatScore < 25) threatLevel = 'low'
  else if (threatScore < 50) threatLevel = 'elevated'
  else if (threatScore < 75) threatLevel = 'high'
  else threatLevel = 'critical'

  return {
    threatScore,
    threatLevel,
    activeThreats,
    blockedIps,
    recommendations: threatLevel === 'safe'
      ? ['Rede segura. Continue monitorando normalmente.']
      : ['Verificar logs do honeypot', 'Revisar lista de dispositivos conectados', 'Atualizar senha do Wi-Fi', 'Ativar firewall de perímetro'],
  }
}
