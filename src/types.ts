export type Activity = {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  archived?: boolean;
};

export type ChartRow = {
  id: string;
  name: string;
  value: number;
  color: string;
  isUntracked?: boolean;
  isFuture?: boolean;
};

export type LangCode = "en" | "pt-BR";

export type AppSettings = {
  useMMDDYYYY: boolean;
  showMinutes: boolean;
  showPercentTooltip: boolean;
  language: LangCode;
};

export type ThemeMode = "light" | "dark";
export type DailyTotals = Record<string /* YYYY-MM-DD */, Record<string /* activityId */, number /* minutes */>>;
export type Running = { activityId: string; start: number };
export type VisibilityMap = Record<string /* id or __untracked__/__future__ */, boolean>;