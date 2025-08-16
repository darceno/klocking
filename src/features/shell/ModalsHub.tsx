import { useState } from "react";
import { Modal } from "../../ui/Modal";

import AddActivityForm from "../activities/AddActivityForm";
import EditActivityForm from "../activities/EditActivityForm";
import ManageActivitiesList from "../activities/ManageActivitiesList";

import AddTimeForm from "../time/AddTimeForm";
import EditTotalForm from "../time/EditTotalForm";
import AddFromUntrackedForm from "../time/AddFromUntrackedForm";

import FilterActivitiesForm from "../filters/FilterActivitiesForm";
import SettingsForm from "../settings/SettingsForm";
import LifeStartForm from "../life/LifeStartForm";

import type {
  Activity,
  AppSettings,
  DailyTotals,
  Running,
  VisibilityMap,
} from "../../types";
import { ymd } from "../../lib/date";

type InfoFn = (opts: { title?: string; message: string; okLabel?: string }) => Promise<void>;

type ModalsHubProps = {
  // i18n + helpers
  t: (key: string, opts?: any) => string;
  info: InfoFn;

  // data
  activities: Activity[];
  dailyTotals: DailyTotals;
  running: Running | null;
  anchor: number;
  settings: AppSettings;
  visibility: VisibilityMap;

  // derived helpers
  overlayForDate: (dateStr: string) => number;
  getUnallocatedForDate: (dateStr: string) => number;

  // actions
  onCreateActivity: (name: string, color: string) => void;
  onAddManualTime: (id: string, mins: number) => void;
  onEditActivityTotalForRange: (id: string, mins: number) => void;
  onArchiveToggle: (id: string, archive: boolean) => void;
  onDeleteActivity: (id: string) => void;
  onReorder: (src: string, dst: string) => void;
  onUpdateActivity: (id: string, name: string, color: string) => void;
  onSaveVisibility: (next: VisibilityMap) => void;
  onSaveSettings: (next: AppSettings) => void;
  onSubmitLifeValid: (ts: number) => void;

  // UI state (open/close)
  addActivityOpen: boolean;
  onCloseAddActivity: () => void;

  addTimeOpen: boolean;
  onCloseAddTime: () => void;

  editOpen: boolean;
  onCloseEdit: () => void;
  editTarget: { id: string; name: string } | null;

  addUntrackedOpen: boolean;
  onCloseAddUntracked: () => void;

  lifeOpen: boolean;
  onCloseLife: () => void;
  lifeInput: string;
  onChangeLifeInput: (s: string) => void;

  manageActivitiesOpen: boolean;
  onCloseManageActivities: () => void;

  filterOpen: boolean;
  onCloseFilter: () => void;

  settingsOpen: boolean;
  onCloseSettings: () => void;
};

export default function ModalsHub(props: ModalsHubProps) {
  const {
    t, info,
    activities, dailyTotals, running, anchor, settings, visibility,
    overlayForDate, getUnallocatedForDate,
    onCreateActivity, onAddManualTime, onEditActivityTotalForRange,
    onArchiveToggle, onDeleteActivity, onReorder, onUpdateActivity,
    onSaveVisibility, onSaveSettings, onSubmitLifeValid,

    addActivityOpen, onCloseAddActivity,
    addTimeOpen, onCloseAddTime,
    editOpen, onCloseEdit, editTarget,
    addUntrackedOpen, onCloseAddUntracked,
    lifeOpen, onCloseLife, lifeInput, onChangeLifeInput,
    manageActivitiesOpen, onCloseManageActivities,
    filterOpen, onCloseFilter,
    settingsOpen, onCloseSettings,
  } = props;

  const [editActivityOpen, setEditActivityOpen] = useState<Activity | null>(null);

  const anchorStr = ymd(new Date(anchor));
  const activeActivities = activities.filter((a) => !a.archived);

  const getCurrentMinutesFor = (activityId: string) => {
    const persisted = dailyTotals[anchorStr]?.[activityId] ?? 0;
    const overlay =
      running && running.activityId === activityId ? overlayForDate(anchorStr) : 0;
    return persisted + overlay;
  };

  return (
    <>
      {/* add Activity */}
      <Modal open={addActivityOpen} onClose={onCloseAddActivity} title={t("addActivity.title")}>
        <AddActivityForm
          onCreate={(name, color) => {
            onCreateActivity(name, color);
            onCloseAddActivity();
          }}
        />
      </Modal>

      {/* add time to today */}
      <Modal open={addTimeOpen} onClose={onCloseAddTime} title={t("addTime.title")}>
        <AddTimeForm
          activities={activeActivities}
          unallocated={getUnallocatedForDate(ymd(new Date()))}
          showMinutes={settings.showMinutes}
          onConfirm={(id, mins) => {
            onAddManualTime(id, mins);
            onCloseAddTime();
          }}
        />
      </Modal>

      {/* edit total for day */}
      <Modal
        open={editOpen}
        onClose={onCloseEdit}
        title={t("editTotal.title", { name: editTarget?.name ?? "" })}
      >
        {editTarget && (
          <EditTotalForm
            activity={activities.find((a) => a.id === editTarget.id)!}
            currentMinutes={getCurrentMinutesFor(editTarget.id)}
            unallocated={getUnallocatedForDate(anchorStr)}
            showMinutes={settings.showMinutes}
            onConfirm={(mins) => {
              onEditActivityTotalForRange(editTarget.id, mins);
              onCloseEdit();
            }}
          />
        )}
      </Modal>

      {/* add from past */}
      <Modal open={addUntrackedOpen} onClose={onCloseAddUntracked} title={t("fromUntracked.title")}>
        <AddFromUntrackedForm
          activities={activeActivities}
          getCurrentMinutes={(id) => getCurrentMinutesFor(id)}
          unallocated={getUnallocatedForDate(anchorStr)}
          showMinutes={settings.showMinutes}
          onConfirm={(id, mins) => {
            onEditActivityTotalForRange(id, mins);
            onCloseAddUntracked();
          }}
        />
      </Modal>

      {/* life start picker */}
      <Modal open={lifeOpen} onClose={onCloseLife} title={t("life.title")}>
        <LifeStartForm
          useMMDDYYYY={settings.useMMDDYYYY}
          value={lifeInput}
          onChange={onChangeLifeInput}
          info={info}
          onSubmitValid={(ts) => {
            onSubmitLifeValid(ts);
            onCloseLife();
          }}
        />
      </Modal>

      {/* manage activities */}
      <Modal open={manageActivitiesOpen} onClose={onCloseManageActivities} title={t("manage.title")}>
        <ManageActivitiesList
          activities={activities}
          onEdit={(a) => setEditActivityOpen(a)}
          onArchiveToggle={onArchiveToggle}
          onDelete={onDeleteActivity}
          onReorder={onReorder}
        />
      </Modal>

      {/* edit activity (from manage list) */}
      <Modal open={!!editActivityOpen} onClose={() => setEditActivityOpen(null)} title={t("editActivity.title", { defaultValue: "Edit activity" })}>
        {editActivityOpen && (
          <EditActivityForm
            initial={editActivityOpen}
            onSave={(name, color) => {
              onUpdateActivity(editActivityOpen.id, name, color);
              setEditActivityOpen(null);
            }}
          />
        )}
      </Modal>

      {/* filter */}
      <Modal open={filterOpen} onClose={onCloseFilter} title={t("filter.title", { defaultValue: "Filter items in chart" })}>
        <FilterActivitiesForm
          activities={activities}
          visibility={visibility}
          onCancel={onCloseFilter}
          onSave={(next) => {
            onSaveVisibility(next);
            onCloseFilter();
          }}
        />
      </Modal>

      {/* settings */}
      <Modal open={settingsOpen} onClose={onCloseSettings} title={t("settings.title")}>
        <SettingsForm
          initial={settings}
          onCancel={onCloseSettings}
          onSave={(next) => {
            onSaveSettings(next);
            onCloseSettings();
          }}
        />
      </Modal>
    </>
  );
}