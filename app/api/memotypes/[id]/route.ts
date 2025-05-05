import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    await prisma.memoType.delete({
      where: {
        id: params.id,
        organizationId: user.organization.id,
      },
    })

    return NextResponse.json({ message: 'メモタイプを削除しました' })
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'メモタイプの削除に失敗しました' },
      { status: 500 }
    )
  }
} 