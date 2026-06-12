import { google, calendar_v3 } from 'googleapis'

const TIME_ZONE = 'America/Sao_Paulo'

interface ToolError {
  error: string
}

export interface CreatedEvent {
  id: string
  summary: string
  start: string
  end: string
  htmlLink: string
  error?: never
}

export interface CalendarEvent {
  id: string
  summary: string
  start: string
  end: string
  location?: string
  htmlLink: string
}

export interface EventsList {
  date: string
  events: CalendarEvent[]
  error?: never
}

/**
 * Cria um cliente OAuth2 já autenticado com o refresh token do dono.
 * Retorna null se as credenciais não estiverem configuradas no ambiente.
 */
function getCalendarClient(): calendar_v3.Calendar | null {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) return null

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
  )
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  return google.calendar({ version: 'v3', auth: oauth2Client })
}

function getCalendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID || 'primary'
}

export async function createCalendarEvent(args: {
  summary: string
  description?: string
  startDateTime: string
  endDateTime: string
}): Promise<CreatedEvent | ToolError> {
  const calendar = getCalendarClient()
  if (!calendar) return { error: 'Credenciais do Google Calendar não configuradas no servidor.' }

  try {
    const { data } = await calendar.events.insert({
      calendarId: getCalendarId(),
      requestBody: {
        summary: args.summary,
        description: args.description,
        start: { dateTime: args.startDateTime, timeZone: TIME_ZONE },
        end: { dateTime: args.endDateTime, timeZone: TIME_ZONE },
      },
    })

    return {
      id: data.id ?? '',
      summary: data.summary ?? args.summary,
      start: data.start?.dateTime ?? args.startDateTime,
      end: data.end?.dateTime ?? args.endDateTime,
      htmlLink: data.htmlLink ?? '',
    }
  } catch (err: any) {
    console.error('[GOOGLE CALENDAR] Falha ao criar evento:', err?.message)
    return { error: 'Não foi possível agendar o evento no Google Calendar.' }
  }
}

export async function listCalendarEvents(args: {
  date: string
}): Promise<EventsList | ToolError> {
  const calendar = getCalendarClient()
  if (!calendar) return { error: 'Credenciais do Google Calendar não configuradas no servidor.' }

  // Janela do dia inteiro (00:00–23:59) no fuso de São Paulo (-03:00).
  const timeMin = `${args.date}T00:00:00-03:00`
  const timeMax = `${args.date}T23:59:59-03:00`

  try {
    const { data } = await calendar.events.list({
      calendarId: getCalendarId(),
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 20,
    })

    const events: CalendarEvent[] = (data.items ?? []).map((e) => ({
      id: e.id ?? '',
      summary: e.summary ?? '(sem título)',
      start: e.start?.dateTime ?? e.start?.date ?? '',
      end: e.end?.dateTime ?? e.end?.date ?? '',
      location: e.location ?? undefined,
      htmlLink: e.htmlLink ?? '',
    }))

    return { date: args.date, events }
  } catch (err: any) {
    console.error('[GOOGLE CALENDAR] Falha ao listar eventos:', err?.message)
    return { error: 'Não foi possível consultar a agenda no Google Calendar.' }
  }
}

/**
 * Despacha uma chamada de função do Gemini para a implementação real.
 */
export async function executeCalendarFunction(
  name: string,
  args: Record<string, any>
): Promise<Record<string, any>> {
  switch (name) {
    case 'createCalendarEvent':
      return createCalendarEvent(args as any)
    case 'listCalendarEvents':
      return listCalendarEvents(args as any)
    default:
      return { error: `Função desconhecida: ${name}` }
  }
}
