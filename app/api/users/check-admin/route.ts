import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'メールアドレスが必要です' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    return NextResponse.json({ isAdmin: user?.role === 'admin' })
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 })
  }
} 