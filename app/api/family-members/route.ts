import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * @openapi
 * /api/family-members:
 *   get:
 *     summary: 特定リードの家族一覧を取得
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
 *         description: 特定リードの家族一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FamilyMember'
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user?.org_id) {
      return NextResponse.json({ error: '組織情報がありません' }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'leadIdは必須です' }, { status: 400 });
    }

    const familyMembers = await prisma.familyMember.findMany({
      where: {
        leadId: leadId,
        organizationId: user.org_id,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(familyMembers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

/**
 * @openapi
 * /api/family-members:
 *   post:
 *     summary: 新しい家族メンバーを追加
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               leadId:
 *                 type: string
 *               name:
 *                 type: string
 *               nameReading:
 *                 type: string
 *               relationship:
 *                 type: string
 *     responses:
 *       201:
 *         description: 新しい家族メンバー
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FamilyMember'
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user?.org_id) {
      return NextResponse.json({ error: '組織情報がありません' }, { status: 403 });
    }
    
    const body = await request.json();
    const { leadId, name, nameReading, relationship } = body;

    if (!leadId || !name) {
        return NextResponse.json({ error: 'leadIdと名前は必須です' }, { status: 400 });
    }

    const newFamilyMember = await prisma.familyMember.create({
      data: {
        leadId,
        name,
        nameReading,
        relationship,
        organizationId: user.org_id,
      },
    });

    return NextResponse.json(newFamilyMember, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}