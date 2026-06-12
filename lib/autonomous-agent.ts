export interface MaintenanceItem {
  item: string
  category: 'filter' | 'battery' | 'supply' | 'hardware'
  status: 'good' | 'warning' | 'critical'
  estimatedLifeLeft: string
  lastReplaced?: string
  autoAddedToShoppingList: boolean
}

export interface UrgencyAnalysis {
  originalMessage: string
  sender: string
  isEmergency: boolean
  category: 'work' | 'personal' | 'spam' | 'emergency' | 'unknown'
  shouldInterrupt: boolean
  summary: string
}

export interface Subscription {
  name: string
  provider: string
  monthlyCost: number
  lastUsed: string | null
  active: boolean
  daysSinceLastUse: number
  suggestedAction: 'keep' | 'review' | 'cancel'
}

const maintenanceItems: MaintenanceItem[] = [
  { item: 'Filtro de Ar - Escritório', category: 'filter', status: 'warning', estimatedLifeLeft: '15 dias', lastReplaced: '2026-04-01', autoAddedToShoppingList: false },
  { item: 'Filtro de Água - Cozinha', category: 'filter', status: 'good', estimatedLifeLeft: '45 dias', lastReplaced: '2026-03-15', autoAddedToShoppingList: false },
  { item: 'Bateria - UPS Servidor', category: 'battery', status: 'warning', estimatedLifeLeft: '20 dias', lastReplaced: '2025-12-01', autoAddedToShoppingList: false },
  { item: 'Cápsulas de Café', category: 'supply', status: 'critical', estimatedLifeLeft: '3 dias', lastReplaced: undefined, autoAddedToShoppingList: false },
  { item: 'Cartucho de Impressão 3D', category: 'supply', status: 'good', estimatedLifeLeft: '60 dias', lastReplaced: '2026-05-01', autoAddedToShoppingList: false },
]

const subscriptions: Subscription[] = [
  { name: 'Netflix Premium', provider: 'Netflix', monthlyCost: 55.90, lastUsed: '2026-06-01', active: true, daysSinceLastUse: 11, suggestedAction: 'keep' },
  { name: 'HBO Max', provider: 'Warner', monthlyCost: 34.90, lastUsed: '2026-05-10', active: true, daysSinceLastUse: 33, suggestedAction: 'review' },
  { name: 'Amazon Prime', provider: 'Amazon', monthlyCost: 19.90, lastUsed: '2026-06-10', active: true, daysSinceLastUse: 2, suggestedAction: 'keep' },
  { name: 'Disney+', provider: 'Disney', monthlyCost: 33.90, lastUsed: '2026-03-01', active: true, daysSinceLastUse: 103, suggestedAction: 'cancel' },
  { name: 'Spotify Premium', provider: 'Spotify', monthlyCost: 21.90, lastUsed: '2026-06-11', active: true, daysSinceLastUse: 1, suggestedAction: 'keep' },
  { name: 'Medium - Assinatura', provider: 'Medium', monthlyCost: 15.00, lastUsed: '2026-04-15', active: true, daysSinceLastUse: 57, suggestedAction: 'cancel' },
]

export async function checkMaintenance(): Promise<{
  items: MaintenanceItem[]
  criticalItems: MaintenanceItem[]
  warningItems: MaintenanceItem[]
  shoppingListAdditions: string[]
  message: string
}> {
  const criticalItems = maintenanceItems.filter(i => i.status === 'critical')
  const warningItems = maintenanceItems.filter(i => i.status === 'warning')
  const shoppingListAdditions: string[] = []
  let message = ''

  criticalItems.forEach(item => {
    if (!item.autoAddedToShoppingList) {
      item.autoAddedToShoppingList = true
      shoppingListAdditions.push(item.item)
    }
  })

  if (criticalItems.length > 0) {
    message = `⚠️ Itens críticos precisam de reposição: ${criticalItems.map(i => i.item).join(', ')}. Adicionados automaticamente à lista de compras.`
  } else if (warningItems.length > 0) {
    message = `📋 Itens precisam de atenção em breve: ${warningItems.map(i => `${i.item} (${i.estimatedLifeLeft})`).join(', ')}.`
  } else {
    message = '✅ Todos os itens de manutenção estão em bom estado.'
  }

  return { items: maintenanceItems, criticalItems, warningItems, shoppingListAdditions, message }
}

export async function triageUrgency(
  senderName: string,
  messageContent: string
): Promise<UrgencyAnalysis> {
  const emergencyKeywords = [
    'emergência', 'urgente', 'fogo', 'incêndio', 'acidente', 'hospital',
    'socorro', 'perigo', 'roubo', 'assalto', 'acident', 'quebrou',
    'vazamento', 'injúri', 'médico', 'ambulância', 'polícia',
  ]

  const workKeywords = ['reunião', 'projeto', 'relatório', 'prazo', 'entrega', 'cliente', 'stark industries']

  const lower = messageContent.toLowerCase()

  const isEmergency = emergencyKeywords.some(k => lower.includes(k))
  const isWork = workKeywords.some(k => lower.includes(k))

  let category: UrgencyAnalysis['category'] = 'unknown'
  if (isEmergency) category = 'emergency'
  else if (isWork) category = 'work'
  else category = 'personal'

  const shouldInterrupt = isEmergency
  const summary = isEmergency
    ? `⚠️ EMERGÊNCIA DETECTADA: "${senderName}" enviou "${messageContent.substring(0, 100)}"`
    : `Mensagem de ${senderName}: "${messageContent.substring(0, 80)}..."`

  return {
    originalMessage: messageContent,
    sender: senderName,
    isEmergency,
    category,
    shouldInterrupt,
    summary,
  }
}

export async function optimizeFinances(): Promise<{
  subscriptions: Subscription[]
  totalMonthlySpending: number
  suggestedCancellations: Subscription[]
  potentialMonthlySavings: number
  message: string
}> {
  const suggestedCancellations = subscriptions.filter(s => s.suggestedAction === 'cancel')
  const totalMonthlySpending = subscriptions.reduce((acc, s) => acc + s.monthlyCost, 0)
  const potentialMonthlySavings = suggestedCancellations.reduce((acc, s) => acc + s.monthlyCost, 0)

  let message: string
  if (suggestedCancellations.length > 0) {
    const list = suggestedCancellations.map(s => `${s.name} (R$ ${s.monthlyCost.toFixed(2)}) - ${s.daysSinceLastUse} dias sem uso`).join(', ')
    message = `💰 Otimização financeira: ${suggestedCancellations.length} assinatura(s) sem uso há mais de 30 dias encontrada(s): ${list}. Cancelamento pode economizar R$ ${potentialMonthlySavings.toFixed(2)}/mês.`
  } else {
    message = '✅ Todas as assinaturas estão sendo utilizadas regularmente. Nenhuma economia identificada no momento.'
  }

  return {
    subscriptions,
    totalMonthlySpending: Math.round(totalMonthlySpending * 100) / 100,
    suggestedCancellations,
    potentialMonthlySavings: Math.round(potentialMonthlySavings * 100) / 100,
    message,
  }
}

export async function filterSpam(messageContent: string): Promise<{
  isSpam: boolean
  confidence: number
  reason: string | null
}> {
  const spamPatterns = [
    /\b(grátis|free|promoção|promo|desconto.*imperd[ií]vel|clique.*aqui|ganhe.*dinheiro)\b/i,
    /\b(você.*ganhou|parabéns.*prêmio|últimas.*vagas|investimento.*garantido)\b/i,
    /\b(viagra|emagreça|perdeu.*peso|cryptomoedas.*fácil)\b/i,
  ]

  for (const pattern of spamPatterns) {
    if (pattern.test(messageContent)) {
      return { isSpam: true, confidence: 0.85, reason: 'Padrão de spam comercial detectado.' }
    }
  }

  const repeatedChars = /(.)\1{4,}/.test(messageContent)
  const allCaps = messageContent.length > 20 && messageContent === messageContent.toUpperCase() && /[A-Z]{10,}/.test(messageContent)

  if (repeatedChars) {
    return { isSpam: true, confidence: 0.6, reason: 'Caracteres repetitivos anormais.' }
  }
  if (allCaps) {
    return { isSpam: true, confidence: 0.5, reason: 'Mensagem em CAIXA ALTA excessiva.' }
  }

  return { isSpam: false, confidence: 0.98, reason: null }
}
