import type React from "react";

type ConfirmOpts = {
  title?: string;
  message: string;
  okLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type InfoOpts = {
  title?: string;
  message: string;
};

type UseDataIODeps = {
  actions: {
    getSnapshot: () => any;
    importSnapshot: (data: any) => boolean;
    resetAll: () => void;
  };
  t: (key: string, vars?: Record<string, any>) => string;
  info: (opts: InfoOpts) => Promise<void>;
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
};

export function useDataIO({ actions, t, info, confirm }: UseDataIODeps) {
  function exportData() {
    const snap = actions.getSnapshot();
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const localDate = `${y}-${m}-${day}`;

    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `klocking-${localDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const j = JSON.parse(String(reader.result));
        const ok = actions.importSnapshot(j);
        if (!ok) {
          await info({ title: t("dialogs.invalidFileTitle"), message: t("dialogs.invalidFileBody") });
        }
      } catch {
        await info({ title: t("dialogs.parseErrTitle"), message: t("dialogs.parseErrBody") });
      }
    };
    reader.readAsText(f);
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

  return { exportData, onImport, resetAll };
}