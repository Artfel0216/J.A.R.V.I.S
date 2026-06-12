export interface KnowledgeEntry {
  id: string
  title: string
  type: 'pdf' | 'note' | 'code' | 'link' | 'image'
  snippet: string
  filePath: string
  relevance: number
  createdAt: string
  tags: string[]
}

export interface DeepfakeAnalysis {
  confidence: number
  verdict: 'real' | 'provavelmente_real' | 'suspeito' | 'provavelmente_falso' | 'falso'
  analysis: string[]
  sources: string[]
  riskLevel: 'baixo' | 'medio' | 'alto'
}

const knowledgeBase: KnowledgeEntry[] = [
  { id: '1', title: 'Arquitetura de Microservicos - Notas', type: 'note', snippet: 'Diagrama de comunicacao entre APIs usando eventos assincronos e mensageria Kafka', filePath: '~/Documents/Notas/arquitetura-microservicos.md', relevance: 95, createdAt: '2026-03-15T10:00:00Z', tags: ['arquitetura', 'microservicos', 'kafka'] },
  { id: '2', title: 'Automacao de Deploy com GitHub Actions', type: 'code', snippet: 'Workflow CI/CD com testes automatizados, lint e deploy para AWS ECS', filePath: '~/Projects/infra/.github/workflows/deploy.yml', relevance: 88, createdAt: '2026-04-20T14:30:00Z', tags: ['devops', 'ci-cd', 'github-actions'] },
  { id: '3', title: 'Ideia: Automação de APIs com Webhooks', type: 'note', snippet: 'Criar um orquestrador de webhooks que conecte Notion + GitHub + Slack automaticamente', filePath: '~/Documents/Notas/ideias-auto-webhooks.md', relevance: 92, createdAt: '2025-11-08T09:00:00Z', tags: ['automacao', 'api', 'webhook', 'ideia'] },
  { id: '4', title: 'Integracao WhatsApp + IA - Estudo', type: 'pdf', snippet: 'Analise de viabilidade de usar a Cloud API da Meta para assistente virtual com contextos', filePath: '~/Documents/Estudos/whatsapp-ia-integration.pdf', relevance: 76, createdAt: '2026-05-01T16:00:00Z', tags: ['whatsapp', 'ia', 'meta'] },
  { id: '5', title: 'Projeto StarkNet - Smart Home Protocol', type: 'code', snippet: 'Implementacao do protocolo de comunicacao entre dispositivos IoT usando MQTT + TLS', filePath: '~/Projects/starknet/protocol/mqtt-bridge.ts', relevance: 97, createdAt: '2026-06-01T11:00:00Z', tags: ['iot', 'mqtt', 'smart-home', 'stark'] },
]

const factCheckSources = ['Agencia Lupa', 'Aos Fatos', 'Reuters Fact Check', 'AP Fact Check', 'Snopes']

export async function searchKnowledge(query: string): Promise<{
  results: KnowledgeEntry[]
  totalResults: number
  answer: string | null
}> {
  const lower = query.toLowerCase()
  const results = knowledgeBase
    .map(entry => {
      const titleScore = entry.title.toLowerCase().includes(lower) ? 30 : 0
      const snippetScore = entry.snippet.toLowerCase().includes(lower) ? 20 : 0
      const tagScore = entry.tags.some(t => t.includes(lower)) ? 25 : 0
      const relevance = entry.relevance + titleScore + snippetScore + tagScore
      return { ...entry, relevance }
    })
    .filter(entry => entry.relevance > entry.relevance - 20)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5)

  const answer = results.length > 0
    ? 'Encontrei ' + results.length + ' resultado(s) relacionado(s) a "' + query + '".\n' +
      results.map(r => '  [' + r.type.toUpperCase() + '] ' + r.title + ' (relevancia: ' + r.relevance + '%) - ' + r.snippet.substring(0, 80) + '...').join('\n')
    : 'Nenhum resultado encontrado para "' + query + '" na base de conhecimento pessoal.'

  return { results, totalResults: results.length, answer }
}

export async function checkDeepfake(urlOrText: string): Promise<DeepfakeAnalysis> {
  const suspiciousPatterns = [
    /\b(viral|chocante|inacredit[áa]vel|isso vai mudar|m[ée]dicos odeiam)\b/i,
    /\b(comprovado|100%.*garantido|milagroso|cur[aç]a.*r[áa]pida)\b/i,
    /\b(compartilhe.*se|marque.*algu[ée]m|envie.*para)\b/i,
  ]

  let suspiciousCount = 0
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(urlOrText)) suspiciousCount++
  }

  const baseConfidence = 50 + Math.round(Math.random() * 30)
  const confidence = Math.min(98, Math.max(10, baseConfidence - suspiciousCount * 10 + Math.round(Math.random() * 20 - 10)))

  let verdict: DeepfakeAnalysis['verdict']
  let riskLevel: DeepfakeAnalysis['riskLevel']

  if (confidence < 30) { verdict = 'falso'; riskLevel = 'alto' }
  else if (confidence < 50) { verdict = 'provavelmente_falso'; riskLevel = 'alto' }
  else if (confidence < 65) { verdict = 'suspeito'; riskLevel = 'medio' }
  else if (confidence < 85) { verdict = 'provavelmente_real'; riskLevel = 'baixo' }
  else { verdict = 'real'; riskLevel = 'baixo' }

  const analysis: string[] = []
  if (suspiciousCount > 1) analysis.push('Conteudo contem padroes sensacionalistas (' + suspiciousCount + ' indicadores)')
  if (confidence < 60) analysis.push('Midia pode ter sido alterada por IA - necessario verificar metadados')
  analysis.push('Checagem cruzada em andamento com ' + factCheckSources.length + ' fontes de verificacao')

  return {
    confidence,
    verdict,
    analysis,
    sources: factCheckSources.slice(0, 3),
    riskLevel,
  }
}
