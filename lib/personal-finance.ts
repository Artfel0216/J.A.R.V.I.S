export interface PriceAlert {
  productName: string
  targetPrice: number
  currentPrice: number
  store: string
  url: string
  reached: boolean
  lastChecked: string
}

export interface UtilityBill {
  month: string
  electricityKwh: number
  electricityCost: number
  waterM3: number
  waterCost: number
  internetCost: number
  totalCost: number
  projectedOverage: number
  overBudget: boolean
  budgetLimit: number
}

export interface SpendingInsight {
  category: string
  monthlySpend: number
  trend: 'up' | 'down' | 'stable'
  percentageChange: number
  suggestion: string | null
}

let priceAlerts: PriceAlert[] = [
  { productName: 'RTX 5090', targetPrice: 3000, currentPrice: 4599, store: 'Kabum', url: 'kabum.com.br/rtx5090', reached: false, lastChecked: new Date().toISOString() },
  { productName: 'Monitor Ultrawide 49"', targetPrice: 2500, currentPrice: 3200, store: 'Amazon', url: 'amazon.com.br/ultrawide49', reached: false, lastChecked: new Date().toISOString() },
  { productName: 'MacBook Pro M4', targetPrice: 12000, currentPrice: 14999, store: 'Melhor Preco', url: 'mercadolivre.com.br/macbook', reached: false, lastChecked: new Date().toISOString() },
]

export async function trackPrice(productName: string, targetPrice: number): Promise<{
  success: boolean
  alert: PriceAlert
  message: string
}> {
  const existing = priceAlerts.find(a => a.productName.toLowerCase() === productName.toLowerCase())
  if (existing) {
    return {
      success: true,
      alert: existing,
      message: 'Alerta ja existe para "' + productName + '" a R$ ' + targetPrice + '. Preco atual: R$ ' + existing.currentPrice,
    }
  }

  const newAlert: PriceAlert = {
    productName,
    targetPrice,
    currentPrice: Math.round(targetPrice * (1 + Math.random() * 0.5)),
    store: 'Monitoramento Ativo',
    url: '',
    reached: false,
    lastChecked: new Date().toISOString(),
  }

  priceAlerts.push(newAlert)
  return {
    success: true,
    alert: newAlert,
    message: 'Alerta de preco ativo para "' + productName + '". Avisarei quando chegar em R$ ' + targetPrice + '.',
  }
}

export async function checkPriceAlerts(): Promise<{
  alerts: PriceAlert[]
  reachedAlerts: PriceAlert[]
  activeAlerts: number
  message: string | null
}> {
  priceAlerts = priceAlerts.map(alert => {
    const fluctuation = Math.round((Math.random() * 200 - 100))
    const newPrice = Math.round(Math.max(alert.targetPrice * 0.8, alert.currentPrice + fluctuation))
    return {
      ...alert,
      currentPrice: newPrice,
      reached: newPrice <= alert.targetPrice,
      lastChecked: new Date().toISOString(),
    }
  })

  const reached = priceAlerts.filter(a => a.reached)
  const message = reached.length > 0
    ? 'OPORTUNIDADE! ' + reached.map(a => a.productName + ' chegou a R$ ' + a.currentPrice + ' (' + a.store + ')').join('. ')
    : null

  return {
    alerts: priceAlerts,
    reachedAlerts: reached,
    activeAlerts: priceAlerts.length,
    message,
  }
}

export async function getUtilityBills(): Promise<UtilityBill> {
  const isOver = Math.random() > 0.6
  const kwh = 350 + Math.round(Math.random() * 250)
  const kwhRate = 0.95
  const electricityCost = Math.round(kwh * kwhRate * 100) / 100
  const waterM3 = 15 + Math.round(Math.random() * 15)
  const waterCost = waterM3 * 12
  const internetCost = 119.90
  const totalCost = Math.round((electricityCost + waterCost + internetCost) * 100) / 100
  const budgetLimit = 550
  const projectedOverage = isOver ? Math.round((totalCost - budgetLimit) * 100) / 100 : 0

  return {
    month: new Date().toLocaleString('pt-BR', { month: 'long' }),
    electricityKwh: kwh,
    electricityCost,
    waterM3,
    waterCost,
    internetCost,
    totalCost,
    projectedOverage,
    overBudget: isOver,
    budgetLimit,
  }
}

export async function getSpendingInsights(): Promise<{
  insights: SpendingInsight[]
  totalMonthly: number
  topCategory: string
  message: string
}> {
  const insights: SpendingInsight[] = [
    { category: 'Assinaturas', monthlySpend: 181.50, trend: 'down', percentageChange: 12, suggestion: 'Voce cancelou servicos nao usados. Otimo trabalho.' },
    { category: 'Alimentacao', monthlySpend: 890.00, trend: 'up', percentageChange: 8, suggestion: 'Gastos com delivery aumentaram. Que tal cozinhar em casa 2x por semana?' },
    { category: 'Transporte', monthlySpend: 320.00, trend: 'stable', percentageChange: 2, suggestion: null },
    { category: 'Energia', monthlySpend: 450.00, trend: 'up', percentageChange: 15, suggestion: 'Consumo de energia subiu 15%. Verificar ar-condicionado e servidor.' },
  ]

  const totalMonthly = insights.reduce((acc, i) => acc + i.monthlySpend, 0)

  return {
    insights,
    totalMonthly,
    topCategory: 'Alimentacao',
    message: 'Gastos do mes: R$ ' + totalMonthly.toFixed(2) + '. Categoria de maior gasto: Alimentacao (R$ 890). Sugiro revisar o orcamento de delivery.',
  }
}
