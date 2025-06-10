import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

// 入金履歴を取得 (クエリパラメータで条件分岐)
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get('leadId');
    const leadIds = searchParams.getAll('leadIds'); // 複数IDに対応
    const recordedById = searchParams.get('recordedById');

    const where: Prisma.PaymentWhereInput = {
      organizationId: user.org_id,
    };

    if (leadId) {
      where.leadId = leadId;
    } else if (leadIds.length > 0) {
      where.leadId = { in: leadIds };
    }

    if (recordedById) {
      where.recordedById = recordedById;
    }
    
    const payments = await prisma.payment.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true } },
        recordedBy: { select: { id: true, name: true } },
        paymentType: true,
      },
      orderBy: {
        paymentDate: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Payment取得エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// 新しい入金記録を作成
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.org_id) {
      return NextResponse.json({ error: '組織に所属していません' }, { status: 404 });
    }

    const body = await request.json();
    const { leadId, amount, paymentDate, description, paymentTypeId } = body;

    if (!leadId || !amount || !paymentDate) {
      return NextResponse.json({ error: 'リードID, 金額, 入金日は必須です' }, { status: 400 });
    }
    
    // トランザクションでPaymentとLeadActivityを同時に作成
    const newPayment = await prisma.$transaction(async (tx) => {
      // 1. Paymentレコードを作成
      const payment = await tx.payment.create({
        data: {
          amount: parseInt(amount),
          paymentDate: new Date(paymentDate),
          description,
          leadId,
          paymentTypeId,
          organizationId: user.org_id!,
          recordedById: user.id,
        },
      });

      // 2. 対応するActivityType（"入金"など）を取得または作成
      // ここでは "入金" という名前のActivityTypeを前提とします。
      // seedデータで事前に作成しておくのが望ましいです。
      const paymentActivityType = await tx.activityType.findFirst({
        where: { name: '入金', organizationId: user.org_id! },
      });
      if (!paymentActivityType) {
        throw new Error('「入金」という名前のActivityTypeが見つかりません。');
      }

      // 3. LeadActivityレコードを作成し、Paymentと紐付ける
      await tx.leadActivity.create({
        data: {
          leadId,
          organizationId: user.org_id!,
          type: paymentActivityType.name,
          typeId: paymentActivityType.id,
          description: `${description || ''} - ${amount.toLocaleString()}円の入金`,
          paymentId: payment.id, // 作成したPaymentのIDを紐付け
        },
      });

      return payment;
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error('Payment作成エラー:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}