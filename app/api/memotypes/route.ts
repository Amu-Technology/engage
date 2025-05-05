import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  try {
    console.log('メモタイプ取得開始')
    const session = await auth()
    console.log('セッション:', session)
    
    if (!session?.user?.email) {
      console.log('認証エラー: セッションまたはメールアドレスが存在しません')
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    })
    console.log('ユーザー情報:', user)

    if (!user?.organization) {
      console.log('組織エラー: ユーザーに組織が紐づいていません')
      return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
    }

    const memoTypes = await prisma.memoType.findMany({
      where: { organizationId: user.organization.id },
    })
    console.log('取得したメモタイプ:', memoTypes)

    return NextResponse.json(memoTypes)
  } catch (error) {
    console.error('メモタイプ取得エラー:', error)
    return NextResponse.json(
      { error: 'メモタイプの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    })

    if (!user?.organization) {
      return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
    }

    const { name, color } = await request.json()

    const memoType = await prisma.memoType.create({
      data: {
        name,
        color,
        organizationId: user.organization.id,
      },
    })

    return NextResponse.json(memoType)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'メモタイプの作成に失敗しました' },
      { status: 500 }
    )
  }
} 