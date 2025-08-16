import { useEffect, useState } from "react";
import "./i18n";
import { useTranslation } from "react-i18next";

import { formatMinutes } from "./lib/format";
import { startOfDay, formatDateShort } from "./lib/date";
import { Card } from "./ui/Card";

import ChartPanel from "./features/chart/ChartPanel";
import { useTotals } from "./features/chart/useTotals";

import ActivitiesRow from "./features/activities/ActivitiesRow";
import ModalsHub from "./features/shell/ModalsHub";
import ConsolePanel from "./features/console/ConsolePanel";
import AppHeader from "./features/shell/AppHeader";
import { useFileIO } from "./features/shell/useFileIO";

import { useToasts } from "./hooks/useToasts";
import { useDialog } from "./hooks/useDialog";
import { useThemeClass } from "./hooks/useThemeClass";
import GlobalDialog from "./features/dialogs/GlobalDialog";
import ToastRack from "./features/toasts/ToastRack";

import { useAppStore } from "./state/store";
import { useDayEditing } from "./hooks/useDayEditing";
import { useRange } from "./features/range/useRange";

import { Link } from "react-router-dom";
import { Github, CircleQuestionMark, HandCoins } from "lucide-react";

import HardStopOverlay from "./features/shell/HardStopOverlay";
import { COMMIT_KEY } from "./state/store";

export default function App() {
  const { toasts, push } = useToasts();
  const { dialog, info, confirm, close } = useDialog();

  const { state, actions } = useAppStore();
  const {
    activities,
    dailyTotals,
    running,
    lastActivityId,
    theme,
    visibility,
    settings,
    lifeStart,
  } = state;

  // UI-only state
  const [rangeKind, setRangeKind] =
    useState<"day" | "week" | "month" | "year" | "life">("day");
  const [anchor, setAnchor] = useState<number>(() => startOfDay(new Date()));
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [addTimeOpen, setAddTimeOpen] = useState(false);
  const [manageActivitiesOpen, setManageActivitiesOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // hard-stop flag
  const [needsReload, setNeedsReload] = useState(false);

  const { t, i18n } = useTranslation();
  useEffect(() => {
    i18n.changeLanguage(settings.language);
  }, [settings.language, i18n]);

  // File IO
  const { exportNow, onImport } = useFileIO({
    getSnapshot: actions.getSnapshot,
    importSnapshot: actions.importSnapshot,
    info,
    t,
  });

  // wire cross-tab detection
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== COMMIT_KEY) return;
      if (needsReload) return;
      actions.pausePersistence();
      setNeedsReload(true);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [needsReload]);

  // life picker input mirrors store value
  const [lifeOpen, setLifeOpen] = useState(false);
  const [lifeInput, setLifeInput] = useState<string>(
    formatDateShort(lifeStart, settings.useMMDDYYYY)
  );
  useEffect(() => {
    setLifeInput(formatDateShort(lifeStart, settings.useMMDDYYYY));
  }, [lifeStart, settings.useMMDDYYYY]);

  useThemeClass(theme);

  const runningActivity = running
    ? activities.find((a) => a.id === running.activityId) || null
    : null;

  const { rangeStart, rangeEnd, label } = useRange({
    rangeKind,
    anchor,
    lifeStart,
    useMMDDYYYY: settings.useMMDDYYYY,
    language: i18n.language,
    t,
  });

  const { overlayForDate, totals, chartData, chartTotal } = useTotals({
    activities,
    dailyTotals,
    running,
    rangeStart,
    rangeEnd,
    visibility,
    theme,
    t,
  });

  const dayEdit = useDayEditing({
    actions: {
      setDayTotal: actions.setDayTotal,
      availableUntrackedForDate: actions.availableUntrackedForDate,
    },
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
    openAddActivity: () => setAddActivityOpen(true),
  });

  async function pauseOrResume() {
    if (running) {
      await actions.stopRunning();
      return;
    }
    const actId = lastActivityId;
    const existsAndActive =
      !!actId && activities.some((a) => a.id === actId && !a.archived);
    if (!existsAndActive) {
      await info({ title: t("dialogs.noLastTitle"), message: t("dialogs.noLastBody") });
      return;
    }
    await actions.startActivity(actId!);
  }

  function addManualTime(activityId: string, minutes: number) {
    const { added, capped } = actions.addManualTime(activityId, minutes);
    if (capped && added > 0) {
      push(t("toast.cappedPast", { amount: formatMinutes(added, settings.showMinutes) }));
    }
  }

  async function resetAll() {
    const ok = await confirm({
      title: t("dialogs.resetAllTitle"),
      message: t("dialogs.resetAllBody"),
      okLabel: t("dialogs.resetBtn"),
      cancelLabel: t("dialogs.cancel"),
      danger: true,
    });
    if (!ok) return;
    actions.resetAll();
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-zinc-50 to-white text-zinc-800 dark:from-zinc-900 dark:to-zinc-950 dark:text-zinc-100">
      {/* Hard-stop overlay */}
      {needsReload && (
        <HardStopOverlay
          title={t("oneTab.blockTitle")}
          body={t("oneTab.blockBody")}
          reloadLabel={t("oneTab.reload")}
          onReload={() => {
            location.reload();
          }}
        />
      )}

      <AppHeader
        tagline={t("app.tagline")}
        onExport={exportNow}
        onImport={onImport}
        onResetAll={resetAll}
      />

      {/* Activities Row */}
      <div className="mx-auto max-w-6xl px-4">
        <Card className="p-4 relative">
          <ActivitiesRow
            activities={activities}
            runningActivityId={running?.activityId ?? null}
            onStartActivity={(id) => actions.startActivity(id)}
            onOpenAddActivity={() => setAddActivityOpen(true)}
            onOpenManage={() => setManageActivitiesOpen(true)}
            manageTooltip={t("actions.manageActivities")}
          />
        </Card>
      </div>

      {/* Main Grid */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-10">
        {/* Console */}
        <Card className="p-6 md:col-span-4">
          <ConsolePanel
            isRunning={!!running}
            runningStart={running?.start ?? null}
            runningActivityName={runningActivity?.name ?? null}
            runningActivityColor={runningActivity?.color ?? null}
            theme={theme}
            onPauseOrResume={pauseOrResume}
            onAddTime={async () => {
              if (activities.filter((a) => !a.archived).length === 0) {
                await info({ title: "No activities", message: "Add an activity first." });
                setAddActivityOpen(true);
                return;
              }
              setAddTimeOpen(true);
            }}
            onToggleTheme={() => actions.toggleTheme()}
            onOpenFilter={() => setFilterOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </Card>

        {/* Pie Chart + Range */}
        <Card className="p-5 md:col-span-6">
          <ChartPanel
            rangeKind={rangeKind}
            anchor={anchor}
            label={label}
            onChangeKind={(k) => setRangeKind(k)}
            onChangeAnchor={(ts) => setAnchor(ts)}
            onOpenLife={() => setLifeOpen(true)}
            data={chartData}
            chartTotal={chartTotal}
            showMinutes={settings.showMinutes}
            showPercentTooltip={settings.showPercentTooltip}
            onSliceClick={dayEdit.handleSliceClick}
            trackedPastMin={totals.trackedPastMin}
            totalWindowMin={totals.totalWindowMin}
            trackedLabel={t("chart.totalTracked")}
            totalLabel={t("chart.totalTime")}
          />
        </Card>
      </div>

      <ModalsHub
        t={t}
        info={info}
        activities={activities}
        dailyTotals={dailyTotals}
        running={running}
        anchor={anchor}
        settings={settings}
        visibility={visibility}
        overlayForDate={(dateStr) => (running ? overlayForDate(dateStr) : 0)}
        getUnallocatedForDate={(dateStr) => actions.availableUntrackedForDate(dateStr)}
        onCreateActivity={(name, color) => actions.createActivity(name, color)}
        onAddManualTime={(id, mins) => addManualTime(id, mins)}
        onEditActivityTotalForRange={(id, mins) => dayEdit.editActivityTotalForRange(id, mins)}
        onArchiveToggle={(id, archive) => actions.archiveActivity(id, archive)}
        onDeleteActivity={async (id) => {
          const ok = await confirm({
            title: t("dialogs.deleteActTitle"),
            message: t("dialogs.deleteActBody"),
            okLabel: t("dialogs.deleteBtn"),
            cancelLabel: t("dialogs.cancel"),
            danger: true,
          });
          if (!ok) return;
          actions.deleteActivityAndData(id);
        }}
        onReorder={(src, dst) => actions.reorderActivities(src, dst)}
        onUpdateActivity={(id, name, color) => actions.updateActivity(id, name, color)}
        onSaveVisibility={(next) => actions.setVisibility(next)}
        onSaveSettings={(next) => actions.setSettings(next)}
        onSubmitLifeValid={(ts) => actions.setLifeStart(ts)}
        addActivityOpen={addActivityOpen}
        onCloseAddActivity={() => setAddActivityOpen(false)}
        addTimeOpen={addTimeOpen}
        onCloseAddTime={() => setAddTimeOpen(false)}
        editOpen={dayEdit.editOpen}
        onCloseEdit={dayEdit.closeEdit}
        editTarget={dayEdit.editTarget}
        addUntrackedOpen={dayEdit.addUntrackedOpen}
        onCloseAddUntracked={dayEdit.closeAddUntracked}
        lifeOpen={lifeOpen}
        onCloseLife={() => setLifeOpen(false)}
        lifeInput={lifeInput}
        onChangeLifeInput={setLifeInput}
        manageActivitiesOpen={manageActivitiesOpen}
        onCloseManageActivities={() => setManageActivitiesOpen(false)}
        filterOpen={filterOpen}
        onCloseFilter={() => setFilterOpen(false)}
        settingsOpen={settingsOpen}
        onCloseSettings={() => setSettingsOpen(false)}
      />

      <GlobalDialog dialog={dialog} onClose={close} />
      <ToastRack toasts={toasts} />

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-2 text-center text-xs text-zinc-400">
        <div>{t("footer.backups")}</div>

        <nav className="mt-2 flex items-center justify-center gap-5 text-[11px]">
          <a
            href="https://ko-fi.com/darceno"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="Support"
          >
            <HandCoins className="h-3.5 w-3.5" />
            <span>{t("footer.support")}</span>
          </a>
          <a
            href="https://github.com/your/repo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="GitHub"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>
          <Link
            to="/about"
            className="inline-flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="About"
          >
            <CircleQuestionMark className="h-3.5 w-3.5" />
            <span>{t("footer.about")}</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
}