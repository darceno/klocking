import { useEffect, useRef } from "react";

// this is a happy mistake

type Props = {
  title: string;
  body: string;
  reloadLabel: string;
  onReload: () => void;
};

export default function HardStopOverlay({
  title,
  body,
  reloadLabel,
  onReload,
}: Props) {
  const firstBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    firstBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true } as any);
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl outline-none dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm opacity-80">{body}</p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onReload}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-500 active:bg-indigo-700"
          >
            {reloadLabel}
          </button>
        </div>
      </div>
    </div>
  );
}