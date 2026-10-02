import type { AppSettings, MealEntry, MenuItem } from "../types";

const ENTRIES_KEY = "meal-tracker:entries";
const SETTINGS_KEY = "meal-tracker:settings";
const FAVORITES_KEY = "meal-tracker:favorites";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadEntries(): MealEntry[] {
  return loadJSON<MealEntry[]>(ENTRIES_KEY, []);
}

export function saveEntries(entries: MealEntry[]): void {
  saveJSON(ENTRIES_KEY, entries);
}

export function loadSettings(): AppSettings {
  return loadJSON<AppSettings>(SETTINGS_KEY, {});
}

export function saveSettings(settings: AppSettings): void {
  saveJSON(SETTINGS_KEY, settings);
}

export function loadFavorites(): MenuItem[] {
  return loadJSON<MenuItem[]>(FAVORITES_KEY, []);
}

export function saveFavorites(favorites: MenuItem[]): void {
  saveJSON(FAVORITES_KEY, favorites);
}
