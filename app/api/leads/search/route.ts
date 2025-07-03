import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

/**
 * @openapi
 * /api/leads/search:
 *   get:
 *     summary: リード検索
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               q:
 *                 type: string
 *     responses:
 *       200:
 *         description: リード検索
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lead'
 */
export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: '検索クエリが必要です' }, { status: 400 })
    }

    const leads = await prisma.lead.findMany({
      where: {
        organizationId: user.organization.id,
        OR: [
          { name: { contains: query } },
          { nameReading: { contains: query } },
          { nickname: { contains: query } },
          { company: { contains: query } },
          { email: { contains: query } },
          { mobilePhone: { contains: query } },
          { homePhone: { contains: query } },
        ],
      },
      take: 10,
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: 'リードの検索に失敗しました' },
      { status: 500 }
    )
  }
} 