import { useEffect, useMemo, useRef, useState } from "react";
import type {
  Activity,
  AppSettings,
  ThemeMode,
  DailyTotals,
  Running,
  VisibilityMap,
  LangCode,
} from "../types";
import {
  startOfDay,
  endOfDay,
  addDays,
  ymd,
  earliestDataStart,
  minutesElapsedForDate,
} from "../lib/date";

export const STORAGE_KEY = "klocking:v1";
export const COMMIT_KEY = "klocking:commit";

// simple id helper
function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function detectDefaultLanguage(): LangCode {
  try {
    const l = navigator.language || "";
    return l.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
  } catch {
    return "en";
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  useMMDDYYYY: false,
  showMinutes: false,
  showPercentTooltip: false,
  language: detectDefaultLanguage(),
};

export type AppState = {
  activities: Activity[];
  dailyTotals: DailyTotals;
  running: Running | null;
  lastActivityId: string | null;
  visibility: VisibilityMap;
  theme: ThemeMode;
  settings: AppSettings;
  lifeStart: number;
};

function sortDailyTotals(dt: DailyTotals, direction: "asc" | "desc" = "desc"): DailyTotals {
  const entries = Object.entries(dt).sort((a, b) =>
    direction === "asc" ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0])
  );
  const out: DailyTotals = {};
  for (const [date, map] of entries) out[date] = map;
  return out;
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function bumpCommit() {
  try {
    const prev = parseInt(localStorage.getItem(COMMIT_KEY) || "0", 10) || 0;
    localStorage.setItem(COMMIT_KEY, String(prev + 1));
  } catch {
    // ignore
  }
}

function loadState(): AppState {
  const empty: AppState = {
    activities: [],
    dailyTotals: {},
    running: null,
    lastActivityId: null,
    visibility: {},
    theme: "light",
    settings: DEFAULT_SETTINGS,
    lifeStart: earliestDataStart({}),
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);

    const dt: DailyTotals =
      typeof parsed.dailyTotals === "object" && parsed.dailyTotals ? parsed.dailyTotals : {};

    return {
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      dailyTotals: dt,
      running: parsed.running ?? null,
      lastActivityId: parsed.lastActivityId ?? null,
      visibility:
        typeof parsed.visibility === "object" && parsed.visibility ? parsed.visibility : {},
      theme: parsed.theme === "dark" ? "dark" : "light",
      settings: {
        ...DEFAULT_SETTINGS,
        ...(parsed.settings ?? {}),
      } as AppSettings,
      lifeStart:
        typeof parsed.lifeStart === "number" ? parsed.lifeStart : earliestDataStart(dt),
    };
  } catch {
    return empty;
  }
}

// commit the current running session into dailyTotals, splitting at midnights
function commitRunning(s: AppState) {
  if (!s.running) return { dailyTotals: s.dailyTotals, lastActivityId: s.lastActivityId };
  const now = Date.now();
  let cursor = s.running.start;
  const act = s.running.activityId;
  const nextTotals: DailyTotals = { ...s.dailyTotals };

  while (cursor < now) {
    const ds = startOfDay(new Date(cursor));
    const de = endOfDay(new Date(ds));
    const chunkEnd = Math.min(de, now);
    const mins = Math.floor((chunkEnd - cursor) / 60000);
    if (mins > 0) {
      const dateStr = ymd(new Date(ds));
      const day = { ...(nextTotals[dateStr] ?? {}) };
      day[act] = Math.max(0, Math.floor((day[act] ?? 0) + mins));
      nextTotals[dateStr] = day;
    }
    cursor = Math.min(now, addDays(ds, 1));
  }
  return { dailyTotals: nextTotals, lastActivityId: act };
}

// minutes of the running session that fall within the given day
function runningOverlayForDate(s: AppState, dateStr: string, now = Date.now()): number {
  if (!s.running) return 0;
  const ds = startOfDay(new Date(dateStr));
  const de = endOfDay(new Date(dateStr));
  const start = s.running.start;
  if (start >= now) return 0;
  const overlap = Math.max(0, Math.min(de, now) - Math.max(ds, start));
  return Math.floor(overlap / 60000);
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [persistencePaused, setPersistencePaused] = useState(false);
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    if (persistencePaused) return;

    try {
      saveState({ ...state, dailyTotals: sortDailyTotals(state.dailyTotals, "desc") });
      bumpCommit();
    } catch {
      // ignore
    }
  }, [state, persistencePaused]);

  const actions = useMemo(() => {
    return {
      // cross-tab helpers
      pausePersistence() {
        setPersistencePaused(true);
      },
      resumePersistence() {
        setPersistencePaused(false);
      },

      // selectors / helpers that read state
      availableUntrackedForDate(dateStr: string, now = Date.now()): number {
        const dayMap = state.dailyTotals[dateStr] ?? {};
        const overlay = runningOverlayForDate(state, dateStr, now);
        const sum =
          Object.values(dayMap).reduce((a, b) => a + Math.max(0, Math.floor(b)), 0) + overlay;
        const elapsed = minutesElapsedForDate(dateStr, now);
        return Math.max(0, elapsed - sum);
      },

      getSnapshot() {
        return {
          activities: state.activities,
          dailyTotals: sortDailyTotals(state.dailyTotals, "desc"),
          running: state.running,
          lastActivityId: state.lastActivityId,
          visibility: state.visibility,
          theme: state.theme,
          settings: state.settings,
          lifeStart: state.lifeStart,
        };
      },

      importSnapshot(j: any): boolean {
        try {
          if (!Array.isArray(j.activities) || typeof j.dailyTotals !== "object" || !j.dailyTotals)
            return false;

          const activities: Activity[] = j.activities;
          const dayTotals: DailyTotals = sortDailyTotals(j.dailyTotals ?? {}, "desc");
          const running: Running | null = j.running ?? null;

          const validLast =
            typeof j.lastActivityId === "string" &&
            activities.some((a: any) => a && a.id === j.lastActivityId && !a.archived)
              ? j.lastActivityId
              : null;

          const visibility: VisibilityMap =
            typeof j.visibility === "object" && j.visibility ? j.visibility : {};
          const theme: ThemeMode = j.theme === "dark" ? "dark" : "light";
          const settings: AppSettings = {
            useMMDDYYYY: Boolean(j.settings?.useMMDDYYYY),
            showMinutes: Boolean(j.settings?.showMinutes),
            showPercentTooltip: Boolean(j.settings?.showPercentTooltip),
            language: j.settings?.language === "pt-BR" ? "pt-BR" : "en",
          };
          const lifeStart =
            typeof j.lifeStart === "number" ? j.lifeStart : earliestDataStart(dayTotals);

          setState({
            activities,
            dailyTotals: dayTotals,
            running,
            lastActivityId: validLast,
            visibility,
            theme,
            settings,
            lifeStart,
          });
          return true;
        } catch {
          return false;
        }
      },

      // simple setters
      setVisibility(next: VisibilityMap) {
        setState((s) => ({ ...s, visibility: next }));
      },
      setSettings(next: AppSettings) {
        setState((s) => ({ ...s, settings: next }));
      },
      toggleTheme() {
        setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
      },
      setLifeStart(ts: number) {
        setState((s) => ({ ...s, lifeStart: startOfDay(new Date(ts)) }));
      },

      // activities
      createActivity(name: string, color: string) {
        const trimmed = name.trim();
        if (!trimmed) return;
        const a: Activity = { id: uid("act"), name: trimmed, color, createdAt: Date.now() };
        setState((s) => ({ ...s, activities: [...s.activities, a] }));
      },
      updateActivity(id: string, name: string, color: string) {
        const trimmed = name.trim();
        if (!trimmed) return;
        setState((s) => ({
          ...s,
          activities: s.activities.map((a) => (a.id === id ? { ...a, name: trimmed, color } : a)),
        }));
      },
      archiveActivity(id: string, archive = true) {
        setState((s) => ({
          ...s,
          activities: s.activities.map((a) => (a.id === id ? { ...a, archived: archive } : a)),
          lastActivityId: archive && s.lastActivityId === id ? null : s.lastActivityId,
          running: s.running?.activityId === id ? null : s.running,
        }));
      },
      deleteActivityAndData(id: string) {
        setState((s) => {
          const next: DailyTotals = {};
          for (const [date, map] of Object.entries(s.dailyTotals)) {
            const { [id]: _, ...rest } = map;
            next[date] = rest;
          }
          const nextVis = { ...(s.visibility || {}) };
          delete nextVis[id];

          return {
            ...s,
            activities: s.activities.filter((a) => a.id !== id),
            dailyTotals: next,
            lastActivityId: s.lastActivityId === id ? null : s.lastActivityId,
            running: s.running?.activityId === id ? null : s.running,
            visibility: nextVis,
          };
        });
      },
      reorderActivities(sourceId: string, targetId: string) {
        setState((s) => {
          const from = s.activities.findIndex((a) => a.id === sourceId);
          const to = s.activities.findIndex((a) => a.id === targetId);
          if (from === -1 || to === -1 || from === to) return s;
        const next = [...s.activities];
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { ...s, activities: next };
        });
      },

      // totals-ledger
      setDayTotal(dateStr: string, activityId: string, minutes: number) {
        setState((s) => {
          const day = { ...(s.dailyTotals[dateStr] ?? {}) };
          const v = Math.max(0, Math.floor(minutes));
          if (v <= 0) delete day[activityId];
          else day[activityId] = v;
          return { ...s, dailyTotals: { ...s.dailyTotals, [dateStr]: day } };
        });
      },
      incDayTotal(dateStr: string, activityId: string, delta: number) {
        setState((s) => {
          const day = { ...(s.dailyTotals[dateStr] ?? {}) };
          const next = Math.max(0, Math.floor((day[activityId] ?? 0) + delta));
          if (next <= 0) delete day[activityId];
          else day[activityId] = next;
          return { ...s, dailyTotals: { ...s.dailyTotals, [dateStr]: day } };
        });
      },

      addManualTime(activityId: string, minutes: number, dateStr?: string) {
        const target = dateStr ?? ymd(new Date());
        const want = Math.max(0, Math.floor(minutes));
        const avail = actions.availableUntrackedForDate(target);
        const add = Math.min(want, avail);
        if (add > 0) {
          actions.incDayTotal(target, activityId, add);
        }
        return { added: add, capped: add < want };
      },

      // running
      async stopRunning() {
        setState((s) => {
          if (!s.running) return s;
          const { dailyTotals, lastActivityId } = commitRunning(s);
          return { ...s, dailyTotals, running: null, lastActivityId };
        });
      },
      async startActivity(activityId: string) {
        setState((s) => {
          let next = s;
          if (s.running) {
            const cr = commitRunning(s);
            next = { ...s, dailyTotals: cr.dailyTotals, running: null, lastActivityId: cr.lastActivityId };
          }
          return { ...next, running: { activityId, start: Date.now() }, lastActivityId: activityId };
        });
      },

      // reset
      resetAll() {
        localStorage.removeItem(STORAGE_KEY);
        setState({
          activities: [],
          dailyTotals: {},
          running: null,
          lastActivityId: null,
          visibility: {},
          theme: "light",
          settings: DEFAULT_SETTINGS,
          lifeStart: startOfDay(new Date()),
        });
      },
    };
  }, [state]); // aaa

  return { state, actions };
}