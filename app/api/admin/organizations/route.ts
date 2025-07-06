import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

// 組織一覧の取得
/**
 * @openapi
 * /api/admin/organizations:
 *   get:
 *     summary: 組織一覧取得
 *     responses:
 *       200:
 *         description: 組織一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Organization'
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const organizations = await prisma.organization.findMany({
      include: {
        users: true
      }
    })

    return NextResponse.json(organizations)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: '組織一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// 組織の作成
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { name } = await request.json()

    const organization = await prisma.organization.create({
      data: {
        name
      },
      include: {
        users: true
      }
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: '組織の作成に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * @openapi
 * /api/admin/organizations:
 *   put:
 *     summary: 組織更新
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新された組織
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 */
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { id, name } = await request.json()

    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        name
      },
      include: {
        users: true
      }
    })

    return NextResponse.json(updatedOrganization)
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: '組織の更新に失敗しました' },
      { status: 500 }
    )
  }
}

/**
 * @openapi
 * /api/admin/organizations:
 *   delete:
 *     summary: 組織削除
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
 *         description: 削除された組織
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 */
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const admin = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 })
    }

    const { id } = await request.json()

    await prisma.organization.delete({
      where: { id }
    })

    return NextResponse.json({ message: '組織を削除しました' })
  } catch (error) {
    console.error('エラー:', error)
    return NextResponse.json(
      { error: '組織の削除に失敗しました' },
      { status: 500 }
    )
  }
} 