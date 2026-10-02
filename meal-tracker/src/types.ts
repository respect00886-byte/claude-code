export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealEntry {
  id: string;
  date: string; // "YYYY-MM-DD" local date
  mealType: MealType;
  name: string;
  calories?: number;
  protein?: number; // g
  fat?: number; // g
  carbs?: number; // g
  createdAt: string; // ISO timestamp, for stable sort within a day
}

export interface AppSettings {
  dailyCalorieGoal?: number;
  dailyProteinGoal?: number;
  dailyFatGoal?: number;
  dailyCarbsGoal?: number;
}

/** A reusable meal template: bundled convenience-store/chain items, or user-saved favorites. */
export interface MenuItem {
  id: string;
  name: string;
  brand?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "間食",
};
