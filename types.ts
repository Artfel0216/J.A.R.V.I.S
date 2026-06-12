export type VisualizerMode = 'idle' | 'listening' | 'thinking' | 'speaking'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt: string | Date
  /** Data URL (base64) de uma imagem anexada pelo usuário, quando houver. */
  image?: string
}

export interface Conversation {
  id: string
  title: string
  updatedAt: string
  createdAt: string
  messages: Message[]
}
