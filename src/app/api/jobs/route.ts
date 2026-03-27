export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const jobSchema = z.object({
  dispatchCompanyId: z.string().min(1),
  jobCategoryId: z.string().min(1),
  title: z.string().min(1, "タイトルを入力してください"),
  description: z.string().optional().default(""),
  facilityName: z.string().optional().default(""),
  address: z.string().optional().default(""),
  date: z.string().min(1, "日付を入力してください"),
  startTime: z.string().optional().default(""),
  endTime: z.string().optional().default(""),
  hourlyRate: z.number().optional().default(0),
  transportationFee: z.number().optional().default(0),
  otherAllowances: z.number().optional().default(0),
  status: z.string().optional().default("offered"),
  priority: z.string().optional().default("medium"),
  notes: z.string().optional().default(""),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const companyId = searchParams.get("companyId");

  const where: any = { userId: session.user.id };

  if (status) where.status = status;
  if (companyId) where.dispatchCompanyId = companyId;

  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
    where.date = { gte: startDate, lte: endDate };
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      dispatchCompany: true,
      jobCategory: true,
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = jobSchema.parse(body);

    const job = await prisma.job.create({
      data: {
        ...data,
        date: new Date(data.date),
        userId: session.user.id,
      },
      include: {
        dispatchCompany: true,
        jobCategory: true,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "作成に失敗しました" }, { status: 500 });
  }
}
