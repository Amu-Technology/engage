import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
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

    const leadsStatus = await prisma.leadsStatus.findUnique({
      where: { id: id },
    })

    if (!leadsStatus) {
      return NextResponse.json({ error: 'ステータスが見つかりません' }, { status: 404 })
    }

    if (leadsStatus.organizationId !== user.organization.id) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    await prisma.leadsStatus.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'ステータスを削除しました' })
  } catch (err) {
    console.error('エラー:', err)
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 })
  }
} 