import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// PUT: アクティビティタイプの更新
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { error: "組織が見つかりません" },
        { status: 404 }
      );
    }

    const { name, color, point } = await request.json();

    const activityType = await prisma.activityType.update({
      where: {
        id,
        organizationId: user.organization.id,
      },
      data: {
        name,
        color,
        point,
      },
    });

    return NextResponse.json(activityType);
  } catch (error) {
    console.error("エラー:", error);
    return NextResponse.json(
      { error: "アクティビティタイプの更新に失敗しました" },
      { status: 500 }
    );
  }
}

// DELETE: アクティビティタイプの削除
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { organization: true },
    });

    if (!user?.organization) {
      return NextResponse.json(
        { error: "組織が見つかりません" },
        { status: 404 }
      );
    }

    const activityType = await prisma.activityType.findUnique({
      where: { id },
    });

    if (!activityType) {
      return NextResponse.json(
        { error: "アクティビティタイプが見つかりません" },
        { status: 404 }
      );
    }

    if (activityType.organizationId !== user.organization.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    await prisma.activityType.delete({
      where: { id },
    });

    return NextResponse.json({ message: "アクティビティタイプを削除しました" });
  } catch (err) {
    console.error("エラー:", err);
    return NextResponse.json(
      { error: "アクティビティタイプの削除に失敗しました" },
      { status: 500 }
    );
  }
}
