import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { leadId, type, content } = body

    const activity = await prisma.leadActivity.create({
      data: {
        leadId,
        type,
        description: content
      },
    })

    return NextResponse.json(activity)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'アクションの作成に失敗しました' },
      { status: 500 }
    )
  }
} 