import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Activity, VisibilityMap } from "../../types";

export default function FilterActivitiesForm({
  activities,
  visibility,
  onSave,
  onCancel,
}: {
  activities: Activity[];
  visibility: VisibilityMap;
  onSave: (next: VisibilityMap) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();

  const init = () => {
    const m: VisibilityMap = {
      "__untracked__": visibility["__untracked__"] !== false,
      "__future__": visibility["__future__"] !== false,
    };
    for (const a of activities) m[a.id] = visibility[a.id] !== false;
    return m;
    };
  const [local, setLocal] = useState<VisibilityMap>(init);
  useEffect(() => { setLocal(init()); }, [activities, visibility]);

  function toggle(id: string) {
    setLocal((cur) => ({ ...cur, [id]: !cur[id] }));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(local); }} className="space-y-4">
      <div className="space-y-3">
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("filter.special")}</div>
          <label className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition focus-within:ring-2 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-700">
            <span className="text-sm">{t("labels.untracked")}</span>
            <input type="checkbox" checked={!!local["__untracked__"]} onChange={() => toggle("__untracked__")} className="h-4 w-4"/>
          </label>

          <label className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition focus-within:ring-2 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-700">
            <span className="text-sm">{t("labels.future")}</span>
            <input type="checkbox" checked={!!local["__future__"]} onChange={() => toggle("__future__")} className="h-4 w-4"/>
          </label>
        </div>

        <div className="mt-2">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("filter.activities")}</div>
          <div className="max-h-64 overflow-auto rounded-xl ring-zinc-200 dark:ring-zinc-700">
            {activities.map((a) => (
              <label key={a.id} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition focus-within:ring-2 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-700">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm" style={{ background: a.color }} />
                  <span className={`text-sm ${a.archived ? "text-zinc-400 dark:text-zinc-500 line-through" : ""}`}>{a.name}</span>
                </span>
                <input type="checkbox" checked={!!local[a.id]} onChange={() => toggle(a.id)} className="h-4 w-4"/>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2 text-sm ring-1 ring-zinc-200 hover:bg-zinc-50">{t("dialogs.cancel")}</button>
        <button type="submit" className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110">{t("dialogs.apply")}</button>
      </div>
    </form>
  );
}