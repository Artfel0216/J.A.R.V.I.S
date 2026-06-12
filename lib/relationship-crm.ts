export interface Contact {
  name: string
  relationship: string
  lastContactDate: string
  daysSinceContact: number
  nextSuggestedContact: string
  importantDates: { label: string; date: string }[]
  recentActivity: string | null
  priority: 'high' | 'medium' | 'low'
}

export interface ConversationSummary {
  groupName: string
  totalMessages: number
  unreadMessages: number
  topics: string[]
  actionItems: string[]
  noActionNeeded: boolean
}

export interface SocialEvent {
  type: 'birthday' | 'anniversary' | 'event'
  person: string
  date: string
  daysAway: number
  suggestedAction: string
}

const contacts: Contact[] = [
  { name: 'Pepper Pots', relationship: 'Parceira', lastContactDate: '2026-06-10', daysSinceContact: 2, nextSuggestedContact: 'Em breve', importantDates: [{ label: 'Aniversario', date: '2026-08-15' }], recentActivity: 'Postou sobre a nova iniciativa da Stark Industries', priority: 'high' },
  { name: 'James Rhodes', relationship: 'Melhor Amigo', lastContactDate: '2026-05-28', daysSinceContact: 15, nextSuggestedContact: 'Hoje', importantDates: [{ label: 'Aniversario', date: '2026-10-06' }], recentActivity: 'Comentou sobre o novo projeto da Forca Aerea', priority: 'high' },
  { name: 'Happy Hogan', relationship: 'Amigo / Chefe de Seguranca', lastContactDate: '2026-06-01', daysSinceContact: 11, nextSuggestedContact: 'Esta semana', importantDates: [], recentActivity: 'Mudou de emprego - nova posicao como Head de Operacoes', priority: 'medium' },
  { name: 'Peter Parker', relationship: 'Mentorado', lastContactDate: '2026-05-15', daysSinceContact: 28, nextSuggestedContact: 'Urgente', importantDates: [], recentActivity: 'Postou sobre seu estagio na Stark Industries', priority: 'high' },
]

export async function getContactReminders(): Promise<{
  contacts: Contact[]
  overdueContacts: Contact[]
  message: string | null
}> {
  const overdue = contacts.filter(c => c.daysSinceContact > 14)
  const message = overdue.length > 0
    ? 'Voce nao fala com ' + overdue.map(c => c.name).join(' e ') + ' ha mais de 2 semanas. '
      + overdue.map(c => c.recentActivity ? c.name + ' recentemente ' + c.recentActivity.substring(0, 40) : '').filter(Boolean).join('. ')
      + '. Deseja enviar uma mensagem?'
    : null

  return { contacts, overdueContacts: overdue, message }
}

export async function summarizeConversation(groupName: string): Promise<ConversationSummary> {
  const topics = [
    'Aniversario da tia no domingo',
    'Decidindo quem leva o bolo',
    'Organizando churrasco do mes que vem',
  ]
  const actions = ['Nenhuma acao necessaria da sua parte', 'Confirmar presenca ate sexta']

  return {
    groupName,
    totalMessages: 287,
    unreadMessages: 134,
    topics,
    actionItems: actions,
    noActionNeeded: true,
  }
}

export async function getUpcomingEvents(): Promise<{
  events: SocialEvent[]
  message: string
}> {
  const events: SocialEvent[] = [
    { type: 'birthday', person: 'Pepper Pots', date: '2026-08-15', daysAway: 64, suggestedAction: 'Comprar presente - sugestao: Joias ou livro raro' },
    { type: 'birthday', person: 'James Rhodes', date: '2026-10-06', daysAway: 116, suggestedAction: 'Agendar jantar no Bobby Blake\'s' },
    { type: 'event', person: 'Stark Industries Gala', date: '2026-07-20', daysAway: 38, suggestedAction: 'Confirmar presenca e preparar discurso' },
  ]

  return {
    events,
    message: 'Proximos eventos importantes: ' + events.map(e => e.person + ' (' + e.daysAway + ' dias)').join(', ') + '.',
  }
}

export async function sendGreetingMessage(contactName: string): Promise<{
  success: boolean
  message: string
  suggestedText: string
}> {
  const contact = contacts.find(c => c.name.toLowerCase() === contactName.toLowerCase())
  if (!contact) {
    return {
      success: true,
      message: 'Mensagem enviada para ' + contactName + '!',
      suggestedText: 'Ola ' + contactName + ', tudo bem? So passando para dizer que estava pensando em voce. Como andam as coisas?',
    }
  }

  const greeting = contact.recentActivity
    ? 'Ola ' + contact.name + '! Vi sobre ' + contact.recentActivity.substring(0, 30) + '... Fiquei feliz! Vamos marcar um cafe?'
    : 'Ola ' + contact.name + ', quanto tempo! Como voce esta? Saudades de bater um papo.'

  return {
    success: true,
    message: 'Mensagem personalizada pronta para ' + contact.name + '!',
    suggestedText: greeting,
  }
}
