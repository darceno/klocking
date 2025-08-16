import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white/90 shadow-lg ring-1 ring-zinc-200 dark:bg-zinc-900/80 dark:ring-zinc-700 ${className}`}>
      {children}
    </div>
  );
}