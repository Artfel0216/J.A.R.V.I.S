'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Wifi, Shield, Thermometer, Monitor, AlertTriangle,
  BarChart3, X, RefreshCw, Fan,
  Users, Radio, Coffee, Heart, Car, BookOpen, Gamepad2,
  BrainCircuit, DollarSign, Users2, Gamepad,
} from 'lucide-react'

type PanelTab = 'presence' | 'network' | 'thermal' | 'maintenance' | 'finance' | 'ar' | 'health' | 'vehicle' | 'knowledge' | 'entertainment' | 'deepwork' | 'personalfinance' | 'crm' | 'gamer'

interface TabConfig {
  id: PanelTab
  label: string
  icon: typeof Wifi
}

const tabs: TabConfig[] = [
  { id: 'presence', label: 'PRESENÇA', icon: Users },
  { id: 'network', label: 'REDE', icon: Wifi },
  { id: 'health', label: 'SAÚDE', icon: Heart },
  { id: 'vehicle', label: 'VEÍCULO', icon: Car },
  { id: 'deepwork', label: 'FOCO', icon: BrainCircuit },
  { id: 'personalfinance', label: 'OFERTAS', icon: DollarSign },
  { id: 'crm', label: 'RELAÇÕES', icon: Users2 },
  { id: 'gamer', label: 'GAMER', icon: Gamepad },
  { id: 'thermal', label: 'TÉRMICO', icon: Thermometer },
  { id: 'maintenance', label: 'MANUTENÇÃO', icon: Coffee },
  { id: 'finance', label: 'FINANÇAS', icon: BarChart3 },
  { id: 'knowledge', label: 'CONHECIMENTO', icon: BookOpen },
  { id: 'entertainment', label: 'RPG', icon: Gamepad2 },
  { id: 'ar', label: 'AR/HUD', icon: Monitor },
]

export function SmartHomePanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<PanelTab>('presence')
  const [data, setData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async (tab: PanelTab) => {
    setLoading(true)
    try {
      const endpoints: Record<PanelTab, string> = {
        presence: '/api/presence',
        network: '/api/network-guardian?type=scan',
        thermal: '/api/network-guardian?type=thermal',
        maintenance: '/api/autonomous?type=maintenance',
        finance: '/api/autonomous?type=finance',
        ar: '/api/ar-hud?type=metrics',
        health: '/api/health-biometrics?type=fatigue',
        vehicle: '/api/vehicle?type=status',
        knowledge: '/api/second-brain?type=search&query=arquitetura',
        entertainment: '/api/entertainment',
        deepwork: '/api/deep-work?type=pomodoro',
        personalfinance: '/api/personal-finance?type=alerts',
        crm: '/api/relationship-crm?type=contacts',
        gamer: '/api/gamer?type=macros',
      }
      const res = await fetch(endpoints[tab])
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isOpen) fetchData(activeTab)
  }, [isOpen, activeTab, fetchData])

  const handleTabChange = (tab: PanelTab) => {
    setActiveTab(tab)
    fetchData(tab)
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 bottom-24 z-40 bg-black/80 backdrop-blur-xl border border-amber-500/30 text-amber-400 rounded-xl px-3 py-2 font-mono text-[10px] tracking-wider shadow-lg hover:shadow-amber-500/10 transition-all flex items-center gap-2"
      >
        <Monitor size={14} />
        {isOpen ? 'FECHAR HUD' : 'HUD FLUTUANTE'}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -320 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-4 bottom-36 z-40 w-[320px] max-h-[60vh] bg-black/90 backdrop-blur-2xl border border-amber-500/20 rounded-2xl shadow-[0_0_40px_rgba(245,158,11,0.1)] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-3 border-b border-red-950/50">
              <span className="font-mono text-[10px] tracking-[3px] text-amber-400 font-bold uppercase">
                STARK_HUD::PANEL
              </span>
              <button onClick={() => setIsOpen(false)} className="p-1 text-red-500/60 hover:text-red-400">
                <X size={14} />
              </button>
            </div>

            <div className="flex gap-1 p-2 border-b border-red-950/30 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-mono tracking-wider transition-all whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-red-400/40 hover:text-amber-400/60 border border-transparent'
                  )}
                >
                  <tab.icon size={11} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-amber-600/20">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw size={16} className="text-amber-500 animate-spin" />
                </div>
              ) : (
                <PanelContent tab={activeTab} data={data} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function PanelContent({ tab, data }: { tab: PanelTab; data: Record<string, any> }) {
  switch (tab) {
    case 'presence': return <PresencePanel data={data} />
    case 'network': return <NetworkPanel data={data} />
    case 'thermal': return <ThermalPanel data={data} />
    case 'maintenance': return <MaintenancePanel data={data} />
    case 'finance': return <FinancePanel data={data} />
    case 'ar': return <ARPanel data={data} />
    case 'health': return <HealthPanel data={data} />
    case 'vehicle': return <VehiclePanel data={data} />
    case 'knowledge': return <KnowledgePanel data={data} />
    case 'entertainment': return <EntertainmentPanel data={data} />
    case 'deepwork': return <DeepWorkPanel data={data} />
    case 'personalfinance': return <PersonalFinancePanel data={data} />
    case 'crm': return <CRMPanel data={data} />
    case 'gamer': return <GamerPanel data={data} />
    default: return null
  }
}

function PresencePanel({ data }: { data: Record<string, any> }) {
  const devices = data.devices || []
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/60 mb-1">
        <Radio size={12} />
        <span>DISPOSITIVOS DETECTADOS: {data.totalDevices || 0}</span>
      </div>
      {devices.map((d: any, i: number) => (
        <div key={i} className="bg-red-950/20 border border-red-950/40 rounded-xl p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", d.detected ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-red-500")} />
            <div>
              <div className="text-[11px] font-mono text-amber-100">{d.deviceName || d.hostname}</div>
              <div className="text-[8px] font-mono text-red-400/40">{d.deviceType} • {d.room || '?'}</div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-amber-400/60">
            {d.signalStrength || d.threatLevel === 'safe' ? `${d.signalStrength}%` : d.threatLevel}
          </div>
        </div>
      ))}
      {data.primaryRoom && (
        <div className="text-[9px] font-mono text-amber-500/40 mt-1">
          CÔMODO PRINCIPAL: {data.primaryRoom}
        </div>
      )}
    </div>
  )
}

function NetworkPanel({ data }: { data: Record<string, any> }) {
  const devices = data.devices || []
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono">
        <Shield size={12} className="text-amber-400" />
        <span className="text-amber-400/60">REDE: {data.totalDevices || 0} DISPOSITIVOS</span>
        {data.alert && <AlertTriangle size={12} className="text-red-500 animate-pulse" />}
      </div>
      {data.alertMessage && (
        <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-2 text-[9px] font-mono text-red-400">
          {data.alertMessage}
        </div>
      )}
      {devices.slice(0, 6).map((d: any, i: number) => (
        <div key={i} className="bg-red-950/20 border border-red-950/40 rounded-xl p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              d.threatLevel === 'safe' ? "bg-green-500" : d.threatLevel === 'suspicious' ? "bg-yellow-500" : "bg-red-500"
            )} />
            <div>
              <div className="text-[11px] font-mono text-amber-100">{d.hostname}</div>
              <div className="text-[8px] font-mono text-red-400/40">{d.ip} • {d.manufacturer || 'Desconhecido'}</div>
            </div>
          </div>
          <div className={cn(
            "text-[9px] font-mono px-1.5 py-0.5 rounded",
            d.known ? "text-green-400/60" : "text-yellow-500/80"
          )}>
            {d.known ? 'CONHECIDO' : 'DESCONHECIDO'}
          </div>
        </div>
      ))}
    </div>
  )
}

function ThermalPanel({ data }: { data: Record<string, any> }) {
  const isCritical = data.critical
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[10px] font-mono">
        <Thermometer size={12} className={isCritical ? "text-red-500 animate-pulse" : "text-amber-400"} />
        <span className={isCritical ? "text-red-400" : "text-amber-400/60"}>
          TEMPERATURA DO SISTEMA
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center">
          <div className="text-[8px] font-mono text-red-400/40">CPU</div>
          <div className={cn("text-lg font-mono font-bold", isCritical ? "text-red-500" : "text-amber-400")}>
            {data.cpuTemp || '--'}°
          </div>
        </div>
        {data.gpuTemp && (
          <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center">
            <div className="text-[8px] font-mono text-red-400/40">GPU</div>
            <div className="text-lg font-mono font-bold text-amber-400">{data.gpuTemp}°</div>
          </div>
        )}
      </div>
      {isCritical && (
        <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-2 flex items-center gap-2">
          <Fan size={14} className="text-red-500 animate-spin" />
          <div>
            <div className="text-[10px] font-mono text-red-400">RESFRIAMENTO ATIVO</div>
            <div className="text-[8px] font-mono text-red-400/60">Ar-condicionado em {data.acRoom} ligado no máximo</div>
          </div>
        </div>
      )}
    </div>
  )
}

function MaintenancePanel({ data }: { data: Record<string, any> }) {
  const items = data.items || []
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/60">
        <Coffee size={12} />
        <span>MANUTENÇÃO PROGRAMADA</span>
      </div>
      {items.map((item: any, i: number) => (
        <div key={i} className="bg-red-950/20 border border-red-950/40 rounded-xl p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              item.status === 'good' ? "bg-green-500" : item.status === 'warning' ? "bg-yellow-500" : "bg-red-500"
            )} />
            <div>
              <div className="text-[11px] font-mono text-amber-100">{item.item}</div>
              <div className="text-[8px] font-mono text-red-400/40">{item.category} • Vida útil: {item.estimatedLifeLeft}</div>
            </div>
          </div>
          {item.autoAddedToShoppingList && (
            <div className="text-[8px] font-mono text-blue-400/60">✓ LISTA</div>
          )}
        </div>
      ))}
      {data.shoppingListAdditions?.length > 0 && (
        <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-2 text-[9px] font-mono text-blue-400">
          📋 Adicionado à lista de compras: {data.shoppingListAdditions.join(', ')}
        </div>
      )}
    </div>
  )
}

function FinancePanel({ data }: { data: Record<string, any> }) {
  const subscriptions = data.subscriptions || []
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/60">
        <BarChart3 size={12} />
        <span>ASSINATURAS: R$ {data.totalMonthlySpending?.toFixed(2) || '0'}/mês</span>
      </div>
      {subscriptions.map((s: any, i: number) => (
        <div key={i} className={cn(
          "rounded-xl p-2 border flex items-center justify-between",
          s.suggestedAction === 'cancel' ? "bg-red-950/20 border-red-500/30" : "bg-red-950/10 border-red-950/40"
        )}>
          <div>
            <div className="text-[11px] font-mono text-amber-100">{s.name}</div>
            <div className="text-[8px] font-mono text-red-400/40">R$ {s.monthlyCost.toFixed(2)} • {s.daysSinceLastUse}d sem uso</div>
          </div>
          <div className={cn(
            "text-[8px] font-mono px-1.5 py-0.5 rounded",
            s.suggestedAction === 'cancel' ? "bg-red-500/20 text-red-400" : "text-green-400/60"
          )}>
            {s.suggestedAction === 'cancel' ? 'CANCELAR' : s.suggestedAction.toUpperCase()}
          </div>
        </div>
      ))}
      {data.potentialMonthlySavings > 0 && (
        <div className="bg-green-950/20 border border-green-500/30 rounded-xl p-2 text-[9px] font-mono text-green-400">
          💰 Economia potencial: R$ {data.potentialMonthlySavings.toFixed(2)}/mês
        </div>
      )}
    </div>
  )
}

function ARPanel({ data }: { data: Record<string, any> }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/60">
        <Monitor size={12} />
        <span>PROJEÇÃO HOLOGRÁFICA</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center">
          <div className="text-[8px] font-mono text-red-400/40">UPTIME</div>
          <div className="text-xs font-mono text-amber-400">{data.systemUptime || '--'}</div>
        </div>
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center">
          <div className="text-[8px] font-mono text-red-400/40">PROCESSOS</div>
          <div className="text-xs font-mono text-amber-400">{data.activeProcesses || '--'}</div>
        </div>
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center">
          <div className="text-[8px] font-mono text-red-400/40">TRAFEGO IN</div>
          <div className="text-[10px] font-mono text-amber-400">{data.networkTraffic?.inbound || '--'}</div>
        </div>
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center">
          <div className="text-[8px] font-mono text-red-400/40">TRAFEGO OUT</div>
          <div className="text-[10px] font-mono text-amber-400">{data.networkTraffic?.outbound || '--'}</div>
        </div>
      </div>
      {data.activeAlerts > 0 && (
        <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-2 text-[9px] font-mono text-red-400">
          {data.activeAlerts} alerta(s) ativo(s)
        </div>
      )}
    </div>
  )
}

function HealthPanel({ data }: { data: Record<string, any> }) {
  const alert = data.alert || data.fatigueLevel === 'critical'
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono">
        <Heart size={12} className={alert ? 'text-red-500 animate-pulse' : 'text-amber-400'} />
        <span className={alert ? 'text-red-400' : 'text-amber-400/60'}>ANÁLISE DE FADIGA</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center">
          <div className="text-[8px] font-mono text-red-400/40">POSTURA</div>
          <div className={cn('text-lg font-mono font-bold', data.postureScore < 50 ? 'text-red-500' : 'text-amber-400')}>
            {data.postureScore || '--'}%
          </div>
        </div>
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center">
          <div className="text-[8px] font-mono text-red-400/40">FADIGA</div>
          <div className={cn('text-[10px] font-mono font-bold uppercase', data.fatigueLevel === 'high' || data.fatigueLevel === 'critical' ? 'text-red-500' : 'text-amber-400')}>
            {data.fatigueLevel || '--'}
          </div>
        </div>
      </div>
      {data.recommendation && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-2 text-[9px] font-mono text-amber-400">
          {data.recommendation}
        </div>
      )}
      <div className="text-[9px] font-mono text-red-400/40 mt-1">
        Piscadas/min: {data.blinkRate} • Última pausa: há {data.hoursSinceLastBreak}h
      </div>
    </div>
  )
}

function VehiclePanel({ data }: { data: Record<string, any> }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/60">
        <Car size={12} />
        <span>STATUS DO VEÍCULO</span>
      </div>
      {data.model && (
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-2 text-[10px] font-mono text-amber-100">
          {data.model}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center">
          <div className="text-[8px] font-mono text-red-400/40">COMBUSTÍVEL</div>
          <div className={cn('text-lg font-mono font-bold', (data.fuelLevel || 0) < 20 ? 'text-red-500' : 'text-amber-400')}>
            {data.fuelLevel || '--'}%
          </div>
        </div>
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center">
          <div className="text-[8px] font-mono text-red-400/40">BATERIA</div>
          <div className="text-lg font-mono font-bold text-amber-400">{data.batteryLevel || '--'}%</div>
        </div>
      </div>
      <div className="text-[9px] font-mono text-red-400/60">
        Km: {data.mileage?.toLocaleString() || '--'} • Óleo: {data.oilLevel || '--'}
      </div>
      <div className="text-[9px] font-mono text-red-400/40">
        Próxima revisão: {data.nextMaintenance || '--'}
      </div>
      <div className="grid grid-cols-2 gap-1 mt-1">
        {data.tirePressure && Object.entries(data.tirePressure).map(([wheel, psi]: [string, any]) => (
          <div key={wheel} className="bg-red-950/10 border border-red-950/30 rounded-lg px-2 py-1 text-[8px] font-mono">
            <span className="text-red-400/40">{wheel}: </span>
            <span className="text-amber-400">{psi}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function KnowledgePanel({ data }: { data: Record<string, any> }) {
  const results = data.results || []
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/60">
        <BookOpen size={12} />
        <span>BASE DE CONHECIMENTO: {data.totalResults || 0} RESULTADOS</span>
      </div>
      {results.map((r: any, i: number) => (
        <div key={i} className="bg-red-950/20 border border-red-950/40 rounded-xl p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span className={cn(
              'text-[7px] font-mono px-1 py-0.5 rounded uppercase tracking-wider',
              r.type === 'note' ? 'bg-blue-500/20 text-blue-400' :
              r.type === 'code' ? 'bg-green-500/20 text-green-400' :
              r.type === 'pdf' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            )}>{r.type}</span>
            <span className="text-[11px] font-mono text-amber-100 truncate flex-1">{r.title}</span>
          </div>
          <div className="text-[8px] font-mono text-red-400/40 leading-relaxed">{r.snippet}</div>
          <div className="text-[7px] font-mono text-red-900/60 mt-1 truncate">{r.filePath}</div>
        </div>
      ))}
      {data.answer && !results.length && (
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-2 text-[9px] font-mono text-amber-400/60">
          {data.answer}
        </div>
      )}
    </div>
  )
}

function EntertainmentPanel({ data }: { data: Record<string, any> }) {
  const isActive = data.active || data.scenario
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/60">
        <Gamepad2 size={12} />
        <span>NARRATIVA INTERATIVA</span>
      </div>
      {isActive ? (
        <>
          <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-2">
            <div className="text-[8px] font-mono text-red-400/40 uppercase tracking-wider">CENARIO</div>
            <div className="text-[10px] font-mono text-amber-100 mt-0.5">{data.scenario || 'Ativo'}</div>
          </div>
          <div className="bg-red-950/30 border border-amber-500/20 rounded-xl p-2 text-[9px] font-mono text-amber-200/80 leading-relaxed max-h-32 overflow-y-auto">
            {data.narrative || 'Narrativa em andamento... Faca suas escolhas!'}
          </div>
          {data.choices?.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="text-[8px] font-mono text-red-400/40 uppercase">ESCOLHAS</div>
              {data.choices.map((c: string, i: number) => (
                <div key={i} className="bg-red-950/10 border border-red-950/30 rounded-lg px-2 py-1.5 text-[9px] font-mono text-amber-300/70">
                  [{i}] {c}
                </div>
              ))}
            </div>
          )}
          {data.soundtrack && (
            <div className="text-[8px] font-mono text-amber-500/40">{data.soundtrack}</div>
          )}
        </>
      ) : (
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-[9px] font-mono text-amber-400/60 text-center">
          Nenhuma sessao ativa. Peca ao J.A.R.V.I.S. para iniciar uma aventura!
        </div>
      )}
    </div>
  )
}

function DeepWorkPanel({ data }: { data: Record<string, any> }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/60">
        <BrainCircuit size={12} />
        <span>POMODORO ADAPTATIVO</span>
      </div>
      {data.active ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center">
              <div className="text-[8px] font-mono text-red-400/40">FASE</div>
              <div className={cn('text-[10px] font-mono font-bold uppercase mt-1', data.phase === 'focus' ? 'text-green-400' : 'text-amber-400')}>
                {data.phase || '--'}
              </div>
            </div>
            <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-center">
              <div className="text-[8px] font-mono text-red-400/40">PRODUTIVIDADE</div>
              <div className={cn('text-lg font-mono font-bold', (data.productivityRate || 0) < 60 ? 'text-red-500' : 'text-amber-400')}>
                {data.productivityRate || '--'}%
              </div>
            </div>
          </div>
          <div className="text-[9px] font-mono text-red-400/60 text-center">
            Ciclo #{data.cycleCount} • {data.elapsedMinutes}min decorridos
          </div>
          {data.message && (
            <div className={cn('rounded-xl p-2 text-[9px] font-mono', data.suggestedBreak ? 'bg-amber-950/20 border border-amber-500/30 text-amber-400' : 'bg-red-950/20 border border-red-950/40 text-amber-400/60')}>
              {data.message}
            </div>
          )}
        </>
      ) : (
        <div className="bg-red-950/20 border border-red-950/40 rounded-xl p-3 text-[9px] font-mono text-amber-400/60 text-center">
          Pomodoro inativo. Diga "Jarvis, iniciar pomodoro" para comecar.
        </div>
      )}
    </div>
  )
}

function PersonalFinancePanel({ data }: { data: Record<string, any> }) {
  const reached = data.reachedAlerts || []
  const alerts = data.alerts || []
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/60">
        <DollarSign size={12} />
        <span>ALERTAS DE PRECO: {data.activeAlerts || 0}</span>
      </div>
      {reached.length > 0 && (
        <div className="bg-green-950/30 border border-green-500/30 rounded-xl p-2 text-[9px] font-mono text-green-400 animate-pulse">
          OPORTUNIDADE! {reached.map((a: any) => a.productName + ' por R$ ' + a.currentPrice).join(', ')}
        </div>
      )}
      {alerts.slice(0, 4).map((a: any, i: number) => (
        <div key={i} className="bg-red-950/20 border border-red-950/40 rounded-xl p-2 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-amber-100">{a.productName}</div>
            <div className="text-[8px] font-mono text-red-400/40">Alvo: R$ {a.targetPrice}</div>
          </div>
          <div className={cn('text-[10px] font-mono font-bold', a.reached ? 'text-green-400' : 'text-amber-400')}>
            R$ {a.currentPrice}
          </div>
        </div>
      ))}
      {data.overBudget !== undefined && (
        <div className={cn('rounded-xl p-2 text-[9px] font-mono', data.overBudget ? 'bg-red-950/30 border border-red-500/30 text-red-400' : 'bg-green-950/20 border border-green-500/30 text-green-400')}>
          {data.overBudget
            ? 'Conta de luz projetada: R$ ' + data.totalCost + '. Ultrapassa o orcamento em R$ ' + data.projectedOverage + '. Deseja ativar modo economico?'
            : 'Consumo dentro do orcamento mensal de R$ ' + data.budgetLimit + '.'}
        </div>
      )}
    </div>
  )
}

function CRMPanel({ data }: { data: Record<string, any> }) {
  const contacts = data.contacts || []
  const overdue = data.overdueContacts || []
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/60">
        <Users2 size={12} />
        <span>CRM PESSOAL: {contacts.length} CONTATOS</span>
      </div>
      {data.message && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-2 text-[9px] font-mono text-amber-400">
          {data.message}
        </div>
      )}
      {contacts.map((c: any, i: number) => (
        <div key={i} className={cn(
          'rounded-xl p-2 border flex items-center justify-between',
          c.daysSinceContact > 14 ? 'bg-red-950/20 border-red-500/30' : 'bg-red-950/10 border-red-950/40'
        )}>
          <div>
            <div className="text-[11px] font-mono text-amber-100">{c.name}</div>
            <div className="text-[8px] font-mono text-red-400/40">{c.relationship} • {c.daysSinceContact}d sem contato</div>
          </div>
          <div className={cn(
            'text-[8px] font-mono px-1.5 py-0.5 rounded',
            c.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/10 text-amber-400'
          )}>
            {c.priority}
          </div>
        </div>
      ))}
      {data.events && (
        <div className="mt-1">
          <div className="text-[8px] font-mono text-red-400/40 uppercase mb-1">EVENTOS</div>
          {data.events.map((e: any, i: number) => (
            <div key={i} className="bg-red-950/10 border border-red-950/30 rounded-lg px-2 py-1.5 text-[9px] font-mono text-amber-300/70 mb-1">
              {e.person} • {e.daysAway}d • {e.suggestedAction}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function GamerPanel({ data }: { data: Record<string, any> }) {
  const macros = data.macros || []
  const stats = data.stats || []
  const alerts = data.alerts || []
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400/60">
        <Gamepad size={12} />
        <span>MACROS DE VOZ: {data.total || macros.length}</span>
      </div>
      {macros.map((m: any, i: number) => (
        <div key={i} className="bg-red-950/20 border border-red-950/40 rounded-xl p-2 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-amber-100">{m.name}</div>
            <div className="text-[8px] font-mono text-red-400/40">"{m.command}" • {m.game}</div>
          </div>
          <div className="text-[7px] font-mono text-red-400/40">{m.keySequence.join('+')}</div>
        </div>
      ))}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 gap-1 mt-1">
          {stats.map((s: any, i: number) => (
            <div key={i} className="bg-red-950/10 border border-red-950/30 rounded-lg px-2 py-1 text-[8px] font-mono">
              <span className="text-red-400/40">{s.label}: </span>
              <span className="text-amber-400">{s.value}</span>
            </div>
          ))}
        </div>
      )}
      {alerts.map((a: any, i: number) => (
        <div key={i} className={cn(
          'rounded-lg px-2 py-1 text-[8px] font-mono border',
          a.type === 'enemy' ? 'bg-red-950/30 border-red-500/30 text-red-400' :
          a.type === 'ammo' ? 'bg-amber-950/20 border-amber-500/30 text-amber-400' :
          'bg-blue-950/20 border-blue-500/30 text-blue-400'
        )}>
          {a.message}
        </div>
      ))}
    </div>
  )
}
