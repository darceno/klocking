import { useState } from "react";
import { PALETTE } from "../../constants";
import type { Activity } from "../../types";
import { useTranslation } from "react-i18next";

export default function EditActivityForm({ initial, onSave }: { initial: Activity; onSave: (name: string, color: string) => void }) {
  const [name, setName] = useState(initial.name);
  const [color, setColor] = useState(initial.color);
  const { t } = useTranslation();

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; onSave(name, color); }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-sm text-zinc-600">{t("editActivity.name")}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none ring-0 placeholder:text-zinc-400 focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          placeholder="e.g., Writing"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm text-zinc-600">{t("editActivity.color")}</label>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              onMouseDown={(e) => e.preventDefault()}
              aria-pressed={color === c}
              aria-label={`Pick ${c}`}
              className={[
                "h-8 w-8 rounded-xl transition",
                "outline-none focus:outline-none",
                "ring-1 ring-zinc-300 dark:ring-zinc-600",
                "focus-visible:ring-2 focus-visible:ring-indigo-500",
                "focus-visible:ring-offset-2 ring-offset-white dark:ring-offset-zinc-900",
                color === c ? "ring-2 ring-indigo-500 ring-offset-2" : "",
              ].join(" ")}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="submit" className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110">
          {t("editActivity.save")}
        </button>
      </div>
    </form>
  );
}