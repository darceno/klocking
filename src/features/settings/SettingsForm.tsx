import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AppSettings } from "../../types";

export default function SettingsForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: AppSettings;
  onSave: (next: AppSettings) => void;
  onCancel: () => void;
}) {
  const [local, setLocal] = useState<AppSettings>(initial);
  useEffect(() => setLocal(initial), [initial]);

  const { t } = useTranslation();

  function toggle<K extends keyof AppSettings>(key: K) {
    setLocal((cur) => ({ ...cur, [key]: !cur[key] }));
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(local); }} className="space-y-4">
      <div className="space-y-2">

        <label className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition focus-within:ring-2 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-700">
          <span className="text-sm">{t("settings.mdy")}</span>
          <input type="checkbox" checked={local.useMMDDYYYY} onChange={() => toggle("useMMDDYYYY")} className="h-4 w-4"/>
        </label>

        <label className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition focus-within:ring-2 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-700">
          <span className="text-sm">{t("settings.minutes")}</span>
          <input type="checkbox" checked={local.showMinutes} onChange={() => toggle("showMinutes")} className="h-4 w-4"/>
        </label>

        <label className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition focus-within:ring-2 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-700">
          <span className="text-sm">{t("settings.percentTooltip")}</span>
          <input type="checkbox" checked={local.showPercentTooltip} onChange={() => toggle("showPercentTooltip")} className="h-4 w-4"/>
        </label>

        <label className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition focus-within:ring-2 focus-within:ring-indigo-300 dark:focus-within:ring-indigo-700">
          <span className="text-sm">{t("settings.lang")}</span>
          <select
            value={local.language}
            onChange={(e) => setLocal((cur) => ({ ...cur, language: e.target.value as any }))}
            className="w-42 text-sm rounded-lg border border-zinc-200 bg-white px-2 py-1
                       dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="en">{t("settings.lang_en")}</option>
            <option value="pt-BR">{t("settings.lang_pt")}</option>
          </select>
        </label>

      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2 text-sm ring-1 ring-zinc-200 hover:bg-zinc-50">
          {t("settings.cancel")}
        </button>
        <button type="submit" className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110">
          {t("settings.apply")}
        </button>
      </div>
    </form>
  );
}