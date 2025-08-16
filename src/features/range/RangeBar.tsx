import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import CalendarPopover from "../calendar/CalendarPopover";
import {
  startOfDay,
  startOfWeekSunday,
  rangeLabelWidth,
  startOfWeekSun,
} from "../../lib/date";

type RangeKind = "day" | "week" | "month" | "year" | "life";

type Props = {
  rangeKind: RangeKind;
  anchor: number;
  label: string;
  onChangeKind: (k: RangeKind) => void;
  onChangeAnchor: (ts: number) => void;
  onOpenLife: () => void;
};

export default function RangeBar({
  rangeKind,
  anchor,
  label,
  onChangeKind,
  onChangeAnchor,
  onOpenLife,
}: Props) {
  const { t } = useTranslation();

  const [calOpen, setCalOpen] = useState(false);
  const [calViewDate, setCalViewDate] = useState<Date>(() => new Date(anchor));
  const calWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (calOpen) setCalViewDate(new Date(anchor));
  }, [calOpen, anchor]);

  useEffect(() => {
    if (!calOpen) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setCalOpen(false); }
    function onClick(e: MouseEvent) {
      if (!calWrapRef.current) return;
      if (!calWrapRef.current.contains(e.target as Node)) setCalOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [calOpen]);

  function moveRange(delta: number) {
    if (rangeKind === "day") {
      onChangeAnchor(startOfDay(new Date(anchor + delta * 24 * 60 * 60 * 1000)));
    } else if (rangeKind === "week") {
      const base = startOfWeekSunday(new Date(anchor));
      onChangeAnchor(startOfDay(new Date(base + delta * 7 * 24 * 60 * 60 * 1000)));
    } else if (rangeKind === "month") {
      const d = new Date(anchor);
      d.setMonth(d.getMonth() + delta);
      onChangeAnchor(startOfDay(d));
    } else if (rangeKind === "year") {
      const d = new Date(anchor);
      d.setFullYear(d.getFullYear() + delta);
      onChangeAnchor(startOfDay(d));
    } else if (rangeKind === "life") {
    }
  }

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="relative flex items-center gap-2" ref={calWrapRef}>
        <button
          onClick={() => moveRange(-1)}
          className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* clickable label opens the calendar or life modal */}
        <button
          className="rounded-lg py-1.5 px-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 text-center whitespace-nowrap truncate transition"
          style={{ width: `${rangeLabelWidth(rangeKind)}px` }}
          onClick={() => (rangeKind === "life" ? onOpenLife() : setCalOpen((o) => !o))}
          aria-haspopup="dialog"
          aria-expanded={calOpen}
          title={label}
        >
          {label}
        </button>

        <button
          onClick={() => moveRange(1)}
          className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* popover */}
        {calOpen && rangeKind !== "life" && (
          <CalendarPopover
            rangeKind={rangeKind as Exclude<RangeKind, "life">}
            anchor={anchor}
            viewDate={calViewDate}
            setViewDate={setCalViewDate}
            onPickDay={(ts) => {
              onChangeKind("day");
              onChangeAnchor(startOfDay(new Date(ts)));
              setCalOpen(false);
            }}
            onPickWeek={(ts) => {
              onChangeKind("week");
              onChangeAnchor(startOfWeekSun(new Date(ts)));
              setCalOpen(false);
            }}
            onPickMonth={(year, month /*0-11*/) => {
              onChangeKind("month");
              onChangeAnchor(startOfDay(new Date(year, month, 1)));
              setCalOpen(false);
            }}
            onPickYear={(year) => {
              onChangeKind("year");
              onChangeAnchor(startOfDay(new Date(year, 0, 1)));
              setCalOpen(false);
            }}
            onToday={() => {
              onChangeKind("day");
              onChangeAnchor(startOfDay(new Date()));
              setCalOpen(false);
            }}
          />
        )}
      </div>

      <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 text-sm dark:bg-zinc-800">
        {(["day", "week", "month", "year", "life"] as RangeKind[]).map((k) => {
          const is = rangeKind === k;
          return (
            <button
              key={k}
              onClick={() => onChangeKind(k)}
              className={[
                "rounded-lg px-3 py-1.5 transition",
                is
                  ? "bg-white text-zinc-900 shadow dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-700 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-zinc-700/60",
              ].join(" ")}
            >
              {t(`range.${k}` as const)}
            </button>
          );
        })}
      </div>
    </div>
  );
}