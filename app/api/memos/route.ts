import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * @openapi
 * /api/memos:
 *   get:
 *     summary: メモ一覧取得
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadId:
 *                 type: string
 *     responses:
 *       200:
 *         description: メモ一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Memo'
 */
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json(
        { error: 'リードIDが必要です' },
        { status: 400 }
      )
    }

    const memos = await prisma.memo.findMany({
      where: {
        leadId,
        organizationId: user.organization.id,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    return NextResponse.json(memos)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'メモの取得に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * @openapi
 * /api/memos:
 *   post:
 *     summary: メモ作成
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadId:
 *                 type: string
 *               note:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: メモ作成
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Memo'
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json({ error: '組織が見つかりません' }, { status: 404 })
    }

    const body = await request.json()
    const { leadId, note, type } = body

    if (!leadId || !note) {
      return NextResponse.json(
        { error: '必要な情報が不足しています' },
        { status: 400 }
      )
    }

    const memo = await prisma.memo.create({
      data: {
        leadId,
        organizationId: user.organization.id,
        type: type || 'general',
        note,
        timestamp: new Date(),
      },
    })

    return NextResponse.json(memo)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'メモの保存に失敗しました' },
      { status: 500 }
    )
  }
} 