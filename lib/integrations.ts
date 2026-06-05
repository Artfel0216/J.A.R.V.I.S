// ── Clima ─────────────────────────────────────────────────
export async function getWeather(city: string) {
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
      country: d.sys.country,
      temp: Math.round(d.main.temp),
      feels_like: Math.round(d.main.feels_like),
      description: d.weather[0].description,
      humidity: d.main.humidity,
      wind: Math.round(d.wind.speed * 3.6),
    }
  } catch {
    return { error: 'Falha ao consultar clima.' }
  }
}

// ── Notícias ─────────────────────────────────────────────
export async function getNews(query: string) {
  const key = process.env.NEWSAPI_KEY
  if (!key) return { error: 'API de notícias não configurada.' }
  try {
    const r = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=pt&sortBy=publishedAt&pageSize=5&apiKey=${key}`,
      { next: { revalidate: 300 } }
    )
    if (!r.ok) return { error: 'Falha ao buscar notícias.' }
    const d = await r.json()
    return {
      articles: (d.articles || []).slice(0, 5).map((a: Record<string, string>) => ({
        title: a.title,
        source: ((a.source as unknown as Record<string, string>))?.name,
        url: a.url,
        publishedAt: a.publishedAt,
      })),
    }
  } catch {
    return { error: 'Falha ao buscar notícias.' }
  }
}

// ── Busca Web ────────────────────────────────────────────
export async function searchWeb(query: string) {
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
      results: (d.organic || []).slice(0, 5).map((item: Record<string, string>) => ({
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

// ── Wolfram Alpha ─────────────────────────────────────────
export async function wolframQuery(query: string) {
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

// ── Router de intenção ────────────────────────────────────
export type IntegrationResult = {
  type: 'weather' | 'news' | 'search' | 'wolfram' | 'none'
  data: Record<string, unknown>
}

export async function resolveIntegration(message: string): Promise<IntegrationResult> {
  const lower = message.toLowerCase()

  const weatherMatch = lower.match(/clima|temperatura|tempo\s+em\s+(.+)|weather/i)
  if (weatherMatch) {
    const city = lower.match(/em\s+([a-záàãâéêíóôõúç\s]+)/i)?.[1]?.trim() || 'São Paulo'
    const data = await getWeather(city)
    return { type: 'weather', data: data as Record<string, unknown> }
  }

  if (/notícia|news|manchete|jornal/i.test(lower)) {
    const q = lower.replace(/notícia|news|manchete|jornal|sobre|de/gi, '').trim() || 'brasil'
    const data = await getNews(q)
    return { type: 'news', data: data as Record<string, unknown> }
  }

  if (/calcul|quanto é|resolver|equação|integral|derivad|wolfram/i.test(lower)) {
    const data = await wolframQuery(message)
    return { type: 'wolfram', data: data as Record<string, unknown> }
  }

  if (/buscar|pesquisar|procurar|search|o que é|quem é|quando foi/i.test(lower)) {
    const data = await searchWeb(message)
    return { type: 'search', data: data as Record<string, unknown> }
  }

  return { type: 'none', data: {} }
}
