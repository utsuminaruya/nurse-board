"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { JobWithRelations } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  offered: "bg-yellow-400",
  applied: "bg-blue-400",
  confirmed: "bg-green-400",
  completed: "bg-gray-400",
  cancelled: "bg-red-400",
  declined: "bg-gray-300",
};

interface MonthViewProps {
  currentDate: Date;
  jobs: JobWithRelations[];
  onJobClick: (job: JobWithRelations) => void;
}

export default function MonthView({ currentDate, jobs, onJobClick }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  function getJobsForDay(day: Date) {
    return jobs.filter((job) => isSameDay(new Date(job.date), day));
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-7">
        {weekDays.map((day, i) => (
          <div
            key={day}
            className={cn(
              "py-2 text-center text-sm font-medium border-b border-gray-200",
              i === 0 && "text-red-500",
              i === 6 && "text-blue-500"
            )}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const dayJobs = getJobsForDay(day);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);
          const dayOfWeek = day.getDay();
          const hasNoJobs = dayJobs.length === 0 && inMonth;
          const hasConfirmedOrCompleted = dayJobs.some(
            (j) => j.status === "confirmed" || j.status === "completed"
          );

          return (
            <div
              key={i}
              className={cn(
                "min-h-[80px] md:min-h-[100px] border-b border-r border-gray-100 p-1",
                !inMonth && "bg-gray-50",
                hasNoJobs && !hasConfirmedOrCompleted && inMonth && "bg-green-50/50"
              )}
            >
              <div
                className={cn(
                  "text-xs md:text-sm font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                  !inMonth && "text-gray-300",
                  today && "bg-blue-600 text-white",
                  dayOfWeek === 0 && inMonth && !today && "text-red-500",
                  dayOfWeek === 6 && inMonth && !today && "text-blue-500"
                )}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {dayJobs.slice(0, 3).map((job) => (
                  <button
                    key={job.id}
                    onClick={() => onJobClick(job)}
                    className={cn(
                      "w-full text-left text-[10px] md:text-xs px-1 py-0.5 rounded truncate text-white font-medium",
                      STATUS_COLORS[job.status] || "bg-gray-400"
                    )}
                    title={job.title}
                  >
                    <span className="hidden md:inline">{job.startTime} </span>
                    {job.title}
                  </button>
                ))}
                {dayJobs.length > 3 && (
                  <div className="text-[10px] text-gray-500 pl-1">
                    +{dayJobs.length - 3}件
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
