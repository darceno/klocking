import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical, Download, Upload, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IconButton } from "../../ui/IconButton";

type Props = {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void; // reuse your current handler
  onResetAll: () => void;
};

export default function HeaderMenu({ onExport, onImport, onResetAll }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative z-40"
    >
      <IconButton title={t("menu.menu")}>
        <MoreVertical className="h-5 w-5" />
      </IconButton>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute right-0 z-50 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700"
          >
            <button
              onClick={onExport}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <Download className="h-4 w-4" />
              {t("menu.export")}
            </button>

            <label className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <Upload className="h-4 w-4" />
              {t("menu.import")}
              <input type="file" accept="application/json" className="hidden" onChange={onImport} />
            </label>

            <div className="my-2 h-px bg-zinc-100" />

            <button
              onClick={onResetAll}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              {t("menu.resetAll")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}