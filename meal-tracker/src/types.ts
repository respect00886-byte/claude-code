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

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type GoalDirection = "maintain" | "cut" | "bulk";

/** Inputs for auto-calculating daily calorie/PFC goals (BMR/TDEE based). */
export interface UserProfile {
  heightCm?: number;
  weightKg?: number;
  age?: number;
  sex?: Sex;
  activityLevel?: ActivityLevel;
  goalDirection?: GoalDirection;
}

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: "座りがち(ほぼ運動なし)",
  light: "軽い運動(週1-3日)",
  moderate: "普通の運動(週3-5日)",
  active: "活発(週6-7日)",
  very_active: "非常に活発(激しい運動・肉体労働)",
};

export const GOAL_DIRECTION_LABELS: Record<GoalDirection, string> = {
  maintain: "維持",
  cut: "減量",
  bulk: "増量",
};

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
