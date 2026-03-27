import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create job categories
  const categories = [
    { name: "訪問入浴", defaultHourlyRate: 1800, icon: "bath" },
    { name: "介護施設", defaultHourlyRate: 1700, icon: "building" },
    { name: "ツアーナース", defaultHourlyRate: 2200, icon: "plane" },
    { name: "イベントナース", defaultHourlyRate: 2000, icon: "calendar" },
    { name: "学校保健室", defaultHourlyRate: 1600, icon: "school" },
    { name: "病院", defaultHourlyRate: 1900, icon: "hospital" },
    { name: "クリニック", defaultHourlyRate: 1800, icon: "stethoscope" },
    { name: "検診", defaultHourlyRate: 2100, icon: "clipboard" },
    { name: "デイサービス", defaultHourlyRate: 1600, icon: "sun" },
    { name: "有料老人ホーム", defaultHourlyRate: 1700, icon: "home" },
    { name: "その他", defaultHourlyRate: 1500, icon: "briefcase" },
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const c = await prisma.jobCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    createdCategories.push(c);
  }

  // Create demo user
  const hashedPassword = await bcryptjs.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@nurseboard.jp" },
    update: {},
    create: {
      name: "田中 花子",
      email: "demo@nurseboard.jp",
      password: hashedPassword,
      nurseQualifications: "正看護師",
      preferredAreas: "東京都23区, 横浜市",
    },
  });

  // Create dispatch companies
  const companies = [
    {
      companyName: "メディカルスタッフ株式会社",
      contactPerson: "佐藤 太郎",
      phone: "03-1234-5678",
      email: "sato@medstaff.co.jp",
      communicationChannel: "email",
      color: "#3B82F6",
      notes: "対応が丁寧。案件数は多い。",
    },
    {
      companyName: "ナースパートナーズ",
      contactPerson: "鈴木 美咲",
      phone: "03-2345-6789",
      email: "suzuki@nursepartners.jp",
      lineId: "nurse_partners",
      communicationChannel: "line",
      color: "#10B981",
      notes: "LINE連絡が中心。レスが早い。",
    },
    {
      companyName: "ヘルスケアワークス",
      contactPerson: "山田 健一",
      phone: "045-345-6789",
      email: "yamada@hcworks.jp",
      communicationChannel: "phone",
      color: "#F59E0B",
      notes: "電話連絡が基本。横浜エリアに強い。",
    },
    {
      companyName: "ケアスタッフジャパン",
      contactPerson: "高橋 あゆみ",
      phone: "03-4567-8901",
      email: "takahashi@carestaff.jp",
      communicationChannel: "app",
      color: "#8B5CF6",
      notes: "自社アプリで案件管理。介護系が多い。",
    },
    {
      companyName: "メディカルリンク",
      contactPerson: "伊藤 裕子",
      phone: "03-5678-9012",
      email: "ito@medicallink.jp",
      communicationChannel: "email",
      color: "#EF4444",
      notes: "病院・クリニック案件が中心。",
    },
  ];

  const createdCompanies = [];
  for (const company of companies) {
    const c = await prisma.dispatchCompany.create({
      data: { ...company, userId: user.id },
    });
    createdCompanies.push(c);
  }

  // Create sample jobs
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const sampleJobs = [
    // This month - confirmed jobs
    {
      dispatchCompanyId: createdCompanies[0].id,
      jobCategoryId: createdCategories[0].id, // 訪問入浴
      title: "訪問入浴 - 世田谷エリア",
      facilityName: "世田谷訪問入浴センター",
      address: "東京都世田谷区三軒茶屋1-2-3",
      date: new Date(year, month, 5),
      startTime: "09:00",
      endTime: "17:00",
      hourlyRate: 1800,
      transportationFee: 1000,
      status: "confirmed",
      priority: "high",
    },
    {
      dispatchCompanyId: createdCompanies[1].id,
      jobCategoryId: createdCategories[5].id, // 病院
      title: "病棟勤務 - 品川総合病院",
      facilityName: "品川総合病院",
      address: "東京都品川区東品川2-5-8",
      date: new Date(year, month, 8),
      startTime: "08:30",
      endTime: "17:30",
      hourlyRate: 2000,
      transportationFee: 800,
      status: "confirmed",
      priority: "medium",
    },
    {
      dispatchCompanyId: createdCompanies[2].id,
      jobCategoryId: createdCategories[1].id, // 介護施設
      title: "介護施設ナース - 横浜",
      facilityName: "サンライズケアホーム横浜",
      address: "神奈川県横浜市中区本町3-4-5",
      date: new Date(year, month, 10),
      startTime: "09:00",
      endTime: "18:00",
      hourlyRate: 1700,
      transportationFee: 1200,
      status: "confirmed",
      priority: "medium",
    },
    {
      dispatchCompanyId: createdCompanies[0].id,
      jobCategoryId: createdCategories[7].id, // 検診
      title: "企業健康診断 - 丸の内",
      facilityName: "丸の内ビジネスタワー",
      address: "東京都千代田区丸の内1-8-1",
      date: new Date(year, month, 12),
      startTime: "08:00",
      endTime: "16:00",
      hourlyRate: 2100,
      transportationFee: 500,
      status: "confirmed",
      priority: "high",
    },
    {
      dispatchCompanyId: createdCompanies[3].id,
      jobCategoryId: createdCategories[8].id, // デイサービス
      title: "デイサービス看護師",
      facilityName: "はなまるデイサービス",
      address: "東京都杉並区高円寺南2-3-4",
      date: new Date(year, month, 15),
      startTime: "09:00",
      endTime: "17:00",
      hourlyRate: 1600,
      transportationFee: 600,
      status: "confirmed",
      priority: "low",
    },
    // Offered jobs (pending response)
    {
      dispatchCompanyId: createdCompanies[4].id,
      jobCategoryId: createdCategories[6].id, // クリニック
      title: "皮膚科クリニック 午前パート",
      facilityName: "渋谷スキンクリニック",
      address: "東京都渋谷区神宮前5-1-2",
      date: new Date(year, month, 18),
      startTime: "09:00",
      endTime: "13:00",
      hourlyRate: 1900,
      transportationFee: 500,
      status: "offered",
      priority: "high",
    },
    {
      dispatchCompanyId: createdCompanies[1].id,
      jobCategoryId: createdCategories[3].id, // イベントナース
      title: "スポーツイベント救護",
      facilityName: "国立競技場",
      address: "東京都新宿区霞ヶ丘町10-1",
      date: new Date(year, month, 20),
      startTime: "07:00",
      endTime: "19:00",
      hourlyRate: 2500,
      transportationFee: 800,
      status: "offered",
      priority: "high",
    },
    {
      dispatchCompanyId: createdCompanies[2].id,
      jobCategoryId: createdCategories[9].id, // 有料老人ホーム
      title: "有料老人ホーム夜勤",
      facilityName: "グランドライフ横浜",
      address: "神奈川県横浜市港北区新横浜2-1-1",
      date: new Date(year, month, 22),
      startTime: "17:00",
      endTime: "09:00",
      hourlyRate: 2200,
      transportationFee: 1000,
      status: "offered",
      priority: "medium",
    },
    // Applied jobs
    {
      dispatchCompanyId: createdCompanies[0].id,
      jobCategoryId: createdCategories[0].id, // 訪問入浴
      title: "訪問入浴 - 目黒エリア",
      facilityName: "目黒訪問入浴サービス",
      address: "東京都目黒区中目黒1-5-6",
      date: new Date(year, month, 19),
      startTime: "09:00",
      endTime: "17:00",
      hourlyRate: 1800,
      transportationFee: 800,
      status: "applied",
      priority: "medium",
    },
    {
      dispatchCompanyId: createdCompanies[4].id,
      jobCategoryId: createdCategories[5].id, // 病院
      title: "外来看護師 - 午後勤務",
      facilityName: "目黒メディカルセンター",
      address: "東京都目黒区下目黒3-7-8",
      date: new Date(year, month, 25),
      startTime: "13:00",
      endTime: "21:00",
      hourlyRate: 1900,
      transportationFee: 700,
      status: "applied",
      priority: "medium",
    },
    // Completed jobs
    {
      dispatchCompanyId: createdCompanies[0].id,
      jobCategoryId: createdCategories[7].id, // 検診
      title: "企業健康診断 - 新宿",
      facilityName: "新宿NSビル",
      address: "東京都新宿区西新宿2-4-1",
      date: new Date(year, month, 2),
      startTime: "08:00",
      endTime: "16:00",
      hourlyRate: 2100,
      transportationFee: 500,
      status: "completed",
      priority: "medium",
    },
    {
      dispatchCompanyId: createdCompanies[1].id,
      jobCategoryId: createdCategories[1].id, // 介護施設
      title: "介護施設日勤",
      facilityName: "ケアビレッジ練馬",
      address: "東京都練馬区豊玉北5-2-3",
      date: new Date(year, month, 3),
      startTime: "09:00",
      endTime: "17:00",
      hourlyRate: 1700,
      transportationFee: 600,
      status: "completed",
      priority: "low",
    },
    // Last month jobs
    {
      dispatchCompanyId: createdCompanies[2].id,
      jobCategoryId: createdCategories[4].id, // 学校保健室
      title: "学校保健室 - 中学校",
      facilityName: "横浜市立港南中学校",
      address: "神奈川県横浜市港南区港南4-1-1",
      date: new Date(year, month - 1, 15),
      startTime: "08:30",
      endTime: "16:30",
      hourlyRate: 1600,
      transportationFee: 1000,
      status: "completed",
      priority: "medium",
    },
    {
      dispatchCompanyId: createdCompanies[3].id,
      jobCategoryId: createdCategories[2].id, // ツアーナース
      title: "修学旅行ツアーナース",
      facilityName: "東京都立第三高校",
      address: "京都市東山区",
      date: new Date(year, month - 1, 20),
      startTime: "07:00",
      endTime: "21:00",
      hourlyRate: 2500,
      transportationFee: 0,
      otherAllowances: 5000,
      status: "completed",
      priority: "high",
    },
    // Next month - offered
    {
      dispatchCompanyId: createdCompanies[0].id,
      jobCategoryId: createdCategories[0].id,
      title: "訪問入浴 - 渋谷エリア",
      facilityName: "渋谷訪問入浴センター",
      address: "東京都渋谷区桜丘町1-2-3",
      date: new Date(year, month + 1, 5),
      startTime: "09:00",
      endTime: "17:00",
      hourlyRate: 1800,
      transportationFee: 800,
      status: "offered",
      priority: "medium",
    },
    {
      dispatchCompanyId: createdCompanies[1].id,
      jobCategoryId: createdCategories[5].id,
      title: "病棟勤務 - 東京医療センター",
      facilityName: "東京医療センター",
      address: "東京都目黒区東が丘2-5-1",
      date: new Date(year, month + 1, 10),
      startTime: "08:30",
      endTime: "17:30",
      hourlyRate: 2000,
      transportationFee: 700,
      status: "offered",
      priority: "high",
    },
    // Declined / Cancelled
    {
      dispatchCompanyId: createdCompanies[4].id,
      jobCategoryId: createdCategories[6].id,
      title: "整形外科クリニック",
      facilityName: "新宿整形外科",
      address: "東京都新宿区新宿3-1-1",
      date: new Date(year, month, 7),
      startTime: "09:00",
      endTime: "18:00",
      hourlyRate: 1800,
      transportationFee: 500,
      status: "declined",
      priority: "low",
    },
    {
      dispatchCompanyId: createdCompanies[3].id,
      jobCategoryId: createdCategories[8].id,
      title: "デイサービス - 練馬",
      facilityName: "ひまわりデイサービス",
      address: "東京都練馬区石神井町5-3-2",
      date: new Date(year, month, 14),
      startTime: "09:00",
      endTime: "17:00",
      hourlyRate: 1600,
      transportationFee: 700,
      status: "cancelled",
      priority: "low",
    },
    // More confirmed for this month
    {
      dispatchCompanyId: createdCompanies[1].id,
      jobCategoryId: createdCategories[6].id,
      title: "内科クリニック午前",
      facilityName: "中目黒内科クリニック",
      address: "東京都目黒区上目黒1-2-3",
      date: new Date(year, month, 28),
      startTime: "08:30",
      endTime: "13:00",
      hourlyRate: 1800,
      transportationFee: 400,
      status: "confirmed",
      priority: "medium",
    },
    {
      dispatchCompanyId: createdCompanies[2].id,
      jobCategoryId: createdCategories[7].id,
      title: "企業健診 - 川崎",
      facilityName: "川崎テックセンター",
      address: "神奈川県川崎市幸区堀川町1-1",
      date: new Date(year, month, 26),
      startTime: "08:00",
      endTime: "16:00",
      hourlyRate: 2100,
      transportationFee: 1200,
      status: "confirmed",
      priority: "high",
    },
  ];

  for (const job of sampleJobs) {
    await prisma.job.create({
      data: { ...job, userId: user.id },
    });
  }

  // Create monthly goal
  await prisma.monthlyGoal.upsert({
    where: {
      userId_year_month: {
        userId: user.id,
        year,
        month: month + 1,
      },
    },
    update: {},
    create: {
      userId: user.id,
      year,
      month: month + 1,
      targetIncome: 350000,
      targetWorkDays: 18,
    },
  });

  console.log("Seed data created successfully!");
  console.log(`Demo account: demo@nurseboard.jp / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
