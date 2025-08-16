import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GripVertical, Pencil, Archive } from "lucide-react";
import type { Activity } from "../../types";

type Props = {
  activities: Activity[];
  onEdit: (a: Activity) => void;
  onArchiveToggle: (id: string, archive: boolean) => void;
  onDelete: (id: string) => void;
  onReorder: (sourceId: string, targetId: string) => void;
};

export default function ManageActivitiesList({
  activities,
  onEdit,
  onArchiveToggle,
  onDelete,
  onReorder,
}: Props) {
  const { t } = useTranslation();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {activities.length === 0 && (
        <div className="text-sm text-zinc-500">{t("manage.empty")}</div>
      )}

      {activities.map((a) => {
        const isDragTarget = dragOverId === a.id && dragId !== a.id;
        return (
          <div
            key={a.id}
            className={[
              "flex items-start rounded-xl px-3 py-2 transition",
              isDragTarget
                ? "bg-indigo-50 ring-2 ring-indigo-200 dark:bg-indigo-900/30 dark:ring-indigo-700"
                : "hover:bg-zinc-50 dark:hover:bg-zinc-800",
            ].join(" ")}
            onDragEnter={(e) => {
              e.preventDefault();
              if (dragId && dragId !== a.id) setDragOverId(a.id);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragOverId(null)}
            onDrop={(e) => {
              e.preventDefault();
              const src = e.dataTransfer.getData("text/plain") || dragId || "";
              if (src) onReorder(src, a.id);
              setDragId(null);
              setDragOverId(null);
            }}
          >
            <div className="flex flex-1 min-w-0 items-center gap-2">
              {/* drag handle */}
              <button
                className="cursor-grab active:cursor-grabbing rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
                title={t("actions.dragToReorder")}
                draggable
                onDragStart={(e) => {
                  setDragId(a.id);
                  e.dataTransfer.effectAllowed = "move";
                  e.dataTransfer.setData("text/plain", a.id);
                }}
                onDragEnd={() => { setDragId(null); setDragOverId(null); }}
              >
                <GripVertical className="h-4 w-4 text-zinc-400" />
              </button>

              <span className="h-3 w-3 rounded-sm shrink-0 mt-[1px]" style={{ background: a.color }} />
              <span
                className={`text-sm leading-5 break-words min-w-0 ${a.archived ? "line-through text-zinc-400" : ""}`}
                title={a.name}
              >
                {a.name}
              </span>
            </div>

            <div className="ml-auto shrink-0 whitespace-nowrap flex items-center gap-1">
              <button
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50
             dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-600"
                onClick={() => onEdit(a)}
              >
                <Pencil className="h-3 w-3" /> {t("manage.edit")}
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50
             dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-600"
                onClick={() => onArchiveToggle(a.id, !a.archived)}
              >
                <Archive className="h-3 w-3" />
                {a.archived ? t("manage.unarchive") : t("manage.archive")}
              </button>
              <button
                className="rounded-lg px-2 py-1 text-xs text-red-600 ring-1 ring-red-200 hover:bg-red-50
             dark:text-red-400 dark:ring-red-700 dark:hover:bg-red-950/30"
                onClick={() => onDelete(a.id)}
              >
                {t("manage.delete")}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}