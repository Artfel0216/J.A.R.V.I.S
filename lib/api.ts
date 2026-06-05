// src/lib/api.ts

// Tipagem básica para o histórico de mensagens
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Envia mensagem ao backend via Server-Sent Events (SSE)
 */
export async function sendMessage(
  message: string,
  history: Message[] = [],
  onToken?: (token: string) => void,
  onDone?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    // No Next.js, caminhos relativos já apontam para a própria origem
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('A resposta do servidor não contém um corpo de dados (body).');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Mantém a última linha incompleta no buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        try {
          const parsed = JSON.parse(line.slice(6));

          switch (parsed.type) {
            case 'text':
              onToken?.(parsed.content);
              break;
            case 'done':
              onDone?.();
              break;
            case 'error':
              onError?.(new Error(parsed.content));
              break;
          }
        } catch (err) {
          console.warn('[SSE PARSE ERROR]', err);
        }
      }
    }
  } catch (err) {
    console.error('[API ERROR]', err);
    if (err instanceof Error) {
      onError?.(err);
    } else {
      onError?.(new Error(String(err)));
    }
  }
}

/**
 * Health check para verificar se o servidor está online
 */
export async function checkHealth(): Promise<{ status: string; [key: string]: any }> {
  try {
    const response = await fetch('/api/health');
    return await response.json();
  } catch {
    return { status: 'offline' };
  }
}