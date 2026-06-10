// Tipagem básica para o histórico de mensagens
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Processa uma linha individual extraída do protocolo SSE
 */
function parseSSELine(
  line: string,
  onToken?: (token: string) => void,
  onDone?: () => void,
  onError?: (error: Error) => void
) {
  const cleanLine = line.trim();
  if (!cleanLine || !cleanLine.startsWith('data: ')) return;

  try {
    const parsed = JSON.parse(cleanLine.slice(6));

    switch (parsed.type) {
      case 'text':
        if (typeof parsed.content === 'string') {
          onToken?.(parsed.content);
        }
        break;
      case 'done':
        onDone?.();
        break;
      case 'error':
        onError?.(new Error(parsed.content || 'Erro desconhecido no stream'));
        break;
    }
  } catch (err) {
    console.warn('[SSE PARSE ERROR] Falha ao converter chunk JSON:', err, 'Linha:', cleanLine);
  }
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

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // CORREÇÃO 2: Libera qualquer caractere residual que restou preso no decodificador
          buffer += decoder.decode(); 
          break;
        }

        // Alimenta o buffer com os novos chunks de bytes recebidos
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Mantém apenas a última linha possivelmente incompleta no buffer
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          parseSSELine(line, onToken, onDone, onError);
        }
      }

      // CORREÇÃO 1: Se sobrou algum dado pendente no buffer após o fim do stream, processa-o
      if (buffer.trim()) {
        parseSSELine(buffer, onToken, onDone, onError);
      }
    } finally {
      // Garante a liberação do leitor da conexão HTTP para evitar vazamento de sockets
      reader.releaseLock();
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
 * Verifica a saúde do sistema com timeout de segurança
 */
export async function checkHealth(): Promise<{ status: string; [key: string]: any }> {
  try {
    // CORREÇÃO 3: Adicionado AbortSignal para derrubar a requisição após 3 segundos caso a API trave
    const response = await fetch('/api/health', { 
      signal: AbortSignal.timeout(3000) 
    });
    
    if (!response.ok) throw new Error();
    return await response.json();
  } catch {
    return { status: 'offline' };
  }
}