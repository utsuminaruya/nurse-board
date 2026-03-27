import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const company = await prisma.dispatchCompany.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      jobs: {
        include: { jobCategory: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!company) {
    return NextResponse.json({ error: "見つかりません" }, { status: 404 });
  }

  return NextResponse.json(company);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const company = await prisma.dispatchCompany.updateMany({
      where: { id: params.id, userId: session.user.id },
      data: body,
    });

    if (company.count === 0) {
      return NextResponse.json({ error: "見つかりません" }, { status: 404 });
    }

    const updated = await prisma.dispatchCompany.findUnique({ where: { id: params.id } });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    await prisma.dispatchCompany.deleteMany({
      where: { id: params.id, userId: session.user.id },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
