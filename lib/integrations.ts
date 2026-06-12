export interface WeatherResponse {
  city: string
  country: string
  temp: number
  feels_like: number
  description: string
  humidity: number
  wind: number
  error?: never
}

export interface NewsResponse {
  articles: Array<{
    title: string
    source: string | undefined
    url: string
    publishedAt: string
  }>
  error?: never
}

export interface SearchResponse {
  results: Array<{
    title: string
    snippet: string
    link: string
  }>
  answerBox: string | null
  error?: never
}

export interface WolframResponse {
  result: string
  error?: never
}

interface ToolError {
  error: string
}

export async function getWeather(city: string): Promise<WeatherResponse | ToolError> {
  const key = process.env.OPENWEATHER_API_KEY
  if (!key) return { error: 'API de clima não configurada.' }
  try {
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${key}&units=metric&lang=pt_br`,
      { next: { revalidate: 600 } }
    )
    if (!r.ok) return { error: `Cidade "${city}" não encontrada.` }
    const d = await r.json()
    return {
      city: d.name,
      country: d.sys?.country,
      temp: Math.round(d.main.temp),
      feels_like: Math.round(d.main.feels_like),
      description: d.weather[0]?.description,
      humidity: d.main.humidity,
      wind: Math.round(d.wind?.speed * 3.6),
    }
  } catch {
    return { error: 'Falha ao consultar clima.' }
  }
}

export async function getNews(query: string): Promise<NewsResponse | ToolError> {
  const key = process.env.NEWSAPI_KEY
  if (!key) return { error: 'API de notícias não configurada.' }
  try {
    const r = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=pt&sortBy=publishedAt&pageSize=5&apiKey=${key}`,
      { 
        next: { revalidate: 300 } ,
        headers: {
          'User-Agent': 'JarvisDashboard/1.0'
        }
      }
    )
    if (!r.ok) return { error: 'Falha ao buscar notícias.' }
    const d = await r.json()
    return {
      articles: (d.articles || []).slice(0, 5).map((a: any) => ({
        title: a.title,
        source: a.source?.name,
        url: a.url,
        publishedAt: a.publishedAt,
      })),
    }
  } catch {
    return { error: 'Falha ao buscar notícias.' }
  }
}

export async function searchWeb(query: string): Promise<SearchResponse | ToolError> {
  const key = process.env.SERPER_API_KEY
  if (!key) return { error: 'API de busca não configurada.' }
  try {
    const r = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, gl: 'br', hl: 'pt' }),
    })
    if (!r.ok) return { error: 'Falha na busca.' }
    const d = await r.json()
    return {
      results: (d.organic || []).slice(0, 5).map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
      })),
      answerBox: d.answerBox?.answer || null,
    }
  } catch {
    return { error: 'Falha na busca web.' }
  }
}

export async function wolframQuery(query: string): Promise<WolframResponse | ToolError> {
  const id = process.env.WOLFRAM_APP_ID
  if (!id) return { error: 'Wolfram Alpha não configurado.' }
  try {
    const r = await fetch(
      `https://api.wolframalpha.com/v1/result?appid=${id}&i=${encodeURIComponent(query)}&units=metric`,
      { next: { revalidate: 3600 } }
    )
    if (!r.ok) return { error: 'Wolfram não encontrou resultado.' }
    const text = await r.text()
    return { result: text }
  } catch {
    return { error: 'Falha ao consultar Wolfram Alpha.' }
  }
}

export interface ResearchResponse {
  summary: string
  sources: Array<{ title: string; url: string }>
  error?: never
}

export interface BriefingResponse {
  date: string
  weather: string
  news: string[]
  greeting: string
  error?: never
}

export type IntegrationResult = {
  type: 'weather' | 'news' | 'search' | 'wolfram' | 'none'
  data: Record<string, any>
}

export async function dailyBriefing(city?: string): Promise<BriefingResponse | { error: string }> {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })

  const weatherData = await getWeather(city || 'São Paulo')
  const weatherInfo = 'error' in weatherData
    ? 'Indisponível'
    : `${weatherData.city}: ${weatherData.temp}°C, ${weatherData.description}. Máx/Mín: sensação ${weatherData.feels_like}°C, umidade ${weatherData.humidity}%, vento ${weatherData.wind} km/h`

  const newsData = await getNews('brasil')
  const newsItems = 'error' in newsData
    ? ['Indisponível']
    : newsData.articles.map(a => `${a.title} (${a.source})`)

  const hour = new Date().getHours()
  const greeting = hour < 6 ? 'Boa madrugada' : hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return {
    date: today,
    weather: weatherInfo,
    news: newsItems,
    greeting,
  }
}

export async function researchQuery(topic: string): Promise<ResearchResponse | { error: string }> {
  const results = await searchWeb(topic)
  if ('error' in results) {
    if (results.error) return { error: results.error }
    return { error: 'Erro desconhecido na pesquisa.' }
  }

  if (!results.results.length) {
    return { summary: `Nenhum resultado encontrado para "${topic}".`, sources: [] }
  }

  const sources = results.results.map(r => ({ title: r.title, url: r.link }))
  const snippets = results.results.map(r => r.snippet).filter(Boolean).join(' ')
  const summary = `Pesquisa sobre "${topic}":\n${snippets}`

  return { summary, sources }
}

export async function resolveIntegration(message: string): Promise<IntegrationResult> {
  const lower = message.toLowerCase().trim()

  const isWeather = /\b(clima|temperatura|weather)\b/i.test(lower) || (/\btempo\b/i.test(lower) && /\b(em|hoje|amanhã|como)\b/i.test(lower))
  
  if (isWeather) {
    const cityMatch = lower.match(/(?:em|para)\s+([a-záàãâéêíóôõúç\s]+)/i)
    const city = cityMatch?.[1]?.trim() || 'São Paulo'
    const data = await getWeather(city)
    return { type: 'weather', data }
  }

  if (/\b(notícia|news|manchete|jornal)\b/i.test(lower)) {
    const q = lower.replace(/notícia|news|manchete|jornal|sobre|de/gi, '').trim() || 'brasil'
    const data = await getNews(q)
    return { type: 'news', data }
  }

  if (/(calcul|quanto é|resolver|equação|integral|derivad|wolfram)/i.test(lower)) {
    const data = await wolframQuery(message)
    return { type: 'wolfram', data }
  }

  if (/(buscar|pesquisar|procurar|search|o que é|quem é|quando foi)/i.test(lower)) {
    const data = await searchWeb(message)
    return { type: 'search', data }
  }

  return { type: 'none', data: {} }
}