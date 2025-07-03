import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * @openapi
 * /api/groups/{id}:
 *   delete:
 *     summary: グループ削除
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: グループ削除
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
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

    const group = await prisma.group.findUnique({
      where: { id: id },
    })

    if (!group) {
      return NextResponse.json({ error: 'グループが見つかりません' }, { status: 404 })
    }

    if (group.organizationId !== user.organization.id) {
      return NextResponse.json(
        { error: 'このグループを削除する権限がありません' },
        { status: 403 }
      )
    }

    await prisma.group.delete({
      where: { id: id },
    })

    return NextResponse.json({ message: 'グループを削除しました' })
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'グループの削除に失敗しました' },
      { status: 500 }
    )
  }
} 