import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Activity } from "../../types";
import { formatMinutes } from "../../lib/format";

export default function AddFromUntrackedForm({
  activities,
  getCurrentMinutes,
  unallocated,
  showMinutes,
  onConfirm,
}: {
  activities: Activity[];
  getCurrentMinutes: (id: string) => number;
  unallocated: number;
  showMinutes: boolean;
  onConfirm: (activityId: string, minutes: number) => void;
}) {
  const [activityId, setActivityId] = useState<string>(activities[0]?.id ?? "");
  const [hrs, setHrs] = useState("0");
  const [mins, setMins] = useState("0");

  const { t } = useTranslation();

  useEffect(() => { if (!activityId && activities[0]) setActivityId(activities[0].id); }, [activities, activityId]);

  const current = useMemo(() => (activityId ? getCurrentMinutes(activityId) : 0), [activityId, getCurrentMinutes]);

  const desired = Math.max(0, (parseInt(hrs || "0") || 0) * 60 + (parseInt(mins || "0") || 0));

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!activityId) return; onConfirm(activityId, desired); }} className="space-y-4">
      <div className="text-sm text-zinc-600">{t("fromUntracked.lead")}</div>

      <div>
        <label className="mb-1 block text-sm text-zinc-600">{t("fromUntracked.activity")}</label>
        <select value={activityId} onChange={(e) => setActivityId(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500">
          {activities.map((a) => (<option key={a.id} value={a.id}>{a.name}</option>))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="mb-1 block text-sm text-zinc-600">{t("fromUntracked.hours")}</label><input type="number" min={0} max={24} value={hrs} onChange={(e) => setHrs(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"/></div>
        <div><label className="mb-1 block text-sm text-zinc-600">{t("fromUntracked.minutes")}</label><input type="number" min={0} max={59} value={mins} onChange={(e) => setMins(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"/></div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <div>{t("fromUntracked.currentForDay")}: {formatMinutes(current, showMinutes)}</div>
        <div>{t("fromUntracked.unallocatedToday")}: {formatMinutes(unallocated, showMinutes)}</div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:brightness-110">
          <Check className="mr-1 inline h-4 w-4"/>{t("fromUntracked.apply")}
        </button>
      </div>
    </form>
  );
}