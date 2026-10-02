import type { ActivityLevel, GoalDirection, UserProfile } from "../types";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENT_KCAL: Record<GoalDirection, number> = {
  maintain: 0,
  cut: -500,
  bulk: 500,
};

const MIN_CALORIE_GOAL = 1200;
const PROTEIN_G_PER_KG = 1.6;
const FAT_SHARE_OF_CALORIES = 0.25;

type CompleteProfile = Required<Pick<UserProfile, "heightCm" | "weightKg" | "age" | "sex" | "activityLevel">> &
  Pick<UserProfile, "goalDirection">;

function isComplete(profile: UserProfile): profile is CompleteProfile {
  return (
    profile.heightCm != null &&
    profile.weightKg != null &&
    profile.age != null &&
    profile.sex != null &&
    profile.activityLevel != null
  );
}

/** Mifflin-St Jeor basal metabolic rate (kcal/day). */
export function calculateBMR(profile: Pick<UserProfile, "heightCm" | "weightKg" | "age" | "sex">): number {
  const { heightCm, weightKg, age, sex } = profile;
  const base = 10 * weightKg! + 6.25 * heightCm! - 5 * age!;
  return sex === "male" ? base + 5 : base - 161;
}

/** Total daily energy expenditure: BMR scaled by activity level. */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

/** Daily calorie goal for a given direction, clamped to a safe minimum. */
export function calculateCalorieGoal(tdee: number, goalDirection: GoalDirection): number {
  return Math.max(MIN_CALORIE_GOAL, Math.round(tdee + GOAL_ADJUSTMENT_KCAL[goalDirection]));
}

/** PFC gram breakdown: protein from bodyweight, fat as a share of calories, carbs fill the remainder. */
export function calculatePFCFromCalories(
  calorieGoal: number,
  weightKg: number,
): { protein: number; fat: number; carbs: number } {
  const protein = Math.round(weightKg * PROTEIN_G_PER_KG);
  const fatKcal = calorieGoal * FAT_SHARE_OF_CALORIES;
  const fat = Math.round(fatKcal / 9);
  const carbsKcal = Math.max(0, calorieGoal - protein * 4 - fatKcal);
  const carbs = Math.round(carbsKcal / 4);
  return { protein, fat, carbs };
}

export interface CalculatedGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

/** Full pipeline: profile -> BMR -> TDEE -> calorie goal -> PFC. Null if the profile is incomplete. */
export function calculateGoalsFromProfile(profile: UserProfile): CalculatedGoals | null {
  if (!isComplete(profile)) return null;
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const calories = calculateCalorieGoal(tdee, profile.goalDirection ?? "maintain");
  const { protein, fat, carbs } = calculatePFCFromCalories(calories, profile.weightKg);
  return { calories, protein, fat, carbs };
}
