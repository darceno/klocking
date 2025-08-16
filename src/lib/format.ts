export function formatHMS(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600).toString().padStart(2, "0");
  const m = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(total % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function formatMinutes(mins: number, asMinutes: boolean): string {
  const v = Math.max(0, Math.floor(mins));
  if (asMinutes) return `${v}min`;
  const h = Math.floor(v / 60);
  const m = v % 60;
  if (h > 0 && m > 0) return `${h}h${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function formatPercent(x: number): string {
  return `${Math.round(x * 100)}%`;
}