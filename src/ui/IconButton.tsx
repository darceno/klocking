import React from "react";

export function IconButton({
  title,
  onClick,
  children,
  className = "",
}: React.PropsWithChildren<{ title?: string; onClick?: () => void; className?: string }>) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center rounded-xl p-2 transition",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-600",
        "dark:focus-visible:ring-offset-zinc-900",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}