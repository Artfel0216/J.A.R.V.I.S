export interface LegalCitation {
  id: string
  source: string
  type: 'process' | 'lawsuit' | 'tax_fine' | 'traffic_ticket' | 'bureaucratic' | 'registration'
  title: string
  description: string
  date: string
  status: 'active' | 'resolved' | 'pending' | 'appeal'
  value: number | null
  pdfUrl: string | null
  aiSummary: string
}

export interface TaxDocument {
  id: string
  type: 'DAS' | 'DARF' | 'ICMS' | 'ISS' | 'INSS' | 'IRPF' | 'IRPJ'
  referenceMonth: string
  referenceYear: number
  dueDate: string
  value: number
  paid: boolean
  paymentUrl: string | null
  automaticDeductions: string[]
}

export interface TaxOptimization {
  totalTaxDue: number
  totalWithOptimizations: number
  savings: number
  savingsPercent: number
  deductions: string[]
  documents: TaxDocument[]
  message: string
}

const legalCitations: LegalCitation[] = [
  {
    id: 'legal_1',
    source: 'DJE - Tribunal de Justiça de SP',
    type: 'process',
    title: 'Processo nº 1001234-56.2026.8.26.0100',
    description: 'Ação de cobrança envolvendo prestação de serviços de consultoria. Parte ré: Stark Industries Ltda.',
    date: '2026-06-08',
    status: 'active',
    value: 15000.00,
    pdfUrl: 'https://diario.jus.br/processo_1001234.pdf',
    aiSummary: 'Ação de cobrança no valor de R$ 15.000,00. Prazo para contestação até 28/06/2026. Probabilidade de êxito alta — documento comprobatório de pagamento foi anexado pela defesa.',
  },
  {
    id: 'legal_2',
    source: 'SERPRO - Dívida Ativa da União',
    type: 'tax_fine',
    title: 'Auto de Infração nº 2026.004.321',
    description: 'Notificação de débito fiscal — atraso na entrega de declaração de IRPJ do 1º trimestre de 2026.',
    date: '2026-06-05',
    status: 'pending',
    value: 2340.50,
    pdfUrl: 'https://receita.economia.gov.br/auto_2026004321.pdf',
    aiSummary: 'Multa por atraso na entrega da DCTF. Valor atualizado com juros: R$ 2.340,50. Parcelamento automático disponível em até 12x.',
  },
  {
    id: 'legal_3',
    source: 'DETRAN - Departamento Estadual de Trânsito',
    type: 'traffic_ticket',
    title: 'Notificação de Multa — AI-123456789',
    description: 'Infração por excesso de velocidade (48km/h em via de 40km/h). Veículo: Stark Industries - Audi e-tron GT.',
    date: '2026-06-01',
    status: 'pending',
    value: 293.47,
    pdfUrl: null,
    aiSummary: 'Multa média por excesso de velocidade. 4 pontos na CNH. Desconto de 40% para pagamento até 15/06/2026. Recurso possível mas improvável de reverter.',
  },
]

export async function scanLegalPortals(): Promise<{
  citations: LegalCitation[]
  newCitations: number
  totalLiability: number
  urgentItems: LegalCitation[]
  message: string
}> {
  const urgentItems = legalCitations.filter(c => c.status === 'active' || c.status === 'pending')
  const totalLiability = legalCitations.reduce((acc, c) => acc + (c.value || 0), 0)

  legalCitations.forEach(c => {
    if (c.type === 'process' && c.status === 'active' && Math.random() > 0.8) {
      c.status = 'resolved'
    }
  })

  return {
    citations: legalCitations,
    newCitations: legalCitations.filter(c => new Date(c.date) > new Date(Date.now() - 86400000 * 7)).length,
    totalLiability,
    urgentItems,
    message: urgentItems.length > 0
      ? `🔍 Varredura jurídica concluída. ${urgentItems.length} item(ns) pendente(s): ${urgentItems.map(i => `${i.title} (R$ ${i.value?.toFixed(2) || 'N/A'})`).join(', ')}. ${urgentItems.length > 1 ? 'Documentos PDF já baixados e resumos jurídicos prontos.' : 'Documento baixado e resumo disponível.'}`
      : '✅ Nenhuma pendência jurídica encontrada. Seu nome limpo, Senhor.',
  }
}

export async function generateTaxDocuments(): Promise<{
  success: boolean
  optimization: TaxOptimization | null
  message: string
}> {
  const documents: TaxDocument[] = [
    { id: 'tax_1', type: 'DAS', referenceMonth: 'Maio', referenceYear: 2026, dueDate: '2026-06-20', value: 1842.30, paid: false, paymentUrl: 'https://gov.br/das/202605', automaticDeductions: ['Pró-labore', 'Aluguel'] },
    { id: 'tax_2', type: 'DARF', referenceMonth: 'Maio', referenceYear: 2026, dueDate: '2026-06-30', value: 3215.80, paid: false, paymentUrl: 'https://gov.br/darf/202605', automaticDeductions: ['IRRF', 'CSLL'] },
    { id: 'tax_3', type: 'ISS', referenceMonth: 'Maio', referenceYear: 2026, dueDate: '2026-06-15', value: 890.00, paid: false, paymentUrl: 'https://prefeitura.gov.br/iss/202605', automaticDeductions: [] },
  ]

  const deductions = [
    'Despesas com energia elétrica do escritório (R$ 450,00)',
    'Plano de saúde (R$ 890,00)',
    'Material de escritório e equipamentos (R$ 2.340,00)',
    'Contribuição previdenciária patronal (R$ 1.210,00)',
    'Despesas com internet e telecom (R$ 320,00)',
  ]

  const totalTax = documents.reduce((acc, d) => acc + d.value, 0)
  const totalDeductions = 450 + 890 + 2340 + 1210 + 320
  const savings = Math.round(totalDeductions * 0.275 * 100) / 100

  const optimization: TaxOptimization = {
    totalTaxDue: totalTax,
    totalWithOptimizations: Math.round((totalTax - savings) * 100) / 100,
    savings,
    savingsPercent: Math.round((savings / totalTax) * 100 * 100) / 100,
    deductions,
    documents,
    message: `📊 Documentos fiscais de Maio/2026 prontos.\nTotal de impostos: R$ ${totalTax.toFixed(2)}\nDeduções legais encontradas: R$ ${totalDeductions.toFixed(2)} (economia estimada de R$ ${savings.toFixed(2)})\nValor final com otimizações: R$ ${(totalTax - savings).toFixed(2)}\n\nGuias geradas: ${documents.map(d => `${d.type} — R$ ${d.value.toFixed(2)} (vence ${d.dueDate})`).join(', ')}`,
  }

  return {
    success: true,
    optimization,
    message: optimization.message,
  }
}

export async function payTaxDocument(
  documentId: string
): Promise<{
  success: boolean
  document: TaxDocument | null
  message: string
}> {
  const doc = documents.find(d => d.id === documentId)
  if (!doc) {
    return { success: false, document: null, message: 'Documento fiscal não encontrado.' }
  }

  doc.paid = true
  return {
    success: true,
    document: doc,
    message: `✅ ${doc.type} de ${doc.referenceMonth}/${doc.referenceYear} no valor de R$ ${doc.value.toFixed(2)} pago com sucesso. Vencimento: ${doc.dueDate}.`,
  }
}

const documents: TaxDocument[] = [
  { id: 'tax_1', type: 'DAS', referenceMonth: 'Maio', referenceYear: 2026, dueDate: '2026-06-20', value: 1842.30, paid: false, paymentUrl: 'https://gov.br/das/202605', automaticDeductions: ['Pró-labore', 'Aluguel'] },
  { id: 'tax_2', type: 'DARF', referenceMonth: 'Maio', referenceYear: 2026, dueDate: '2026-06-30', value: 3215.80, paid: false, paymentUrl: 'https://gov.br/darf/202605', automaticDeductions: ['IRRF', 'CSLL'] },
  { id: 'tax_3', type: 'ISS', referenceMonth: 'Maio', referenceYear: 2026, dueDate: '2026-06-15', value: 890.00, paid: false, paymentUrl: 'https://prefeitura.gov.br/iss/202605', automaticDeductions: [] },
]
