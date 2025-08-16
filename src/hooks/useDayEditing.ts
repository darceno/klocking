import { useState } from "react";
import type { TFunction } from "i18next";
import { startOfDay, ymd, minutesElapsedForDate } from "../lib/date";
import { formatMinutes } from "../lib/format";
import type { Activity, DailyTotals, Running, AppSettings } from "../types";

type AppActions = {
  setDayTotal: (dateStr: string, activityId: string, minutes: number) => void;
  availableUntrackedForDate: (dateStr: string) => number;
};

type SliceEntry = { id: string; name: string; isUntracked?: boolean; isFuture?: boolean };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function useDayEditing(opts: {
  actions: AppActions;
  activities: Activity[];
  dailyTotals: DailyTotals;
  running: Running | null;
  settings: AppSettings;
  anchor: number; // timestamp
  rangeKind: "day" | "week" | "month" | "year" | "life";
  overlayForDate: (dateStr: string) => number;
  info: (o: { title?: string; message: string }) => Promise<void>;
  t: TFunction;
  push: (msg: string) => void;
  openAddActivity: () => void;
}) {
  const {
    actions,
    activities,
    dailyTotals,
    running,
    settings,
    anchor,
    rangeKind,
    overlayForDate,
    info,
    t,
    push,
    openAddActivity,
  } = opts;

  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ id: string; name: string } | null>(null);
  const [addUntrackedOpen, setAddUntrackedOpen] = useState(false);

  function closeEdit() {
    setEditOpen(false);
    setEditTarget(null);
  }
  function closeAddUntracked() {
    setAddUntrackedOpen(false);
  }

  async function handleSliceClick(entry: SliceEntry) {
    if (!entry) return;

    if (rangeKind !== "day") {
      await info({ title: t("dialogs.notEditableTitle"), message: t("dialogs.notEditableBody") });
      return;
    }

    const dayStart = startOfDay(new Date(anchor));
    if (dayStart > startOfDay(new Date())) {
      await info({ title: t("dialogs.futureDayTitle"), message: t("dialogs.futureDayBody") });
      return;
    }

    if (entry.isFuture) return;

    if (entry.isUntracked) {
      const hasAnyActive = activities.some((a) => !a.archived);
      if (!hasAnyActive) {
        await info({ title: t("dialogs.noActivitiesTitle"), message: t("dialogs.noActivitiesBody") });
        openAddActivity();
        return;
      }
      setAddUntrackedOpen(true);
      return;
    }

    if (running && running.activityId === entry.id) {
      await info({ title: t("dialogs.sessionRunningTitle"), message: t("dialogs.sessionRunningBody") });
      return;
    }

    setEditTarget({ id: entry.id, name: entry.name });
    setEditOpen(true);
  }

  function currentMinutesFor(id: string) {
    const dateStr = ymd(new Date(anchor));
    const persisted = dailyTotals[dateStr]?.[id] ?? 0;
    const overlay = running && running.activityId === id ? overlayForDate(dateStr) : 0;
    return persisted + overlay;
  }

  function unallocatedForAnchor() {
    const dateStr = ymd(new Date(anchor));
    return actions.availableUntrackedForDate(dateStr);
  }

  async function editActivityTotalForRange(activityId: string, targetMinutes: number) {
    if (rangeKind !== "day") return;

    const dateStr = ymd(new Date(anchor));

    // guard: future date
    if (startOfDay(new Date(anchor)) > startOfDay(new Date())) {
      await info({ title: "Future day", message: "You can't edit the future." });
      return;
    }

    // guard: same activity is running
    if (running && running.activityId === activityId) {
      await info({
        title: "Session running",
        message: "Stop the current session of this activity before editing its total.",
      });
      return;
    }

    const elapsed = minutesElapsedForDate(dateStr, Date.now());
    const dayMap = dailyTotals[dateStr] ?? {};

    
    const overlayOther = running ? overlayForDate(dateStr) : 0;

    const others =
      Object.entries(dayMap).reduce(
        (acc, [id, m]) => acc + (id === activityId ? 0 : Math.max(0, Math.floor(m))),
        0
      ) + overlayOther;

    const maxForThis = Math.max(0, elapsed - others);
    const desired = clamp(Math.floor(targetMinutes), 0, maxForThis);

    if (Math.floor(targetMinutes) > maxForThis) {
      push(t("toast.cappedPast", { amount: formatMinutes(maxForThis, settings.showMinutes) }));
    }

    actions.setDayTotal(dateStr, activityId, desired);
  }

  return {
    // state
    editOpen,
    editTarget,
    addUntrackedOpen,

    // helpers
    closeEdit,
    closeAddUntracked,
    handleSliceClick,
    currentMinutesFor,
    unallocatedForAnchor,
    editActivityTotalForRange,
  };
}