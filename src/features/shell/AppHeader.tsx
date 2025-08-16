import React from "react";
import { Clock } from "lucide-react";
import HeaderMenu from "./HeaderMenu";

type Props = {
  title?: string;
  tagline: string;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetAll: () => Promise<void> | void;
};

export default function AppHeader({
  title = "Klocking",
  tagline,
  onExport,
  onImport,
  onResetAll,
}: Props) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white shadow">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-xs text-zinc-500">{tagline}</p>
        </div>
      </div>
      <HeaderMenu onExport={onExport} onImport={onImport} onResetAll={onResetAll} />
    </header>
  );
}