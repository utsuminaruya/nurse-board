import { Job, DispatchCompany, JobCategory, MonthlyGoal, User } from "@prisma/client";

export type JobWithRelations = Job & {
  dispatchCompany: DispatchCompany;
  jobCategory: JobCategory;
};

export type { Job, DispatchCompany, JobCategory, MonthlyGoal, User };

export type JobStatus = "offered" | "applied" | "confirmed" | "completed" | "cancelled" | "declined";
export type JobPriority = "high" | "medium" | "low";
export type CommunicationChannel = "email" | "line" | "app" | "phone" | "fax";
