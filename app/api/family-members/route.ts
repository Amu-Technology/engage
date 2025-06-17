import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 特定リードの家族一覧を取得
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

// 新しい家族メンバーを追加
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