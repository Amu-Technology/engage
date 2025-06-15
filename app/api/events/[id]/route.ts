import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// イベントを更新
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    // POSTと同様のロジックで実装
    // ここでは省略しますが、イベントと関連するLeadActivityを更新または再作成する処理が必要です。
    // 注意: グループが変更された場合、古い活動を削除し、新しいグループのリードに活動を再作成する複雑なロジックになります。
    // まずはイベント自体の情報（タイトル、日時など）の更新から実装するのが良いでしょう。
    try {
        const { id } = params;
        const body = await request.json();
        // ...更新処理...
        const updatedEvent = await prisma.event.update({
            where: { id },
            data: {
                title: body.title,
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
                location: body.location,
                description: body.description,
            }
        });
        return NextResponse.json(updatedEvent);
    } catch (error) {
        console.error('イベント更新エラー:', error);
        return NextResponse.json({ error: "イベントの更新に失敗しました" }, { status: 500 });
    }
}

// イベントを削除
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user?.org_id) {
      return NextResponse.json({ error: '組織に所属していません' }, { status: 404 });
    }
    
    const { id } = params;

    await prisma.$transaction(async (tx) => {
        // 1. イベントに関連する活動履歴を削除
        await tx.leadActivity.deleteMany({
            where: { eventId: id }
        });
        // 2. イベント本体を削除
        await tx.event.delete({
            where: { id: id, organizationId: user.org_id! }
        });
    });

    return NextResponse.json({ message: 'イベントを削除しました' }, { status: 200 });
  } catch (error) {
    console.error('イベント削除エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}