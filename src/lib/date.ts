export const DAY_MS = 24 * 60 * 60 * 1000;

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}
export function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.getTime();
}
export function addDays(ts: number, days: number) {
  return ts + days * DAY_MS;
}

export function monthBounds(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return [start.getTime(), end.getTime()] as const;
}
export function yearBounds(d: Date) {
  const start = new Date(d.getFullYear(), 0, 1);
  const end = new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
  return [start.getTime(), end.getTime()] as const;
}

export function rangeLabelWidth(kind: "day" | "week" | "month" | "year" | "life"): number {
  if (kind === "week") return 180;
  if (kind === "month") return 130;
  if (kind === "year") return 50;
  if (kind === "life") return 142;
  return 100;
}

export function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// week things, sunday=0)
export function startOfWeekSunday(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  return x.getTime();
}
export function endOfWeekSunday(d: Date) {
  const s = startOfWeekSunday(d);
  return endOfDay(new Date(addDays(s, 6)));
}

export const startOfWeekSun  = startOfWeekSunday;
export const endOfWeekSun    = endOfWeekSunday;

export function enumerateDays(s: number, e: number) {
  const out: string[] = [];
  let cur = startOfDay(new Date(s));
  const end = startOfDay(new Date(e));
  while (cur <= end) {
    out.push(ymd(new Date(cur)));
    cur = addDays(cur, 1);
  }
  return out;
}

export function minutesElapsedForDate(dateStr: string, now: number) {
  const todayStr = ymd(new Date());
  if (dateStr < todayStr) return 1440;
  if (dateStr > todayStr) return 0;
  const start = startOfDay(new Date(now));
  return Math.max(0, Math.floor((now - start) / 60000));
}

export function formatDateShort(ts: number, useMMDDYYYY: boolean) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return useMMDDYYYY ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`;
}

export function maskDateInput(raw: string, useMMDDYYYY: boolean) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (useMMDDYYYY) {
    const mm = digits.slice(0, 2);
    const dd = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    if (digits.length <= 2) return mm;
    if (digits.length <= 4) return `${mm}/${dd}`;
    return `${mm}/${dd}/${yyyy}`;
  } else {
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);
    if (digits.length <= 2) return dd;
    if (digits.length <= 4) return `${dd}/${mm}`;
    return `${dd}/${mm}/${yyyy}`;
  }
}

export function parseDateInput(s: string, useMMDDYYYY: boolean): number | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  let dd: number, mm: number, yyyy: number;
  if (useMMDDYYYY) {
    mm = parseInt(m[1], 10);
    dd = parseInt(m[2], 10);
  } else {
    dd = parseInt(m[1], 10);
    mm = parseInt(m[2], 10);
  }
  yyyy = parseInt(m[3], 10);
  if (mm < 1 || mm > 12) return null;
  const d = new Date(yyyy, mm - 1, dd);
  if (isNaN(d.getTime())) return null;
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null;
  return startOfDay(d);
}

// by default Life starts based on the earliest date avaliable, else today
export function earliestDataStart(dt: Record<string, any>) {
  const keys = Object.keys(dt);
  if (keys.length === 0) return startOfDay(new Date());
  const min = keys.reduce((a, b) => (a < b ? a : b), keys[0]);
  return startOfDay(new Date(min));
}

// 6×7 = 42 (<3) day grid
export function daysGridForMonth(viewDate: Date) {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const firstDow = first.getDay(); // Sun=0
  const gridStart = new Date(first.getTime() - firstDow * DAY_MS);
  gridStart.setHours(0, 0, 0, 0);

  const cells: number[] = [];
  for (let i = 0; i < 42; i++) cells.push(gridStart.getTime() + i * DAY_MS);
  return cells;
}