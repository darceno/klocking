import { useState } from "react";

export type Toast = { id: string; msg: string };

function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function push(msg: string) {
    const id = uid("toast");
    setToasts((t) => [...t, { id, msg }]);
    // auto-dismiss
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 2500);
  }

  return { toasts, push };
}