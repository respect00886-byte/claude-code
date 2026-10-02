import type { MealEntry } from "../types";

type NutrientKey = "calories" | "protein" | "fat" | "carbs";

function sumBy(entries: MealEntry[], key: NutrientKey): number {
  return entries.reduce((sum, e) => sum + (e[key] ?? 0), 0);
}

export function sumCalories(entries: MealEntry[]): number {
  return sumBy(entries, "calories");
}

export function sumProtein(entries: MealEntry[]): number {
  return sumBy(entries, "protein");
}

export function sumFat(entries: MealEntry[]): number {
  return sumBy(entries, "fat");
}

export function sumCarbs(entries: MealEntry[]): number {
  return sumBy(entries, "carbs");
}

/** Remaining budget vs. a goal; null when no goal is set (nothing to show). */
export function remaining(total: number, goal?: number): number | null {
  if (goal == null) return null;
  return goal - total;
}
