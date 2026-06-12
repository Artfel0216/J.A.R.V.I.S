import { SchemaType, FunctionDeclaration } from '@google/generative-ai'
import { getWeather, getNews, searchWeb, wolframQuery, dailyBriefing, researchQuery } from '@/lib/integrations'
import { executeCalendarFunction } from '@/lib/google-calendar'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { controlLighting, controlClimate, securityAction, nightMode, listDevices } from '@/lib/smart-home'
import { getSystemStatus, executeCliCommand } from '@/lib/system-monitor'
import { saveMemory, getMemory, searchMemories, getAllMemories, deleteMemory } from '@/lib/memory'
import { prisma } from '@/lib/prisma'
import { checkPresence, scanFaces, switchAudioZone, detectApproach, getAudioZones } from '@/lib/spatial-awareness'
import { scanNetwork, isolateThreat, getThermalStatus, triggerThermalCooling } from '@/lib/network-guardian'
import { checkMaintenance, triageUrgency, optimizeFinances, filterSpam } from '@/lib/autonomous-agent'
import { projectAROverlay, getPowerGridStatus, hudGetMetrics } from '@/lib/ar-integration'
import { analyzeFatigue, getHealthSnapshot, relaxEnvironment, analyzeSleep } from '@/lib/health-biometrics'
import { getVehicleStatus, checkTirePressure, calculateRoute, planTrip } from '@/lib/vehicle-copilot'
import { searchKnowledge, checkDeepfake } from '@/lib/second-brain'
import { syncAmbilight, startRPG, rpgChoice } from '@/lib/entertainment-immersion'
import { activateStarkProtocol, deactivateStarkProtocol, detectDistraction, getPomodoroStatus, startPomodoro, getWorkSessionStats } from '@/lib/deep-work'
import { trackPrice, checkPriceAlerts, getUtilityBills, getSpendingInsights } from '@/lib/personal-finance'
import { getContactReminders, summarizeConversation, getUpcomingEvents, sendGreetingMessage } from '@/lib/relationship-crm'
import { readScreen, executeVoiceMacro, startGameSession, endGameSession, listMacros } from '@/lib/gamer-companion'

const createCalendarEventTool: FunctionDeclaration = {
  name: 'createCalendarEvent',
  description: 'Agenda um novo compromisso ou reunião no Google Calendar.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      summary: { type: SchemaType.STRING, description: 'O título do evento ou reunião.' },
      description: { type: SchemaType.STRING, description: 'Descrição detalhada do evento (opcional).' },
      startDateTime: { type: SchemaType.STRING, description: 'Data e hora de início no formato ISO 8601 (ex: 2026-06-12T14:00:00-03:00).' },
      endDateTime: { type: SchemaType.STRING, description: 'Data e hora de término no formato ISO 8601.' },
    },
    required: ['summary', 'startDateTime', 'endDateTime'],
  },
}

const listCalendarEventsTool: FunctionDeclaration = {
  name: 'listCalendarEvents',
  description: 'Lista os compromissos agendados no Google Calendar para o dia de hoje ou uma data específica.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      date: { type: SchemaType.STRING, description: 'A data específica para buscar no formato YYYY-MM-DD. Se o usuário pedir "hoje", use a data atual.' },
    },
    required: ['date'],
  },
}

const getWeatherTool: FunctionDeclaration = {
  name: 'getWeather',
  description: 'Consulta a situação meteorológica atual (temperatura, sensação, umidade, vento) de qualquer cidade ou país. Use sempre que perguntarem sobre clima, tempo ou temperatura.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      city: { type: SchemaType.STRING, description: 'Nome da cidade e, se útil, o país (ex: "Recife, BR" ou "Tóquio, JP").' },
    },
    required: ['city'],
  },
}

const getNewsTool: FunctionDeclaration = {
  name: 'getNews',
  description: 'Busca as notícias mais recentes sobre um assunto.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: { type: SchemaType.STRING, description: 'O tema das notícias (ex: "tecnologia", "Brasil", "Stark Industries").' },
    },
    required: ['query'],
  },
}

const searchWebTool: FunctionDeclaration = {
  name: 'searchWeb',
  description: 'Pesquisa informações atuais na web. Use para fatos recentes, dados que você não conhece ou perguntas do tipo "o que é / quem é / quando foi".',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: { type: SchemaType.STRING, description: 'O termo de busca.' },
    },
    required: ['query'],
  },
}

const wolframTool: FunctionDeclaration = {
  name: 'wolframQuery',
  description: 'Resolve cálculos matemáticos, conversões, equações e perguntas factuais quantitativas (ex: "integral de x^2", "distância da Terra à Lua").',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: { type: SchemaType.STRING, description: 'A expressão ou pergunta a calcular (em inglês funciona melhor).' },
    },
    required: ['query'],
  },
}

const sendWhatsAppMessageTool: FunctionDeclaration = {
  name: 'sendWhatsAppMessage',
  description: 'Envia uma mensagem de TEXTO via WhatsApp para um número. Não faz chamadas de voz. Use quando o usuário pedir para mandar/enviar um recado, aviso ou mensagem no WhatsApp.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      to: { type: SchemaType.STRING, description: 'Número de telefone no formato internacional, só dígitos (ex: 5581999998888 para Brasil/Recife).' },
      text: { type: SchemaType.STRING, description: 'O conteúdo da mensagem a enviar.' },
    },
    required: ['to', 'text'],
  },
}

const openInstagramTool: FunctionDeclaration = {
  name: 'openInstagram',
  description: 'Gera um link para abrir um perfil ou a caixa de mensagens (DM) do Instagram. O Instagram não permite enviar DMs por API, então isto retorna um link clicável para o usuário abrir o app.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      username: { type: SchemaType.STRING, description: 'O nome de usuário (@) do Instagram, sem o "@".' },
    },
    required: ['username'],
  },
}

// ─── SMART HOME TOOLS ──────────────────────────────────────────────────────────

const controlLightingTool: FunctionDeclaration = {
  name: 'controlLighting',
  description: 'Controla a iluminação da residência. Permite ligar/desligar luzes, ajustar brilho (0-100%) e cor em cômodos específicos.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      room: { type: SchemaType.STRING, description: 'Nome do cômodo (ex: "Sala de Estar", "Quarto", "Cozinha"). Se vazio, afeta todos os cômodos.' },
      state: { type: SchemaType.STRING, format: 'enum', enum: ['on', 'off'], description: 'Ligar ou desligar as luzes.' },
      brightness: { type: SchemaType.NUMBER, description: 'Nível de brilho de 0 a 100.' },
      color: { type: SchemaType.STRING, description: 'Cor da luz em hexadecimal (ex: "#ff9900" para laranja).' },
    },
  },
}

const controlClimateTool: FunctionDeclaration = {
  name: 'controlClimate',
  description: 'Controla o sistema de climatização (ar-condicionado/aquecedor). Permite ligar/desligar, ajustar temperatura e modo.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      room: { type: SchemaType.STRING, description: 'Nome do cômodo (ex: "Sala de Estar", "Quarto"). Se vazio, afeta todos os cômodos.' },
      temperature: { type: SchemaType.NUMBER, description: 'Temperatura desejada em °C (16-30).' },
      mode: { type: SchemaType.STRING, format: 'enum', enum: ['cool', 'heat', 'auto'], description: 'Modo de operação: frio, calor ou automático.' },
      state: { type: SchemaType.STRING, format: 'enum', enum: ['on', 'off'], description: 'Ligar ou desligar o climatizador.' },
    },
  },
}

const securityActionTool: FunctionDeclaration = {
  name: 'securityAction',
  description: 'Gerencia a segurança da residência. Permite trancar/destrancar portas, verificar status de câmeras e sensores, e emitir alertas.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      action: { type: SchemaType.STRING, format: 'enum', enum: ['status', 'lock', 'unlock', 'alerta'], description: 'Ação a executar: status (relatório), lock (trancar), unlock (destrancar), alerta (simular ameaça).' },
      location: { type: SchemaType.STRING, description: 'Local específico (ex: "Entrada Principal", "Portão"). Opcional.' },
    },
    required: ['action'],
  },
}

const nightModeTool: FunctionDeclaration = {
  name: 'nightMode',
  description: 'Ativa o modo noturno: apaga todas as luzes (exceto garagem), coloca climatizadores em economia, tranca portas e ativa câmeras.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

// ─── SYSTEM / LAB TOOLS ────────────────────────────────────────────────────────

const getSystemStatusTool: FunctionDeclaration = {
  name: 'getSystemStatus',
  description: 'Monitora o status do sistema: uso de CPU, temperatura, memória RAM, disco, tempo de atividade. Semelhante ao monitoramento de integridade da armadura.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const executeCliCommandTool: FunctionDeclaration = {
  name: 'executeCliCommand',
  description: 'Executa comandos no terminal do servidor. Comandos permitidos: npm, node, git, ls/dir, cat, echo, pwd, whoami, date, uptime, uname. Use com cautela.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      command: { type: SchemaType.STRING, description: 'O comando a executar (ex: "node --version", "git status").' },
    },
    required: ['command'],
  },
}

// ─── PRODUCTIVITY TOOLS ────────────────────────────────────────────────────────

const dailyBriefingTool: FunctionDeclaration = {
  name: 'dailyBriefing',
  description: 'Gera um resumo matinal completo: saudação personalizada, data, previsão do tempo e principais notícias do dia.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      city: { type: SchemaType.STRING, description: 'Cidade para a previsão do tempo (opcional, padrão: "São Paulo").' },
    },
  },
}

const researchQueryTool: FunctionDeclaration = {
  name: 'researchQuery',
  description: 'Pesquisa e sintetiza informações sobre um tópico, retornando um resumo com fontes. Ideal para documentação, estudos e solução de problemas.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      topic: { type: SchemaType.STRING, description: 'O tópico ou pergunta a pesquisar (ex: "Next.js 16 App Router", "diferença entre SQL e NoSQL").' },
    },
    required: ['topic'],
  },
}

// ─── MEMORY TOOLS ──────────────────────────────────────────────────────────────

const saveMemoryTool: FunctionDeclaration = {
  name: 'saveMemory',
  description: 'Salva uma informação na memória de longo prazo do usuário. Use para lembrar preferências, fatos pessoais, configurações e hábitos.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      key: { type: SchemaType.STRING, description: 'Identificador único da memória (ex: "musica_favorita", "cafe_preferido").' },
      value: { type: SchemaType.STRING, description: 'O valor/conteúdo a memorizar.' },
      category: { type: SchemaType.STRING, description: 'Categoria opcional (ex: "preferencia", "habito", "pessoal").' },
    },
    required: ['key', 'value'],
  },
}

const getMemoryTool: FunctionDeclaration = {
  name: 'getMemory',
  description: 'Recupera uma informação específica da memória de longo prazo do usuário pela chave.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      key: { type: SchemaType.STRING, description: 'A chave da memória a recuperar (ex: "musica_favorita").' },
    },
    required: ['key'],
  },
}

const searchMemoriesTool: FunctionDeclaration = {
  name: 'searchMemories',
  description: 'Busca na memória de longo prazo do usuário por palavras-chave. Útil para encontrar informações salvas sem saber a chave exata.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: { type: SchemaType.STRING, description: 'Termo de busca (ex: "música", "comida", "projeto").' },
    },
    required: ['query'],
  },
}

// ─── REMINDER TOOLS ────────────────────────────────────────────────────────────

const createReminderTool: FunctionDeclaration = {
  name: 'createReminder',
  description: 'Cria um lembrete contextual. Pode ser baseado em horário, localização ou ação futura.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      label: { type: SchemaType.STRING, description: 'Descrição do lembrete (ex: "Atualizar servidor", "Reunião com a equipe").' },
      context: { type: SchemaType.STRING, description: 'Contexto adicional ou gatilho (ex: "Quando eu ligar o computador", "Antes da reunião").' },
      location: { type: SchemaType.STRING, description: 'Localização opcional (ex: "Escritório", "Stark Tower").' },
    },
    required: ['label'],
  },
}

const listRemindersTool: FunctionDeclaration = {
  name: 'listReminders',
  description: 'Lista todos os lembretes ativos pendentes.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

// ─── SPATIAL AWARENESS / PRESENCE TOOLS ────────────────────────────────────────

const checkPresenceTool: FunctionDeclaration = {
  name: 'checkPresence',
  description: 'Verifica a presença de dispositivos conhecidos na casa (celular, smartwatch) via Bluetooth/Wi-Fi. Retorna em qual cômodo o usuário está e se a casa está ocupada.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const scanFacesTool: FunctionDeclaration = {
  name: 'scanFaces',
  description: 'Usa a webcam para detectar quantas pessoas estão na sala, reconhecer rostos conhecidos e identificar expressões. Ativa o modo de privacidade se houver visitas.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const switchAudioZoneTool: FunctionDeclaration = {
  name: 'switchAudioZone',
  description: 'Transfere a reprodução de áudio (música, notícias, podcast) de um cômodo para outro automaticamente. Útil quando o usuário muda de ambiente.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      fromZone: { type: SchemaType.STRING, description: 'Cômodo de origem do áudio (ex: "Escritório", "Sala de Estar").' },
      toZone: { type: SchemaType.STRING, description: 'Cômodo de destino do áudio (ex: "Cozinha", "Quarto").' },
    },
    required: ['fromZone', 'toZone'],
  },
}

const detectApproachTool: FunctionDeclaration = {
  name: 'detectApproach',
  description: 'Detecta se o usuário está se aproximando de casa ou de um cômodo específico pela intensidade do sinal Bluetooth/Wi-Fi do celular.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

// ─── NETWORK GUARDIAN / SECURITY TOOLS ─────────────────────────────────────────

const scanNetworkTool: FunctionDeclaration = {
  name: 'scanNetwork',
  description: 'Escaneia a rede Wi-Fi local e lista todos os dispositivos conectados, identificando dispositivos desconhecidos ou suspeitos. Emite alerta se encontrar ameaças.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const isolateDeviceTool: FunctionDeclaration = {
  name: 'isolateDevice',
  description: 'Isola um dispositivo suspeito da rede, cortando sua conexão e disparando backup automático dos dados críticos. Ação de segurança de alto impacto.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      deviceIp: { type: SchemaType.STRING, description: 'Endereço IP do dispositivo a ser isolado (ex: "192.168.1.100").' },
    },
    required: ['deviceIp'],
  },
}

const getThermalStatusTool: FunctionDeclaration = {
  name: 'getThermalStatus',
  description: 'Monitora a temperatura da CPU, GPU e ambiente. Se a temperatura estiver crítica, sugere ativar resfriamento de emergência.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const triggerCoolingTool: FunctionDeclaration = {
  name: 'triggerCooling',
  description: 'Ativa o sistema de resfriamento de emergência: liga o ar-condicionado no máximo para resfriar o ambiente quando o PC está superaquecendo.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

// ─── AUTONOMOUS AGENT TOOLS ────────────────────────────────────────────────────

const checkMaintenanceTool: FunctionDeclaration = {
  name: 'checkMaintenance',
  description: 'Verifica a vida útil de filtros, baterias, suprimentos (cápsulas de café, cartuchos) e adiciona automaticamente itens críticos à lista de compras.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const triageUrgencyTool: FunctionDeclaration = {
  name: 'triageUrgency',
  description: 'Analisa uma mensagem recebida para determinar se é uma emergência real. Se for, interrompe o Modo Foco e alerta o usuário. Se não, arquiva para leitura posterior.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      senderName: { type: SchemaType.STRING, description: 'Nome do remetente da mensagem.' },
      messageContent: { type: SchemaType.STRING, description: 'Conteúdo completo da mensagem a analisar.' },
    },
    required: ['senderName', 'messageContent'],
  },
}

const optimizeFinancesTool: FunctionDeclaration = {
  name: 'optimizeFinances',
  description: 'Analisa assinaturas e serviços contratados, identificando quais não são usados há mais de 30 dias e sugere cancelamento automático para economia.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const filterSpamTool: FunctionDeclaration = {
  name: 'filterSpam',
  description: 'Analisa uma mensagem para detectar se é spam ou golpe, usando padrões de texto, caracteres repetitivos e análise de conteúdo.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      messageContent: { type: SchemaType.STRING, description: 'O conteúdo da mensagem a ser analisada.' },
    },
    required: ['messageContent'],
  },
}

// ─── AR / HOLOGRAPHIC INTERFACE TOOLS ─────────────────────────────────────────

const projectAROverlayTool: FunctionDeclaration = {
  name: 'projectAROverlay',
  description: 'Projeta informações de realidade aumentada sobre um dispositivo ou eletrodoméstico: consumo de energia, temperatura, tempo restante de funcionamento e eficiência.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      deviceName: { type: SchemaType.STRING, description: 'Nome do dispositivo para projetar informações AR (ex: "Geladeira", "Servidor", "Reator Arc").' },
    },
    required: ['deviceName'],
  },
}

const getPowerGridStatusTool: FunctionDeclaration = {
  name: 'getPowerGridStatus',
  description: 'Exibe o status completo da rede elétrica da casa: consumo total por dispositivo, maior consumidor, e alertas de consumo elevado.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const hudGetMetricsTool: FunctionDeclaration = {
  name: 'hudGetMetrics',
  description: 'Retorna metricas do sistema para o painel HUD: uptime, processos ativos, trafego de rede e alertas ativos.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

// ─── HEALTH / BIOMETRICS TOOLS ──────────────────────────────────────────────────

const analyzeFatigueTool: FunctionDeclaration = {
  name: 'analyzeFatigue',
  description: 'Usa a webcam para analisar postura e frequencia de piscadas. Se detectar fadiga ou ma postura, avisa o usuario e recomenda pausa.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const getHealthSnapshotTool: FunctionDeclaration = {
  name: 'getHealthSnapshot',
  description: 'Sincroniza dados do smartwatch (Apple Watch, Galaxy Watch, Mi Band): batimentos cardiacos, nivel de stress, SpO2 e passos do dia.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const relaxEnvironmentTool: FunctionDeclaration = {
  name: 'relaxEnvironment',
  description: 'Ativa modo relaxamento: toca musica calmante, ajusta as luzes para tom quente e reduz a intensidade. Ideal quando o usuario esta estressado.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const analyzeSleepTool: FunctionDeclaration = {
  name: 'analyzeSleep',
  description: 'Analisa a qualidade do sono da noite anterior. Se o sono foi ruim, prepara um briefing matinal resumido e ajusta alarme se a agenda permitir.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

// ─── VEHICLE / COPILOT TOOLS ────────────────────────────────────────────────────

const getVehicleStatusTool: FunctionDeclaration = {
  name: 'getVehicleStatus',
  description: 'Obtem diagnosticos do veiculo via sistema OBD2: nivel de combustivel/bateria, pressao dos pneus, oleo, quilometragem e proxima revisao.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const checkTirePressureTool: FunctionDeclaration = {
  name: 'checkTirePressure',
  description: 'Verifica a pressao de cada pneu do veiculo e alerta se algum estiver abaixo do recomendado.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const calculateRouteTool: FunctionDeclaration = {
  name: 'calculateRoute',
  description: 'Calcula a melhor rota ate um destino, estimando distancia, tempo, condicoes de transito e combustivel necessario.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      destination: { type: SchemaType.STRING, description: 'Destino desejado (ex: "Stark Tower, Nova York", "Lab do Brooklyn").' },
    },
    required: ['destination'],
  },
}

const planTripTool: FunctionDeclaration = {
  name: 'planTrip',
  description: 'Planeja uma viagem completa: previsao do tempo no destino, condicoes da estrada, cria playlist, e ativa modo Ferias em casa (luzes simulam presenca).',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      destination: { type: SchemaType.STRING, description: 'Destino da viagem (ex: "Malibu", "Lake Tahoe").' },
      departureDate: { type: SchemaType.STRING, description: 'Data e hora de partida no formato ISO 8601.' },
    },
    required: ['destination', 'departureDate'],
  },
}

// ─── SECOND BRAIN / KNOWLEDGE TOOLS ─────────────────────────────────────────────

const searchKnowledgeTool: FunctionDeclaration = {
  name: 'searchKnowledge',
  description: 'Pesquisa na base de conhecimento pessoal do usuario (PDFs, notas, codigos, links) por um termo ou ideia. Retorna o trecho exato com o arquivo de origem.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: { type: SchemaType.STRING, description: 'Termo a buscar na base de conhecimento (ex: "automacao de APIs", "arquitetura microservicos").' },
    },
    required: ['query'],
  },
}

const checkDeepfakeTool: FunctionDeclaration = {
  name: 'checkDeepfake',
  description: 'Analisa um link ou texto suspeito para detectar desinformacao ou midia gerada por IA. Faz checagem cruzada com portais de verificacao de fatos.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      urlOrText: { type: SchemaType.STRING, description: 'URL da noticia ou texto a ser verificado.' },
    },
    required: ['urlOrText'],
  },
}

// ─── ENTERTAINMENT / IMMERSION TOOLS ────────────────────────────────────────────

const syncAmbilightTool: FunctionDeclaration = {
  name: 'syncAmbilight',
  description: 'Sincroniza as luzes inteligentes do comodo com a midia atual: musica (ritmo), filme (cinema) ou jogo (cores dinamicas).',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      mode: { type: SchemaType.STRING, description: 'Modo de sincronizacao: "music" para musica, "video" para filmes, "game" para jogos.' },
    },
    required: ['mode'],
  },
}

const startRPGTool: FunctionDeclaration = {
  name: 'startRPG',
  description: 'Inicia uma sessao interativa de RPG de mesa com o J.A.R.V.I.S. como narrador. Ele cria uma historia dinâmica com efeitos sonoros baseada nas escolhas do usuario.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      playerName: { type: SchemaType.STRING, description: 'Nome do jogador/personagem (ex: "Tony Stark", "Doutor Estranho").' },
      scenario: { type: SchemaType.STRING, description: 'Cenario opcional para a aventura. Se vazio, o J.A.R.V.I.S. escolhe um.' },
    },
    required: ['playerName'],
  },
}

const rpgChoiceTool: FunctionDeclaration = {
  name: 'rpgChoice',
  description: 'Envia a escolha do usuario em uma sessao de RPG ativa. O J.A.R.V.I.S. narra o desfecho baseado na opcao selecionada (indice 0-3).',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      choiceIndex: { type: SchemaType.NUMBER, description: 'Indice da escolha do usuario (0, 1, 2 ou 3).' },
    },
    required: ['choiceIndex'],
  },
}

// ─── DEEP WORK / FOCUS TOOLS ────────────────────────────────────────────────────

const activateStarkProtocolTool: FunctionDeclaration = {
  name: 'activateStarkProtocol',
  description: 'Ativa o Protocolo Stark de foco extremo: bloqueia redes sociais no roteador, fecha abas inuteis, abre VS Code e terminal, ajusta iluminacao para azul frio.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const deactivateStarkProtocolTool: FunctionDeclaration = {
  name: 'deactivateStarkProtocol',
  description: 'Desativa o Protocolo Stark e retorna o ambiente ao normal.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const detectDistractionTool: FunctionDeclaration = {
  name: 'detectDistraction',
  description: 'Escuta o microfone para detectar se o usuario esta procrastinando (som de YouTube, TikTok, games). Se sim, interrompe nos fones com um aviso.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const getPomodoroStatusTool: FunctionDeclaration = {
  name: 'getPomodoroStatus',
  description: 'Retorna o status do cronometro Pomodoro adaptativo: monitora digitaçao e cliques para sugerir pausa exatamente no momento de queda de produtividade.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const startPomodoroTool: FunctionDeclaration = {
  name: 'startPomodoro',
  description: 'Inicia um novo ciclo Pomodoro adaptativo. O timer nao e fixo - ele monitora seu ritmo de trabalho e sugere pausas quando detecta fadiga natural.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const getWorkSessionStatsTool: FunctionDeclaration = {
  name: 'getWorkSessionStats',
  description: 'Retorna estatisticas das sessoes de foco do dia: minutos produtivos, horario de pico, numero de sessoes e produtividade media.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

// ─── PERSONAL FINANCE TOOLS ─────────────────────────────────────────────────────

const trackPriceTool: FunctionDeclaration = {
  name: 'trackPrice',
  description: 'Cria um alerta de preco para um produto. A IA verifica diariamente o valor em lojas online e avisa quando o preco cair abaixo do alvo definido.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      productName: { type: SchemaType.STRING, description: 'Nome do produto a monitorar (ex: "RTX 5090", "Monitor Ultrawide 49").' },
      targetPrice: { type: SchemaType.NUMBER, description: 'Preco alvo em reais (ex: 3000 para R$ 3.000).' },
    },
    required: ['productName', 'targetPrice'],
  },
}

const checkPriceAlertsTool: FunctionDeclaration = {
  name: 'checkPriceAlerts',
  description: 'Verifica todos os alertas de preco ativos e retorna quais produtos atingiram o valor alvo. Fica atento a promocoes e quedas de preco.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const getUtilityBillsTool: FunctionDeclaration = {
  name: 'getUtilityBills',
  description: 'Calcula o gasto de energia, agua e internet do mes. Se o consumo projetado ultrapassar o orcamento, sugere acoes como ligar ar-condicionado no modo economico.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const getSpendingInsightsTool: FunctionDeclaration = {
  name: 'getSpendingInsights',
  description: 'Analisa os gastos do mes por categoria (assinaturas, alimentacao, energia) e sugere acoes para economizar.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

// ─── RELATIONSHIP CRM TOOLS ─────────────────────────────────────────────────────

const getContactRemindersTool: FunctionDeclaration = {
  name: 'getContactReminders',
  description: 'Mostra contatos com quem o usuario nao fala ha mais de 2 semanas e sugere uma mensagem personalizada com base na atividade recente da pessoa.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const summarizeConversationTool: FunctionDeclaration = {
  name: 'summarizeConversation',
  description: 'Le as mensagens acumuladas de um grupo silenciado (familia, trabalho) e produz um resumo em topicos com acoes necessarias. Otimo para grupos com centenas de mensagens.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      groupName: { type: SchemaType.STRING, description: 'Nome do grupo para resumir (ex: "Familia", "Projeto X").' },
    },
    required: ['groupName'],
  },
}

const getUpcomingEventsTool: FunctionDeclaration = {
  name: 'getUpcomingEvents',
  description: 'Lista eventos sociais proximos: aniversarios, aniversarios de amigos/familiares e eventos corporativos, com sugestao de presente ou acao.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {},
  },
}

const sendGreetingMessageTool: FunctionDeclaration = {
  name: 'sendGreetingMessage',
  description: 'Gera uma mensagem personalizada para um contato baseada no que ele postou recentemente. Ajuda a manter contato com pessoas importantes.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      contactName: { type: SchemaType.STRING, description: 'Nome do contato para gerar a mensagem.' },
    },
    required: ['contactName'],
  },
}

// ─── GAMER COMPANION TOOLS ──────────────────────────────────────────────────────

const readScreenTool: FunctionDeclaration = {
  name: 'readScreen',
  description: 'Usa visao computacional (OCR) para ler atributos do jogo na tela: vida, municao, recursos. Da dicas por voz como "municao abaixo de 15%, inimigos no flanco esquerdo".',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      gameTitle: { type: SchemaType.STRING, description: 'Nome do jogo opcional para contexto (ex: "Call of Duty", "The Witcher 3").' },
    },
  },
}

const executeVoiceMacroTool: FunctionDeclaration = {
  name: 'executeVoiceMacro',
  description: 'Executa comandos complexos de teclado por comando de voz. Ex: diga "kit medico" e ele aperta a sequencia exata para curar seu personagem.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      commandName: { type: SchemaType.STRING, description: 'Nome do macro a executar (ex: "kit medico", "recarregar", "ultimate").' },
    },
    required: ['commandName'],
  },
}

const startGameSessionTool: FunctionDeclaration = {
  name: 'startGameSession',
  description: 'Inicia uma sessao de jogo monitorada. O J.A.R.V.I.S. comeca a ler a tela e oferecer sugestoes em tempo real.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      gameTitle: { type: SchemaType.STRING, description: 'Nome do jogo (ex: "Call of Duty", "League of Legends").' },
    },
    required: ['gameTitle'],
  },
}

const listMacrosTool: FunctionDeclaration = {
  name: 'listMacros',
  description: 'Lista todos os macros de voz disponiveis para jogos, com descricao do que cada um faz e qual jogo.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      game: { type: SchemaType.STRING, description: 'Filtrar macros por jogo (opcional, ex: "FPS").' },
    },
  },
}

export const functionDeclarations: FunctionDeclaration[] = [
  createCalendarEventTool,
  listCalendarEventsTool,
  getWeatherTool,
  getNewsTool,
  searchWebTool,
  wolframTool,
  sendWhatsAppMessageTool,
  openInstagramTool,
  controlLightingTool,
  controlClimateTool,
  securityActionTool,
  nightModeTool,
  getSystemStatusTool,
  executeCliCommandTool,
  dailyBriefingTool,
  researchQueryTool,
  saveMemoryTool,
  getMemoryTool,
  searchMemoriesTool,
  createReminderTool,
  listRemindersTool,

  // Spatial Awareness / Presence
  checkPresenceTool,
  scanFacesTool,
  switchAudioZoneTool,
  detectApproachTool,

  // Network Guardian / Security
  scanNetworkTool,
  isolateDeviceTool,
  getThermalStatusTool,
  triggerCoolingTool,

  // Autonomous Agent
  checkMaintenanceTool,
  triageUrgencyTool,
  optimizeFinancesTool,
  filterSpamTool,

  // AR / Holographic Interface
  projectAROverlayTool,
  getPowerGridStatusTool,
  hudGetMetricsTool,

  // Health / Biometrics
  analyzeFatigueTool,
  getHealthSnapshotTool,
  relaxEnvironmentTool,
  analyzeSleepTool,

  // Vehicle / Copilot
  getVehicleStatusTool,
  checkTirePressureTool,
  calculateRouteTool,
  planTripTool,

  // Second Brain / Knowledge
  searchKnowledgeTool,
  checkDeepfakeTool,

  // Entertainment / Immersion
  syncAmbilightTool,
  startRPGTool,
  rpgChoiceTool,

  // Deep Work / Focus
  activateStarkProtocolTool,
  deactivateStarkProtocolTool,
  detectDistractionTool,
  getPomodoroStatusTool,
  startPomodoroTool,
  getWorkSessionStatsTool,

  // Personal Finance
  trackPriceTool,
  checkPriceAlertsTool,
  getUtilityBillsTool,
  getSpendingInsightsTool,

  // Relationship CRM
  getContactRemindersTool,
  summarizeConversationTool,
  getUpcomingEventsTool,
  sendGreetingMessageTool,

  // Gamer Companion
  readScreenTool,
  executeVoiceMacroTool,
  startGameSessionTool,
  listMacrosTool,
]

let currentUserId: string | null = null

export function setToolContext(userId: string) {
  currentUserId = userId
}

export async function executeTool(
  name: string,
  args: Record<string, any>
): Promise<Record<string, any>> {
  switch (name) {
    case 'getWeather':
      return getWeather(String(args.city ?? ''))
    case 'getNews':
      return getNews(String(args.query ?? ''))
    case 'searchWeb':
      return searchWeb(String(args.query ?? ''))
    case 'wolframQuery':
      return wolframQuery(String(args.query ?? ''))
    case 'sendWhatsAppMessage':
      return sendWhatsAppMessage(String(args.to ?? ''), String(args.text ?? ''))
    case 'openInstagram': {
      const username = String(args.username ?? '').replace(/^@/, '').trim()
      if (!username) return { error: 'Informe o nome de usuário do Instagram.' }
      return {
        username,
        profileUrl: `https://instagram.com/${username}`,
        directUrl: `https://ig.me/m/${username}`,
        note: 'O Instagram não permite enviar DMs por API. Use o link para abrir a conversa no app.',
      }
    }
    case 'createCalendarEvent':
    case 'listCalendarEvents':
      return executeCalendarFunction(name, args)

    // Smart Home
    case 'controlLighting':
      return controlLighting(args)
    case 'controlClimate':
      return controlClimate(args)
    case 'securityAction':
      return securityAction(args)
    case 'nightMode':
      return nightMode()

    // System / Lab
    case 'getSystemStatus':
      return getSystemStatus()
    case 'executeCliCommand':
      return executeCliCommand(String(args.command ?? ''))

    // Productivity
    case 'dailyBriefing':
      return dailyBriefing(args.city ? String(args.city) : undefined)
    case 'researchQuery':
      return researchQuery(String(args.topic ?? ''))

    // Memory
    case 'saveMemory':
      if (!currentUserId) return { error: 'Usuário não autenticado.' }
      return saveMemory(currentUserId, String(args.key), String(args.value), String(args.category ?? 'general'))
    case 'getMemory':
      if (!currentUserId) return { error: 'Usuário não autenticado.' }
      return getMemory(currentUserId, String(args.key ?? ''))
    case 'searchMemories':
      if (!currentUserId) return { error: 'Usuário não autenticado.' }
      return searchMemories(currentUserId, String(args.query ?? ''))

    // Reminders
    case 'createReminder':
      if (!currentUserId) return { error: 'Usuário não autenticado.' }
      return createReminder(currentUserId, args)
    case 'listReminders':
      if (!currentUserId) return { error: 'Usuário não autenticado.' }
      return listReminders(currentUserId)

    // Spatial Awareness
    case 'checkPresence':
      return checkPresence()
    case 'scanFaces':
      return scanFaces()
    case 'switchAudioZone':
      return switchAudioZone(String(args.fromZone ?? ''), String(args.toZone ?? ''))
    case 'detectApproach':
      return detectApproach()

    // Network Guardian
    case 'scanNetwork':
      return scanNetwork()
    case 'isolateDevice':
      return isolateThreat(String(args.deviceIp ?? ''))
    case 'getThermalStatus':
      return getThermalStatus()
    case 'triggerCooling':
      return triggerThermalCooling()

    // Autonomous Agent
    case 'checkMaintenance':
      return checkMaintenance()
    case 'triageUrgency':
      return triageUrgency(String(args.senderName ?? ''), String(args.messageContent ?? ''))
    case 'optimizeFinances':
      return optimizeFinances()
    case 'filterSpam':
      return filterSpam(String(args.messageContent ?? ''))

    // AR / Holographic Interface
    case 'projectAROverlay':
      return projectAROverlay(String(args.deviceName ?? ''))
    case 'getPowerGridStatus':
      return getPowerGridStatus()
    case 'hudGetMetrics':
      return hudGetMetrics()

    // Health / Biometrics
    case 'analyzeFatigue':
      return analyzeFatigue()
    case 'getHealthSnapshot':
      return getHealthSnapshot()
    case 'relaxEnvironment':
      return relaxEnvironment()
    case 'analyzeSleep':
      return analyzeSleep()

    // Vehicle / Copilot
    case 'getVehicleStatus':
      return getVehicleStatus()
    case 'checkTirePressure':
      return checkTirePressure()
    case 'calculateRoute':
      return calculateRoute(String(args.destination ?? ''))
    case 'planTrip':
      return planTrip(String(args.destination ?? ''), String(args.departureDate ?? ''))

    // Second Brain / Knowledge
    case 'searchKnowledge':
      return searchKnowledge(String(args.query ?? ''))
    case 'checkDeepfake':
      return checkDeepfake(String(args.urlOrText ?? ''))

    // Entertainment / Immersion
    case 'syncAmbilight':
      return syncAmbilight(String(args.mode ?? 'off') as any, args.mediaType)
    case 'startRPG':
      return startRPG(String(args.playerName ?? 'Tony'), args.scenario ? String(args.scenario) : undefined)
    case 'rpgChoice':
      return rpgChoice(Number(args.choiceIndex ?? 0))

    // Deep Work / Focus
    case 'activateStarkProtocol':
      return activateStarkProtocol()
    case 'deactivateStarkProtocol':
      return deactivateStarkProtocol()
    case 'detectDistraction':
      return detectDistraction()
    case 'getPomodoroStatus':
      return getPomodoroStatus()
    case 'startPomodoro':
      return startPomodoro()
    case 'getWorkSessionStats':
      return getWorkSessionStats()

    // Personal Finance
    case 'trackPrice':
      return trackPrice(String(args.productName ?? ''), Number(args.targetPrice ?? 0))
    case 'checkPriceAlerts':
      return checkPriceAlerts()
    case 'getUtilityBills':
      return getUtilityBills()
    case 'getSpendingInsights':
      return getSpendingInsights()

    // Relationship CRM
    case 'getContactReminders':
      return getContactReminders()
    case 'summarizeConversation':
      return summarizeConversation(String(args.groupName ?? ''))
    case 'getUpcomingEvents':
      return getUpcomingEvents()
    case 'sendGreetingMessage':
      return sendGreetingMessage(String(args.contactName ?? ''))

    // Gamer Companion
    case 'readScreen':
      return readScreen(args.gameTitle ? String(args.gameTitle) : undefined)
    case 'executeVoiceMacro':
      return executeVoiceMacro(String(args.commandName ?? ''))
    case 'startGameSession':
      return startGameSession(String(args.gameTitle ?? ''))
    case 'listMacros':
      return listMacros(args.game ? String(args.game) : undefined)

    default:
      return { error: `Função desconhecida: ${name}` }
  }
}

async function createReminder(userId: string, args: Record<string, any>): Promise<Record<string, any>> {
  try {
    const reminder = await prisma.reminder.create({
      data: {
        userId,
        label: String(args.label ?? ''),
        context: args.context ? String(args.context) : null,
        location: args.location ? String(args.location) : null,
      },
    })
    return {
      success: true,
      reminder: {
        id: reminder.id,
        label: reminder.label,
        context: reminder.context,
        location: reminder.location,
        createdAt: reminder.createdAt.toISOString(),
      },
    }
  } catch (err: any) {
    return { error: `Falha ao criar lembrete: ${err.message}` }
  }
}

async function listReminders(userId: string): Promise<Record<string, any>> {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { userId, completed: false },
      orderBy: { createdAt: 'desc' },
    })
    return {
      count: reminders.length,
      reminders: reminders.map(r => ({
        id: r.id,
        label: r.label,
        context: r.context,
        location: r.location,
        createdAt: r.createdAt.toISOString(),
      })),
    }
  } catch (err: any) {
    return { error: `Falha ao listar lembretes: ${err.message}` }
  }
}
