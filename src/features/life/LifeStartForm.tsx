import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"; // Trans not used here but kept if you localize help later
import { maskDateInput, parseDateInput, startOfDay } from "../../lib/date";

type Props = {
  useMMDDYYYY: boolean;
  value: string;
  onChange: (next: string) => void;
  onSubmitValid: (ts: number) => void;
  info: (opts: { title?: string; message: string }) => Promise<void>;
};

export default function LifeStartForm({
  useMMDDYYYY,
  value,
  onChange,
  onSubmitValid,
  info,
}: Props) {
  const { t } = useTranslation();
  const [local, setLocal] = useState(value);

  useEffect(() => setLocal(value), [value]);

  const pat = useMMDDYYYY ? "MM/DD/YYYY" : "DD/MM/YYYY";

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const ts = parseDateInput(local, useMMDDYYYY);
        if (ts === null) {
          await info({
            title: t("dialogs.invalidDateTitle"),
            message: t("dialogs.invalidDateBody", { pattern: pat }) as string,
          });
          return;
        }
        const todayStart = startOfDay(new Date());
        if (ts > todayStart) {
          await info({
            title: t("dialogs.futureNotAllowedTitle"),
            message: t("dialogs.futureNotAllowedBody") as string,
          });
          return;
        }
        onSubmitValid(ts);
      }}
      className="space-y-4"
    >
      <div>
        <label className="mb-1 block text-sm text-zinc-600">
          {t("life.label", { pattern: pat })}
        </label>
        <input
          value={local}
          onChange={(e) => {
            const masked = maskDateInput(e.target.value, useMMDDYYYY);
            setLocal(masked);
            onChange(masked);
          }}
          placeholder={pat}
          inputMode="numeric"
          className="w-full rounded-xl border border-zinc-200 px-3 py-2 outline-none placeholder:text-zinc-400 focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        <p className="mt-1 text-xs text-zinc-500">{t("life.help")}</p>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          {t("dialogs.apply")}
        </button>
      </div>
    </form>
  );
}