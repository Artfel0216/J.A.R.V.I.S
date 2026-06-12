import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const { id } = await params
    const { completed } = await req.json()

    const reminder = await prisma.reminder.findFirst({
      where: { id, userId },
    })
    if (!reminder) return NextResponse.json({ error: 'Lembrete não encontrado.' }, { status: 404 })

    const updated = await prisma.reminder.update({
      where: { id },
      data: { completed, dismissedAt: completed ? new Date() : null },
    })

    return NextResponse.json({ reminder: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const { id } = await params

    const reminder = await prisma.reminder.findFirst({
      where: { id, userId },
    })
    if (!reminder) return NextResponse.json({ error: 'Lembrete não encontrado.' }, { status: 404 })

    await prisma.reminder.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
