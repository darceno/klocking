import React from "react";

export function PillButton({
  active,
  color,
  children,
  onClick,
}: {
  active?: boolean;
  color?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-all",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-300 dark:focus:ring-zinc-600 dark:focus:ring-offset-zinc-900",
        active
          ? "text-white ring-1 ring-zinc-300 dark:ring-zinc-600"
          : "ring-1 ring-zinc-300 bg-white/90 text-zinc-800 hover:bg-white dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:ring-zinc-700",
      ].join(" ")}
      style={active ? { background: color ?? "#334155", color: "#fff" } : {}}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: color ?? "#94a3b8" }} />
      <span>{children}</span>
    </button>
  );
}