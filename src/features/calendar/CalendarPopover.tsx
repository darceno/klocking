import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { daysGridForMonth, startOfDay, startOfWeekSun, endOfWeekSun } from "../../lib/date";

export default function CalendarPopover({
  rangeKind,
  anchor,
  viewDate,
  setViewDate,
  onPickDay,
  onPickWeek,
  onPickMonth,
  onPickYear,
  onToday,
}: {
  rangeKind: "day" | "week" | "month" | "year";
  anchor: number;
  viewDate: Date;
  setViewDate: (d: Date) => void;
  onPickDay: (ts: number) => void;
  onPickWeek: (ts: number) => void;
  onPickMonth: (year: number, month: number) => void;
  onPickYear: (year: number) => void;
  onToday: () => void;
}) {
  const { t, i18n } = useTranslation();
  const monthName = viewDate.toLocaleString(i18n.language as any, { month: "long" });
  const year = viewDate.getFullYear();
  const anchorDay = startOfDay(new Date(anchor));
  const weekStart = startOfWeekSun(new Date(anchor));
  const weekEnd = endOfWeekSun(new Date(anchor));

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="absolute left-1/2 z-50 mt-2 w-80 -tranzinc-x-1/2 rounded-2xl bg-white ring-1 ring-zinc-200 shadow-xl p-3 dark:bg-zinc-900 dark:ring-zinc-700 dark:text-zinc-100"
      role="dialog"
      aria-label={t("calendar.label")}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {rangeKind === "year" ? `${year - 6} – ${year + 5}` :
           rangeKind === "month" ? `${year}` :
           `${monthName} ${year}`}
        </div>
        <div className="flex items-center gap-1">
          <button
            className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => {
              if (rangeKind === "year") setViewDate(new Date(year - 12, 0, 1));
              else if (rangeKind === "month") setViewDate(new Date(year - 1, viewDate.getMonth(), 1));
              else setViewDate(new Date(year, viewDate.getMonth() - 1, 1));
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => {
              if (rangeKind === "year") setViewDate(new Date(year + 12, 0, 1));
              else if (rangeKind === "month") setViewDate(new Date(year + 1, viewDate.getMonth(), 1));
              else setViewDate(new Date(year, viewDate.getMonth() + 1, 1));
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            className="ml-2 rounded-lg px-2 py-1 text-xs ring-1 ring-zinc-200 hover:bg-zinc-50 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800"
            onClick={onToday}
          >
            {t("date.today")}
          </button>
        </div>
      </div>

      {(rangeKind === "day" || rangeKind === "week") && (
        <div>
          <div className="grid grid-cols-7 gap-1">
            {daysGridForMonth(viewDate).map((ts) => {
              const d = new Date(ts);
              const isCurMonth = d.getMonth() === viewDate.getMonth();
              const isToday = startOfDay(new Date()).valueOf() === ts;
              const isSelectedDay = rangeKind === "day" && ts === anchorDay;
              const inSelectedWeek = rangeKind === "week" && ts >= weekStart && ts <= weekEnd;

              return (
                <button
                  key={ts}
                  onClick={() => (rangeKind === "day" ? onPickDay(ts) : onPickWeek(ts))}
                  className={[
                    "h-9 rounded-lg text-sm transition",
                    isCurMonth ? "text-zinc-700 dark:text-zinc-200" : "text-zinc-400 dark:text-zinc-500",
                    inSelectedWeek ? "bg-indigo-50 ring-1 ring-indigo-200 dark:bg-indigo-900/30 dark:ring-indigo-700" : "",
                    isSelectedDay ? "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white" : "",
                    !inSelectedWeek && !isSelectedDay ? "hover:bg-zinc-100 dark:hover:bg-zinc-800" : "",
                  ].join(" ")}
                >
                  {d.getDate()}
                  {isToday && !isSelectedDay && (
                    <span className="ml-1 align-middle text-[10px] text-indigo-600 dark:text-indigo-400">•</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {rangeKind === "month" && (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }).map((_, m) => {
            const label = new Date(2000, m, 1).toLocaleString(undefined, { month: "short" });
            const isSel = new Date(anchor).getFullYear() === year && new Date(anchor).getMonth() === m;
            return (
              <button
                key={m}
                onClick={() => onPickMonth(year, m)}
                className={[
                  "rounded-xl px-3 py-2 text-sm transition",
                  isSel
                    ? "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {rangeKind === "year" && (
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 12 }).map((_, i) => {
            const y = year - 6 + i;
            const isSel = new Date(anchor).getFullYear() === y;
            return (
              <button
                key={y}
                onClick={() => onPickYear(y)}
                className={[
                  "rounded-xl px-3 py-2 text-sm transition",
                  isSel
                    ? "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
                ].join(" ")}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}