// Envio de mensagens via WhatsApp Business Cloud API (Meta / Graph API).
//
// Limitações importantes (impostas pela Meta, não pelo código):
//  - NÃO existe API para CHAMADAS de voz — apenas mensagens.
//  - Mensagens de texto livre só chegam dentro da "janela de atendimento" de 24h
//    (o destinatário precisa ter te enviado mensagem nas últimas 24h). Fora disso,
//    é obrigatório usar um *template* aprovado pela Meta.
//
// Requisitos de ambiente:
//   WHATSAPP_TOKEN            -> token de acesso (System User / permanente de preferência)
//   WHATSAPP_PHONE_NUMBER_ID  -> ID do número remetente (não é o telefone, é o ID no painel Meta)
//   WHATSAPP_API_VERSION      -> opcional, padrão v21.0

interface ToolError {
  error: string
}

export interface WhatsAppResult {
  success: true
  to: string
  messageId: string
  error?: never
}

export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<WhatsAppResult | ToolError> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!token || !phoneId) {
    return { error: 'WhatsApp Business API não configurada no servidor.' }
  }

  const version = process.env.WHATSAPP_API_VERSION || 'v21.0'
  // Normaliza para apenas dígitos (formato internacional E.164 sem o "+").
  const normalized = to.replace(/\D/g, '')
  if (!normalized) return { error: 'Número de telefone inválido.' }
  if (!text?.trim()) return { error: 'Mensagem vazia.' }

  try {
    const r = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalized,
        type: 'text',
        text: { body: text, preview_url: true },
      }),
    })

    const data = await r.json().catch(() => ({}))

    if (!r.ok) {
      console.error('[WHATSAPP] Falha ao enviar:', data)
      const detail = data?.error?.message || `HTTP ${r.status}`
      return { error: `Falha ao enviar no WhatsApp: ${detail}` }
    }

    return {
      success: true,
      to: normalized,
      messageId: data?.messages?.[0]?.id ?? '',
    }
  } catch (err: any) {
    console.error('[WHATSAPP] Erro de rede:', err?.message)
    return { error: 'Falha de rede ao contatar a API do WhatsApp.' }
  }
}
