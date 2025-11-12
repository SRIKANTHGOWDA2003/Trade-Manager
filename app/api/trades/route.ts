import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const trades = await prisma.trade.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        entryDate: 'desc'
      }
    })

    return NextResponse.json(trades)
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { symbol, type, entryPrice, quantity, entryDate, notes, strategy, tags } = await req.json()

    if (!symbol || !type || !entryPrice || !quantity || !entryDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const trade = await prisma.trade.create({
      data: {
        userId: session.user.id,
        symbol: symbol.toUpperCase(),
        type,
        entryPrice: parseFloat(entryPrice),
        quantity: parseFloat(quantity),
        entryDate: new Date(entryDate),
        notes,
        strategy,
        tags,
      }
    })

    return NextResponse.json(trade)
  } catch (error) {
    console.error('Error creating trade:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}