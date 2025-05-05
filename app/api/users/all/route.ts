import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      include: {
        stores: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error('ユーザー一覧の取得に失敗しました:', error)
    return NextResponse.json(
      { error: 'ユーザー一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
} 