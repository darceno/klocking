import { useTranslation } from "react-i18next";
import { Plus, Square, Play, Filter, Sun, Moon, Settings } from "lucide-react";
import { IconButton } from "../../ui/IconButton";
import type { ThemeMode } from "../../types";
import { formatHMS } from "../../lib/format";

type Props = {
  isRunning: boolean;
  runningStart: number | null;
  runningActivityName: string | null;
  runningActivityColor: string | null;
  theme: ThemeMode;
  onPauseOrResume: () => void;
  onAddTime: () => void;
  onToggleTheme: () => void;
  onOpenFilter: () => void;
  onOpenSettings: () => void;
};

export default function ConsolePanel({
  isRunning,
  runningStart,
  runningActivityName,
  runningActivityColor,
  theme,
  onPauseOrResume,
  onAddTime,
  onToggleTheme,
  onOpenFilter,
  onOpenSettings,
}: Props) {
  const { t } = useTranslation();

  const timer = isRunning && runningStart
    ? formatHMS(Date.now() - runningStart)
    : "00:00:00";

  return (
    <div>
      <div className="min-h-[360px] flex flex-col items-center justify-center">

        <div className="flex flex-col items-center">

          <div className="mt-2 text-sm text-zinc-500">
            {isRunning ? (
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: runningActivityColor ?? undefined }}
                />
                {runningActivityName ?? ""}
              </span>
            ) : (
              <span>{t("console.noActive")}</span>
            )}
          </div>

          <div className="text-6xl font-semibold tracking-tight tabular-nums">
            {timer}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={onPauseOrResume}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 font-medium text-white shadow hover:brightness-110"
            >
              {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? t("console.stop") : t("console.lastActivity")}
            </button>

            <button
              onClick={onAddTime}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white shadow hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              {t("console.addActivityTime")}
            </button>
          </div>

          <div className="mt-8 w-full">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <IconButton
                title={t("actions.filterTooltip")}
                className="ring-1 ring-zinc-200 dark:ring-zinc-700 active:bg-zinc-100 dark:active:bg-zinc-700"
                onClick={onOpenFilter}
              >
                <Filter className="h-5 w-5" />
              </IconButton>

              <IconButton
                title={theme === "dark" ? t("actions.switchToLight") : t("actions.switchToDark")}
                className="ring-1 ring-zinc-200 dark:ring-zinc-700 active:bg-zinc-100 dark:active:bg-zinc-700"
                onClick={onToggleTheme}
              >
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </IconButton>

              <IconButton
                title={t("actions.settings")}
                className="ring-1 ring-zinc-200 dark:ring-zinc-700 active:bg-zinc-100 dark:active:bg-zinc-700"
                onClick={onOpenSettings}
              >
                <Settings className="h-5 w-5" />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}