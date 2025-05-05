import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 組織一覧の取得
export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        users: true,
      },
    });
    return NextResponse.json(organizations);
  } catch (error) {
    console.error('組織一覧の取得に失敗しました:', error);
    return NextResponse.json(
      { error: '組織一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 組織の作成
export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: '組織名は必須です' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name,
      },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('組織の作成に失敗しました:', error);
    return NextResponse.json(
      { error: '組織の作成に失敗しました' },
      { status: 500 }
    );
  }
}

// 組織の更新
export async function PUT(request: Request) {
  try {
    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { error: 'IDと組織名は必須です' },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('組織の更新に失敗しました:', error);
    return NextResponse.json(
      { error: '組織の更新に失敗しました' },
      { status: 500 }
    );
  }
}

// 組織の削除
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'IDは必須です' },
        { status: 400 }
      );
    }

    await prisma.organization.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: '組織を削除しました' });
  } catch (error) {
    console.error('組織の削除に失敗しました:', error);
    return NextResponse.json(
      { error: '組織の削除に失敗しました' },
      { status: 500 }
    );
  }
} 