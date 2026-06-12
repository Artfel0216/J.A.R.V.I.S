import { prisma } from '@/lib/prisma'

export async function saveMemory(
  userId: string,
  key: string,
  value: string,
  category: string = 'general'
): Promise<Record<string, any>> {
  try {
    const memory = await prisma.userMemory.upsert({
      where: { userId_key: { userId, key } },
      update: { value, category },
      create: { userId, key, value, category },
    })
    return { success: true, memory: { key: memory.key, value: memory.value, category: memory.category } }
  } catch (err: any) {
    return { error: `Falha ao salvar memória: ${err.message}` }
  }
}

export async function getMemory(
  userId: string,
  key: string
): Promise<Record<string, any>> {
  try {
    const memory = await prisma.userMemory.findUnique({
      where: { userId_key: { userId, key } },
    })
    if (!memory) return { found: false, key }
    return { found: true, memory: { key: memory.key, value: memory.value, category: memory.category } }
  } catch (err: any) {
    return { error: `Falha ao buscar memória: ${err.message}` }
  }
}

export async function searchMemories(
  userId: string,
  query: string
): Promise<Record<string, any>> {
  try {
    const memories = await prisma.userMemory.findMany({
      where: {
        userId,
        OR: [
          { key: { contains: query } },
          { value: { contains: query } },
          { category: { contains: query } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    })
    return {
      found: memories.length > 0,
      count: memories.length,
      memories: memories.map(m => ({
        key: m.key,
        value: m.value,
        category: m.category,
      })),
    }
  } catch (err: any) {
    return { error: `Falha ao buscar memórias: ${err.message}` }
  }
}

export async function getAllMemories(userId: string): Promise<Record<string, any>> {
  try {
    const memories = await prisma.userMemory.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })
    return {
      count: memories.length,
      memories: memories.map(m => ({
        key: m.key,
        value: m.value,
        category: m.category,
      })),
    }
  } catch (err: any) {
    return { error: `Falha ao listar memórias: ${err.message}` }
  }
}

export async function deleteMemory(userId: string, key: string): Promise<Record<string, any>> {
  try {
    await prisma.userMemory.delete({
      where: { userId_key: { userId, key } },
    })
    return { success: true, message: `Memória "${key}" removida.` }
  } catch (err: any) {
    return { error: `Falha ao remover memória: ${err.message}` }
  }
}
