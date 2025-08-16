import { useState } from "react";
import { Check } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import type { Activity } from "../../types";
import { formatMinutes } from "../../lib/format";

export default function EditTotalForm({
  activity,
  currentMinutes,
  unallocated,
  showMinutes,
  onConfirm,
}: {
  activity: Activity;
  currentMinutes: number;
  unallocated: number;
  showMinutes: boolean;
  onConfirm: (minutes: number) => void;
}) {
  const [hrs, setHrs] = useState(String(Math.floor(currentMinutes / 60)));
  const [mins, setMins] = useState(String(currentMinutes % 60));

  const { t } = useTranslation();

  const desired = Math.max(0, (parseInt(hrs || "0") || 0) * 60 + (parseInt(mins || "0") || 0));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onConfirm(desired); }} className="space-y-4">
      <div className="text-sm text-zinc-600">
        <Trans i18nKey="editTotal.lead" values={{ name: activity.name }}>
          Set the total recorded time for <span className="font-medium text-zinc-800">{activity.name}</span> within this day.
        </Trans>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t("editTotal.hours")}</label>
          <input type="number" min={0} max={24} value={hrs} onChange={(e) => setHrs(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"/>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-600">{t("editTotal.minutes")}</label>
          <input type="number" min={0} max={59} value={mins} onChange={(e) => setMins(e.target.value)} className="w-full rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"/>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <div>{t("editTotal.current")}: {formatMinutes(currentMinutes, showMinutes)}</div>
        <div>{t("editTotal.unallocatedToday")}: {formatMinutes(unallocated, showMinutes)}</div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="submit" className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110">
          <Check className="mr-1 inline h-4 w-4"/>{t("editTotal.apply")}
        </button>
      </div>
    </form>
  );
}