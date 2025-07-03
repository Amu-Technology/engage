import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * @openapi
 * /api/memotypes:
 *   get:
 *     summary: メモタイプ一覧取得
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organizationId:
 *                 type: string
 */
export async function GET() {
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

    const memoTypes = await prisma.memoType.findMany({
      where: { organizationId: user.organization.id },
    })

    return NextResponse.json(memoTypes)
  } catch (error) {
    console.error('メモタイプ取得エラー:', error)
    return NextResponse.json(
      { error: 'メモタイプの取得に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * @openapi
 * /api/memotypes:
 *   post:
 *     summary: メモタイプ作成
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:  
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: メモタイプ作成
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemoType'
 */
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