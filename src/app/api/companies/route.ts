export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const companySchema = z.object({
  companyName: z.string().min(1, "会社名を入力してください"),
  contactPerson: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  email: z.string().optional().default(""),
  lineId: z.string().optional().default(""),
  communicationChannel: z.string().optional().default("email"),
  notes: z.string().optional().default(""),
  color: z.string().optional().default("#3B82F6"),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const companies = await prisma.dispatchCompany.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { jobs: true } },
    },
    orderBy: { companyName: "asc" },
  });

  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = companySchema.parse(body);

    const company = await prisma.dispatchCompany.create({
      data: { ...data, userId: session.user.id },
    });

    return NextResponse.json(company);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "作成に失敗しました" }, { status: 500 });
  }
}
