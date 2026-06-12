import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'

const execAsync = promisify(exec)

interface SystemStatus {
  platform: string
  hostname: string
  uptime: string
  cpu: {
    model: string
    cores: number
    usage: number
    temperature?: string
  }
  memory: {
    total: string
    used: string
    free: string
    percentUsed: number
  }
  disk?: {
    total: string
    used: string
    free: string
    percentUsed: number
  }
  loadAverage: number[]
}

function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

function getCpuUsage(): number {
  const cpus = os.cpus()
  let totalIdle = 0
  let totalTick = 0
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += (cpu.times as any)[type]
    }
    totalIdle += cpu.times.idle
  }
  const idle = totalIdle / cpus.length
  const tick = totalTick / cpus.length
  return Math.round((1 - idle / tick) * 100)
}

async function getTemperature(): Promise<string | undefined> {
  if (process.platform === 'win32') {
    try {
      const { stdout } = await execAsync(
        'wmic /namespace:\\\\root\\wmi PATH MSAcpi_ThermalZoneTemperature get CurrentTemperature 2>nul'
      )
      const match = stdout.match(/(\d+)/)
      if (match) {
        const kelvin = parseInt(match[1])
        const celsius = (kelvin / 10) - 273.15
        return `${Math.round(celsius)}°C`
      }
    } catch {}
  }
  if (process.platform === 'linux') {
    try {
      const { stdout } = await execAsync('cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null')
      const temp = parseInt(stdout.trim()) / 1000
      if (!isNaN(temp)) return `${Math.round(temp)}°C`
    } catch {}
  }
  if (process.platform === 'darwin') {
    try {
      const { stdout } = await execAsync("pmset -g therm | grep -o 'CPU.*' | awk '{print $2}'")
      if (stdout.trim()) return `${stdout.trim()}°C`
    } catch {}
  }
  return undefined
}

async function getDiskInfo(): Promise<SystemStatus['disk'] | undefined> {
  if (process.platform === 'win32') {
    try {
      const { stdout } = await execAsync(
        'wmic logicaldisk where "drivetype=3" get size,freespace,caption /format:csv 2>nul'
      )
      const lines = stdout.trim().split('\n').slice(1).filter(l => l.trim())
      if (lines.length > 0) {
        const parts = lines[0].split(',')
        const free = parseInt(parts[1])
        const total = parseInt(parts[2])
        if (!isNaN(total) && total > 0) {
          return {
            total: formatBytes(total),
            used: formatBytes(total - free),
            free: formatBytes(free),
            percentUsed: Math.round(((total - free) / total) * 100),
          }
        }
      }
    } catch {}
  }
  if (process.platform === 'linux' || process.platform === 'darwin') {
    try {
      const { stdout } = await execAsync('df -k / | tail -1')
      const parts = stdout.trim().split(/\s+/)
      if (parts.length >= 4) {
        const total = parseInt(parts[1]) * 1024
        const used = parseInt(parts[2]) * 1024
        if (!isNaN(total) && total > 0) {
          return {
            total: formatBytes(total),
            used: formatBytes(used),
            free: formatBytes(total - used),
            percentUsed: Math.round((used / total) * 100),
          }
        }
      }
    } catch {}
  }
  return undefined
}

export async function getSystemStatus(): Promise<SystemStatus> {
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem
  const uptimeSeconds = os.uptime()
  const days = Math.floor(uptimeSeconds / 86400)
  const hours = Math.floor((uptimeSeconds % 86400) / 3600)
  const minutes = Math.floor((uptimeSeconds % 3600) / 60)

  const cpuUsage = getCpuUsage()
  const temperature = await getTemperature()
  const disk = await getDiskInfo()

  return {
    platform: `${os.type()} ${os.release()}`,
    hostname: os.hostname(),
    uptime: `${days}d ${hours}h ${minutes}m`,
    cpu: {
      model: os.cpus()[0]?.model || 'Desconhecido',
      cores: os.cpus().length,
      usage: cpuUsage,
      temperature,
    },
    memory: {
      total: formatBytes(totalMem),
      used: formatBytes(usedMem),
      free: formatBytes(freeMem),
      percentUsed: Math.round((usedMem / totalMem) * 100),
    },
    disk,
    loadAverage: os.loadavg(),
  }
}

const ALLOWED_COMMANDS = ['npm', 'node', 'git', 'ls', 'dir', 'cat', 'echo', 'pwd', 'whoami', 'date', 'uptime', 'uname']
const BLOCKED_PATTERNS = [/rm\s+-rf/i, /sudo/i, />.*\/dev/i, /:\(\)/, /del\s+\/f/i, /format/i, /shutdown/i, /reboot/i, /init/i]

export async function executeCliCommand(command: string): Promise<Record<string, any>> {
  const trimmed = command.trim()
  if (!trimmed) return { error: 'Comando vazio.' }

  const isAllowed = ALLOWED_COMMANDS.some(cmd =>
    trimmed.toLowerCase().startsWith(cmd.toLowerCase())
  )

  if (!isAllowed) {
    return {
      error: `Comando "${trimmed.split(' ')[0]}" não está na lista de comandos permitidos.`,
      allowedCommands: ALLOWED_COMMANDS,
    }
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { error: 'Comando bloqueado por questões de segurança.' }
    }
  }

  try {
    const { stdout, stderr } = await execAsync(trimmed, { timeout: 10000 })
    return {
      success: true,
      command: trimmed,
      stdout: stdout.trim(),
      stderr: stderr.trim() || undefined,
    }
  } catch (err: any) {
    return {
      success: false,
      command: trimmed,
      error: err.stderr?.trim() || err.message,
    }
  }
}
