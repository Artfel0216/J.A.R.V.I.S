import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const reminders = await prisma.reminder.findMany({
      where: { userId, completed: false },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ reminders })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })

    const { label, context, location, triggerAt } = await req.json()

    const reminder = await prisma.reminder.create({
      data: {
        userId,
        label,
        context,
        location,
        triggerAt: triggerAt ? new Date(triggerAt) : null,
      },
    })

    return NextResponse.json({ reminder }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
