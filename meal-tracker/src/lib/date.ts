import type { MealEntry, MealType } from "../types";

/** Local YYYY-MM-DD for a given Date (avoids toISOString's UTC shift). */
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return formatDate(new Date());
}

/** Guess a meal type from the current time of day, for one-tap quick-add. */
export function suggestMealType(now: Date = new Date()): MealType {
  const hour = now.getHours();
  if (hour < 10) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 21) return "dinner";
  return "snack";
}

/** Groups entries by date, sorted most-recent date first; entries within a day keep createdAt order. */
export function groupByDate(entries: MealEntry[]): Map<string, MealEntry[]> {
  const groups = new Map<string, MealEntry[]>();
  for (const entry of entries) {
    const group = groups.get(entry.date);
    if (group) {
      group.push(entry);
    } else {
      groups.set(entry.date, [entry]);
    }
  }
  const sortedDates = [...groups.keys()].sort((a, b) => b.localeCompare(a));
  const sorted = new Map<string, MealEntry[]>();
  for (const date of sortedDates) {
    const group = groups.get(date)!;
    group.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    sorted.set(date, group);
  }
  return sorted;
}
