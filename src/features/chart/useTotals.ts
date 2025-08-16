import { useEffect, useMemo, useState } from "react";
import type { Activity, ChartRow } from "../../types";
import { META_COLORS } from "../../constants";
import {
  enumerateDays,
  startOfDay,
  endOfDay,
  minutesElapsedForDate,
} from "../../lib/date";

type Params = {
  activities: Activity[];
  dailyTotals: Record<string, Record<string, number>>;
  running: { activityId: string; start: number } | null;
  rangeStart: number;
  rangeEnd: number;
  visibility: Record<string, boolean | undefined>;
  theme: "light" | "dark";
  t: (key: string, vars?: any) => string;
};

function useSecondTick(enabled: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [enabled]);
  return tick;
}

export function useTotals({
  activities,
  dailyTotals,
  running,
  rangeStart,
  rangeEnd,
  visibility,
  theme,
  t,
}: Params) {
  const now = Date.now();
  const includesNow = now >= rangeStart && now <= rangeEnd;
  const tick = useSecondTick(includesNow || !!running);

  const runningOverlayByDay = useMemo(() => {
    if (!running) return {} as Record<string, number>;
    const s = running.start;
    if (s >= Date.now()) return {};
    const days = enumerateDays(rangeStart, rangeEnd);
    const out: Record<string, number> = {};
    for (const dateStr of days) {
      const ds = startOfDay(new Date(dateStr));
      const de = endOfDay(new Date(dateStr));
      const overlap = Math.max(0, Math.min(de, Date.now()) - Math.max(ds, s));
      if (overlap > 0) out[dateStr] = Math.floor(overlap / 60000);
    }
    return out;
  }, [running, rangeStart, rangeEnd, tick]);

  const overlayForDate = (dateStr: string) =>
    running ? runningOverlayByDay[dateStr] ?? 0 : 0;

  // aggregate totals for the window (per activity + meta slices)
  const totals = useMemo(() => {
    const perActivity = new Map<string, number>(); // minutes
    const days = enumerateDays(rangeStart, rangeEnd);
    let trackedPastMin = 0;
    let elapsedWindowMin = 0;

    for (const dateStr of days) {
      const dayMap = dailyTotals[dateStr] ?? {};
      const overlayMin = overlayForDate(dateStr);

      let daySum = 0;
      for (const [actId, mins] of Object.entries(dayMap)) {
        const v = Math.max(0, Math.floor(mins));
        if (v <= 0) continue;
        daySum += v;
        perActivity.set(actId, (perActivity.get(actId) ?? 0) + v);
      }

      if (overlayMin > 0 && running) {
        daySum += overlayMin;
        perActivity.set(
          running.activityId,
          (perActivity.get(running.activityId) ?? 0) + overlayMin
        );
      }

      const elapsed = Math.min(1440, minutesElapsedForDate(dateStr, Date.now()));
      elapsedWindowMin += elapsed;
      trackedPastMin += Math.min(daySum, elapsed);
    }

    const totalWindowMin = enumerateDays(rangeStart, rangeEnd).length * 1440;
    const untrackedPast = Math.max(0, elapsedWindowMin - trackedPastMin);
    const futureMin = Math.max(0, totalWindowMin - elapsedWindowMin);

    return { perActivity, trackedPastMin, untrackedPast, futureMin, totalWindowMin };
  }, [dailyTotals, running, rangeStart, rangeEnd, runningOverlayByDay, tick]);

  // build chart rows while respecting custom order and visibility (filter)
  const chartData = useMemo<ChartRow[]>(() => {
    const order = new Map<string, number>();
    activities.forEach((a, i) => order.set(a.id, i));

    const rows: (ChartRow & { _order: number })[] = [];
    for (const [activityId, mins] of totals.perActivity.entries()) {
      const a = activities.find((x) => x.id === activityId);
      const idx = order.get(activityId);
      rows.push({
        id: activityId,
        name: a?.name ?? "Unknown",
        value: Math.round(mins),
        color: a?.color ?? "#94a3b8",
        isUntracked: false,
        isFuture: false,
        _order: idx !== undefined ? idx : Number.MAX_SAFE_INTEGER - 2,
      });
    }

    if (totals.untrackedPast > 0) {
      rows.push({
        id: "__untracked__",
        name: t("labels.untracked"),
        value: Math.round(totals.untrackedPast),
        color: theme === "dark" ? META_COLORS.untracked.dark : META_COLORS.untracked.light,
        isUntracked: true,
        isFuture: false,
        _order: Number.MAX_SAFE_INTEGER - 1,
      });
    }
    if (totals.futureMin > 0) {
      rows.push({
        id: "__future__",
        name: t("labels.future"),
        value: Math.round(totals.futureMin),
        color: theme === "dark" ? META_COLORS.future.dark : META_COLORS.future.light,
        isUntracked: false,
        isFuture: true,
        _order: Number.MAX_SAFE_INTEGER,
      });
    }

    const isVisible = (id: string) => visibility[id] !== false;
    const filtered = rows.filter((r) => r.value > 0 && isVisible(r.id));
    filtered.sort((a, b) => a._order - b._order);
    return filtered.map(({ _order, ...rest }) => rest);
  }, [totals, activities, visibility, theme, t]);

  const chartTotal = useMemo(
    () => chartData.reduce((sum, r) => sum + (Number(r.value) || 0), 0),
    [chartData]
  );

  return { runningOverlayByDay, overlayForDate, totals, chartData, chartTotal };
}