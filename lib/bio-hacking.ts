export interface FoodItem {
  id: string
  name: string
  category: 'vegetable' | 'fruit' | 'dairy' | 'protein' | 'grain' | 'condiment'
  expiryDate: string
  quantity: number
  unit: string
  nutrients: { magnesium: number; vitaminC: number; iron: number; calcium: number; potassium: number; fiber: number }
}

export interface NutritionProfile {
  magnesium: number
  vitaminC: number
  iron: number
  calcium: number
  potassium: number
  fiber: number
  calories: number
}

export interface RecipeSuggestion {
  name: string
  ingredients: string[]
  nutrientFocus: string[]
  prepTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  reason: string
}

export interface CircadianConfig {
  mode: 'auto' | 'manual' | 'disabled'
  currentKelvin: number
  currentBrightness: number
  timeOfDay: 'dawn' | 'morning' | 'afternoon' | 'sunset' | 'night'
  phase: string
  nextTransition: string
}

export interface MoodAnalysis {
  detectedMood: string
  burnoutRisk: number
  anxietyScore: number
  facialMicroExpressions: string[]
  voiceToneMetrics: { pitch: string; pace: string; energy: string }
  protocolActivated: string | null
  recommendation: string
}

const fridgeContents: FoodItem[] = [
  { id: 'food_1', name: 'Couve', category: 'vegetable', expiryDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], quantity: 1, unit: 'maço', nutrients: { magnesium: 87, vitaminC: 120, iron: 2.5, calcium: 150, potassium: 450, fiber: 4 } },
  { id: 'food_2', name: 'Ovos', category: 'protein', expiryDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0], quantity: 6, unit: 'unidades', nutrients: { magnesium: 12, vitaminC: 0, iron: 1.8, calcium: 50, potassium: 130, fiber: 0 } },
  { id: 'food_3', name: 'Leite', category: 'dairy', expiryDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], quantity: 1, unit: 'litro', nutrients: { magnesium: 24, vitaminC: 0, iron: 0.1, calcium: 300, potassium: 350, fiber: 0 } },
  { id: 'food_4', name: 'Peito de Frango', category: 'protein', expiryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], quantity: 500, unit: 'g', nutrients: { magnesium: 30, vitaminC: 0, iron: 1.3, calcium: 15, potassium: 250, fiber: 0 } },
  { id: 'food_5', name: 'Espinafre', category: 'vegetable', expiryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], quantity: 200, unit: 'g', nutrients: { magnesium: 79, vitaminC: 28, iron: 3.6, calcium: 99, potassium: 558, fiber: 2.2 } },
  { id: 'food_6', name: 'Banana', category: 'fruit', expiryDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0], quantity: 5, unit: 'unidades', nutrients: { magnesium: 32, vitaminC: 10, iron: 0.3, calcium: 6, potassium: 422, fiber: 3.1 } },
  { id: 'food_7', name: 'Mamão Papaia', category: 'fruit', expiryDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], quantity: 1, unit: 'unidade', nutrients: { magnesium: 21, vitaminC: 60, iron: 0.3, calcium: 24, potassium: 257, fiber: 2.5 } },
  { id: 'food_8', name: 'Iogurte Natural', category: 'dairy', expiryDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], quantity: 4, unit: 'unidades', nutrients: { magnesium: 25, vitaminC: 2, iron: 0.1, calcium: 180, potassium: 200, fiber: 0 } },
]

export async function scanFridge(): Promise<{
  items: FoodItem[]
  expiringSoon: FoodItem[]
  expired: FoodItem[]
  lowNutrients: string[]
  message: string
}> {
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 86400000 * 2)

  const expired = fridgeContents.filter(i => new Date(i.expiryDate) < now)
  const expiringSoon = fridgeContents.filter(i => {
    const d = new Date(i.expiryDate)
    return d >= now && d <= tomorrow
  })

  const estimatedDiet: NutritionProfile = {
    magnesium: 180, vitaminC: 40, iron: 4.5, calcium: 350, potassium: 1200, fiber: 8, calories: 1800,
  }

  const rda: NutritionProfile = {
    magnesium: 420, vitaminC: 100, iron: 14, calcium: 1000, potassium: 4700, fiber: 30, calories: 2500,
  }

  const lowNutrients: string[] = []
  const nutrientNames: Record<keyof NutritionProfile, string> = {
    magnesium: 'Magnésio', vitaminC: 'Vitamina C', iron: 'Ferro', calcium: 'Cálcio', potassium: 'Potássio', fiber: 'Fibras', calories: 'Calorias',
  }

  for (const key of Object.keys(rda) as (keyof NutritionProfile)[]) {
    if (key === 'calories') continue
    if (estimatedDiet[key] < rda[key] * 0.5) {
      lowNutrients.push(nutrientNames[key])
    }
  }

  let message = ''
  if (expiringSoon.length > 0) {
    const names = expiringSoon.map(i => i.name).join(', ')
    message = `⚠️ Itens próximos ao vencimento: ${names}. `
    if (lowNutrients.length > 0) {
      const nutrientAdvice = lowNutrients.join(', ')
      const usable = expiringSoon.filter(i => i.nutrients.magnesium > 50 || i.nutrients.vitaminC > 50 || i.nutrients.iron > 2)
      if (usable.length > 0) {
        message += `Seus níveis de ${nutrientAdvice} estão baixos. Sugiro consumir ${usable.map(i => i.name).join(', ')} para repor.`
      }
    }
  } else if (lowNutrients.length > 0) {
    message = `📊 Seus níveis de ${lowNutrients.join(', ')} estão abaixo do ideal. Recomendo ajustar a dieta, Senhor.`
  } else {
    message = '✅ Geladeira em ordem. Níveis nutricionais adequados.'
  }

  return { items: fridgeContents, expiringSoon, expired, lowNutrients, message }
}

export async function suggestRecipe(): Promise<{
  suggestions: RecipeSuggestion[]
  message: string
}> {
  const suggestions: RecipeSuggestion[] = [
    {
      name: 'Suco Verde Energizante',
      ingredients: ['Couve', 'Banana', 'Mamão', 'Água de coco', 'Gengibre'],
      nutrientFocus: ['Magnésio', 'Vitamina C', 'Potássio', 'Fibras'],
      prepTime: '5 min',
      difficulty: 'easy',
      reason: 'Couve e banana estão próximas ao vencimento. Rico em magnésio e potássio para reposição pós-treino.',
    },
    {
      name: 'Omelete de Espinafre com Frango',
      ingredients: ['Ovos', 'Espinafre', 'Peito de Frango', 'Sal', 'Pimenta'],
      nutrientFocus: ['Ferro', 'Proteína', 'Cálcio'],
      prepTime: '15 min',
      difficulty: 'easy',
      reason: 'Espinafre e frango vencem em breve. Combinação ideal para recuperação muscular com ferro e proteína.',
    },
    {
      name: 'Vitamina de Mamão com Iogurte',
      ingredients: ['Mamão Papaia', 'Iogurte Natural', 'Mel'],
      nutrientFocus: ['Cálcio', 'Vitamina C', 'Probióticos'],
      prepTime: '3 min',
      difficulty: 'easy',
      reason: 'Mamão está maduro. Iogurte fornece cálcio e probióticos para saúde intestinal.',
    },
    {
      name: 'Frango Salteado com Couve e Banana',
      ingredients: ['Peito de Frango', 'Couve', 'Banana-da-terra', 'Alho', 'Azeite'],
      nutrientFocus: ['Magnésio', 'Potássio', 'Ferro', 'Proteína'],
      prepTime: '25 min',
      difficulty: 'medium',
      reason: 'Aproveita múltiplos ingredientes próximos ao vencimento. Refeição completa e balanceada.',
    },
  ]

  return {
    suggestions,
    message: 'Aqui estão algumas sugestões com base nos itens próximos ao vencimento e suas necessidades nutricionais estimadas.',
  }
}

let circadianConfig: CircadianConfig = {
  mode: 'auto',
  currentKelvin: 4000,
  currentBrightness: 80,
  timeOfDay: 'morning',
  phase: 'Produção de cortisol — luz fria rica em azul (5000-6500K)',
  nextTransition: 'Próxima transição: 12:00 — Aumento gradual para 5500K (pico de alerta diurno)',
}

export async function getCircadianStatus(): Promise<{
  config: CircadianConfig
  schedule: { time: string; kelvin: number; brightness: number; phase: string }[]
  recommended: string
}> {
  const hour = new Date().getHours()

  let timeOfDay: CircadianConfig['timeOfDay']
  let kelvin: number
  let brightness: number
  let phase: string

  if (hour >= 5 && hour < 7) {
    timeOfDay = 'dawn'
    kelvin = 3500
    brightness = 40
    phase = 'Nascer do sol — luz gradual âmbar para despertar natural'
  } else if (hour >= 7 && hour < 12) {
    timeOfDay = 'morning'
    kelvin = 5500
    brightness = 85
    phase = 'Produção de cortisol — luz fria rica em azul para alerta máximo'
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'afternoon'
    kelvin = 5000
    brightness = 75
    phase = 'Estabilidade diurna — luz neutra para produtividade sustentada'
  } else if (hour >= 17 && hour < 19) {
    timeOfDay = 'sunset'
    kelvin = 2700
    brightness = 50
    phase = 'Pôr do sol simulado — redução de azul para preparar melatonina'
  } else {
    timeOfDay = 'night'
    kelvin = 2200
    brightness = 20
    phase = 'Modo noturno — luz âmbar profunda para maximizar melatonina'
  }

  circadianConfig = { ...circadianConfig, timeOfDay, currentKelvin: kelvin, currentBrightness: brightness, phase }

  const schedule = [
    { time: '05:00', kelvin: 3500, brightness: 40, phase: 'Despertar gradual' },
    { time: '07:00', kelvin: 5500, brightness: 85, phase: 'Alerta matinal' },
    { time: '12:00', kelvin: 5000, brightness: 75, phase: 'Estabilidade produtiva' },
    { time: '17:00', kelvin: 2700, brightness: 50, phase: 'Transição para relaxamento' },
    { time: '19:00', kelvin: 2200, brightness: 20, phase: 'Modo melatonina' },
  ]

  return {
    config: circadianConfig,
    schedule,
    recommended: `Ajuste automático: ${kelvin}K / ${brightness}% — ${phase}. Esta iluminação otimiza seu ciclo circadiano para ${timeOfDay === 'night' || timeOfDay === 'sunset' ? 'produção de melatonina' : 'alerta e produtividade'}.`,
  }
}

export async function adjustCircadianLighting(
  mode?: 'auto' | 'manual' | 'disabled',
  manualKelvin?: number,
  manualBrightness?: number
): Promise<{
  success: boolean
  config: CircadianConfig
  message: string
}> {
  if (mode) {
    circadianConfig.mode = mode
  }

  if (mode === 'manual' && manualKelvin) {
    circadianConfig.currentKelvin = Math.max(1000, Math.min(10000, manualKelvin))
  }
  if (mode === 'manual' && manualBrightness !== undefined) {
    circadianConfig.currentBrightness = Math.max(0, Math.min(100, manualBrightness))
  }

  if (circadianConfig.mode === 'auto') {
    return getCircadianStatus().then(s => ({
      success: true,
      config: s.config,
      message: s.recommended,
    }))
  }

  return {
    success: true,
    config: circadianConfig,
    message: `Iluminação ajustada para ${circadianConfig.currentKelvin}K / ${circadianConfig.currentBrightness}% no modo manual.`,
  }
}

let moodHistory: MoodAnalysis[] = []

export async function analyzeMicroExpressions(): Promise<{
  analysis: MoodAnalysis
  weeklyTrend: string
  protocolActivated: boolean
  message: string
}> {
  const expressions = ['contração labial sutil', 'sobrancelhas franzidas', 'pálpebras tensas', 'micro sorriso assimétrico', 'respiro longo audível']
  const selectedExpressions = [expressions[Math.floor(Math.random() * expressions.length)]]
  if (Math.random() > 0.5) selectedExpressions.push(expressions[Math.floor(Math.random() * expressions.length)])

  const burnoutRisk = Math.floor(Math.random() * 40) + 10
  const anxietyScore = Math.floor(Math.random() * 35) + 5

  let detectedMood: string
  let recommendation: string
  let protocolActivated: string | null = null

  if (burnoutRisk > 40 && anxietyScore > 30) {
    detectedMood = 'Sinais de estresse acumulado — possível burnout incipiente'
    protocolActivated = 'Protocolo de Desaceleração de Agenda'
    recommendation = 'Sugiro reajustar a agenda de hoje: remover reuniões não críticas, pausa obrigatória de 15min a cada hora e luz âmbar ambiente. Seu desempenho será melhor com recuperação.'
  } else if (anxietyScore > 25) {
    detectedMood = 'Ansiedade leve detectada'
    protocolActivated = 'Protocolo de Relaxamento Assistido'
    recommendation = 'Recomendo 5 minutos de respiração guiada. Quer que eu prepare um ambiente calmo com iluminação adequada e som ambiente?'
  } else {
    detectedMood = 'Estado emocional estável'
    recommendation = 'Tudo dentro da normalidade, Senhor. Continuarei monitorando.'
  }

  const analysis: MoodAnalysis = {
    detectedMood,
    burnoutRisk,
    anxietyScore,
    facialMicroExpressions: selectedExpressions,
    voiceToneMetrics: {
      pitch: Math.random() > 0.6 ? 'agudo' : 'normal',
      pace: Math.random() > 0.7 ? 'acelerado' : 'normal',
      energy: burnoutRisk > 35 ? 'baixa' : 'normal',
    },
    protocolActivated,
    recommendation,
  }

  moodHistory.push(analysis)

  const weeklyTrend = moodHistory.length > 1
    ? burnoutRisk > moodHistory[moodHistory.length - 2].burnoutRisk
      ? 'Tendência de aumento no estresse na última semana. Recomendo atenção.'
      : 'Estresse estável ou em declínio. Boa recuperação.'
    : 'Apenas 1 análise disponível. Mais dados necessários para tendência semanal.'

  const protocolActivatedBool = !!protocolActivated

  return { analysis, weeklyTrend, protocolActivated: protocolActivatedBool, message: `${analysis.detectedMood}. ${protocolActivated ? protocolActivated + ' ativado. ' : ''}${recommendation}` }
}

export async function activateSlowDownProtocol(): Promise<{
  success: boolean
  actions: string[]
  message: string
}> {
  const actions = [
    'Reuniões não críticas canceladas automaticamente',
    'Iluminação ajustada para 2700K (modo relaxamento)',
    'Lembretes de pausa a cada 50min ativados',
    'Notificações não urgentes silenciadas até amanhã',
    'Playlist de áudio calmante preparada',
  ]

  return {
    success: true,
    actions,
    message: '🌿 Protocolo de Desaceleração ativado, Senhor.\n' + actions.map(a => '• ' + a).join('\n') + '\n\nSua saúde mental em primeiro lugar. A agenda pode esperar.',
  }
}

export async function getNutritionAnalysis(): Promise<{
  estimatedIntake: NutritionProfile
  rda: NutritionProfile
  deficiencies: string[]
  recommendation: string
}> {
  const estimatedIntake: NutritionProfile = {
    magnesium: 180, vitaminC: 40, iron: 4.5, calcium: 350, potassium: 1200, fiber: 8, calories: 1800,
  }

  const rda: NutritionProfile = {
    magnesium: 420, vitaminC: 100, iron: 14, calcium: 1000, potassium: 4700, fiber: 30, calories: 2500,
  }

  const deficiencies: string[] = []
  const labels: Record<string, string> = { magnesium: 'Magnésio', vitaminC: 'Vitamina C', iron: 'Ferro', calcium: 'Cálcio', potassium: 'Potássio', fiber: 'Fibras' }

  for (const key of Object.keys(labels) as (keyof NutritionProfile)[]) {
    const pct = (estimatedIntake[key] / rda[key]) * 100
    if (pct < 60) deficiencies.push(`${labels[key]} (${Math.round(pct)}% da RDA)`)
  }

  return {
    estimatedIntake,
    rda,
    deficiencies,
    recommendation: deficiencies.length > 0
      ? `Deficiências estimadas: ${deficiencies.join(', ')}. Recomendo consumir alimentos ricos nesses nutrientes.`
      : 'Níveis nutricionais adequados com base na dieta estimada.',
  }
}
