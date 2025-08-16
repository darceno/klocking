import React from "react";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm tracking-wide text-zinc-500 dark:text-zinc-400">{children}</div>;
}