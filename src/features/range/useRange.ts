import { useMemo } from "react";
import type { TFunction } from "i18next";
import {
  startOfDay,
  endOfDay,
  monthBounds,
  yearBounds,
  startOfWeekSunday,
  endOfWeekSunday,
  formatDateShort,
} from "../../lib/date";

export function useRange(params: {
  rangeKind: "day" | "week" | "month" | "year" | "life";
  anchor: number;
  lifeStart: number;
  useMMDDYYYY: boolean;
  language: string;
  t: TFunction;
}) {
  const { rangeKind, anchor, lifeStart, useMMDDYYYY, language, t } = params;

  return useMemo(() => {
    const anchorDate = new Date(anchor);
    const useMDY = useMMDDYYYY;

    if (rangeKind === "day") {
      const s = startOfDay(anchorDate), e = endOfDay(anchorDate);
      return {
        rangeStart: s,
        rangeEnd: e,
        label: anchor === startOfDay(new Date()) ? t("date.today") : formatDateShort(anchor, useMDY),
      };
    }

    if (rangeKind === "week") {
      const s = startOfWeekSunday(anchorDate);
      const e = endOfWeekSunday(anchorDate);
      return {
        rangeStart: s,
        rangeEnd: e,
        label: `${formatDateShort(s, useMDY)} – ${formatDateShort(e, useMDY)}`,
      };
    }

    if (rangeKind === "month") {
      const [s, e] = monthBounds(new Date(anchor));
      const d = new Date(anchor);
      return {
        rangeStart: s,
        rangeEnd: e,
        label: `${d.toLocaleString(language as any, { month: "long" })} ${d.getFullYear()}`,
      };
    }

    if (rangeKind === "life") {
      const s = startOfDay(new Date(lifeStart));
      const todayEnd = endOfDay(new Date());
      return {
        rangeStart: s,
        rangeEnd: todayEnd,
        label: t("date.since", { date: formatDateShort(s, useMDY) }),
      };
    }

    const [s, e] = yearBounds(new Date(anchor));
    return {
      rangeStart: s,
      rangeEnd: e,
      label: `${new Date(anchor).getFullYear()}`,
    };
  }, [rangeKind, anchor, lifeStart, useMMDDYYYY, language, t]);
}