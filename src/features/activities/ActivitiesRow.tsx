import type { Activity } from "../../types";
import { PillButton } from "../../ui/PillButton";
import { IconButton } from "../../ui/IconButton";
import { Plus, Pencil } from "lucide-react";

type ActivitiesRowProps = {
  activities: Activity[];
  runningActivityId: string | null;
  onStartActivity: (id: string) => void;
  onOpenAddActivity: () => void;
  onOpenManage: () => void;
  manageTooltip: string;
};

export default function ActivitiesRow({
  activities,
  runningActivityId,
  onStartActivity,
  onOpenAddActivity,
  onOpenManage,
  manageTooltip,
}: ActivitiesRowProps) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 pr-10">
        {activities
          .filter((a) => !a.archived)
          .map((a) => (
            <PillButton
              key={a.id}
              color={a.color}
              active={runningActivityId === a.id}
              onClick={() => onStartActivity(a.id)}
            >
              {a.name}
            </PillButton>
          ))}

        <button
          onClick={onOpenAddActivity}
          className="inline-flex items-center gap-2 rounded-full
            bg-zinc-900 text-white hover:brightness-110
            dark:bg-zinc-300 dark:text-black
            px-4 py-2 text-sm font-medium shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <IconButton
        title={manageTooltip}
        onClick={onOpenManage}
        className="absolute right-3 top-3 z-10 ring-1 ring-zinc-200 dark:ring-zinc-700 active:bg-zinc-100 dark:active:bg-zinc-700"
      >
        <Pencil className="h-4 w-4" />
      </IconButton>
    </div>
  );
}