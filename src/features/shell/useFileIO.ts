import { useCallback } from "react";

type InfoFn = (opts: { title?: string; message: string; okLabel?: string }) => Promise<void>;
type TFn = (key: string, params?: Record<string, any>) => string;

export function useFileIO({
  getSnapshot,
  importSnapshot,
  info,
  t,
}: {
  getSnapshot: () => any;
  importSnapshot: (data: any) => boolean;
  info: InfoFn;
  t: TFn;
}) {
  const exportNow = useCallback(() => {
    const snap = getSnapshot();
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dy = String(d.getDate()).padStart(2, "0");
    const localDate = `${y}-${m}-${dy}`;

    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `klocking-${localDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getSnapshot]);

  const onImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const j = JSON.parse(String(reader.result));
          const ok = importSnapshot(j);
          if (!ok) {
            await info({ title: t("dialogs.invalidFileTitle"), message: t("dialogs.invalidFileBody") });
          }
        } catch {
          await info({ title: t("dialogs.parseErrTitle"), message: t("dialogs.parseErrBody") });
        } finally {
          // allow re-importing the same file consecutively
          e.target.value = "";
        }
      };
      reader.readAsText(f);
    },
    [importSnapshot, info, t]
  );

  return { exportNow, onImport };
}