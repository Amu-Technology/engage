import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 組織内の全PaymentTypeを取得
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.org_id) {
      return NextResponse.json({ error: '組織に所属していません' }, { status: 404 });
    }

    const paymentTypes = await prisma.paymentType.findMany({
      where: {
        organizationId: user.org_id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(paymentTypes);
  } catch (error) {
    console.error('PaymentType取得エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// 新しいPaymentTypeを作成
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.org_id) {
      return NextResponse.json({ error: '組織に所属していません' }, { status: 404 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: '名前は必須です' }, { status: 400 });
    }

    const newPaymentType = await prisma.paymentType.create({
      data: {
        name,
        organizationId: user.org_id,
      },
    });

    return NextResponse.json(newPaymentType, { status: 201 });
  } catch (error) {
    console.error('PaymentType作成エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}