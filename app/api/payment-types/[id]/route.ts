import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * @openapi
 * /api/payment-types/{id}:
 *   put:
 *     summary: PaymentTypeを更新
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: PaymentTypeを更新
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentType'
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user?.org_id) {
      return NextResponse.json({ error: '組織に所属していません' }, { status: 404 });
    }

    const { id } = await params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: '名前は必須です' }, { status: 400 });
    }
    
    // 更新対象が自分の組織のものであることを確認
    const existingType = await prisma.paymentType.findFirst({
        where: { id, organizationId: user.org_id }
    });
    if (!existingType) {
        return NextResponse.json({ error: '更新対象が見つからないか、権限がありません' }, { status: 404 });
    }

    const updatedPaymentType = await prisma.paymentType.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedPaymentType);
  } catch (error) {
    console.error('PaymentType更新エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

/**
 * @openapi
 * /api/payment-types/{id}:
 *   delete:
 *     summary: PaymentTypeを削除
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
 *         description: PaymentTypeを削除
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user?.org_id) {
      return NextResponse.json({ error: '組織に所属していません' }, { status: 404 });
    }

    const { id } = await params;
    
    const existingType = await prisma.paymentType.findFirst({
        where: { id, organizationId: user.org_id }
    });
    if (!existingType) {
        return NextResponse.json({ error: '削除対象が見つからないか、権限がありません' }, { status: 404 });
    }

    await prisma.paymentType.delete({
      where: { id },
    });

    return NextResponse.json({ message: '入金タイプを削除しました' }, { status: 200 });
  } catch (error) {
    console.error('PaymentType削除エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}